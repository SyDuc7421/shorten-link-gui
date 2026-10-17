# CLAUDE.md

Operating rules for AI agents working in this repository. Read this file and
`DESIGN.md` before writing code. If a rule here conflicts with a habit you have,
this file wins.

---

## 1. What this repository is

A **reusable frontend template**. It contains structure, tooling and conventions
only — **no business logic, no domain models, no product features**.

When you generate code:

- Do not invent a domain (no "users", "orders", "dashboard") unless asked.
- Do not add a dependency to solve a problem that has not appeared yet.
- Anything domain-specific belongs in `src/features/<feature>/`, never in
  `src/lib`, `src/components/common`, or the root config.

## 2. Stack

| Concern      | Choice                                           |
| ------------ | ------------------------------------------------ |
| Framework    | Next.js (App Router, RSC, Turbopack)             |
| Language     | TypeScript, `strict` on                          |
| UI           | shadcn/ui (new-york) on Radix                    |
| Styling      | Tailwind CSS v4, CSS-first `@theme` tokens       |
| Icons        | lucide-react                                     |
| Server state | TanStack Query                                   |
| Client state | React state → URL → Zustand (last resort)        |
| Forms        | react-hook-form + Zod resolver                   |
| i18n         | next-intl v4, English (`en`) shipped by default  |
| Toasts       | sonner                                           |
| Unit tests   | Vitest + Testing Library                         |
| E2E          | Playwright                                       |
| Quality gate | ESLint, Prettier, Husky, lint-staged, commitlint |
| Package mgr  | pnpm                                             |

## 3. Commands

```bash
pnpm dev            # dev server
pnpm build          # production build
pnpm typecheck      # tsc --noEmit
pnpm lint           # eslint
pnpm format         # prettier --write
pnpm test           # vitest run
pnpm test:e2e       # playwright
pnpm verify         # typecheck + lint + format:check + test  ← run before you report done
pnpm i18n:check     # every locale file matches messages/en.json
pnpm ui:add <name>  # add a shadcn component
pnpm ui:diff        # check shadcn components against upstream
```

**Never** report a task as finished without a passing `pnpm verify`. If you
cannot run it, say so explicitly instead of assuming.

## 4. Where code goes

| You are writing…                         | Put it in                       |
| ---------------------------------------- | ------------------------------- |
| A route, layout, metadata, params        | `src/app/[locale]/**`           |
| User-facing text of any kind             | `messages/en.json`              |
| Locale list, routing, navigation helpers | `src/i18n/`                     |
| A generated design-system primitive      | `src/components/ui/` (CLI only) |
| A reusable presentational component      | `src/components/common/`        |
| App shell: header, sidebar, footer       | `src/components/layout/`        |
| Anything tied to one product capability  | `src/features/<feature>/`       |
| A cross-feature hook                     | `src/hooks/`                    |
| Framework-agnostic helper, http, env     | `src/lib/`                      |
| A React context provider                 | `src/providers/`                |
| App-wide constants                       | `src/config/`                   |
| App-wide types                           | `src/types/`                    |

Decision rule: **if only one feature uses it, it lives in that feature.**
Promote to shared only on the second consumer, not in anticipation of one.

Route files stay thin. A `page.tsx` resolves params, sets metadata, fetches, and
composes feature components. Business rules do not live in `src/app`.

## 5. Server and client components

- Server Component is the **default**. Add `'use client'` only when you need
  state, effects, event handlers, browser APIs, or a client-only library.
- Push `'use client'` **down the tree**, never up. Making a layout or page a
  client component to fix one interactive child is a bug.
- Never place `'use client'` on `layout.tsx` or `page.tsx`. Wrap the interactive
  part in its own client component instead.
- Fetch on the server when the data is needed for first paint. Use TanStack Query
  for data that is client-owned (polling, mutations, optimistic updates,
  infinite lists).
- Server-only secrets are never imported into a file that a client component can
  reach. Everything a client touches is under `NEXT_PUBLIC_*` and read via
  `@/lib/env`.

