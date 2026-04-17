import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
import React from 'react';

vi.mock('next/head', () => ({
  default: ({ children }) => children,
}));

vi.mock('next/image', () => ({
  default: ({ src, alt, priority: _priority, ...rest }) =>
    React.createElement('img', { src, alt, ...rest }),
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }) =>
    React.createElement('a', { href, ...rest }, children),
}));
