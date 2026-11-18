package com.devui.ticketrush.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Every business error the API can return. The code is stable, so clients can react to it.
 */
@Getter
public enum ErrorCode {

    // auth / user
    EMAIL_ALREADY_USED(HttpStatus.CONFLICT, "This email is already registered."),
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "Email or password is wrong."),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "User not found."),
    CURRENT_PASSWORD_INCORRECT(HttpStatus.BAD_REQUEST, "Current password is wrong."),
    NEW_PASSWORD_SAME_AS_OLD(HttpStatus.BAD_REQUEST, "New password must be different from the current one."),

    // event
    EVENT_NOT_FOUND(HttpStatus.NOT_FOUND, "Event not found."),
    EVENT_ACCESS_DENIED(HttpStatus.FORBIDDEN, "You are not the organizer of this event."),
    EVENT_NOT_EDITABLE(HttpStatus.CONFLICT, "Only DRAFT events can be changed."),
    EVENT_INVALID_STATUS(HttpStatus.CONFLICT, "This action is not allowed in the current event status."),
    EVENT_INVALID_SCHEDULE(HttpStatus.BAD_REQUEST,
            "Dates must follow: salesStartAt < salesEndAt <= startAt < endAt."),
    EVENT_HAS_NO_TICKET_TYPES(HttpStatus.CONFLICT, "An event needs at least one ticket type to be published."),

    // order
    EVENT_NOT_ON_SALE(HttpStatus.CONFLICT, "Tickets for this event are not on sale right now."),
    TICKET_TYPE_NOT_FOUND(HttpStatus.NOT_FOUND, "Ticket type not found for this event."),
    TICKET_SOLD_OUT(HttpStatus.CONFLICT, "Not enough tickets left."),
    ORDER_LIMIT_EXCEEDED(HttpStatus.BAD_REQUEST, "Too many tickets in one order."),
    STOCK_BUSY(HttpStatus.CONFLICT, "Too many people are buying right now. Please try again."),
    ORDER_NOT_FOUND(HttpStatus.NOT_FOUND, "Order not found."),

    // ticket / check-in
    TICKET_NOT_FOUND(HttpStatus.NOT_FOUND, "Ticket not found."),
    NOT_EVENT_STAFF(HttpStatus.FORBIDDEN, "You are not staff for this event."),
    INVALID_VALIDATION_REQUEST(HttpStatus.BAD_REQUEST, "QR scans need qrValue; manual checks need ticketId."),

    // generic
    VALIDATION_FAILED(HttpStatus.BAD_REQUEST, "Request is not valid."),
    ACCESS_DENIED(HttpStatus.FORBIDDEN, "You do not have permission to do this."),
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "Something went wrong.");

    private final HttpStatus status;
    private final String message;

    ErrorCode(HttpStatus status, String message) {
        this.status = status;
        this.message = message;
    }
}
