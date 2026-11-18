package com.devui.ticketrush.concurrency;

import com.devui.ticketrush.support.TicketRace;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.TestPropertySource;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * DEMO of the v1 bug: read → check → write without a lock oversells under load.
 * Tagged "demo" and skipped by default (races depend on timing; a normal build must never be flaky).
 * Run it on purpose:   ./mvnw test -Ddemo
 */
@Tag("demo")
@TestPropertySource(properties = "app.order.stock-strategy=NAIVE")
class NaiveOversellDemoTest extends StockRaceTestBase {

    @Test
    void oversells() throws Exception {
        TicketRace.Result r = race();
        assertThat(r.oversold()).as("the naive strategy should oversell under this load").isTrue();
    }
}
