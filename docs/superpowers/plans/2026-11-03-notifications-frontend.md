# Notifications (front end) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show link owners a bell with an unread count and a popover list of in-app notifications, polled every 60 seconds.

**Architecture:** New feature `src/features/notifications/` in MVVM layout (model → view-models → components). The model wraps the three backend routes with TanStack Query; view-models turn query state into plain values; components render. The bell is mounted in `SiteHeader` next to `AccountMenu`.

**Tech Stack:** Next.js App Router, TanStack Query (`useInfiniteQuery`), Zod, next-intl, shadcn `Popover`, lucide-react, sonner, Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-03-notifications-design.md` (section "Front end"). API contract: `../shorten-link/api/openapi.yaml` (`/api/notifications*`, schema `Notification`). Backend lives on branch `feat/notifications` of `shorten-link`.

## Global Constraints

- `CLAUDE.md` and `DESIGN.md` win over the spec. Read `src/features/README.md` first.
- Every user-facing string in `messages/en.json` under namespace `notifications`; literal `t('key')` calls only, never `t(\`x.${type}\`)`.
- Poll the list every ~60 seconds with `refetchInterval`; not in a background tab (TanStack default, do not set `refetchIntervalInBackground`).
- Bell shown **only when signed in**. Click on a link notification: mark read, go to `/` (links dashboard). Click on `password_changed`: mark read only.
- Zod schema accepts `null` `link_id` / `code` (`password_changed`).
- Import `Link` from `@/i18n/navigation`; cross-feature imports only through `@/features/<name>`.
- Tokens only, 4px scale, no inline `style`, no `max-*:` variants, touch targets 44px below `md` (`h-11 md:h-9`).
- No new dependency. No `memo`/`useMemo`/`useCallback`.
- Commits: Conventional Commits (`feat(notifications): …`), never `--no-verify`, end with the `Co-Authored-By` trailer from the session's attribution rule.
- Five states (CLAUDE.md §10): loading, empty, error, success. "Permission" does not apply: a signed-out user never sees the bell.

## Review Focus

1. `password_changed` item has `link_id: null`, `code: null` → parses, renders text with no link and no "undefined" code. (Task 1 schema test, Task 3 component test)
2. `unread_count` larger than the loaded items (or above 99) → badge shows `99+`, never a raw 4-digit number or `0`-hiding bug; count comes from the first page. (Task 1 badge test, Task 2 bell test)
3. Signed out, or another user signs in on the same browser → no request is made while signed out and cached notifications of the previous account are never shown (query keyed by email). (Task 1 api test, Task 2 bell test)
4. Marking read a notification that is already gone (404) → treated as success, no error toast, list refreshes. (Task 1 api test)
5. A background poll fails while a list is on screen → keep the list, do not swap it for `ErrorState` (same rule as the admin gate fix `10c5518`). (Task 2 list test)

---

### Task 1: Model — schemas, badge logic, API hooks

**Files:**

- Create: `src/features/notifications/model/types.ts`
- Create: `src/features/notifications/model/unread-badge.ts`
- Create: `src/features/notifications/model/notifications-api.ts`
- Test: `src/features/notifications/model/types.test.ts`, `unread-badge.test.ts`, `notifications-api.test.tsx`

**Interfaces:**

- Produces (`types.ts`): `notificationSchema`, `notificationPageSchema` (`{ items, next_cursor?: string | null, unread_count: number }`), `type Notification`, `type NotificationPage`, `NOTIFICATION_TYPES = ['link_disabled','link_enabled','link_expiring','password_changed'] as const`. Notification fields: `id: string`, `type`, `link_id: string | null`, `code: string | null`, `expires_at: string | null`, `read_at: string | null`, `created_at: string`.
- Produces (`unread-badge.ts`): `BADGE_MAX = 99`; `getUnreadBadge(count: number): { value: number; hasOverflow: boolean } | null` — `null` for `count <= 0` or non-finite; `value` is `min(count, 99)`, `hasOverflow` true when `count > 99`.
- Produces (`notifications-api.ts`): `NOTIFICATIONS_POLL_MS = 60_000`; `useNotifications()` → `useInfiniteQuery` over `GET /api/notifications?cursor=` (same cursor paging as `useLinks`), key `['notifications', email]`, `enabled` only when `useSession().status === 'signedIn'`, `refetchInterval: NOTIFICATIONS_POLL_MS`; `useMarkNotificationRead()` → mutation taking `id: string`, `POST /api/notifications/{id}/read`; `useMarkAllNotificationsRead()` → mutation, `POST /api/notifications/read-all`. Both mutations invalidate the `['notifications']` prefix on success.
- Consumes: `authedHttp`, `useSession` from `@/features/auth`; `HttpError` from `@/lib/http`.

- [ ] **Step 1: Write failing tests**
  - `types.test.ts`: `notificationPageSchema.parse` accepts an item `{ id: '12', type: 'password_changed', link_id: null, code: null, expires_at: null, read_at: null, created_at: '2026-11-03T00:00:00Z' }` with `next_cursor: ''`, `unread_count: 1`; accepts a `link_expiring` item with string `link_id`/`code`/`expires_at`; rejects `type: 'nope'`; rejects a missing `unread_count`.
  - `unread-badge.test.ts`: `getUnreadBadge(0)`, `(-1)`, `(NaN)` → `null`; `(3)` → `{ value: 3, hasOverflow: false }`; `(99)` → `{ value: 99, hasOverflow: false }`; `(100)` and `(1234)` → `{ value: 99, hasOverflow: true }`.
  - `notifications-api.test.tsx` (mock `@/features/auth` `authedHttp` and `useSession`; wrap in a local `QueryClientProvider` with `retry: false`): signed out → `authedHttp` never called; signed in as `a@x.com` then re-rendered as `b@x.com` → second request is made (separate cache entry); `useMarkNotificationRead` resolves (does not reject) when `authedHttp` rejects `new HttpError(404, null)`, rejects on `new HttpError(500, null)`; the request path is `/api/notifications/12/read` with `method: 'POST'`.
- [ ] **Step 2: Run** `pnpm vitest run src/features/notifications/model` — expect FAIL (modules missing).
- [ ] **Step 3: Implement** the three modules per Interfaces. Parse responses with the Zod schemas (`authedHttp<unknown>`); `getNextPageParam: (last) => last.next_cursor || undefined`; the mark-read mutation swallows `HttpError` with `status === 404` only.
- [ ] **Step 4: Run** the same command — expect PASS.
- [ ] **Step 5: Commit** — `git add src/features/notifications && git commit -m "feat(notifications): add notification schemas, badge logic and API hooks"`.

### Task 2: View-models

**Files:**

- Create: `src/features/notifications/view-models/use-notification-bell-view-model.ts`
- Create: `src/features/notifications/view-models/use-notification-list-view-model.ts`
- Create: `src/features/notifications/view-models/use-notification-item-view-model.ts`
- Test: one `*.test.tsx` next to each (`renderHook` from `@/test/utils`, Model mocked with `vi.mock('../model/notifications-api')`, `useSession` mocked from `@/features/auth`)

**Interfaces:**

- Consumes: Task 1 exports.
- Produces:
  - `useNotificationBellViewModel(): { status: 'hidden' } | { status: 'visible'; unreadCount: number; badge: UnreadBadge | null; isOpen: boolean; onOpenChange: (open: boolean) => void; close: () => void }`. `hidden` unless `useSession().status === 'signedIn'`. `unreadCount` is `data.pages[0].unread_count`, `0` before data. `UnreadBadge` is the non-null return type of `getUnreadBadge`.
  - `useNotificationListViewModel(): { state: NotificationListState; unreadCount: number; markAllRead: () => void; isMarkingAll: boolean }` with `NotificationListState = { status: 'pending' } | { status: 'error'; retry: () => void } | { status: 'empty' } | { status: 'success'; items: Notification[]; hasNextPage: boolean; isFetchingNextPage: boolean; isRefreshing: boolean; loadMore: () => void }`. `error` only when the query errored **and has no data**; otherwise data wins (Review Focus 5). `markAllRead` calls the mutation; on error `toast.error(t('markFailed'))`.
  - `useNotificationItemViewModel(notification: Notification, onDone: () => void): { isUnread: boolean; onSelect: () => void }`. `onSelect` calls mark-read only when `read_at === null`, and always calls `onDone` (closes the popover). Mark-read error → `toast.error(t('markFailed'))` (translations from namespace `notifications`).

- [ ] **Step 1: Write failing tests**
  - Bell: signed out and `loading` → `{ status: 'hidden' }`; signed in with first page `unread_count: 150` and 2 loaded items → `unreadCount` 150, `badge` `{ value: 99, hasOverflow: true }`; no data → `unreadCount` 0, `badge` null; `onOpenChange(true)` sets `isOpen`, `close()` resets it.
  - List: `pending`; `error` with no data exposes `retry` calling `refetch`; `status: 'error'` **with** data → `success` (Review Focus 5); empty first page → `empty`; pages flatten in order; `isRefreshing` is false while `isFetchingNextPage`; `markAllRead` calls the mutation's `mutate`.
  - Item: unread → `onSelect` calls `mutate('12')` and `onDone`; already read → only `onDone`.
- [ ] **Step 2: Run** `pnpm vitest run src/features/notifications/view-models` — expect FAIL.
- [ ] **Step 3: Implement** the three hooks per Interfaces (mirror `use-link-list-view-model.ts` for the state union).
- [ ] **Step 4: Run** the same command — expect PASS.
- [ ] **Step 5: Commit** — `feat(notifications): add bell, list and item view-models`.

### Task 3: Messages, components, header wiring, docs

**Files:**

- Modify: `messages/en.json` (add namespace `notifications`)
- Create: `src/features/notifications/components/notification-bell.tsx`, `notification-list.tsx` (holds the item subcomponent, like `LinkRow` in `link-list.tsx`)
- Create: `src/features/notifications/index.ts` (exports `NotificationBell`)
- Modify: `src/components/layout/site-header.tsx` (wrap bell + `AccountMenu` in `<div className="flex items-center gap-2">`)
- Modify: `DESIGN.md` §21 (deviations log row)
- Test: `src/features/notifications/components/notification-list.test.tsx`

**Interfaces:**

- Consumes: Task 2 view-models; `Popover`/`PopoverTrigger`/`PopoverContent`, `Button`, `Skeleton` from `@/components/ui`; `EmptyState`, `ErrorState` from `@/components/common`.
- Produces: `NotificationBell()` (no props), `NotificationList({ onDone }: NotificationListProps)` where `onDone: () => void` closes the popover.

- [ ] **Step 1: Messages.** Namespace `notifications` with keys: `title` ("Notifications"), `bellLabel` (ICU plural on `{count}`: `=0` "Notifications", otherwise "Notifications, {count} unread"), `badgeOverflow` ("{count}+"), `markAllRead`, `unread` (sr-only marker), `emptyTitle` ("All caught up"), `emptyDescription` (one sentence: link disabled / enabled / expiring show up here), `loadErrorTitle`, `loadErrorDescription`, `loadMore`, `markFailed`, and one message per type: `linkDisabled` ({code}), `linkEnabled` ({code}), `linkExpiring` ({code}, {date}), `passwordChanged` (tells the user to reset the password again if it was not them). Wording is the builder's; placeholders must be as listed.
- [ ] **Step 2: Write failing component test** (`notification-list.test.tsx`, mock `../model/notifications-api`, render with `@/test/utils`): a `password_changed` item (null `link_id`/`code`) renders the `passwordChanged` text, is a `button`, has no `href`, and the text contains neither `null` nor `undefined`; a `link_disabled` item with `code: 'abc'` renders a link to `/` whose text contains `abc`; an unread item exposes the sr-only `unread` text, a read one does not; `error` state shows a Retry button; `empty` state shows the `emptyTitle`.
- [ ] **Step 3: Run** `pnpm vitest run src/features/notifications/components` — expect FAIL.
- [ ] **Step 4: Implement components.**
  - `NotificationBell`: `Popover` with `open`/`onOpenChange` from the bell view-model; trigger is a ghost `Button` (`h-11 min-w-11 md:h-9`) with `Bell` icon and `aria-label={t('bellLabel', { count })}`; badge is an `aria-hidden` absolutely positioned `Badge`-style span showing `value`, or `t('badgeOverflow', { count: value })` when `hasOverflow`; render `null` when `hidden`. `PopoverContent` `align="end"`, `w-80 sm:w-96 p-0`; header row with `<h2>` title and a ghost "mark all as read" button, shown only when `unreadCount > 0` (never a disabled button); body is `max-h-96 overflow-y-auto` containing `NotificationList`.
  - `NotificationList`: skeleton rows (pending), `ErrorState` with `onRetry`, `EmptyState` (`className="py-8"`, icon `BellOff`), `ul` of items, "load older" button when `hasNextPage`, rows dim (`opacity-60`) while `isRefreshing`.
  - Item: icon per type (`Ban`, `CircleCheck`, `Clock`, `KeyRound`); text from a `switch` on `type` with literal keys; `linkExpiring` date via `useFormatter().dateTime(new Date(expires_at), { dateStyle: 'medium', timeStyle: 'short' })`; created time via `format.relativeTime(new Date(created_at))`; unread = filled dot (`aria-hidden`) + `font-medium` + sr-only `unread`. Link types render the i18n `Link href="/"` with `onClick={onSelect}`; `password_changed` renders a `<button type="button">`. Row min height 44px.
- [ ] **Step 5: Wire** `NotificationBell` into `SiteHeader`; add `src/features/notifications/index.ts`; add the `DESIGN.md` §21 row (dated 2026-11-03): bell uses `Popover` + a bounded scroll region (`ScrollArea` is not installed), and the item name `Notification*` is a feature noun, not the Toast.
- [ ] **Step 6: Verify** — `pnpm vitest run src/features/notifications` PASS, then `pnpm i18n:check` and `pnpm verify` PASS. Report anything that fails; do not weaken lint.
- [ ] **Step 7: Commit** — `feat(notifications): show notification bell and list in the header`.

### After the tasks

Manual check needs the backend (`shorten-link`, branch `feat/notifications`, with MySQL + RabbitMQ): sign in, disable one of your links as an admin, confirm the badge appears within ~60 seconds, opening the list shows the item, clicking it marks it read and goes to `/`. Ask the user before starting that stack.

## Self-review notes

- Spec coverage: bell + badge + list (T3), polling (T1), mark read / mark all (T1–T3), signed-in only (T2), null-safe schema (T1), i18n per type (T3), click behaviour (T3), tests for view-model and badge (T1–T2), `pnpm verify` (T3).
- Deliberate choices not in the spec: infinite query with "load older" (not first page only, because notifications are never deleted and `unread_count` can exceed one page); invalidate-on-success instead of optimistic updates (DESIGN.md §12: cheap to refetch, no rollback copy needed); query key includes the account email so a previous user's cache is never shown.
- Not built: realtime push, settings, deep links to one link (spec non-goals).
