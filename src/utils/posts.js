import { getCollection } from 'astro:content';

/**
 * Newest first, comparing the ISO date strings in frontmatter as timestamps.
 * @param {import('astro:content').CollectionEntry<'posts'>} a
 * @param {import('astro:content').CollectionEntry<'posts'>} b
 * @returns {number}
 */
const byDateDesc = (a, b) =>
  new Date(b.data.date).getTime() - new Date(a.data.date).getTime();

/**
 * Drops public drafts and sorts the rest newest first. Kept separate from
 * getPublishedPosts so the filtering rule can be tested without a build.
 * @param {import('astro:content').CollectionEntry<'posts'>[]} posts
 * @returns {import('astro:content').CollectionEntry<'posts'>[]}
 */
export const selectPublished = (posts) =>
  posts.filter((post) => !post.data.draft).sort(byDateDesc);

/**
 * Every published post, newest first. This is the source any page listing
 * posts should use; reach for getCollection directly only where drafts must be
 * included too, which is route generation in pages/posts/[slug].astro.
 * @returns {Promise<import('astro:content').CollectionEntry<'posts'>[]>}
 */
export const getPublishedPosts = async () => selectPublished(await getCollection('posts'));
