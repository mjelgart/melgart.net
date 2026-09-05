import rss from '@astrojs/rss';
import { getPublishedPosts } from '../utils/posts.js';

// Roughly one line of text in a feed reader's post list
const EXCERPT_LENGTH = 200;

/**
 * Plain-text summary for a feed item: the post's subtitle when it has one,
 * otherwise a truncated first paragraph of the body.
 * @param {import('astro:content').CollectionEntry<'posts'>} post
 * @returns {string}
 */
const summarize = (post) => {
  if (post.data.subtitle) return post.data.subtitle;

  // Paragraphs are blank-line separated; skip headings and images
  const firstParagraph = post.body
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .find((block) => block && !block.startsWith('#') && !block.startsWith('!'));

  if (!firstParagraph) return '';

  const text = firstParagraph
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // links become their label
    .replace(/[*_`>]/g, '') // emphasis, code, and quote markers
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length <= EXCERPT_LENGTH) return text;

  // Trim back to a word boundary so the excerpt doesn't cut mid-word
  const boundary = text.lastIndexOf(' ', EXCERPT_LENGTH);
  return `${text.slice(0, boundary > 0 ? boundary : EXCERPT_LENGTH)}…`;
};

export async function GET(context) {
  const sortedPosts = await getPublishedPosts();

  return rss({
    title: 'Michael Elgart',
    description: "Michael's blog.",
    site: context.site,
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      pubDate: new Date(post.data.date),
      description: summarize(post),
      link: `/posts/${post.id}`,
    })),
    // atom:link rel="self" is what feed validators look for to identify the
    // feed's own canonical URL
    xmlns: { atom: 'http://www.w3.org/2005/Atom' },
    customData: [
      '<language>en-us</language>',
      `<atom:link href="${new URL('rss.xml', context.site)}" rel="self" type="application/rss+xml" />`,
    ].join(''),
  });
}
