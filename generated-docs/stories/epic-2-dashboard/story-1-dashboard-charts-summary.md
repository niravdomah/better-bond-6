# Story: Dashboard with Charts and Summary Cards

**Epic:** Dashboard (Screen 1) | **Story:** 1 of 2 | **Wireframe:** `generated-docs/specs/wireframes/02-dashboard.md`

## Story Metadata
| Field | Value |
|-------|-------|
| **Route** | `/` (protected home page) |
| **Target File** | `app/(protected)/page.tsx` |
| **Page Action** | `modify_existing` |

## User Story
**As an** operator **I want** to see a dashboard with charts and summary cards showing commission payment activity **so that** I can quickly assess the current state of ready, parked, and recently processed payments.

## Acceptance Criteria

### Data Loading (R11)
- [ ] AC-1: Given I am signed in, when the Dashboard page loads, then the app fetches data from `GET /v1/payments/dashboard` and displays the six dashboard components
- [ ] AC-2: Given the dashboard data is loading, when I look at the page, then I see loading skeleton placeholders for each card and chart area
- [ ] AC-3: Given the dashboard API call fails, when I look at the page, then I see an error banner explaining something went wrong
- [ ] AC-4: Given the dashboard shows an error banner, when I click the Retry button, then the app re-fetches the dashboard data

### Total Value Cards (R4, R5)
- [ ] AC-5: Given dashboard data has loaded, when I look at the "Total Value Ready for Payment" card, then I see the sum of all READY payment amounts displayed in South African currency format (e.g., R 1 234 567,89)
- [ ] AC-6: Given dashboard data has loaded, when I look at the "Total Value of Parked Payments" card, then I see the sum of all PARKED payment amounts displayed in South African currency format (e.g., R 234 567,89)

### Bar Charts (R2, R3)
- [ ] AC-7: Given dashboard data has loaded, when I look at the "Payments Ready for Payment" chart, then I see a bar chart with bars for each commission type ("Bond Comm" and "Manual Payments") showing the count of READY payments
- [ ] AC-8: Given dashboard data has loaded, when I look at the "Parked Payments" chart, then I see a bar chart with bars for each commission type ("Bond Comm" and "Manual Payments") showing the count of PARKED payments

### Aging Report (R6)
- [ ] AC-9: Given dashboard data has loaded, when I look at the "Parked Payments Aging Report" chart, then I see a bar chart with bars for the ranges "1-3 Days", "4-7 Days", and ">7 Days" showing how many payments fall into each aging bucket

### Payments Made Metric (R7)
- [ ] AC-10: Given dashboard data has loaded, when I look at the "Payments Made (Last 14 Days)" card, then I see the total count of payments processed in the last 14 days (from `TotalPaymentCountInLast14Days`)

### Page Structure (R1)
- [ ] AC-11: Given I am signed in, when the Dashboard page loads, then I see a "Dashboard" heading at the top of the page
- [ ] AC-12: Given I am viewing on a desktop screen, when I look at the dashboard layout, then the metric cards and charts are arranged in a two-column grid
- [ ] AC-13: Given I am viewing on a mobile screen, when I look at the dashboard layout, then the metric cards and charts stack into a single column

## API Endpoints (from OpenAPI spec)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/v1/payments/dashboard` | Fetch `PaymentsDashboardRead` containing `PaymentStatusReport`, `ParkedPaymentsAgingReport`, `TotalPaymentCountInLast14Days`, and `PaymentsByAgency` |

## Implementation Notes
- Replace the existing placeholder "Dashboard" heading content in `app/(protected)/page.tsx` with the full dashboard implementation.
- Use the API client (`lib/api/client.ts`) to call `GET /v1/payments/dashboard`. Define the endpoint function in `lib/api/endpoints.ts` if not already present.
- Derive "Total Value Ready" from `PaymentStatusReport` items where `Status === "READY"`, summing `TotalPaymentAmount`.
- Derive "Total Value Parked" from `PaymentStatusReport` items where `Status === "PARKED"`, summing `TotalPaymentAmount`.
- Derive bar chart data from `PaymentStatusReport` items, grouping by `CommissionType` and filtering by `Status`.
- Use Recharts `<BarChart>` inside Shadcn `<Card>` components for the three chart areas.
- Use Shadcn `<Card>` for the two monetary summary cards and the "Last 14 Days" metric card.
- Use Shadcn `<Skeleton>` for loading placeholders matching each card/chart shape.
- Currency formatting: use `Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' })` which produces the "R" prefix with space-separated thousands and comma decimal.
- Layout: `grid grid-cols-1 lg:grid-cols-2 gap-4` for the 6 components, with `p-6` desktop / `p-4` mobile padding.
- The `PaymentsByAgency` data is fetched here but rendered by Story 2 (Agency Summary Grid). This story should pass it down or make it available.
