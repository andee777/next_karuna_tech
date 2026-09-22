# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The marketing website for Karuna Technologies (karunatech.ca), a software studio. It's
built with Next.js App Router: a single animated landing page (hero, services, work,
process, testimonials, CTA) plus a `/new-project` page with two lead-capture forms
(project inquiry, discovery-call date/time request). There is no auth. Both forms
persist to a Neon Postgres database via Server Actions, using the serverless HTTP
driver — the database row is the source of truth; Resend sends the customer a
best-effort confirmation email on top (never a notification to the studio).

## Commands

```bash
npm run dev      # start dev server (localhost:3000)
npm run build    # production build
npm run start    # serve the production build
npm run lint     # eslint (eslint-config-next core-web-vitals + typescript)
```

There is no test suite configured in this repo (no test runner in `package.json`, no
`*.test.*`/`*.spec.*` files) — don't assume Jest/Vitest exists.

Two standalone Python scripts under `scripts/` regenerate `docs/folder-structure.md`
(a tree snapshot of the repo, one directory up from `scripts/`); they aren't part of
the app build:

```bash
python scripts/generate_folder_tree.py scripts   # one-off regeneration
python scripts/folder_tree_watcher.py scripts     # regenerates hourly while it runs
```

## Architecture

### Page composition

`app/page.tsx` is a client component (`'use client'`) that renders every section of the
homepage in order, each its own file under `components/home/`: `HeroSection` →
`StatsRibbon` → `ServicesSection` → `WorkSection` → `ProcessSection` →
`TestimonialsSection` → `CtaSection`. All copy and content data (service descriptions,
project case studies, testimonials, stats, process steps) lives in one place —
`components/home/data.ts` — typed and exported as arrays. To change what the page says,
edit that file; to change layout/behavior, edit the section component.

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
`navigator`/`matchMedia` during render). **Follow this same mount-gate pattern** for any
new section that adds a client-only visual effect.

### Vendored animation components

