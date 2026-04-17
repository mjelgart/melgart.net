import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import injectMetadata from '../../components/injectMetadata.js';

function renderMetadata(title, description) {
  const { container } = render(<>{injectMetadata(title, description)}</>);
  return container;
}

describe('injectMetadata', () => {
  it('renders a <title> with the given title', () => {
    const container = renderMetadata('My Title', 'A description');
    const titleEl = container.querySelector('title');
    expect(titleEl).not.toBeNull();
    expect(titleEl.textContent).toBe('My Title');
  });

  it('emits description meta tag', () => {
    const container = renderMetadata('T', 'Desc here');
    const descMeta = container.querySelector('meta[name="description"]');
    expect(descMeta).toHaveAttribute('content', 'Desc here');
  });

  it('emits Open Graph title and description', () => {
    const container = renderMetadata('OG Title', 'OG Desc');
    const ogTitle = container.querySelector('meta[property="og:title"]');
    const ogDesc = container.querySelector('meta[property="og:description"]');
    expect(ogTitle).toHaveAttribute('content', 'OG Title');
    expect(ogDesc).toHaveAttribute('content', 'OG Desc');
  });

  it('emits Twitter card meta tags', () => {
    const container = renderMetadata('TW Title', 'TW Desc');
    expect(container.querySelector('meta[name="twitter:card"]')).toHaveAttribute(
      'content',
      'summary_large_image',
    );
    expect(container.querySelector('meta[name="twitter:title"]')).toHaveAttribute(
      'content',
      'TW Title',
    );
    expect(container.querySelector('meta[name="twitter:description"]')).toHaveAttribute(
      'content',
      'TW Desc',
    );
  });
});
