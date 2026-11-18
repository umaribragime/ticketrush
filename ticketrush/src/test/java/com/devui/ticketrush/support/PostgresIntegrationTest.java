package com.devui.ticketrush.support;

import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.test.context.TestPropertySource;
import org.testcontainers.postgresql.PostgreSQLContainer;

/**
 * Same as {@link IntegrationTest}, but on a REAL PostgreSQL 17 started in Docker by Testcontainers.
 *
 * Why not H2? Concurrency depends on how the database locks rows and isolates transactions.
 * H2 does this differently from PostgreSQL, so a race test on H2 can pass while production breaks.
 *
 * The container is started once and shared by every test class (the "singleton container" pattern).
 * @ServiceConnection tells Spring Boot to use it instead of the H2 settings from the test profile.
 */
@TestPropertySource(properties = {
        // enough connections for many buyers at once
        "spring.datasource.hikari.maximum-pool-size=30",
        "spring.datasource.hikari.connection-timeout=60000",
})
public abstract class PostgresIntegrationTest extends IntegrationTest {

    @ServiceConnection
    protected static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer("postgres:17");

    static {
        POSTGRES.start();
    }
}
