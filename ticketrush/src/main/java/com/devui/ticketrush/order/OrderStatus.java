package com.devui.ticketrush.order;

/** v1 creates orders as PAID. PENDING and EXPIRED are used from v5 (payment + 5-minute hold). */
public enum OrderStatus {
    PENDING,
    PAID,
    CANCELLED,
    EXPIRED
}
