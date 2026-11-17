package com.devui.ticketrush.checkin;

import com.devui.ticketrush.checkin.dto.ValidateTicketRequest;
import com.devui.ticketrush.checkin.dto.ValidationResponse;
import com.devui.ticketrush.common.exception.BusinessException;
import com.devui.ticketrush.common.exception.ErrorCode;
import com.devui.ticketrush.event.Event;
import com.devui.ticketrush.event.EventRepository;
import com.devui.ticketrush.ticket.QrCode;
import com.devui.ticketrush.ticket.QrCodeRepository;
import com.devui.ticketrush.ticket.Ticket;
import com.devui.ticketrush.ticket.TicketRepository;
import com.devui.ticketrush.ticket.TicketStatus;
import com.devui.ticketrush.user.User;
import com.devui.ticketrush.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Clock;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

/**
 * Gate check-in. Staff scans a QR; the first valid scan marks the ticket USED,
 * every later scan is INVALID / ALREADY_USED. Every scan is recorded.
 */
@Service
@RequiredArgsConstructor
public class CheckInService {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final QrCodeRepository qrCodeRepository;
    private final TicketRepository ticketRepository;
    private final TicketValidationRepository validationRepository;
    private final Clock clock;

    @Transactional
    public ValidationResponse validate(UUID staffId, UUID eventId, ValidateTicketRequest request) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new BusinessException(ErrorCode.EVENT_NOT_FOUND));
        if (!event.isStaff(staffId) && !event.isOrganizedBy(staffId)) {
            throw new BusinessException(ErrorCode.NOT_EVENT_STAFF);
        }
        User staff = userRepository.getReferenceById(staffId);

        Ticket ticket = findTicket(request).orElse(null);
        // Careful: Optional.map(...) turns a null result into "empty", so we use a plain if here.
        InvalidReason reason = ticket == null ? InvalidReason.NOT_FOUND : check(ticket, eventId);
        if (reason == null) {
            ticket.markUsed();
        }
        TicketValidation validation = new TicketValidation(ticket, event, staff,
                request.method(), reason, Instant.now(clock));
        return ValidationResponse.from(validationRepository.save(validation));
    }

    private Optional<Ticket> findTicket(ValidateTicketRequest request) {
        return switch (request.method()) {
            case QR -> {
                if (!StringUtils.hasText(request.qrValue())) {
                    throw new BusinessException(ErrorCode.INVALID_VALIDATION_REQUEST);
                }
                yield qrCodeRepository.findByValue(request.qrValue()).map(QrCode::getTicket);
            }
            case MANUAL -> {
                if (request.ticketId() == null) {
                    throw new BusinessException(ErrorCode.INVALID_VALIDATION_REQUEST);
                }
                yield ticketRepository.findDetailedById(request.ticketId());
            }
        };
    }

    /** Returns null when the ticket is valid, otherwise the reason it is not. */
    private static InvalidReason check(Ticket ticket, UUID eventId) {
        if (!ticket.getTicketType().getEvent().getId().equals(eventId)) {
            return InvalidReason.WRONG_EVENT;
        }
        if (ticket.getStatus() == TicketStatus.USED) {
            return InvalidReason.ALREADY_USED;
        }
        if (ticket.getStatus() == TicketStatus.CANCELLED) {
            return InvalidReason.CANCELLED;
        }
        return null;
    }
}
