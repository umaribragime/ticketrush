package com.devui.ticketrush.ticket.dto;

import com.devui.ticketrush.event.Event;
import com.devui.ticketrush.ticket.Ticket;
import com.devui.ticketrush.ticket.TicketStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record TicketResponse(
        UUID id,
        UUID eventId,
        String eventName,
        String venue,
        Instant eventStartAt,
        String ticketTypeName,
        BigDecimal price,
        TicketStatus status,
        String qrValue,
        Instant createdAt
) {
    public static TicketResponse from(Ticket t) {
        Event e = t.getTicketType().getEvent();
        return new TicketResponse(t.getId(), e.getId(), e.getName(), e.getVenue(), e.getStartAt(),
                t.getTicketType().getName(), t.getPrice(), t.getStatus(),
                t.getQrCode().getValue(), t.getCreatedAt());
    }
}
