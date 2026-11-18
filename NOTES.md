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

## v1 frontend — Next.js (2026-11-18)

**Why Next.js + TypeScript:** in 14 recent Saramin React job posts, TypeScript and Next.js each
appeared in 6 — the most of any tool. Then Figma, responsive design, AWS/CI/CD, Tailwind.

**What was built:** public event list + detail (server-rendered), signup/login, ticket picker with a
live countdown to ticket open, order result, mobile tickets with QR, organizer list / create / edit /
publish / cancel / sales dashboard / staff, and a gate scanner screen.

**Result:** lint, typecheck, 15 tests and the production build all pass. Clicked through in a real
browser against the real backend: buy → QR → scan VALID → scan again INVALID (ALREADY_USED).

**Bugs found by testing in the browser**
- Login page rendered the form twice (Suspense fallback + real one). Fix: page is now fully static and
  reads `?next=` only on submit.
- Account-type cards showed the wrong selection after a scripted change. Fix: style from the radio's
  real state in CSS (`has-checked:`), so look and value can never disagree.
- Mobile header words wrapped ("공연 / 관리"). Fix: `whitespace-nowrap`, tighter padding.

**To study in the learning phase**
- [ ] Server Component vs Client Component — which pages are which, and why?
- [ ] Why does TanStack Query hold server data, and Zustand only the token?
- [ ] What is a hydration mismatch? Why does `useMounted()` prevent it?
- [ ] How does the `/api` rewrite avoid CORS?
- [ ] What is an "open redirect", and how does `safeRedirect()` stop it?
- [ ] Why is the JWT in localStorage a risk (XSS), and what would an httpOnly cookie change?

## v1 frontend redesign — look, languages, dark mode (2026-11-18)

**What changed:** every page was redesigned with its own visual identity (violet / coral / volt on
paper or ink, ticket-stub cards, generated posters, ticker, countdown, bento dashboard). English is
now the default with a Korean switch, and there is a Light / Dark / System theme.

**How it works**
- Colors are CSS variables. `.dark` swaps the values; components only use token classes.
- An inline script in `<head>` reads the saved theme and sets `class="dark"` before the first paint.
- `useT()` returns text from `en.ts` / `ko.ts`. Zod error messages are keys, translated by `<Field>`.
- Backend error `code`s map to `err.*` keys, so server errors are translated too.

**Result:** lint, typecheck, 21 tests and the build pass. Checked in the browser: EN ↔ KO and
light ↔ dark switch live and survive reloads; purchase flow and dashboard work; no sideways scroll at 375px.

**Bug the linter caught:** JSX built inside `try/catch` (`react-hooks/error-boundaries`). A try/catch
cannot catch rendering errors — only fetch errors. Fixed by fetching in the try and rendering after it.

**To study**
- [ ] Why CSS variables + one `dark` class instead of writing `dark:` on every element?
- [ ] Why does the theme script run before React? What is FOUC ("flash of unstyled content")?
- [ ] Why must `ko.ts` be `Record<MessageKey, string>`? What happens if a key is missing?

## v1 polish — real-user features (2026-11-18)

**What changed**
- Removed developer-only buttons from the UI: TanStack Query Devtools (package uninstalled) and the
  Next.js dev indicator (`devIndicators: false`). Build/runtime errors still show in dev.
- Own tab icon: `src/app/icon.svg` (Next.js picks it up automatically).
- **My account** (`/account`): profile card with roles + member since, ticket/order stats, change name,
  change password, language/theme preferences, log out. Backend: `PATCH /users/me`,
  `PUT /users/me/password`, `GET /users/me/summary` (+ 7 integration tests).
- Avatar **user menu** in the header; a real footer (links, ©, KST note) instead of "portfolio project".
- Logged-in users who open /login or /signup are sent home.

**Design decisions**
- Changing the password requires the current one — a stolen, still-open session can't lock the owner out.
- The header reads the name from `/users/me` (not the JWT), so a rename shows instantly without logging in again.
- Email can't be changed (it's the login ID).

