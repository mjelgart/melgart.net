import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Search from '../../src/components/Search.jsx';

describe('Search component', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a disabled placeholder input on initial mount', () => {
    render(<Search />);
    const inputs = document.querySelectorAll('input[type="text"]');
    expect(inputs.length).toBeGreaterThan(0);
    expect(inputs[0]).toBeDisabled();
    expect(inputs[0]).toHaveAttribute('placeholder', 'Search blog posts...');
  });

  it('shows "Loading search..." text before Pagefind fails/loads', () => {
    render(<Search />);
    expect(screen.getByText('Loading search...')).toBeInTheDocument();
  });

  it('shows production-only error when Pagefind script fails to load', async () => {
    // jsdom does not actually fetch external scripts, so we simulate onerror
    // to exercise the dev-mode fallback path in Search.js.
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag, ...rest) => {
      const el = originalCreateElement(tag, ...rest);
      if (tag === 'script') {
        queueMicrotask(() => {
          el.onerror && el.onerror(new Event('error'));
        });
      }
      return el;
    });

    render(<Search />);
    await waitFor(
      () => {
        expect(
          screen.getByText(/Search functionality is available only in production builds/i),
        ).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });
});