## 6. TypeScript rules

- `any` is forbidden — lint fails on it. Use `unknown` plus a narrow.
- No non-null assertion (`!`) to silence the compiler. Handle the empty case.
- Validate every external boundary with Zod: API responses, `searchParams`,
  form input, environment variables. Do not trust a hand-written interface for
  data you did not produce.
- `import type { X }` for type-only imports (enforced).
- Named exports everywhere. Default exports only where Next.js requires them
  (`page`, `layout`, `error`, `not-found`, `loading`, `route`, config files).
- Props interfaces are named `<Component>Props` and declared next to the
  component.

## 7. Internationalisation

Every user-facing string goes through next-intl. There are no hardcoded
sentences in components — the linter flags JSX text of four or more letters.

**Layout of the system**

| File                     | Owns                                                        |
| ------------------------ | ----------------------------------------------------------- |
| `src/i18n/routing.ts`    | The locale list, default locale and prefix strategy         |
| `src/i18n/request.ts`    | Loading messages per request (must return `locale`)         |
| `src/i18n/navigation.ts` | Locale-aware `Link`, `redirect`, `usePathname`, `useRouter` |
| `src/proxy.ts`           | Locale negotiation at the network boundary                  |
| `messages/en.json`       | The reference locale — every key starts here                |
| `global.d.ts`            | Types `t()` against `en.json`, so a wrong key fails `tsc`   |

**Rules**

- Read strings with `useTranslations` (client / sync server components) or
  `await getTranslations` (async server components).
- Namespace by screen or concern (`home`, `states`, `errors`, `validation`).
  Do not create one flat namespace, and do not build keys dynamically —
  `t(\`status.${value}\`)` defeats the type checking and the sync script.
- Interpolate, never concatenate: `t('minLength', { count: 8 })`, not
  `t('use') + ' ' + n`. Plurals and ordinals use ICU syntax inside the message.
- Import `Link`, `redirect`, `usePathname` and `useRouter` from
  `@/i18n/navigation`. The `next/link` and `next/navigation` originals are
  blocked by ESLint because they lose the locale.
- Every page and layout under `[locale]` calls `setRequestLocale(locale)` before
  reading translations, or the route silently opts out of static rendering.
- Format dates, numbers and currency with `useFormatter` / `getFormatter` —
  never `toLocaleString()` with a hardcoded locale.
- `messages/en.json` is the contract. Adding a key means adding it to `en.json`
  first; `pnpm i18n:check` fails when another locale drifts.

**Adding a locale** (the template ships English only, by design)

1. Add the code to `routing.locales` in `src/i18n/routing.ts`.
2. Copy `messages/en.json` to `messages/<code>.json` and translate the values.
   Keys and `{placeholders}` must match exactly.
3. Switch `localePrefix` to `'always'` so both locales get a URL prefix.
4. Run `pnpm i18n:check`.

Nothing else changes — no component, route or config edit is needed.

**Two files render outside the locale provider** — `src/app/not-found.tsx` and
`src/app/global-error.tsx`. Their copy is hardcoded on purpose; keep it minimal.

## 8. Styling rules

`DESIGN.md` is the full contract; read §1 (rules for generating UI) and §5
(decision trees) before building any screen, and §6 before creating any
component — it almost certainly already exists. The non-negotiables:

- **Tokens only.** No hex values, no `rgb()`, no arbitrary colour in JSX. Use
  `bg-background`, `text-muted-foreground`, `border-border`, and so on. New
  colours are added to `src/app/globals.css`, nowhere else.
- **No inline `style`** — the linter blocks it. The one exception is a value that
  can only be computed at runtime (a measured width, a chart coordinate);
  comment why.
- Compose classes with `cn()`; never build class strings by concatenation.
- Component variants use `cva`, not a chain of ternaries.
- Spacing uses the 4px scale. Arbitrary pixel values are blocked by ESLint.
- Layout comes from flex/grid + gap. Do not space siblings with margins.
- **Mobile-first.** Base styles target 360px; add `sm:`/`md:`/`lg:` upward.
  `max-md:` is blocked — if you are undoing desktop styles, the order is wrong.
