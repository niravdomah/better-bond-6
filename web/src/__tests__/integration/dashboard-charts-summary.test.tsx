/**
 * Integration Tests: Dashboard Charts & Summary Cards
 *
 * Epic 2, Story 1
 * Tests validate FRS requirements and acceptance criteria for:
 * - Dashboard page loads data from API (AC-1, R11)
 * - Loading skeleton placeholders (AC-2, R34)
 * - Error banner with Retry button (AC-3, AC-4, R35)
 * - Total Value Ready for Payment card (AC-5, R4)
 * - Total Value of Parked Payments card (AC-6, R5)
 * - Payments Ready for Payment bar chart (AC-7, R2)
 * - Parked Payments bar chart (AC-8, R3)
 * - Parked Payments Aging Report chart (AC-9, R6)
 * - Dashboard heading (AC-11, R1)
 * - Two-column desktop / single-column mobile layout (AC-12, AC-13)
 *
 * Test design: generated-docs/test-design/epic-2-dashboard/story-1-dashboard-charts-summary-test-design.md
 */

import { vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import type { PaymentsDashboardRead } from '@/types/api-generated';

// --- Mocks ---

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

// Mock Recharts to render text-based representations instead of SVG charts
// We test user-observable behavior (labels, values), not chart internals
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) =>
    React.createElement(
      'div',
      { 'data-testid': 'responsive-container' },
      children,
    ),
  BarChart: ({
    children,
    data,
  }: {
    children: React.ReactNode;
    data: unknown[];
  }) =>
    React.createElement(
      'div',
      { 'data-testid': 'bar-chart', 'data-count': data?.length },
      children,
    ),
  Bar: ({ dataKey, name }: { dataKey: string; name?: string }) =>
    React.createElement('div', {
      'data-testid': `bar-${dataKey}`,
      'data-name': name,
    }),
  XAxis: ({ dataKey }: { dataKey: string }) =>
    React.createElement('div', { 'data-testid': `xaxis-${dataKey}` }),
  YAxis: () => React.createElement('div', { 'data-testid': 'yaxis' }),
  CartesianGrid: () => React.createElement('div', { 'data-testid': 'grid' }),
  Tooltip: () => React.createElement('div', { 'data-testid': 'tooltip' }),
  Legend: () => React.createElement('div', { 'data-testid': 'legend' }),
  Cell: () => React.createElement('div'),
}));

// Mock the API endpoint function
const mockGetDashboard = vi.fn();

vi.mock('@/lib/api/endpoints', () => ({
  getDashboard: (...args: unknown[]) => mockGetDashboard(...args),
}));

// Import the Dashboard page component after all mocks are set up
import DashboardPage from '@/app/(protected)/page';

// --- Test Data ---

/** Standard dashboard API response with realistic data */
function createMockDashboardData(
  overrides?: Partial<PaymentsDashboardRead>,
): PaymentsDashboardRead {
  return {
    PaymentStatusReport: [
      {
        Status: 'READY',
        CommissionType: 'Bond Registration Commission',
        PaymentCount: 15,
        TotalPaymentAmount: 1000000,
      },
      {
        Status: 'READY',
        CommissionType: 'Manual Payments',
        PaymentCount: 8,
        TotalPaymentAmount: 234567.89,
      },
      {
        Status: 'PARKED',
        CommissionType: 'Bond Registration Commission',
        PaymentCount: 5,
        TotalPaymentAmount: 200000,
      },
      {
        Status: 'PARKED',
        CommissionType: 'Manual Payments',
        PaymentCount: 3,
        TotalPaymentAmount: 34567.89,
      },
    ],
    ParkedPaymentsAgingReport: [
      { Range: '1-3 Days', PaymentCount: 10 },
      { Range: '4-7 Days', PaymentCount: 6 },
      { Range: '>7 Days', PaymentCount: 2 },
    ],
    TotalPaymentCountInLast14Days: 42,
    PaymentsByAgency: [
      {
        AgencyName: 'Agency A',
        PaymentCount: 10,
        TotalCommissionCount: 500000,
        Vat: 75000,
      },
    ],
    ...overrides,
  };
}

// --- Helper ---

function renderDashboard() {
  return render(<DashboardPage />);
}

// --- Tests ---

