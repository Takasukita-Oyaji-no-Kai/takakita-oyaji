# EmDash Migration Plan — Oyaji no Kai

Ground-up rebuild of https://oyajinokai (or equivalent domain) from Next.js 15 + Decap CMS + Cloudinary to Astro 6 + EmDash CMS + Cloudflare (D1/R2/Workers), using the takakita TanStack prototype as the visual reference.

## Current state

- **Repo**: Next.js 15.3.2 static export, Tailwind 4, shadcn/ui (54 primitives, mostly unused), Decap CMS (separate), Cloudinary for images, monolingual JA.
- **Content**: 1 blog post file (`content/blog/2023-10-14-sports-day.md`) — **filler, do not migrate body**. The real content is the page copy (about, activities list, contact, home hero/values) which is hardcoded inside React components under `app/` and `components/`.
- **Pages**: `/`, `/about`, `/activities`, `/blog`, `/blog/[slug]`, `/contact`.
- **Images**: ~10 Cloudinary assets (cloud: `duh9jrbpp`), hardcoded URLs in JSX.

## Target state

- **Repo**: Astro 6 SSR project with EmDash integration at repo root. Everything from the current Next.js app is gone.
- **CMS**: EmDash database-first. SQLite locally, D1 in production. Admin at `/_emdash/admin`.
- **Theme**: Custom Astro theme matching the takakita visual language (Noto Sans JP, OKLCH warm-orange primary, Squiggle dividers, asymmetric 2-col grids, alternating layouts).
- **Hosting**: Cloudflare Workers + D1 + R2. Deployed via `wrangler`.
- **Images**: EmDash media library (local uploads folder in dev, R2 in prod). User will re-upload manually post-migration.
- **Language**: Japanese only. No i18n configuration.
- **Content**: blog (schema only, no entries migrated), activities (seeded from takakita `activities.tsx`), pages (about, contact, home hero+values copy).

## Non-goals

- **Cloudinary image migration.** User will re-upload images manually via EmDash admin after the migration ships.
- **Blog post body migration.** The single existing post (`2023-10-14-sports-day.md`) is filler. Schema for the blog collection stays, but no entries are ported.
- **Multi-language support.** Site stays JA-only for now. Leave i18n off; revisit later.
- **Auth on admin.** Use EmDash defaults for local dev. Production admin access gated via Cloudflare Access or similar is out of scope.
- **Preserving shadcn/ui primitives.** Discard them entirely — they are unused in the current site and irrelevant in Astro.
- **Preserving Decap CMS config.** Replaced by EmDash.
- **SEO/redirect preservation.** Trivial 1 blog post — URL structure will change (`/blog/[slug]`) but we accept minor SEO churn.
- **Performance benchmarking vs current Next.js site.** SSR-by-default is acceptable.

## Constraints

- Work on branch `migration/emdash` (already created).
- Atomic commits per logical phase (~A-G below).
- Node 22.12+ required (have 24.11.1 ✓).
- Wrangler installed ✓.
- Visual fidelity to takakita is the design target. Exact pixel match not required — capture the feel (Squiggle dividers, primary color, typography, alternating layouts).

## Architecture

```
oyajinokai/ (after migration)
├── astro.config.mjs          # EmDash + @astrojs/cloudflare
├── wrangler.jsonc            # D1 + R2 bindings
├── package.json              # Astro 6, emdash, @astrojs/cloudflare
├── src/
│   ├── live.config.ts        # emdashLoader for _emdash live collection
│   ├── layouts/
│   │   └── Base.astro        # Sticky header + footer + Squiggle spacer
│   ├── components/
│   │   ├── Header.astro      # Nav: ホーム / 私たちについて / 活動内容 / ブログ / お問い合わせ
│   │   ├── Footer.astro
│   │   ├── Squiggle.astro    # SVG wave divider
│   │   ├── ActivityCard.astro
│   │   ├── BlogCard.astro
│   │   └── ValueCard.astro
│   ├── pages/
│   │   ├── index.astro       # Home: hero + values + featured activities + latest blog
│   │   ├── about.astro
│   │   ├── activities.astro
│   │   ├── contact.astro
│   │   ├── blog/
│   │   │   ├── index.astro   # List
│   │   │   └── [slug].astro  # Detail (SSR, EmDash-sourced)
│   │   └── [...slug].astro   # Optional catch-all for EmDash pages collection
│   └── styles/
│       └── global.css        # Tailwind 4 + OKLCH tokens from takakita
├── .emdash/
│   ├── seed.json             # Schema: blog, activities, pages collections
│   ├── types.ts              # Generated via `npx emdash types`
│   └── uploads/              # Local media (gitignored)
├── data.db                   # Local SQLite (gitignored)
└── public/
    └── logo.png              # Keep from current repo
```

