package com.devui.ticketrush.flows;

import com.devui.ticketrush.support.IntegrationTest;
import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.time.Instant;

import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class EventFlowTest extends IntegrationTest {

    @Test
    void attendeeCannotCreateEvents() throws Exception {
        String attendee = signupAndLogin("ATTENDEE");

        mvc.perform(authed(post("/api/v1/organizer/events"), attendee).content(eventJson(10, 10)))
                .andExpect(status().isForbidden());
    }

    @Test
    void draftIsPrivateUntilPublished() throws Exception {
        String organizer = signupAndLogin("ORGANIZER");

        mvc.perform(authed(post("/api/v1/organizer/events"), organizer).content(eventJson(10, 50)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andExpect(jsonPath("$.ticketTypes.length()").value(2))
                .andExpect(jsonPath("$.ticketTypes[0].name").value("VIP"));

        String eventId = createEvent(organizer, eventJson(10, 50));
        mvc.perform(get("/api/v1/events/" + eventId)).andExpect(status().isNotFound());

        mvc.perform(authed(post("/api/v1/organizer/events/" + eventId + "/publish"), organizer))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PUBLISHED"));

        mvc.perform(get("/api/v1/events/" + eventId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ticketTypes[1].remaining").value(50));

        mvc.perform(get("/api/v1/events").param("q", "rush live").param("size", "100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[*].id", hasItem(eventId)));
    }

    @Test
    void publishedEventCannotBeEdited() throws Exception {
        String organizer = signupAndLogin("ORGANIZER");
        String eventId = createPublishedEvent(organizer, eventJson(10, 10));

        mvc.perform(authed(put("/api/v1/organizer/events/" + eventId), organizer).content(eventJson(5, 5)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("EVENT_NOT_EDITABLE"));
    }

    @Test
    void draftCanBeEdited() throws Exception {
        String organizer = signupAndLogin("ORGANIZER");
        String eventId = createEvent(organizer, eventJson(10, 10));

        mvc.perform(authed(put("/api/v1/organizer/events/" + eventId), organizer).content(eventJson(3, 7)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ticketTypes[0].totalAvailable").value(3))
                .andExpect(jsonPath("$.ticketTypes[1].totalAvailable").value(7));
    }

    @Test
    void otherOrganizerCannotTouchMyEvent() throws Exception {
        String owner = signupAndLogin("ORGANIZER");
        String stranger = signupAndLogin("ORGANIZER");
        String eventId = createEvent(owner, eventJson(10, 10));

        mvc.perform(authed(post("/api/v1/organizer/events/" + eventId + "/publish"), stranger))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("EVENT_ACCESS_DENIED"));
    }

    @Test
    void badScheduleIsRejected() throws Exception {
        String organizer = signupAndLogin("ORGANIZER");
        Instant now = Instant.now();
        // sales end before they start
        String json = eventJson(now.plus(Duration.ofDays(2)), now.plus(Duration.ofDays(1)), 10, 10);

        mvc.perform(authed(post("/api/v1/organizer/events"), organizer).content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("EVENT_INVALID_SCHEDULE"));
    }
}
