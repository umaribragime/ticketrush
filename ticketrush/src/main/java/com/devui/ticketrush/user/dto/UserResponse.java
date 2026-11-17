package com.devui.ticketrush.user.dto;

import com.devui.ticketrush.user.Role;
import com.devui.ticketrush.user.User;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record UserResponse(UUID id, String name, String email, List<Role> roles, Instant createdAt) {

    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail(),
                user.getRoles().stream().sorted().toList(), user.getCreatedAt());
    }
}
