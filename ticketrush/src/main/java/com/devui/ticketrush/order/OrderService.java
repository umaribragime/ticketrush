package com.devui.ticketrush.order;

import com.devui.ticketrush.common.exception.BusinessException;
import com.devui.ticketrush.common.exception.ErrorCode;
import com.devui.ticketrush.common.web.PageResponse;
import com.devui.ticketrush.event.Event;
import com.devui.ticketrush.event.EventRepository;
import com.devui.ticketrush.event.TicketType;
import com.devui.ticketrush.order.dto.OrderResponse;
import com.devui.ticketrush.order.dto.OrderSummaryResponse;
import com.devui.ticketrush.order.dto.PlaceOrderRequest;
import com.devui.ticketrush.ticket.Ticket;
import com.devui.ticketrush.user.User;
import com.devui.ticketrush.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final Clock clock;

    @Value("${app.order.max-tickets-per-order:4}")
    private int maxTicketsPerOrder;

    /**
     * Buy tickets.
     * v1: no payment yet, so the order is PAID right away.
     * v1: stock check is "read → check → write" with no lock. Under heavy load this
     *     can sell more tickets than exist. Fixing this is v2.
     */
    @Transactional
    public OrderResponse placeOrder(UUID userId, PlaceOrderRequest request) {
        Map<UUID, Integer> quantities = mergeItems(request);
        int totalQuantity = quantities.values().stream().mapToInt(Integer::intValue).sum();
        if (totalQuantity > maxTicketsPerOrder) {
            throw new BusinessException(ErrorCode.ORDER_LIMIT_EXCEEDED,
                    "You can buy at most " + maxTicketsPerOrder + " tickets per order.");
        }

        Event event = eventRepository.findWithTicketTypesById(request.eventId())
                .orElseThrow(() -> new BusinessException(ErrorCode.EVENT_NOT_FOUND));
        if (!event.isOnSale(Instant.now(clock))) {
            throw new BusinessException(ErrorCode.EVENT_NOT_ON_SALE);
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        Map<UUID, TicketType> typesById = event.getTicketTypes().stream()
                .collect(Collectors.toMap(TicketType::getId, Function.identity()));

        Order order = new Order(user, event);
        quantities.forEach((ticketTypeId, quantity) -> {
            TicketType type = typesById.get(ticketTypeId);
            if (type == null) {
                throw new BusinessException(ErrorCode.TICKET_TYPE_NOT_FOUND);
            }
            type.sell(quantity);
            for (int i = 0; i < quantity; i++) {
                order.addTicket(new Ticket(type));
            }
        });
        order.markPaid();
        return OrderResponse.from(orderRepository.saveAndFlush(order));
    }

    public PageResponse<OrderSummaryResponse> myOrders(UUID userId, Pageable pageable) {
        return PageResponse.of(orderRepository.findByUserId(userId, pageable), OrderSummaryResponse::from);
    }

    public OrderResponse myOrder(UUID userId, UUID orderId) {
        return orderRepository.findDetailedById(orderId)
                .filter(o -> o.isOwnedBy(userId)) // other people's orders look "not found"
                .map(OrderResponse::from)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));
    }

    /** Same ticket type twice in one request → add the quantities together. */
    private static Map<UUID, Integer> mergeItems(PlaceOrderRequest request) {
        Map<UUID, Integer> merged = new LinkedHashMap<>();
        request.items().forEach(i -> merged.merge(i.ticketTypeId(), i.quantity(), Integer::sum));
        return merged;
    }
}