- **One markup tree.** Never render the same content twice and hide one copy
  with `hidden md:block`. Make the component reflow instead — `DESIGN.md` §8.1.
- `h-dvh`, never `h-screen`. `w-full`, never `w-screen`. Both are lint errors.
- `min-w-0` on any flex child that needs to shrink or truncate — this is the
  single most common cause of horizontal overflow.

## 9. Naming

| Thing                      | Convention                  | Example                    |
| -------------------------- | --------------------------- | -------------------------- |
| Files and folders          | kebab-case                  | `user-menu.tsx`            |
| Components                 | PascalCase                  | `UserMenu`                 |
| Hooks                      | `use` + camelCase           | `useMediaQuery`            |
| Booleans                   | `is/has/can/should`         | `isLoading`, `canEdit`     |
| Handlers (prop / internal) | `onX` / `handleX`           | `onSubmit`, `handleSubmit` |
| Constants                  | SCREAMING_SNAKE             | `MAX_PAGE_SIZE`            |
| Test files                 | `*.test.tsx` next to source | `empty-state.test.tsx`     |

## 10. Every screen ships five states

A feature is incomplete until all five exist. Reviewers reject work that only
handles the happy path.

1. **Loading** — skeleton matching the final layout (`loading.tsx` or `<Suspense>`).
2. **Empty** — `<EmptyState>`, structured per `DESIGN.md` §13.
3. **Error** — `<ErrorState>` or `error.tsx` saying what failed and how to recover.
4. **Permission / availability** — `<PermissionState>`. The user _cannot_ act;
   nothing failed. Never style this as an error — `DESIGN.md` §10.
5. **Success** — the actual content.

Async behaviour beyond loading — optimistic updates, rollback, retry, conflicts,
offline — follows `DESIGN.md` §12.

## 11. Accessibility floor

Non-negotiable, checked in review:

- Every interactive element is reachable and operable by keyboard, with a
  visible focus ring (global `:focus-visible` is already set).
- Semantic elements: `button` for actions, `a` for navigation. Never a clickable `div`.
- Every input has a `<label>`; icon-only buttons carry an accessible name.
- Text contrast ≥ 4.5:1, touch targets ≥ 44×44px.
- Images have `alt`; decorative images have `alt=""`.
- `prefers-reduced-motion` is respected (already handled globally).

## 12. Git workflow

- Conventional Commits, enforced by commitlint:
  `feat(auth): add password reset form`
- Branches: `feat/`, `fix/`, `chore/` + short slug.
- Hooks: `pre-commit` runs lint-staged, `commit-msg` runs commitlint,
  `pre-push` runs typecheck + tests.
- **Never** use `--no-verify`. Never disable a lint rule inline to make a commit
  pass — fix the code, or raise the tradeoff.
- Do not commit `.env`, generated output, or lockfile conflicts.

## 13. How to work a task

1. **Read** the relevant existing code first. Match its patterns; do not
   introduce a second way of doing something that already has one.
2. **Plan** — list the files you will create or change before editing. If the
   task needs a new dependency or a new folder in `src/`, say so and why.
3. **Implement** the smallest change that fully solves the task.
4. **Verify** with `pnpm verify`. Fix what it reports.
5. **Verify against §15** — the review standards apply to your own output.
6. **Report** what changed, what you did not do, and any assumption you made.

Ask instead of guessing when: the API contract is unknown, a design decision has
no precedent in the codebase, or the request implies business rules this
template deliberately does not contain.

## 14. Hard "do not"

- Do not invent a component that `DESIGN.md` §6 already lists, and do not
  invent a name for one — §4 fixes the vocabulary (`Dialog`, never "Modal").
- Do not add a UI component library alongside shadcn/ui.
- Do not add a state manager, date library, or utility library that duplicates
  something already installed.
- Do not hand-edit `src/components/ui/**` without recording the change in `DESIGN.md`.
- Do not weaken the quality gate: no `ignoreBuildErrors`, no `eslint-disable`
  on a whole file, no skipped tests left in the tree.
