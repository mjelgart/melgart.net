import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Date from '../../components/date.js';

describe('Date component', () => {
  it('renders a <time> element with the ISO date as dateTime attribute', () => {
    render(<Date dateString="2024-01-15" />);
    const time = screen.getByText('January 15, 2024');
    expect(time.tagName).toBe('TIME');
    expect(time).toHaveAttribute('datetime', '2024-01-15');
  });

  it('formats ISO dates in "Month D, YYYY" form', () => {
    render(<Date dateString="2023-12-01" />);
    expect(screen.getByText('December 1, 2023')).toBeInTheDocument();
  });
});
