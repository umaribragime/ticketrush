package com.devui.ticketrush.event.dto;

import java.math.BigDecimal;
import java.util.UUID;

/** One row of the GROUP BY sales query. */
public record TicketTypeSalesRow(
        UUID ticketTypeId,
        String name,
        BigDecimal price,
        int totalAvailable,
        long sold,
        BigDecimal revenue
) {
    public TicketTypeSalesRow {
        if (revenue == null) {
            revenue = BigDecimal.ZERO; // SUM over no rows is NULL in SQL
        }
    }
}
