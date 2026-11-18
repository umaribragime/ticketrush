package com.devui.ticketrush.concurrency;

import com.devui.ticketrush.support.TicketRace;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.TestPropertySource;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Optimistic locking is CORRECT (never oversells), but under a huge rush some buyers can give up
 * after too many retries ("busy") even while seats remain. That trade-off is the lesson here.
 */
@TestPropertySource(properties = "app.order.stock-strategy=OPTIMISTIC")
class OptimisticStockRaceTest extends StockRaceTestBase {

    @Test
    void neverOversells() throws Exception {
        TicketRace.Result r = race();
        assertThat(r.oversold()).as("oversold").isFalse();
        assertThat(r.successes()).isLessThanOrEqualTo(STOCK);
        assertThat(r.ticketRows()).isEqualTo(r.successes());
        assertThat(r.soldColumn()).isEqualTo(r.successes());
        assertThat(r.successes() + r.soldOut() + r.busy()).isEqualTo(ATTEMPTS);
        assertThat(r.otherErrors()).isZero();
    }
}
