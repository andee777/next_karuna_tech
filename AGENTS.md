# AGENTS.md

Instructions for AI coding agents (Codex, Cursor, Copilot, etc.) working in this
repository. See [`CLAUDE.md`](CLAUDE.md) for the Claude Code–specific version of this
same guidance — keep the two in sync when architecture changes.

## What this is

The marketing website for Karuna Technologies (karunatech.ca), a software studio. It's
built with Next.js App Router: a single animated landing page (hero, services, work,
process, testimonials, CTA) plus a `/new-project` inquiry form. There is no database or
auth, and no persistent backend state — the one piece of server logic is the
`/new-project` form's Server Action, which sends an email via Resend and holds no state
of its own.

## Setup & commands

```bash
npm install
npm run dev      # start dev server (localhost:3000)
npm run build    # production build — run this before considering a change done
npm run start    # serve the production build
npm run lint     # eslint (eslint-config-next core-web-vitals + typescript)
```

There is no test suite in this repo (no test runner in `package.json`, no
`*.test.*`/`*.spec.*` files) — don't invent test commands. Treat `npm run build` and
`npm run lint` as the verification gate for any change.

## Architecture

### Page composition

`app/page.tsx` is a client component that renders every homepage section in order, each
its own file under `components/home/`: `HeroSection` → `StatsRibbon` →
`ServicesSection` → `WorkSection` → `ProcessSection` → `TestimonialsSection` →
`CtaSection`. All copy and content data (service descriptions, project case studies,
testimonials, stats, process steps) lives in one place — `components/home/data.ts` — as
typed, exported arrays. Change what the page says by editing that file; change
layout/behavior by editing the section component.

`app/layout.tsx` wraps every page with `Navbar` and `Footer` and defines all SEO
metadata (title template, Open Graph, Twitter cards, robots, canonical/`metadataBase`).
`components/StructuredData.tsx` injects JSON-LD. `app/sitemap.ts` generates
`/sitemap.xml` — it's also the list of real routes to keep current when you add a page.
Both `layout.tsx` and `sitemap.ts` hardcode `https://karunatech.ca` as the base URL —
update both together if the domain ever changes.

Now that the site has more than one route, `Navbar`'s section links point to `/#services`
etc. (not bare `#services`) so they still work when clicked from `/new-project`; its logo
and the "Start a Project" CTA use `next/link`'s `Link` for actual page navigation. Keep
that distinction when adding nav entries: bare `#id` anchors only work from the page that
actually has that id.

### The `mounted` / `isMobile` hydration pattern

`HeroSection` and `ServicesSection` accept `mounted: boolean` and `isMobile: boolean`
props, computed once in `page.tsx`:

- `isMobile` comes from `useMediaQuery('(max-width: 768px)')` (`hooks/useMediaQuery.ts`),
  which reads `window.matchMedia` and is therefore `false` during SSR.
- `mounted` starts `false` and is flipped to `true` inside a `useEffect`, so it's also
  `false` during SSR and on the very first client render.

Until `mounted` is `true`, these sections render an identical static gradient fallback
on server and client — this is required because the real content is a WebGL/canvas
effect (`Particles`, `SplashCursor`) that must never run during SSR and would otherwise
produce a hydration mismatch. Once mounted, desktop (`!isMobile`) gets the animated
version; mobile keeps the static fallback for performance. `CtaSection` uses its own
local `mounted` state for the same reason (it swaps in `GlassSurface`, which calls
`navigator`/`matchMedia` during render). Follow this same mount-gate pattern for any new
section that adds a client-only visual effect.

### Vendored animation components

