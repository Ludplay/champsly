# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Commands

```bash
npm run dev       # Start Vite dev server (port 5173, hot-reload)
npm run build     # Type-check with tsc then bundle with Vite
npm run lint      # ESLint across all source files
npm run preview   # Serve the dist/ build locally
```

No test framework is installed. Type-checking only runs as part of `build`.

The dev server proxies `/api/*` → `http://truco-platform-backend:4001/*`, **stripping the `/api` prefix** before forwarding. Override with `VITE_API_URL` env var.

---

## Architecture

### Navigation

There is no router. `App.tsx` switches between pages via a single `useState`:

```ts
const [currentPage, setCurrentPage] = useState<
  'ongoing' | 'players' | 'tournaments' | 'groups' | 'phases' | 'tests' | 'codeTests'
>('ongoing')
```

Adding a new page: add a value to this union, a nav `<button>`, and a branch in the conditional render. Do not add a router.

### Feature slice layout

Every entity lives in `src/features/<entity>/` with this internal structure:

```
types/       TypeScript interfaces (Entity + EntityInput)
services/    *-api.ts  — axios calls, one function per endpoint
hooks/       use-*.ts  — useState+useCallback managing loading/error/data
components/  Presentational: <EntityTable>, <EntityForm>
pages/       Orchestrators: mode state ('list'|'create'|'edit'), compose the above
```

Each service file creates its own `axios` instance pointed at `VITE_API_URL ?? '/api'`. There is no shared singleton.

### State pattern

No global state library. Each feature hook owns its state and exposes mutator callbacks. Mutations update local state optimistically on success rather than re-fetching the list.

Page components hold UI mode state and validate input before calling hook mutators:

```ts
const [mode, setMode]           = useState<'list' | 'create' | 'edit'>('list')
const [selected, setSelected]   = useState<Entity | null>(null)
const [formError, setFormError] = useState<string | null>(null)
```

### Hooks with optional scoping

`useGroups(tournamentId?, options?)` accepts an optional tournament ID. When `options.skipIfNoTournamentId` is true the hook returns empty state silently until an ID is provided (used on `OngoingTournamentPage` to avoid a spurious full-list fetch).

`useMatches(tournamentId?)` similarly skips fetching when no ID is supplied.

### Cross-feature complexity

`OngoingTournamentPage` is the most complex component — it composes `useTournaments`, `useGroups`, and `useMatches` to build a live dashboard with inline score editing. Scores are kept in per-match local state and saved via `PUT /match/:id`.

One backend quirk: matches are fetched from `GET /tournament/:id/matchs` (note: `matchs`, not `matches` — this is intentional to match the backend route).

---

## Stack & Tooling

| Tool | Version | Role |
|------|---------|------|
| React | 19 | UI framework |
| TypeScript | ~6 | Type safety |
| Vite | 8 | Build & dev server |
| Tailwind CSS | 3 | Utility-first styling |
| shadcn/ui | radix-nova style | Component library |
| radix-ui | 1.4 | Primitive headless components |
| class-variance-authority (cva) | 0.7 | Component variant API |
| clsx + tailwind-merge | latest | Dynamic class merging via `cn()` |
| lucide-react | 1.16 | Icons (only icon source in code) |
| axios | 1.16 | HTTP client |
| Geist Variable | @fontsource-variable/geist | Primary font (pre-loaded in `index.css`) |
| tw-animate-css | 1.4 | Animation utilities |

---

## Component Library — shadcn/ui

Configuration: `components.json` (style: `radix-nova`, base color: `neutral`, CSS variables: true).

Path alias: `@/` → `src/`. Always import UI primitives from `@/components/ui/*`.

Installed primitives: `button`, `input`, `table`, `dialog`, `card`, `navigation-menu`, `separator`, `sheet`, `skeleton`, `tooltip`.

All follow the `data-slot` attribute pattern for targeted CSS. Keep `data-slot` when editing shadcn components.

### Button variants & sizes

