# Story: Agency Summary Grid with Selection and Navigation

**Epic:** Dashboard (Screen 1) | **Story:** 2 of 2 | **Wireframe:** `generated-docs/specs/wireframes/02-dashboard.md`

## Story Metadata
| Field | Value |
|-------|-------|
| **Route** | `/` (same page as Story 1) |
| **Target File** | `app/(protected)/page.tsx` |
| **Page Action** | `modify_existing` |

## User Story
**As an** operator **I want** to see an Agency Summary table and select an agency to filter the dashboard **so that** I can drill down into a specific agency's payment activity or navigate to manage that agency's payments.

## Acceptance Criteria

### Agency Summary Table (R8)
- [ ] AC-1: Given dashboard data has loaded, when I look below the charts, then I see an "Agency Summary" table with columns: Agency Name, Number of Payments, Total Commission Amount, and VAT
- [ ] AC-2: Given the Agency Summary table is displayed, when I look at the monetary columns, then Total Commission Amount and VAT values are formatted in South African currency format (e.g., R 123 456,00)
- [ ] AC-3: Given the Agency Summary table is displayed, when I look at the Number of Payments column, then it shows the count of READY payments (not PARKED) for each agency (BR6)

### Row Selection and Filtering (R10, BR7)
- [ ] AC-4: Given the Agency Summary table is displayed, when no agency is selected, then all six dashboard components (two value cards, two bar charts, aging chart, last-14-days card) show aggregate data across all agencies
- [ ] AC-5: Given the Agency Summary table is displayed, when I click on an agency row, then that row is visually highlighted as selected
- [ ] AC-6: Given I have selected an agency row, when I look at the dashboard components, then all six components update to show data for only the selected agency
- [ ] AC-7: Given I have selected an agency row, when I click the same row again (or click an "All Agencies" option), then the selection is cleared and the dashboard returns to showing aggregate data for all agencies
- [ ] AC-8: Given I have selected an agency, when I look at the page heading area, then I can see which agency is currently selected (e.g., "Selected agency: ABC Properties")

### Navigation to Payment Management (R9)
- [ ] AC-9: Given the Agency Summary table is displayed, when I look at each row, then I see a "Go" button (or equivalent action) for navigating to Payment Management
- [ ] AC-10: Given I click the "Go" button on an agency row, when the navigation completes, then I am taken to `/payment-management?agency={agencyName}` for that agency

### Empty State
- [ ] AC-11: Given dashboard data has loaded but `PaymentsByAgency` is empty, when I look at the Agency Summary area, then I see a message indicating there are no agencies to display

## API Endpoints (from OpenAPI spec)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/v1/payments/dashboard` | Already fetched in Story 1 — `PaymentsByAgency` array provides the agency grid data |

## Implementation Notes
- The `PaymentsByAgency` array from the dashboard response contains `AgencyName`, `PaymentCount`, `TotalCommissionCount` (commission amount), and `Vat` per the OpenAPI spec's `PaymentsByAgencyReportItem` schema.
- Use Shadcn `<Table>` components (`<Table>`, `<TableHeader>`, `<TableRow>`, `<TableHead>`, `<TableBody>`, `<TableCell>`) for the grid.
- Use Shadcn `<Button>` with ghost variant for the "Go" navigation button in each row.
- Row selection state should be lifted to the Dashboard page level so it can filter the chart/card components built in Story 1.
- When an agency is selected, filter `PaymentStatusReport` and `ParkedPaymentsAgingReport` arrays by `AgencyName` before passing to chart components. `TotalPaymentCountInLast14Days` is a global metric and may not be agency-filterable — display the global value or hide when filtered.
- Navigation uses Next.js `<Link>` or `router.push()` to `/payment-management?agency={encodeURIComponent(agencyName)}`.
- Currency formatting should reuse the same `Intl.NumberFormat('en-ZA', ...)` utility created in Story 1.
- The "All Agencies" default state shows unfiltered aggregate data — this is the initial state before any row is clicked.