- Do not use `localStorage` during render, or read `window` outside an effect.
- Do not fetch inside `useEffect` when a Server Component or TanStack Query fits.
- Do not commit commented-out code or `console.log` left over from debugging.
- Do not put secrets in `NEXT_PUBLIC_*`.
- Do not abstract, memoise, split, or generalise without a named second caller,
  a measurement, or a stated requirement — §15.
- Do not hardcode a user-facing string, and do not rename `src/proxy.ts` back to
  `middleware.ts` — Next.js 16 ignores the old name and locale detection dies.

## 15. Code review standards

The bar a change has to clear — apply it to your own output before submitting,
and to any diff you are asked to review.

### Reject the change if it

| Rejection reason                         | What it looks like                                                                                                                                        |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Duplicates existing logic**            | A second `formatDate`, a second fetch wrapper, a copy of a component with one line changed. Find the original and extend it.                              |
| **Creates a second pattern**             | A new way to do something the codebase already does — a different form library, a different error shape, a hand-rolled dropdown. One pattern per problem. |
| **Weakens typing**                       | `any`, `as` casts, `!` non-null assertions, optional props that should be required, a widened return type to make a call site compile.                    |
| **Weakens accessibility**                | A `div` with `onClick`, a removed focus ring, a missing label, an icon-only button with no name, a lost `aria-*` attribute.                               |
| **Introduces unnecessary abstraction**   | A wrapper with one caller, a config object for one flag, a generic component with a `variant` union nobody uses yet, an interface for a shape used once.  |
| **Introduces an unnecessary dependency** | A package for something 30 lines solve, or a second library that overlaps one already installed.                                                          |
| **Changes unrelated files**              | Reformatting, renaming, or "while I was in there" fixes mixed into a feature diff. Send them separately.                                                  |
| **Ignores `DESIGN.md`**                  | A component not in §6, a name not in §4, a token that does not exist, a missing state from §9–§13, anything in §20.                                       |

Any of these is enough on its own. A change that is correct but unreviewable —
because it does four things at once — is still rejected.

### Do not over-engineer

- **Do not abstract after one usage.** Two call sites is a coincidence, three is
  a pattern. Duplication is cheaper to fix later than the wrong abstraction.
- **Do not optimise without evidence.** Profile first, then change, then measure.
  "This might be slow" is not evidence.
- **Do not use `memo`, `useMemo` or `useCallback` by default.** They cost more
  than they save on cheap computations, and they hide the real problem when
  there is one. Reach for them when a profile says to, or when a value is a
  dependency of an effect and its identity genuinely matters.
- **Do not split files for tiny components.** A 15-line subcomponent used by one
  parent lives in the same file. Split when it is reused, or when the file
  passes ~300 lines.
- **Do not create a hook just to wrap `useState`.** `useToggle`, `useInput` and
  friends add a layer and remove clarity. A hook earns its place when it owns
  effects, subscriptions, or logic shared across components.
- **Do not add a prop for a case that does not exist.** No `size` union with one
  member, no `onX` callback nothing passes.
- **Do not build for a requirement nobody stated.** If the task is one locale,
  one role, one currency — build that. The template's job is to make the second
  one cheap, not to pre-build it.

The test for all of these: **can you name the second caller, the measurement, or
the requirement?** If not, do the simple thing.

## 16. Adapting this template to a new project

When starting a real project from this template:

1. Update `name` in `package.json` and the values in `src/config/site.ts`.
2. Replace the palette, type and radius tokens in `src/app/globals.css`
   (`DESIGN.md` §2 explains what each token controls).
3. Fill in `.env.example` and extend the schema in `src/lib/env.ts`.
4. Replace the placeholder copy in `messages/en.json` (`common.appName`,
   the `home` namespace) and add the locales the project needs.
5. Add project-specific rules to the bottom of this file under
   `## Project rules` — leave the sections above intact so the template stays
   upgradeable.
