package com.devui.ticketrush.event.dto;

import com.devui.ticketrush.event.Event;
import com.devui.ticketrush.event.EventStatus;

import java.time.Instant;
import java.util.UUID;

/** Small event card for lists. No ticket types here, so a list page needs only one query. */
public record EventSummaryResponse(
        UUID id,
        String name,
        String venue,
        Instant startAt,
        Instant salesStartAt,
        Instant salesEndAt,
        EventStatus status
) {
    public static EventSummaryResponse from(Event e) {
        return new EventSummaryResponse(e.getId(), e.getName(), e.getVenue(),
                e.getStartAt(), e.getSalesStartAt(), e.getSalesEndAt(), e.getStatus());
    }
}
