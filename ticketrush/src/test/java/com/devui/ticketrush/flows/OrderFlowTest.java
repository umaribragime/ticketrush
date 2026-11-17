package com.devui.ticketrush.flows;

import com.devui.ticketrush.support.IntegrationTest;
import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class OrderFlowTest extends IntegrationTest {

    @Test
    void buyTicketsAndSeeThem() throws Exception {
        String organizer = signupAndLogin("ORGANIZER");
        String attendee = signupAndLogin("ATTENDEE");
        String eventId = createPublishedEvent(organizer, eventJson(10, 100));
        String vip = ticketTypeId(eventId, "VIP");

        placeOrder(attendee, eventId, vip, 2)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PAID"))
                .andExpect(jsonPath("$.totalAmount").value(330000.00))
                .andExpect(jsonPath("$.tickets.length()").value(2))
                .andExpect(jsonPath("$.tickets[0].qrValue").isNotEmpty())
                .andExpect(jsonPath("$.createdAt").isNotEmpty());

        // stock went down
        mvc.perform(get("/api/v1/events/" + eventId))
                .andExpect(jsonPath("$.ticketTypes[0].remaining").value(8));

        // "my tickets"
        String ticketId = read(mvc.perform(get("/api/v1/tickets").header("Authorization", bearer(attendee)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(2))
                .andExpect(jsonPath("$.content[0].ticketTypeName").value("VIP")), "$.content[0].id");

        // QR image
        mvc.perform(get("/api/v1/tickets/" + ticketId + "/qr").header("Authorization", bearer(attendee)))
                .andExpect(status().isOk())
                .andExpect(content().contentType("image/png"));

        // "my orders"
        mvc.perform(get("/api/v1/orders").header("Authorization", bearer(attendee)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    void cannotSeeSomeoneElsesTicket() throws Exception {
        String organizer = signupAndLogin("ORGANIZER");
        String owner = signupAndLogin("ATTENDEE");
        String stranger = signupAndLogin("ATTENDEE");
        String eventId = createPublishedEvent(organizer, eventJson(10, 10));
        String ticketId = read(placeOrder(owner, eventId, ticketTypeId(eventId, "VIP"), 1), "$.tickets[0].id");

        mvc.perform(get("/api/v1/tickets/" + ticketId).header("Authorization", bearer(stranger)))
                .andExpect(status().isNotFound());
    }

    @Test
    void soldOut() throws Exception {
        String organizer = signupAndLogin("ORGANIZER");
        String attendee = signupAndLogin("ATTENDEE");
        String eventId = createPublishedEvent(organizer, eventJson(3, 10));
        String vip = ticketTypeId(eventId, "VIP");

        placeOrder(attendee, eventId, vip, 3).andExpect(status().isCreated());

        placeOrder(attendee, eventId, vip, 1)
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("TICKET_SOLD_OUT"));
    }

    @Test
    void orderLimitPerOrder() throws Exception {
        String organizer = signupAndLogin("ORGANIZER");
        String attendee = signupAndLogin("ATTENDEE");
        String eventId = createPublishedEvent(organizer, eventJson(100, 100));

        placeOrder(attendee, eventId, ticketTypeId(eventId, "VIP"), 5)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("ORDER_LIMIT_EXCEEDED"));
    }

    @Test
    void cannotBuyBeforeTicketOpen() throws Exception {
        String organizer = signupAndLogin("ORGANIZER");
        String attendee = signupAndLogin("ATTENDEE");
        Instant now = Instant.now().truncatedTo(ChronoUnit.SECONDS);
        String eventId = createPublishedEvent(organizer,
                eventJson(now.plus(Duration.ofHours(1)), now.plus(Duration.ofDays(1)), 10, 10));

        placeOrder(attendee, eventId, ticketTypeId(eventId, "VIP"), 1)
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("EVENT_NOT_ON_SALE"));
    }

    @Test
    void salesReportCountsTicketsAndRevenue() throws Exception {
        String organizer = signupAndLogin("ORGANIZER");
        String attendee = signupAndLogin("ATTENDEE");
        String eventId = createPublishedEvent(organizer, eventJson(10, 100));

        placeOrder(attendee, eventId, ticketTypeId(eventId, "VIP"), 2).andExpect(status().isCreated());
        placeOrder(attendee, eventId, ticketTypeId(eventId, "Standard"), 1).andExpect(status().isCreated());

        mvc.perform(get("/api/v1/organizer/events/" + eventId + "/sales").header("Authorization", bearer(organizer)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalSold").value(3))
                .andExpect(jsonPath("$.totalCapacity").value(110))
                .andExpect(jsonPath("$.totalRevenue").value(429000.00))
                .andExpect(jsonPath("$.ticketTypes[0].name").value("VIP"))
                .andExpect(jsonPath("$.ticketTypes[0].sold").value(2));
    }
}