```tsx
variant: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link'
size:    'default' | 'xs' | 'sm' | 'lg' | 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg'
```

### `cn()` utility

```ts
import { cn } from '@/lib/utils'
```

Always use `cn()` for conditional Tailwind class merging, never string concatenation.

---

## Design Tokens

All tokens are OKLCH CSS variables defined in `src/index.css`. **Never hardcode color values.**

Key tokens: `--background`, `--foreground`, `--primary`, `--muted`, `--muted-foreground`, `--destructive`, `--border`, `--input`, `--ring`, `--radius` (0.625rem). The `.dark` class inverts most values.

Font: `font-sans` → Geist Variable (pre-loaded). Do not add `@import` in component files.

---

## Layout Patterns

```tsx
// Page container
<main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">

// Section card
<section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

// Page header card (eyebrow + title + description + optional action)
<div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">

// 2-col responsive grid
<div className="grid gap-6 lg:grid-cols-2">

// Empty state (dashed border)
<div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-slate-700">

// Error state
<div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
```

---

## Form Patterns

```tsx
<form onSubmit={handleSubmit} className="space-y-4">
  <div className="space-y-2">
    <label className="block text-sm font-medium text-slate-700">Label</label>
    <Input value={value} onChange={...} placeholder="..." />
    {error && <p className="text-sm text-destructive">{error}</p>}
  </div>
  <div className="flex flex-wrap gap-2">
    <Button type="submit">Submit</Button>
    <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
  </div>
</form>
```

`<select>` elements replicate `Input` styling manually (no shadcn Select is installed):

```tsx
className="w-full h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
```

---

## Icon System

`lucide-react` is the only icon source for feature components. Import by name:

```tsx
import { XIcon, PencilIcon, Trash2Icon } from 'lucide-react'
```

`public/icons.svg` holds social/brand icons used only in static markup via `<use href="/icons.svg#icon-id" />`.

---

## Figma MCP — Key Instructions

### Color usage in Figma

- Map all CSS variables to Figma variables with the same names.
- Base everything on `--neutral` scale (shadcn `neutral` base color).
- Primary brand is near-black (`oklch(0.205 0 0)`), not a saturated hue.
- Use `--destructive` (warm red) only for delete/error states.

### Components to create in Figma

| Component | Figma Variants |
|-----------|---------------|
| Button | variant × size grid (6 variants × 8 sizes) |
| Input | default, focus, disabled, error states |
| Table | with header, body rows, hover state |
| Dialog | with/without close button, footer variants |
| Card (page section) | rounded-3xl, border, shadow |
| Page header card | with/without action button, responsive |
| Status badge | light/dark pill |
| Player row | with stats badges |
| Empty state | dashed border variant |
| Error state | red border variant |
| Nav bar | desktop horizontal |

### Spacing & radius

- **Border radius:** `var(--radius)` = `0.625rem` base. Cards: `rounded-3xl` (1.5rem). Pills: `rounded-full`.
- **Gap scale:** `gap-2` (8px), `gap-3` (12px), `gap-4` (16px), `gap-6` (24px), `gap-8` (32px).
- **Container:** max-width `72rem` (`max-w-6xl`), padding `1rem`/`1.5rem`/`2rem` at sm/lg breakpoints.

### Responsive breakpoints (Tailwind defaults)

| Prefix | Min-width |
|--------|-----------|
| `sm:` | 640px |
| `md:` | 768px |
| `lg:` | 1024px |
| `xl:` | 1280px |

### Code generation rules

1. Import from `@/components/ui/*` — never create new primitive components when a shadcn one exists.
2. Use `cn()` for all className merging.
3. Keep `data-slot` attributes when editing shadcn components.
4. Type all props with TypeScript interfaces, never `any`.
5. New entity features go in `src/features/<entity>/` with the same `types/services/hooks/components/pages` breakdown.
6. New features use the same local hook pattern — no global state.
7. New pages are added as `useState` branches in `App.tsx` — no router.
