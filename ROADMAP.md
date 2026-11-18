# TicketRush — Roadmap

Goal: a ticketing backend that survives "ticket open" day, built to match what
Korean companies ask for (Saramin research, Nov 2026).

## Target: what companies ask for (our checklist)
Tick a box only when you have proof AND can explain it in an interview.

**Must have (자격요건)**
- [x] Java + Spring Boot — all versions
- [x] REST API design — v1
- [ ] RDBMS: table design, joins, aggregation SQL — v1, v7
- [x] JPA / Hibernate — v1, v2 *(v1 part done)*
- [ ] Git, clean commits, PRs — every version

**Extra points (우대사항)**
- [ ] Test code (unit + integration) — every version, focus v1–v3
- [x] Spring Security + JWT login — v1
- [ ] Concurrency / large traffic (동시성, 대용량 트래픽) — v2, v4, v8
- [ ] Docker + CI/CD (GitHub Actions) — v3
- [ ] Redis cache + waiting queue — v4
- [ ] Payment / order flow (주문·결제) — v5
- [ ] Kafka / message queue — v6
- [ ] Performance: index + query tuning, EXPLAIN, load test — v7
- [ ] Monitoring (Prometheus, Grafana) — v7
- [ ] Using AI in the product (LLM API) — v9
- [ ] AWS deploy — v10
- [x] Frontend attached (React / Next.js + TypeScript) — done early with v1
- [ ] Using AI tools well: you review and fix what AI writes yourself — every version

## Rules
- After each version, update `index.html` (the visual map): the `DATA` block at the bottom + the stats at the top.
- One brick at a time. Each version solves ONE real problem.
- Every version ends with **proof**: a test, a number, or a screenshot.
- Every version gets a section in `NOTES.md`: problem → what I tried → result → what I learned.
- Design first (`DESIGN.md`), then code.

## Versions

| Ver | Problem to solve | You learn | Proof |
|-----|------------------|-----------|-------|
| v1 | The core app works | REST, JPA relations, validation, errors, Security + JWT, roles | Integration tests for each flow |
| v2 | 1,000 people buy 100 tickets at once → **overselling** | Transactions, pessimistic / optimistic lock, atomic UPDATE | 1,000-thread test: exactly 100 sold |
| v3 | "Works on my machine" | Docker, Testcontainers, GitHub Actions | Green CI badge |
| v4 | Server floods at ticket open | Redis cache, Redis **waiting queue (대기열)** | Load test numbers before/after |
| v5 | Users hold tickets but never pay | 5-min hold, payment (Toss sandbox), scheduler, idempotency | Expired order returns stock |
| v6 | Purchase is slow (email, QR image...) | Kafka, async events, outbox pattern | Response time before/after |
| v7 | "Where is it slow? Is it healthy?" | k6, indexes, EXPLAIN, Prometheus + Grafana | Dashboard + query time before/after |
| v8 | Users want to pick their seat | Venue/Section/Seat, seat-level locking | Two users, one seat → one wins |
| v9 | Users have questions about events | Spring AI: event Q&A assistant | Demo |
| v10 | Nobody can see it | AWS deploy (frontend already built in v1) | Live URL |

## v1 bricks (in order)
- [x] 1. Create the project (Spring Initializr) + PostgreSQL in docker-compose → app starts
- [x] 2. Entities from DESIGN.md → tables appear in the DB (Flyway migration)
- [x] 3. Organizer creates / updates / publishes an event with ticket types
- [x] 4. Anyone lists published events (with paging) and sees one event
- [x] 5. Attendee buys tickets → Order + Tickets (simple way, no locking yet)
- [x] 6. Attendee sees "my tickets" with QR code
- [x] 7. Staff validates a ticket by QR (second scan must fail)
- [x] 8. Sign up / login with JWT, and roles protect each endpoint

## Status
- [x] v1 — done 2026-11-18 (21 integration tests, runs on PostgreSQL 17)
- [x] v1 frontend — done 2026-11-18 (Next.js 16, 15 tests, tested in the browser against the real backend)
- [ ] v2 — next: overselling under concurrency
