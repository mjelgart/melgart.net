import { describe, it, expect } from 'vitest';
import { spawn } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

describe('Build integration', () => {
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
  }, 60000); // 60 second timeout for build
});