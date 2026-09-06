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

// Routes we care about for per-route analysis. These mirror the real pages
// Astro emits (each as <route>/index.html), not aspirational ones.
const TRACKED_ROUTES = ['/', '/posts', '/sports', '/saved-on-hosting', '/stats'];

// Pagefind writes its search bundle into dist/pagefind/. Those files are kept
// out of the site totals and reported separately under searchAssets, because
// what matters here is what a browser actually downloads — and most of that
// directory is never requested by anyone.
const SEARCH_DIR = 'pagefind';

// The only search files fetched during a normal page load: Search.jsx injects
// these two by hand when its island hydrates.
const SEARCH_EAGER_UI = ['pagefind-ui.js', 'pagefind-ui.css'];

// Fetched once, when a visitor first uses the search box.
const SEARCH_ENGINE = ['pagefind.js', 'pagefind-worker.js', 'pagefind-entry.json'];

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
  // Astro emits each page as a directory with an index.html
  // (e.g. sports/index.html, posts/artemis/index.html). Map a file to the
  // route of the page directory that contains it.

  // Normalize separators so this works regardless of platform.
  const normalized = filePath.split(path.sep).join('/');

  // The site root.
  if (normalized === 'index.html') return '/';

  // Drop a trailing index.html to get the page directory, otherwise use the
  // file's own directory (covers non-html assets that sit beside a page).
  const dir = normalized.endsWith('/index.html')
    ? normalized.slice(0, -'/index.html'.length)
    : normalized.replace(/\/[^/]*$/, '');

  if (!dir) return '/';

  // Roll individual blog posts (posts/<slug>) up into the /posts section so
  // the blog reads as a single number rather than 15 separate routes.
  const topSegment = dir.split('/')[0];
  if (topSegment === 'posts') return '/posts';

  return `/${dir}`;
}

