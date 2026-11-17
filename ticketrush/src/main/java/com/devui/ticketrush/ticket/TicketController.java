package com.devui.ticketrush.ticket;

import com.devui.ticketrush.auth.CurrentUser;
import com.devui.ticketrush.common.web.PageResponse;
import com.devui.ticketrush.ticket.dto.TicketResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "Tickets")
@RestController
@RequestMapping("/api/v1/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @GetMapping
    public PageResponse<TicketResponse> myTickets(
            @AuthenticationPrincipal Jwt jwt,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ticketService.myTickets(CurrentUser.id(jwt), pageable);
    }

    @GetMapping("/{ticketId}")
    public TicketResponse myTicket(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID ticketId) {
        return ticketService.myTicket(CurrentUser.id(jwt), ticketId);
    }

    /** No "produces" here, so errors can still be returned as JSON. */
    @GetMapping("/{ticketId}/qr")
    public ResponseEntity<byte[]> qr(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID ticketId) {
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .body(ticketService.myTicketQrPng(CurrentUser.id(jwt), ticketId));
    }
}
