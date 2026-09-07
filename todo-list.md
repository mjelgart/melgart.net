# Project To-dos
- set up linting
- investigate the Lighthouse accessibility (94-96) and best-practices (96) gaps — framework-independent, likely alt text and/or contrast
- clear the 8 `astro check` type errors (build and CI are unaffected — CI runs tests
  plus `astro build`, not `astro check`):
  - `posts/[slug].astro` × 6: `Astro.props` infers as `never`, so every `entry.data.*`
    read errors. `InferGetStaticPropsType` and `astro sync` both failed to fix it.
  - `index.astro`, `posts.astro`: React-style `key` prop on `<li>` isn't a valid
    HTML attribute; Astro doesn't need it, so these can likely just be dropped.

## Ideas for if we ever build a stateful site
- email, probably
- visitor count?
