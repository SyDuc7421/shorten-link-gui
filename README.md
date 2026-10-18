# Frontend Template

An opinionated, reusable Next.js starter: structure, tooling and conventions,
with **zero business logic**. Clone it, rename it, and start building the
product — not the setup.

- **`CLAUDE.md`** — how code is written here (also the instruction file for AI agents)
- **`DESIGN.md`** — tokens, UI patterns and the UX rules that decide between them
- **`README.md`** — this file: setup, scripts, structure

---

## Stack

Next.js (App Router, RSC) · TypeScript strict · Tailwind CSS v4 · shadcn/ui ·
next-intl v4 (English by default) · TanStack Query · react-hook-form + Zod ·
sonner · next-themes ·
Vitest + Testing Library · Playwright · ESLint · Prettier · Husky · lint-staged ·
commitlint · GitHub Actions.

## Requirements

- Node.js ≥ 20.9 (`.nvmrc` pins the tested major)
- pnpm ≥ 10 — `corepack enable && corepack prepare pnpm@latest --activate`

> **TypeScript is pinned to `^6`, deliberately.** TypeScript 7 (the Go port)
> went GA in July 2026 and now owns the `latest` tag, but it ships without the
> JavaScript compiler API. Next.js 16.2 stable and typescript-eslint both use
> that API, so installing `typescript@latest` makes `next build` fail with
> "required package(s) are not installed". Next.js supports TS 7 only behind
> `experimental.useTypeScriptCli`, which is in the 16.3 preview. Move the pin
> once that lands in a stable Next.js release.

## Quick start

```bash
pnpm install          # also installs Husky hooks via the prepare script
cp .env.example .env.local
pnpm dev              # http://localhost:3000
```

## Starting a new project from this template

1. `package.json` → set `name`.
2. `src/config/site.ts` → set the product name and description.
3. `src/app/globals.css` → replace the colour, radius and motion tokens.
   This is the only place the brand is defined.
4. `.env.example` + `src/lib/env.ts` → declare the variables the project needs.
   The app fails fast at startup if one is missing.
5. `messages/en.json` → replace the placeholder copy (`common.appName`, the
   `home` namespace) and add any locales you need.
6. `CLAUDE.md` → append a `## Project rules` section at the bottom. Leave the
   existing sections intact so the template stays upgradeable.
7. `DESIGN.md` → keep §21 (deviations log) up to date from day one.
8. Delete `src/app/[locale]/page.tsx`'s placeholder content and this section of the README.

## Scripts

| Script            | Does                                            |
| ----------------- | ----------------------------------------------- |
| `pnpm dev`        | Dev server                                      |
| `pnpm build`      | Production build (fails on type or lint errors) |
| `pnpm start`      | Serve the production build                      |
| `pnpm typecheck`  | `tsc --noEmit`                                  |
| `pnpm lint`       | ESLint · `lint:fix` to autofix                  |
| `pnpm format`     | Prettier write · `format:check` to verify       |
| `pnpm test`       | Vitest · `test:watch` for watch mode            |
| `pnpm test:e2e`   | Playwright                                      |
| `pnpm verify`     | typecheck + lint + format check + tests         |
| `pnpm i18n:check` | Every locale file matches `messages/en.json`    |
| `pnpm ui:add`     | Add a shadcn component                          |
| `pnpm ui:diff`    | Diff local shadcn components against upstream   |

`pnpm verify` is the gate. If it passes locally, CI passes.

## Structure

```
messages/
└── en.json                 # the copy deck — every user-facing string
src/
├── app/
│   ├── [locale]/           # routes, layouts, loading/error/not-found
│   ├── not-found.tsx       # fallback outside the locale segment
│   ├── global-error.tsx    # last-resort boundary, no translations available
│   └── globals.css         # design tokens — the theme lives here
├── i18n/                   # routing, request config, locale-aware navigation
├── proxy.ts                # locale negotiation (was middleware.ts before Next 16)
├── components/
│   ├── ui/                 # shadcn primitives (CLI-generated, treat as vendored)
│   ├── common/             # composites: PageHeader, EmptyState, ErrorState, PermissionState
│   └── layout/             # app shell: header, sidebar, footer
├── features/               # one folder per capability (model/ view-models/ components/), public API via index.ts
├── hooks/                  # cross-feature hooks
├── lib/                    # utils, env validation, http client, query client
├── providers/              # the single root client boundary
├── config/                 # app-wide constants
├── types/                  # app-wide types
└── test/                   # test setup
e2e/                        # Playwright specs
```

Placement rule: **if only one feature uses it, it lives in that feature.**
Promote to shared on the second consumer, not before.

## Admin area

Signed-in users whose account has `role = 'admin'` (granted on the API server
with `server admin grant <email>`) see **Admin** in the account menu.

| Route               | Content                                                              |
| ------------------- | -------------------------------------------------------------------- |
| `/admin`            | Totals, daily new users / links / clicks (7, 30, 90 days), top links |
| `/admin/users`      | Search and filter users                                              |
| `/admin/users/[id]` | Account details, daily quota, disable / enable, the user's links     |
| `/admin/links`      | Search and filter all links; disable, enable, delete                 |
| `/admin/audit`      | Every admin action, filterable by target and by admin                |

The API decides who is an admin on every request; the GUI's gate
(`features/admin/components/admin-gate.tsx`) only decides what to render.

## UI components

```bash
pnpm ui:add button dialog form table
pnpm ui:diff                 # check for upstream changes before upgrading
```

