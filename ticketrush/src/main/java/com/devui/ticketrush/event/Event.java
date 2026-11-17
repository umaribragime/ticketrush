package com.devui.ticketrush.event;

import com.devui.ticketrush.common.exception.BusinessException;
import com.devui.ticketrush.common.exception.ErrorCode;
import com.devui.ticketrush.user.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "events")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "organizer_id", nullable = false)
    private User organizer;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 4000)
    private String description;

    @Column(nullable = false, length = 200)
    private String venue;

    @Column(name = "start_at", nullable = false)
    private Instant startAt;

    @Column(name = "end_at", nullable = false)
    private Instant endAt;

    /** The "ticket open" moment. */
    @Column(name = "sales_start_at", nullable = false)
    private Instant salesStartAt;

    @Column(name = "sales_end_at", nullable = false)
    private Instant salesEndAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EventStatus status;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("price DESC")
    private List<TicketType> ticketTypes = new ArrayList<>();

    @ManyToMany
    @JoinTable(name = "event_staff",
            joinColumns = @JoinColumn(name = "event_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id"))
    private Set<User> staff = new HashSet<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public Event(User organizer, String name, String description, String venue,
                 Instant startAt, Instant endAt, Instant salesStartAt, Instant salesEndAt) {
        this.organizer = organizer;
        this.status = EventStatus.DRAFT;
        changeDetails(name, description, venue, startAt, endAt, salesStartAt, salesEndAt);
    }

    public void update(String name, String description, String venue,
                       Instant startAt, Instant endAt, Instant salesStartAt, Instant salesEndAt) {
        requireDraft();
        changeDetails(name, description, venue, startAt, endAt, salesStartAt, salesEndAt);
    }

    public void replaceTicketTypes(List<TicketType> newTypes) {
        requireDraft();
        ticketTypes.clear();
        newTypes.forEach(this::addTicketType);
    }

    public void addTicketType(TicketType ticketType) {
        ticketType.assignTo(this);
        ticketTypes.add(ticketType);
    }

    public void publish() {
        if (status != EventStatus.DRAFT) {
            throw new BusinessException(ErrorCode.EVENT_INVALID_STATUS);
        }
        if (ticketTypes.isEmpty()) {
            throw new BusinessException(ErrorCode.EVENT_HAS_NO_TICKET_TYPES);
        }
        status = EventStatus.PUBLISHED;
    }

    public void cancel() {
        if (status == EventStatus.CANCELLED) {
            throw new BusinessException(ErrorCode.EVENT_INVALID_STATUS);
        }
        status = EventStatus.CANCELLED;
    }

    public boolean isOnSale(Instant now) {
        return status == EventStatus.PUBLISHED
                && !now.isBefore(salesStartAt)
                && now.isBefore(salesEndAt);
    }

    public boolean isOrganizedBy(UUID userId) {
        return organizer.getId().equals(userId);
    }

    public boolean isStaff(UUID userId) {
        return staff.stream().anyMatch(u -> u.getId().equals(userId));
    }

    public void addStaff(User user) {
        staff.add(user);
    }

    private void requireDraft() {
        if (status != EventStatus.DRAFT) {
            throw new BusinessException(ErrorCode.EVENT_NOT_EDITABLE);
        }
    }

    private void changeDetails(String name, String description, String venue,
                               Instant startAt, Instant endAt, Instant salesStartAt, Instant salesEndAt) {
        boolean validSchedule = salesStartAt.isBefore(salesEndAt)
                && !salesEndAt.isAfter(startAt)
                && startAt.isBefore(endAt);
        if (!validSchedule) {
            throw new BusinessException(ErrorCode.EVENT_INVALID_SCHEDULE);
        }
        this.name = name;
        this.description = description;
        this.venue = venue;
        this.startAt = startAt;
        this.endAt = endAt;
        this.salesStartAt = salesStartAt;
        this.salesEndAt = salesEndAt;
    }
}
