import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawn } from 'child_process';
import { readFileSync, writeFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';

// A public draft written into the content directory just for this run, so the
// draft rules are exercised against a real build without shipping a permanent
// half-written post. Removed again in afterAll.
const DRAFT_SLUG = 'zz-draft-fixture';
const DRAFT_TITLE = 'Fixture Draft Post';
const draftPath = join(process.cwd(), 'src/content/posts', `${DRAFT_SLUG}.md`);

describe('Build integration', () => {
  beforeAll(() => {
    writeFileSync(
      draftPath,
      `---\ntitle: '${DRAFT_TITLE}'\ndate: '2026-06-01'\ndraft: true\n---\nBody of the fixture draft.\n`
    );
  });

  afterAll(() => {
    rmSync(draftPath, { force: true });
  });

  it('builds successfully and generates expected content', async () => {
    // Spawn astro build
    const buildProcess = spawn('npx', ['astro', 'build'], {
      stdio: 'inherit',
      cwd: process.cwd(),
    });

    // Wait for build to complete
    const buildResult = await new Promise((resolve, reject) => {
      buildProcess.on('close', (code) => {
        if (code === 0) {
          resolve(code);
        } else {
          reject(new Error(`Build failed with code ${code}`));
        }
      });
      buildProcess.on('error', reject);
    });

    expect(buildResult).toBe(0);

    // Assert that the post file exists
    const postPath = join(process.cwd(), 'dist/posts/the-dispossessed/index.html');
    expect(existsSync(postPath)).toBe(true);

    // Read the post content and check for expected content
    const postContent = readFileSync(postPath, 'utf8');
    expect(postContent).toContain('The Dispossessed'); // Expected post title
    expect(postContent).toContain('data-pagefind-body'); // Pagefind marker
    expect(postContent).toContain('<article'); // Article structure

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
  }, 60000); // 60 second timeout for build
});
