# CLAUDE.md - Project Guidelines

## Commands
- `npm run dev` - Start development server
- `npm run build` - Build production version
- `npm run start` - Start production server
- `npm run export` - Export as static HTML/CSS/JS

## Project Structure
- `/pages` - Next.js pages (routes) with `/pages/posts/[id].js` for dynamic routes
- `/components` - Reusable React components
- `/styles` - CSS modules and global styles
- `/posts` - Markdown content with front matter
- `/public` - Static assets
- `/utils` - Helper functions

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