Files directly under `components/` (not `home/`, `layout/`, or `ui/`) —
`Particles`, `SplashCursor`, `MagnetLines`, `GlassSurface`, `StarBorder`,
`GradientText` — are copied-in (not npm-installed) components originally sourced from
the [reactbits.dev](https://reactbits.dev) registry, referenced under `registries` in
`components.json`. Because they're vendored, their internals can be freely edited, but
several are reused across multiple sections with different props — grep for a
component's name across `components/home/` before changing its prop contract.

These components generally expect **explicit pixel `width`/`height` props** rather than
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

### The `/new-project` page: two forms, one save-then-notify pattern

`app/new-project/page.tsx` is a Server Component (needed so it can `export const
metadata`) laying out two independent forms in a two-column grid at `lg` and up (form
`lg:col-span-3` left, discovery call `lg:col-span-2` + `lg:sticky` right; both stack to
full width below `lg`, form first in DOM order):

- **`ProjectForm.tsx`** (Client Component, `useActionState`) → `submitProjectInquiry`
  in `actions.ts`. Fields: name, email, phone (optional), preferred contact method
  (`Select`, defaults to `"Email"` so it's never empty), company, budget, project type,
  message. If `preferredContact === 'Phone'`, `phone` becomes required server-side
  (`fieldErrors.phone`) — the UI doesn't block submission on this, only the action does.
- **`DiscoveryCallSection.tsx`** (compact intro: icon + heading + one-line caption, no
  bullet list — see below) wraps **`DiscoveryCallForm.tsx`** (Client Component) →
  `submitDiscoveryCallRequest` in `discovery-actions.ts`. Fields: name, email, phone
  (optional), a native `<input type="date">`, and a `<Select>` of fixed time slots
  (`TIME_SLOTS`) — not a real calendar/availability integration, just a fixed set of
  choices; the copy says "we'll confirm by email" for exactly that reason.

**Keep the discovery-call column visually secondary to the project-inquiry form.** It
used to carry a heavy intro (icon + heading + paragraph + 3-item bullet list) that made
it look bigger/more prominent than the main form despite being the alternative option.
`DiscoveryCallSection.tsx`'s intro is now a single compact row (icon + heading + one
small caption line: "30 min · No pressure · No sales pitch") specifically to keep it
lighter than the form beside it — don't re-expand it back into a multi-paragraph intro.

**Both Server Actions follow the same pattern — replicate it for any new form:**
validate → `getDb()` (`lib/db.ts`) → if `null` (`DATABASE_URL` unset) or the insert
throws, return the fallback error state immediately, nothing to send → otherwise the
row is saved, so the submission has already succeeded; attempt up to two
`resend.emails.send(...)` calls, each in its own `try`/`catch` that only
`console.error`s on failure and never changes the returned state. The database insert
is the source of truth; both emails are courtesy sends independent of each other (one
failing doesn't skip or fail the other). Table schemas: `db/schema.sql` — run it
manually against the database; nothing in this repo runs migrations automatically.

**Two emails go out per submission, to two different people, for two different
reasons:**
1. **Confirmation → the customer** (`to: email`, the address they typed in). `replyTo`
   is `CONTACT_TO_EMAIL` (default `info@karunatech.ca`), so a reply lands in the
   studio's inbox instead of bouncing back to the customer themselves.
2. **Notification → the site owner** (`to: process.env.OWNER_EMAIL`, no default —
   skipped with a `console.error` if unset). `replyTo` is the *customer's* email this
   time, so replying from the owner's inbox goes straight to the customer. Restates all
   the fields the customer submitted (name, email, phone, message/booking details) —
   this is the "new lead" notification; keep it whenever adding a new form.

`.env.example` documents `DATABASE_URL` (required), and `RESEND_API_KEY`,
`CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`, `OWNER_EMAIL` (all optional — but
`OWNER_EMAIL` unset means owner notifications silently don't send).

`lib/db.ts` uses `@neondatabase/serverless`'s `neon()` — a tagged-template `sql`
function over HTTP, not a connection pool — so Server Actions (one-shot serverless
functions) never hold an open Postgres connection. Write queries as
`` await sql`insert into t (a, b) values (${a}, ${b})` ``; interpolated values are
parameterized automatically, so this is safe against SQL injection. **We're on Neon,
not Supabase**, because Supabase's free tier caps out at 2 projects account-wide and
this account had already hit that limit — don't reintroduce a Supabase dependency
without checking that's still the constraint.

Gotcha: a `'use server'` file may only export async functions — not plain
constants/objects. That's why each form's initial state literal is defined in the form
component itself (only the *type* is imported from the actions file, via `import type`)
rather than exported from the action file.

### Wiring up CTA buttons: shadcn `Button` + `asChild`

Buttons that should navigate use the shadcn `Button` component's `asChild` prop with a
single child `<Link>` (cross-page) or `<a>` (same-page anchor) — e.g. `HeroSection`'s
"View Our Work" / "Book a Discovery Call". `asChild` swaps the rendered element from
`<button>` to whatever's passed as a child via Radix's `Slot`, so the button keeps its
styling while behaving as a real link. Don't render a `<Button>` with no `href`/`onClick`
— it silently does nothing when clicked (this was previously the case for both Hero
buttons).

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

**`html { scrollbar-gutter: stable }` in `globals.css` is load-bearing — it stops the
fixed `Navbar` from visibly shifting/growing whenever a Radix popover (`Select`, etc.)
opens.** Radix locks scroll by setting `overflow: hidden !important` on `<body>` while
open; via the body→viewport overflow-propagation quirk this removes the page's actual
scrollbar, and `Navbar`'s `inset-x-0` (`fixed`) then recomputes against the now-wider,
scrollbar-less viewport, growing by the scrollbar's width (~15px) for as long as the
popover is open. `scrollbar-gutter: stable` must be on `html` specifically — it does
**not** work set on `body` (verified: the propagation quirk carries `overflow` from
body to the viewport but does not carry gutter reservation), and reproduces reliably by
opening a shadcn `Select` and comparing `header.getBoundingClientRect().width` before
vs. after.

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
