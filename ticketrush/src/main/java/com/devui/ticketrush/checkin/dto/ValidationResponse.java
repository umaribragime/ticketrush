package com.devui.ticketrush.checkin.dto;

import com.devui.ticketrush.checkin.InvalidReason;
import com.devui.ticketrush.checkin.TicketValidation;
import com.devui.ticketrush.checkin.ValidationStatus;

import java.time.Instant;
import java.util.UUID;

public record ValidationResponse(
        UUID validationId,
        ValidationStatus status,
        InvalidReason reason,
        UUID ticketId,
        String ticketTypeName,
        Instant validatedAt
) {
    public static ValidationResponse from(TicketValidation v) {
        return new ValidationResponse(v.getId(), v.getStatus(), v.getReason(),
                v.getTicket() == null ? null : v.getTicket().getId(),
                v.getTicket() == null ? null : v.getTicket().getTicketType().getName(),
                v.getValidatedAt());
    }
}
