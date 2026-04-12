<!-- /autoplan restore point: /Users/bprice/.gstack/projects/Takasukita-Oyaji-no-Kai-takakita-oyaji/migration-emdash-autoplan-restore-20260411-220436.md -->
# EmDash Migration Plan — Oyaji no Kai

Ground-up rebuild of https://oyajinokai (or equivalent domain) from Next.js 15 + Decap CMS + Cloudinary to Astro 6 + EmDash CMS + Cloudflare (D1/R2/Workers), using the takakita TanStack prototype as the visual reference.

## Current state

- **Repo**: Next.js 15.3.2 static export, Tailwind 4, shadcn/ui (54 primitives, mostly unused), Decap CMS (separate), Cloudinary for images, monolingual JA.
- **Content**: 1 blog post file (`content/blog/2023-10-14-sports-day.md`) — **NOT migrated** (user decision, autoplan final gate). Blog ships as empty collection. The real content is the page copy (about, activities list, contact, home hero/values) which is hardcoded inside React components under `app/` and `components/` and will be ported to EmDash CMS entries.
- **Pages**: `/`, `/about`, `/activities`, `/blog`, `/blog/[slug]`, `/contact`.
- **Images**: ~10 Cloudinary assets (cloud: `duh9jrbpp`), hardcoded URLs in JSX.

## Target state

- **Repo**: Astro 6 SSR project with EmDash integration at repo root. Everything from the current Next.js app is gone.
- **CMS**: EmDash database-first. SQLite locally, D1 in production. Admin at `/_emdash/admin`.
- **Theme**: Custom Astro theme matching the takakita visual language (Noto Sans JP, OKLCH warm-orange primary, Squiggle dividers, asymmetric 2-col grids, alternating layouts).
- **Hosting**: Cloudflare Workers + D1 + R2. Deployed via `wrangler`.
- **Images**: EmDash media library (local uploads folder in dev, R2 in prod). User will re-upload manually post-migration.
- **Language**: Japanese only. No i18n configuration.
- **Content**: blog (schema only, no entries — user-decided clean slate), activities (5 entries seeded from takakita `activities.tsx` with current oyajinokai copy), pages (about, contact, home-hero, home-values — full CMS scope per user decision in autoplan final gate).

## Non-goals

