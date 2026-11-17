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
