package com.devui.ticketrush.support;

import com.jayway.jsonpath.JsonPath;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Base class for full-stack tests: real Spring context, real security, real DB (H2 in PostgreSQL mode).
 * Helpers create users and events through the real API, like a client would.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public abstract class IntegrationTest {

    @Autowired
    protected MockMvc mvc;

    // ---------- users ----------

    protected String signupAndLogin(String accountType) throws Exception {
        String email = accountType.toLowerCase() + "-" + UUID.randomUUID() + "@test.com";
        signup(email, accountType).andExpect(status().isCreated());
        return login(email);
    }

    protected ResultActions signup(String email, String accountType) throws Exception {
        return mvc.perform(post("/api/v1/auth/signup").contentType(MediaType.APPLICATION_JSON).content("""
                {"name":"Test User","email":"%s","password":"password123","accountType":"%s"}
                """.formatted(email, accountType)));
    }

    protected String login(String email) throws Exception {
        String body = mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON).content("""
                        {"email":"%s","password":"password123"}
                        """.formatted(email)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(body, "$.accessToken");
    }

    protected String emailOf(String token) throws Exception {
        return read(mvc.perform(get("/api/v1/users/me").header("Authorization", bearer(token))), "$.email");
    }

    // ---------- events ----------

    /** Event whose sales window is open right now. */
    protected String eventJson(int vipCount, int standardCount) {
        Instant now = Instant.now().truncatedTo(ChronoUnit.SECONDS);
        return eventJson(now.minus(Duration.ofHours(1)), now.plus(Duration.ofDays(1)), vipCount, standardCount);
    }

    protected String eventJson(Instant salesStart, Instant salesEnd, int vipCount, int standardCount) {
        Instant start = salesEnd.plus(Duration.ofDays(1));
        return """
                {
                  "name": "Rush Live in Seoul",
                  "description": "Big concert",
                  "venue": "KSPO Dome",
                  "startAt": "%s",
                  "endAt": "%s",
                  "salesStartAt": "%s",
                  "salesEndAt": "%s",
                  "ticketTypes": [
                    {"name": "VIP", "price": 165000.00, "totalAvailable": %d},
                    {"name": "Standard", "price": 99000.00, "totalAvailable": %d}
                  ]
                }
                """.formatted(start, start.plus(Duration.ofHours(3)), salesStart, salesEnd, vipCount, standardCount);
    }

    protected String createEvent(String organizerToken, String json) throws Exception {
        return read(authed(post("/api/v1/organizer/events"), organizerToken).content(json), "$.id", 201);
    }

    protected String createPublishedEvent(String organizerToken, String json) throws Exception {
        String eventId = createEvent(organizerToken, json);
        mvc.perform(authed(post("/api/v1/organizer/events/" + eventId + "/publish"), organizerToken))
                .andExpect(status().isOk());
        return eventId;
    }

    protected String ticketTypeId(String eventId, String name) throws Exception {
        String body = mvc.perform(get("/api/v1/events/" + eventId)).andReturn().getResponse().getContentAsString();
        java.util.List<String> ids = JsonPath.read(body, "$.ticketTypes[?(@.name == '" + name + "')].id");
        return ids.getFirst();
    }

    protected ResultActions placeOrder(String token, String eventId, String ticketTypeId, int quantity) throws Exception {
        return mvc.perform(authed(post("/api/v1/orders"), token).content("""
                {"eventId":"%s","items":[{"ticketTypeId":"%s","quantity":%d}]}
                """.formatted(eventId, ticketTypeId, quantity)));
    }

    // ---------- plumbing ----------

    protected MockHttpServletRequestBuilder authed(MockHttpServletRequestBuilder builder, String token) {
        return builder.header("Authorization", bearer(token)).contentType(MediaType.APPLICATION_JSON);
    }

    protected String bearer(String token) {
        return "Bearer " + token;
    }

    protected <T> T read(MockHttpServletRequestBuilder request, String path, int expectedStatus) throws Exception {
        return read(mvc.perform(request).andExpect(status().is(expectedStatus)), path);
    }

    protected <T> T read(ResultActions actions, String path) throws Exception {
        return JsonPath.read(actions.andReturn().getResponse().getContentAsString(), path);
    }
}
