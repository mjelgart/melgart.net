# CLAUDE.md - Project Guidelines

## Commands
- `npm run dev` - Start Astro development server
- `npm run start` - Alias for dev command
- `npm run build` - Build static site to `dist/` directory
- `npm run preview` - Preview built site locally
- `npm run test` - Run Vitest in watch mode (local dev)
- `npm run test:run` - Run Vitest once and exit (CI / verification)
- `npm run astro` - Run Astro CLI commands
- `npm run check` - Lint, format check, type check, and tests: everything CI checks before building. Run before pushing.
- `npm run lint` - ESLint (`--max-warnings 0`)
- `npm run format` - Prettier, rewriting files; `npm run format:check` only reports
- `npm run typecheck` - `astro check`

## Testing
- Tests live in `/tests`, with component tests in `tests/components/`, unit tests in `tests/unit/`, and integration tests in `tests/integration/`.
- Component tests use React Testing Library to test React islands (Search component).
- `astro:content` is a build-only virtual module; `vitest.config.js` aliases it to `tests/stubs/astro-content.js` so unit tests can import site modules that reach for it.
- Integration tests use `tests/integration/build.test.js` to verify `astro build` succeeds and generates expected output, including that no internal link, image, or og URL in `dist/` is broken. External links are not checked.
- CI runs lint, format check, type check, and tests before `astro build`, so any failure blocks deploy.
- Vitest config lives at `vitest.config.js`. `tests/setup.js` imports jest-dom matchers for enhanced assertions.
- After changes, run `npm run check` before pushing.

## Project Structure
- `/src/pages` - Astro pages (routes) with `/src/pages/posts/[slug].astro` for dynamic routes
- `/src/components` - React island components (Search.jsx, TeamsTracker.jsx)
- `/src/layouts` - Astro layout components (Layout.astro)
- `/src/utils` - Shared build-time helpers (posts.js)
- `/src/styles` - Global CSS and utility styles
- `/src/content/posts` - Markdown content with frontmatter (Astro Content Collections)
- `/public` - Static assets
- `/dist` - Built static site output
- `/tests` - Vitest test files (component, unit, and integration tests)

## Public Drafts
A post with `draft: true` in its frontmatter still builds at `/posts/<slug>`, so the
URL can be shared, but it is withheld from everything that would surface it including the PageFind search index. 


## Quality Checks
- **ESLint** (`eslint.config.js`): Astro, React islands, hooks, and accessibility rules. Accessibility uses `eslint-plugin-jsx-a11y-x`, the maintained fork; the original does not support ESLint 10. Disable a rule only with a comment saying why.
- **Prettier** (`.prettierrc.json`): owns all formatting; don't hand-format. Markdown is ignored, so posts and notes are never rewritten.
- **Lighthouse CI** (`lighthouserc.json`): runs in CI against the built site. Accessibility below its threshold fails the build; other categories warn. Raise thresholds when scores improve, never lower them to get a change through.
- **Post-deploy check** (`verify-live` job): after each deploy to main, `scripts/verify-deploy.sh` confirms melgart.net serves the exact files just deployed (retrying up to 11 minutes for GitHub Pages' CDN cache) and that every page and image loads, then Lighthouse runs against the live site (`lighthouserc.live.json`, performance and best practices, warn-only).
- **Dependabot** (`.github/dependabot.yml`): every other month. Minor and patch updates are grouped into one PR; majors arrive one per PR.

## Code Style Guidelines
- Use functional React components for islands with named exports
- Use Astro components (.astro) for page layouts and static content
- Follow camelCase for files, variables, functions
- Use PascalCase for React and Astro components
- Destructure props in function parameters
- Order imports: React → Astro → styles → content/data
- Use scoped `<style>` blocks in Astro components
- Mark React islands with appropriate hydration directive (`client:load`, `client:visible`)
- Keep components focused on a single responsibility
- Comment complex logic but prefer clear, self-documenting code
- Use JSDoc annotations for function type documentation
- Follow existing patterns when adding new features
