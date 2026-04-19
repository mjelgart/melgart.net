import { describe, it, expect } from 'vitest';
import path from 'path';
import { getSortedPostsData, getAllPostIds, getPostData } from '../../utils/posts.js';

const fixturesDir = path.join(process.cwd(), 'tests', 'fixtures', 'posts');

describe('getSortedPostsData', () => {
  it('returns posts sorted by date descending', () => {
    const posts = getSortedPostsData(fixturesDir);
    const dates = posts.map((p) => p.date);
    const sorted = [...dates].sort().reverse();
    expect(dates).toEqual(sorted);
    expect(posts[0].id).toBe('beta-gfm');
    expect(posts[posts.length - 1].id).toBe('gamma-older');
  });

  it('includes id (filename minus .md) and frontmatter fields', () => {
    const posts = getSortedPostsData(fixturesDir);
    const alpha = posts.find((p) => p.id === 'alpha-post');
    expect(alpha).toBeDefined();
    expect(alpha.title).toBe('Alpha Post');
    expect(alpha.description).toBe('A straightforward post with standard frontmatter.');
  });

  it('returns exactly the fixture posts', () => {
    const posts = getSortedPostsData(fixturesDir);
    expect(posts).toHaveLength(3);
  });
});

describe('getAllPostIds', () => {
  it('returns [{ params: { id } }] shape with .md stripped', () => {
    const ids = getAllPostIds(fixturesDir);
    expect(ids).toHaveLength(3);
    for (const entry of ids) {
      expect(entry).toHaveProperty('params.id');
      expect(entry.params.id).not.toMatch(/\.md$/);
    }
    const idValues = ids.map((e) => e.params.id).sort();
    expect(idValues).toEqual(['alpha-post', 'beta-gfm', 'gamma-older']);
  });
});

describe('getPostData', () => {
  it('returns id, contentHtml, and frontmatter', async () => {
    const post = await getPostData('alpha-post', fixturesDir);
    expect(post.id).toBe('alpha-post');
    expect(post.title).toBe('Alpha Post');
    expect(post.date).toBe('2024-06-15');
    expect(typeof post.contentHtml).toBe('string');
  });

  it('converts markdown headings to HTML', async () => {
    const post = await getPostData('alpha-post', fixturesDir);
    expect(post.contentHtml).toContain('<h1>Hello world</h1>');
    expect(post.contentHtml).toContain('<strong>bold</strong>');
  });

  it('renders GFM tables (remark-gfm is wired)', async () => {
    const post = await getPostData('beta-gfm', fixturesDir);
    expect(post.contentHtml).toContain('<table>');
    expect(post.contentHtml).toContain('<del>struck out</del>');
  });
});
