import { describe, it, expect } from 'vitest';
import { selectPublished } from '../../src/utils/posts.js';

/**
 * Minimal stand-in for a content collection entry.
 * @param {string} id
 * @param {string} date
 * @param {boolean} [draft]
 */
const entry = (id, date, draft = false) => ({ id, data: { title: id, date, draft } });

describe('selectPublished', () => {
  it('drops drafts and keeps published posts', () => {
    const posts = [
      entry('published', '2026-01-01'),
      entry('secret', '2026-02-01', true),
    ];

    expect(selectPublished(posts).map((post) => post.id)).toEqual(['published']);
  });

  it('sorts newest first', () => {
    const posts = [
      entry('older', '2024-03-01'),
      entry('newest', '2026-05-01'),
      entry('middle', '2025-07-01'),
    ];

    expect(selectPublished(posts).map((post) => post.id)).toEqual(['newest', 'middle', 'older']);
  });

  it('treats a missing draft field as published', () => {
    const posts = [{ id: 'legacy', data: { title: 'Legacy', date: '2020-01-01' } }];

    expect(selectPublished(posts)).toHaveLength(1);
  });

  it('leaves the input array untouched', () => {
    const posts = [entry('a', '2024-01-01'), entry('b', '2026-01-01')];

    selectPublished(posts);

    expect(posts.map((post) => post.id)).toEqual(['a', 'b']);
  });
});
