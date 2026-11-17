package com.devui.ticketrush.checkin;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TicketValidationRepository extends JpaRepository<TicketValidation, UUID> {

    long countByEventIdAndStatus(UUID eventId, ValidationStatus status);
}
