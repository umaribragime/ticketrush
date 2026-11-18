package com.devui.ticketrush.order.stock;

import com.devui.ticketrush.common.exception.BusinessException;
import com.devui.ticketrush.common.exception.ErrorCode;
import com.devui.ticketrush.event.TicketType;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.concurrent.ThreadLocalRandom;

/**
 * Takes tickets out of stock safely — the heart of v2.
 * Always called INSIDE the order transaction, so if anything later fails, the stock change is rolled back too.
 */
@Slf4j
@Service
public class StockService {

    /** How often the optimistic strategy retries before telling the buyer to try again. */
    static final int MAX_OPTIMISTIC_ATTEMPTS = 30;

    private final StockRepository stockRepository;
    private final EntityManager entityManager;
    private final StockStrategy strategy;

    public StockService(StockRepository stockRepository, EntityManager entityManager,
                        @Value("${app.order.stock-strategy:ATOMIC}") StockStrategy strategy) {
        this.stockRepository = stockRepository;
        this.entityManager = entityManager;
        this.strategy = strategy;
        log.info("Ticket stock strategy: {}", strategy);
    }

    public StockStrategy strategy() {
        return strategy;
    }

    @Transactional(propagation = Propagation.MANDATORY) // must join the caller's order transaction
    public void reserve(TicketType type, int quantity) {
        switch (strategy) {
            case NAIVE -> type.sell(quantity);
            case PESSIMISTIC -> reservePessimistic(type, quantity);
            case OPTIMISTIC -> reserveOptimistic(type, quantity);
            case ATOMIC -> reserveAtomic(type, quantity);
        }
    }

    /**
     * refresh(..., PESSIMISTIC_WRITE) = "SELECT ... FOR UPDATE" AND reload the fields.
     * The reload matters: the entity was loaded earlier without a lock, so its "sold" may be old.
     * (A plain locked query would return that same cached object — with the old number!)
     */
    private void reservePessimistic(TicketType type, int quantity) {
        entityManager.refresh(type, LockModeType.PESSIMISTIC_WRITE);
        type.sell(quantity); // now safe: nobody else can change this row until we commit
    }

    private void reserveOptimistic(TicketType type, int quantity) {
        for (int attempt = 1; attempt <= MAX_OPTIMISTIC_ATTEMPTS; attempt++) {
            StockRepository.StockSnapshot now = stockRepository.snapshot(type.getId());
            int left = now.getTotalAvailable() - now.getSold();
            if (quantity > left) throw soldOut(type, left);
            if (stockRepository.compareAndSet(type.getId(), now.getSold() + quantity, now.getVersion()) == 1) {
                return; // nobody changed it in between → we won
            }
            backOff(attempt); // someone was faster: wait a little, read again, try again
        }
        throw new BusinessException(ErrorCode.STOCK_BUSY);
    }

    private void reserveAtomic(TicketType type, int quantity) {
        if (stockRepository.reserveAtomically(type.getId(), quantity) == 0) {
            StockRepository.StockSnapshot now = stockRepository.snapshot(type.getId());
            throw soldOut(type, now.getTotalAvailable() - now.getSold());
        }
    }

    private static BusinessException soldOut(TicketType type, int left) {
        return new BusinessException(ErrorCode.TICKET_SOLD_OUT,
                "Only " + Math.max(left, 0) + " '" + type.getName() + "' tickets left.");
    }

    /** Small random wait so retrying buyers don't all collide again at the same instant. */
    private static void backOff(int attempt) {
        try {
            Thread.sleep(ThreadLocalRandom.current().nextLong(1, 3L + attempt * 2L));
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new BusinessException(ErrorCode.STOCK_BUSY);
        }
    }
}
