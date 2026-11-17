package com.devui.ticketrush.event.dto;

import com.devui.ticketrush.event.Event;
import com.devui.ticketrush.event.EventStatus;
import com.devui.ticketrush.event.TicketType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/** Full event with its ticket types (detail page). */
public record EventResponse(
        UUID id,
        String name,
        String description,
        String venue,
        Instant startAt,
        Instant endAt,
        Instant salesStartAt,
        Instant salesEndAt,
        EventStatus status,
        UUID organizerId,
        List<TicketTypeResponse> ticketTypes
) {
    public static EventResponse from(Event e) {
        return new EventResponse(e.getId(), e.getName(), e.getDescription(), e.getVenue(),
                e.getStartAt(), e.getEndAt(), e.getSalesStartAt(), e.getSalesEndAt(), e.getStatus(),
                e.getOrganizer().getId(),
                e.getTicketTypes().stream().map(TicketTypeResponse::from).toList());
    }

    public record TicketTypeResponse(UUID id, String name, BigDecimal price, int totalAvailable, int remaining) {
        public static TicketTypeResponse from(TicketType t) {
            return new TicketTypeResponse(t.getId(), t.getName(), t.getPrice(), t.getTotalAvailable(), t.getRemaining());
        }
    }
}
