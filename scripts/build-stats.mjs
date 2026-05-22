#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import zlib from 'zlib';

/**
 * Build statistics generator for melgart.net
 * Analyzes the dist/ directory after Astro build and generates build-stats.json
 */

// File type categories
const FILE_TYPES = {
  html: ['.html'],
  css: ['.css'],
  js: ['.js', '.mjs'],
  images: ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.avif', '.ico'],
};

// Routes we care about for per-route analysis
const TRACKED_ROUTES = ['/', '/blog', '/sports', '/search'];

function getFileType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  for (const [type, extensions] of Object.entries(FILE_TYPES)) {
    if (extensions.includes(ext)) {
      return type;
    }
  }
  return 'other';
}

function getFileSize(filePath) {
  const stats = fs.statSync(filePath);
  const content = fs.readFileSync(filePath);
  const gzippedSize = zlib.gzipSync(content).length;

  return {
    raw: stats.size,
    gzipped: gzippedSize,
  };
}

function walkDirectory(dirPath, baseDir = dirPath) {
  const files = [];

  function walk(currentDir) {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const relativePath = path.relative(baseDir, fullPath);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (stat.isFile()) {
        const type = getFileType(fullPath);
        const sizes = getFileSize(fullPath);

        files.push({
          path: relativePath,
          fullPath,
          type,
          ...sizes,
        });
      }
    }
  }

  walk(dirPath);
  return files;
}

// Astro inlines CSS into <style> tags rather than emitting .css files, so
// counting by extension reports 0 CSS bytes. Pull <style> contents out of
// each HTML file to surface the inlined CSS size as a separate informational
// field. The bytes remain counted under the html bucket — this is a subset.
function getInlinedCssStats(files) {
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let rawConcat = '';

  for (const file of files) {
    if (file.type !== 'html') continue;
    const content = fs.readFileSync(file.fullPath, 'utf8');
    let match;
    while ((match = styleRegex.exec(content)) !== null) {
      rawConcat += match[1];
    }
  }

  const raw = Buffer.byteLength(rawConcat, 'utf8');
  const gzipped = raw === 0 ? 0 : zlib.gzipSync(rawConcat).length;
  return { raw, gzipped };
}

function getRouteFromPath(filePath) {
  // Simple heuristic to map file paths to routes
  // This may need refinement based on actual Astro output structure

  if (filePath === 'index.html') return '/';
  if (filePath.startsWith('blog/')) return '/blog';
  if (filePath.startsWith('sports/')) return '/sports';
  if (filePath.startsWith('search/') || filePath.includes('search')) return '/search';

  // Extract route from path
  const withoutExt = filePath.replace(/\.[^/.]+$/, '');
  const route = withoutExt === 'index' ? '/' : `/${withoutExt}`;

  return route;
}

function analyzeRouteAssets(files) {
  const routeAssets = {};

  // Initialize tracked routes
  for (const route of TRACKED_ROUTES) {
    routeAssets[route] = {
      html: { raw: 0, gzipped: 0 },
      css: { raw: 0, gzipped: 0 },
      js: { raw: 0, gzipped: 0 },
      images: { raw: 0, gzipped: 0 },
      total: { raw: 0, gzipped: 0 },
    };
  }

  const addToRoute = (route, file) => {
    const typeStats = routeAssets[route][file.type] || { raw: 0, gzipped: 0 };
    typeStats.raw += file.raw;
    typeStats.gzipped += file.gzipped;
    routeAssets[route].total.raw += file.raw;
    routeAssets[route].total.gzipped += file.gzipped;
  };

  for (const file of files) {
    // Files under _astro/ are shared bundles (Astro runtime, hydrated islands)
    // that a browser may load on any page. Attribute them to every tracked
    // route so per-route totals reflect what's actually downloaded.
    if (file.path.startsWith('_astro/') || file.path.startsWith('_astro' + path.sep)) {
      for (const route of TRACKED_ROUTES) addToRoute(route, file);
      continue;
    }

    const route = getRouteFromPath(file.path);
    if (routeAssets[route]) addToRoute(route, file);
  }

  return routeAssets;
}

function getTotalSizeByType(files) {
  const totals = {
    html: { raw: 0, gzipped: 0 },
    css: { raw: 0, gzipped: 0 },
    js: { raw: 0, gzipped: 0 },
    images: { raw: 0, gzipped: 0 },
    other: { raw: 0, gzipped: 0 },
    total: { raw: 0, gzipped: 0 },
  };

  for (const file of files) {
    totals[file.type].raw += file.raw;
    totals[file.type].gzipped += file.gzipped;
    totals.total.raw += file.raw;
    totals.total.gzipped += file.gzipped;
  }

  return totals;
}

function countPosts() {
  const postsDir = 'src/content/posts';
  if (!fs.existsSync(postsDir)) {
    console.warn(`Posts directory ${postsDir} not found`);
    return 0;
  }

  const posts = fs.readdirSync(postsDir).filter(file =>
    file.endsWith('.md') || file.endsWith('.mdx')
  );

  return posts.length;
}

function getGitCommitSha() {
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  } catch (error) {
    console.warn('Could not get git commit SHA:', error.message);
    return null;
  }
}

function generateBuildStats() {
  const distDir = 'dist';

  if (!fs.existsSync(distDir)) {
    console.error('dist/ directory not found. Run astro build first.');
    process.exit(1);
  }

  console.log('Analyzing build output...');

  // Walk the dist directory and analyze files
  const files = walkDirectory(distDir);
  const totalsByType = getTotalSizeByType(files);
  totalsByType.inlinedCss = getInlinedCssStats(files);
  const routeAssets = analyzeRouteAssets(files);

  // Count posts
  const postCount = countPosts();

  // Get build metadata
  const gitCommitSha = getGitCommitSha();
  const buildTimestamp = new Date().toISOString();

  // Generate statistics object
  const buildStats = {
    schemaVersion: '1.0.0',
    buildTimestamp,
    gitCommitSha,
    postCount,
    totalSizes: totalsByType,
    routeAssets,
    fileCount: files.length,
    generatedBy: 'scripts/build-stats.mjs',
  };

  // Write to src/data/build-stats.json
  const outputPath = 'src/data/build-stats.json';
  fs.writeFileSync(outputPath, JSON.stringify(buildStats, null, 2));

  console.log(`Build stats generated: ${outputPath}`);
  console.log(`Total files: ${files.length}`);
  console.log(`Total size: ${Math.round(totalsByType.total.raw / 1024)}KB raw, ${Math.round(totalsByType.total.gzipped / 1024)}KB gzipped`);
  console.log(`Posts: ${postCount}`);
  console.log(`Git commit: ${gitCommitSha?.substring(0, 8) || 'unknown'}`);

  return buildStats;
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  generateBuildStats();
}

export { generateBuildStats };