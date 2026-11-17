# TicketRush 🎫

A concert ticketing backend built to survive **ticket open (티켓 오픈)**: the moment
thousands of fans try to buy a few hundred tickets at the same second.

> Status: **v1 done** (core platform). Next: v2, the overselling problem under heavy load. See [ROADMAP.md](ROADMAP.md).

## Tech stack
Java 21 · Spring Boot 4.1 · Spring Security (JWT, OAuth2 Resource Server) · Spring Data JPA / Hibernate 7 ·
PostgreSQL 17 · Flyway · Docker Compose · springdoc OpenAPI · ZXing (QR) · JUnit 5 + MockMvc

## Features (v1)
| Who | Can do |
|-----|--------|
| Anyone | Browse and search published events (paging) |
| Attendee | Sign up / log in (JWT), buy up to 4 tickets per order, see orders and tickets, get a QR image |
| Organizer | Create / edit (draft only) / publish / cancel events with ticket types, add staff, see a sales report |
| Staff | Scan QR codes at the gate: first scan VALID, later scans INVALID (`ALREADY_USED`) |

## Run it
```bash
docker compose up -d          # PostgreSQL on localhost:5434
cd ticketrush
./mvnw spring-boot:run        # app on localhost:8080
```
- Swagger UI: http://localhost:8080/swagger-ui.html
- Health: http://localhost:8080/actuator/health

## Test it
```bash
cd ticketrush
./mvnw test
```
21 integration tests run the real app (security, JPA, Flyway) against H2 in PostgreSQL mode.

## API overview
| Method | Path | Auth |
|--------|------|------|
| POST | `/api/v1/auth/signup` | – |
| POST | `/api/v1/auth/login` | – |
| GET | `/api/v1/users/me` | any user |
| GET | `/api/v1/events?q=&page=&size=` | – |
| GET | `/api/v1/events/{id}` | – |
| POST/GET | `/api/v1/organizer/events` | ORGANIZER |
| GET/PUT | `/api/v1/organizer/events/{id}` | ORGANIZER (owner) |
| POST | `/api/v1/organizer/events/{id}/publish` · `/cancel` · `/staff` | ORGANIZER (owner) |
| GET | `/api/v1/organizer/events/{id}/sales` | ORGANIZER (owner) |
| POST | `/api/v1/orders` | any user |
| GET | `/api/v1/orders` · `/api/v1/orders/{id}` | owner |
| GET | `/api/v1/tickets` · `/{id}` · `/{id}/qr` | owner |
| POST | `/api/v1/events/{id}/validations` | event staff / organizer |

Errors use RFC 9457 Problem Details with a stable `code`, for example:
```json
{ "status": 409, "title": "Conflict", "detail": "Only 0 'VIP' tickets left.", "code": "TICKET_SOLD_OUT" }
```

## Docs
- [DESIGN.md](DESIGN.md): actors, data model, architecture
- [ROADMAP.md](ROADMAP.md): versions v1–v10 and the job-skills checklist
- [NOTES.md](NOTES.md): what was learned in each version
