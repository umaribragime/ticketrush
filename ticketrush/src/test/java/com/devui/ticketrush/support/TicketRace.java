package com.devui.ticketrush.support;

import com.devui.ticketrush.common.exception.BusinessException;
import com.devui.ticketrush.common.exception.ErrorCode;
import com.devui.ticketrush.order.OrderService;
import com.devui.ticketrush.order.dto.PlaceOrderRequest;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Simulates "ticket open": many buyers press "Buy 1 ticket" at the same moment.
 *
 * All threads wait at a start gate (CountDownLatch) and are released together,
 * so their transactions really overlap — that's what makes races visible.
 */
public final class TicketRace {

    public record Result(
            String label, int buyers, int stock,
            int successes, int soldOut, int busy, int otherErrors,
            int soldColumn, int ticketRows, long millis
    ) {
        /** More tickets exist than seats, or the counter disagrees with the real ticket rows. */
        public boolean oversold() {
            return ticketRows > stock || soldColumn != ticketRows;
        }

        public String row() {
            return String.format("| %-12s | %5d | %5d | %9d | %8d | %4d | %5d | %11d | %11d | %6d ms | %s |",
                    label, buyers, stock, successes, soldOut, busy, otherErrors, soldColumn, ticketRows, millis,
                    oversold() ? "OVERSOLD ❌" : "correct ✅");
        }

        public static String header() {
            return "| strategy     | buyers| stock | successes | sold out | busy | other | sold column | ticket rows |   time    | result |";
        }
    }

    private TicketRace() {
    }

    public static Result run(String label, OrderService orderService, JdbcTemplate jdbc,
                             List<UUID> buyerIds, UUID eventId, UUID ticketTypeId, int stock, int threads)
            throws InterruptedException {
        AtomicInteger successes = new AtomicInteger();
        AtomicInteger soldOut = new AtomicInteger();
        AtomicInteger busy = new AtomicInteger();
        AtomicInteger other = new AtomicInteger();
        CountDownLatch startGate = new CountDownLatch(1);
        CountDownLatch done = new CountDownLatch(buyerIds.size());
        ExecutorService pool = Executors.newFixedThreadPool(threads);

        for (UUID buyer : buyerIds) {
            pool.submit(() -> {
                try {
                    startGate.await();
                    orderService.placeOrder(buyer, new PlaceOrderRequest(eventId,
                            List.of(new PlaceOrderRequest.Item(ticketTypeId, 1))));
                    successes.incrementAndGet();
                } catch (BusinessException e) {
                    if (e.getErrorCode() == ErrorCode.TICKET_SOLD_OUT) soldOut.incrementAndGet();
                    else if ("STOCK_BUSY".equals(e.getErrorCode().name())) busy.incrementAndGet();
                    else other.incrementAndGet();
                } catch (Exception e) {
                    other.incrementAndGet();
                } finally {
                    done.countDown();
                }
                return null;
            });
        }

        long start = System.nanoTime();
        startGate.countDown(); // GO!
        boolean finished = done.await(5, TimeUnit.MINUTES);
        long millis = (System.nanoTime() - start) / 1_000_000;
        pool.shutdownNow();
        if (!finished) throw new IllegalStateException("Race did not finish in time");

        Integer sold = jdbc.queryForObject("select sold from ticket_types where id = ?", Integer.class, ticketTypeId);
        Integer rows = jdbc.queryForObject("select count(*) from tickets where ticket_type_id = ?", Integer.class, ticketTypeId);
        return new Result(label, buyerIds.size(), stock, successes.get(), soldOut.get(), busy.get(), other.get(),
                sold == null ? 0 : sold, rows == null ? 0 : rows, millis);
    }
}