**Known limits**
- JWTs are stateless: after a password change, tokens already issued on *other* devices stay valid
  until they expire (2 h). A token version / refresh-token design would fix this later.

**To study**
- [ ] Why does `UserService.changePassword` check the current password even though the user is logged in?
- [ ] Why is `/users/me` safer than `/users/{id}` for "my data"?
- [ ] Why must `features/` never import from `widgets/` (we moved `Avatar` to `shared/`)?

**Bug: hydration error from date formatting (found 2026-11-18)**
The Next.js error overlay appeared because server HTML and browser HTML had different text:
`Thu, Dec 24, 2026, 19:00 KST` (Node.js) vs `Thu, Dec 24, 2026 at 19:00 KST` (browser).
Cause: `Intl.DateTimeFormat` output depends on the ICU library version, and Node and each browser
ship different versions. Fix: dates are now built by hand from UTC+9 (Korea has no daylight saving),
so server and browser always produce identical text. A unit test pins the exact output.
Lesson: anything rendered on the server must produce the *same string* in the browser —
watch out for `Date.now()`, random values, and locale formatting.
- [ ] To study: what exactly is "hydration", and why does a one-character difference break it?

## v2 — Overselling under concurrency (2026-11-18)

**Problem (proven first):** a race test fires 1,000 "buy 1 VIP" attempts at 100 seats, all released at
the same instant (CountDownLatch), on a real PostgreSQL 17 (Testcontainers). v1 result:
**1,000 successful orders, 1,000 tickets, and `sold` = 30.** Two bugs in one: overselling AND lost updates
(many transactions read the same `sold`, each wrote its own +1, erasing the others).

**Fix: `order/stock/StockService` with 3 safe strategies (+ the naive one for the demo)**
| Strategy | How | Result (1,000 → 100) | Time |
|---|---|---|---|
| NAIVE (v1) | read → check in Java → write | ❌ 1,000 tickets | 2207 ms |
| PESSIMISTIC | `refresh(type, PESSIMISTIC_WRITE)` = `SELECT … FOR UPDATE` + fresh read | ✅ 100 | 1050 ms |
| OPTIMISTIC | read `sold, version` → `UPDATE … WHERE version = ?` → retry (max 30, random back-off) | ✅ 100 | 886 ms |
| **ATOMIC** (default) | `UPDATE … SET sold = sold + :q WHERE sold + :q <= total_available` | ✅ 100 | 924 ms |

**Details that matter (interview gold)**
- Pessimistic: a locked query would return the *already cached* entity with the old `sold`.
  `EntityManager.refresh(..., PESSIMISTIC_WRITE)` locks AND reloads. Without the reload it still oversells.
- Atomic: PostgreSQL row-locks during the UPDATE; a waiting UPDATE re-checks its WHERE against the new
  committed value (READ COMMITTED), so it can't pass the limit.
- Ticket types are reserved in sorted id order → no deadlocks between multi-type orders.
- `CHECK (0 <= sold <= total_available)` is a safety net, NOT a fix: in a lost update the counter goes
  down, so the CHECK never fires while extra tickets are created.
- Race tests run on PostgreSQL, not H2: locking/isolation differ, H2 could hide the bug.
- Optimistic can say "busy" (STOCK_BUSY, 409) under a huge rush even if seats remain — the trade-off.
- Lock/deadlock failures from the DB map to STOCK_BUSY instead of a 500.

**Commands**
- `./mvnw test` — includes the 3 safe race tests (assert: never oversell).
- `./mvnw test -Ddemo` — runs the naive demo on purpose. Results table: `target/race-results.md`.
- `STOCK_STRATEGY=PESSIMISTIC` (etc.) to run the app with another strategy.

**Next problem (v4):** with 100,000 buyers the hot row itself becomes the bottleneck → waiting queue in Redis.

**To study** — see lesson 6 in index.html (Race Lab + interview questions).
