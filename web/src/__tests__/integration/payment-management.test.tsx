/**
 * Integration Tests: Payment Grids with Park and Unpark Workflows
 *
 * Epic 3, Story 1
 * Tests validate FRS requirements and acceptance criteria for:
 * - AC-1: Heading shows "Payment Management -- {Agency Name}" (R12)
 * - AC-2: Redirect to Dashboard when no agency param (R12)
 * - AC-3: Fetch payment data from API (R22)
 * - AC-4: Skeleton loading placeholders during fetch (R34)
 * - AC-5: Error message when API fails (R35)
 * - AC-6: Retry button re-fetches data (R35)
 * - AC-7: Main Grid shows READY payments only (R13)
 * - AC-8: Main Grid columns displayed (R13)
 * - AC-9: Main Grid header shows READY count (R13)
 * - AC-10: Parked Grid shows PARKED payments (R14)
 * - AC-11: Parked Grid empty state (R14)
 * - AC-12: Client-side text search filters Main Grid (R15)
 * - AC-13: Filter bar fields (R15)
 * - AC-14: Single Park confirmation modal (R16)
 * - AC-15: Confirm Park API call (R16)
 * - AC-16: Park moves payment from Main to Parked Grid (R16)
 * - AC-17: Cancel closes modal without API call (R16)
 * - AC-18: Multi-select enables "Park Selected" (R17)
 * - AC-19: Bulk Park confirmation shows count and total (R17)
 * - AC-20: Bulk Park API call with all IDs (R17)
 * - AC-21: Bulk Park moves selected payments (R17)
 * - AC-22: Single Unpark confirmation modal (R18)
 * - AC-23: Confirm Unpark API call (R18)
 * - AC-24: Unpark returns payment to Main Grid (R18)
 * - AC-25: Multi-select in Parked Grid enables "Unpark Selected" (R19)
 * - AC-26: Bulk Unpark confirmation shows count and total (R19)
 * - AC-27: Bulk Unpark API call with all IDs (R19)
 * - AC-28: Bulk Unpark returns all to Main Grid (R19)
 * - AC-29: Data refresh after mutations via re-fetch (R22)
 * - AC-30: Pagination controls for Main Grid (R23)
 * - AC-31: Loading indicator during mutation (R34)
 * - AC-32: Error during mutation shows error, no state change (R35)
 *
 * Test design: generated-docs/test-design/epic-3-payment-management/story-1-payment-grids-park-unpark-test-design.md
 */

import { vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import type { PaymentRead, PaymentReadList } from '@/types/api-generated';

// --- Mock data ---

const readyPayment1: PaymentRead = {
  Id: 101,
  AgencyName: 'ABC Properties',
  BatchId: 1001,
  ClaimDate: '2026-01-15',
  AgentName: 'John',
  AgentSurname: 'Smith',
  BondAmount: 1200000,
  CommissionType: 'Bond Registration Commission',
  GrantDate: '2025-12-01',
  RegistrationDate: '2026-01-10',
  Bank: 'FNB',
  CommissionAmount: 42000,
  VAT: 6300,
  Status: 'READY',
};

const readyPayment2: PaymentRead = {
  Id: 102,
  AgencyName: 'ABC Properties',
  BatchId: 1002,
  ClaimDate: '2026-01-18',
  AgentName: 'Bob',
  AgentSurname: 'Johnson',
  BondAmount: 950000,
  CommissionType: 'Manual Payment',
  GrantDate: '2025-11-20',
  RegistrationDate: '2026-01-12',
  Bank: 'ABSA',
  CommissionAmount: 28500,
  VAT: 4275,
  Status: 'READY',
};

const readyPayment3: PaymentRead = {
  Id: 103,
  AgencyName: 'ABC Properties',
  BatchId: 1003,
  ClaimDate: '2026-01-20',
  AgentName: 'Alice',
  AgentSurname: 'Williams',
  BondAmount: 800000,
  CommissionType: 'Bond Registration Commission',
  GrantDate: '2025-12-05',
  RegistrationDate: '2026-01-14',
  Bank: 'Standard Bank',
  CommissionAmount: 30000,
  VAT: 4500,
  Status: 'READY',
};

const parkedPayment1: PaymentRead = {
  Id: 201,
  AgencyName: 'ABC Properties',
  BatchId: undefined,
  ClaimDate: '2026-01-20',
  AgentName: 'Jane',
  AgentSurname: 'Doe',
  BondAmount: 890000,
  CommissionType: 'Manual Payment',
  GrantDate: '2025-11-15',
  RegistrationDate: '2026-01-05',
  Bank: 'ABSA',
  CommissionAmount: 17800,
  VAT: 2670,
  Status: 'PARKED',
};

const defaultPaymentList: PaymentReadList = {
  PaymentList: [readyPayment1, readyPayment2, readyPayment3, parkedPayment1],
};

const onlyReadyPaymentList: PaymentReadList = {
  PaymentList: [
    readyPayment1,
    readyPayment2,
    readyPayment3,
    {
      ...readyPayment1,
      Id: 104,
      AgentName: 'Sarah',
      AgentSurname: 'Connor',
      CommissionAmount: 35000,
      VAT: 5250,
      Status: 'READY',
      BatchId: 1004,
    },
    {
      ...readyPayment1,
      Id: 105,
      AgentName: 'Tom',
      AgentSurname: 'Davis',
      CommissionAmount: 22000,
      VAT: 3300,
      Status: 'READY',
      BatchId: 1005,
    },
  ],
};

const emptyPaymentList: PaymentReadList = {
  PaymentList: [],
};

// --- Mocks ---

// Mock next/image
vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) =>
    React.createElement('img', props),
}));

// Mock next/navigation
const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams('agency=ABC Properties');
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/payment-management',
  useSearchParams: () => mockSearchParams,
}));

// Mock next-auth/react session
vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: { user: { email: 'operator1@example.com', name: 'operator1' } },
    status: 'authenticated',
  }),
  SessionProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}));

// Mock API endpoints
const mockGetPayments = vi.fn();
const mockParkPayments = vi.fn();
const mockUnparkPayments = vi.fn();

vi.mock('@/lib/api/endpoints', () => ({
  getPayments: (...args: unknown[]) => mockGetPayments(...args),
  parkPayments: (...args: unknown[]) => mockParkPayments(...args),
  unparkPayments: (...args: unknown[]) => mockUnparkPayments(...args),
}));

// Import after mocks
import PaymentManagementPage from '@/app/(protected)/payment-management/page';

// --- Helpers ---

function renderPage() {
  return render(<PaymentManagementPage />);
}

// --- Tests ---

