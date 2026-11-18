package com.devui.ticketrush.event;

import com.devui.ticketrush.common.exception.BusinessException;
import com.devui.ticketrush.common.exception.ErrorCode;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "ticket_types")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class TicketType {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Column(nullable = false, length = 100)
    private String name;

    /** Money is BigDecimal, never double: 0.1 + 0.2 != 0.3 in floating point. */
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(name = "total_available", nullable = false)
    private int totalAvailable;

    @Column(nullable = false)
    private int sold;

    public TicketType(String name, BigDecimal price, int totalAvailable) {
        this.name = name;
        this.price = price;
        this.totalAvailable = totalAvailable;
        this.sold = 0;
    }

    void assignTo(Event event) {
        this.event = event;
    }

    public int getRemaining() {
        return totalAvailable - sold;
    }

    /**
     * "Read, check, write" in Java. Only safe while this row is LOCKED (PESSIMISTIC strategy)
     * or when one user at a time buys. Without a lock it oversells — see StockService (v2).
     */
    public void sell(int quantity) {
        if (quantity > getRemaining()) {
            throw new BusinessException(ErrorCode.TICKET_SOLD_OUT,
                    "Only " + getRemaining() + " '" + name + "' tickets left.");
        }
        sold += quantity;
    }
}
