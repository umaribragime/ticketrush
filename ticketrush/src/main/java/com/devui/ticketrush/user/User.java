package com.devui.ticketrush.user;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.EnumSet;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

/**
 * One user can have many roles (ATTENDEE, ORGANIZER, STAFF).
 * We use roles instead of inheritance because one person can play several parts.
 */
@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    private Set<Role> roles = new HashSet<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public User(String name, String email, String passwordHash, Set<Role> roles) {
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        this.roles = roles.isEmpty() ? EnumSet.noneOf(Role.class) : EnumSet.copyOf(roles);
    }

    public void grantRole(Role role) {
        roles.add(role);
    }

    public boolean hasRole(Role role) {
        return roles.contains(role);
    }

    public void rename(String name) {
        this.name = name;
    }

    /** Takes an already-hashed password: the entity never sees the plain text. */
    public void changePasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }
}
