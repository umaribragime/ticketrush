package com.devui.ticketrush.checkin;

import com.devui.ticketrush.auth.CurrentUser;
import com.devui.ticketrush.checkin.dto.ValidateTicketRequest;
import com.devui.ticketrush.checkin.dto.ValidationResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Always 200: an INVALID scan is a normal result for the gate, not a server error.
 * Staff membership is checked against the event in the database, not the token.
 */
@Tag(name = "Check-in (staff)")
@RestController
@RequestMapping("/api/v1/events/{eventId}/validations")
@RequiredArgsConstructor
public class CheckInController {

    private final CheckInService checkInService;

    @PostMapping
    public ValidationResponse validate(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID eventId,
                                       @Valid @RequestBody ValidateTicketRequest request) {
        return checkInService.validate(CurrentUser.id(jwt), eventId, request);
    }
}
