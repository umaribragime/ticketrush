package com.devui.ticketrush.event;

import com.devui.ticketrush.checkin.TicketValidationRepository;
import com.devui.ticketrush.checkin.ValidationStatus;
import com.devui.ticketrush.common.exception.BusinessException;
import com.devui.ticketrush.common.exception.ErrorCode;
import com.devui.ticketrush.common.web.PageResponse;
import com.devui.ticketrush.event.dto.*;
import com.devui.ticketrush.user.Role;
import com.devui.ticketrush.user.User;
import com.devui.ticketrush.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EventService {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final TicketValidationRepository validationRepository;

    // ---------- organizer ----------

    @Transactional
    public EventResponse create(UUID organizerId, EventRequest request) {
        User organizer = userRepository.findById(organizerId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        Event event = new Event(organizer, request.name(), request.description(), request.venue(),
                request.startAt(), request.endAt(), request.salesStartAt(), request.salesEndAt());
        toTicketTypes(request).forEach(event::addTicketType);
        return EventResponse.from(eventRepository.save(event));
    }

    @Transactional
    public EventResponse update(UUID organizerId, UUID eventId, EventRequest request) {
        Event event = getOwnedEvent(organizerId, eventId);
        event.update(request.name(), request.description(), request.venue(),
                request.startAt(), request.endAt(), request.salesStartAt(), request.salesEndAt());
        event.replaceTicketTypes(toTicketTypes(request));
        eventRepository.flush(); // so new ticket types get their ids before we map the response
        return EventResponse.from(event);
    }

    @Transactional
    public EventResponse publish(UUID organizerId, UUID eventId) {
        Event event = getOwnedEvent(organizerId, eventId);
        event.publish();
        return EventResponse.from(event);
    }

    @Transactional
    public EventResponse cancel(UUID organizerId, UUID eventId) {
        Event event = getOwnedEvent(organizerId, eventId);
        event.cancel();
        return EventResponse.from(event);
    }

    @Transactional
    public void addStaff(UUID organizerId, UUID eventId, String email) {
        Event event = getOwnedEvent(organizerId, eventId);
        User staff = userRepository.findByEmail(email.trim().toLowerCase(Locale.ROOT))
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        staff.grantRole(Role.STAFF);
        event.addStaff(staff);
    }

    public PageResponse<EventSummaryResponse> listMine(UUID organizerId, Pageable pageable) {
        return PageResponse.of(eventRepository.findByOrganizerId(organizerId, pageable), EventSummaryResponse::from);
    }

    public EventResponse getMine(UUID organizerId, UUID eventId) {
        return EventResponse.from(getOwnedEvent(organizerId, eventId));
    }

    public SalesReportResponse salesReport(UUID organizerId, UUID eventId) {
        getOwnedEvent(organizerId, eventId);
        List<TicketTypeSalesRow> rows = eventRepository.salesByTicketType(eventId);
        long sold = rows.stream().mapToLong(TicketTypeSalesRow::sold).sum();
        long capacity = rows.stream().mapToLong(TicketTypeSalesRow::totalAvailable).sum();
        BigDecimal revenue = rows.stream().map(TicketTypeSalesRow::revenue).reduce(BigDecimal.ZERO, BigDecimal::add);
        long checkedIn = validationRepository.countByEventIdAndStatus(eventId, ValidationStatus.VALID);
        return new SalesReportResponse(eventId, sold, capacity, revenue, checkedIn, rows);
    }

    // ---------- public ----------

    public PageResponse<EventSummaryResponse> listPublished(String query, Pageable pageable) {
        Page<Event> page = StringUtils.hasText(query)
                ? eventRepository.findByStatusAndNameContainingIgnoreCase(EventStatus.PUBLISHED, query.trim(), pageable)
                : eventRepository.findByStatus(EventStatus.PUBLISHED, pageable);
        return PageResponse.of(page, EventSummaryResponse::from);
    }

    public EventResponse getPublic(UUID eventId) {
        Event event = eventRepository.findWithTicketTypesById(eventId)
                .filter(e -> e.getStatus() != EventStatus.DRAFT) // drafts are private
                .orElseThrow(() -> new BusinessException(ErrorCode.EVENT_NOT_FOUND));
        return EventResponse.from(event);
    }

    // ---------- helpers ----------

    private Event getOwnedEvent(UUID organizerId, UUID eventId) {
        Event event = eventRepository.findWithTicketTypesById(eventId)
                .orElseThrow(() -> new BusinessException(ErrorCode.EVENT_NOT_FOUND));
        if (!event.isOrganizedBy(organizerId)) {
            throw new BusinessException(ErrorCode.EVENT_ACCESS_DENIED);
        }
        return event;
    }

    private static List<TicketType> toTicketTypes(EventRequest request) {
        return request.ticketTypes().stream()
                .map(t -> new TicketType(t.name().trim(), t.price(), t.totalAvailable()))
                .toList();
    }
}
