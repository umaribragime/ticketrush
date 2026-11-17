package com.devui.ticketrush.order;

import com.devui.ticketrush.auth.CurrentUser;
import com.devui.ticketrush.common.web.PageResponse;
import com.devui.ticketrush.order.dto.OrderResponse;
import com.devui.ticketrush.order.dto.OrderSummaryResponse;
import com.devui.ticketrush.order.dto.PlaceOrderRequest;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "Orders")
@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse place(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody PlaceOrderRequest request) {
        return orderService.placeOrder(CurrentUser.id(jwt), request);
    }

    @GetMapping
    public PageResponse<OrderSummaryResponse> myOrders(
            @AuthenticationPrincipal Jwt jwt,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return orderService.myOrders(CurrentUser.id(jwt), pageable);
    }

    @GetMapping("/{orderId}")
    public OrderResponse myOrder(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID orderId) {
        return orderService.myOrder(CurrentUser.id(jwt), orderId);
    }
}
