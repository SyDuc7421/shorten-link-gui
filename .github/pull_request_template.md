## What changed

<!-- One paragraph. Link the issue. -->

## Checklist

Reviewed against `CLAUDE.md` §15 and `DESIGN.md` §20.1:

- [ ] Reuses existing logic and patterns — no duplicate, no second way to do it
- [ ] No new abstraction, dependency, or `memo` without a named reason
- [ ] Touches only files this change needs
- [ ] `pnpm verify` passes locally
- [ ] All five states handled: loading, empty, error, permission, success
- [ ] Keyboard reachable, visible focus, labelled controls
- [ ] Responsive from 360px up — one markup tree, no horizontal overflow
- [ ] No new `any`, no inline styles, no hardcoded colours or fixed pixel sizes
- [ ] Screenshots for UI changes (light + dark)
