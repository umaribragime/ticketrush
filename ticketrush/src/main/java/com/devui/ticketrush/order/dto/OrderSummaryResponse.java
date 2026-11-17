package com.devui.ticketrush.order.dto;

import com.devui.ticketrush.order.Order;
import com.devui.ticketrush.order.OrderStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record OrderSummaryResponse(
        UUID id,
        UUID eventId,
        String eventName,
        OrderStatus status,
        BigDecimal totalAmount,
        Instant createdAt
) {
    public static OrderSummaryResponse from(Order o) {
        return new OrderSummaryResponse(o.getId(), o.getEvent().getId(), o.getEvent().getName(),
                o.getStatus(), o.getTotalAmount(), o.getCreatedAt());
    }
}
