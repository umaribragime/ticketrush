package com.devui.ticketrush.auth.dto;

public record TokenResponse(String accessToken, String tokenType, long expiresIn) {
}
