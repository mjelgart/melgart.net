# melgart.net — Astro post-migration (2026-04-25)

Captured on `feature/astro-migration` after Commit 6 (Next.js removal),
with the verification gate green. Diff target: `metrics/baseline-2026-04-18.md`.

Same host as baseline (miranda, Ubuntu 24.04, Node 22 locally / Node 24 in CI).
Measurements are local; CI numbers will follow once the PR runs.

---

## 1. Page weight (what a first-time visitor downloads)

Astro emits no JS for pages that contain no islands. Search and TeamsTracker
are the only islands.

### Home page (`/`) — has Search island

Referenced bundles (via `<script>` tags in `dist/index.html`):

| Asset                            | Raw bytes | Gzipped |
|----------------------------------|----------:|--------:|
| HTML document                    |    12,899 |   4,501 |
| `_astro/client.*.js` (React runtime) | 136,159 | 43,932 |
| `_astro/Search.*.js` (island)    |     2,115 |     940 |
| **Total transfer (first visit)** | **151,173** | **49,373** |

(The `index.*.js` and `jsx-runtime.*.js` chunks exist but are dynamic
imports off the React runtime, not directly loaded by the document.)

### Post page (`/posts/the-dispossessed`) — no islands

| Asset                            | Raw bytes | Gzipped |
|----------------------------------|----------:|--------:|
| HTML document                    |     9,287 |   4,094 |
| JS                               |         0 |       0 |
| **Total transfer (first visit)** | **9,287** | **4,094** |

Zero JS. `find dist/posts/the-dispossessed -name '*.js'` returns nothing.

### Sports page (`/sports`) — has TeamsTracker island

| Asset                            | Raw bytes | Gzipped |
|----------------------------------|----------:|--------:|
| HTML document                    |    10,200 |   3,357 |
| `_astro/client.*.js`             |   136,159 |  43,932 |
| `_astro/TeamsTracker.*.js`       |    21,013 |   3,676 |
| **Total transfer (first visit)** | **167,372** | **50,965** |

---

## 2. Build output (`dist/`)

```
2.2M   dist/                (total)
932K   dist/images/         (unchanged from baseline)
796K   dist/pagefind/       (unchanged from baseline)
164K   dist/_astro/         (5 JS chunks — replaces _next/'s 672K)
260K   dist/posts/          (per-post HTML)
 12K   dist/index.html
  8K   dist/posts/index.html
 12K   dist/sports/index.html
  4K   dist/saved-on-hosting/index.html
```

By file type across entire output:

| Type   |     Total | Files |
|--------|----------:|------:|
| .js    | 166,605 B |    5  |
| .html  | ~263,000 B|   19  |
| .css   |  ~6,000 B |    2  |

The `_next/` directory (672K of framework JS) is gone. `_astro/` (164K) is
its replacement — about a 4× reduction, before considering that most pages
reference *zero* of those chunks.

---

## 3. Repo complexity

| Metric                            |  Baseline | Astro |  Change |
|-----------------------------------|----------:|------:|--------:|
| Direct dependencies               |         8 |     4 |   −50% |
| Direct devDependencies            |         7 |     8 |    +1  |
| Transitive deps (`npm ls --all -p`)|       235 |   457 | +94%   |
| `node_modules` size               |     597 M |  295 M | −51%   |
| `node_modules` top-level dirs     |       202 |   346 |  +71%  |
| `package-lock.json` lines         |     4,056 | 7,521 |  +85%  |
| Git-tracked files                 |        58 |    72 |  +24%  |
| High-severity npm audit findings  |         1 |     0 |  −100% |

The transitive dep / `node_modules` accounting is misleading: baseline used
flat `npm ls` (top-level only), and Astro's tooling (Vite, Rollup,
@astrojs/check, TypeScript) adds many small packages. The byte-on-disk
metric (node_modules size) is the honest one and dropped 51%.

### Direct deps now

```
dependencies:    @astrojs/react, astro, react, react-dom
devDependencies: @astrojs/check, @testing-library/jest-dom,
                 @testing-library/react, @testing-library/user-event,
                 jsdom, pagefind, typescript, vitest
```

`next`, `date-fns`, `remark`, `remark-gfm`, `remark-html`, `gray-matter`,
`@vitejs/plugin-react` are all gone.

### Files by type (git-tracked)

| Extension | Count |
|-----------|------:|
| .md       | 21 (15 posts + 4 docs + metrics) |
| .astro    |  6 (layouts + pages) |
| .jsx      |  3 (Search, TeamsTracker, search test) |
| .css      |  2 (global, utils) |
| .ts       |  1 (content.config.ts) |
| .js       |  3 (astro.config, vitest.config, integration test) |
| .json     |  3 |
| .yml      |  1 |

---

## 4. Build/install cost

| Step                     | Wall clock |
|--------------------------|-----------:|
| `npm run build` (local)  |      4.6 s |
| Pagefind postbuild       |     0.04 s |

Baseline `npm run build` was 13.5 s. Astro's build is **3× faster** locally
on this content (no React server-rendering, no webpack).

CI numbers (build job + deploy job) will be captured from the first
post-merge run on `main`.

---

## 5. Headline diff

| Metric                            | Baseline | Astro | Δ     |
|-----------------------------------|---------:|------:|------:|
| **Home page JS (gzip)**           |   136 kB | 49 kB | −64% |
| **Post page JS (gzip)**           |   134 kB |  0 kB | **−100%** |
| Home page total transfer (gzip)   |   140 kB | 49 kB | −65% |
| Post page total transfer (gzip)   |   140 kB |  4 kB | −97% |
| Build output dir                  |     2.6M |  2.2M | −15% |
| Framework chunks (_next vs _astro)|    672 K | 164 K | −76% |
| `node_modules` size               |    597 M | 295 M | −51% |
| Local build time                  |   13.5 s | 4.6 s | −66% |

The headline win lands. The plan predicted "JS shipped per post page drops
from 134 kB → near zero" — actual is 134 kB → 0 kB, exactly. The home
page predicted "5–15 kB gz" of island JS; actual is 940 B for Search
specifically, but the React runtime (`client.*.js`) adds 44 kB gz on top.
That 44 kB is the floor for any page with at least one React island — it's
the React runtime, hashed and shared across pages with islands, cached on
second visit.

Lighthouse re-runs from PageSpeed Insights need to wait until the PR is
merged and deployed.
