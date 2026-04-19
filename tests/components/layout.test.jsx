import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Layout from '../../components/layout.js';

describe('Layout component', () => {
  it('renders children inside <main>', () => {
    const { container } = render(
      <Layout>
        <p>child content</p>
      </Layout>,
    );
    const main = container.querySelector('main');
    expect(main).not.toBeNull();
    expect(main.textContent).toContain('child content');
  });

  it('home mode: shows profile image, omits back-to-home link', () => {
    render(
      <Layout home>
        <p>body</p>
      </Layout>,
    );
    const img = document.querySelector('img[src="/images/profile.jpg"]');
    expect(img).not.toBeNull();
    expect(screen.queryByText(/Back to home/i)).toBeNull();
  });

  it('non-home mode: shows site title header and back-to-home link', () => {
    render(
      <Layout>
        <p>body</p>
      </Layout>,
    );
    expect(screen.getByText('melgart.net')).toBeInTheDocument();
    expect(screen.getByText(/Back to home/i)).toBeInTheDocument();
  });
});
