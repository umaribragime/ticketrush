package com.devui.ticketrush.flows;

import com.devui.ticketrush.support.IntegrationTest;
import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class CheckInFlowTest extends IntegrationTest {

    @Test
    void staffScansTicketOnceOnly() throws Exception {
        String organizer = signupAndLogin("ORGANIZER");
        String attendee = signupAndLogin("ATTENDEE");
        String staff = signupAndLogin("ATTENDEE");
        String eventId = createPublishedEvent(organizer, eventJson(10, 10));
        String qr = read(placeOrder(attendee, eventId, ticketTypeId(eventId, "VIP"), 1), "$.tickets[0].qrValue");

        mvc.perform(authed(post("/api/v1/organizer/events/" + eventId + "/staff"), organizer)
                        .content("{\"email\":\"" + emailOf(staff) + "\"}"))
                .andExpect(status().isNoContent());

        String scan = "{\"method\":\"QR\",\"qrValue\":\"" + qr + "\"}";

        // first scan: welcome in
        mvc.perform(authed(post("/api/v1/events/" + eventId + "/validations"), staff).content(scan))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("VALID"))
                .andExpect(jsonPath("$.ticketTypeName").value("VIP"));

        // second scan of the same QR: rejected
        mvc.perform(authed(post("/api/v1/events/" + eventId + "/validations"), staff).content(scan))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("INVALID"))
                .andExpect(jsonPath("$.reason").value("ALREADY_USED"));

        // the attendee sees the ticket as USED
        mvc.perform(get("/api/v1/tickets").header("Authorization", bearer(attendee)))
                .andExpect(jsonPath("$.content[0].status").value("USED"));

        // organizer report counts one check-in
        mvc.perform(get("/api/v1/organizer/events/" + eventId + "/sales").header("Authorization", bearer(organizer)))
                .andExpect(jsonPath("$.checkedIn").value(1));
    }

    @Test
    void unknownQrIsInvalid() throws Exception {
        String organizer = signupAndLogin("ORGANIZER");
        String eventId = createPublishedEvent(organizer, eventJson(10, 10));

        mvc.perform(authed(post("/api/v1/events/" + eventId + "/validations"), organizer)
                        .content("{\"method\":\"QR\",\"qrValue\":\"fake-qr\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("INVALID"))
                .andExpect(jsonPath("$.reason").value("NOT_FOUND"));
    }

    @Test
    void ticketForAnotherEventIsInvalid() throws Exception {
        String organizer = signupAndLogin("ORGANIZER");
        String attendee = signupAndLogin("ATTENDEE");
        String eventA = createPublishedEvent(organizer, eventJson(10, 10));
        String eventB = createPublishedEvent(organizer, eventJson(10, 10));
        String qr = read(placeOrder(attendee, eventA, ticketTypeId(eventA, "VIP"), 1), "$.tickets[0].qrValue");

        mvc.perform(authed(post("/api/v1/events/" + eventB + "/validations"), organizer)
                        .content("{\"method\":\"QR\",\"qrValue\":\"" + qr + "\"}"))
                .andExpect(jsonPath("$.status").value("INVALID"))
                .andExpect(jsonPath("$.reason").value("WRONG_EVENT"));
    }

    @Test
    void nonStaffCannotScan() throws Exception {
        String organizer = signupAndLogin("ORGANIZER");
        String randomUser = signupAndLogin("ATTENDEE");
        String eventId = createPublishedEvent(organizer, eventJson(10, 10));

        mvc.perform(authed(post("/api/v1/events/" + eventId + "/validations"), randomUser)
                        .content("{\"method\":\"QR\",\"qrValue\":\"anything\"}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("NOT_EVENT_STAFF"));
    }
}