- **Cloudinary image migration.** User will re-upload images manually via EmDash admin after the migration ships.
- **Blog post body migration.** The single existing post (`2023-10-14-sports-day.md`) is NOT migrated per user decision. Schema for the blog collection stays, but no entries are ported. Blog ships with empty state.
- **Multi-language support.** Site stays JA-only for now. Leave i18n off; revisit later.
- **Cloudflare Access SSO on admin.** Production admin uses EmDash's default passkey-based auth (first user sets up via Setup Wizard at `/_emdash/admin`). `EMDASH_AUTH_SECRET` is configured in Phase F as a Wrangler secret. Cloudflare Access is NOT used (it would disable passkeys/OAuth/magic links per `docs/src/content/docs/guides/authentication.mdx`).
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
   - **`blog`** — `title` (string), `date` (datetime), `author` (string, default "高北おやじ"), `excerpt` (text), `featured_image` (image), `body` (portableText). NO explicit `slug` field (reserved — auto-derived from title).
   - **`activities`** — `month` (string, e.g. "5月"), `title` (string), `location` (string), `description` (text), `image` (image), `order` (integer, for sorting).
   - **`pages`** — `title` (string), `body` (portableText), `key` (string, used to look up entries by `home-hero`, `home-values`, `about`, `contact`). NO explicit `slug` field.
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
2. Populate `pages` collection (4 entries — full CMS scope per autoplan gate decision):
   - `home-hero` (key=`home-hero`) — hero title `高北おやじの会`, subtitle `高洲北小学校`, CTA labels `私たちについて` / `活動を見る`.
   - `home-values` (key=`home-values`) — 4 cards. Title + description per card. If Portable Text can't model the grid cleanly, use a structured `json` field on this entry instead. Cards:
     1. `子どもたちとの触れ合い` / `イベント活動を通じて、子どもたちと楽しく交流し、健全な成長をサポートします。`
     2. `おやじ同士の絆` / `活動を通じておやじ同士の交流を深め、互いに支え合う関係を築きます。`
     3. `楽しむこと` / `おやじたち自身もしっかり楽しむことができる会です。できる時に、できることを楽しむ！`
     4. `活動の実績` / `スキー、釣り、BBQなど、様々な活動を実現してきました。`
   - `about` (key=`about`) — body copy from current `app/about/page.tsx` (port to Portable Text blocks). Full text in `_legacy-copy.md` scratch file.
   - `contact` (key=`contact`) — body copy from `app/contact/page.tsx`. Email `info@takakitaoyaji.com`. Note: input fields for the contact form remain hardcoded in `contact.astro` — only the intro/explanatory copy is CMS-driven.
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
4. Run D1 migrations (pre-deploy, MUST happen before `wrangler deploy` — EmDash DDL cannot run at runtime): `wrangler d1 migrations apply oyajinokai-db --remote`. The `migrations/` directory is shipped by the EmDash template.
5. Generate auth secret: `npx emdash auth secret` → store via `wrangler secret put EMDASH_AUTH_SECRET`. Optionally set `EMDASH_PREVIEW_SECRET` the same way.
6. Apply schema/seed to remote DB: `npx emdash seed --remote` (or equivalent — verify exact CLI flag against installed EmDash version; fall back to running `wrangler d1 execute oyajinokai-db --remote --command "..."` per docs if `--remote` isn't supported in our pinned version).
7. Deploy: `wrangler deploy` (or `pnpm run deploy` if template provides).
8. First-run admin setup: visit `<deploy-url>/_emdash/admin` → Setup Wizard creates the first passkey-protected admin user. Save the recovery key.
9. Test: visit deployed URL, create a draft post via admin, publish, confirm it renders.
10. **Commit:** `emdash: cloudflare deploy — D1, R2, wrangler config, auth secret`

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

---

## /autoplan — CEO Review (Phase 1)

Status: **PREMISE GATE — awaiting user decision.** Codex and Claude subagent both independently flagged the plan's core premise.

### CEO consensus table

| Dimension | Claude subagent | Codex | Consensus |
|---|---|---|---|
| 1. Premises valid (EmDash needed)? | NO — could use Keystatic or static content collections | NO — Decap or static collections materially simpler | **DISAGREE with plan** |
| 2. Right problem to solve? | NO — real problem is "make annual edits survivable" | NO — reframe to "handful of annual edits" | **DISAGREE with plan** |
| 3. Scope calibration correct? | NO — 3 collections for 2 pages + 5 activities is process theater | NO — portable text for about/contact, CMS entry for home-values is overkill | **DISAGREE with plan** |
| 4. Alternatives sufficiently explored? | NO — plan debates template choice but not "any CMS?" | NO — "open questions" optimize wrong axis | **DISAGREE with plan** |
| 5. Competitive/market risks covered? | NO — link rot, school's inbound links not considered | NO — LINE/flyer/QR sharing creates link rot | **CONFIRMED gap** |
| 6. 6-month trajectory sound? | NO — EmDash young, auth is vuln, admin UX risk | NO — "beta preview", Cloudflare lock-in, stack stranger than problem | **CONFIRMED risk** |

**Score: 0/6 confirmed, 6/6 flagging concerns.** This is unusually strong consensus against the plan's premises.

### Critical findings (both voices agreed)

1. **Admin auth is a plan flaw, not an open question.** PLAN.md:28 puts production auth "out of scope" but PLAN.md:204 requires "admin writable in production." EmDash docs (`docs/src/content/docs/deployment/cloudflare.mdx:188-208`) require `EMDASH_AUTH_SECRET` for production, and middleware enforces auth on `/_emdash/admin` routes (`docs/src/content/docs/concepts/admin-panel.mdx:253-273`). This is a contradiction that must be resolved before Phase F, not a late-stage "verify."

2. **Scope inflation: `pages` and `home-values` collections.** For ~500 characters of about/contact copy and 4 fixed value cards, creating database-backed portable text entries is ceremony without value. Even if EmDash is retained, these should be hardcoded Astro components.

3. **EmDash self-describes as "beta preview"** (`README.md:157-159`). Plan says "pin version" but the real risk is ecosystem churn on Portable Text, D1 schema, Cloudflare bindings, and Astro integration surface — not just a semver bump.

4. **The CMS premise was never justified.** Both models observed that the plan's "Open questions" section debates template choice and hamburger menu implementation while treating EmDash, SSR, and Cloudflare D1 as givens.

### Possible premises the user may hold that models don't know

- **Dogfooding.** `/Users/bprice/dev/emdash` is in the user's local dev directory, added as a working dir for this session. If the user IS the EmDash author (or a heavy contributor), dogfooding on a real site is a legitimate business reason to adopt a beta CMS even for a tiny site. This flips the analysis: the project IS the product, the community site is the test vehicle. Neither outside voice had this context.
- **Admin UX goal.** If the real goal is "I want non-technical editors to actually edit content" (not just "make editing possible"), then admin UI matters more than the models credited.
- **Portfolio/showcase.** Building the site in EmDash may serve as a reference implementation for other users of EmDash.

### Recommendation

**Do NOT auto-decide this.** The models' pushback is strong, but the user may have dogfooding or showcase context that justifies overriding the recommendation. Proceeding without confirmation would be wrong in either direction.

### User override (2026-04-11, autoplan re-run)

User explicitly affirmed the EmDash premise in the re-run prompt:

> "We're going to essentially completely replace this current repository. We're going to migrate over to EmDash... Your job is to both set up EmDash in this repository, build the sample design into an astro project following the directions in EmDash docs around how to create a theme, and to port the content in the current repository over to EmDash."

This is the user-context the models lacked: the user has `~/dev/emdash/` cloned locally and `~/dev/ai/takakita/` as a working directory. This is dogfooding and/or a showcase build for EmDash itself. The community-site link rot risk and "stack stranger than problem" pushback are noted but accepted — the project IS the product.

**Premise gate: PASSED.** EmDash + Astro + Cloudflare D1/R2 is locked in. Remaining CEO concerns are escalated to taste decisions in the final gate (scope of `pages` collection vs hardcoded Astro pages).

## /autoplan — Phase 0 Re-Exploration Findings

Three Explore agents verified the plan against current state. New facts that change the plan:

| Finding | Source | Plan impact |
|---|---|---|
| Existing blog post is real content (~5.3 KB sports-day recap), not filler | `content/blog/2023-10-14-sports-day.md` | **Reversed prior plan**: port the post body. Phase E adds blog port step. |
| 11 Cloudinary URLs hardcoded across 8 files | grep `res.cloudinary.com` | All replaced by EmDash media references in Phase D/E. URLs deleted with the file. |
| **Exposed Cloudinary API key** `624184293779926` in `public/admin/config.yml:14` | Decap config | Security: revoke API key in Cloudinary console post-cutover. Add to Phase G. |
| Decap admin lives at `public/admin/{index.html,config.yml}` | filesystem | Delete in Phase A alongside Next.js code. |
| takakita stack: TanStack Start + React 19 + Vite + Tailwind 4.2 + Lucide React | `package.json` | Astro port can copy CSS tokens 1:1; React JSX → `.astro` syntax; Lucide → inline SVG or `astro-icon` |
| 4 value cards on home are NOT icon-based — text only (title + description) | `components/home/About.tsx` | Plan's "icon key + label + blurb" was wrong. Just title + text. No icon library needed for value cards. |
| Mobile menu uses React `useState` (Header.tsx) | takakita | Astro needs vanilla `<script>` toggle OR a client island. Plan's "lean vanilla" is correct — pick the open-question. |
| Contact form uses React state + mailto submit | takakita | Same — vanilla `<script>` builds the mailto link, no island needed. |
| EmDash CLI: `npm create emdash@latest`, `npx emdash seed`, `npx emdash types`, `npx emdash auth secret` | EmDash docs | All commands verified. |
| EmDash field types include `portableText`, `image`, `string`, `text`, `slug`, `select` etc. | `reference/field-types.mdx` | Plan's seed.json schema is feasible. |
| Image fields are objects (`.src`, `.width`, `.height`), not strings | `themes/creating-themes.mdx` | Page templates must access `entry.data.image.src` not `entry.data.image`. |
| Astro 6 + Live Content Collections; SSR mandatory for content routes | `getting-started.mdx:117` | Plan correctly says `output: "server"`. No `getStaticPaths()` for blog posts. |
| Reserved field slugs: `id`, `slug`, `status`, `author_id`, `created_at`, `updated_at`, `published_at`, `deleted_at`, `version`, `live_revision_id`, `draft_revision_id` | `concepts/collections.mdx:224` | Plan's `slug` field on `blog` and `pages` collection: **slug is reserved**. EmDash auto-generates slug; remove from explicit field list. |
| EmDash is in beta preview | `README.md` | Pin exact version in `package.json` (no `^` or `~`). |

---

## /autoplan — Phase 2: Design Review

Source data: `~/dev/ai/takakita` exploration. Reference: takakita is the visual contract. Each dimension scored 0–10 against "ports cleanly to Astro and visually matches takakita."

### Design dimensions

| # | Dimension | Score | Findings |
|---|---|---|---|
| 1 | **Typography** | 9/10 | Noto Sans JP via Google Fonts link in `Base.astro` head. Weights 400/500/700. CSS var `--font-sans: "Noto Sans JP", sans-serif;` direct copy from `takakita/src/styles.css:33`. |
| 2 | **Color tokens** | 10/10 | Full OKLCH block ports verbatim from `takakita/src/styles.css:36-59`. Tailwind 4 reads CSS vars natively. No conversion needed. |
| 3 | **Layout shell** | 9/10 | Sticky header (z-50, bg-background/95 backdrop-blur-sm), flex-col min-h-screen wrapper, footer with border-t py-8. Direct port. |
| 4 | **Information hierarchy** | 8/10 | Asymmetric `sm:grid-cols-[1.2fr_1fr]` with `-ml-6`/`-mr-6` overflow trick on alternating rows is the signature pattern. Must replicate in `activities.astro` and home featured sections. |
| 5 | **Visual rhythm** | 8/10 | Squiggle dividers between every major section. Max-width `max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10` is the standard wrapper. |
| 6 | **Interactive states** | 6/10 | Mobile menu open/close needs scripting. Form submission needs JS for mailto build. Empty state for `/blog` (no entries yet) is not in plan. **Gap: empty state copy needed.** |
| 7 | **Accessibility** | 7/10 | `lang="ja"` set. Keyboard nav not specified. Mobile hamburger needs `aria-expanded`, `aria-controls`. **Gap: a11y attributes for mobile menu.** |

### Design decisions auto-decided (with principle)

| Decision | Choice | Principle |
|---|---|---|
| Font loading | Google Fonts `<link>` in `Base.astro` head (matches takakita) | P5 explicit |
| Icon strategy | **No icon library.** Header uses inline SVG for hamburger (Lucide Menu/X paths copied directly). Value cards have no icons. Activity entries have no icons. | P5 explicit, P4 DRY (no library for 2 SVGs) |
| Mobile menu | Vanilla `<script>` in `Header.astro` toggling `aria-expanded` and `hidden` class. No island. | P5 explicit, P3 pragmatic |
| Contact form | Vanilla `<script>` reads inputs, builds `mailto:info@takakitaoyaji.com?subject=...&body=...`, sets `window.location.href`. No island. | P3 pragmatic |
| Squiggle component | Direct port of inline SVG with `text-foreground opacity-40`. `<Squiggle />` Astro component. | P5 explicit |
| Hero image | Use `public/hero.jpeg` (already exists in current repo), copy to new repo's `public/`. NOT a CMS field. | P3 pragmatic, P5 explicit |
| Activity card pattern | Inline asymmetric grid in `activities.astro`, NOT a reusable `ActivityCard` component (5 entries, alternating layout, easier to read inline). | P5 explicit (10-line obvious > 200-line abstraction) |
| Value cards on home | Inline grid in `index.astro`, 4 hardcoded `<div>` blocks. Not a `ValueCard` component, not a CMS entry. | P5 explicit |
| Empty blog state | Show "まだ投稿はありません。" centered text on `/blog` if zero entries. | P1 completeness |

### Design plan deltas (must be reflected in implementation)

1. **Drop `ValueCard.astro`, `BlogCard.astro`, `ActivityCard.astro` from architecture diagram.** They're 1-use abstractions for inline grids. Architecture section needs to remove these from `src/components/`.
2. **Add empty state to `/blog` index.**
3. **Add `aria-expanded` + `aria-controls` to mobile menu button.**
4. **Lucide icon copy:** copy Menu/X SVG path data directly into `Header.astro` (~10 lines). No `lucide-astro` package.

**Design gate: PASSED** with the deltas above to be applied during implementation.

---

## /autoplan — Phase 3: Eng Review

Reference: EmDash docs at `~/dev/emdash/docs/src/content/docs/`. Primary risks: command correctness, build ordering, schema correctness, dependency churn.

### Eng dimensions

| # | Dimension | Score | Findings |
|---|---|---|---|
| 1 | **Architecture** | 8/10 | Single Astro project at repo root. Clean. EmDash ships its own admin route — no separate backend. D1 + R2 are managed by EmDash integration. |
| 2 | **Schema correctness** | 6/10 | **Critical:** `slug` is a reserved field name in EmDash (`concepts/collections.mdx:224`). Plan's `blog.slug` and `pages.slug` MUST be removed — EmDash auto-generates them from a `string` `title` field via the `slug` derived field. Same for `author` if it conflicts with `author_id` (verify). |
| 3 | **Build ordering** | 7/10 | D1 migrations are pre-deploy (DDL cannot run at runtime). Plan now reflects this in Phase F step 4. **Verify** the EmDash migration ships in the template's `migrations/` dir, not `node_modules/emdash/migrations/`. |
| 4 | **Test coverage** | 4/10 | No tests in plan. **Gate:** for a JA-only static-content site with 1 dev, full test suite is overkill. Acceptable to ship with smoke tests only (see test plan below). |
| 5 | **Dependency pinning** | 7/10 | Plan says "pin exact EmDash version." Add: pin `astro`, `@astrojs/cloudflare`, `@emdash-cms/cloudflare` exactly too. EmDash is beta, churn is real. |
| 6 | **Local→prod parity** | 6/10 | Local uses SQLite + `./uploads` dir. Prod uses D1 + R2. Risk: image refs work locally but break in prod if EmDash media URLs are environment-specific. **Mitigation:** test image rendering on first deploy before declaring victory. |
| 7 | **Gitignore hygiene** | 9/10 | `.gitignore` must include: `data.db`, `data.db-*`, `.emdash/uploads/`, `.wrangler/`, `dist/`, `.astro/`, `node_modules/`. Plan G covers it. |

### Eng issues (auto-decided)

1. **Schema `slug` field.** Remove explicit `slug` field from `blog` and `pages` collection definitions in `.emdash/seed.json`. EmDash derives slug from `title` automatically, exposed via `entry.slug`. Decision: **fix in Phase B**, principle P1 completeness.

2. **Hardcoded D1 migration path.** Plan said `./node_modules/emdash/migrations/0001_core.sql`. Corrected to `wrangler d1 migrations apply oyajinokai-db --remote` which uses the template's `migrations/` directory. Decision: **already fixed**, principle P5 explicit.

3. **`pages` collection scope.** CEO review flagged that 4 value cards + 500 chars of about/contact don't justify a pages collection. **Counter-argument:** dogfooding EmDash means demonstrating Portable Text. **Compromise:** create the `pages` collection BUT only seed `about` and `contact` (no `home-hero`, no `home-values`). Home page hero + values stay hardcoded in `index.astro`. Decision: **partial scope**, principle P3 pragmatic. → **Marked TASTE DECISION** for final gate.

4. **Featured-image storage in dev.** EmDash local storage saves uploads to `./uploads/`, served via `/_emdash/api/media/file`. Astro dev server must proxy/serve this. Verify no extra config needed. Decision: **verify in Phase A boot test**, principle P6 action.

5. **No SSG for blog.** Plan correctly notes Astro `output: "server"`. But static-export Cloudflare Pages users sometimes assume `output: "static"` works. Document this as a load-bearing constraint in README.

6. **wrangler.jsonc compat date.** Use `2025-01-15` or newer (from EmDash docs example). Pin in Phase F.

7. **Recovery key for first admin.** Phase F step 8 must explicitly tell user to save the passkey recovery key. If lost, admin lockout = full DB reset. Add to phase notes.

### Test plan (smoke only)

| Test | Tool | When |
|---|---|---|
| `npm run dev` boots without error | manual | end of Phase A |
| Admin loads at `localhost:4321/_emdash/admin` | manual | end of Phase A |
| All 5 pages render with theme | manual visit | end of Phase D |
| Squiggle visible between sections | visual | end of Phase D |
| Activities page shows 5 entries with alternating layout | manual | end of Phase E |
| Mobile menu opens/closes via hamburger | manual (responsive devtools) | end of Phase D |
| Contact form opens mail client with prefilled body | manual | end of Phase D |
| `wrangler deploy` succeeds | CI / manual | end of Phase F |
| Production admin loads, first passkey enrolls | manual | end of Phase F |
| Production page render matches local | manual diff | end of Phase F |

### Architecture (revised)

```
oyajinokai/ (after migration)
├── astro.config.mjs          # output: server, cloudflare adapter, emdash integration
├── wrangler.jsonc            # name, compat date, D1 binding (DB), R2 binding (MEDIA)
├── package.json              # pinned: astro, @astrojs/cloudflare, emdash, @emdash-cms/cloudflare
├── migrations/               # D1 SQL migrations (from EmDash template)
├── src/
│   ├── live.config.ts        # emdashLoader for live collections
│   ├── layouts/Base.astro    # html lang=ja, head (fonts), Header, slot, Footer
│   ├── components/
│   │   ├── Header.astro      # sticky, hamburger w/ inline SVG, vanilla JS toggle
│   │   ├── Footer.astro      # border-t, copyright, mailto
│   │   └── Squiggle.astro    # inline SVG divider
│   ├── pages/
│   │   ├── index.astro       # hero (img+copy hardcoded), 4 value cards inline, 3 featured activities (CMS), latest blog (CMS)
│   │   ├── about.astro       # PortableText render of pages/about entry
│   │   ├── activities.astro  # all activities, alternating asymmetric grid inline
│   │   ├── contact.astro     # PortableText for intro + vanilla JS mailto form
│   │   ├── blog/index.astro  # list w/ empty state
│   │   └── blog/[slug].astro # SSR detail
│   └── styles/global.css     # @import tailwindcss + OKLCH tokens copied from takakita
├── .emdash/
│   ├── seed.json             # blog, activities, pages collections (no explicit slug field)
│   └── types.ts              # generated
├── public/
│   ├── logo.png
│   └── hero.jpeg
└── data.db (gitignored)
```

Removed from prior plan: `ActivityCard.astro`, `BlogCard.astro`, `ValueCard.astro`, `[...slug].astro` catch-all.

**Eng gate: PASSED** with the issues above resolved/deferred to phase implementation.

---

## /autoplan — Phase 4: Final Approval Gate

Phase 1 (CEO): user override accepted, premise locked. Phase 2 (Design): passed with deltas. Phase 3 (Eng): passed with corrections applied to Phases B, F. DX phase skipped (this is a website, not a developer tool).

### Resolved taste decisions

1. **`pages` collection scope: FULL SCOPE.** User chose to put every page in CMS. `pages` collection seeds 4 entries: `home-hero`, `home-values`, `about`, `contact`. `index.astro` queries `pages` for `home-hero` and `home-values`, renders Portable Text. Maximum dogfooding of EmDash.
2. **Blog post body migration: NO.** User chose clean slate. `content/blog/2023-10-14-sports-day.md` is deleted. `/blog` ships with empty state copy ("まだ投稿はありません。").
3. **Squiggle: inline SVG component.** (auto-decided)
4. **Image strategy: EmDash local in dev, R2 in prod, manual re-upload by user.** (already specified by user in intro message)

### Final architecture impact (from gate decisions)

- Phase B `pages` collection seeds 4 entries (was 2 in interim eng review).
- Phase D `index.astro` queries `pages` collection twice (`home-hero`, `home-values`) and renders both as Portable Text. Hero image stays as `<img src="/hero.jpeg">` (not in CMS).
- Phase D `home-values` renders as a 4-column grid via custom Portable Text component config OR as a structured field on the entry. **Eng decision deferred to implementation:** if Portable Text doesn't model 4-card grids cleanly, switch `home-values` to a structured `select`/`json` field on the entry. Reassess at Phase D.
- Phase E does NOT touch `content/blog/`. Phase A deletes that directory entirely.

### Review log

**Approved.** Proceeding with implementation. Atomic commits per phase A–G.



## Success criteria

- [ ] `npm run dev` boots, admin accessible at `/_emdash/admin`.
- [ ] Home, about, activities, blog list, blog post, contact all render with theme applied.
- [ ] Blog list page renders empty state cleanly (no entries yet — filler post not migrated).
- [ ] All 5 activities visible on `/activities`.
- [ ] Squiggle dividers visible between major sections.
- [ ] Deployed to Cloudflare, accessible via *.pages.dev or custom domain.
- [ ] Admin writable in production (create a draft post via admin, it persists, renders after publish).
- [ ] `main` updated via PR; old Next.js code removed.
