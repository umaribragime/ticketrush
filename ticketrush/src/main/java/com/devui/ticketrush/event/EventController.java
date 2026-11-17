package com.devui.ticketrush.event;

import com.devui.ticketrush.common.web.PageResponse;
import com.devui.ticketrush.event.dto.EventResponse;
import com.devui.ticketrush.event.dto.EventSummaryResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/** Public endpoints: anyone can browse published events. */
@Tag(name = "Events (public)")
@RestController
@RequestMapping("/api/v1/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @GetMapping
    public PageResponse<EventSummaryResponse> list(
            @RequestParam(required = false) String q,
            @PageableDefault(size = 20, sort = "startAt", direction = Sort.Direction.ASC) Pageable pageable) {
        return eventService.listPublished(q, pageable);
    }

    @GetMapping("/{eventId}")
    public EventResponse get(@PathVariable UUID eventId) {
        return eventService.getPublic(eventId);
    }
}
