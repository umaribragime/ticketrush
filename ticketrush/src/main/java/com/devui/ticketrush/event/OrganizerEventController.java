package com.devui.ticketrush.event;

import com.devui.ticketrush.auth.CurrentUser;
import com.devui.ticketrush.common.web.PageResponse;
import com.devui.ticketrush.event.dto.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/** Endpoints for organizers to manage their own events. */
@Tag(name = "Events (organizer)")
@RestController
@RequestMapping("/api/v1/organizer/events")
@PreAuthorize("hasRole('ORGANIZER')")
@RequiredArgsConstructor
public class OrganizerEventController {

    private final EventService eventService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EventResponse create(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody EventRequest request) {
        return eventService.create(CurrentUser.id(jwt), request);
    }

    @GetMapping
    public PageResponse<EventSummaryResponse> listMine(
            @AuthenticationPrincipal Jwt jwt,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return eventService.listMine(CurrentUser.id(jwt), pageable);
    }

    @GetMapping("/{eventId}")
    public EventResponse get(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID eventId) {
        return eventService.getMine(CurrentUser.id(jwt), eventId);
    }

    @PutMapping("/{eventId}")
    public EventResponse update(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID eventId,
                                @Valid @RequestBody EventRequest request) {
        return eventService.update(CurrentUser.id(jwt), eventId, request);
    }

    @PostMapping("/{eventId}/publish")
    public EventResponse publish(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID eventId) {
        return eventService.publish(CurrentUser.id(jwt), eventId);
    }

    @PostMapping("/{eventId}/cancel")
    public EventResponse cancel(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID eventId) {
        return eventService.cancel(CurrentUser.id(jwt), eventId);
    }

    @PostMapping("/{eventId}/staff")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void addStaff(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID eventId,
                         @Valid @RequestBody AddStaffRequest request) {
        eventService.addStaff(CurrentUser.id(jwt), eventId, request.email());
    }

    @GetMapping("/{eventId}/sales")
    public SalesReportResponse sales(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID eventId) {
        return eventService.salesReport(CurrentUser.id(jwt), eventId);
    }
}
