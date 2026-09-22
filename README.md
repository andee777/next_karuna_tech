# Karuna Technologies — Marketing Site

The public marketing website for **Karuna Technologies**, a software studio offering web
design, cloud hosting, workflow automation, and mobile app development. It's built with
Next.js and the App Router: a single animated landing page (hero, services, work,
process, testimonials, CTA) plus a `/new-project` page with two lead-capture forms — a
project inquiry form and a discovery-call date/time request — both persisted to a Neon
Postgres database, with an email notification sent via Resend on top.

Live at [karunatech.ca](https://karunatech.ca).

## Tech stack

| Layer | Choice |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, React Compiler enabled) |
| UI | [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) (CSS-based config, no `tailwind.config.js`) |
| Components | [shadcn/ui](https://ui.shadcn.com) primitives + hand-rolled animated components sourced from [reactbits.dev](https://reactbits.dev) |
| Animation | [Framer Motion](https://motion.dev) / `motion`, [GSAP](https://gsap.com), [Three.js](https://threejs.org) / [OGL](https://github.com/oframe/ogl) (WebGL backgrounds) |
| Theming | [next-themes](https://github.com/pacocoursey/next-themes) (light/dark) |
| Database | [Neon](https://neon.tech) (serverless Postgres) — stores every form submission |
| Email | [Resend](https://resend.com) — best-effort notification when a form is submitted |

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The page hot-reloads as you edit
files under `app/` and `components/`.

Both `/new-project` forms need a database to actually save anything:

1. Create a project at [neon.tech](https://neon.tech).
2. Run [`db/schema.sql`](db/schema.sql) against it (Neon's SQL Editor, or
   `psql "$DATABASE_URL" -f db/schema.sql`) to create the `project_inquiries` and
   `discovery_call_requests` tables.
3. Copy [`.env.example`](.env.example) to `.env.local` and fill in `DATABASE_URL` (the
   pooled connection string from Neon's "Connect" button).

Without that set, both forms still render and validate, they just fail the final save
with a friendly fallback message. `RESEND_API_KEY` is optional on top — it sends a
notification email when a form is submitted, but a missing/failing send never blocks
the submission, since the database row is already saved by that point (see
[`app/new-project/actions.ts`](app/new-project/actions.ts) and
[`app/new-project/discovery-actions.ts`](app/new-project/discovery-actions.ts)).

Other scripts:

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # eslint
```

## Project structure

```
next_karuna_tech/
├── app/
│   ├── layout.tsx          # Root layout: fonts, SEO metadata, Navbar/Footer shell
│   ├── page.tsx             # Homepage — composes the section components below
│   ├── new-project/         # /new-project — two lead-capture forms
│   │   ├── page.tsx                  # Page shell + metadata (Server Component)
│   │   ├── ProjectForm.tsx           # Project inquiry form (Client Component)
│   │   ├── actions.ts                # 'use server' — validates, saves to Neon, emails via Resend
│   │   ├── DiscoveryCallSection.tsx  # Right-column panel wrapping the form below
│   │   ├── DiscoveryCallForm.tsx     # Date/time request form (Client Component)
│   │   └── discovery-actions.ts      # 'use server' — same pattern, its own table
│   ├── sitemap.ts           # Generates /sitemap.xml
│   └── globals.css          # Tailwind v4 entry point, theme tokens (light/dark), custom keyframes
├── components/
│   ├── home/                 # One file per homepage section, plus shared content in data.ts
│   │   ├── HeroSection.tsx
│   │   ├── ServicesSection.tsx
│   │   ├── WorkSection.tsx
│   │   ├── ProcessSection.tsx
│   │   ├── TestimonialsSection.tsx
│   │   ├── StatsRibbon.tsx
│   │   ├── CtaSection.tsx
│   │   └── data.ts           # All copy/content: services, projects, testimonials, stats, process steps
│   ├── layout/
│   │   ├── Navbar.tsx         # Fixed header; includes the mobile hamburger menu
│   │   └── Footer.tsx
│   ├── ui/                    # shadcn/ui primitives (installed via the shadcn CLI)
│   ├── theme-provider.tsx     # next-themes wrapper
│   ├── theme-toggle.tsx       # Light/dark toggle button
│   └── *.tsx                  # Standalone animated/visual components sourced from reactbits.dev:
│                               # Particles, SplashCursor, MagnetLines, GlassSurface,
│                               # StarBorder, GradientText — see "Vendored components" below
├── hooks/
│   └── useMediaQuery.ts       # Client-side matchMedia hook, used for the isMobile flag
├── lib/
│   ├── utils.ts               # `cn()` — clsx + tailwind-merge, used by every component
│   └── db.ts                  # Server-only Neon client (DATABASE_URL)
├── db/
│   └── schema.sql              # Run against Neon to create the two tables
├── docs/
│   └── folder-structure.md    # Auto-generated tree of this repo (see scripts/ below)
├── scripts/
│   ├── generate_folder_tree.py  # One-off: regenerate docs/folder-structure.md
│   └── folder_tree_watcher.py   # Long-running: regenerates it every hour
└── public/                    # Static assets (favicon, robots.txt, etc.)
```

## How the homepage is put together

`app/page.tsx` is a client component that renders each section of `components/home/`
in order. Content (copy, project data, testimonials, stats, process steps) lives in one
place, [`components/home/data.ts`](components/home/data.ts) — edit that file to change
what the page says without touching layout code.

### The `mounted` / `isMobile` pattern

Several sections (`HeroSection`, `ServicesSection`) accept `mounted` and `isMobile`
props from `page.tsx`. This exists because a few components render expensive
client-only effects (WebGL particles, a fluid cursor) that must **never** run during
SSR and must **not** run on mobile (performance):

1. `isMobile` comes from [`useMediaQuery('(max-width: 768px)')`](hooks/useMediaQuery.ts).
2. `mounted` starts `false` and flips to `true` in a `useEffect` after first client render.
3. Until `mounted` is `true`, components render an identical static fallback (a gradient)
   on both server and client, avoiding React hydration mismatches.
4. Once mounted, desktop viewports get the animated/WebGL version; mobile viewports keep
   the lightweight static fallback.

Follow this same pattern if you add a new section with a heavy client-only effect.

### Vendored animated components

Files directly under `components/` (not in `home/`, `layout/`, or `ui/`) — `Particles`,
`SplashCursor`, `MagnetLines`, `GlassSurface`, `StarBorder`, `GradientText`,
etc. — are self-contained visual components adapted from the
[reactbits.dev](https://reactbits.dev) registry (see the `registries` entry in
[`components.json`](components.json)). They're vendored (copied into the repo, not
installed as a dependency) so their internals can be freely edited. When changing one,
check every usage first (`grep` its name across `components/home/`) since the same
component is often reused with different props.

### Dark mode is the default theme — and it must stay wired up

`app/layout.tsx` wraps the app in `<ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>`
(from `components/theme-provider.tsx`, a thin `next-themes` wrapper). This mounting is
load-bearing: without it, `next-themes` never applies the `.dark` class to `<html>`, the
`ThemeToggle` button silently does nothing, and the site is stuck rendering its `:root`
(light) CSS variables — which breaks the look of most sections, since `border-white/8`,
`bg-white/3`, `bg-white/5`, etc. (used throughout `Navbar`, `Footer`, `ServicesSection`,
`TestimonialsSection`, `WorkSection`, `CtaSection`, ...) are literal white-at-low-opacity
overlays designed to read as a subtle glass effect against a **dark** background — on a
white background they're nearly invisible, and every "card" looks flat and washed out.
If you ever refactor the root layout, keep `ThemeProvider` mounted there.

### `WorkSection`'s editorial case-study layout

Each project in `components/home/WorkSection.tsx` renders as a full-width row (image
panel + content, alternating sides via `md:flex-row-reverse` on odd rows), not a photo
grid — the section previously used hotlinked Unsplash stock photos, which looked
inconsistent with the rest of the page's dark, indigo/purple/cyan, photography-free
design language. Each row's visual panel is built from plain CSS instead: a subtle
single-color corner glow (`PROJECT_META[i].glow`) reusing the same blurred-circle
technique as `HeroSection`'s background glow, the same faint grid pattern as
`ServicesSection`, and a large low-opacity index numeral. No `<img>`, no external
network request, no per-card asset to source. `TiltedCard` (the 3D mouse-tilt vendored
component this section used to render project photos in) was removed from the repo
entirely once this was its only caller.

### The `/new-project` page: two forms, one storage pattern

`app/new-project/page.tsx` is a Server Component (so it can export `metadata`) laying
out two independent lead-capture forms in a two-column grid at `lg` and up (form
`lg:col-span-3` on the left, discovery call `lg:col-span-2` and `lg:sticky` on the
right; both stack to full width below `lg`, form first in DOM order):

- **Project inquiry** — `ProjectForm.tsx` (Client Component, React 19's
  `useActionState`) calls `submitProjectInquiry` in `actions.ts`.
- **Discovery call request** — `DiscoveryCallSection.tsx` is the static intro/card
  wrapper; `DiscoveryCallForm.tsx` is the actual form (name, email, a native `<input
  type="date">`, and a `<Select>` of fixed time slots — not a freeform text field, and
  not a real calendar/availability integration) that calls `submitDiscoveryCallRequest`
  in `discovery-actions.ts`.

Both Server Actions follow the same two-step pattern: **the database insert is the
source of truth; the Resend email is a best-effort notification on top.** Validate →
insert into the relevant table (`project_inquiries` / `discovery_call_requests`, schema
in [`db/schema.sql`](db/schema.sql), client in [`lib/db.ts`](lib/db.ts) — Neon's
serverless HTTP driver, `@neondatabase/serverless`, a tagged-template `sql` function
rather than a query builder) → if that insert fails or `DATABASE_URL` isn't configured,
return the friendly error state immediately (nothing to notify about) → otherwise
attempt the Resend email in a `try`/`catch` that only logs on failure, since the
submission already succeeded once the row is saved. See `.env.example` for the
required/optional env vars (`DATABASE_URL` required; `RESEND_API_KEY`,
`CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` optional). Follow this same save-then-notify
pattern for any new form.

We're on Neon rather than Supabase because Supabase's free tier caps you at 2 projects
account-wide; Neon's serverless HTTP driver was also a better fit for Server Actions
running as one-shot serverless functions than maintaining a persistent connection pool
would have been.

A `'use server'` file may only export async functions — no plain constants/objects —
so each form's initial state literal lives in the form component itself rather than
being exported from its actions file.

### Wiring up CTA buttons: shadcn `Button` + `asChild`

Buttons that should navigate (as opposed to trigger client-side logic) use the shadcn
`Button` component's `asChild` prop with a single child `<Link>` (cross-page) or `<a>`
(same-page anchor), e.g. `HeroSection`'s "View Our Work" / "Book a Discovery Call".
`asChild` swaps the rendered element from `<button>` to whatever's passed as a child via
Radix's `Slot`, so the button keeps its styling while behaving as a real link (keyboard
nav, right-click-to-open-in-new-tab, no `onClick`-based navigation). Don't render a
`<Button>` with no `href`/`onClick` at all — it silently does nothing when clicked.

### Responsive design

The site targets everything from a 320px phone to wide desktop monitors:

- Layout breakpoints follow Tailwind's defaults (`sm`/`md`/`lg`), with `md` (768px)
  as the primary mobile/desktop split — matching the `useMediaQuery` hook above.
- `Navbar` collapses into a hamburger menu below `md` (nav links, theme toggle, and
  the CTA move into a slide-down panel).
- Components that need fixed pixel dimensions (e.g. `GlassSurface` in `CtaSection`)
  are given percentage-based props (`width="100%"`) inside a container whose size is
  set by layout classes, instead of hardcoded pixel widths — so they scale down with
  their column instead of overflowing.
- Always sanity-check new sections at 320–375px width — the vendored components expect
  explicit pixel dimensions by default and will overflow the viewport if given a raw
  desktop-sized value.

### SEO

`app/layout.tsx` sets global metadata (Open Graph, Twitter cards, robots directives).
[`components/StructuredData.tsx`](components/StructuredData.tsx) injects JSON-LD.
[`app/sitemap.ts`](app/sitemap.ts) generates `/sitemap.xml`. If the production domain
changes, update the `baseUrl`/`metadataBase` values in both files.

### Keeping `docs/folder-structure.md` in sync

That file is generated, not hand-written. After a significant structural change, refresh
it with:

```bash
python scripts/generate_folder_tree.py scripts
```

(or run `folder_tree_watcher.py` to keep it auto-refreshing hourly during a work session).

## Deployment

Deployed on [Vercel](https://vercel.com). Pushing to `master` triggers a production
deploy; see [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying)
for other targets.

## For AI coding agents

See [`CLAUDE.md`](CLAUDE.md) / [`AGENTS.md`](AGENTS.md) for conventions and guardrails
specific to working on this repo with an AI assistant.
