package com.devui.ticketrush.order.stock;

import com.devui.ticketrush.event.TicketType;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

/**
 * The SQL behind each stock strategy. Native SQL on purpose: you can read exactly what the database does.
 */
public interface StockRepository extends Repository<TicketType, UUID> {

    /**
     * ATOMIC — check and write in ONE statement. PostgreSQL locks the row for this UPDATE, and a second
     * buyer re-checks the WHERE clause against the NEW value, so "sold" can never pass "total_available".
     * Returns 1 if the tickets were reserved, 0 if they don't fit any more.
     */
    @Modifying
    @Query(nativeQuery = true, value = """
            UPDATE ticket_types
               SET sold = sold + :qty, version = version + 1
             WHERE id = :id AND sold + :qty <= total_available
            """)
    int reserveAtomically(@Param("id") UUID id, @Param("qty") int qty);

    /** OPTIMISTIC, step 1 — read the current numbers (fresh from the database, not the cached entity). */
    @Query(nativeQuery = true, value = """
            SELECT sold, total_available AS "totalAvailable", version
              FROM ticket_types
             WHERE id = :id
            """)
    StockSnapshot snapshot(@Param("id") UUID id);

    /**
     * OPTIMISTIC, step 2 — write only if nobody changed the row since we read it (same version).
     * Returns 1 on success, 0 if someone was faster (then we read again and retry).
     */
    @Modifying
    @Query(nativeQuery = true, value = """
            UPDATE ticket_types
               SET sold = :newSold, version = version + 1
             WHERE id = :id AND version = :expectedVersion
            """)
    int compareAndSet(@Param("id") UUID id, @Param("newSold") int newSold, @Param("expectedVersion") long expectedVersion);

    interface StockSnapshot {
        int getSold();

        int getTotalAvailable();

        long getVersion();
    }
}
