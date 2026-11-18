package com.devui.ticketrush.concurrency;

import com.devui.ticketrush.order.OrderService;
import com.devui.ticketrush.order.stock.StockService;
import com.devui.ticketrush.support.PostgresIntegrationTest;
import com.devui.ticketrush.support.TicketRace;
import com.jayway.jsonpath.JsonPath;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

/**
 * "Ticket open" simulation: 1,000 buy attempts (1 ticket each) for 100 VIP seats, all at once,
 * from 20 different users, on real PostgreSQL. Each subclass runs it with one stock strategy.
 * Results are appended to target/race-results.md so they can be compared.
 */
abstract class StockRaceTestBase extends PostgresIntegrationTest {

    static final int STOCK = 100;
    static final int ATTEMPTS = 1000;
    static final int THREADS = 64;

    @Autowired OrderService orderService;
    @Autowired StockService stockService;
    @Autowired JdbcTemplate jdbc;

    TicketRace.Result race() throws Exception {
        String organizer = signupAndLogin("ORGANIZER");
        UUID eventId = UUID.fromString(createPublishedEvent(organizer, eventJson(STOCK, 10)));
        UUID vip = UUID.fromString(ticketTypeId(eventId.toString(), "VIP"));

        List<UUID> users = new ArrayList<>();
        for (int i = 0; i < 20; i++) {
            String token = signupAndLogin("ATTENDEE");
            String me = mvc.perform(get("/api/v1/users/me").header("Authorization", bearer(token)))
                    .andReturn().getResponse().getContentAsString();
            users.add(UUID.fromString(JsonPath.read(me, "$.id")));
        }
        List<UUID> attempts = new ArrayList<>();
        for (int i = 0; i < ATTEMPTS; i++) attempts.add(users.get(i % users.size()));

        TicketRace.Result result = TicketRace.run(stockService.strategy().name(), orderService, jdbc,
                attempts, eventId, vip, STOCK, THREADS);
        report(result);
        return result;
    }

    private static void report(TicketRace.Result r) throws IOException {
        System.out.println("\n" + TicketRace.Result.header() + "\n" + r.row() + "\n");
        Path file = Path.of("target", "race-results.md");
        if (!Files.exists(file)) {
            Files.writeString(file, TicketRace.Result.header() + "\n|---|---|---|---|---|---|---|---|---|---|---|\n");
        }
        Files.writeString(file, r.row() + "\n", StandardOpenOption.APPEND);
    }
}
