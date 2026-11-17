# TicketRush — Notes

One section per version: problem → what was built → result → what to study.

## v1 — Core platform (2026-11-18)

**Problem:** we need a working ticketing app before we can make it fast and safe.

**What was built**
- Package by feature: `auth`, `user`, `event`, `order`, `ticket`, `checkin`, `common`.
- Schema is written by hand in a Flyway migration (`V1__init_schema.sql`). Hibernate only *checks*
  the schema (`ddl-auto: validate`) and never changes it.
- JWT login with Spring's OAuth2 Resource Server (no custom filter). Roles come from the `roles` claim.
- Business rules live inside the entities (`Event.publish()`, `TicketType.sell()`, ...), not in controllers.
- Errors are RFC 9457 Problem Details with a stable `code`.

**Result:** 21 integration tests pass. The app runs on PostgreSQL 17 (the migration applied and Hibernate validated the schema).

**A real bug found by the tests**
`Optional.map(t -> check(t))` where `check` returns `null` for "valid" → `map` turned the
`null` into an empty Optional → `.orElse(NOT_FOUND)` → every valid ticket was rejected.
Lesson: `Optional.map` must never return `null` with a meaning. Fixed with a plain `if`.

**Known weak point (on purpose, this is v2):** `TicketType.sell()` does read → check → write
with no lock. Two buyers at the same moment can both see "1 left" and both buy → overselling.

**To study in the learning phase**
- [ ] Why `open-in-view: false`? What is the N+1 problem, and how do `@EntityGraph` queries avoid it?
- [ ] Why are prices copied into `tickets.price` and `orders.total_amount`?
- [ ] Why does login give the same error for "no such email" and "wrong password"?
- [ ] Why does the QR hold a random token, not the ticket id?
- [ ] Why is an INVALID scan a `200 OK` and not a `4xx`?
- [ ] How does the GROUP BY sales query work (`EventRepository.salesByTicketType`)?