Files directly under `components/` (not `home/`, `layout/`, or `ui/`) —
`Particles`, `SplashCursor`, `MagnetLines`, `GlassSurface`, `StarBorder`,
`GradientText` — are copied-in (not npm-installed) components originally sourced from
the [reactbits.dev](https://reactbits.dev) registry, referenced under `registries` in
`components.json`. Because they're vendored, their internals can be freely edited, but
several are reused across multiple sections with different props — grep for a
component's name across `components/home/` before changing its prop contract.

These components generally expect explicit pixel `width`/`height` props rather than
being intrinsically responsive (e.g. `GlassSurface`'s `width`/`height`, used by
`CtaSection`). Never pass a raw desktop pixel value (e.g. `"640px"`) directly — on a
narrow viewport it overflows the page horizontally. Instead size the component from its
actual container: wrap it in a `div` with `w-full` (+ `max-w-[Npx]` if needed), then pass
`"100%"` for width/height props so the component fills that wrapper.

`TiltedCard` (a 3D mouse-tilt image component, formerly used by `WorkSection` for its
project photos) was removed from the repo — `WorkSection` now builds its visual panels
from plain CSS instead of a photo (see below), which was its only caller.

### `WorkSection`'s editorial case-study layout

Each project renders as a full-width row (visual panel + content, alternating sides via
`md:flex-row-reverse` on odd rows), not a photo grid. It previously used hotlinked
Unsplash stock photos, which clashed with the rest of the page's dark,
indigo/purple/cyan, photography-free design language — the visual panel is now built
from plain CSS: a single-color corner glow per project (`PROJECT_META[i].glow`, reusing
`HeroSection`'s blurred-circle technique), the same faint grid pattern as
`ServicesSection`, and a large low-opacity index numeral. No image asset, no network
request, no per-project art to source when adding a 5th project — just add an entry to
both `featuredProjects` (`components/home/data.ts`) and `PROJECT_META`
(`WorkSection.tsx`).

### The `/new-project` inquiry form

`app/new-project/page.tsx` is a Server Component (needed so it can `export const
metadata`) that renders `ProjectForm.tsx`, a Client Component. The form uses React 19's
`useActionState` to call the `submitProjectInquiry` Server Action exported from
`actions.ts` (`'use server'`), which validates fields server-side and sends the message
via `resend.emails.send(...)`. If `RESEND_API_KEY` is unset or the send throws/errors,
the action returns `{ status: 'error', message: <fallback copy> }` rather than letting
the exception propagate — the page must keep working (with a "please email us directly"
fallback) even before the env var is configured. `.env.example` documents
`RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`.

Gotcha: a `'use server'` file may only export async functions — not plain
constants/objects. That's why the form's initial `ProjectInquiryState` literal is
defined in `ProjectForm.tsx` itself (only the *type* is imported from `actions.ts`,
via `import type`) rather than exported from the action file.

### shadcn/ui setup

`components.json` configures shadcn with style `radix-nova`, `baseColor: neutral`, and a
custom `@react-bits` registry (see above). `components/ui/` currently has `button.tsx`,
`input.tsx`, `label.tsx`, `select.tsx`, `textarea.tsx` — add more via the shadcn CLI
rather than hand-writing them, to keep them consistent with this config.

Gotcha: the shadcn CLI (as of this writing) scaffolds new components importing `cn` from
a package literally named `"cn"` instead of this repo's own `@/lib/utils`. After running
`npx shadcn add <component>`, check the generated file's `cn` import and fix it to
`import { cn } from "@/lib/utils"` (and drop the stray `cn` dependency from
`package.json` if it got added) to stay consistent with every other component in the
repo.

### Styling

Tailwind CSS v4, configured entirely in `app/globals.css` (`@import "tailwindcss"`, a
`@theme inline` block, `:root`/`.dark` CSS variables for the color tokens) — there is no
`tailwind.config.js`. Dark mode is a `.dark` class toggle (`next-themes`), applied via the
`@custom-variant dark (&:is(.dark *))` directive. `lib/utils.ts` exports `cn()`
(`clsx` + `tailwind-merge`) — use it whenever merging conditional class names.

**Dark is the default and primary theme, and `ThemeProvider` mounting is load-bearing.**
`app/layout.tsx` wraps the app in
`<ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>`
(`components/theme-provider.tsx`, a thin `next-themes` wrapper; `theme-toggle.tsx` is the
UI toggle). This used to be defined but never actually rendered anywhere — which meant
`.dark` was never applied to `<html>`, the toggle silently did nothing, and the site was
permanently stuck on `:root` (light) tokens. That's a real problem here specifically
because most sections use literal `white`-at-low-opacity utilities (`border-white/8`,
`bg-white/3`, `bg-white/5`, etc. — throughout `Navbar`, `Footer`, `ServicesSection`,
`TestimonialsSection`, `WorkSection`, `CtaSection`, ...) as a glass effect that assumes a
**dark** background; on a white background they're nearly invisible and every card looks
flat and washed out. If you ever touch the root layout, keep `ThemeProvider` mounted.

Path alias `@/*` maps to the repo root (`tsconfig.json`), e.g. `@/components/...`,
`@/lib/utils`, `@/hooks/...`.

### Responsive design

Breakpoints follow Tailwind defaults, with `md` (768px) as the primary split — it's also
the threshold used by `useMediaQuery` for the `isMobile` flag above, so layout
breakpoints and the JS-driven mobile/desktop effect switch stay in sync. `Navbar`
collapses into a hamburger-triggered slide-down panel below `md`. When adding or editing
a section, check it at 320–375px width specifically (not just one mobile size) — the
vendored components' fixed-pixel-by-default props (see above) are the most common source
of horizontal overflow on small screens.

### React Compiler

`next.config.ts` has `reactCompiler: true` enabled (`babel-plugin-react-compiler`) —
avoid manual `useMemo`/`useCallback` micro-optimizations; the compiler handles most of
that automatically.

## Conventions for agent-driven changes

- This is a marketing site with no test suite — verify UI changes by actually running
  `npm run dev` and checking the page (including a mobile-width viewport), not just by
  reading the diff.
- `npm run build` will surface type errors and most correctness issues before you
  report a change as complete.
- Prefer editing `components/home/data.ts` for copy changes over touching JSX in the
  section components.
- To test the `/new-project` form's send path end-to-end, copy `.env.example` to
  `.env.local` and set a real `RESEND_API_KEY`. Without it, submission still validates
  but always ends in the fallback error state — that's expected, not a bug.
