# Test Design: Dashboard with Charts and Summary Cards

## Story Summary

**Epic:** 2
**Story:** 1
**As an** operator
**I want to** see a dashboard with charts and summary cards showing commission payment activity
**So that** I can quickly assess the current state of ready, parked, and recently processed payments.

## Review Purpose

This document presents concrete business examples for BA review before executable tests are written.

Its purpose is to:
- surface missing business decisions
- let the BA review behavior using examples and expected outcomes
- provide an approved source for downstream test generation

## Business Behaviors Identified

- Dashboard page loads data from the API and displays six components: two monetary summary cards, two bar charts by commission type, one aging report chart, and one "last 14 days" metric card
- While data is loading, skeleton placeholders are shown for every card and chart
- If the API call fails, an error banner is displayed with a Retry button
- Clicking Retry re-fetches the dashboard data
- Monetary values are formatted in South African currency (R with space-separated thousands and comma decimal)
- Bar charts split payment counts by commission type ("Bond Comm" and "Manual Payments")
- Aging report groups parked payments into "1-3 Days", "4-7 Days", and ">7 Days" buckets
- Dashboard layout uses a two-column grid on desktop and single-column on mobile
- A "Dashboard" heading is visible at the top of the page

## Key Decisions Surfaced by AI

- **Currency formatting edge case:** The story specifies `Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' })`. The FRS says "R 1 234 567,89" format. The `en-ZA` Intl formatter produces "R" followed by a non-breaking space. The examples below use the FRS-specified format. No BA decision needed unless the exact whitespace character matters for display.
- **Zero-value handling:** The story does not specify what happens when all payment amounts are zero (e.g., no READY or PARKED payments). The examples below assume zero values are displayed as "R 0,00" and bar charts show zero-height bars or empty charts. This seems reasonable but is surfaced for awareness.
- **Agency Summary grid is out of scope for this story.** Story 2 covers the Agency Summary grid. This story fetches `PaymentsByAgency` data but does not render it.

## Test Scenarios / Review Examples

### 1. Dashboard loads and displays all six components

| Setup | Value |
| --- | --- |
| User | Signed-in operator |
| API response | `PaymentStatusReport` has 4 items (READY/Bond Comm, READY/Manual, PARKED/Bond Comm, PARKED/Manual), `ParkedPaymentsAgingReport` has 3 items, `TotalPaymentCountInLast14Days` = 42 |

| Input | Value |
| --- | --- |
| Action | Navigate to Dashboard (route `/`) |

| Expected | Value |
| --- | --- |
| "Dashboard" heading | Visible at top of page |
| "Total Value Ready for Payment" card | Shows R 1 234 567,89 (sum of READY TotalPaymentAmount values) |
| "Total Value of Parked Payments" card | Shows R 234 567,89 (sum of PARKED TotalPaymentAmount values) |
| "Payments Ready for Payment" chart | Bar chart visible with bars for "Bond Comm" and "Manual Payments" |
| "Parked Payments" chart | Bar chart visible with bars for "Bond Comm" and "Manual Payments" |
| "Parked Payments Aging Report" chart | Bar chart visible with bars for "1-3 Days", "4-7 Days", ">7 Days" |
| "Payments Made (Last 14 Days)" card | Shows "42" |

---

### 2. Loading state shows skeleton placeholders

| Setup | Value |
| --- | --- |
| User | Signed-in operator |
| API response | Delayed (still loading) |

| Input | Value |
| --- | --- |
| Action | Navigate to Dashboard |

| Expected | Value |
| --- | --- |
| Skeleton placeholders | Visible for each of the six card/chart areas |
| Actual data | Not yet displayed |

---

### 3. API failure shows error banner with Retry

| Setup | Value |
| --- | --- |
| User | Signed-in operator |
| API response | Returns HTTP 500 error |

| Input | Value |
| --- | --- |
| Action | Navigate to Dashboard |

| Expected | Value |
| --- | --- |
| Error banner | Visible, explains something went wrong |
| Retry button | Visible within the error banner |
| Dashboard components | Not displayed |

---

### 4. Clicking Retry re-fetches data successfully

| Setup | Value |
| --- | --- |
| User | Signed-in operator, error banner currently displayed |
| API response on retry | Returns valid dashboard data |

| Input | Value |
| --- | --- |
| Action | Click the Retry button |

