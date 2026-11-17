-- TicketRush v1 schema. See DESIGN.md for the diagram.

CREATE TABLE users (
    id            UUID PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT uk_users_email UNIQUE (email)
);

CREATE TABLE user_roles (
    user_id UUID        NOT NULL REFERENCES users (id),
    role    VARCHAR(20) NOT NULL,
    PRIMARY KEY (user_id, role)
);

CREATE TABLE events (
    id             UUID PRIMARY KEY,
    organizer_id   UUID         NOT NULL REFERENCES users (id),
    name           VARCHAR(200) NOT NULL,
    description    VARCHAR(4000),
    venue          VARCHAR(200) NOT NULL,
    start_at       TIMESTAMP WITH TIME ZONE NOT NULL,
    end_at         TIMESTAMP WITH TIME ZONE NOT NULL,
    sales_start_at TIMESTAMP WITH TIME ZONE NOT NULL,
    sales_end_at   TIMESTAMP WITH TIME ZONE NOT NULL,
    status         VARCHAR(20)  NOT NULL,
    created_at     TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at     TIMESTAMP WITH TIME ZONE NOT NULL
);
CREATE INDEX idx_events_status_start ON events (status, start_at);
CREATE INDEX idx_events_organizer ON events (organizer_id);

CREATE TABLE event_staff (
    event_id UUID NOT NULL REFERENCES events (id),
    user_id  UUID NOT NULL REFERENCES users (id),
    PRIMARY KEY (event_id, user_id)
);

CREATE TABLE ticket_types (
    id              UUID PRIMARY KEY,
    event_id        UUID           NOT NULL REFERENCES events (id),
    name            VARCHAR(100)   NOT NULL,
    price           NUMERIC(12, 2) NOT NULL,
    total_available INTEGER        NOT NULL,
    sold            INTEGER        NOT NULL DEFAULT 0,
    CONSTRAINT ck_ticket_types_total CHECK (total_available > 0),
    CONSTRAINT ck_ticket_types_price CHECK (price >= 0)
);
CREATE INDEX idx_ticket_types_event ON ticket_types (event_id);

CREATE TABLE orders (
    id           UUID PRIMARY KEY,
    user_id      UUID           NOT NULL REFERENCES users (id),
    event_id     UUID           NOT NULL REFERENCES events (id),
    total_amount NUMERIC(12, 2) NOT NULL,
    status       VARCHAR(20)    NOT NULL,
    created_at   TIMESTAMP WITH TIME ZONE NOT NULL,
    expires_at   TIMESTAMP WITH TIME ZONE
);
CREATE INDEX idx_orders_user_created ON orders (user_id, created_at);

CREATE TABLE tickets (
    id             UUID PRIMARY KEY,
    order_id       UUID           NOT NULL REFERENCES orders (id),
    ticket_type_id UUID           NOT NULL REFERENCES ticket_types (id),
    price          NUMERIC(12, 2) NOT NULL,
    status         VARCHAR(20)    NOT NULL,
    created_at     TIMESTAMP WITH TIME ZONE NOT NULL
);
CREATE INDEX idx_tickets_order ON tickets (order_id);
CREATE INDEX idx_tickets_ticket_type ON tickets (ticket_type_id);

CREATE TABLE qr_codes (
    id           UUID PRIMARY KEY,
    ticket_id    UUID        NOT NULL REFERENCES tickets (id),
    qr_value     VARCHAR(64) NOT NULL,
    status       VARCHAR(20) NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT uk_qr_codes_ticket UNIQUE (ticket_id),
    CONSTRAINT uk_qr_codes_value UNIQUE (qr_value)
);

CREATE TABLE ticket_validations (
    id           UUID PRIMARY KEY,
    ticket_id    UUID        REFERENCES tickets (id),
    event_id     UUID        NOT NULL REFERENCES events (id),
    staff_id     UUID        NOT NULL REFERENCES users (id),
    method       VARCHAR(20) NOT NULL,
    status       VARCHAR(20) NOT NULL,
    reason       VARCHAR(50),
    validated_at TIMESTAMP WITH TIME ZONE NOT NULL
);
CREATE INDEX idx_validations_ticket ON ticket_validations (ticket_id);
CREATE INDEX idx_validations_event ON ticket_validations (event_id, validated_at);
