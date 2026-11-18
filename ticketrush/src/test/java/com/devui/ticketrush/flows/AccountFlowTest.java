package com.devui.ticketrush.flows;

import com.devui.ticketrush.support.IntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AccountFlowTest extends IntegrationTest {

    @Test
    void renameMyself() throws Exception {
        String token = signupAndLogin("ATTENDEE");

        mvc.perform(authed(patch("/api/v1/users/me"), token).content("{\"name\":\"  New Name  \"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("New Name"));

        mvc.perform(get("/api/v1/users/me").header("Authorization", bearer(token)))
                .andExpect(jsonPath("$.name").value("New Name"));
    }

    @Test
    void blankNameIsRejected() throws Exception {
        String token = signupAndLogin("ATTENDEE");

        mvc.perform(authed(patch("/api/v1/users/me"), token).content("{\"name\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.name").exists());
    }

    @Test
    void changePasswordThenLoginWithTheNewOne() throws Exception {
        String email = "pw-change-" + UUID.randomUUID() + "@test.com";
        signup(email, "ATTENDEE").andExpect(status().isCreated());
        String token = login(email);

        mvc.perform(authed(put("/api/v1/users/me/password"), token)
                        .content("{\"currentPassword\":\"password123\",\"newPassword\":\"brand-new-pass\"}"))
                .andExpect(status().isNoContent());

        // old password no longer works
        mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"password\":\"password123\"}"))
                .andExpect(status().isUnauthorized());
        // new one does
        mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"password\":\"brand-new-pass\"}"))
                .andExpect(status().isOk());
    }

    @Test
    void wrongCurrentPasswordIsRejected() throws Exception {
        String token = signupAndLogin("ATTENDEE");

        mvc.perform(authed(put("/api/v1/users/me/password"), token)
                        .content("{\"currentPassword\":\"not-my-password\",\"newPassword\":\"brand-new-pass\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("CURRENT_PASSWORD_INCORRECT"));
    }

    @Test
    void samePasswordIsRejected() throws Exception {
        String token = signupAndLogin("ATTENDEE");

        mvc.perform(authed(put("/api/v1/users/me/password"), token)
                        .content("{\"currentPassword\":\"password123\",\"newPassword\":\"password123\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("NEW_PASSWORD_SAME_AS_OLD"));
    }

    @Test
    void summaryCountsMyStuff() throws Exception {
        String organizer = signupAndLogin("ORGANIZER");
        String attendee = signupAndLogin("ATTENDEE");
        String eventId = createPublishedEvent(organizer, eventJson(10, 10));
        placeOrder(attendee, eventId, ticketTypeId(eventId, "VIP"), 2).andExpect(status().isCreated());

        mvc.perform(get("/api/v1/users/me/summary").header("Authorization", bearer(attendee)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ticketCount").value(2))
                .andExpect(jsonPath("$.upcomingTicketCount").value(2))
                .andExpect(jsonPath("$.orderCount").value(1))
                .andExpect(jsonPath("$.organizedEventCount").value(0));

        mvc.perform(get("/api/v1/users/me/summary").header("Authorization", bearer(organizer)))
                .andExpect(jsonPath("$.organizedEventCount").value(1));
    }

    @Test
    void accountNeedsLogin() throws Exception {
        mvc.perform(get("/api/v1/users/me/summary")).andExpect(status().isUnauthorized());
        mvc.perform(patch("/api/v1/users/me").contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"x\"}"))
                .andExpect(status().isUnauthorized());
    }
}