// Pull the /_astro/* JS and CSS bundles a page actually links to. Astro
// references hydrated-island code via component-url / renderer-url attributes
// (and modulepreload links), so a fully static page references none and stays
// tiny. Returns dist-relative paths (no leading slash) to match walked files.
function extractAstroAssetRefs(htmlContent) {
  const refs = new Set();
  const re = /\/?_astro\/[A-Za-z0-9._-]+\.(?:js|css)/g;
  let match;
  while ((match = re.exec(htmlContent)) !== null) {
    refs.add(match[0].replace(/^\//, ''));
  }
  return refs;
}

// Pagefind ships a wasm blob and a metadata file per supported language, but
// the entry manifest names only the ones built for this site's content. Anything
// it doesn't name can never be requested.
function readActiveLanguageFiles(distDir) {
  const active = new Set();
  const entryPath = path.join(distDir, SEARCH_DIR, 'pagefind-entry.json');
  if (!fs.existsSync(entryPath)) return active;

  try {
    const entry = JSON.parse(fs.readFileSync(entryPath, 'utf8'));
    for (const language of Object.values(entry.languages || {})) {
      if (language.wasm) active.add(`wasm.${language.wasm}.pagefind`);
      if (language.hash) active.add(`pagefind.${language.hash}.pf_meta`);
    }
  } catch (error) {
    console.warn('Could not parse pagefind-entry.json:', error.message);
  }

  return active;
}

// Sort a search asset by when — if ever — a browser asks for it.
function classifySearchAsset(relativePath, activeLanguageFiles) {
  if (SEARCH_EAGER_UI.includes(relativePath)) return 'onPageLoad';
  if (relativePath.startsWith('index/') || relativePath.startsWith('fragment/')) {
    return 'perQuery';
  }
  if (SEARCH_ENGINE.includes(relativePath) || activeLanguageFiles.has(relativePath)) {
    return 'onFirstQuery';
  }
  return 'neverFetched';
}

// Path of a search asset relative to dist/pagefind/, in forward slashes.
function searchAssetName(file) {
  return file.path.split(path.sep).join('/').slice(`${SEARCH_DIR}/`.length);
}

function summarizeSearchAssets(searchFiles, distDir) {
  const activeLanguageFiles = readActiveLanguageFiles(distDir);
  const tiers = {
    onPageLoad: { raw: 0, gzipped: 0, fileCount: 0 },
    onFirstQuery: { raw: 0, gzipped: 0, fileCount: 0 },
    perQuery: { raw: 0, gzipped: 0, fileCount: 0 },
    neverFetched: { raw: 0, gzipped: 0, fileCount: 0 },
  };

  for (const file of searchFiles) {
    const tier = tiers[classifySearchAsset(searchAssetName(file), activeLanguageFiles)];
    tier.raw += file.raw;
    tier.gzipped += file.gzipped;
    tier.fileCount += 1;
  }

  return tiers;
}

// Search.jsx injects the Pagefind UI at runtime, so it never appears in the
// HTML the way Astro's own bundles do. Find it the way the browser effectively
// does: a route loads the search UI if one of the bundles it pulls names it.
function routeLoadsSearchUi(refs, fileByPath) {
  for (const ref of refs) {
    const asset = fileByPath.get(ref);
    if (!asset || asset.type !== 'js') continue;
    if (fs.readFileSync(asset.fullPath, 'utf8').includes(`${SEARCH_DIR}/${SEARCH_EAGER_UI[0]}`)) {
      return true;
    }
  }
  return false;
}

function analyzeRouteAssets(files, searchFiles = []) {
  const routeAssets = {};

  // Initialize tracked routes. Per-route totals measure page code (HTML plus
  // the JS/CSS that page loads); images are reported site-wide in totalSizes.
  for (const route of TRACKED_ROUTES) {
    routeAssets[route] = {
      html: { raw: 0, gzipped: 0 },
      css: { raw: 0, gzipped: 0 },
      js: { raw: 0, gzipped: 0 },
      total: { raw: 0, gzipped: 0 },
    };
  }

  // Index every file by its dist-relative path so referenced bundles can be
  // looked up by the path that appears in the HTML.
  const fileByPath = new Map();
  for (const file of files) {
    fileByPath.set(file.path.split(path.sep).join('/'), file);
  }

  const add = (route, type, raw, gzipped) => {
    routeAssets[route][type].raw += raw;
    routeAssets[route][type].gzipped += gzipped;
    routeAssets[route].total.raw += raw;
    routeAssets[route].total.gzipped += gzipped;
  };

  // A shared bundle counts once per route even if several pages in that route
  // (e.g. multiple posts rolled into /posts) reference it.
  const countedByRoute = {};
  for (const route of TRACKED_ROUTES) countedByRoute[route] = new Set();

  for (const file of files) {
    if (file.type !== 'html') continue;
    const route = getRouteFromPath(file.path);
    if (!routeAssets[route]) continue;

    // The page's own markup.
    add(route, 'html', file.raw, file.gzipped);

    // Plus only the bundles this page actually references.
    const refs = extractAstroAssetRefs(fs.readFileSync(file.fullPath, 'utf8'));
    for (const ref of refs) {
      if (countedByRoute[route].has(ref)) continue;
      countedByRoute[route].add(ref);
      const asset = fileByPath.get(ref);
      if (!asset) continue;
      add(route, asset.type === 'css' ? 'css' : 'js', asset.raw, asset.gzipped);
    }
  }

  // Without this, a page with the search box under-reports its real download
  // weight by the whole Pagefind UI bundle.
  const eagerUi = searchFiles.filter((file) => SEARCH_EAGER_UI.includes(searchAssetName(file)));
  for (const route of TRACKED_ROUTES) {
    if (!routeLoadsSearchUi(countedByRoute[route], fileByPath)) continue;
    for (const file of eagerUi) {
      add(route, file.type === 'css' ? 'css' : 'js', file.raw, file.gzipped);
    }
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

// Leading YAML frontmatter block of a markdown file.
const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---/;

function isDraft(source) {
  const frontmatter = source.match(FRONTMATTER);
  return frontmatter ? /^draft:\s*true\s*$/m.test(frontmatter[1]) : false;
}

// Splits the content directory into published posts and public drafts. The
// reported postCount covers published posts only, matching what a reader can
// actually reach from the site.
function countPosts() {
  const postsDir = 'src/content/posts';
  if (!fs.existsSync(postsDir)) {
    console.warn(`Posts directory ${postsDir} not found`);
    return { published: 0, drafts: 0 };
  }

  const posts = fs.readdirSync(postsDir).filter(file =>
    file.endsWith('.md') || file.endsWith('.mdx')
  );

  let published = 0;
  let drafts = 0;

  for (const post of posts) {
    if (isDraft(fs.readFileSync(path.join(postsDir, post), 'utf8'))) {
      drafts += 1;
    } else {
      published += 1;
    }
  }

  return { published, drafts };
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

  // Walk the dist directory, splitting the site's own output from Pagefind's
  // search bundle so each can be measured on its own terms.
  const allFiles = walkDirectory(distDir);
  const isSearchAsset = (file) =>
    file.path.split(path.sep).join('/').startsWith(`${SEARCH_DIR}/`);
  const searchFiles = allFiles.filter(isSearchAsset);
  const files = allFiles.filter((file) => !isSearchAsset(file));

  if (searchFiles.length === 0) {
    console.warn(
      `No ${SEARCH_DIR}/ directory in dist — run pagefind before this script, ` +
      'or the search assets go unreported.'
    );
  }

  const totalsByType = getTotalSizeByType(files);
  totalsByType.inlinedCss = getInlinedCssStats(files);
  const routeAssets = analyzeRouteAssets(files, searchFiles);
  const searchAssets = summarizeSearchAssets(searchFiles, distDir);

  // Count posts
  const { published: postCount, drafts: draftCount } = countPosts();

  // Get build metadata
  const gitCommitSha = getGitCommitSha();
  const buildTimestamp = new Date().toISOString();

  // Generate statistics object
  const buildStats = {
    schemaVersion: '1.2.0',
    buildTimestamp,
    gitCommitSha,
    postCount,
    totalSizes: totalsByType,
    routeAssets,
    searchAssets,
    fileCount: files.length,
    generatedBy: 'scripts/build-stats.mjs',
  };

  // Write to src/data/build-stats.json
  const outputPath = 'src/data/build-stats.json';
  fs.writeFileSync(outputPath, JSON.stringify(buildStats, null, 2));

  console.log(`Build stats generated: ${outputPath}`);
  console.log(`Total files: ${files.length}`);
  console.log(`Total size: ${Math.round(totalsByType.total.raw / 1024)}KB raw, ${Math.round(totalsByType.total.gzipped / 1024)}KB gzipped`);
  console.log(
    `Search: ${Math.round(searchAssets.onPageLoad.gzipped / 1024)}KB gzipped on page load, ` +
    `${Math.round(searchAssets.neverFetched.raw / 1024)}KB never requested`
  );
  console.log(`Posts: ${postCount}`);
  if (draftCount > 0) {
    console.log(`Drafts: ${draftCount} (built and reachable by URL, but unlinked from the site)`);
  }
  console.log(`Git commit: ${gitCommitSha?.substring(0, 8) || 'unknown'}`);

  return buildStats;
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  generateBuildStats();
}

export { generateBuildStats };