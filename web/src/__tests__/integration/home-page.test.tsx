/**
 * Integration Tests: Home Page shows Dashboard heading
 *
 * Epic 1, Story 2 — AC-7
 * The home page should display a "Dashboard" heading,
 * replacing the template placeholder content.
 */

import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock next/image
vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) =>
    React.createElement('img', props),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next-auth/react session
vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: { user: { email: 'operator@example.com', name: 'Operator' } },
    status: 'authenticated',
  }),
  SessionProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}));

// Import the home page component after mocks
import HomePage from '@/app/(protected)/page';

describe('Home Page (Epic 1, Story 2, AC-7)', () => {
  it('displays a "Dashboard" heading', () => {
    render(<HomePage />);

    expect(
      screen.getByRole('heading', { name: /dashboard/i }),
    ).toBeInTheDocument();
  });

  it('does not display the template placeholder text', () => {
    render(<HomePage />);

    expect(
      screen.queryByText(/replace this with your feature implementation/i),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/^welcome$/i)).not.toBeInTheDocument();
  });
});
