package com.devui.ticketrush.order.dto;

import com.devui.ticketrush.order.Order;
import com.devui.ticketrush.order.OrderStatus;
import com.devui.ticketrush.ticket.dto.TicketResponse;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record OrderResponse(
        UUID id,
        UUID eventId,
        String eventName,
        OrderStatus status,
        BigDecimal totalAmount,
        Instant createdAt,
        List<TicketResponse> tickets
) {
    public static OrderResponse from(Order o) {
        return new OrderResponse(o.getId(), o.getEvent().getId(), o.getEvent().getName(), o.getStatus(),
                o.getTotalAmount(), o.getCreatedAt(),
                o.getTickets().stream().map(TicketResponse::from).toList());
    }
}
