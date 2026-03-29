/**
 * Integration Tests: Route stub for Payment Management
 *
 * Epic 1, Story 2 — Scenario 12
 * Verifies that a placeholder page exists at /payment-management
 * with an appropriate heading.
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

import PaymentManagementPage from '@/app/(protected)/payment-management/page';

describe('Route Stubs (Epic 1, Story 2)', () => {
  describe('Payment Management page', () => {
    it('displays a "Payment Management" heading', () => {
      render(<PaymentManagementPage />);

      expect(
        screen.getByRole('heading', { name: /payment management/i }),
      ).toBeInTheDocument();
    });
  });
});
