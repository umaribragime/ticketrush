package com.devui.ticketrush.event;

import com.devui.ticketrush.event.dto.TicketTypeSalesRow;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EventRepository extends JpaRepository<Event, UUID> {

    @EntityGraph(attributePaths = {"ticketTypes"})
    Optional<Event> findWithTicketTypesById(UUID id);

    Page<Event> findByStatus(EventStatus status, Pageable pageable);

    Page<Event> findByStatusAndNameContainingIgnoreCase(EventStatus status, String name, Pageable pageable);

    Page<Event> findByOrganizerId(UUID organizerId, Pageable pageable);

    long countByOrganizerId(UUID organizerId);

    /** Sales report: one row per ticket type, counted from the real tickets table (GROUP BY). */
    @Query("""
            select new com.devui.ticketrush.event.dto.TicketTypeSalesRow(
                tt.id, tt.name, tt.price, tt.totalAvailable, count(t.id), sum(t.price))
            from TicketType tt
            left join Ticket t on t.ticketType = tt
                and t.status <> com.devui.ticketrush.ticket.TicketStatus.CANCELLED
            where tt.event.id = :eventId
            group by tt.id, tt.name, tt.price, tt.totalAvailable
            order by tt.price desc
            """)
    List<TicketTypeSalesRow> salesByTicketType(@Param("eventId") UUID eventId);
}
