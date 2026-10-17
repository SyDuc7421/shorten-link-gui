# Contributing

## Setup

```bash
corepack enable
pnpm install
cp .env.example .env.local
pnpm dev
```

## Workflow

1. Branch from `main`: `feat/<slug>`, `fix/<slug>`, `chore/<slug>`.
2. Read `CLAUDE.md` (code conventions) and `DESIGN.md` (UI rules) before writing.
3. Keep the change focused. One concern per pull request.
4. Run `pnpm verify` before pushing.
5. Open a PR and fill in the checklist in the template.

## Commits

Conventional Commits, enforced by commitlint:

```
<type>(<scope>): <subject in imperative, lower case, no trailing period>
```

Types: `feat` `fix` `refactor` `perf` `style` `test` `docs` `build` `ci`
`chore` `revert`.

## Review bar

The full standard is `CLAUDE.md` §15 — reviewers apply it, so apply it to your
own diff first. A change is rejected if it duplicates existing logic, creates a
second pattern, weakens typing or accessibility, adds an abstraction or a
dependency it does not need, touches unrelated files, or ignores `DESIGN.md`.

Before opening the PR:

- `pnpm verify` and CI are green.
- All five states are handled (`CLAUDE.md` §10).
- The UI passes the self-check in `DESIGN.md` §20.1 and works at 360/768/1440px.
- Any deviation is logged in `DESIGN.md` §21.

## Adding a dependency

State the problem, why nothing installed solves it, the bundle cost, and the
maintenance status. Prefer a 30-line local utility over a package for anything
trivial. An unjustified dependency is a rejection under `CLAUDE.md` §15.

## Upgrading shadcn components

```bash
pnpm ui:diff            # see what changed upstream
pnpm ui:add <name>      # regenerate, then re-apply logged local edits
```

Local edits to `src/components/ui/**` must be recorded in `DESIGN.md` §21 (deviations log) or
they will be silently lost on the next upgrade.
