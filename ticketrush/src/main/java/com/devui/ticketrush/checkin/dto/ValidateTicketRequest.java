package com.devui.ticketrush.checkin.dto;

import com.devui.ticketrush.checkin.ValidationMethod;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

/** QR scan → send qrValue. Manual check (QR broken) → send ticketId. */
public record ValidateTicketRequest(
        @NotNull ValidationMethod method,
        @Size(max = 64) String qrValue,
        UUID ticketId
) {
}
