package com.devui.ticketrush.user.dto;

/** Numbers for the account page. */
public record UserSummaryResponse(
        long ticketCount,
        long upcomingTicketCount,
        long orderCount,
        long organizedEventCount
) {
}
