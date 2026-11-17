package com.devui.ticketrush.event.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record SalesReportResponse(
        UUID eventId,
        long totalSold,
        long totalCapacity,
        BigDecimal totalRevenue,
        long checkedIn,
        List<TicketTypeSalesRow> ticketTypes
) {
}
