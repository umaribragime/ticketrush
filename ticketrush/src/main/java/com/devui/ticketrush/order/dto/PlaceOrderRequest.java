package com.devui.ticketrush.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

public record PlaceOrderRequest(
        @NotNull UUID eventId,
        @NotEmpty @Size(max = 10) List<@Valid Item> items
) {
    public record Item(
            @NotNull UUID ticketTypeId,
            @Min(1) @Max(10) int quantity
    ) {
    }
}
