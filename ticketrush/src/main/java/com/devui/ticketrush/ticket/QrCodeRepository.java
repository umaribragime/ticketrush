package com.devui.ticketrush.ticket;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface QrCodeRepository extends JpaRepository<QrCode, UUID> {

    @EntityGraph(attributePaths = {"ticket", "ticket.ticketType", "ticket.ticketType.event"})
    Optional<QrCode> findByValue(String value);
}
