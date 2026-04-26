# CLAUDE.md - Project Guidelines

## Commands
- `npm run dev` - Start Astro development server
- `npm run start` - Alias for dev command
- `npm run build` - Build static site to `dist/` directory
- `npm run preview` - Preview built site locally
- `npm run test` - Run Vitest in watch mode (local dev)
- `npm run test:run` - Run Vitest once and exit (CI / verification)
- `npm run astro` - Run Astro CLI commands

## Testing
- Tests live in `/tests`, with component tests in `tests/components/` and integration tests in `tests/integration/`.
- Component tests use React Testing Library to test React islands (Search component).
- Integration tests use `tests/integration/build.test.js` to verify `astro build` succeeds and generates expected output.
- CI runs `npm run test:run` before `astro build`, so a test failure blocks deploy.
- Vitest config lives at `vitest.config.js`. `tests/setup.js` imports jest-dom matchers for enhanced assertions.
- After changes, run `npm run test:run` before pushing.

## Project Structure
- `/src/pages` - Astro pages (routes) with `/src/pages/posts/[slug].astro` for dynamic routes
- `/src/components` - React island components (Search.jsx, TeamsTracker.jsx)
- `/src/layouts` - Astro layout components (Layout.astro)
- `/src/styles` - Global CSS and utility styles
- `/src/content/posts` - Markdown content with frontmatter (Astro Content Collections)
- `/public` - Static assets
- `/dist` - Built static site output
- `/tests` - Vitest test files (components and integration tests)

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