describe('Payment Management Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetPayments.mockResolvedValue(defaultPaymentList);
    mockParkPayments.mockResolvedValue(undefined);
    mockUnparkPayments.mockResolvedValue(undefined);
    // Reset search params to include agency
    Object.defineProperty(mockSearchParams, 'get', {
      value: (key: string) => (key === 'agency' ? 'ABC Properties' : null),
      writable: true,
      configurable: true,
    });
  });

  // --- Scenario 1: Page loads with agency-scoped heading and payment data ---

  describe('Scenario 1: Page loads with agency-scoped heading and payment data', () => {
    it('AC-1: displays heading with agency name from URL', async () => {
      renderPage();

      await waitFor(() => {
        expect(
          screen.getByRole('heading', {
            name: /Payment Management.*ABC Properties/i,
          }),
        ).toBeInTheDocument();
      });
    });

    it('AC-3: fetches payment data for the agency from the API', async () => {
      renderPage();

      await waitFor(() => {
        expect(mockGetPayments).toHaveBeenCalledWith(
          expect.objectContaining({ AgencyName: 'ABC Properties' }),
        );
      });
    });

    it('AC-7, AC-9: Main Grid shows only READY payments with count header', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText(/Ready Payments\s*\(3\)/i)).toBeInTheDocument();
      });

      // Verify READY payment names are shown
      expect(screen.getByText(/John Smith/i)).toBeInTheDocument();
      expect(screen.getByText(/Bob Johnson/i)).toBeInTheDocument();
      expect(screen.getByText(/Alice Williams/i)).toBeInTheDocument();
    });

    it('AC-8: Main Grid displays the expected columns', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText(/Ready Payments/i)).toBeInTheDocument();
      });

      // Scope to the Ready Payments section
      const readySection = screen.getByRole('region', {
        name: /ready payments/i,
      });

      // Verify key column headers are present within the ready section
      const columnHeaders = [
        'Agency Name',
        'Batch ID',
        'Claim Date',
        'Bond Amount',
        'Commission Type',
        'Grant Date',
        'Bank',
        'Commission Amount',
        'VAT',
        'Status',
      ];

      for (const header of columnHeaders) {
        expect(
          within(readySection).getByRole('columnheader', {
            name: new RegExp(header, 'i'),
          }),
        ).toBeInTheDocument();
      }
    });

    it('AC-10: Parked Grid shows PARKED payments', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText(/Jane Doe/i)).toBeInTheDocument();
      });

      // Scope to the Parked Payments section
      const parkedSection = screen.getByRole('region', {
        name: /parked payments/i,
      });

      // Verify parked payment is in the parked section
      expect(within(parkedSection).getByText(/Jane Doe/i)).toBeInTheDocument();
    });
  });

  // --- Scenario 2: Redirect when no agency parameter ---

  describe('Scenario 2: Redirect when no agency parameter', () => {
    it('AC-2: redirects to Dashboard when agency query param is missing', async () => {
      Object.defineProperty(mockSearchParams, 'get', {
        value: () => null,
        writable: true,
        configurable: true,
      });

      renderPage();

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });
  });

  // --- Scenario 3: Loading skeleton during fetch ---

  describe('Scenario 3: Loading skeleton during fetch', () => {
    it('AC-4: shows skeleton loading placeholders while data is loading', async () => {
      // Keep the API call pending (never resolves during test)
      mockGetPayments.mockReturnValue(new Promise(() => {}));

      renderPage();

      // Skeleton placeholders should appear in both grid areas
      const skeletons = screen.getAllByRole('status');
      expect(skeletons.length).toBeGreaterThanOrEqual(1);
    });
  });

  // --- Scenario 4: Error state with Retry ---

  describe('Scenario 4: Error state with Retry', () => {
    it('AC-5: shows error message when API call fails', async () => {
      mockGetPayments.mockRejectedValue(new Error('Server error'));

      renderPage();

      await waitFor(() => {
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      });
    });

    it('AC-6: Retry button re-fetches payment data', async () => {
      const user = userEvent.setup();

      mockGetPayments.mockRejectedValueOnce(new Error('Server error'));
      mockGetPayments.mockResolvedValueOnce(defaultPaymentList);

      renderPage();

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /retry/i }),
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /retry/i }));

      // After retry, data should be displayed
      await waitFor(() => {
        expect(screen.getByText(/Ready Payments/i)).toBeInTheDocument();
      });
    });
  });

  // --- Scenario 5: Parked Grid empty state ---

  describe('Scenario 5: Parked Grid empty state', () => {
    it('AC-11: shows empty state message when no payments are parked', async () => {
      mockGetPayments.mockResolvedValue(onlyReadyPaymentList);

      renderPage();

      await waitFor(() => {
        expect(screen.getByText(/no parked payments/i)).toBeInTheDocument();
      });
    });
  });

  // --- Scenario 6: Client-side text search ---

  describe('Scenario 6: Client-side text search filters Main Grid', () => {
    it('AC-12: typing in search bar filters grid rows client-side', async () => {
      const user = userEvent.setup();
      renderPage();

      await waitFor(() => {
        expect(screen.getByText(/John Smith/i)).toBeInTheDocument();
      });

      // Type "John" in the search input
      const searchInput =
        screen.getByRole('searchbox') || screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, 'John');

      // Should show John Smith and Bob Johnson (both match "John" in name)
      await waitFor(() => {
        expect(screen.getByText(/John Smith/i)).toBeInTheDocument();
        expect(screen.getByText(/Bob Johnson/i)).toBeInTheDocument();
      });

      // Alice Williams should be filtered out
      expect(screen.queryByText(/Alice Williams/i)).not.toBeInTheDocument();

      // Filtering happens client-side — no additional network loading indicator appears
      expect(
        screen.queryByRole('status', { name: /loading/i }),
      ).not.toBeInTheDocument();
    });
  });

  // --- Scenario 7: Single Park flow ---

  describe('Scenario 7: Single park confirmation, confirm, and grid update', () => {
    it('AC-14: clicking Park opens confirmation modal with payment details', async () => {
      const user = userEvent.setup();
      renderPage();

      await waitFor(() => {
        expect(screen.getByText(/John Smith/i)).toBeInTheDocument();
      });

      // Click the Park button on John Smith's row
      const parkButtons = screen.getAllByRole('button', { name: /^park$/i });
      await user.click(parkButtons[0]);

      // Confirmation modal should show payment details
      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();
        expect(within(dialog).getByText(/John Smith/i)).toBeInTheDocument();
        expect(within(dialog).getByText(/2026-01-15/)).toBeInTheDocument();
        // Commission amount formatted in ZAR
        expect(
          within(dialog).getByText(/42[\s\u00a0]?000/),
        ).toBeInTheDocument();
      });
    });

    it('AC-15, AC-16, AC-29: confirming park calls API and refreshes grids', async () => {
      const user = userEvent.setup();

      // After park, re-fetch returns updated data (John Smith now PARKED)
      const afterParkList: PaymentReadList = {
        PaymentList: [
          readyPayment2,
          readyPayment3,
          parkedPayment1,
          { ...readyPayment1, Status: 'PARKED' },
        ],
      };
      mockGetPayments
        .mockResolvedValueOnce(defaultPaymentList)
        .mockResolvedValueOnce(afterParkList);

      renderPage();

      await waitFor(() => {
        expect(screen.getByText(/John Smith/i)).toBeInTheDocument();
      });

      // Click Park on John Smith's row
      const parkButtons = screen.getAllByRole('button', { name: /^park$/i });
      await user.click(parkButtons[0]);

      // Click Confirm Park in the modal
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /confirm park/i }));

      // Verify API was called with correct payload
      await waitFor(() => {
        expect(mockParkPayments).toHaveBeenCalledWith(
          expect.objectContaining({ PaymentIds: [101] }),
          expect.any(String),
        );
      });

      // After success, the grid refreshes showing updated counts (John Smith moved to PARKED)
      await waitFor(() => {
        expect(screen.getByText(/Ready Payments\s*\(2\)/i)).toBeInTheDocument();
      });
    });
  });

  // --- Scenario 8: Single Park cancel ---

  describe('Scenario 8: Single park cancel does not call API', () => {
    it('AC-17: clicking Cancel closes modal without making API call', async () => {
      const user = userEvent.setup();
      renderPage();

      await waitFor(() => {
        expect(screen.getByText(/John Smith/i)).toBeInTheDocument();
      });

      // Click Park
      const parkButtons = screen.getAllByRole('button', { name: /^park$/i });
      await user.click(parkButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Click Cancel
      await user.click(screen.getByRole('button', { name: /cancel/i }));

      // Modal should close
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      // No park API call should have been made
      expect(mockParkPayments).not.toHaveBeenCalled();
    });
  });

  // --- Scenario 9: Bulk Park ---

  describe('Scenario 9: Bulk park select multiple, confirm, and grid update', () => {
    it('AC-18: selecting multiple rows enables Park Selected button', async () => {
      const user = userEvent.setup();
      renderPage();

      await waitFor(() => {
        expect(screen.getByText(/John Smith/i)).toBeInTheDocument();
      });

      // Scope to the Ready Payments section
      const readySection = screen.getByRole('region', {
        name: /ready payments/i,
      });

      // Park Selected should be disabled initially
      const parkSelectedBtn = within(readySection).getByRole('button', {
        name: /park selected/i,
      });
      expect(parkSelectedBtn).toBeDisabled();

      // Select checkboxes for first and third READY payments
      const checkboxes = within(readySection).getAllByRole('checkbox');
      await user.click(checkboxes[0]);
      await user.click(checkboxes[2]);

      // Park Selected should now be enabled
      await waitFor(() => {
        expect(parkSelectedBtn).toBeEnabled();
      });
    });

    it('AC-19, AC-20, AC-21: bulk park confirmation shows count/total and calls API', async () => {
      const user = userEvent.setup();

      const afterBulkParkList: PaymentReadList = {
        PaymentList: [
          readyPayment2,
          readyPayment3,
          parkedPayment1,
          { ...readyPayment1, Status: 'PARKED' },
          { ...readyPayment3, Status: 'PARKED' },
        ],
      };
      mockGetPayments
        .mockResolvedValueOnce(defaultPaymentList)
        .mockResolvedValueOnce(afterBulkParkList);

      renderPage();

      await waitFor(() => {
        expect(screen.getByText(/John Smith/i)).toBeInTheDocument();
      });

      // Scope to the Ready Payments section
      const readySection = screen.getByRole('region', {
        name: /ready payments/i,
      });

      // Select first and third READY payments (R 42 000 + R 30 000 = R 72 000)
      const checkboxes = within(readySection).getAllByRole('checkbox');
      await user.click(checkboxes[0]);
      await user.click(checkboxes[2]);

      // Click Park Selected
      await user.click(
        within(readySection).getByRole('button', { name: /park selected/i }),
      );

      // Bulk confirmation modal should show count and total
      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(
          within(dialog).getByText(/Park 2 Payments/i),
        ).toBeInTheDocument();
        // Total commission: R 72 000
        expect(
          within(dialog).getByText(/72[\s\u00a0]?000/),
        ).toBeInTheDocument();
      });

      // Confirm the bulk park
      await user.click(screen.getByRole('button', { name: /confirm park/i }));

      // API should be called with both payment IDs
      await waitFor(() => {
        expect(mockParkPayments).toHaveBeenCalledWith(
          expect.objectContaining({
            PaymentIds: expect.arrayContaining([101, 103]),
          }),
          expect.any(String),
        );
      });
    });
  });

  // --- Scenario 10: Single Unpark ---

  describe('Scenario 10: Single unpark confirmation and grid update', () => {
    it('AC-22: clicking Unpark opens confirmation modal with payment details', async () => {
      const user = userEvent.setup();
      renderPage();

      await waitFor(() => {
        expect(screen.getByText(/Jane Doe/i)).toBeInTheDocument();
      });

      // Click Unpark on Jane Doe's row in the Parked Grid
      const unparkButtons = screen.getAllByRole('button', {
        name: /^unpark$/i,
      });
      await user.click(unparkButtons[0]);

      // Modal should show payment details
      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(within(dialog).getByText(/Jane Doe/i)).toBeInTheDocument();
        expect(within(dialog).getByText(/2026-01-20/)).toBeInTheDocument();
        expect(
          within(dialog).getByText(/17[\s\u00a0]?800/),
        ).toBeInTheDocument();
      });
    });

    it('AC-23, AC-24, AC-29: confirming unpark calls API and refreshes grids', async () => {
      const user = userEvent.setup();

      const afterUnparkList: PaymentReadList = {
        PaymentList: [
          readyPayment1,
          readyPayment2,
          readyPayment3,
          { ...parkedPayment1, Status: 'READY' },
        ],
      };
      mockGetPayments
        .mockResolvedValueOnce(defaultPaymentList)
        .mockResolvedValueOnce(afterUnparkList);

      renderPage();

      await waitFor(() => {
        expect(screen.getByText(/Jane Doe/i)).toBeInTheDocument();
      });

      // Click Unpark
      const unparkButtons = screen.getAllByRole('button', {
        name: /^unpark$/i,
      });
      await user.click(unparkButtons[0]);

      // Confirm Unpark
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /confirm unpark/i }));

      // Verify API call
      await waitFor(() => {
        expect(mockUnparkPayments).toHaveBeenCalledWith(
          expect.objectContaining({ PaymentIds: [201] }),
          expect.any(String),
        );
      });

      // After success, grid refreshes — Jane Doe now appears in Ready grid (4 READY payments)
      await waitFor(() => {
        expect(screen.getByText(/Ready Payments\s*\(4\)/i)).toBeInTheDocument();
      });
    });
  });

  // --- Scenario 11: Bulk Unpark ---

  describe('Scenario 11: Bulk unpark select multiple and confirm', () => {
    it('AC-25, AC-26, AC-27, AC-28: bulk unpark flow with multiple parked payments', async () => {
      const user = userEvent.setup();

      const parkedPayment2: PaymentRead = {
        ...parkedPayment1,
        Id: 202,
        AgentName: 'Tom',
        AgentSurname: 'Brown',
        CommissionAmount: 15000,
        VAT: 2250,
      };
      const parkedPayment3: PaymentRead = {
        ...parkedPayment1,
        Id: 203,
        AgentName: 'Lisa',
        AgentSurname: 'White',
        CommissionAmount: 25000,
        VAT: 3750,
      };

      const multiParkedList: PaymentReadList = {
        PaymentList: [
          readyPayment1,
          parkedPayment1,
          parkedPayment2,
          parkedPayment3,
        ],
      };

      const afterUnparkList: PaymentReadList = {
        PaymentList: [
          readyPayment1,
          { ...parkedPayment1, Status: 'READY' },
          { ...parkedPayment2, Status: 'READY' },
          { ...parkedPayment3, Status: 'READY' },
        ],
      };

      mockGetPayments
        .mockResolvedValueOnce(multiParkedList)
        .mockResolvedValueOnce(afterUnparkList);

      renderPage();

      await waitFor(() => {
        expect(screen.getByText(/Jane Doe/i)).toBeInTheDocument();
        expect(screen.getByText(/Tom Brown/i)).toBeInTheDocument();
        expect(screen.getByText(/Lisa White/i)).toBeInTheDocument();
      });

      // Scope to the Parked Payments section
      const parkedSection = screen.getByRole('region', {
        name: /parked payments/i,
      });

      // Unpark Selected should be disabled initially
      const unparkSelectedBtn = within(parkedSection).getByRole('button', {
        name: /unpark selected/i,
      });
      expect(unparkSelectedBtn).toBeDisabled();

      // Select all 3 parked payment checkboxes
      const parkedCheckboxes = within(parkedSection).getAllByRole('checkbox');
      for (const cb of parkedCheckboxes) {
        await user.click(cb);
      }

      // Unpark Selected should be enabled
      await waitFor(() => {
        expect(unparkSelectedBtn).toBeEnabled();
      });

      // Click Unpark Selected
      await user.click(unparkSelectedBtn);

      // Bulk confirmation modal: 3 payments, total = 17800 + 15000 + 25000 = 57800
      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(
          within(dialog).getByText(/Unpark 3 Payments/i),
        ).toBeInTheDocument();
        expect(
          within(dialog).getByText(/57[\s\u00a0]?800/),
        ).toBeInTheDocument();
      });

      // Confirm
      await user.click(screen.getByRole('button', { name: /confirm unpark/i }));

      // API called with all 3 IDs
      await waitFor(() => {
        expect(mockUnparkPayments).toHaveBeenCalledWith(
          expect.objectContaining({
            PaymentIds: expect.arrayContaining([201, 202, 203]),
          }),
          expect.any(String),
        );
      });
    });
  });

  // --- Edge 1: Park API failure ---

  describe('Edge 1: Park API call fails', () => {
    it('AC-32: shows error message and payment remains in Main Grid', async () => {
      const user = userEvent.setup();

      mockParkPayments.mockRejectedValue(new Error('Park failed'));

      renderPage();

      await waitFor(() => {
        expect(screen.getByText(/John Smith/i)).toBeInTheDocument();
      });

      // Park John Smith
      const parkButtons = screen.getAllByRole('button', { name: /^park$/i });
      await user.click(parkButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /confirm park/i }));

      // Error message should appear in the dialog
      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(within(dialog).getByText(/failed/i)).toBeInTheDocument();
      });

      // Close the dialog to verify grid state
      await user.click(screen.getByRole('button', { name: /cancel/i }));

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      // Payment should still be in the Main Grid (not moved)
      const readySection = screen.getByRole('region', {
        name: /ready payments/i,
      });
      expect(within(readySection).getByText(/John Smith/i)).toBeInTheDocument();
    });
  });

  // --- Edge 2: Pagination ---

  describe('Edge 2: Pagination on Main Grid', () => {
    it('AC-30: shows pagination controls when many READY payments', async () => {
      // Create 25 READY payments
      const manyPayments: PaymentRead[] = Array.from(
        { length: 25 },
        (_, i) => ({
          ...readyPayment1,
          Id: 300 + i,
          BatchId: 2000 + i,
          AgentName: `Agent${i}`,
          AgentSurname: `Surname${i}`,
          CommissionAmount: 10000 + i * 1000,
        }),
      );

      mockGetPayments.mockResolvedValue({
        PaymentList: manyPayments,
      });

      renderPage();

      await waitFor(() => {
        expect(
          screen.getByText(/Ready Payments\s*\(25\)/i),
        ).toBeInTheDocument();
      });

      // Pagination controls should be visible
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    });

    it('AC-30: clicking Next shows the next page of rows', async () => {
      const user = userEvent.setup();

      const manyPayments: PaymentRead[] = Array.from(
        { length: 25 },
        (_, i) => ({
          ...readyPayment1,
          Id: 300 + i,
          BatchId: 2000 + i,
          AgentName: `Agent${i}`,
          AgentSurname: `Surname${i}`,
          CommissionAmount: 10000 + i * 1000,
        }),
      );

      mockGetPayments.mockResolvedValue({
        PaymentList: manyPayments,
      });

      renderPage();

      await waitFor(() => {
        expect(screen.getByText(/Agent0/)).toBeInTheDocument();
      });

      // Click Next
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Should show a different page of results
      await waitFor(() => {
        // First page agents should not be visible (assuming 10 per page)
        expect(screen.queryByText(/Agent0 Surname0/)).not.toBeInTheDocument();
      });
    });
  });

  // --- Edge 3: Loading indicator during mutation ---

  describe('Edge 3: Loading indicator during park/unpark mutation', () => {
    it('AC-31: shows loading indicator while park API call is in progress', async () => {
      const user = userEvent.setup();

      // Park API stays pending
      mockParkPayments.mockReturnValue(new Promise(() => {}));

      renderPage();

      await waitFor(() => {
        expect(screen.getByText(/John Smith/i)).toBeInTheDocument();
      });

      // Park John Smith
      const parkButtons = screen.getAllByRole('button', { name: /^park$/i });
      await user.click(parkButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /confirm park/i }));

      // Loading indicator should be visible
      await waitFor(() => {
        expect(
          screen.getByRole('status') || screen.getByText(/loading|processing/i),
        ).toBeInTheDocument();
      });
    });
  });

  // --- Edge 4: Park Selected disabled when no rows selected ---

  describe('Edge 4: Park Selected button disabled when no rows selected', () => {
    it('AC-18: Park Selected is disabled when no checkboxes are checked', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText(/Ready Payments/i)).toBeInTheDocument();
      });

      const readySection = screen.getByRole('region', {
        name: /ready payments/i,
      });
      const parkSelectedBtn = within(readySection).getByRole('button', {
        name: /park selected/i,
      });
      expect(parkSelectedBtn).toBeDisabled();
    });
  });

  // --- Edge 5: Both grids empty ---

  describe('Edge 5: Both grids empty', () => {
    it('AC-9, AC-11: shows zero count for Main Grid and empty state for Parked Grid', async () => {
      mockGetPayments.mockResolvedValue(emptyPaymentList);

      renderPage();

      await waitFor(() => {
        expect(screen.getByText(/Ready Payments\s*\(0\)/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/no parked payments/i)).toBeInTheDocument();
    });
  });
});
