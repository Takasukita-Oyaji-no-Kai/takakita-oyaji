# 高北おやじの会 (oyajinokai)

高洲北小学校 高北おやじの会の公式サイトです。

Built on [Astro](https://astro.build) with [EmDash CMS](https://docs.emdashcms.com), deployed to Cloudflare Workers with D1 + R2.

## Stack

| Piece | Choice |
|---|---|
| Framework | Astro 6 (SSR, `output: "server"`) |
| CMS | EmDash (beta), admin at `/_emdash/admin` |
| Styling | Tailwind CSS 4 via `@tailwindcss/vite`, OKLCH design tokens |
| Typography | Noto Sans JP (Google Fonts) |
| Runtime | Cloudflare Workers via `@astrojs/cloudflare` |
| Database | D1 (sandboxed locally via miniflare) |
| Media storage | R2 in production, local `./uploads` in dev |

## Content model

Four collections defined in [`seed/seed.json`](seed/seed.json):

| Collection | Fields | Purpose |
|---|---|---|
| `blog` | title, featured_image, excerpt, body | Activity reports and announcements |
| `activities` | title, month, location, description, image, order | The 5 annual events rendered on `/activities` and the home page |
| `pages` | title, body (Portable Text) | `home-hero`, `about`, `contact` |
| `values` | title, description, order | The 4 活動理念 cards rendered on the home page |

All copy is editable via the admin UI. Images are intentionally not seeded — upload via admin after deploy.

## Local development

Requires Node 22.12 or newer.

```bash
npm install
npm run dev
```

The dev server (`astro dev`) auto-applies schema migrations and seeds the collection structure from `seed/seed.json` on first boot.

**Content is not auto-seeded** — the EmDash runtime's auto-seed defaults to `includeContent: false`. After the dev server is running, apply the content seed once against the miniflare-managed D1 sqlite:

```bash
npx emdash seed seed/seed.json \
  --database "$(ls -S .wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite | head -1)"
```

Refresh the browser and you should see activities, pages, and values populated. The data persists until you `rm -rf .wrangler/state`.

To update existing entries after editing `seed/seed.json`, add `--on-conflict=update`:

```bash
npx emdash seed seed/seed.json --database ... --on-conflict=update
```

## Useful URLs (dev)

| URL | |
|---|---|
| `/` | Home: hero, 活動理念, featured activities, latest blog |
| `/about` | CMS-driven about page |
| `/activities` | All 5 activities, alternating layout |
| `/contact` | CMS-driven contact info + mailto form |
| `/blog` | Blog list (empty state until first post) |
| `/_emdash/admin` | Admin UI (Setup Wizard on first visit) |

## Deployment (Cloudflare)

The Cloudflare setup (`wrangler d1 create`, `wrangler r2 bucket create`, `wrangler secret put EMDASH_AUTH_SECRET`, `wrangler deploy`) is handled manually. See `wrangler.jsonc` for the expected resource names:

- Worker: `oyajinokai`
- D1 database: `oyajinokai-db`
- R2 bucket: `oyajinokai-media`

After deploy, remote content can be seeded the same way but pointing at the deployed URL, or created directly via the admin UI (the first passkey user is created via the Setup Wizard at `/_emdash/admin`).

## Project layout

```
src/
├── layouts/Base.astro          # html lang=ja, EmDashHead/Body, Header/slot/Footer
├── components/
│   ├── Header.astro            # Sticky nav, vanilla-JS mobile hamburger, aria-expanded
│   ├── Footer.astro
│   └── Squiggle.astro          # Decorative SVG divider (ported from takakita prototype)
├── pages/
│   ├── index.astro             # Hero, values, featured activities, latest blog
│   ├── about.astro             # pages/about via PortableText
│   ├── activities.astro        # Full activities list (alternating image/text)
│   ├── contact.astro           # pages/contact aside + hardcoded mailto form
│   ├── 404.astro               # Branded 404
│   └── blog/
│       ├── index.astro         # List + empty state
│       └── [slug].astro        # SSR detail
├── styles/theme.css            # Tailwind 4 @theme block with OKLCH tokens
├── live.config.ts              # Boilerplate EmDash live loader
└── worker.ts                   # Cloudflare worker entry

seed/seed.json                  # Schema + content (source of truth)
wrangler.jsonc                  # D1/R2 bindings + worker name
astro.config.mjs                # Cloudflare adapter + @tailwindcss/vite plugin
```

## Background on the migration

This repo replaced a Next.js 15 + Decap CMS + Cloudinary stack with the current stack on branch `migration/emdash`. Design language and layout patterns are ported from the [takakita prototype](https://github.com/Takasukita-Oyaji-no-Kai) (TanStack Start + React 19). See `PLAN.md` for the full migration plan and autoplan review history.
