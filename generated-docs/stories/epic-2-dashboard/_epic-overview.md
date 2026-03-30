# Epic 2: Dashboard (Screen 1)

## Description
Build the Dashboard screen with all six chart/summary components, the Agency Summary grid, agency row selection that filters charts, and navigation from an agency row to Screen 2 (Payment Management). All data loaded via `GET /v1/payments/dashboard`.

## Stories
1. **Dashboard with Charts and Summary Cards** - Fetch dashboard data, render 6 components (Total Value Ready card, Total Value Parked card, Payments Ready bar chart, Parked Payments bar chart, Parked Payments Aging chart, Payments Made Last 14 Days card), en-ZA currency formatting, loading skeletons, error banner with retry, responsive layout | File: `story-1-dashboard-charts-summary.md` | Status: Pending
2. **Agency Summary Grid with Selection and Navigation** - Agency Summary table with columns (Agency Name, # Payments, Total Commission, VAT), row selection filters all 6 dashboard components to the selected agency, "All Agencies" default aggregate view, "Go" button navigates to Payment Management, empty state | File: `story-2-agency-summary-grid.md` | Status: Pending
