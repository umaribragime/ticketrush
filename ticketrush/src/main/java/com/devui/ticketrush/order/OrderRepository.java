package com.devui.ticketrush.order;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {

    @EntityGraph(attributePaths = {"event"})
    Page<Order> findByUserId(UUID userId, Pageable pageable);

    @EntityGraph(attributePaths = {"event", "tickets", "tickets.ticketType", "tickets.qrCode"})
    Optional<Order> findDetailedById(UUID id);
}
