# TicketRush 🎫

A concert ticketing platform built to survive **ticket open (티켓 오픈)**: the moment
thousands of fans try to buy a few hundred tickets at the same second.

> Status: **v2 done**: overselling fixed and proven. 1,000 buyers vs 100 seats on real PostgreSQL: v1 sold 1,000 tickets, v2 sells exactly 100. Next: v3 (Docker + CI).
> See [ROADMAP.md](ROADMAP.md).

```
ticket-rush/
├── ticketrush/          Spring Boot backend (REST API)
├── frontend/            Next.js frontend (English + Korean, light/dark)
├── docker-compose.yaml  PostgreSQL
├── index.html           Visual map of the whole app (open in a browser)
└── README / DESIGN / ROADMAP / NOTES
```

## Tech stack
**Backend:** Java 21 · Spring Boot 4.1 · Spring Security (JWT, OAuth2 Resource Server) · Spring Data JPA / Hibernate 7 ·
PostgreSQL 17 · Flyway · springdoc OpenAPI · ZXing (QR) · JUnit 5 + MockMvc · Testcontainers

**Frontend:** Next.js 16 (App Router, Server Components, Partial Prerendering) · React 19 · TypeScript ·
TanStack Query · Zustand · React Hook Form + Zod · Tailwind CSS 4 (design tokens, dark mode) · Axios ·
Vitest + Testing Library · lucide icons · Space Grotesk + Pretendard · own EN/KO i18n · Feature-Sliced Design

## Features (v1)
| Who | Can do |
|-----|--------|
| Anyone | Browse and search published events (server-rendered, SEO friendly), see a live countdown to ticket open |
| Attendee | Sign up / log in (JWT), pick tickets (max 4), buy, see orders and mobile tickets with QR |
| Organizer | Create / edit (draft only) / publish / cancel events, live sales dashboard, add staff |
| Staff | Gate screen for QR scanners: first scan **Let them in**, later scans **Denied · Already checked in** |
| Everyone | English (default) or Korean, light / dark / system theme — saved per browser |
| Account | User menu with avatar · **My account** page: profile, change name, change password, ticket/order stats, preferences, log out |

## v2 — surviving ticket open (concurrency)
1,000 simultaneous buy attempts for 100 VIP seats, on a real PostgreSQL (Testcontainers):

| Strategy | Successful orders | Ticket rows | Result |
|----------|------------------:|------------:|--------|
| v1 naive (read → check → write) | 1000 | 1000 | **oversold ×10** (and `sold` said 30: lost updates) |
| Pessimistic lock (`SELECT … FOR UPDATE`) | 100 | 100 | ✅ |
| Optimistic CAS (version + retry) | 100 | 100 | ✅ |
| **Atomic conditional `UPDATE`** (default) | 100 | 100 | ✅ |

Code: `order/stock/StockService.java`. Choose with `STOCK_STRATEGY` (default `ATOMIC`). Safety net: `CHECK (0 ≤ sold ≤ total_available)`.
Explore it interactively in the **Race Lab** in [index.html](index.html).

## Run it
```bash
docker compose up -d                          # 1. PostgreSQL on :5434 + Adminer on :8081
cd ticketrush && ./mvnw spring-boot:run       # 2. backend on localhost:8080
cd frontend && npm install && npm run dev     # 3. frontend on localhost:3000
```
- App: http://localhost:3000
- Swagger UI: http://localhost:8080/swagger-ui.html
- Database viewer (Adminer): http://localhost:8081 — System **PostgreSQL**, Server `postgres`, Username / Password / Database `ticketrush`

## Test it
```bash
cd ticketrush && ./mvnw test        # 31 backend tests, incl. 3 race tests on real PostgreSQL (Docker must run)
cd ticketrush && ./mvnw test -Ddemo # the v1 overselling demo (expected to oversell)
cd frontend && npm test             # 25 frontend unit/component tests
cd frontend && npm run lint && npm run typecheck && npm run build
```

## API overview
| Method | Path | Auth |
|--------|------|------|
| POST | `/api/v1/auth/signup` | – |
| POST | `/api/v1/auth/login` | – |
| GET · PATCH | `/api/v1/users/me` | any user (own data) |
| PUT | `/api/v1/users/me/password` | any user (needs current password) |
| GET | `/api/v1/users/me/summary` | any user (ticket / order counts) |
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
The frontend maps each `code` to an English or Korean message (`frontend/src/shared/i18n`).

## Docs
- **[index.html](index.html): the visual project map** — open it in a browser: architecture, step-by-step request flows, folders, pages, API, data model
- [DESIGN.md](DESIGN.md): actors, data model, architecture (backend + frontend)
- [ROADMAP.md](ROADMAP.md): versions v1–v10 and the job-skills checklist
- [NOTES.md](NOTES.md): what was learned in each version
- [frontend/README.md](frontend/README.md): frontend structure and decisions
