package com.devui.ticketrush.ticket;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface TicketRepository extends JpaRepository<Ticket, UUID> {

    @EntityGraph(attributePaths = {"order", "ticketType", "ticketType.event", "qrCode"})
    Page<Ticket> findByOrder_User_Id(UUID userId, Pageable pageable);

    @EntityGraph(attributePaths = {"order", "order.user", "ticketType", "ticketType.event", "qrCode"})
    Optional<Ticket> findDetailedById(UUID id);

    long countByOrder_User_Id(UUID userId);

    /** Valid tickets for shows that haven't started yet. */
    long countByOrder_User_IdAndStatusAndTicketType_Event_StartAtAfter(
            UUID userId, TicketStatus status, java.time.Instant now);
}
