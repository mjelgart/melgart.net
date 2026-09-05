import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.string(),
    subtitle: z.string().optional(),
    // Public draft: the post still builds at /posts/<slug> so the URL can be
    // shared, but it is withheld from every listing, the feed, and search.
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };
