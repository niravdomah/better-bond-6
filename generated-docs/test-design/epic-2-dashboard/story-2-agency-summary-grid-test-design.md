# Test Design: Agency Summary Grid with Selection and Navigation

## Story Summary

**Epic:** 2
**Story:** 2
**As an** operator
**I want to** see an Agency Summary table and select an agency to filter the dashboard
**So that** I can drill down into a specific agency's payment activity or navigate to manage that agency's payments.

## Review Purpose

This document presents concrete business examples for BA review before executable tests are written.

Its purpose is to:
- surface missing business decisions
- let the BA review behavior using examples and expected outcomes
- provide an approved source for downstream test generation

## Business Behaviors Identified

- Dashboard page displays an Agency Summary table below the charts, with columns: Agency Name, Number of Payments, Total Commission Amount, and VAT
- The Agency Summary table data comes from the `PaymentsByAgency` array in the dashboard API response
- Monetary columns (Total Commission Amount, VAT) are formatted in South African currency (R with space-separated thousands and comma decimal)
- Number of Payments shows the count of READY payments (not PARKED) per agency
- When no agency is selected, all dashboard components show aggregate data across all agencies
- Clicking an agency row highlights it as selected and filters all dashboard components to that agency's data
- Clicking the selected row again (or an "All Agencies" option) clears the selection and returns to aggregate view
- A selected agency indicator is visible in the page heading area
- Each row has a "Go" button that navigates to Payment Management for that agency
- When `PaymentsByAgency` is empty, an empty state message is displayed instead of the table

## Key Decisions Surfaced by AI

- **"Number of Payments" column interpretation (BR6):** The story says this shows READY payment count, not PARKED. The API field is `PaymentCount` on `PaymentsByAgencyReportItem`. We assume the API already returns the READY count (not total). If the API includes PARKED payments in this count, a filter would be needed client-side. This is surfaced for BA clarification — the examples below assume `PaymentCount` already represents READY-only counts.
- **"All Agencies" deselection mechanism (AC-7):** The story says clicking the same row again OR clicking an "All Agencies" option clears the selection. The examples below test both: re-clicking a selected row and a separate "All Agencies" option. The implementation may use either or both mechanisms.
- **Dashboard component filtering scope (AC-6):** When an agency is selected, the story says "all six components" update. Story 1 implemented five components (the Last 14 Days card was removed). The `TotalPaymentCountInLast14Days` field is a global metric and may not be agency-filterable. The examples below test filtering on the five existing components.
- **Currency field naming:** The API returns `TotalCommissionCount` (despite being a monetary amount) and `Vat`. The story calls these "Total Commission Amount" and "VAT" in column headers. The examples use the user-facing column names.
- **Navigation URL encoding:** Agency names with special characters (spaces, ampersands) need URL encoding in the query parameter. The examples include an agency name with spaces to verify this.

## Test Scenarios / Review Examples

### 1. Agency Summary table displays with correct columns and data

| Setup | Value |
| --- | --- |
| User | Signed-in operator |
| API response PaymentsByAgency | [{ AgencyName: "ABC Properties", PaymentCount: 12, TotalCommissionCount: 123456.00, Vat: 18518.40 }, { AgencyName: "XYZ Realty", PaymentCount: 8, TotalCommissionCount: 89012.00, Vat: 13351.80 }] |

| Input | Value |
| --- | --- |
| Action | Navigate to Dashboard (route `/`) |

| Expected | Value |
| --- | --- |
| "Agency Summary" heading or label | Visible above the table |
| Table columns | Agency Name, Number of Payments, Total Commission Amount, VAT, and a navigation action column |
| Row 1 | "ABC Properties", "12", "R 123 456,00", "R 18 518,40", "Go" button |
| Row 2 | "XYZ Realty", "8", "R 89 012,00", "R 13 351,80", "Go" button |

---

### 2. Currency formatting in Agency Summary table

| Setup | Value |
| --- | --- |
| API response PaymentsByAgency | [{ AgencyName: "Test Agency", PaymentCount: 5, TotalCommissionCount: 1234567.89, Vat: 185185.18 }] |

| Input | Value |
| --- | --- |
| Action | Dashboard loads |

| Expected | Value |
| --- | --- |
| Total Commission Amount column | Displays "R 1 234 567,89" |
| VAT column | Displays "R 185 185,18" |

---

### 3. Clicking an agency row highlights it and filters dashboard components

| Setup | Value |
| --- | --- |
| User | Signed-in operator |
| API response | Full dashboard data with two agencies: "ABC Properties" and "XYZ Realty", each with different payment data in PaymentStatusReport, ParkedPaymentsAgingReport, and PaymentsByAgency |
| Initial state | No agency selected — dashboard shows aggregate data |

| Input | Value |
| --- | --- |
| Action | Click the "ABC Properties" row in the Agency Summary table |

| Expected | Value |
| --- | --- |
| "ABC Properties" row | Visually highlighted as selected |
| Selected agency indicator | Visible in page heading area (e.g., "Selected agency: ABC Properties") |
| Dashboard value cards | Update to show totals for ABC Properties only |
| Dashboard bar charts | Update to show payment counts for ABC Properties only |
| Aging report chart | Updates to show aging data for ABC Properties only |

---

### 4. Default state shows aggregate data across all agencies

| Setup | Value |
| --- | --- |
| User | Signed-in operator |
| API response | Dashboard data with multiple agencies |

| Input | Value |
| --- | --- |
| Action | Navigate to Dashboard — no agency row clicked |

| Expected | Value |
| --- | --- |
| No row highlighted | No agency row appears selected |
| No selected agency indicator | No "Selected agency:" text visible |
| Dashboard components | Show aggregate data across all agencies |

---

### 5. Deselecting an agency returns to aggregate view

| Setup | Value |
| --- | --- |
| User | Signed-in operator with "ABC Properties" currently selected |

| Input | Value |
| --- | --- |
| Action | Click the "ABC Properties" row again (toggle off) |

| Expected | Value |
| --- | --- |
| Row highlight | Removed from "ABC Properties" |
| Selected agency indicator | No longer visible |
| Dashboard components | Return to showing aggregate data across all agencies |

---

### 6. "Go" button shows confirmation dialog and navigates on confirm

| Setup | Value |
| --- | --- |
| User | Signed-in operator |
| API response PaymentsByAgency | [{ AgencyName: "ABC Properties", PaymentCount: 12, TotalCommissionCount: 123456.00, Vat: 18518.40 }] |

| Input | Value |
| --- | --- |
| Action | Click the "Go" button on the "ABC Properties" row |

| Expected | Value |
| --- | --- |
| Confirmation dialog | A dialog appears asking the user to confirm navigation to Payment Management for "ABC Properties" |
| On confirm | User is navigated to `/payment-management?agency=ABC%20Properties` |
| On cancel | Dialog closes, user remains on Dashboard |

---

### 7. Empty state when no agencies exist

| Setup | Value |
| --- | --- |
| User | Signed-in operator |
| API response PaymentsByAgency | Empty array `[]` |

| Input | Value |
| --- | --- |
| Action | Dashboard loads |

| Expected | Value |
| --- | --- |
| Agency Summary table | Not displayed |
| Empty state message | Visible, indicating there are no agencies to display |

---

### 8. Agency selection filters value cards correctly

| Setup | Value |
| --- | --- |
| API response PaymentStatusReport | [{ Status: "READY", CommissionType: "Bond Registration Commission", PaymentCount: 15, TotalPaymentAmount: 500000, AgencyName: "ABC Properties" }, { Status: "READY", CommissionType: "Bond Registration Commission", PaymentCount: 10, TotalPaymentAmount: 300000, AgencyName: "XYZ Realty" }, { Status: "PARKED", CommissionType: "Manual Payments", PaymentCount: 3, TotalPaymentAmount: 50000, AgencyName: "ABC Properties" }, { Status: "PARKED", CommissionType: "Manual Payments", PaymentCount: 2, TotalPaymentAmount: 30000, AgencyName: "XYZ Realty" }] |

| Input | Value |
| --- | --- |
| Action | Select "ABC Properties" in the Agency Summary table |

| Expected | Value |
| --- | --- |
| "Total Value Ready for Payment" | Shows R 500 000,00 (ABC Properties READY only, not the R 800 000,00 aggregate) |
| "Total Value of Parked Payments" | Shows R 50 000,00 (ABC Properties PARKED only, not the R 80 000,00 aggregate) |

---

### 9. Agency selection filters bar charts correctly

| Setup | Value |
| --- | --- |
| API response PaymentStatusReport | Mixed agencies with different payment counts per commission type |

| Input | Value |
| --- | --- |
| Action | Select "ABC Properties" in the Agency Summary table |

| Expected | Value |
| --- | --- |
| "Payments Ready for Payment" chart | Shows only ABC Properties READY payment counts by commission type |
| "Parked Payments" chart | Shows only ABC Properties PARKED payment counts by commission type |

---

### 10. Agency selection filters aging report correctly

| Setup | Value |
| --- | --- |
| API response ParkedPaymentsAgingReport | [{ Range: "1-3 Days", PaymentCount: 10, AgencyName: "ABC Properties" }, { Range: "1-3 Days", PaymentCount: 5, AgencyName: "XYZ Realty" }, { Range: "4-7 Days", PaymentCount: 3, AgencyName: "ABC Properties" }] |

| Input | Value |
| --- | --- |
| Action | Select "ABC Properties" in the Agency Summary table |

| Expected | Value |
| --- | --- |
| "Parked Payments Aging Report" | Shows "1-3 Days" (10) and "4-7 Days" (3) — only ABC Properties data |

## Edge and Alternate Examples

### Edge 1. Single agency in the dataset

| Setup | Value |
| --- | --- |
| API response PaymentsByAgency | [{ AgencyName: "Solo Agency", PaymentCount: 20, TotalCommissionCount: 500000, Vat: 75000 }] |

| Input | Value |
| --- | --- |
| Action | Dashboard loads |

| Expected | Value |
| --- | --- |
| Agency Summary table | Displays one row for "Solo Agency" |
| Selecting "Solo Agency" | Dashboard components filter to that agency (same as aggregate since there is only one) |

---

### Edge 2. Agency name with special characters in URL

| Setup | Value |
| --- | --- |
| API response PaymentsByAgency | [{ AgencyName: "Smith & Jones Properties", PaymentCount: 5, TotalCommissionCount: 50000, Vat: 7500 }] |

| Input | Value |
| --- | --- |
| Action | Click "Go" on the "Smith & Jones Properties" row, then confirm in the dialog |

| Expected | Value |
| --- | --- |
| Navigation URL | `/payment-management?agency=Smith%20%26%20Jones%20Properties` (properly URL-encoded) |

---

### Edge 3. Agency with zero payments

| Setup | Value |
| --- | --- |
| API response PaymentsByAgency | [{ AgencyName: "Empty Agency", PaymentCount: 0, TotalCommissionCount: 0, Vat: 0 }] |

| Input | Value |
| --- | --- |
| Action | Dashboard loads |

| Expected | Value |
| --- | --- |
| Row displayed | "Empty Agency", "0", "R 0,00", "R 0,00", "Go" button |

---

### Edge 4. Selecting a different agency switches the filter

| Setup | Value |
| --- | --- |
| User | Signed-in operator with "ABC Properties" currently selected |

| Input | Value |
| --- | --- |
| Action | Click the "XYZ Realty" row |

| Expected | Value |
| --- | --- |
| Previous selection | "ABC Properties" row no longer highlighted |
| New selection | "XYZ Realty" row highlighted |
| Selected agency indicator | Updates to show "XYZ Realty" |
| Dashboard components | Update to show XYZ Realty data only |

---

### Edge 5. Agency filtering when PaymentStatusReport has no data for selected agency

| Setup | Value |
| --- | --- |
| API response PaymentStatusReport | Only contains entries for "XYZ Realty" (no entries for "ABC Properties") |
| API response PaymentsByAgency | Contains both "ABC Properties" and "XYZ Realty" |

| Input | Value |
| --- | --- |
| Action | Select "ABC Properties" in the Agency Summary table |

| Expected | Value |
| --- | --- |
| "Total Value Ready for Payment" | Shows R 0,00 |
| "Total Value of Parked Payments" | Shows R 0,00 |
| Bar charts | Show no data / empty state |
| Aging report | Shows no data / empty state |

## Out of Scope / Not For This Story

- Dashboard charts and summary card rendering (completed in Story 1)
- Loading and error states for the dashboard API call (completed in Story 1)
- "Payments Made (Last 14 Days)" card — was not implemented in Story 1; not in scope for filtering
- Payment Management page functionality (Epic 3) — this story only tests the navigation URL
- Sorting or pagination of the Agency Summary table (not specified in acceptance criteria)
- Search or text filtering within the Agency Summary table (not specified in acceptance criteria)

## Coverage for WRITE-TESTS (AC to Example Mapping)

| Acceptance Criteria | Covered By |
| --- | --- |
| AC-1: Agency Summary table with correct columns | Scenario 1 |
| AC-2: Currency formatting (South African format) | Scenario 1, Scenario 2 |
| AC-3: Number of Payments shows READY count | Scenario 1 |
| AC-4: Default state shows aggregate data | Scenario 4 |
| AC-5: Clicking a row highlights it | Scenario 3 |
| AC-6: Dashboard components filter to selected agency | Scenario 3, Scenario 8, Scenario 9, Scenario 10 |
| AC-7: Deselecting clears filter and returns to aggregate | Scenario 5 |
| AC-8: Selected agency indicator visible | Scenario 3, Scenario 4 (absence) |
| AC-9: "Go" button visible in each row | Scenario 1, Scenario 6 |
| AC-10: "Go" navigates to correct URL | Scenario 6 |
| AC-11: Empty state when no agencies | Scenario 7 |

## Handoff Notes for WRITE-TESTS

- **Mock the dashboard API** (`getDashboard`) as done in Story 1 tests — the Agency Summary data comes from the same `PaymentsByAgency` field in the dashboard response.
- **Agency filtering requires lifting state:** The tests need to verify that selecting an agency row causes the existing chart/card components to re-render with filtered data. The `DashboardContent` component currently renders charts from unfiltered data — implementation will need to add selection state and filtering logic.
- **Test navigation with `router.push` mock:** The "Go" button opens a confirmation dialog (Shadcn AlertDialog) before navigating. Tests should verify the dialog appears on click, that `router.push` is called with the correct URL only after confirming, and that cancelling closes the dialog without navigating.
- **Currency format helper reuse:** The `formatZAR` utility from Story 1 should be reused for the Agency Summary table monetary columns.
- **Row selection visual feedback:** Test that clicking a row applies a visual distinction (e.g., a CSS class or aria attribute). Use accessible queries where possible — consider `aria-selected` on the table row.
- **Filtering data shape:** The `PaymentStatusReport` and `ParkedPaymentsAgingReport` arrays have `AgencyName` fields per the API spec's item schemas. Implementation will filter these arrays by the selected agency name.
