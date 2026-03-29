/**
 * Integration Tests: Login Page with MortgageMax Branding
 *
 * Epic 1, Story 1
 * Tests validate FRS requirements for the login page:
 * - MortgageMax branding (logo + heading)
 * - Username/Password form (not Email)
 * - Successful login redirects to Dashboard
 * - Invalid credentials show error
 * - Empty fields show validation messages
 * - Loading state on Sign In button
 * - No "Sign up" link (FRS has no self-registration)
 */

import { vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Mock next/image
vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) =>
    React.createElement('img', props),
}));

// Mock next/navigation
const mockPush = vi.fn();
const mockRefresh = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
  useSearchParams: () => mockSearchParams,
}));

// Mock the auth client signIn function
const mockSignIn = vi.fn();
vi.mock('@/lib/auth/auth-client', () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
}));

// Import the page component after mocks are set up
import SignInPage from '@/app/auth/signin/page';

describe('Login Page with MortgageMax Branding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignIn.mockReset();
  });

  describe('Branding and Layout (AC-2)', () => {
    it('displays the MortgageMax logo', () => {
      render(<SignInPage />);

      const logo = screen.getByAltText(/mortgagemax/i);
      expect(logo).toBeInTheDocument();
    });

    it('displays the "Commission Payments System" heading', () => {
      render(<SignInPage />);

      expect(
        screen.getByRole('heading', { name: /commission payments system/i }),
      ).toBeInTheDocument();
    });

    it('displays a "Username" text input field', () => {
      render(<SignInPage />);

      const usernameInput = screen.getByLabelText(/username/i);
      expect(usernameInput).toBeInTheDocument();
      expect(usernameInput).toHaveAttribute('type', 'text');
    });

    it('displays a "Password" input field', () => {
      render(<SignInPage />);

      const passwordInput = screen.getByLabelText(/password/i);
      expect(passwordInput).toBeInTheDocument();
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('displays a "Sign In" button', () => {
      render(<SignInPage />);

      expect(
        screen.getByRole('button', { name: /sign in/i }),
      ).toBeInTheDocument();
    });

    it('does not display a sign-up link', () => {
      render(<SignInPage />);

      expect(screen.queryByText(/sign up/i)).not.toBeInTheDocument();
      expect(
        screen.queryByText(/don't have an account/i),
      ).not.toBeInTheDocument();
    });
  });

  describe('Successful Login (AC-3)', () => {
    it('redirects to the Dashboard on valid credentials', async () => {
      const user = userEvent.setup();
      mockSignIn.mockResolvedValueOnce({ ok: true });

      render(<SignInPage />);

      await user.type(
        screen.getByLabelText(/username/i),
        'operator@example.com',
      );
      await user.type(screen.getByLabelText(/password/i), 'Operator123!');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('Invalid Credentials (AC-5)', () => {
    it('shows an error message when credentials are incorrect', async () => {
      const user = userEvent.setup();
      mockSignIn.mockResolvedValueOnce({
        ok: false,
        error: 'Invalid credentials',
      });

      render(<SignInPage />);

      await user.type(
        screen.getByLabelText(/username/i),
        'operator@example.com',
      );
      await user.type(screen.getByLabelText(/password/i), 'WrongPassword99');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(
          /invalid credentials/i,
        );
      });
    });

    it('keeps the user on the login page when credentials are invalid', async () => {
      const user = userEvent.setup();
      mockSignIn.mockResolvedValueOnce({
        ok: false,
        error: 'Invalid credentials',
      });

      render(<SignInPage />);

      await user.type(screen.getByLabelText(/username/i), 'nobody@example.com');
      await user.type(screen.getByLabelText(/password/i), 'SomePassword1!');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      // Should not have navigated
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('Empty Field Validation (AC-6)', () => {
    it('shows a validation message when username is empty', async () => {
      const user = userEvent.setup();

      render(<SignInPage />);

      await user.type(screen.getByLabelText(/password/i), 'Operator123!');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      // The signIn function should not have been called
      expect(mockSignIn).not.toHaveBeenCalled();

      // A validation message should be visible for the username field
      const usernameInput = screen.getByLabelText(/username/i);
      expect(usernameInput).toBeInvalid();
    });

    it('shows a validation message when password is empty', async () => {
      const user = userEvent.setup();

      render(<SignInPage />);

      await user.type(
        screen.getByLabelText(/username/i),
        'operator@example.com',
      );
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      // The signIn function should not have been called
      expect(mockSignIn).not.toHaveBeenCalled();

      // A validation message should be visible for the password field
      const passwordInput = screen.getByLabelText(/password/i);
      expect(passwordInput).toBeInvalid();
    });

    it('shows validation messages when both fields are empty', async () => {
      const user = userEvent.setup();

      render(<SignInPage />);

      await user.click(screen.getByRole('button', { name: /sign in/i }));

      // The signIn function should not have been called
      expect(mockSignIn).not.toHaveBeenCalled();
    });
  });

  describe('Loading State (AC-7)', () => {
    it('shows "Signing in..." on the button while authenticating', async () => {
      const user = userEvent.setup();

      // Create a promise that we can resolve manually to control timing
      let resolveSignIn!: (value: { ok: boolean }) => void;
      mockSignIn.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveSignIn = resolve;
          }),
      );

      render(<SignInPage />);

      await user.type(
        screen.getByLabelText(/username/i),
        'operator@example.com',
      );
      await user.type(screen.getByLabelText(/password/i), 'Operator123!');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      // Button should show loading text
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /signing in/i }),
        ).toBeInTheDocument();
      });

      // Button should be disabled during loading
      expect(
        screen.getByRole('button', { name: /signing in/i }),
      ).toBeDisabled();

      // Form fields should be disabled during loading
      expect(screen.getByLabelText(/username/i)).toBeDisabled();
      expect(screen.getByLabelText(/password/i)).toBeDisabled();

      // Resolve the sign-in to clean up
      resolveSignIn({ ok: true });
    });
  });
});