## Implementation phases

Each phase = one atomic commit (or a tight cluster of commits). Commit message prefix: `emdash:`.

### Phase A — Scaffold

**Goal:** Astro+EmDash dev server running locally with the blog-cloudflare template, old Next.js code removed.

1. Remove current Next.js code: `app/`, `components/`, `public/admin/`, `next.config.js`, `next-env.d.ts`, `tsconfig.json`, `package.json`, `package-lock.json`, `postcss.config.mjs`, `eslint.config.mjs`, `lib/`, `types/`. **Before deleting**, copy the page-copy source files we need for content porting in Phase E into a scratch file (`_legacy-copy.md` at repo root, gitignored or short-lived) — specifically the visible Japanese strings from `app/about/page.tsx`, `app/activities/page.tsx` (5 activity entries), `app/contact/page.tsx`, `app/page.tsx` (hero + values). Discard `content/blog/2023-10-14-sports-day.md` entirely — filler per user. Preserve `public/logo.png`, `.git/`, `.gitignore`, `PLAN.md`.
2. Scaffold into repo root using `npm create emdash@latest -- --template blog-cloudflare .` (or closest template). Accept interactive prompts to install into current dir.
3. Install peer deps if needed (`@astrojs/cloudflare`, `better-sqlite3` for local).
4. Verify `npm run dev` boots, admin loads at `/_emdash/admin`.
5. **Commit:** `emdash: scaffold Astro+EmDash project from blog-cloudflare template`

### Phase B — Content schema (seed)

**Goal:** Three collections defined in `.emdash/seed.json` with fields matching the site's needs.

1. Edit `.emdash/seed.json`:
   - **`blog`** — `title` (string), `slug` (auto), `date` (date), `author` (string, default "高北おやじ"), `excerpt` (text), `featured_image` (image), `body` (portableText).
   - **`activities`** — `month` (string, e.g. "5月"), `title` (string), `location` (string), `description` (text), `image` (image), `order` (integer, for sorting).
   - **`pages`** — `title` (string), `slug` (string), `body` (portableText). For `about`, `contact`, optionally `home-hero` content block.
2. Run `npx emdash seed` (or equivalent per docs) to apply schema.
3. Run `npx emdash types` to generate type definitions.
4. Verify collections appear in admin UI.
5. **Commit:** `emdash: define blog / activities / pages collections`

### Phase C — Theme foundation

**Goal:** Typography, color tokens, layout shell, shared components that everything else will build on.

1. Replace `src/styles/global.css` with takakita's OKLCH tokens (copy exact values from `/Users/bprice/dev/ai/takakita/src/styles.css:36-59`). Keep Tailwind 4 base.
2. Import Noto Sans JP in `Base.astro` head (`https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap`).
3. Build `src/layouts/Base.astro` with sticky header, main slot, footer, and `<html lang="ja">`.
4. Build `src/components/Header.astro` — port from `/Users/bprice/dev/ai/takakita/src/components/Header.tsx`. Desktop nav + mobile hamburger (vanilla JS or Astro island).
5. Build `src/components/Footer.astro`.
6. Build `src/components/Squiggle.astro` — port SVG verbatim from `/Users/bprice/dev/ai/takakita/src/components/Squiggle.tsx:2-16`.
7. **Commit:** `emdash: theme foundation — fonts, colors, layout, Header/Footer/Squiggle`

### Phase D — Page templates

**Goal:** All routes rendered with the theme, querying EmDash collections where appropriate.

1. `src/pages/index.astro` — home: hero (copy + image), 4-card values grid, 3 featured activities (query `activities` collection, limit 3), latest 3 blog posts.
2. `src/pages/about.astro` — query `pages` collection where slug=`about`, render portable text body. Or keep as static Astro if user prefers.
3. `src/pages/activities.astro` — full activities list (query `activities`), alternating 2-col image/text layout with `sm:-ml-6`/`-mr-6` overflow per takakita.
4. `src/pages/blog/index.astro` — list all published blog posts.
5. `src/pages/blog/[slug].astro` — SSR, query by slug from `blog` collection. Use EmDash's `getEmDashEntry`.
6. `src/pages/contact.astro` — static form with `mailto:` action (matches current/takakita behavior).
7. Use `ActivityCard.astro`, `BlogCard.astro`, `ValueCard.astro` where repeated.
8. **Commit (can split into 2-3):** `emdash: home + about`, `emdash: activities + blog pages`, `emdash: contact + cards`

### Phase E — Content migration

**Goal:** All page copy from the current Next.js site lives in EmDash. Blog post body is NOT migrated (filler).