describe('Dashboard Charts & Summary Cards (Epic 2, Story 1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =========================================================================
  // AC-11: Dashboard heading (R1)
  // =========================================================================
  describe('AC-11: Dashboard heading', () => {
    it('displays a "Dashboard" heading at the top of the page', async () => {
      mockGetDashboard.mockResolvedValue(createMockDashboardData());
      renderDashboard();

      expect(
        screen.getByRole('heading', { name: /dashboard/i }),
      ).toBeInTheDocument();
    });
  });

  // =========================================================================
  // AC-1: Data loading from API (R11)
  // =========================================================================
  describe('AC-1: Dashboard loads data from API', () => {
    it('fetches data from the dashboard endpoint on page load', async () => {
      mockGetDashboard.mockResolvedValue(createMockDashboardData());
      renderDashboard();

      // After data loads, the dashboard components should be visible
      await waitFor(() => {
        expect(
          screen.getByText(/total value ready for payment/i),
        ).toBeInTheDocument();
      });
    });

    it('displays all five dashboard components after data loads', async () => {
      mockGetDashboard.mockResolvedValue(createMockDashboardData());
      renderDashboard();

      // Wait for data to load and check all five component headings are visible
      await waitFor(() => {
        // Two monetary summary cards
        expect(
          screen.getByText(/total value ready for payment/i),
        ).toBeInTheDocument();
        expect(
          screen.getByText(/total value of parked payments/i),
        ).toBeInTheDocument();
        // Two bar charts (use exact text to avoid ambiguity)
        expect(
          screen.getByText('Payments Ready for Payment'),
        ).toBeInTheDocument();
        expect(screen.getByText('Parked Payments')).toBeInTheDocument();
        // Aging report
        expect(
          screen.getByText('Parked Payments Aging Report'),
        ).toBeInTheDocument();
      });
    });
  });

  // =========================================================================
  // AC-2: Loading skeleton placeholders (R34)
  // =========================================================================
  describe('AC-2: Loading state shows skeleton placeholders', () => {
    it('shows skeleton placeholders while data is loading', async () => {
      // Keep the API call pending (never resolves)
      mockGetDashboard.mockReturnValue(new Promise(() => {}));
      renderDashboard();

      // Skeleton elements should be visible while loading
      const skeletons = screen.getAllByTestId(/skeleton/i);
      expect(skeletons.length).toBeGreaterThanOrEqual(5);
    });

    it('does not show dashboard data while loading', async () => {
      mockGetDashboard.mockReturnValue(new Promise(() => {}));
      renderDashboard();

      // Monetary values should not be visible while loading
      expect(screen.queryByText(/R\s/)).not.toBeInTheDocument();
    });
  });

  // =========================================================================
  // AC-3: Error banner on API failure (R35)
  // =========================================================================
  describe('AC-3: Error banner on API failure', () => {
    it('displays an error banner when the API call fails', async () => {
      mockGetDashboard.mockRejectedValue(new Error('Internal Server Error'));
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      // The error banner should explain something went wrong
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    it('shows a Retry button within the error banner', async () => {
      mockGetDashboard.mockRejectedValue(new Error('Internal Server Error'));
      renderDashboard();

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /retry/i }),
        ).toBeInTheDocument();
      });
    });

    it('does not show dashboard components when there is an error', async () => {
      mockGetDashboard.mockRejectedValue(new Error('Internal Server Error'));
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      // Dashboard content should not be visible
      expect(
        screen.queryByText(/total value ready for payment/i),
      ).not.toBeInTheDocument();
    });
  });

  // =========================================================================
  // AC-4: Retry re-fetches data (R35)
  // =========================================================================
  describe('AC-4: Clicking Retry re-fetches data successfully', () => {
    it('re-fetches dashboard data when Retry is clicked and displays components on success', async () => {
      const user = userEvent.setup();

      // First call fails, second succeeds
      mockGetDashboard
        .mockRejectedValueOnce(new Error('Internal Server Error'))
        .mockResolvedValueOnce(createMockDashboardData());

      renderDashboard();

      // Wait for error state
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /retry/i }),
        ).toBeInTheDocument();
      });

      // Click Retry
      await user.click(screen.getByRole('button', { name: /retry/i }));

      // Error banner should disappear and dashboard data should load
      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });

      // Dashboard components should now be visible after successful retry
      await waitFor(() => {
        expect(
          screen.getByText(/total value ready for payment/i),
        ).toBeInTheDocument();
        expect(
          screen.getByText('Payments Ready for Payment'),
        ).toBeInTheDocument();
      });
    });
  });

  // =========================================================================
  // AC-5: Total Value Ready for Payment card (R4)
  // =========================================================================
  describe('AC-5: Total Value Ready for Payment card', () => {
    it('displays the sum of READY payment amounts in South African currency format', async () => {
      const data = createMockDashboardData({
        PaymentStatusReport: [
          {
            Status: 'READY',
            CommissionType: 'Bond Registration Commission',
            PaymentCount: 15,
            TotalPaymentAmount: 1000000,
          },
          {
            Status: 'READY',
            CommissionType: 'Manual Payments',
            PaymentCount: 8,
            TotalPaymentAmount: 234567.89,
          },
          {
            Status: 'PARKED',
            CommissionType: 'Bond Registration Commission',
            PaymentCount: 5,
            TotalPaymentAmount: 200000,
          },
        ],
      });

      mockGetDashboard.mockResolvedValue(data);
      renderDashboard();

      // Sum of READY: 1000000 + 234567.89 = 1234567.89
      // Formatted as R 1 234 567,89 (en-ZA currency format)
      await waitFor(() => {
        expect(screen.getByText(/R\s*1\s*234\s*567,89/)).toBeInTheDocument();
      });
    });
  });

  // =========================================================================
  // AC-6: Total Value of Parked Payments card (R5)
  // =========================================================================
  describe('AC-6: Total Value of Parked Payments card', () => {
    it('displays the sum of PARKED payment amounts in South African currency format', async () => {
      const data = createMockDashboardData({
        PaymentStatusReport: [
          {
            Status: 'READY',
            CommissionType: 'Bond Registration Commission',
            PaymentCount: 15,
            TotalPaymentAmount: 1000000,
          },
          {
            Status: 'PARKED',
            CommissionType: 'Bond Registration Commission',
            PaymentCount: 5,
            TotalPaymentAmount: 200000,
          },
          {
            Status: 'PARKED',
            CommissionType: 'Manual Payments',
            PaymentCount: 3,
            TotalPaymentAmount: 34567.89,
          },
        ],
      });

      mockGetDashboard.mockResolvedValue(data);
      renderDashboard();

      // Sum of PARKED: 200000 + 34567.89 = 234567.89
      // Formatted as R 234 567,89
      await waitFor(() => {
        expect(screen.getByText(/R\s*234\s*567,89/)).toBeInTheDocument();
      });
    });
  });

  // =========================================================================
  // AC-7: Payments Ready for Payment bar chart (R2)
  // =========================================================================
  describe('AC-7: Payments Ready for Payment bar chart', () => {
    it('displays a chart showing READY payment counts by commission type', async () => {
      mockGetDashboard.mockResolvedValue(createMockDashboardData());
      renderDashboard();

      await waitFor(() => {
        // The chart heading should be visible
        expect(
          screen.getByText(/payments ready for payment/i),
        ).toBeInTheDocument();
      });

      // The chart should display data for "Bond Comm" and "Manual Payments"
      // Both labels appear in Ready and Parked charts, so use getAllByText
      await waitFor(() => {
        expect(screen.getAllByText(/bond comm/i).length).toBeGreaterThanOrEqual(
          1,
        );
        expect(
          screen.getAllByText(/manual payments/i).length,
        ).toBeGreaterThanOrEqual(1);
      });
    });

    it('shows the count values for each commission type in the ready chart', async () => {
      mockGetDashboard.mockResolvedValue(createMockDashboardData());
      renderDashboard();

      // The chart should show count 15 for Bond Comm and 8 for Manual Payments
      // Values appear alongside their labels (e.g., "Bond Comm: 15")
      await waitFor(() => {
        expect(screen.getByText('Bond Comm: 15')).toBeInTheDocument();
        expect(screen.getByText('Manual Payments: 8')).toBeInTheDocument();
      });
    });
  });

  // =========================================================================
  // AC-8: Parked Payments bar chart (R3)
  // =========================================================================
  describe('AC-8: Parked Payments bar chart', () => {
    it('displays a chart showing PARKED payment counts by commission type', async () => {
      mockGetDashboard.mockResolvedValue(createMockDashboardData());
      renderDashboard();

      await waitFor(() => {
        // "Parked Payments" chart heading (not the aging report)
        expect(screen.getByText(/^parked payments$/i)).toBeInTheDocument();
      });
    });

    it('shows the count values for each commission type in the parked chart', async () => {
      mockGetDashboard.mockResolvedValue(createMockDashboardData());
      renderDashboard();

      // The chart should show count 5 for Bond Comm and 3 for Manual Payments
      // Values appear alongside their labels (e.g., "Bond Comm: 5")
      await waitFor(() => {
        expect(screen.getByText('Bond Comm: 5')).toBeInTheDocument();
        expect(screen.getByText('Manual Payments: 3')).toBeInTheDocument();
      });
    });
  });

  // =========================================================================
  // AC-9: Parked Payments Aging Report chart (R6)
  // =========================================================================
  describe('AC-9: Parked Payments Aging Report chart', () => {
    it('displays a chart with aging range buckets', async () => {
      mockGetDashboard.mockResolvedValue(createMockDashboardData());
      renderDashboard();

      await waitFor(() => {
        expect(
          screen.getByText(/parked payments aging report/i),
        ).toBeInTheDocument();
      });

      // Should show the three range labels
      await waitFor(() => {
        expect(screen.getByText(/1-3 days/i)).toBeInTheDocument();
        expect(screen.getByText(/4-7 days/i)).toBeInTheDocument();
        expect(screen.getByText(/>7 days/i)).toBeInTheDocument();
      });
    });

    it('shows the payment counts for each aging bucket', async () => {
      mockGetDashboard.mockResolvedValue(createMockDashboardData());
      renderDashboard();

      // Aging report counts: 10, 6, 2 shown alongside their range labels
      await waitFor(() => {
        expect(screen.getByText('1-3 Days: 10')).toBeInTheDocument();
        expect(screen.getByText('4-7 Days: 6')).toBeInTheDocument();
        expect(screen.getByText('>7 Days: 2')).toBeInTheDocument();
      });
    });
  });

  // =========================================================================
  // Edge Cases from Test Design
  // =========================================================================
  describe('Edge cases', () => {
    it('displays R 0,00 when all payment amounts are zero', async () => {
      const data = createMockDashboardData({
        PaymentStatusReport: [
          {
            Status: 'READY',
            CommissionType: 'Bond Registration Commission',
            PaymentCount: 0,
            TotalPaymentAmount: 0,
          },
          {
            Status: 'PARKED',
            CommissionType: 'Bond Registration Commission',
            PaymentCount: 0,
            TotalPaymentAmount: 0,
          },
        ],
      });

      mockGetDashboard.mockResolvedValue(data);
      renderDashboard();

      // Both monetary cards should show R 0,00
      await waitFor(() => {
        const zeroAmounts = screen.getAllByText(/R\s*0,00/);
        expect(zeroAmounts.length).toBeGreaterThanOrEqual(2);
      });
    });

    it('handles when only one commission type exists in data', async () => {
      const data = createMockDashboardData({
        PaymentStatusReport: [
          {
            Status: 'READY',
            CommissionType: 'Bond Registration Commission',
            PaymentCount: 15,
            TotalPaymentAmount: 1000000,
          },
          {
            Status: 'PARKED',
            CommissionType: 'Bond Registration Commission',
            PaymentCount: 5,
            TotalPaymentAmount: 200000,
          },
        ],
      });

      mockGetDashboard.mockResolvedValue(data);
      renderDashboard();

      // Should still render without error and show Bond Comm
      await waitFor(() => {
        expect(screen.getAllByText(/bond comm/i).length).toBeGreaterThanOrEqual(
          1,
        );
      });
    });

    it('handles empty aging report gracefully', async () => {
      const data = createMockDashboardData({
        ParkedPaymentsAgingReport: [],
      });

      mockGetDashboard.mockResolvedValue(data);
      renderDashboard();

      // The aging report section should still render
      await waitFor(() => {
        expect(
          screen.getByText(/parked payments aging report/i),
        ).toBeInTheDocument();
      });
    });
  });

  // =========================================================================
  // AC-5 specific: Currency formatting verification
  // =========================================================================
  describe('Currency formatting (AC-5, AC-6)', () => {
    it('formats the exact amount R 1 234 567,89 for READY total when values sum to 1234567.89', async () => {
      const data = createMockDashboardData({
        PaymentStatusReport: [
          {
            Status: 'READY',
            CommissionType: 'Bond Registration Commission',
            PaymentCount: 1,
            TotalPaymentAmount: 1234567.89,
          },
        ],
      });

      mockGetDashboard.mockResolvedValue(data);
      renderDashboard();

      await waitFor(() => {
        // Should match the en-ZA currency format: R followed by space-separated thousands, comma decimal
        expect(screen.getByText(/R\s*1\s*234\s*567,89/)).toBeInTheDocument();
      });
    });
  });
});
