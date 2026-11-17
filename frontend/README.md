# TicketRush — Frontend

Next.js 16 + TypeScript. English (default) and Korean, light / dark / system theme.

## Run
```bash
cp .env.example .env.local   # BACKEND_URL=http://localhost:8080
npm install
npm run dev                  # http://localhost:3000 (backend must be running)
```

| Script | What it does |
|--------|--------------|
| `npm run dev` | Dev server |
| `npm run build` / `start` | Production build / server |
| `npm test` | Vitest unit + component tests |
| `npm run lint` / `typecheck` / `format` | ESLint / `tsc` / Prettier |

## Folder structure (Feature-Sliced Design, light)
Each layer may import only from layers **below** it: `app → widgets → features → entities → shared`.

```
src/
├── app/        Routes (Next.js App Router). Thin pages that put pieces together.
├── widgets/    Big UI blocks used on many pages (header, footer).
├── features/   User actions: auth, order (buy panel), event-form, check-in, ticket card.
├── entities/   Business objects: event, ticket/order — API calls, query keys, badges.
└── shared/     No business meaning: http client, types, session + prefs stores, i18n, UI kit, formatters.
```

## Key decisions
| Topic | Choice | Why |
|-------|--------|-----|
| Public pages | **Server Components** fetch Spring directly | Data is in the first HTML → fast first paint, SEO for event pages |
| Logged-in pages | Client Components + **TanStack Query** | Caching, loading/error states, refetch after mutations |
| Server vs client state | TanStack Query = server data, **Zustand** = only the login token | Don't copy server data into a global store |
| API calls | Browser → `/api/*` → Next.js rewrite → Spring | Same origin, so no CORS setup in Spring |
| Forms | React Hook Form + Zod, same rules as the backend's `@Valid` | Instant feedback, fewer bad requests |
| Query keys | Key factory per entity (`organizerEventKeys`) | Easy, correct invalidation |
| Time | Everything shown in `Asia/Seoul`; server passes "now" to the client | No hydration mismatch, correct countdown |
| Hydration | `useMounted()` before reading localStorage | Server HTML never shows a logged-in UI by mistake |
| Accessibility | Labels, `aria-invalid`, `role="alert"`, live regions on the gate screen | Usable with screen readers and keyboard-only scanners |
| Fonts | Space Grotesk (headlines) + Pretendard (body, Korean) | Bold display look; Pretendard is the standard Korean UI font |
| Languages | Own tiny i18n: `shared/i18n/en.ts` + `ko.ts`, `useT()` hook | No library needed; TypeScript fails the build if a Korean key is missing |
| Theme | CSS variables + `dark` class, Light / Dark / System | One set of color tokens; an inline script sets the theme before paint (no white flash) |
| Preferences | Zustand `persist` → localStorage (`ticketrush-prefs`) | Language and theme survive reloads |

## Design system
- **Personality:** concert-night energy. Electric violet (`accent`), coral (`hot`) and a lime "volt"
  highlighter on warm paper (light) or deep ink (dark).
- **Tokens:** `src/app/globals.css` → `bg, surface, surface-2, ink, muted, line, accent, hot, volt, success, danger, warn`.
  Use them as Tailwind classes (`bg-surface`, `text-muted`, `bg-volt`...). Never hard-code colors in components.
- **Signature pieces:** ticket-stub cards with side notches (`.ticket-notch`), generated "poster"
  gradients per event (`posterColors(id)`), a scrolling ticker, a countdown to ticket open, bento sales dashboard.
- **Motion:** small rise/pop animations, turned off for users with "reduce motion".

## Known limits (future versions)
- Language is a client preference, so the first paint is English and switches to Korean right after
  hydration. A cookie read on the server would remove that flash.
- The JWT is kept in `localStorage` (simple, but readable by XSS). A later version can move it to an
  `httpOnly` cookie set by a Next.js Route Handler.
- No E2E tests yet (Playwright is planned with v3 CI).
