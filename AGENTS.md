# AGENTS.md

Entry point for coding agents that do not read `CLAUDE.md` (Codex, Cursor,
Copilot, Gemini, and others).

**The rules live in [`CLAUDE.md`](./CLAUDE.md). Read it first, then
[`DESIGN.md`](./DESIGN.md) before touching any UI.**

Short version:

- This is a template. It contains no business logic — do not invent a domain.
- Server Components by default; push `'use client'` down, never up.
- Design tokens only: no hex values, no inline `style`, no arbitrary colours.
- No hardcoded user-facing text: every string goes in `messages/en.json` and is
  rendered with `t()`. Links come from `@/i18n/navigation`, not `next/link`.
- Every screen ships loading, empty, error and success states.
- `pnpm verify` must pass before you report a task as done.
- Never `--no-verify`, never `eslint-disable` a whole file, never `any`.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