| Expected | Value |
| --- | --- |
| Error banner | Disappears |
| Dashboard components | All six components render with data |

---

### 5. Currency formatting for monetary cards

| Setup | Value |
| --- | --- |
| API response | READY payments: TotalPaymentAmount = 1234567.89 (summed), PARKED payments: TotalPaymentAmount = 234567.89 (summed) |

| Input | Value |
| --- | --- |
| Action | Dashboard loads |

| Expected | Value |
| --- | --- |
| "Total Value Ready for Payment" | Displays "R 1 234 567,89" |
| "Total Value of Parked Payments" | Displays "R 234 567,89" |

---

### 6. Bar chart data derived from PaymentStatusReport

| Setup | Value |
| --- | --- |
| API response PaymentStatusReport | [{ Status: "READY", CommissionType: "Bond Registration Commission", PaymentCount: 15 }, { Status: "READY", CommissionType: "Manual Payments", PaymentCount: 8 }, { Status: "PARKED", CommissionType: "Bond Registration Commission", PaymentCount: 5 }, { Status: "PARKED", CommissionType: "Manual Payments", PaymentCount: 3 }] |

| Input | Value |
| --- | --- |
| Action | Dashboard loads |

| Expected | Value |
| --- | --- |
| "Payments Ready" chart | Shows "Bond Comm" bar with count 15, "Manual Payments" bar with count 8 |
| "Parked Payments" chart | Shows "Bond Comm" bar with count 5, "Manual Payments" bar with count 3 |

---

### 7. Aging report displays three range buckets

| Setup | Value |
| --- | --- |
| API response ParkedPaymentsAgingReport | [{ Range: "1-3 Days", PaymentCount: 10 }, { Range: "4-7 Days", PaymentCount: 6 }, { Range: ">7 Days", PaymentCount: 2 }] |

| Input | Value |
| --- | --- |
| Action | Dashboard loads |

| Expected | Value |
| --- | --- |
| "Parked Payments Aging Report" chart | Shows bars for "1-3 Days" (10), "4-7 Days" (6), ">7 Days" (2) |

---

### 8. Responsive layout - desktop two-column, mobile single-column

| Setup | Value |
| --- | --- |
| User | Signed-in operator |
| Dashboard data | Loaded successfully |

| Input | Value |
| --- | --- |
| Viewport - desktop | Large screen (>= 1024px) |
| Viewport - mobile | Small screen (< 1024px) |

| Expected | Value |
| --- | --- |
| Desktop | Cards and charts arranged in a two-column grid |
| Mobile | Cards and charts stack into a single column |

## Edge and Alternate Examples

### Edge 1. All payment amounts are zero

| Setup | Value |
| --- | --- |
| API response | PaymentStatusReport items all have TotalPaymentAmount = 0 and PaymentCount = 0. TotalPaymentCountInLast14Days = 0. |

| Input | Value |
| --- | --- |
| Action | Dashboard loads |

| Expected | Value |
| --- | --- |
| "Total Value Ready for Payment" | Displays "R 0,00" |
| "Total Value of Parked Payments" | Displays "R 0,00" |
| "Payments Made (Last 14 Days)" | Shows "0" |
| Bar charts | Render with no visible bars (or zero-height bars) |

---

### Edge 2. Only one commission type exists in data

| Setup | Value |
| --- | --- |
| API response PaymentStatusReport | Only "Bond Registration Commission" entries (no "Manual Payments" items) |

| Input | Value |
| --- | --- |
| Action | Dashboard loads |

| Expected | Value |
| --- | --- |
| "Payments Ready" chart | Shows only a "Bond Comm" bar |
| "Parked Payments" chart | Shows only a "Bond Comm" bar |

---

### Edge 3. Empty aging report

| Setup | Value |
| --- | --- |
| API response ParkedPaymentsAgingReport | Empty array (no parked payments) |

| Input | Value |
| --- | --- |
| Action | Dashboard loads |

| Expected | Value |
| --- | --- |
| "Parked Payments Aging Report" chart | Renders but shows no bars (empty state) |

## Out of Scope / Not For This Story

- Agency Summary grid rendering (covered in Story 2)
- Agency row selection filtering dashboard components (covered in Story 2, per R10)
- Navigation to Payment Management from agency row (covered in Story 2, per R9)
- Agency dropdown/selector for filtering (covered in Story 2)
- Any park/unpark/initiate payment functionality (Epic 3)
