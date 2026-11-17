package com.devui.ticketrush.auth;

import org.springframework.security.oauth2.jwt.Jwt;

import java.util.UUID;

/** The token's "sub" (subject) is the user id. */
public final class CurrentUser {

    private CurrentUser() {
    }

    public static UUID id(Jwt jwt) {
        return UUID.fromString(jwt.getSubject());
    }
}
