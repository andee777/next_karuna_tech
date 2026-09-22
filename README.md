# Karuna Technologies — Marketing Site

The public marketing website for **Karuna Technologies**, a software studio offering web
design, cloud hosting, workflow automation, and mobile app development. It's built with
Next.js and the App Router: a single animated landing page (hero, services, work,
process, testimonials, CTA) plus a `/new-project` inquiry form that emails submissions
via Resend.

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
| Email | [Resend](https://resend.com) via a Server Action, for the `/new-project` form |

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The page hot-reloads as you edit
files under `app/` and `components/`.

The `/new-project` form needs a Resend API key to actually send email — copy
[`.env.example`](.env.example) to `.env.local` and fill in `RESEND_API_KEY`. Without it,
the page still works and validates normally, it just fails the final send with a
friendly fallback message instead of delivering the email (see
[`app/new-project/actions.ts`](app/new-project/actions.ts)).

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
│   ├── new-project/         # /new-project — project inquiry form
│   │   ├── page.tsx          # Page shell + metadata (Server Component)
│   │   ├── ProjectForm.tsx   # The form itself (Client Component, useActionState)
│   │   └── actions.ts        # 'use server' — validates + emails via Resend
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
│                               # Particles, SplashCursor, MagnetLines, GlassSurface, TiltedCard,
│                               # StarBorder, GradientText — see "Vendored components" below
├── hooks/
│   └── useMediaQuery.ts       # Client-side matchMedia hook, used for the isMobile flag
├── lib/
│   └── utils.ts               # `cn()` — clsx + tailwind-merge, used by every component
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
`SplashCursor`, `MagnetLines`, `GlassSurface`, `TiltedCard`, `StarBorder`, `GradientText`,
etc. — are self-contained visual components adapted from the
[reactbits.dev](https://reactbits.dev) registry (see the `registries` entry in
[`components.json`](components.json)). They're vendored (copied into the repo, not
installed as a dependency) so their internals can be freely edited. When changing one,
check every usage first (`grep` its name across `components/home/`) since the same
component is often reused with different props.

### The `/new-project` inquiry form

`app/new-project/page.tsx` is a Server Component (so it can export `metadata`) that
renders `ProjectForm.tsx`, a Client Component using React 19's `useActionState` to call
the `submitProjectInquiry` Server Action in `actions.ts`. The action validates the
fields server-side, then sends the message via [Resend](https://resend.com). If
`RESEND_API_KEY` isn't set (or the send fails), it returns a friendly error state
instead of throwing — see `.env.example` for the required/optional env vars
(`RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`).

A `'use server'` file may only export async functions — no plain constants/objects —
so the form's initial state literal lives in `ProjectForm.tsx` itself rather than being
exported from `actions.ts`.

### Responsive design

The site targets everything from a 320px phone to wide desktop monitors:

- Layout breakpoints follow Tailwind's defaults (`sm`/`md`/`lg`), with `md` (768px)
  as the primary mobile/desktop split — matching the `useMediaQuery` hook above.
- `Navbar` collapses into a hamburger menu below `md` (nav links, theme toggle, and
  the CTA move into a slide-down panel).
- Components that need fixed pixel dimensions (e.g. `TiltedCard` in `WorkSection`)
  are wrapped in a sized container using `aspect-ratio` and percentage-based props
  instead of hardcoded pixel widths, so they scale down with their grid column.
- Always sanity-check new sections at 320–375px width — `TiltedCard`, `GlassSurface`,
  and other vendored components expect explicit pixel dimensions by default and will
  overflow the viewport if given a raw desktop-sized value.

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
