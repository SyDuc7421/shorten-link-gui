# Features

One folder per feature. A feature owns its UI, its data access, and its types.
Each feature follows MVVM with hooks:

```
features/<feature>/
├── model/          # Model — what the data is and how to get it
│   ├── *-api.ts        TanStack Query queries/mutations, Zod-parsed responses
│   ├── types.ts        Zod schemas, domain types and constants
│   ├── *-store.ts      Zustand store, when the feature has client state
│   └── *.ts            pure functions: error mapping, date maths, status
├── view-models/    # ViewModel — use-<component>-view-model.ts
├── components/     # View — renders what its view-model returns
└── index.ts        # public API — the ONLY file other code may import from
```

## Layers

| Layer     | Owns                                                                 | Must not                                                              |
| --------- | -------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Model     | API calls, schemas, stores, pure domain logic                        | Import React components, `next-intl`, or anything from `view-models/` |
| ViewModel | Screen state, form wiring, validation messages, mapping Model → View | Return JSX; reach into another feature's `model/`                     |
| View      | Markup, layout, `t()` for static copy, `useFormatter` for display    | Hold `useState`/`useEffect`, call `model/*-api`, map errors           |

- A view-model is named after its view: `shorten-form.tsx` →
  `use-shorten-form-view-model.ts`, exporting `useShortenFormViewModel`.
- It returns plain values and named actions (`onSubmit`, `confirm`,
  `loadMore`), never raw query or mutation objects. For multi-state screens
  return a discriminated union (`{ status: 'pending' } | { status: 'error'; retry } | …`).
- A component with no logic needs no view-model: `SessionGate` and
  `AccountMenu` read `useSession` directly, server components like `Landing`
  have none (CLAUDE.md §15 — no hook that only wraps `useState`).
- Pure Model functions get unit tests; view-models get `renderHook` tests
  (`@/test/utils`) with the Model mocked via `vi.mock('../model/…')`.

## Rules

- Cross-feature imports go through `index.ts`. Never reach into
  `@/features/x/model/...` from feature `y`.
- If two features need the same thing, move it to `src/components/common`,
  `src/hooks`, or `src/lib`.
- Route files under `src/app` stay thin: they compose feature components and
  handle params/metadata, nothing else.
