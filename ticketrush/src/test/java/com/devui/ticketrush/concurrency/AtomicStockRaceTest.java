package com.devui.ticketrush.concurrency;

import com.devui.ticketrush.support.TicketRace;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.TestPropertySource;

import static org.assertj.core.api.Assertions.assertThat;

@TestPropertySource(properties = "app.order.stock-strategy=ATOMIC")
class AtomicStockRaceTest extends StockRaceTestBase {

    @Test
    void sellsExactlyTheStockAndNothingMore() throws Exception {
        TicketRace.Result r = race();
        assertThat(r.oversold()).as("oversold").isFalse();
        assertThat(r.successes()).isEqualTo(STOCK);        // every seat sold
        assertThat(r.soldOut()).isEqualTo(ATTEMPTS - STOCK); // everyone else told "sold out"
        assertThat(r.otherErrors()).isZero();
        assertThat(r.soldColumn()).isEqualTo(STOCK);
        assertThat(r.ticketRows()).isEqualTo(STOCK);
    }
}
