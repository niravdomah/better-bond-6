/**
 * Integration Tests: Route stub for Payment Management
 *
 * Epic 1, Story 2 — Scenario 12
 * Verifies that a page exists at /payment-management
 * with an appropriate heading when an agency is provided.
 */

import { vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

// Mock next/image
vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) =>
    React.createElement('img', props),
}));

// Mock next/navigation with agency param
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => '/payment-management',
  useSearchParams: () => new URLSearchParams('agency=Test Agency'),
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

// Mock API endpoints
vi.mock('@/lib/api/endpoints', () => ({
  getPayments: vi.fn().mockResolvedValue({ PaymentList: [] }),
  parkPayments: vi.fn(),
  unparkPayments: vi.fn(),
}));

import PaymentManagementPage from '@/app/(protected)/payment-management/page';

describe('Route Stubs (Epic 1, Story 2)', () => {
  describe('Payment Management page', () => {
    it('displays a "Payment Management" heading', async () => {
      render(<PaymentManagementPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /payment management/i }),
        ).toBeInTheDocument();
      });
    });
  });
});
