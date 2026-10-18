# DESIGN.md

The UI contract for this codebase. `CLAUDE.md` covers code structure; this file
decides what the interface looks like, which component to reach for, and how it
behaves.

**If you read only three sections: §1, §8 and §20.** They are where generated UI
goes wrong most often, and together they cover the rules that are hardest to
notice after the fact.

| §                                                           | Read it when                                   |
| ----------------------------------------------------------- | ---------------------------------------------- |
| [1. Rules for generating UI](#1-rules-for-generating-ui)    | Always, first                                  |
| [2. Principles](#2-principles) · [3. Tokens](#3-tokens)     | Styling anything                               |
| [4. Component vocabulary](#4-component-vocabulary)          | Naming a component                             |
| [5. Decision trees](#5-decision-trees)                      | Choosing a component                           |
| [6. Component inventory](#6-component-inventory)            | Checking what exists                           |
| [7. Navigation](#7-navigation)                              | Structuring navigation                         |
| [8. Layout and responsive](#8-layout-and-responsive)        | **Any layout work — the highest-risk section** |
| [9. States](#9-interaction-states)–[14. Tables](#14-tables) | Building behaviour                             |
| [15. Iconography](#15-iconography)–[19. Copy](#19-copy)     | Detail work                                    |
| [20. Anti-patterns](#20-anti-patterns)                      | **Self-check before returning any UI**         |

---

## 1. Rules for generating UI

**When creating UI**

1. Reuse an existing component. Creating a new one is the last resort, and
   needs a reason stated in the PR.
2. Never introduce a new colour, radius, spacing or duration value. If the
   token does not exist, the design is wrong or the token belongs in §3.
3. Never use inline `style`, arbitrary Tailwind values, or a hex code.
4. Compose over duplicate. Two components that differ by one prop are one
   component with a variant.
5. Prefer accessibility over visual polish. A plain button that announces
   itself beats a beautiful `div`.
6. When unsure, copy the nearest existing pattern in this repo rather than the
   nicest pattern you know.
7. If the request needs a pattern this file does not cover, say so and propose
   one — do not silently invent it.

**When modifying UI**

1. Preserve the spacing rhythm, the type scale and the existing interaction
   patterns. A layout tweak is not a licence to restyle.
2. Do not rename components, props or tokens.
3. Change the minimum. If asked to fix alignment, do not also change colours.
4. If a change breaks a rule in this file, stop and flag the conflict.
5. Any deliberate deviation is logged in [§21](#21-deviations-log).

**Before returning any UI, run the self-check in [§20.1](#201-the-ones-ai-gets-wrong-most-often).**
It lists the mistakes generated interfaces make most often; most of them are
invisible unless you look for them deliberately.

**Refuse to generate**: nested dialogs, two primary buttons in one region, a
clickable `div`, a table that scrolls horizontally on mobile, two hidden trees
for mobile and desktop, `h-screen` on a page, a disabled control with no
explanation.

## 2. Principles

1. **Tokens over values.** Every colour, radius and duration comes from a token.
2. **Consistency beats novelty.** One imperfect pattern used everywhere beats
   two good ones used inconsistently.
3. **Every state is designed.** Loading, empty, error, permission-denied and
   success are all part of the work.
4. **Accessible by default.** Keyboard, contrast and focus are the floor.
5. **The interface speaks plainly.** Copy is design material — see §19.

## 3. Tokens

All tokens live in `src/app/globals.css`. That file is the theme; components
never redefine it.

### Colour

OKLCH values mapped through `@theme inline`. Semantic names only — never
`blue-500` in a component.

| Token                                | Use for                                |
| ------------------------------------ | -------------------------------------- |
| `background` / `foreground`          | Page surface and default text          |
| `card` / `card-foreground`           | Raised surfaces, panels                |
| `popover` / `popover-foreground`     | Floating layers                        |
| `primary` / `primary-foreground`     | The main action on a screen            |
| `secondary` / `secondary-foreground` | Supporting actions                     |
| `muted` / `muted-foreground`         | Quiet surfaces, helper and meta text   |
| `accent` / `accent-foreground`       | Hover and selected states              |
| `destructive`                        | Delete, revoke, irreversible actions   |
| `success` / `warning`                | Status feedback only, never decoration |
| `border` / `input` / `ring`          | Edges, field borders, focus rings      |

- One primary action per screen region.
- Colour never carries meaning alone — pair it with an icon or text.
- Adding a token means adding it to `:root`, `.dark` **and** `@theme inline`.
  Two out of three breaks dark mode silently.

### Spacing

4px base scale.

| Gap        | Between                   |
| ---------- | ------------------------- |
| `gap-1/2`  | Icon and its label        |
| `gap-3/4`  | Related controls in a row |
| `gap-6`    | Blocks inside a section   |
| `gap-8/12` | Sections on a page        |

Space with `gap` on a flex/grid parent. Sibling margins drift; gaps do not.

### Typography

| Role            | Classes                                    |
| --------------- | ------------------------------------------ |
| Page title (h1) | `text-2xl font-semibold tracking-tight`    |
| Section (h2)    | `text-lg font-semibold`                    |
| Subsection (h3) | `text-base font-medium`                    |
| Body            | `text-sm` (dense UI) / `text-base` (prose) |
| Meta / helper   | `text-sm text-muted-foreground`            |
| Micro / legal   | `text-xs text-muted-foreground`            |
| Numeric, code   | `font-mono tabular-nums`                   |

Heading levels follow document order — never pick a level for its size. Prose
stays under ~75ch (`max-w-prose`).

### Radius and elevation

`--radius` drives `radius-sm|md|lg|xl`. Elevation ladder, use the lowest that
works: `border` → `border + shadow-sm` (cards) → `shadow-md` (popovers,
dropdowns) → `shadow-lg` + overlay (dialogs). Shadows communicate layering, not
importance.

### Motion

| Token             | Value | Use for                            |
| ----------------- | ----- | ---------------------------------- |
| `--duration-fast` | 120ms | Hover, focus, small state flips    |
| `--duration-base` | 200ms | Dropdowns, tooltips, accordions    |
| `--duration-slow` | 320ms | Dialogs, drawers, page transitions |

Rules in §16.

## 4. Component vocabulary

One name per concept. These names are used in code, in comments, in PR
descriptions and in conversation with the user.

| Use this       | Means                                                               | Never call it                        |
| -------------- | ------------------------------------------------------------------- | ------------------------------------ |
| `Dialog`       | Centered modal overlay, dismissible                                 | Modal, Popup, Window, Lightbox       |
| `AlertDialog`  | Blocking confirm for a destructive act; no dismiss on outside click | ConfirmModal, Confirmation           |
| `Sheet`        | Panel sliding in from a screen edge (desktop side panel)            | SidePanel, Flyout, Offcanvas         |
| `Drawer`       | Bottom sheet, mobile-first                                          | BottomModal, Tray                    |
| `Popover`      | Non-modal anchored panel with interactive content                   | Dropdown, Flyout, Bubble             |
| `DropdownMenu` | Anchored list of **actions** from a trigger button                  | Menu, ContextMenu, Popup             |
| `Tooltip`      | Short non-interactive hint on hover/focus                           | Hint, Title, Popover                 |
| `HoverCard`    | Rich read-only preview on hover                                     | Preview, Peek                        |
| `Toast`        | Transient confirmation, bottom/top corner                           | Snackbar, Notification, Flash, Alert |
| `Alert`        | Persistent inline message inside the page flow                      | Banner, Callout, Notice, Toast       |
| `Skeleton`     | Loading placeholder shaped like the content                         | Shimmer, Ghost, Placeholder          |
| `EmptyState`   | The "nothing here yet" block                                        | NoData, Blank, Placeholder           |

Component taxonomy — the tier decides what a component is allowed to know:

| Tier          | Location                      | May contain                                                |
| ------------- | ----------------------------- | ---------------------------------------------------------- |
| **Primitive** | `components/ui/`              | Look and behaviour of one control. No data, no domain.     |
| **Composite** | `components/common/`          | A recurring pattern built from primitives. Data via props. |
| **Layout**    | `components/layout/`          | App shell — header, sidebar, footer.                       |
| **Feature**   | `features/<name>/components/` | Domain UI. May fetch, may know the product.                |

The most common structural mistake is a component below its tier: a primitive
that fetches, or a composite that knows about "invoices".

## 5. Decision trees

### Asking the user to confirm or decide

```
Needs a decision from the user?
│
├─ Destructive / irreversible (delete, revoke, cancel a plan)
│     → AlertDialog. Name the object and the consequence.
│       Confirm button uses the destructive variant.
│       Type-to-confirm only when the action is unrecoverable AND high value.
│
├─ Information only, no choice to make
│     → Alert (inline, stays in the flow)
│       Transient and dismissible → Toast
│
├─ Short input, 1–4 fields
│     → Dialog (desktop) / Drawer (mobile)
│
├─ Long form, > 6 fields, or needs its own URL
│     → Full page route. Never a dialog.
│
├─ Multi-step workflow, order matters, user can go back
│     → Stepper on a page. Never Tabs, never a Dialog.
│
└─ Contextual settings for one object, non-blocking
      → Popover
```

Never nest a Dialog inside a Dialog. If a dialog needs a second decision, it is
a page or a stepper.

### Displaying data

```
What are you showing?
│
├─ One record, ≤ 5 fields
│     → DescriptionList (label/value pairs)
│
├─ One record, many fields
│     → Page sections with headings, or Tabs if the groups are independent
│
├─ Many records, comparable fields, user scans and sorts
│     → Table  (see §14; mobile → stacked cards, §8)
│
├─ Many records, visual identity matters (images, avatars, previews)
│     → Card grid
│
├─ Many records, chronological, browse-y
│     → Feed list with infinite scroll
│
├─ Aggregates, trends, distribution
│     → Chart. Always pair with the underlying number in text.
│
└─ A single number that matters on its own
      → Stat block: value, label, and the comparison that makes it meaningful
```

### Choosing an input

```
How many options?
│
├─ 2 mutually exclusive, instant effect      → Switch
├─ 2 mutually exclusive, part of a form      → Radio Group or Checkbox
├─ 3–5 options, all worth showing            → Radio Group
├─ 6–15 options                              → Select
├─ > 15 options, or the user knows the value → Combobox (searchable)
├─ Many options, multiple selections         → Combobox multi + chips
├─ A date                                    → Date Picker (never a free-text date field)
└─ A range                                   → Slider, with the value shown as text
```

### Placing an action

```
Where does this action go?
│
├─ Primary action for the whole page      → Page header, right side
├─ Applies to a selection in a table      → Bulk action bar above the table
├─ Applies to one row                     → Last column: icon buttons (≤2) or DropdownMenu (>2)
├─ Applies to a card                      → Card footer, or DropdownMenu in the corner
└─ Rare, advanced, destructive            → Behind a DropdownMenu, visually separated
```

## 6. Component inventory

What exists, what it is for, and the failure mode to avoid. Add with
`pnpm ui:add <name>`. **Check this list before building anything.**

| Component        | Purpose                         | Variants / key props                                                                     | Do                                             | Don't                                                                      |
| ---------------- | ------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------- |
| `Button`         | Trigger an action               | `default` `secondary` `outline` `ghost` `destructive` · sizes `sm` `default` `lg` `icon` | One `default` per region; show a loading state | More than 3 variants on one screen; a `Button` for navigation (use `Link`) |
| `Link`           | Navigate                        | From `@/i18n/navigation`                                                                 | Real `href`, keyboard focusable                | `onClick` router pushes for plain navigation                               |
| `Input`          | Single-line text                | `type`                                                                                   | Always pair with a `Label`                     | Placeholder as the label                                                   |
| `Textarea`       | Multi-line text                 | `rows`                                                                                   | Auto-grow up to a cap, then scroll             | Fixed 3 rows for long content                                              |
| `Select`         | Pick one of 6–15                | —                                                                                        | Sensible default selected                      | Using it for 2 options, or for 50                                          |
| `Combobox`       | Pick from a searchable list     | single / multi                                                                           | Show recent or common items first              | Loading all options up front for big datasets                              |
| `Checkbox`       | Independent boolean             | `indeterminate`                                                                          | Indeterminate for partial group selection      | Using it where only one choice is valid                                    |
| `Radio Group`    | One of 3–5 visible options      | —                                                                                        | Vertical stack, one column                     | Two radio groups answering the same question                               |
| `Switch`         | Instant on/off setting          | —                                                                                        | Apply immediately, toast only if it can fail   | Inside a form with a Save button                                           |
| `Slider`         | Pick within a range             | `min` `max` `step`                                                                       | Show the current value as text                 | Precise numeric entry — pair with an Input                                 |
| `Date Picker`    | Pick a date or range            | single / range                                                                           | Allow typed entry too                          | Free-text date fields                                                      |
| `Form`           | RHF + Zod wiring                | —                                                                                        | One schema, shared with the API contract       | Manual `useState` per field                                                |
| `Label`          | Names a control                 | —                                                                                        | `htmlFor` always set                           | Visually hidden without an `aria-label` fallback                           |
| `Card`           | Group related content           | header / content / footer                                                                | One idea per card                              | Cards nested in cards                                                      |
| `Badge`          | Short status or count           | `default` `secondary` `outline` `destructive`                                            | Status + icon, not colour alone                | Long text; a Badge as a button                                             |
| `Avatar`         | Represent a person or org       | with fallback initials                                                                   | Always provide the fallback                    | An avatar with no `alt`/name                                               |
| `Separator`      | Divide sections                 | horizontal / vertical                                                                    | Where grouping is genuinely ambiguous          | A separator between every row                                              |
| `Skeleton`       | Loading placeholder             | —                                                                                        | Match the real content's shape                 | A grey box that jumps to a different layout                                |
| `Progress`       | Determinate progress            | `value`                                                                                  | Only when you know the percentage              | Fake progress; use a spinner instead                                       |
| `Alert`          | Persistent inline message       | `default` `destructive`                                                                  | Keep it near what it refers to                 | Stacking three alerts at the top of a page                                 |
| `Dialog`         | Focused task over the page      | —                                                                                        | ≤4 fields; ESC and outside click close it      | Nesting dialogs; long forms                                                |
| `AlertDialog`    | Confirm a destructive act       | —                                                                                        | Name the object; destructive confirm button    | Confirming non-destructive actions                                         |
| `Sheet`          | Side panel (desktop)            | side `left` `right` `top` `bottom`                                                       | Secondary detail alongside context             | As the primary navigation on desktop                                       |
| `Drawer`         | Bottom sheet (mobile)           | —                                                                                        | The mobile counterpart of a Dialog             | On desktop where a Dialog fits                                             |
| `Popover`        | Anchored non-modal panel        | —                                                                                        | Filters, quick settings, pickers               | Critical actions that need confirmation                                    |
| `Tooltip`        | Short hint                      | —                                                                                        | Icon-only buttons, truncated text              | Essential information; anything interactive inside                         |
| `HoverCard`      | Rich preview                    | —                                                                                        | Read-only previews on desktop                  | On touch devices — there is no hover                                       |
| `DropdownMenu`   | List of actions                 | with separators, destructive item                                                        | Group by kind; destructive last and separated  | Using it as a form control (that is `Select`)                              |
| `Command`        | Command palette / search        | —                                                                                        | Power-user shortcuts, `⌘K`                     | The only way to reach a feature                                            |
| `Tabs`           | Switch between peer views       | —                                                                                        | Independent views of the same object           | A sequential flow (use a Stepper)                                          |
| `Accordion`      | Collapse long secondary content | single / multiple                                                                        | FAQs, advanced settings                        | Hiding the primary content of a page                                       |
| `Table`          | Scan and compare records        | see §14                                                                                  | Sticky header, `tabular-nums`                  | Horizontal scroll on mobile                                                |
| `Pagination`     | Move through pages              | —                                                                                        | When position and order matter                 | Combined with infinite scroll on the same list                             |
| `Breadcrumb`     | Show position in a hierarchy    | —                                                                                        | ≥3 levels deep                                 | On a flat, top-level page                                                  |
| `Sidebar`        | Primary app navigation          | collapsible, icon mode                                                                   | Icon + label; badge for counts                 | More than two nesting levels                                               |
| `Toast` (sonner) | Transient confirmation          | `success` `error` `warning`                                                              | 3–4s, one line, optional action                | Errors the user cannot act on; stacking 5 at once                          |
| `ScrollArea`     | Scroll a bounded region         | —                                                                                        | One scroll container per view                  | Nested scrollbars                                                          |
| `Chart`          | Visualise aggregates            | recharts wrappers                                                                        | Axis labels, units, accessible summary         | 3-D, dual axes, more than 6 series                                         |

Not in this list? Check `pnpm ui:add` first. Only then propose a new component,
in `components/common/`, with its purpose and variants documented here.

## 7. Navigation

| Pattern        | Use when                                                           | Never                                                                                                  |
| -------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| **Sidebar**    | 5+ top-level destinations, app-like product                        | More than two levels of nesting                                                                        |
| **Top nav**    | ≤5 destinations, marketing or content site                         | Hiding primary destinations in an overflow menu                                                        |
| **Breadcrumb** | The user is ≥3 levels deep in a hierarchy                          | On a top-level page, or as a replacement for a back button                                             |
| **Tabs**       | Peer views of the _same_ object, order irrelevant, state preserved | For a sequence, for filtering, or when tab content needs its own URL and the route does not support it |
| **Stepper**    | A linear workflow with a defined end and a "back"                  | For independent views                                                                                  |
| **Command**    | Power-user shortcut to anything                                    | As the only path to a feature                                                                          |

**Sidebar rules**

- Icon **and** text at full width. Icon-only (collapsed) requires a tooltip on
  every item.
- One icon per item, from the same family (§15). Never mix filled and outline.
- Badges show counts only, and only where the count changes what the user does.
  Cap the display at `99+`.
- Collapsible groups: at most one level. The active item's group opens by
  default and the active item is marked with `aria-current="page"`.
- The active state is a background change plus a weight change — not colour
  alone.

**Rule of thumb: never use Tabs for a flow. Use a Stepper.** Tabs say "these are
alternatives"; a stepper says "these happen in order". Getting this wrong makes
users think they can skip a required step.

**Deep-link everything.** Tab, step, filter, sort and page all belong in the URL
so a reload or a shared link lands in the same place.

## 8. Layout and responsive

| Container | Width         | For                            |
| --------- | ------------- | ------------------------------ |
| Prose     | `max-w-prose` | Long-form reading              |
| Form      | `max-w-2xl`   | Single-column forms, settings  |
| App page  | `max-w-7xl`   | Dashboards, tables, list views |
| Full      | `w-full`      | Canvases, editors, maps        |

Page gutters `px-4` mobile / `px-6` from `md`; vertical padding `py-8`.
Breakpoints: `sm 640` · `md 768` · `lg 1024` · `xl 1280` · `2xl 1536`.

**Supported range: 360px to 2560px.** Every screen is checked at 360, 768 and
1440 before review.

### 8.1 The four rules that prevent most breakage

**1. Mobile-first, always.** Write the 360px styles unprefixed, then add
`sm:` `md:` `lg:` upward. Never write desktop styles and then undo them with
`max-md:`. If a `className` reads "big thing, then shrink it", it is backwards.

```
✅ flex flex-col gap-4 md:flex-row md:gap-6
❌ flex flex-row gap-6 max-md:flex-col max-md:gap-4
```

**2. One tree, not two.** Never render the same content twice and hide one copy.

```
❌ <div className="hidden md:block"><UserTable data={data} /></div>
   <div className="md:hidden"><UserCards data={data} /></div>
```

That doubles the DOM, doubles effects and fetches, lets the two copies drift
out of sync, and makes every `getByRole` in a test match twice. `hidden
md:block` is only acceptable when the two branches are genuinely _different
content_ (a desktop sidebar vs a mobile menu button), never the same data in two
shapes. For the same data in two shapes, make the component responsive with CSS:
one markup tree, `grid`/`flex` reflow, and column cells that become label/value
rows below `md`.

**3. Layout comes from CSS, not JavaScript.** `useMediaQuery` runs after
hydration, so the server renders the wrong branch, the client swaps it, and the
user sees a flash — plus a hydration mismatch. Use it only for _logic_ that CSS
cannot express (which library to lazy-load, whether to enable a drag handler),
never to decide layout.

**4. Break on content, not on device names.** A breakpoint exists because a
layout stops working at that width, not because "iPad is 768". If a card grid
breaks at 900px, add a breakpoint at 900px.

### 8.2 Responsive transformations

Layout does not just shrink — it changes form.

```
Table                     Compact table                 Stacked cards
(desktop ≥1024)      →    (tablet 768–1023)       →     (mobile <768)
all columns               3–4 key columns               label/value pairs
inline row actions        actions in DropdownMenu       actions in DropdownMenu
```

| Element                  | Desktop                | Tablet                       | Mobile                               |
| ------------------------ | ---------------------- | ---------------------------- | ------------------------------------ |
| Table                    | Full table             | Key columns only             | Stacked cards, one per record        |
| Sidebar                  | Persistent             | Collapsed to icons           | Sheet behind a menu button           |
| Dialog                   | Dialog                 | Dialog                       | Drawer (bottom sheet), full height   |
| Multi-column             | 2–3 columns            | 2 columns                    | 1 column                             |
| Toolbar                  | All actions inline     | Primary inline, rest in menu | Primary only + overflow menu         |
| Tabs                     | Horizontal tabs        | Horizontal, scrollable       | Select, or stacked sections          |
| Page header              | Title + actions inline | Title + actions inline       | Title, then actions on their own row |
| Filters                  | Inline row             | Inline, wrapping             | Sheet behind a "Filters" button      |
| Stepper                  | Horizontal with labels | Horizontal, labels below     | "Step 2 of 5" + current step title   |
| Two-pane (list + detail) | Both visible           | Both visible, narrower list  | List, then detail as its own route   |
| Sticky footer actions    | Inline in the form     | Inline in the form           | Fixed bottom bar, above safe area    |

**Never horizontally scroll a table on mobile. Convert it to stacked cards.**
The only exception is a genuine spreadsheet-like grid where column comparison is
the entire point — and then the first column is frozen, and it is documented in
§21.

### 8.3 Overflow: where mobile actually breaks

Horizontal scroll on a page is always a bug. It comes from a short list of
causes — check these first:

| Cause                                    | Fix                                                           |
| ---------------------------------------- | ------------------------------------------------------------- |
| A flex child refusing to shrink          | `min-w-0` on the flex child (this is the #1 cause)            |
| Truncation not working inside flex       | `min-w-0` on the parent **and** `truncate` on the child       |
| A long email, URL, ID or hash            | `break-words`, or `truncate` with the full value in a tooltip |
| `w-screen` inside a padded container     | `w-full` — `w-screen` ignores the parent's padding            |
| A fixed pixel width                      | `max-w-*` + `w-full`                                          |
| A grid with a large `minmax()` minimum   | Lower the minimum, or `grid-cols-1` below `sm`                |
| Negative margins on a full-bleed section | Pair with matching padding, and clip at the container         |
| An unconstrained image or embed          | `max-w-full h-auto`, or `next/image` with `fill`              |
| Absolutely positioned decoration         | Clip it with `overflow-hidden` on a positioned ancestor       |

Guard it in CI rather than by eye — `e2e/responsive.spec.ts` fails the build if
any supported viewport can scroll horizontally, and names the widest offending
element so the fix is obvious.

`overflow-x-auto` is blocked by ESLint because it is the usual lazy fix for a
table that should have become cards. A genuine horizontal scroll region — a code
block, a tab strip, a carousel — is allowed, but it takes an explicit
`// eslint-disable-next-line no-restricted-syntax` and a line in §21. Making it
deliberate is the point.

### 8.4 Viewport and mobile chrome

- Use `dvh`, never `vh`. `h-screen` (`100vh`) is taller than the visible area on
  mobile browsers, so the bottom of the layout sits under the URL bar. ESLint
  blocks `h-screen`/`min-h-screen`.
- A fixed bottom bar respects the safe area: `pb-[env(safe-area-inset-bottom)]`.
- The on-screen keyboard covers roughly the bottom 40% on mobile. A submit
  button fixed to the bottom of a form must stay reachable — put it in flow, or
  test with the keyboard open.
- Only one fixed/sticky region per axis. A sticky header plus a sticky filter
  bar plus a sticky footer leaves no content visible on a 360×640 screen.
- `overflow-hidden` on a container clips focus rings and dropdowns. If you need
  it for rounded corners, check keyboard focus still shows.

### 8.5 Touch

- Targets ≥44×44px below `md`. `size-8` icon buttons are fine on desktop and too
  small on mobile — use `size-11` (44px) or add padding.
- Adjacent targets need ≥8px between them; two icon buttons touching is a
  mis-tap generator.
- **Every hover affordance needs a tap equivalent.** Row actions revealed on
  hover, HoverCard previews, and tooltip-only labels are invisible on touch. If
  hover is the only way to reach something, it does not exist on mobile.
- No hover-dependent menus. Tap opens, tap outside closes.
- Never disable zoom (`user-scalable=no`, `maximum-scale=1`).

### 8.6 Typography and density

- Body text never goes below `text-sm` (14px) on mobile; form inputs stay at
  16px or iOS zooms the page on focus.
- Line length stays under ~75ch — that usually means the container caps out
  before the viewport does.
- Long headings need `text-balance`; long paragraphs need `text-pretty`.
- Reduce padding, not font size, when space is tight.

## 9. Interaction states

Every interactive element defines all of these:

| State    | Treatment                                                            |
| -------- | -------------------------------------------------------------------- |
| Default  | Base token styling                                                   |
| Hover    | `hover:bg-accent` or a one-step surface shift                        |
| Focus    | Global `:focus-visible` ring — never removed                         |
| Active   | Slight compression or darker surface                                 |
| Disabled | `disabled:pointer-events-none disabled:opacity-50` + a reason nearby |
| Loading  | Spinner replaces the label, width held, control disabled             |
| Selected | `bg-accent text-accent-foreground` + `aria-selected`                 |
| Invalid  | `aria-invalid` + message below the field, never colour alone         |

A disabled control with no explanation is a dead end. Either say what unlocks it
(tooltip, helper text) or leave it enabled and explain on failure.

## 10. Permission and availability states

These are **not errors**. Nothing failed — the user simply cannot do this. They
get their own treatment, and never a red alert.

| State                 | Looks like                                                                                         | Copy pattern                                          |
| --------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| **No permission**     | The action is not rendered at all. If its absence is confusing, render it disabled with a tooltip. | "Only workspace admins can do this."                  |
| **Read only**         | Full content, inputs `readOnly`, edit actions hidden, one inline `Alert` at the top                | "You have view access to this project."               |
| **Feature disabled**  | The feature's surface with an `EmptyState` and an enable path                                      | "Audit logs are turned off for this workspace."       |
| **Plan / licence**    | Content visible but muted or partially masked, with an upgrade CTA                                 | "Upgrade to Business to export more than 100 rows."   |
| **Resource locked**   | Content visible, editing blocked, holder and expected release shown                                | "Being edited by Mai since 10:24."                    |
| **Not yet available** | `EmptyState` explaining what has to happen first                                                   | "Reports appear after your first full billing cycle." |

Rules:

- Hide what the user can never access; disable-with-reason what they could
  access under different conditions. Never show a control that silently does
  nothing.
- Permission is checked on the server too. Hiding a button is UX, not security.
- Never use the destructive colour for a permission state — nothing went wrong.
- Never route a permission problem to the error boundary.

## 11. Feedback

| Situation                             | Use                                             |
| ------------------------------------- | ----------------------------------------------- |
| Action succeeded, no follow-up needed | Toast, 3–4s                                     |
| Action failed, recoverable            | Toast with a retry action                       |
| Action failed, tied to a field        | Inline field error                              |
| Whole view failed to load             | `<ErrorState>` with retry                       |
| Irreversible action                   | `AlertDialog` naming the object and consequence |
| Long operation (> 1s)                 | Button loading state, then toast                |
| Background sync                       | Subtle inline indicator, no toast               |
| User cannot perform the action        | §10, not an error                               |

Never confirm what is obvious ("Saved!" after the row visibly updated), and
never toast an error the user cannot act on.

## 12. Async UX

Loading is the easy half. These are the rest.

| Pattern                | Rule                                                                                                                                                      |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Optimistic update**  | Only when failure is rare and the change is cheap to undo (toggle, reorder, like). Never for payments, deletes or anything with a server-generated value. |
| **Rollback**           | On failure, restore the previous state **and** say what happened: "Could not save — your change was undone." Silent reverts destroy trust.                |
| **Retry**              | Automatic retry once for idempotent reads. Never auto-retry a mutation — offer a retry button so the user chooses.                                        |
| **Background refresh** | Keep the current data visible, dim it slightly. Never blank the screen on a refetch.                                                                      |
| **Stale data**         | If data is older than the refresh interval, say so quietly: "Updated 5 minutes ago."                                                                      |
| **Offline**            | One persistent banner, not a toast per failed request. Disable mutations, keep reads working from cache.                                                  |
| **Conflict (409)**     | Never overwrite silently. Show both versions and let the user choose, or reload with a clear explanation of what changed.                                 |
| **Slow response**      | < 300ms show nothing · 300ms–1s inline spinner · > 1s skeleton or progress · > 10s explain the delay and offer to continue in the background.             |
| **Double submit**      | Disable on submit and guard server-side. Every mutation is idempotent or protected.                                                                       |

### Loading patterns

| Situation               | Pattern                                     |
| ----------------------- | ------------------------------------------- |
| First paint of a route  | `loading.tsx` skeleton mirroring the layout |
| Section within a page   | `<Suspense>` + skeleton                     |
| Button-triggered action | In-button spinner, control disabled         |
| Refetch of visible data | Keep old data, dim slightly                 |
| Under 300ms             | Show nothing                                |

Skeletons match the shape of the real content. A generic grey box that jumps to
a different layout is worse than a spinner.

## 13. Empty states

Fixed structure, in this order. Skip the optional parts; never reorder.

```
        [ Icon or illustration ]     ← optional, one per screen, muted
                   ↓
                 Title              ← what is missing, in the user's words
                   ↓
              Description           ← one sentence: what appears here, or what to do
                   ↓
             Primary CTA            ← the single next action, omit if none exists
                   ↓
             Secondary link         ← optional: docs, import, learn more
```

```
              📄
        No invoices yet
   Create your first invoice to
      start tracking payments.
       [ Create invoice ]
        Import from CSV
```

| Kind of empty           | Title                             | Description                                 | CTA                 |
| ----------------------- | --------------------------------- | ------------------------------------------- | ------------------- |
| **First use**           | "No invoices yet"                 | What appears here once they start           | The creating action |
| **No search results**   | "No results for 'foo'"            | Suggest broadening or checking the spelling | Clear filters       |
| **Filtered to nothing** | "No invoices match these filters" | Name the filters causing it                 | Reset filters       |
| **Cleared / done**      | "All caught up"                   | Confirm this is a good state                | None                |
| **Not available yet**   | See §10                           |                                             |                     |

Rules: never "No data" or "Nothing to display". Never an empty state where a
skeleton belongs — loading is not empty. Never a destructive-coloured empty
state; nothing has gone wrong.

## 14. Tables

Structure, left to right, always in this order:

```
[ selection ] [ primary identifier ] [ ...data columns ] [ status ] [ actions ]
```

- **Selection checkbox is always the first column.** Header checkbox selects the
  page, shows indeterminate for a partial selection, and states the count.
- **Actions are always the last column**, right-aligned. ≤2 → icon buttons with
  tooltips; >2 → `DropdownMenu`, destructive item last and separated.
- The primary identifier is the second column and links to the detail view.

| Capability                      | Rule                                                                                                                                                                                                  |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Sorting**                     | One column at a time by default; the sort key lives in the URL. Show the direction arrow on the active column only.                                                                                   |
| **Filtering**                   | Above the table, left-aligned. Active filters render as removable chips with a "Clear all". Filter state lives in the URL.                                                                            |
| **Bulk selection**              | Selecting anything reveals a bulk action bar that replaces the toolbar. It states "12 selected", offers bulk actions, and a way to clear. "Select all N across pages" is a separate, explicit choice. |
| **Column resize**               | Optional. Persist per user if enabled; provide a reset.                                                                                                                                               |
| **Column reorder / visibility** | Only for tables over ~8 columns. Persist per user.                                                                                                                                                    |
| **Sticky**                      | Header always sticky. Sticky first column only when there are more columns than fit, and only on desktop.                                                                                             |
| **Density**                     | Support `comfortable` (default) and `compact`. Persist per user. Row height changes; font size does not.                                                                                              |
| **Virtualisation**              | Required above 100 rows on screen (§17). Below that, plain rendering.                                                                                                                                 |
| **Row click**                   | Navigates to the detail view. The row is keyboard focusable. Buttons inside the row stop propagation.                                                                                                 |
| **Alignment**                   | Text left, numbers right with `tabular-nums`, dates in one consistent format.                                                                                                                         |
| **Counts**                      | Always show the total: "24 invoices". Never a vague quantity.                                                                                                                                         |
| **Loading**                     | Skeleton rows with the real column widths, not a centred spinner.                                                                                                                                     |
| **Empty**                       | `EmptyState` inside the table body, spanning all columns (§13).                                                                                                                                       |
| **Mobile**                      | Stacked cards (§8). Never horizontal scroll.                                                                                                                                                          |

## 15. Iconography

**One icon family: `lucide-react`. Never mix in another set, and never mix
filled with outline.** Sizes are `size-4` (inline, buttons) or `size-5`
(navigation, empty states) — nothing else without a reason.

| Meaning            | Icon                     | Meaning         | Icon                       |
| ------------------ | ------------------------ | --------------- | -------------------------- |
| Delete             | `Trash2`                 | Settings        | `Settings`                 |
| Edit               | `Pencil`                 | Search          | `Search`                   |
| Add / create       | `Plus`                   | Filter          | `ListFilter`               |
| Download           | `ArrowDown` / `Download` | Sort            | `ArrowUpDown`              |
| Upload             | `Upload`                 | More actions    | `MoreHorizontal`           |
| Close              | `X`                      | External link   | `ExternalLink`             |
| Confirm / done     | `Check`                  | Copy            | `Copy`                     |
| Back               | `ArrowLeft`              | Refresh         | `RefreshCw`                |
| Expand             | `ChevronDown`            | Loading         | `Loader2` + `animate-spin` |
| Success            | `CircleCheck`            | Warning         | `TriangleAlert`            |
| Error              | `CircleAlert`            | Info            | `Info`                     |
| User               | `User`                   | Logout          | `LogOut`                   |
| Lock / no access   | `Lock`                   | Visibility      | `Eye` / `EyeOff`           |
| Short link / brand | `Link2`                  | Expiry / time   | `Clock` / `CalendarClock`  |
| Clicks             | `MousePointerClick`      | Quick / instant | `Zap`                      |

Rules:

- One meaning, one icon, everywhere in the app. Add new mappings to this table.
- Icon-only buttons need an `aria-label` **and** a tooltip. Both.
- An icon never replaces a label for a primary action.
- Never use an icon decoratively next to a heading just to fill space.
- Directional icons flip in RTL; semantic icons do not.

## 16. Motion

- Animate `transform` and `opacity` only. **Never animate layout properties**
  (`width`, `height`, `top`, `margin`) — they force reflow and stutter. If a
  size must change, use `scale`, or accept an instant change.
- Use the duration tokens (§3). No ad-hoc `duration-[450ms]`.
- **Avoid animation during navigation.** Route transitions should feel instant;
  an entrance animation on every page delays the content and compounds with
  loading states.
- Nothing loops forever except a loading indicator.
- Entrances may animate; exits should be faster or instant. Waiting for a
  fade-out to dismiss a dialog feels broken.
- One animated thing at a time in a region. Staggering ten cards is decoration,
  not feedback.
- `prefers-reduced-motion` is honoured globally — never override it.

## 17. Performance

| Rule                                                                                                                       |
| -------------------------------------------------------------------------------------------------------------------------- |
| Virtualise any list or table rendering more than **100 rows** at once.                                                     |
| Paginate at the source. Never fetch 1,000 records to display 20.                                                           |
| Debounce search and filter input at **300ms**; cancel the in-flight request on change.                                     |
| Lazy-load Dialog, Sheet, Drawer, Chart and editor content — `next/dynamic`, not top-level imports.                         |
| Every image goes through `next/image` with explicit `width`/`height` or `fill`. Above-the-fold hero images use `priority`. |
| Memoise only after measuring. `useMemo` on a cheap computation costs more than it saves.                                   |
| Keep client bundles small: a chart library or date library imported into a layout ships on every route.                    |
| No layout shift: reserve space for images, avatars and async content. Skeletons have the final dimensions.                 |
| One scroll container per view. Nested scrollbars are both a UX and a performance problem.                                  |
| Server Components fetch in parallel — `Promise.all`, not sequential `await`s.                                              |

## 18. Accessibility

The floor, checked in review.

**Structure and semantics**

- `button` for actions, `a`/`Link` for navigation. Never a clickable `div`.
- One `h1` per page; heading levels never skip.
- Landmarks: `header`, `nav`, `main` (with `id="main"` for the skip link),
  `footer`. One `main` per page.
- Lists are `ul`/`ol`. Tables use `th` with `scope`, and a `caption` or an
  `aria-label` naming the table.

**Labels and names**

- Every input has a `<label htmlFor>`. Placeholder is never the label.
- Icon-only buttons: `aria-label` + tooltip.
- Help text and error text are linked with `aria-describedby`; invalid fields
  set `aria-invalid`.
- Link text makes sense alone — never "click here" or a bare "read more".

**Roles and state**

- Prefer a real element over a role. Reach for Radix primitives before ARIA.
- Toggles: `aria-pressed`. Expandables: `aria-expanded` + `aria-controls`.
  Current page: `aria-current="page"`. Selected rows: `aria-selected`.
- Decorative icons: `aria-hidden="true"`.

**Live regions**

- Toasts announce via `role="status"` (`aria-live="polite"`).
- Errors and failures use `role="alert"` (`aria-live="assertive"`) — sparingly.
- Async result counts announce politely: "24 results". Never announce every
  keystroke.
- Never put a live region on content that updates constantly.

**Keyboard and focus**

- Tab order follows visual order. No positive `tabIndex`.
- Dialog, Sheet and Drawer trap focus, close on `ESC`, and return focus to the
  trigger on close.
- Menus and listboxes: arrow keys move, `Home`/`End` jump, typing jumps to a
  match. Radix gives you this — do not reimplement it.
- Focus is always visible. Never `outline: none` without a replacement.
- After a destructive action, move focus somewhere sensible — not to a removed
  element.

**Perception**

- Text contrast ≥ 4.5:1; UI and graphic boundaries ≥ 3:1.
- Never colour alone: pair with an icon, text or pattern.
- Touch targets ≥ 44×44px on touch devices.
- Content is usable at 200% zoom and at 320px width.

## 19. Copy

Words are part of the design. **Every string lives in `messages/en.json`** —
that file is the copy deck, and reading it top to bottom should tell you what
the product sounds like. Nothing is hardcoded in a component.

Key naming mirrors the UI, not the code: `states.emptyDescription`, not
`comp.es.d`. When two screens need the same word, that is a `common.*` key.

- **Name things by what the person does**, not how the system works.
  "Notification settings", not "Webhook configuration".
- **Active voice, sentence case.** "Save changes", not "Submit".
- **One name per action across the flow.** A button labelled "Publish" produces
  a toast that says "Published".
- **Errors say what happened and what to do next.** They do not apologise and
  they are never vague.
- **Empty states are an invitation**, not a statement of absence (§13).
- **Each element does one job.** A label labels, help text explains, an example
  demonstrates.
- **Write for translation.** One message per sentence, never assembled from
  fragments — word order differs by language. Variables go through ICU
  placeholders (`{count}`, `{name}`); anything countable uses an ICU `plural`
  block rather than an `if` in the component.
- **Leave room.** German and Vietnamese run 20–35% longer than English. Buttons
  and labels must not depend on a fixed width to look right.

## 20. Anti-patterns

Rejected in review. If a request implies one of these, say so and propose the
alternative.

### 20.1 The ones AI gets wrong most often

These are the recurring failure modes in generated UI. Check this list against
your own output before returning it.

Rows marked **[lint]** are enforced by ESLint, so `pnpm lint` catches them. The
rest are on you.

| ❌ Instead of                                                        | ✅ Do this                                                             |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Building a component that already exists in §6                       | Search §6 and `pnpm ui:add` first                                      |
| Inventing a name: `Modal`, `Popup`, `Snackbar`, `NoDataView`         | Use the vocabulary in §4                                               |
| Inventing a token: `bg-brand-500`, `text-gray-700` **[lint]**        | Only the tokens in §3 exist; a missing token means the design is wrong |
| Two hidden trees for mobile and desktop                              | One tree that reflows (§8.1)                                           |
| `useMediaQuery` deciding layout                                      | CSS breakpoints (§8.1)                                                 |
| `h-screen` / `100vh` **[lint]**                                      | `h-dvh` (§8.4)                                                         |
| Wrapping a table in `overflow-x-auto` to "fix" mobile **[lint]**     | Stacked cards below `md` (§8.2)                                        |
| `z-[9999]` to win a stacking fight **[lint]**                        | Fix the stacking context; Radix portals already layer correctly        |
| `!` important, or `style={{}}` to override a component **[lint]**    | Add a `cva` variant                                                    |
| Arbitrary values: `w-[327px]`, `mt-[13px]`, `text-[13px]` **[lint]** | The spacing and type scales (§3)                                       |
| Copying the same 12 classes onto five elements                       | One component with variants                                            |
| A generic `<DataDisplay>` with 15 props                              | Two specific components                                                |
| `any`, or `as unknown as X`, to silence the compiler **[lint]**      | Narrow the type, or fix the contract                                   |
| `useEffect` + `fetch` for initial data                               | Server Component, or TanStack Query                                    |
| `'use client'` on a layout or page to fix one child                  | Push the boundary down to the child                                    |
| An emoji used as an icon                                             | lucide-react (§15)                                                     |
| Gradient + `rounded-2xl` + `shadow-xl` on everything                 | The elevation ladder in §3                                             |
| Hardcoded English strings **[lint]**                                 | `messages/en.json` + `t()` (§19)                                       |
| `toLocaleDateString('en-US')`                                        | `useFormatter` / `getFormatter`                                        |
| Array index as a React key **[lint]**                                | A stable id from the data                                              |
| Nested ternaries inside JSX                                          | Extract to a variable or an early return                               |
| Comments restating what the code does                                | Comment _why_, or delete it                                            |
| Lorem ipsum or placeholder copy left in                              | Real copy, in `messages/en.json`                                       |
| `console.log` left behind **[lint]**                                 | Remove it                                                              |
| Adding features that were not asked for                              | Do the task; mention the idea separately                               |
| Rewriting a whole file for a two-line change                         | The smallest diff that solves it                                       |
| Adding a dependency for something 30 lines solve                     | Write the 30 lines                                                     |
| `aria-label` on an element that already has visible text             | Nothing — the visible text is the name                                 |
| `role="button"` + `onClick` + `tabIndex` on a `div`                  | `<button>`                                                             |
| `aria-live` on everything                                            | One live region per purpose (§18)                                      |
| A centred page spinner                                               | A skeleton shaped like the content (§12)                               |
| A toast after every interaction                                      | Only when there is no visible result (§11)                             |
| Shipping only the happy path                                         | Five states, every time (§9–§13)                                       |

### 20.2 Structure

- ❌ Nested dialogs → a page, a stepper, or replace the dialog's content
- ❌ Double scrollbars / nested scroll containers → one scroll container per view
- ❌ Horizontal scroll on mobile → stacked cards (§8.2)
- ❌ Cards inside cards → a section with a heading
- ❌ Tabs used for a sequential flow → Stepper (§7)
- ❌ Three sticky regions on one mobile screen → at most one per axis (§8.4)
- ❌ A modal that opens a modal that opens a toast → rethink the flow

### 20.3 Actions

- ❌ Two primary buttons in one region → one primary, the rest secondary
- ❌ More than 3 button variants on a screen → primary / secondary / ghost
- ❌ Confirmation for a non-destructive action → do it, and offer undo
- ❌ A destructive action with no confirmation and no undo → one or the other
- ❌ Disabled Save with no explanation → say what is missing
- ❌ Icon-only primary action → add the label
- ❌ An action reachable only on hover → it does not exist on touch (§8.5)

### 20.4 Forms and inputs

- ❌ Placeholder instead of a label → always a real `<label>`
- ❌ Validating on every keystroke before first blur → validate on blur
- ❌ A `Select` for two options → `Switch` or `Radio Group`
- ❌ Free-text date entry with no picker → `Date Picker`
- ❌ Clearing the user's input on a validation error → never
- ❌ Inputs below 16px on mobile → iOS zooms the page (§8.6)

### 20.5 Feedback and state

- ❌ A spinner where a skeleton belongs → skeleton matching the layout
- ❌ Blanking the screen on refetch → keep the old data, dim it
- ❌ Toasting an error the user cannot act on → inline, or log it
- ❌ Permission problems styled as errors → §10
- ❌ Silent optimistic rollback → always say what happened
- ❌ "No data" as an empty state → §13

### 20.6 Styling

- ❌ Hex codes, arbitrary values, inline `style` → tokens (§3)
- ❌ Two icon families, or filled mixed with outline → lucide only (§15)
- ❌ Animating `width`/`height`/`top` → `transform` and `opacity` (§16)
- ❌ Colour as the only carrier of meaning → add an icon or text
- ❌ Sibling margins for spacing → `gap` on the parent
- ❌ Absolute positioning to fix a layout → fix the layout

## 21. Deviations log

Record every deliberate departure from this document or from upstream
shadcn/ui, so the next reader — human or agent — knows it was a choice.

| Date       | What changed                                                                                                                                                                  | Why                                                                                                                                                                                                                                                        |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-10-10 | Expiry uses native `<input type="datetime-local">` instead of a Date Picker (superseded 2026-10-17)                                                                           | The shadcn Date Picker needs `react-day-picker` + `date-fns` (a second date library); the native control is a real picker on every mobile and desktop browser and supports typed entry.                                                                    |
| 2026-10-10 | Links page container is `max-w-5xl`, not `max-w-7xl`                                                                                                                          | One list column of five fields; at 7xl the row stretches into long empty gaps. Header shares the same width.                                                                                                                                               |
| 2026-10-10 | Landing hero `h1` is `text-4xl sm:text-5xl font-bold` (superseded 2026-10-17)                                                                                                 | Marketing hero only; app screens keep the §3 `text-2xl` page title.                                                                                                                                                                                        |
| 2026-10-10 | Link rows are a `ul` of cards that become one horizontal row at `lg`, not a `Table`                                                                                           | Five fields per record, no sorting or selection; one markup tree reflows from stacked card (<1024) to row (≥1024). `md` was too narrow for the short link + badge.                                                                                         |
| 2026-10-10 | Row Copy/Delete show their text label below `lg` and become icon + tooltip from `lg`                                                                                          | Tooltips do not exist on touch (§8.5); label stays the accessible name via `lg:sr-only`.                                                                                                                                                                   |
| 2026-10-17 | Brand primary moved from blue to deep teal (`oklch(0.511 0.096 186)` light, `oklch(0.777 0.152 182)` dark); dark surfaces are neutral slate instead of navy                   | UI redesign. Teal separates the product from generic SaaS blue; white on primary is 5.5:1, dark primary-foreground on primary passes 4.5:1.                                                                                                                |
| 2026-10-17 | Two decorative utilities in `globals.css`: `bg-glow` (primary radial tint) and `bg-grid` (masked border-colour grid)                                                          | Only on an `aria-hidden` layer behind the landing hero, the auth screens and the shorten card. Built from tokens, so both themes follow; never a surface for content.                                                                                      |
| 2026-10-17 | Landing hero `h1` grows to `sm:text-6xl`; hero CTAs and the shorten input/button are `h-12 text-base`                                                                         | Marketing hero and the one primary input on the dashboard get extra weight; app headings keep the §3 scale.                                                                                                                                                |
| 2026-10-17 | Shorten card and auth card use `shadow-md` instead of `shadow-sm`                                                                                                             | Each is the single focal surface of its screen; list rows keep `shadow-sm` and lift to `shadow-md` on hover.                                                                                                                                               |
| 2026-10-17 | Expiry is a Date Picker (`Popover` + `Calendar`) plus a native `<Input type="time">` in `features/links/components/expiry-picker.tsx`                                         | Requested design. shadcn has no time picker; its own date-time example pairs `Calendar` with a time `Input`. Adds `react-day-picker` only — dates are formatted with next-intl, `date-fns` is not a direct dependency. Calendar cells are 44px below `sm`. |
| 2026-10-17 | `ui/calendar.tsx` and `ui/popover.tsx` import `cn` from `@/lib/utils`                                                                                                         | The CLI generated `from "cn"` (an unrelated npm package) despite `components.json` aliasing `utils` to `@/lib/utils`. Re-apply after any `ui:add` overwrite.                                                                                               |
| 2026-10-17 | Row delete trigger is ghost with destructive text and a `destructive/10` hover tint                                                                                           | Signals the destructive action up front without a solid red button on every row; the AlertDialog confirm keeps the solid `destructive` variant.                                                                                                            |
| 2026-10-18 | Admin area uses the `max-w-7xl` app-page container while the site header stays `max-w-5xl`                                                                                    | Admin tables have five or six columns; at 5xl they wrap. The header is shared with the links page and keeps its width.                                                                                                                                     |
| 2026-10-18 | Admin navigation is a `nav` list that wraps as a row below `lg` and stands as a column from `lg`, not `Sidebar` + `Sheet`                                                     | Four destinations (§7 asks for a sidebar from five). One tree, every item visible at 360px, no menu button and no extra component.                                                                                                                         |
| 2026-10-18 | Admin lists are `Table` rows that become stacked cards below `md` through CSS (`features/admin/components/stacked-table.tsx`)                                                 | §8.2 asks for cards on mobile and forbids two trees. The header is `hidden md:table-header-group`; each cell carries its own label, `md:hidden`. The shadcn table wrapper's `overflow-x-auto` never engages.                                               |
| 2026-10-18 | Admin status filters (3–4 options) and the dashboard range (3 options) use `Select`, not `Radio Group`                                                                        | They sit inline beside the search box above a table (§14 filters). A vertical radio group would push the table down a screen on mobile.                                                                                                                    |
| 2026-10-18 | Enabling a user or link asks for confirmation (`AlertDialog`, default confirm variant, no reason field)                                                                       | Admin spec §6.3: every admin state change is confirmed. Enabling makes public links redirect again and writes an audit row, so it is not a casual toggle.                                                                                                  |
| 2026-10-18 | Dashboard shows one line chart per metric instead of one chart with three series, and loads the chart with `next/dynamic`                                                     | Clicks run orders of magnitude above sign-ups; one axis flattens two series, and §6 forbids dual axes. The site header imports the admin feature for its menu entry, so a static import shipped recharts on every page.                                    |
| 2026-10-18 | `ui/chart.tsx`, `ui/select.tsx`, `ui/table.tsx`, `ui/textarea.tsx` import `cn` from `@/lib/utils`; `ui/chart.tsx` keys tooltip and legend rows by series key, not array index | Same CLI `cn` bug as 2026-10-17. The generated index keys fail `react/no-array-index-key`; the series key is unique per row. Re-apply after any `ui:add` overwrite.                                                                                        |
| 2026-10-18 | Chart tokens `--chart-1..3` added to `globals.css` (light and dark); `--chart-1` is `--primary`                                                                               | The chart CLI did not write them. Series 2 and 3 are hues apart from teal and from destructive red.                                                                                                                                                        |

## 22. Review checklist

- [ ] The component came from §6; a new one is justified and documented
- [ ] The choice follows the decision trees in §5
- [ ] Naming follows §4 — no "Modal", "Popup" or "Snackbar"
- [ ] Tokens only — no hex, no arbitrary values, no inline `style`
- [ ] Loading, empty, error, permission and success states all handled (§9–§13)
- [ ] Keyboard reachable, focus visible, labels and ARIA per §18
- [ ] Contrast ≥ 4.5:1, touch targets ≥ 44px
- [ ] Works at 360px, 768px and 1440px, with the right transformation at each (§8.2)
- [ ] One markup tree — no `hidden md:block` duplicate of the same content (§8.1)
- [ ] No horizontal overflow at any width; `min-w-0` on shrinking flex children (§8.3)
- [ ] `dvh` not `vh`; at most one sticky region per axis (§8.4)
- [ ] Every hover affordance has a tap equivalent; targets ≥44px (§8.5)
- [ ] Correct in both light and dark
- [ ] No hardcoded strings; new keys in `messages/en.json` and `pnpm i18n:check` passes
- [ ] Layout survives text 35% longer than the English source
- [ ] Performance rules respected — virtualisation, debounce, lazy-loading (§17)
- [ ] Motion uses the duration tokens, `transform`/`opacity` only, reduced motion respected
- [ ] Ran the §20.1 self-check against the generated output
- [ ] Nothing from §20.2–§20.6
- [ ] Reused an existing pattern, or logged the deviation in §21
