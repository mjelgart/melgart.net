# Astro Migration Plan

**Target branch:** `feature/astro-migration` (this branch).
**Implementation model:** intended for Sonnet 4.6.
**Baseline to diff against:** `metrics/baseline-2026-04-18.md`.

## 1. Context & goal

melgart.net is a static blog currently built with Next.js 14, exported to
GitHub Pages. The site is visual-text-first: 15 markdown posts, one
interactive sports tracker, one search box. Next was chosen before the author
knew much webdev; in practice the framework's features (SSR, API routes,
middleware) are unused. Each page ships ~134 kB of gzipped JS for content
that's essentially static text.

**Goal:** replace Next with Astro. Ship ~0 kB JS on plain post pages. Keep
interactive elements as React "islands." Preserve all URLs, content, and
visual design.

**Non-goals for this migration:** redesign, new features, accessibility
improvements (tracked separately in `todo-list.md`), replacing React with
Svelte/Solid/vanilla for the islands.

## 2. Locked-in design decisions

The implementer should NOT revisit these. If one seems wrong mid-execution,
stop and flag it to the user rather than improvising.

### Framework & integrations
- Astro latest (6.x). (Originally specified as 5.x when this plan was
  authored 2026-04-20; `astro@latest` has since rolled forward to 6 and we
  adopted it during astro-01 rather than pin back. Content-collection
  differences are noted in the "Content pipeline" subsection below.)
- `output: 'static'` (default).
- `@astrojs/react` integration — lets the two interactive components stay as
  React islands. Expected bundle: React runtime ships only on `/` and `/sports`
  (the pages with islands); everywhere else, zero JS.
- Node 24 in CI (already configured).

### Content pipeline
- Use `astro:content` **Content Collections**.
- Collection name: `posts`. Physical location: `src/content/posts/`.
- All 15 markdown files from `/posts/` move here unchanged.
- Schema (`src/content.config.ts` — Astro 6 moved the file out of
  `src/content/` and requires a `loader` per collection):
  ```ts
  import { defineCollection, z } from 'astro:content';
  import { glob } from 'astro/loaders';

  const posts = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
    schema: z.object({
      title: z.string(),
      date: z.string(),
      subtitle: z.string().optional(),
    }),
  });

  export const collections = { posts };
  ```
  Under the glob loader each entry's stable key is `entry.id` (filename
  without extension), and there is no `entry.slug` or `entry.render()`.
  Use `render(entry)` imported from `astro:content` — see Commit 4.
- **Delete** `utils/posts.js`, `tests/utils/posts.test.js`, and
  `tests/fixtures/posts/` — the content collection replaces every one of
  those lines.
- Markdown GFM support is on by default in Astro — no extra config needed.
  Tables, strikethrough, etc. render correctly out of the box.

### Routing & URLs
- All existing URLs must be preserved:
  - `/` — home
  - `/posts` — archive
  - `/posts/{slug}` — one per post (15 slugs)
  - `/saved-on-hosting`
  - `/sports`
  - `/404`
- Astro's default is no trailing slash, matching current Next behavior.
  Explicitly set `trailingSlash: 'ignore'` in `astro.config.mjs` to be
  safe against future defaults.
- Set `site: 'https://melgart.net'` in `astro.config.mjs` (for canonical
  URLs, sitemap, etc.).

### Styling
- `styles/global.css` → `src/styles/global.css`. Import once in
  `src/layouts/Layout.astro`.
- `styles/utils.module.css` → `src/styles/utils.css` (plain CSS, **not** a
  module). Usages change from `className={utilStyles.headingXl}` to plain
  `class="headingXl"`.
- `components/layout.module.css`, `components/Search.module.css` → collapse
  their contents into scoped `<style>` blocks within the corresponding
  `.astro` / `.jsx` files.
- `styles/Home.module.css` — **delete**, unused vestige from
  `create-next-app`.

### Components
Current source layout and migration target:

| Current (Next)                       | New (Astro)                                                    | Notes |
|---|---|---|
| `pages/_app.js`                      | **deleted**                                                    | Replaced by layout + global.css import |
| `pages/index.js`                     | `src/pages/index.astro`                                        | Content + Search island (`client:visible`) |
| `pages/posts.js`                     | `src/pages/posts.astro`                                        | Uses `getCollection('posts')`, sorted desc by date |
| `pages/posts/[id].js`                | `src/pages/posts/[slug].astro`                                 | `getStaticPaths` over collection; `<article data-pagefind-body>` preserved verbatim |
| `pages/saved-on-hosting.js`          | `src/pages/saved-on-hosting.astro`                             | `moneyCalculator()` moves into Astro frontmatter, runs at build time (same semantics as today — value is frozen per deploy) |
| `pages/sports.js`                    | `src/pages/sports.astro` + `src/components/TeamsTracker.jsx`   | Page shell is .astro; the interactive tracker becomes a React island (`client:load`). `data/sports-data.json` stays put, imported by the island. |
| `components/layout.js`               | `src/layouts/Layout.astro`                                     | `<slot />` replaces `children`; `home` prop stays; native `<img>` with explicit width/height replaces `next/image` (only the profile photo used it) |
| `components/date.js`                 | inline in each `.astro` file that needs it, OR a minimal `FormattedDate.astro` — implementer's call, whichever reads cleaner | Use `Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' })` instead of date-fns. Output must remain `<time datetime="{iso}">January 15, 2024</time>`. |
| `components/injectMetadata.js`       | merged into `Layout.astro` as `title`/`description` props      | The layout renders the full set of og: and twitter: meta tags |
| `components/Search.js`               | `src/components/Search.jsx`                                    | Kept as React island with `client:visible`. Logic unchanged — dynamic script injection of `/pagefind/pagefind-ui.js`, same error/loading states |
| `components/Search.module.css`       | scoped `<style>` block in `Search.jsx` (or adjacent `.module.css` — either works) | The `:global(.pagefind-ui__…)` overrides must still reach Pagefind's own DOM |

### Images
- `/public/images/*` stays put, referenced by same `/images/foo.jpg` paths.
- **No `astro:assets`**. Only one image used `next/image` (profile photo) and
  it was `unoptimized` under static export anyway. Plain `<img>` with
  explicit `width="144" height="144"` preserves layout.

### Dates
- Drop `date-fns`. Use `Intl.DateTimeFormat`:
  ```js
  const formatted = new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  }).format(new Date(post.data.date));
  ```
- Preserves current format (`January 15, 2024`).

### Pagefind
- Unchanged in function.
- `postbuild` script: `npx pagefind --site dist` (was `--site out`).
- Index operates on generated HTML; `<article data-pagefind-body>` marker
  on `[slug].astro` must render with that exact attribute.
- `/public/pagefind/` is generated by the postbuild step, served at
  `/pagefind/*` at runtime — identical to today.
- `Search.jsx` references `/pagefind/pagefind-ui.js` — no change needed.

### Testing
Vitest stays. Simplify the setup:

- **Delete:**
  - `tests/utils/posts.test.js` and `tests/fixtures/posts/` (framework replaces the code under test)
  - `tests/components/date.test.jsx`, `tests/components/layout.test.jsx`,
    `tests/components/injectMetadata.test.jsx` (these become `.astro` and
    aren't RTL-testable)
- **Keep:**
  - `tests/components/search.test.jsx` — Search stays React. Update import
    path to `../../src/components/Search.jsx`. The existing
    `createElement` spy trick for the Pagefind script still works.
- **Add:**
  - `tests/integration/build.test.js` — spawns `astro build`, asserts
    `dist/posts/the-dispossessed/index.html` exists and contains the post
    title and expected body text. One integration test catches "build
    succeeds but content broke."
- **Simplify `tests/setup.js`:** keep only `import '@testing-library/jest-dom/vitest'`. Delete the `next/head`, `next/image`, `next/link` mocks.
- **Simplify `vitest.config.js`:** drop the `oxc: { lang: 'jsx' }` hack and
  `@vitejs/plugin-react` (Astro's integration provides JSX handling).
- CI test step (`npm run test:run`) is unchanged.

### CI workflow
Edit `.github/workflows/build-and-deploy.yml`:

- `next build` → `astro build`
- `pagefind --site out` → `pagefind --site dist`
- Upload artifact path `./out` → `./dist`
- Remove the `Restore cache` step entirely (it caches `.next/cache`; Astro
  doesn't need a build cache between runs for a site this small)
- The "Setup Pages" step currently uses `static_site_generator: next` —
  remove that parameter (it only auto-injects `basePath`, which we don't
  need; we're deploying to the apex domain via CNAME)
- Structure otherwise identical: checkout → setup node → install → test →
  build → pagefind → upload → deploy

### `package.json` scripts (after migration)
```json
{
  "scripts": {
    "dev": "astro dev",
    "start": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "postbuild": "npx pagefind --site dist",
    "test": "vitest",
    "test:run": "vitest run",
    "astro": "astro"
  }
}
```

### Dependency changes

**Remove:**
- `next`, `react`, `react-dom` (react/react-dom come back via @astrojs/react transitively; verify they're not left in direct deps)
- `date-fns`, `remark`, `remark-gfm`, `remark-html`, `gray-matter`
- `@vitejs/plugin-react` (devDep)

**Add:**
- `astro`
- `@astrojs/react`
- `react`, `react-dom` (direct deps again, but only loaded by islands)
- `@astrojs/check`, `typescript` (devDeps — required by `npx astro check`
  checkpoint; added during astro-01)

The net expectation: node_modules drops from ~597 MB to ~250 MB; transitive
deps from 235 to ~120.

## 3. Execution — six commits on this branch

This branch is long-running. No intermediate PRs. When all commits are in
and all verifications pass, open **one PR** to `main`.

### Commit 1 — `chore: add Astro + integrations, scaffold config`
- Install `astro` and `@astrojs/react` (as direct deps).
- Create `astro.config.mjs`:
  ```js
  import { defineConfig } from 'astro/config';
  import react from '@astrojs/react';
  export default defineConfig({
    site: 'https://melgart.net',
    trailingSlash: 'ignore',
    integrations: [react()],
  });
  ```
- Create empty `src/` skeleton: `src/pages/`, `src/layouts/`, `src/components/`, `src/content/`, `src/styles/`.
- `npm run build` NOT expected to succeed yet — Next is still the active framework.
- **Checkpoint:** `npx astro --version` works.

### Commit 2 — `feat(astro): add content collection for posts`
- `src/content.config.ts` with the schema above (Astro 6 path — NOT
  `src/content/config.ts`, which is the legacy location that `astro check`
  will reject).
- Move all 15 files from `/posts/*.md` → `/src/content/posts/*.md` (git mv
  with a wildcard, not file-by-file).
- `npx astro check` — no type errors.
- **Checkpoint:** `npx astro check` succeeds.

### Commit 3 — `feat(astro): port layout + static pages`
- `src/styles/global.css` (copy from `styles/global.css`).
- `src/styles/utils.css` (convert from `styles/utils.module.css`).
- `src/layouts/Layout.astro`:
  - Props: `title`, `description`, `home?: boolean`.
  - Renders full `<html>`, `<head>` (icon, og:image, plus all the og:/twitter: meta from `injectMetadata`), `<body>`.
  - Home variant: centered profile image, no back-to-home link.
  - Non-home variant: `melgart.net` header link, back-to-home link at bottom.
  - Imports global.css and utils.css.
- Port `src/pages/index.astro`:
  - `---` frontmatter fetches `getCollection('posts')`, sorts desc by `data.date`, slices top 5.
  - Body mirrors current JSX structure: intro, My Links, Search, Blog preview, What I'm Reading, What I'm Listening To, Extras, CC license.
  - `<Search client:visible />` in the Search section.
- Port `src/pages/posts.astro`: full archive list.
- Port `src/pages/saved-on-hosting.astro`: `moneyCalculator()` logic moves into frontmatter.
- **Checkpoint:** `npm run build` in Astro (rename one of Next's scripts temporarily if needed) produces `/`, `/posts`, `/saved-on-hosting` with correct content. Spot-check HTML output.

### Commit 4 — `feat(astro): port dynamic posts and React islands`
- `src/pages/posts/[slug].astro` (Astro 6 content API):
  - Import `{ getCollection, render }` from `astro:content`.
  - `getStaticPaths` maps each entry to `{ params: { slug: entry.id },
    props: { entry } }`. (Under the glob loader, `entry.id` is the
    filename without `.md` extension — matches the current Next slug.)
  - Body frontmatter: `const { entry } = Astro.props; const { Content } =
    await render(entry);`
  - Body: `<article data-pagefind-body>` with title, date, and
    `<Content />`.
- `src/components/Search.jsx`:
  - Copy `components/Search.js` verbatim, rename. Adjust CSS import (styled block or .module.css next to it). No logic changes.
- `src/components/TeamsTracker.jsx`:
  - Copy the `TeamCard` and `TeamsTracker` code from `pages/sports.js` into a new standalone React component file.
  - `TeamsTracker` becomes the default export.
  - Imports `sportsData` from `../../data/sports-data.json` (path relative to new location).
- `src/pages/sports.astro`:
  - Page shell (title, h1, intro paragraph).
  - `<TeamsTracker client:load />`.
- **Checkpoint:** `npm run build` produces all 21 pages (5 static + 15 posts + 404 implicit + `_` pages). Open `npm run preview` and visually compare against the current site. Post pages should show "0 kB" JS in devtools network tab.

### Commit 5 — `ci: switch build and tests to Astro`
- Update `.github/workflows/build-and-deploy.yml` per §2 above.
- Update `vitest.config.js` — drop `@vitejs/plugin-react`, drop OXC config.
- Simplify `tests/setup.js`.
- Delete obsolete test files per §2 Testing section.
- Update `tests/components/search.test.jsx` import path.
- Add `tests/integration/build.test.js`.
- Update `package.json` scripts per §2.
- **Checkpoint:** `npm run test:run` passes locally. `npm run build` passes locally.

### Commit 6 — `chore: remove Next.js and obsolete source files`
- Delete `/pages/` directory.
- Delete `next.config.js`.
- Delete `/components/*.js`, `/components/*.module.css` (all ported or obsolete).
- Delete `/styles/` (all ported or deleted).
- Delete `/utils/posts.js`, `/utils/` if empty.
- Delete `/posts/` (content moved to src/content/posts).
- Remove Next, date-fns, remark*, gray-matter from `package.json`.
- `rm -rf node_modules package-lock.json && npm install` to prune the lockfile.
- Update `CLAUDE.md`:
  - Replace Commands section (astro scripts).
  - Update Project Structure (src/ layout, content collections).
  - Update Testing section (describe new layout, integration test).
  - Code Style Guidelines: adjust where Next-specific advice no longer applies.
- Update `todo-list.md` — remove any stale Next-specific items if present.
- **Checkpoint:** `npm run build && npm run test:run` both green. `git status` is clean. Everything old is gone.

## 4. Verification gate (before opening the PR)

All must pass. No exceptions.

1. `npm run build` — succeeds. `dist/` produced.
2. `npm run test:run` — all green.
3. `npm run dev` — boot, visit all 5 static routes + at least 2 post routes. Visual parity with live site.
4. Weight measurement:
   ```bash
   du -sh dist
   find dist -name '*.js' -exec du -cb {} + | tail -1
   ```
   Post page should report near-zero JS. Home + sports should ship React runtime + island code only.
5. Capture the same metrics as `metrics/baseline-2026-04-18.md` into a new file `metrics/post-astro-YYYY-MM-DD.md`. Include a headline diff table showing before/after on: page weight, node_modules size, dep count, build time, file count.
6. Include that diff table in the PR description.

## 5. Risks & escape hatches

- **Trailing slash drift**: if `astro build` emits `/posts/foo/index.html` instead of `/posts/foo.html` (or vice versa) relative to what Next emitted, external inbound links break. Mitigation: `trailingSlash: 'ignore'` + spot-check `dist/posts/` structure vs current `out/posts/`. If they differ, adjust `build.format` in astro.config.
- **Pagefind generates into wrong dir**: `dist/pagefind/` must exist after postbuild. If not, the Pagefind CLI args or the npm script is wrong.
- **React island weight exceeds expectations**: if `/sports` ships more than ~40 kB gz after migration, re-examine whether the tracker is being code-split properly. Check Astro's hydration output in devtools.
- **Build fails on an obscure markdown edge case**: if remark-gfm features render differently, compare a known post's HTML output before and after. Adjust Astro's markdown config if needed.

If any of these block execution: STOP and report to the user rather than improvising a workaround.

## 6. Sign-off

The PR description should include:
- Summary bullets covering what changed.
- Link to this plan file.
- The metrics diff table from §4.
- Test plan checklist for visual spot-checks.