Generated components land in `src/components/ui/` and are yours to own. Prettier
ignores that folder so generated formatting stays stable and diffs stay readable.
If you edit a primitive on purpose, log it in `DESIGN.md` §21 (deviations log).

## Internationalisation

The template ships **one locale, English**, wired end to end. It is not an
optional add-on you bolt on later — the cost of retrofitting i18n is what this
setup exists to avoid.

- `messages/en.json` is the copy deck. Every user-facing string lives there;
  ESLint flags hardcoded JSX text.
- `global.d.ts` types `t()` against `en.json`, so a typo in a key fails
  `pnpm typecheck` rather than rendering the key at runtime.
- `localePrefix` is `'as-needed'`, so with a single locale the URLs stay clean
  (`/about`, not `/en/about`).
- Locale-aware `Link`, `redirect`, `usePathname` and `useRouter` come from
  `@/i18n/navigation`. The `next/*` originals are blocked by ESLint.

Adding a language:

```bash
# 1. add the code to routing.locales in src/i18n/routing.ts
# 2. copy the reference file and translate the values
cp messages/en.json messages/vi.json
# 3. set localePrefix to 'always' in src/i18n/routing.ts
pnpm i18n:check
```

No component, route or config change is required. `pnpm i18n:check` fails the
build if a locale is missing a key, has an extra one, or drops a `{placeholder}`.

> **Next.js 16 note:** locale negotiation lives in `src/proxy.ts`. Next.js 16
> renamed `middleware.ts` to `proxy.ts`; if you rename it back, Next.js ignores
> the file and next-intl throws "Unable to find next-intl locale".

## Enforced design rules

Rules that can be checked are checked, not just written down. ESLint fails on:

| Blocked                                         | Because                                       |
| ----------------------------------------------- | --------------------------------------------- |
| `h-screen` / `min-h-screen`                     | `100vh` overshoots the visible area on mobile |
| `w-screen`                                      | Ignores parent padding → horizontal overflow  |
| `max-md:` and friends                           | Desktop-first; write mobile-first             |
| `overflow-x-auto`                               | The lazy fix for a table that should be cards |
| `w-[327px]`, `mt-[13px]`, `text-[13px]`         | Fixed pixels break responsive layouts         |
| `z-[9999]`                                      | Stacking-context escalation                   |
| `!important`, inline `style`                    | Use a `cva` variant                           |
| `bg-blue-500`, `text-[#fff]`                    | Semantic tokens only                          |
| Hardcoded JSX text                              | Strings live in `messages/en.json`            |
| `next/link`, `useRouter` from `next/navigation` | Loses the locale                              |
| `any`, array index keys, `console.log`          | Correctness                                   |

`e2e/responsive.spec.ts` loads every route at 360px, 768px and 1440px and fails
if the page can scroll horizontally — naming the widest offending element — or
if a tap target is under 44px on mobile.

A genuine exception takes an inline `eslint-disable` **and** a line in
`DESIGN.md` §21. Making it deliberate is the point.

## Quality gate

| Hook         | Runs                                            |
| ------------ | ----------------------------------------------- |
| `pre-commit` | lint-staged (ESLint + Prettier on staged files) |
| `commit-msg` | commitlint (Conventional Commits)               |
| `pre-push`   | typecheck + `i18n:check` + unit tests           |

Commit format:

```
feat(auth): add password reset form
fix(table): keep column widths after sort
chore(deps): bump next to 16.2
```

Allowed types: `feat` `fix` `refactor` `perf` `style` `test` `docs` `build`
`ci` `chore` `revert`.

`--no-verify` is not an accepted workflow. If a hook blocks you, the code is
wrong or the rule is wrong — fix one of them, in a commit that says so.

CI (`.github/workflows/ci.yml`) runs the same checks plus `pnpm build` on every
push to `main` and every pull request.

## Environment variables

Declared in `.env.example`, validated by Zod in `src/lib/env.ts` at startup.

- `NEXT_PUBLIC_*` is inlined into the browser bundle — **never put a secret there**.
- Import `env` from `@/lib/env`; do not read `process.env` directly in app code.
- Adding a variable means updating `.env.example` **and** the schema. A missing
  variable should break the build, not surface as `undefined` in production.

## Testing

- **Unit / component** — Vitest + Testing Library, colocated as `*.test.tsx`.
  Test behaviour through the accessible tree (`getByRole`, `getByLabelText`), not
  implementation details.
- **E2E** — Playwright in `e2e/`, covering critical paths only.

## Troubleshooting

| Symptom                                          | Cause                                                                                         |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| Hooks do not run                                 | `pnpm install` was skipped, or `.husky/*` lost `+x`                                           |
| Tailwind class does nothing                      | Token not registered in `@theme inline` in `globals.css`                                      |
| `Invalid environment variables`                  | `.env.local` is missing a variable declared in `src/lib/env.ts`                               |
| Hydration mismatch on first paint                | Browser-only value read during render — move it into an effect                                |
| `useState` error in a Server Component           | Missing `'use client'`, or the boundary is too high in the tree                               |
| `required package(s) are not installed` on build | `typescript@7` was installed — this template needs `^6` (see Requirements)                    |
| `Unable to find next-intl locale`                | `src/proxy.ts` was renamed to `middleware.ts`, or `getRequestConfig` does not return `locale` |
| `useTranslations` context not found              | The client component sits above `NextIntlClientProvider` in the tree                          |
| Page went dynamic unexpectedly                   | Missing `setRequestLocale(locale)` in the page or layout                                      |

## License

MIT — replace with your own before publishing a real project.
