package com.devui.ticketrush.event.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/** Used for both create and update (update replaces everything while the event is DRAFT). */
public record EventRequest(
        @NotBlank @Size(max = 200) String name,
        @Size(max = 4000) String description,
        @NotBlank @Size(max = 200) String venue,
        @NotNull Instant startAt,
        @NotNull Instant endAt,
        @NotNull Instant salesStartAt,
        @NotNull Instant salesEndAt,
        @NotEmpty @Size(max = 20) List<@Valid TicketTypeRequest> ticketTypes
) {
    public record TicketTypeRequest(
            @NotBlank @Size(max = 100) String name,
            @NotNull @DecimalMin("0.00") @Digits(integer = 10, fraction = 2) BigDecimal price,
            @Min(1) @Max(1_000_000) int totalAvailable
    ) {
    }
}
