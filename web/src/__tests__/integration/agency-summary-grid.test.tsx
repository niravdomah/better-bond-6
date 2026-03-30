/**
 * Integration Tests: Agency Summary Grid with Selection and Navigation
 *
 * Epic 2, Story 2
 * Tests validate FRS requirements and acceptance criteria for:
 * - AC-1: Agency Summary table with correct columns (R8)
 * - AC-2: Currency formatting in South African format (R8)
 * - AC-3: Number of Payments shows READY count (BR6)
 * - AC-4: Default state shows aggregate data (R10)
 * - AC-5: Clicking a row highlights it (R10)
 * - AC-6: Dashboard components filter to selected agency (R10, BR7)
 * - AC-7: Deselecting clears filter and returns to aggregate (R10, BR7)
 * - AC-8: Selected agency indicator visible (R10)
 * - AC-9: "Go" button visible in each row (R9)
 * - AC-10: "Go" navigates to correct URL (R9)
 * - AC-11: Empty state when no agencies (R8)
 *
 * Test design: generated-docs/test-design/epic-2-dashboard/story-2-agency-summary-grid-test-design.md
 */

import { vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
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
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
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

/** Two-agency dashboard response for most tests */
function createTwoAgencyDashboardData(
  overrides?: Partial<PaymentsDashboardRead>,
): PaymentsDashboardRead {
  return {
    PaymentStatusReport: [
      {
        Status: 'READY',
        CommissionType: 'Bond Registration Commission',
        PaymentCount: 15,
        TotalPaymentAmount: 500000,
        AgencyName: 'ABC Properties',
      },
      {
        Status: 'READY',
        CommissionType: 'Manual Payments',
        PaymentCount: 8,
        TotalPaymentAmount: 300000,
        AgencyName: 'ABC Properties',
      },
      {
        Status: 'READY',
        CommissionType: 'Bond Registration Commission',
        PaymentCount: 10,
        TotalPaymentAmount: 300000,
        AgencyName: 'XYZ Realty',
      },
      {
        Status: 'PARKED',
        CommissionType: 'Bond Registration Commission',
        PaymentCount: 5,
        TotalPaymentAmount: 200000,
        AgencyName: 'ABC Properties',
      },
      {
        Status: 'PARKED',
        CommissionType: 'Manual Payments',
        PaymentCount: 3,
        TotalPaymentAmount: 50000,
        AgencyName: 'ABC Properties',
      },
      {
        Status: 'PARKED',
        CommissionType: 'Manual Payments',
        PaymentCount: 2,
        TotalPaymentAmount: 30000,
        AgencyName: 'XYZ Realty',
      },
    ],
    ParkedPaymentsAgingReport: [
      { Range: '1-3 Days', PaymentCount: 10, AgencyName: 'ABC Properties' },
      { Range: '1-3 Days', PaymentCount: 5, AgencyName: 'XYZ Realty' },
      { Range: '4-7 Days', PaymentCount: 3, AgencyName: 'ABC Properties' },
    ],
    TotalPaymentCountInLast14Days: 42,
    PaymentsByAgency: [
      {
        AgencyName: 'ABC Properties',
        PaymentCount: 12,
        TotalCommissionCount: 123456.0,
        Vat: 18518.4,
      },
      {
        AgencyName: 'XYZ Realty',
        PaymentCount: 8,
        TotalCommissionCount: 89012.0,
        Vat: 13351.8,
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

describe('Agency Summary Grid (Epic 2, Story 2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================================================
  // AC-1: Agency Summary table with correct columns (R8)
  // Test Design Scenario 1
  // ===========================================================================
  describe('AC-1: Agency Summary table displays with correct columns and data', () => {
    it('displays an "Agency Summary" heading above the table', async () => {
      mockGetDashboard.mockResolvedValue(createTwoAgencyDashboardData());
      renderDashboard();

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /agency summary/i }),
        ).toBeInTheDocument();
      });
    });

    it('displays table column headers: Agency Name, Number of Payments, Total Commission Amount, VAT', async () => {
      mockGetDashboard.mockResolvedValue(createTwoAgencyDashboardData());
      renderDashboard();

      await waitFor(() => {
        expect(
          screen.getByRole('columnheader', { name: /agency name/i }),
        ).toBeInTheDocument();
      });

      expect(
        screen.getByRole('columnheader', { name: /number of payments/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('columnheader', { name: /total commission amount/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('columnheader', { name: /vat/i }),
      ).toBeInTheDocument();
    });

    it('displays agency rows with correct data from PaymentsByAgency', async () => {
      mockGetDashboard.mockResolvedValue(createTwoAgencyDashboardData());
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('ABC Properties')).toBeInTheDocument();
      });

      expect(screen.getByText('XYZ Realty')).toBeInTheDocument();
      // Payment counts
      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
    });

    it('displays a "Go" button in each agency row', async () => {
      mockGetDashboard.mockResolvedValue(createTwoAgencyDashboardData());
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('ABC Properties')).toBeInTheDocument();
      });

      // There should be a "Go" button for each agency
      const goButtons = screen.getAllByRole('button', { name: /go/i });
      expect(goButtons).toHaveLength(2);
    });
  });

  // ===========================================================================
  // AC-2: Currency formatting (South African format)
  // Test Design Scenarios 1 & 2
  // ===========================================================================
  describe('AC-2: Currency formatting in South African format', () => {
    it('formats Total Commission Amount and VAT in South African currency (R with space-separated thousands, comma decimal)', async () => {
      mockGetDashboard.mockResolvedValue(createTwoAgencyDashboardData());
      renderDashboard();

      // ABC Properties: TotalCommissionCount=123456.00, Vat=18518.40
      // Expect: R 123 456,00 and R 18 518,40
      await waitFor(() => {
        expect(screen.getByText(/R\s*123\s*456,00/)).toBeInTheDocument();
      });
      expect(screen.getByText(/R\s*18\s*518,40/)).toBeInTheDocument();

      // XYZ Realty: TotalCommissionCount=89012.00, Vat=13351.80
      // Expect: R 89 012,00 and R 13 351,80
      expect(screen.getByText(/R\s*89\s*012,00/)).toBeInTheDocument();
      expect(screen.getByText(/R\s*13\s*351,80/)).toBeInTheDocument();
    });

    it('formats large currency values correctly', async () => {
      mockGetDashboard.mockResolvedValue(
        createTwoAgencyDashboardData({
          PaymentsByAgency: [
            {
              AgencyName: 'Test Agency',
              PaymentCount: 5,
              TotalCommissionCount: 1234567.89,
              Vat: 185185.18,
            },
          ],
        }),
      );
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText(/R\s*1\s*234\s*567,89/)).toBeInTheDocument();
      });
      expect(screen.getByText(/R\s*185\s*185,18/)).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // AC-3: Number of Payments shows READY count (BR6)
  // Test Design Scenario 1
  // ===========================================================================
  describe('AC-3: Number of Payments shows READY payment count', () => {
    it('displays the PaymentCount value from the API for each agency', async () => {
      mockGetDashboard.mockResolvedValue(createTwoAgencyDashboardData());
      renderDashboard();

      // ABC Properties has PaymentCount=12, XYZ Realty has PaymentCount=8
      // These represent READY counts per the API contract (BR6)
      await waitFor(() => {
        expect(screen.getByText('ABC Properties')).toBeInTheDocument();
      });

      // Find the rows and verify payment counts are in the correct context
      const abcRow = screen.getByText('ABC Properties').closest('tr');
      expect(abcRow).toBeTruthy();
      expect(within(abcRow!).getByText('12')).toBeInTheDocument();

      const xyzRow = screen.getByText('XYZ Realty').closest('tr');
      expect(xyzRow).toBeTruthy();
      expect(within(xyzRow!).getByText('8')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // AC-4: Default state shows aggregate data (R10)
  // Test Design Scenario 4
  // ===========================================================================
  describe('AC-4: Default state shows aggregate data across all agencies', () => {
    it('shows no agency row highlighted when no agency is selected', async () => {
      mockGetDashboard.mockResolvedValue(createTwoAgencyDashboardData());
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('ABC Properties')).toBeInTheDocument();
      });

      // No row should have aria-selected=true
      const rows = screen.getAllByRole('row');
      rows.forEach((row) => {
        expect(row).not.toHaveAttribute('aria-selected', 'true');
      });
    });

    it('does not show a "Selected agency" indicator when no agency is selected', async () => {
      mockGetDashboard.mockResolvedValue(createTwoAgencyDashboardData());
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('ABC Properties')).toBeInTheDocument();
      });

      expect(screen.queryByText(/selected agency/i)).not.toBeInTheDocument();
    });

    it('shows aggregate dashboard values across all agencies in default state', async () => {
      mockGetDashboard.mockResolvedValue(createTwoAgencyDashboardData());
      renderDashboard();

      // Aggregate READY total: 500000 + 300000 + 300000 = 1100000
      // Formatted as R 1 100 000,00
      await waitFor(() => {
        expect(screen.getByText(/R\s*1\s*100\s*000,00/)).toBeInTheDocument();
      });

      // Aggregate PARKED total: 200000 + 50000 + 30000 = 280000
      // Formatted as R 280 000,00
      expect(screen.getByText(/R\s*280\s*000,00/)).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // AC-5: Clicking a row highlights it (R10)
  // Test Design Scenario 3
  // ===========================================================================
  describe('AC-5: Clicking an agency row highlights it as selected', () => {
    it('highlights the clicked agency row', async () => {
      const user = userEvent.setup();
      mockGetDashboard.mockResolvedValue(createTwoAgencyDashboardData());
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('ABC Properties')).toBeInTheDocument();
      });

      // Click ABC Properties row
      await user.click(screen.getByText('ABC Properties'));

      // The row should be visually marked as selected
      const abcRow = screen.getByText('ABC Properties').closest('tr');
      expect(abcRow).toHaveAttribute('aria-selected', 'true');
    });
  });

  // ===========================================================================
  // AC-6: Dashboard components filter to selected agency (R10, BR7)
  // Test Design Scenarios 3, 8, 9, 10
  // ===========================================================================
  describe('AC-6: Selecting an agency filters dashboard components', () => {
    it('filters value cards to show only the selected agency data', async () => {
      const user = userEvent.setup();
      mockGetDashboard.mockResolvedValue(createTwoAgencyDashboardData());
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('ABC Properties')).toBeInTheDocument();
      });

      // Click ABC Properties
      await user.click(screen.getByText('ABC Properties'));

      // ABC Properties READY: 500000 + 300000 = 800000 → R 800 000,00
      await waitFor(() => {
        expect(screen.getByText(/R\s*800\s*000,00/)).toBeInTheDocument();
      });

      // ABC Properties PARKED: 200000 + 50000 = 250000 → R 250 000,00
      expect(screen.getByText(/R\s*250\s*000,00/)).toBeInTheDocument();
    });

    it('filters bar charts to show only the selected agency payment counts', async () => {
      const user = userEvent.setup();
      mockGetDashboard.mockResolvedValue(createTwoAgencyDashboardData());
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('ABC Properties')).toBeInTheDocument();
      });

      await user.click(screen.getByText('ABC Properties'));

      // ABC Properties READY chart: Bond Comm: 15, Manual Payments: 8
      await waitFor(() => {
        expect(screen.getByText('Bond Comm: 15')).toBeInTheDocument();
        expect(screen.getByText('Manual Payments: 8')).toBeInTheDocument();
      });

      // ABC Properties PARKED chart: Bond Comm: 5, Manual Payments: 3
      expect(screen.getByText('Bond Comm: 5')).toBeInTheDocument();
      expect(screen.getByText('Manual Payments: 3')).toBeInTheDocument();
    });

    it('filters aging report to show only the selected agency data', async () => {
      const user = userEvent.setup();
      mockGetDashboard.mockResolvedValue(createTwoAgencyDashboardData());
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('ABC Properties')).toBeInTheDocument();
      });

      await user.click(screen.getByText('ABC Properties'));

      // ABC Properties aging: 1-3 Days: 10, 4-7 Days: 3
      await waitFor(() => {
        expect(screen.getByText('1-3 Days: 10')).toBeInTheDocument();
        expect(screen.getByText('4-7 Days: 3')).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // AC-7: Deselecting clears filter and returns to aggregate (R10, BR7)
  // Test Design Scenario 5
  // ===========================================================================
  describe('AC-7: Deselecting an agency returns to aggregate view', () => {
    it('clears selection and returns to aggregate data when clicking the selected row again', async () => {
      const user = userEvent.setup();
      mockGetDashboard.mockResolvedValue(createTwoAgencyDashboardData());
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('ABC Properties')).toBeInTheDocument();
      });

      // Select ABC Properties
      await user.click(screen.getByText('ABC Properties'));
      await waitFor(() => {
        const abcRow = screen.getByText('ABC Properties').closest('tr');
        expect(abcRow).toHaveAttribute('aria-selected', 'true');
      });

      // Click again to deselect
      await user.click(screen.getByText('ABC Properties'));

      // Selection should be cleared
      await waitFor(() => {
        const abcRow = screen.getByText('ABC Properties').closest('tr');
        expect(abcRow).not.toHaveAttribute('aria-selected', 'true');
      });

      // Selected agency indicator should be gone
      expect(screen.queryByText(/selected agency/i)).not.toBeInTheDocument();

      // Dashboard should return to aggregate values
      // Aggregate READY total: 1100000 → R 1 100 000,00
      await waitFor(() => {
        expect(screen.getByText(/R\s*1\s*100\s*000,00/)).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // AC-8: Selected agency indicator visible (R10)
  // Test Design Scenario 3
  // ===========================================================================
  describe('AC-8: Selected agency indicator', () => {
    it('shows the selected agency name in the page heading area when an agency is selected', async () => {
      const user = userEvent.setup();
      mockGetDashboard.mockResolvedValue(createTwoAgencyDashboardData());
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('ABC Properties')).toBeInTheDocument();
      });

      await user.click(screen.getByText('ABC Properties'));

      await waitFor(() => {
        expect(
          screen.getByText(/selected agency.*ABC Properties/i),
        ).toBeInTheDocument();
      });
    });

    it('updates the indicator when selecting a different agency', async () => {
      const user = userEvent.setup();
      mockGetDashboard.mockResolvedValue(createTwoAgencyDashboardData());
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('ABC Properties')).toBeInTheDocument();
      });

      // Select ABC Properties
      await user.click(screen.getByText('ABC Properties'));
      await waitFor(() => {
        expect(
          screen.getByText(/selected agency.*ABC Properties/i),
        ).toBeInTheDocument();
      });

      // Switch to XYZ Realty
      await user.click(screen.getByText('XYZ Realty'));
      await waitFor(() => {
        expect(
          screen.getByText(/selected agency.*XYZ Realty/i),
        ).toBeInTheDocument();
      });

      // ABC Properties should no longer be in the indicator
      expect(
        screen.queryByText(/selected agency.*ABC Properties/i),
      ).not.toBeInTheDocument();
    });
  });

  // ===========================================================================
  // AC-9: "Go" button visible in each row (R9)
  // Test Design Scenario 1
  // ===========================================================================
  describe('AC-9: "Go" button in each agency row', () => {
    it('shows a "Go" button for each agency row', async () => {
      mockGetDashboard.mockResolvedValue(createTwoAgencyDashboardData());
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('ABC Properties')).toBeInTheDocument();
      });

      const goButtons = screen.getAllByRole('button', { name: /go/i });
      expect(goButtons).toHaveLength(2);
    });
  });

  // ===========================================================================
  // AC-10: "Go" navigates to correct URL (R9)
  // Test Design Scenarios 6, Edge 2
  // ===========================================================================
  describe('AC-10: "Go" button navigates to Payment Management', () => {
    it('shows a confirmation dialog when "Go" is clicked', async () => {
      const user = userEvent.setup();
      mockGetDashboard.mockResolvedValue(createTwoAgencyDashboardData());
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('ABC Properties')).toBeInTheDocument();
      });

      // Find the Go button in the ABC Properties row
      const abcRow = screen.getByText('ABC Properties').closest('tr');
      const goButton = within(abcRow!).getByRole('button', { name: /go/i });
      await user.click(goButton);

      // Dialog should appear with agency name
      await waitFor(() => {
        expect(
          screen.getByText(
            /navigate to payment management for ABC Properties/i,
          ),
        ).toBeInTheDocument();
      });

      // Should NOT navigate yet
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('navigates to /payment-management?agency=ABC%20Properties when user confirms', async () => {
      const user = userEvent.setup();
      mockGetDashboard.mockResolvedValue(createTwoAgencyDashboardData());
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('ABC Properties')).toBeInTheDocument();
      });

      // Click Go button
      const abcRow = screen.getByText('ABC Properties').closest('tr');
      const goButton = within(abcRow!).getByRole('button', { name: /go/i });
      await user.click(goButton);

      // Wait for dialog and click Confirm
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /confirm/i }),
        ).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /confirm/i }));

      expect(mockPush).toHaveBeenCalledWith(
        '/payment-management?agency=ABC%20Properties',
      );
    });

    it('does not navigate when user cancels the confirmation dialog', async () => {
      const user = userEvent.setup();
      mockGetDashboard.mockResolvedValue(createTwoAgencyDashboardData());
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('ABC Properties')).toBeInTheDocument();
      });

      // Click Go button
      const abcRow = screen.getByText('ABC Properties').closest('tr');
      const goButton = within(abcRow!).getByRole('button', { name: /go/i });
      await user.click(goButton);

      // Wait for dialog and click Cancel
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /cancel/i }),
        ).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /cancel/i }));

      // Should NOT navigate
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('properly URL-encodes agency names with special characters after confirmation', async () => {
      const user = userEvent.setup();
      mockGetDashboard.mockResolvedValue(
        createTwoAgencyDashboardData({
          PaymentsByAgency: [
            {
              AgencyName: 'Smith & Jones Properties',
              PaymentCount: 5,
              TotalCommissionCount: 50000,
              Vat: 7500,
            },
          ],
        }),
      );
      renderDashboard();

      await waitFor(() => {
        expect(
          screen.getByText('Smith & Jones Properties'),
        ).toBeInTheDocument();
      });

      const row = screen.getByText('Smith & Jones Properties').closest('tr');
      const goButton = within(row!).getByRole('button', { name: /go/i });
      await user.click(goButton);

      // Wait for dialog and confirm
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /confirm/i }),
        ).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /confirm/i }));

      expect(mockPush).toHaveBeenCalledWith(
        '/payment-management?agency=Smith%20%26%20Jones%20Properties',
      );
    });
  });

  // ===========================================================================
  // AC-11: Empty state when no agencies
  // Test Design Scenario 7
  // ===========================================================================
  describe('AC-11: Empty state when PaymentsByAgency is empty', () => {
    it('displays an empty state message when no agencies exist', async () => {
      mockGetDashboard.mockResolvedValue(
        createTwoAgencyDashboardData({
          PaymentsByAgency: [],
        }),
      );
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText(/no agencies/i)).toBeInTheDocument();
      });
    });

    it('does not display the Agency Summary table when PaymentsByAgency is empty', async () => {
      mockGetDashboard.mockResolvedValue(
        createTwoAgencyDashboardData({
          PaymentsByAgency: [],
        }),
      );
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText(/no agencies/i)).toBeInTheDocument();
      });

      // Table should not be rendered
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Edge Cases from Test Design
  // ===========================================================================
  describe('Edge cases', () => {
    it('displays a row for an agency with zero payments and zero amounts', async () => {
      mockGetDashboard.mockResolvedValue(
        createTwoAgencyDashboardData({
          PaymentsByAgency: [
            {
              AgencyName: 'Empty Agency',
              PaymentCount: 0,
              TotalCommissionCount: 0,
              Vat: 0,
            },
          ],
        }),
      );
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('Empty Agency')).toBeInTheDocument();
      });

      const row = screen.getByText('Empty Agency').closest('tr');
      expect(row).toBeTruthy();
      expect(within(row!).getByText('0')).toBeInTheDocument();
      // R 0,00 should appear twice (commission and VAT)
      const zeroAmounts = within(row!).getAllByText(/R\s*0,00/);
      expect(zeroAmounts).toHaveLength(2);
    });

    it('switches filter when clicking a different agency row', async () => {
      const user = userEvent.setup();
      mockGetDashboard.mockResolvedValue(createTwoAgencyDashboardData());
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('ABC Properties')).toBeInTheDocument();
      });

      // Select ABC Properties
      await user.click(screen.getByText('ABC Properties'));
      await waitFor(() => {
        const abcRow = screen.getByText('ABC Properties').closest('tr');
        expect(abcRow).toHaveAttribute('aria-selected', 'true');
      });

      // Switch to XYZ Realty
      await user.click(screen.getByText('XYZ Realty'));

      await waitFor(() => {
        const xyzRow = screen.getByText('XYZ Realty').closest('tr');
        expect(xyzRow).toHaveAttribute('aria-selected', 'true');
      });

      // ABC Properties should no longer be selected
      const abcRow = screen.getByText('ABC Properties').closest('tr');
      expect(abcRow).not.toHaveAttribute('aria-selected', 'true');

      // Dashboard should show XYZ Realty READY total: 300000 → R 300 000,00
      await waitFor(() => {
        expect(screen.getByText(/R\s*300\s*000,00/)).toBeInTheDocument();
      });

      // XYZ Realty PARKED total: 30000 → R 30 000,00
      expect(screen.getByText(/R\s*30\s*000,00/)).toBeInTheDocument();
    });

    it('shows empty chart states when selected agency has no payment status data', async () => {
      const user = userEvent.setup();
      mockGetDashboard.mockResolvedValue(
        createTwoAgencyDashboardData({
          PaymentStatusReport: [
            {
              Status: 'READY',
              CommissionType: 'Bond Registration Commission',
              PaymentCount: 10,
              TotalPaymentAmount: 300000,
              AgencyName: 'XYZ Realty',
            },
          ],
          ParkedPaymentsAgingReport: [],
          PaymentsByAgency: [
            {
              AgencyName: 'ABC Properties',
              PaymentCount: 0,
              TotalCommissionCount: 0,
              Vat: 0,
            },
            {
              AgencyName: 'XYZ Realty',
              PaymentCount: 10,
              TotalCommissionCount: 300000,
              Vat: 45000,
            },
          ],
        }),
      );
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('ABC Properties')).toBeInTheDocument();
      });

      // Select ABC Properties which has no PaymentStatusReport entries
      await user.click(screen.getByText('ABC Properties'));

      // Value cards should show R 0,00
      await waitFor(() => {
        const zeroAmounts = screen.getAllByText(/R\s*0,00/);
        expect(zeroAmounts.length).toBeGreaterThanOrEqual(2);
      });
    });
  });
});
