package com.devui.ticketrush.ticket;

import com.devui.ticketrush.common.exception.BusinessException;
import com.devui.ticketrush.common.exception.ErrorCode;
import com.devui.ticketrush.common.web.PageResponse;
import com.devui.ticketrush.ticket.dto.TicketResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final QrImageGenerator qrImageGenerator;

    public PageResponse<TicketResponse> myTickets(UUID userId, Pageable pageable) {
        return PageResponse.of(ticketRepository.findByOrder_User_Id(userId, pageable), TicketResponse::from);
    }

    public TicketResponse myTicket(UUID userId, UUID ticketId) {
        return TicketResponse.from(getOwned(userId, ticketId));
    }

    public byte[] myTicketQrPng(UUID userId, UUID ticketId) {
        return qrImageGenerator.png(getOwned(userId, ticketId).getQrCode().getValue());
    }

    private Ticket getOwned(UUID userId, UUID ticketId) {
        return ticketRepository.findDetailedById(ticketId)
                .filter(t -> t.getOrder().isOwnedBy(userId))
                .orElseThrow(() -> new BusinessException(ErrorCode.TICKET_NOT_FOUND));
    }
}
