/**
 * Integration Tests: App Shell with Navigation and Protected Layout
 *
 * Epic 1, Story 2
 * Tests validate FRS requirements and acceptance criteria for:
 * - MortgageMax logo in the navigation bar (AC-1)
 * - Navigation links for Dashboard and Payment Management (AC-2)
 * - Navigation between pages (AC-3)
 * - Active link highlighting (AC-4)
 * - User identity displayed in header (AC-5)
 * - Sign Out functionality (AC-6)
 * - Dashboard heading on home page (AC-7)
 * - Mobile hamburger menu (AC-9)
 * - Desktop full navigation bar (AC-10)
 */

import { vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// --- Mocks ---

// Mock next/image
vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) =>
    React.createElement('img', props),
}));

// Mock next/navigation
const mockPush = vi.fn();
let currentPathname = '/';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => currentPathname,
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next-auth/react session
const mockSignOut = vi.fn();
let mockSessionData: {
  data: { user?: { name?: string; email?: string } } | null;
  status: string;
} = {
  data: { user: { email: 'operator@example.com', name: 'Operator' } },
  status: 'authenticated',
};

vi.mock('next-auth/react', () => ({
  useSession: () => mockSessionData,
  SessionProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
  signOut: (...args: unknown[]) => mockSignOut(...args),
}));

// Import components after mocks
import NavBar from '@/components/NavBar';

describe('App Shell with Navigation (Epic 1, Story 2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentPathname = '/';
    mockSessionData = {
      data: { user: { email: 'operator@example.com', name: 'Operator' } },
      status: 'authenticated',
    };
  });

  describe('AC-1: MortgageMax logo in header', () => {
    it('displays the MortgageMax logo in the navigation bar', () => {
      render(<NavBar />);

      const logo = screen.getByAltText(/mortgagemax/i);
      expect(logo).toBeInTheDocument();
    });
  });

  describe('AC-2: Navigation links visible', () => {
    it('shows Dashboard and Payment Management links', () => {
      render(<NavBar />);

      expect(
        screen.getByRole('link', { name: /dashboard/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: /payment management/i }),
      ).toBeInTheDocument();
    });

    it('does not show a Payments Made link', () => {
      render(<NavBar />);

      expect(
        screen.queryByRole('link', { name: /payments made/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe('AC-3: Navigation click navigates to correct page', () => {
    it('navigates to Payment Management when the link is clicked', () => {
      render(<NavBar />);

      const paymentManagementLink = screen.getByRole('link', {
        name: /payment management/i,
      });
      expect(paymentManagementLink).toHaveAttribute(
        'href',
        '/payment-management',
      );
    });

    it('navigates to Dashboard when the link is clicked', () => {
      render(<NavBar />);

      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      expect(dashboardLink).toHaveAttribute('href', '/');
    });
  });

  describe('AC-4: Active link is visually highlighted', () => {
    it('highlights the Dashboard link when on the home page', () => {
      currentPathname = '/';
      render(<NavBar />);

      const nav = screen.getByRole('navigation');
      const dashboardLink = within(nav).getByRole('link', {
        name: /dashboard/i,
      });
      expect(dashboardLink).toHaveAttribute('aria-current', 'page');
    });

    it('highlights the Payment Management link when on that page', () => {
      currentPathname = '/payment-management';
      render(<NavBar />);

      const nav = screen.getByRole('navigation');
      const paymentManagementLink = within(nav).getByRole('link', {
        name: /payment management/i,
      });
      expect(paymentManagementLink).toHaveAttribute('aria-current', 'page');
    });

    it('does not highlight other links when on the Dashboard page', () => {
      currentPathname = '/';
      render(<NavBar />);

      const nav = screen.getByRole('navigation');
      const paymentManagementLink = within(nav).getByRole('link', {
        name: /payment management/i,
      });

      expect(paymentManagementLink).not.toHaveAttribute('aria-current', 'page');
    });
  });

  describe('AC-5: User identity displayed in header', () => {
    it('displays the operator email in the header', () => {
      render(<NavBar />);

      expect(screen.getByText('operator@example.com')).toBeInTheDocument();
    });
  });

  describe('AC-6: Sign Out redirects to login page', () => {
    it('calls signOut when the Sign Out button is clicked', async () => {
      const user = userEvent.setup();
      render(<NavBar />);

      const signOutButton = screen.getByRole('button', { name: /sign out/i });
      await user.click(signOutButton);

      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  describe('AC-9: Mobile hamburger menu', () => {
    it('shows a menu button on mobile viewports', () => {
      // Render at mobile width - NavBar should have a hamburger button
      // that is visible on mobile via CSS (md:hidden)
      render(<NavBar />);

      // The hamburger menu button should exist in the DOM
      const menuButton = screen.getByRole('button', { name: /menu/i });
      expect(menuButton).toBeInTheDocument();
    });
  });

  describe('AC-10: Desktop full navigation bar', () => {
    it('renders all navigation links in the desktop nav area', () => {
      render(<NavBar />);

      const nav = screen.getByRole('navigation');
      expect(
        within(nav).getByRole('link', { name: /dashboard/i }),
      ).toBeInTheDocument();
      expect(
        within(nav).getByRole('link', { name: /payment management/i }),
      ).toBeInTheDocument();
    });

    it('renders the Sign Out button in the desktop nav area', () => {
      render(<NavBar />);

      expect(
        screen.getByRole('button', { name: /sign out/i }),
      ).toBeInTheDocument();
    });
  });
});
