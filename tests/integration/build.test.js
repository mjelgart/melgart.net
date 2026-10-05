import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawn } from 'child_process';
import { readFileSync, writeFileSync, rmSync, existsSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const SITE = 'https://melgart.net';
const distDir = join(process.cwd(), 'dist');

// A public draft written into the content directory just for this run, so the
// draft rules are exercised against a real build without shipping a permanent
// half-written post. Removed again in afterAll.
const DRAFT_SLUG = 'zz-draft-fixture';
const DRAFT_TITLE = 'Fixture Draft Post';
const draftPath = join(process.cwd(), 'src/content/posts', `${DRAFT_SLUG}.md`);

const listHtmlFiles = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return listHtmlFiles(path);
    return entry.name.endsWith('.html') ? [path] : [];
  });

// The file a static host would serve for a URL path, if any.
const servesFile = (pathname) => {
  const target = join(distDir, decodeURIComponent(pathname));
  return [target, join(target, 'index.html'), `${target}.html`].some(
    (candidate) => existsSync(candidate) && statSync(candidate).isFile(),
  );
};

describe('Build integration', () => {
  beforeAll(async () => {
    writeFileSync(
      draftPath,
      `---\ntitle: '${DRAFT_TITLE}'\ndate: '2026-06-01'\ndraft: true\n---\nBody of the fixture draft.\n`,
    );

    const buildProcess = spawn('npx', ['astro', 'build'], {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
    await new Promise((resolve, reject) => {
      buildProcess.on('close', (code) =>
        code === 0 ? resolve() : reject(new Error(`Build failed with code ${code}`)),
      );
      buildProcess.on('error', reject);
    });
  }, 60000); // 60 second timeout for build

  afterAll(() => {
    rmSync(draftPath, { force: true });
  });

  it('generates expected content', () => {
    // Assert that the post file exists
    const postPath = join(process.cwd(), 'dist/posts/the-dispossessed/index.html');
    expect(existsSync(postPath)).toBe(true);

    // Read the post content and check for expected content
    const postContent = readFileSync(postPath, 'utf8');
    expect(postContent).toContain('The Dispossessed'); // Expected post title
    expect(postContent).toContain('data-pagefind-body'); // Pagefind marker
    expect(postContent).toContain('<article'); // Article structure

    // An optional subtitle renders under the title, not just in the meta tags.
    expect(postContent).toMatch(
      /<p class="subtitle[^"]*"[^>]*>Anarchy, State, and Utopia\. No, not that one\.<\/p>/,
    );

    // Assert the RSS feed was generated with real post entries
    const feedPath = join(process.cwd(), 'dist/rss.xml');
    expect(existsSync(feedPath)).toBe(true);

    const feedContent = readFileSync(feedPath, 'utf8');
    expect(feedContent).toContain('<rss'); // Feed root element
    expect(feedContent).toContain('https://melgart.net/posts/the-dispossessed'); // Absolute post link
    expect(feedContent).toContain('Anarchy, State, and Utopia'); // Subtitle used as description

    // A public draft is reachable at its own URL...
    const draftPagePath = join(process.cwd(), `dist/posts/${DRAFT_SLUG}/index.html`);
    expect(existsSync(draftPagePath)).toBe(true);

    const draftPage = readFileSync(draftPagePath, 'utf8');
    expect(draftPage).toContain(DRAFT_TITLE);
    expect(draftPage).toContain('Body of the fixture draft.');
    expect(draftPage).toContain('noindex'); // Kept out of search engines
    expect(draftPage).toContain('Draft.'); // Banner telling the reader what this is
    expect(draftPage).not.toContain('data-pagefind-body'); // Kept out of the search index
    expect(draftPage).not.toMatch(/<p class="subtitle/); // No empty line when frontmatter omits it

    // ...but appears in none of the places that would surface it to a reader
    // who wasn't given the link.
    const homePage = readFileSync(join(process.cwd(), 'dist/index.html'), 'utf8');
    const archivePage = readFileSync(join(process.cwd(), 'dist/posts/index.html'), 'utf8');

    expect(homePage).not.toContain(DRAFT_TITLE);
    expect(homePage).not.toContain(DRAFT_SLUG);
    expect(archivePage).not.toContain(DRAFT_TITLE);
    expect(archivePage).not.toContain(DRAFT_SLUG);
    expect(feedContent).not.toContain(DRAFT_TITLE);
    expect(feedContent).not.toContain(DRAFT_SLUG);
  });

  // Every page, image, and file a built page points at on this site must exist
  // in dist/. External links aren't checked: they break for reasons outside
  // this repo and would fail builds at random.
  it('has no broken internal links', () => {
    const broken = [];
    for (const page of listHtmlFiles(distDir)) {
      const pagePath = '/' + relative(distDir, page).replace(/index\.html$/, '');
      const pageUrl = new URL(pagePath, SITE);
      const html = readFileSync(page, 'utf8');

      for (const [, attr, value] of html.matchAll(/\s(href|src|content)="([^"]*)"/g)) {
        // content= is only a link in meta tags like og:image; those are absolute.
        if (attr === 'content' && !value.startsWith(SITE)) continue;
        if (value.startsWith('#')) continue;

        const url = new URL(value, pageUrl);
        if (url.origin !== SITE) continue;
        if (!servesFile(url.pathname)) broken.push(`${pagePath} -> ${value}`);
      }
    }
    expect(broken).toEqual([]);
  });
});
