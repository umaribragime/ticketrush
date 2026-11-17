package com.devui.ticketrush.order;

import com.devui.ticketrush.event.Event;
import com.devui.ticketrush.ticket.Ticket;
import com.devui.ticketrush.user.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/** "Order" (주문). Table name is "orders" because ORDER is a reserved SQL word. */
@Entity
@Table(name = "orders")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    /** Copied at purchase time, so later price changes do not change old orders. */
    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrderStatus status;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "expires_at")
    private Instant expiresAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Ticket> tickets = new ArrayList<>();

    public Order(User user, Event event) {
        this.user = user;
        this.event = event;
        this.status = OrderStatus.PENDING;
    }

    public void addTicket(Ticket ticket) {
        ticket.assignTo(this);
        tickets.add(ticket);
        totalAmount = totalAmount.add(ticket.getPrice());
    }

    public void markPaid() {
        this.status = OrderStatus.PAID;
    }

    public boolean isOwnedBy(UUID userId) {
        return user.getId().equals(userId);
    }
}