1. Populate `activities` collection with 5 entries. Source: `/Users/bprice/dev/ai/takakita/src/routes/activities.tsx` is the richest version (5 months). Cross-check against current oyajinokai `app/activities/page.tsx` for any divergent copy, prefer the current repo's copy when they conflict.
2. Populate `pages` collection:
   - `about` — body copy from current `app/about/page.tsx` (port to portable text blocks).
   - `contact` — body copy from `app/contact/page.tsx` (intro text, email, any location info).
   - `home-hero` — hero title, subtitle, CTA labels from `components/home/Hero.tsx` (or `app/page.tsx`).
   - `home-values` — 4 value cards (icon key + label + blurb) from `components/home/About.tsx`.
3. Delete `_legacy-copy.md` scratch file.
4. **Commit:** `emdash: port page content (activities, about, contact, home copy)`

### Phase F — Cloudflare deployment

**Goal:** Site deploys to Cloudflare Workers with D1 + R2 bindings.

1. Create resources:
   - `wrangler d1 create oyajinokai-db` — capture `database_id`.
   - `wrangler r2 bucket create oyajinokai-media`.
2. Update `wrangler.jsonc` with bindings (`DB` → d1, `MEDIA` → r2).
3. Update `astro.config.mjs`:
   - `output: "server"`.
   - `adapter: cloudflare()`.
   - `emdash({ database: d1({ binding: "DB" }), storage: r2({ binding: "MEDIA" }) })`.
4. Run migrations: `wrangler d1 execute oyajinokai-db --remote --file=./node_modules/emdash/migrations/0001_core.sql` (path per EmDash version).
5. Seed prod DB with schema: `wrangler d1 execute oyajinokai-db --remote --file=.emdash/seed.sql` (or equivalent `emdash seed --remote`).
6. Deploy: `wrangler deploy` (or `pnpm run deploy` if template provides).
7. Test: visit deployed URL, visit `/_emdash/admin`, create a test post, confirm it renders.
8. **Commit:** `emdash: cloudflare deploy — D1, R2, wrangler config`

### Phase G — Cutover

**Goal:** `main` branch reflects the new site.

1. Update `README.md` with dev/deploy instructions.
2. Clean up any remaining legacy files, update `.gitignore` (`data.db`, `.emdash/uploads/`, `.wrangler/`).
3. Open PR from `migration/emdash` → `main` for user review.
4. **Commit:** `emdash: README + gitignore`

## Dependencies & ordering

A → B → C → D → E → F → G. Phase D depends on B (schema). Phase E depends on D (templates render it). Phase F can be started in parallel with E but finishes after.

## Risks and mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| `npm create emdash` fails to install into non-empty dir | Blocks Phase A | Scaffold into temp dir, move files over manually |
| EmDash template doesn't match our needs (blog-cloudflare) | Extra rework in Phase C | Use `blank` or `starter` template instead, accept more manual work |
| Portable Text conversion of existing MD post loses formatting | Content quality degraded | Manually proof the migrated post; minor formatting is acceptable since only 1 post |
| EmDash version churn | Build breaks | Pin exact EmDash version in package.json, record version in README |
| Cloudflare D1 binding in local dev differs from prod | Dev/prod mismatch bugs | Use SQLite locally (template default), D1 remote-only; verify both work before cutover |
| Cloudinary URLs in old content reference fail in new site | Broken images post-migration | User accepts this — manual re-upload planned |
| Hamburger menu needs client JS | Pure-Astro preference broken | Use Astro island (`client:load` on a tiny React/Svelte/Vue component) or vanilla JS `<script>` tag |
| EmDash admin requires auth in prod, blocking user from editing | Admin unusable | Verify EmDash's default auth works out-of-box on first deploy; if not, fall back to Cloudflare Access |

## Open questions

1. **Template choice**: blog-cloudflare (closest fit, has schema opinions we'd override) vs blank (clean slate, more manual). Lean blog-cloudflare.
2. **Home page copy ownership**: hardcoded in `index.astro` vs EmDash `pages/home-hero` entry. Lean hardcoded (simpler, user unlikely to change hero copy frequently).
3. **Hamburger menu implementation**: vanilla `<script>` vs Astro island. Lean vanilla (minimal bundle).
4. **Preserving old code in `_legacy/`** or deleting outright. User said "completely replace" — lean delete (git history preserves it).

## Success criteria

- [ ] `npm run dev` boots, admin accessible at `/_emdash/admin`.
- [ ] Home, about, activities, blog list, blog post, contact all render with theme applied.
- [ ] Blog list page renders empty state cleanly (no entries yet — filler post not migrated).
- [ ] All 5 activities visible on `/activities`.
- [ ] Squiggle dividers visible between major sections.
- [ ] Deployed to Cloudflare, accessible via *.pages.dev or custom domain.
- [ ] Admin writable in production (create a draft post via admin, it persists, renders after publish).
- [ ] `main` updated via PR; old Next.js code removed.
