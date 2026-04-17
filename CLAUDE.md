# CLAUDE.md - Project Guidelines

## Commands
- `npm run dev` - Start development server
- `npm run build` - Build production version
- `npm run start` - Start production server
- `npm run export` - Export as static HTML/CSS/JS
- `npm run test` - Run Vitest in watch mode (local dev)
- `npm run test:run` - Run Vitest once and exit (CI / verification)

## Testing
- Tests live in `/tests`, mirroring the source layout: `tests/utils/`, `tests/components/`, plus `tests/fixtures/posts/` for markdown fixtures.
- Unit tests cover `utils/posts.js`; component tests use React Testing Library against the four components in `/components`.
- `utils/posts.js` exports accept an optional `dir` argument so tests can point at `tests/fixtures/posts/` instead of real blog content.
- CI runs `npm run test:run` before `next build`, so a test failure blocks deploy.
- Vitest config lives at `vitest.config.js`. `tests/setup.js` mocks `next/head`, `next/image`, and `next/link` as passthroughs so components render in jsdom.
- After changes, run `npm run test:run` before pushing.

## Project Structure
- `/pages` - Next.js pages (routes) with `/pages/posts/[id].js` for dynamic routes
- `/components` - Reusable React components
- `/styles` - CSS modules and global styles
- `/posts` - Markdown content with front matter
- `/public` - Static assets
- `/utils` - Helper functions
- `/tests` - Vitest test files and fixtures

## Code Style Guidelines
- Use functional React components with named exports
- Follow camelCase for files, variables, functions
- Use PascalCase for React components
- Destructure props in function parameters
- Order imports: React → Next.js → styles → utils
- Use CSS modules for component-specific styles
- Keep components focused on a single responsibility
- Comment complex logic but prefer clear, self-documenting code
- Use JSDoc annotations for function type documentation
- Follow existing patterns when adding new features