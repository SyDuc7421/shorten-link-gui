# Features

One folder per feature. A feature owns its UI, its data access, and its types.

```
features/<feature>/
├── components/     # UI used only by this feature
├── api/            # queries, mutations, request/response schemas
├── hooks/
├── types.ts
└── index.ts        # public API — the ONLY file other code may import from
```

Rules:

- Cross-feature imports go through `index.ts`. Never reach into
  `@/features/x/components/...` from feature `y`.
- If two features need the same thing, move it to `src/components/common`,
  `src/hooks`, or `src/lib`.
- Route files under `src/app` stay thin: they compose feature components and
  handle params/metadata, nothing else.
