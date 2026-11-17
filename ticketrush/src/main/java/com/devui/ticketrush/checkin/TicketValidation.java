package com.devui.ticketrush.checkin;

import com.devui.ticketrush.event.Event;
import com.devui.ticketrush.ticket.Ticket;
import com.devui.ticketrush.user.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * Every scan at the gate is saved — valid or not.
 * This is a history (audit log), so we never update rows, only insert.
 */
@Entity
@Table(name = "ticket_validations")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class TicketValidation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /** Null when the scanned QR does not belong to any ticket. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id")
    private Ticket ticket;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "staff_id", nullable = false)
    private User staff;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ValidationMethod method;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ValidationStatus status;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private InvalidReason reason;

    @Column(name = "validated_at", nullable = false)
    private Instant validatedAt;

    public TicketValidation(Ticket ticket, Event event, User staff, ValidationMethod method,
                            InvalidReason reason, Instant validatedAt) {
        this.ticket = ticket;
        this.event = event;
        this.staff = staff;
        this.method = method;
        this.reason = reason;
        this.status = reason == null ? ValidationStatus.VALID : ValidationStatus.INVALID;
        this.validatedAt = validatedAt;
    }
}
