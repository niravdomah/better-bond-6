# Test Design: Payment Grids with Park and Unpark Workflows

## Story Summary

**Epic:** 3
**Story:** 1
**As an** operator
**I want to** view all READY and parked payments for a specific agency, filter them, and park or unpark individual or multiple payments
**So that** I can manage which payments are deferred and which are ready for processing.

## Review Purpose

This document presents concrete business examples for BA review before executable tests are written.

Its purpose is to:
- surface missing business decisions
- let the BA review behavior using examples and expected outcomes
- provide an approved source for downstream test generation

## Business Behaviors Identified

- The page is agency-scoped: it reads the agency name from the URL and displays a heading "Payment Management -- {Agency Name}"
- If no agency is provided in the URL, the user is redirected to the Dashboard
- Payment data is fetched from the API and split into two grids: Main Grid (READY payments) and Parked Grid (PARKED payments)
- Both grids display the same columns: Agency Name, Batch ID, Claim Date, Agent Name & Surname, Bond Amount, Commission Type, Grant Date, Reg Date, Bank, Commission Amount, VAT, Status
- The Main Grid header shows the count of READY payments (e.g., "Ready Payments (12)")
- The Parked Grid is always visible, even when empty (shows an empty state message)
- A search/filter bar above the Main Grid filters rows client-side (no new API call) by search text, Claim Date, and Status
- Each row in the Main Grid has a "Park" button that opens a confirmation modal with agent name, claim date, and commission amount
- Confirming park calls the park API with the payment ID and LastChangedUser header
- After parking, the payment moves from the Main Grid to the Parked Grid (via data re-fetch)
- Multiple rows can be selected via checkboxes; "Park Selected" opens a bulk confirmation modal showing count and total commission
- Each row in the Parked Grid has an "Unpark" button with similar confirmation flow
- Multiple parked rows can be selected; "Unpark Selected" opens a bulk unpark confirmation
- After any mutation, both grids are refreshed by re-fetching from the API
- The Main Grid supports pagination when there are many rows
- A loading skeleton is shown while data is being fetched
- An error message with a Retry button is shown if the API call fails
- A loading indicator is shown during park/unpark API calls
- If a park/unpark API call fails, an error message is displayed and no payment state changes

## Key Decisions Surfaced by AI

- **Commission % column (AC-8):** The API's `PaymentRead` schema does not include a `CommissionPercentage` field. The column has been omitted from the grids since there is no data source for it. This was confirmed during QA.
- **Filter bar fields (AC-12, AC-13):** The story mentions "search/filter bar" with "Claim Date, Agency Name, and Status" fields (AC-13), but the implementation notes say "filter bar fields: search text, Claim Date, Status." Since the page is already agency-scoped (only one agency's data is shown), filtering by Agency Name within the grid seems redundant. The examples below use a text search, Claim Date, and Status filter. BA should confirm whether Agency Name filter is needed.
- **Pagination scope (AC-30):** The story specifies pagination for the Main Grid only. The Parked Grid does not mention pagination. The examples below test pagination only on the Main Grid. BA should confirm if the Parked Grid should also be paginated.
- **LastChangedUser header source (AC-15, AC-20, AC-23, AC-27):** The story says this value comes from the authenticated operator's NextAuth session. The examples assume this header is automatically included in all park/unpark API calls.

## Test Scenarios / Review Examples

### 1. Page loads with agency-scoped heading and payment data

| Setup | Value |
| --- | --- |
| Signed-in operator | "operator1" |
| URL | `/payment-management?agency=ABC Properties` |
| API response (GET /v1/payments?AgencyName=ABC Properties) | 3 READY payments and 1 PARKED payment |

| Input | Value |
| --- | --- |
| Action | Page loads |

| Expected | Value |
| --- | --- |
| Page heading | "Payment Management -- ABC Properties" |
| Main Grid header | "Ready Payments (3)" |
| Main Grid rows | 3 rows, each showing: Agency Name, Batch ID, Claim Date, Agent Name & Surname, Bond Amount, Commission Type, Grant Date, Reg Date, Bank, Commission Amount, VAT, Status |
| Parked Grid | 1 row with the same column structure |

---

### 2. Redirect to Dashboard when no agency parameter is provided

| Setup | Value |
| --- | --- |
| Signed-in operator | "operator1" |
| URL | `/payment-management` (no agency query parameter) |

| Input | Value |
| --- | --- |
| Action | Page loads |

| Expected | Value |
| --- | --- |
| Redirect | User is redirected to the Dashboard (`/`) |

---

### 3. Loading skeleton displayed while data is being fetched

| Setup | Value |
| --- | --- |
| Signed-in operator | "operator1" |
| URL | `/payment-management?agency=ABC Properties` |
| API response | Delayed (still loading) |

| Input | Value |
| --- | --- |
| Action | Page loads |

| Expected | Value |
| --- | --- |
| Main Grid area | Skeleton loading placeholders visible |
| Parked Grid area | Skeleton loading placeholders visible |

---

### 4. Error state with Retry button when API call fails

| Setup | Value |
| --- | --- |
| Signed-in operator | "operator1" |
| URL | `/payment-management?agency=ABC Properties` |
| API response | Error (e.g., 500 Internal Server Error) |

| Input | Value |
| --- | --- |
| Action | Page loads |

| Expected | Value |
| --- | --- |
| Error message | Visible, explaining something went wrong |
| Retry button | Visible |

| Input | Value |
| --- | --- |
| Action | Click "Retry" button |

| Expected | Value |
| --- | --- |
| API call | Re-fetched (GET /v1/payments called again) |

---

### 5. Parked Grid shows empty state when no payments are parked

| Setup | Value |
| --- | --- |
| API response | 5 READY payments, 0 PARKED payments |

| Input | Value |
| --- | --- |
| Action | Page loads |

| Expected | Value |
| --- | --- |
| Main Grid | 5 rows displayed |
| Parked Grid | Visible with empty state message (e.g., "No parked payments") |

---

### 6. Client-side text search filters Main Grid rows

| Setup | Value |
| --- | --- |
| API response | READY payments including: John Smith (Batch 1001), Jane Doe (Batch 1002), Bob Johnson (Batch 1003) |

| Input | Value |
| --- | --- |
| Action | Type "John" in the search bar |

| Expected | Value |
| --- | --- |
| Main Grid | Shows 2 rows: John Smith and Bob Johnson (matching "John" in the agent name) |
| API calls | No new API request made |

---

### 7. Single park: confirmation modal, confirm, and grid update

| Setup | Value |
| --- | --- |
| API response | READY payment: Agent "John Smith", Claim Date "2026-01-15", Commission Amount R 42 000,00 |

| Input | Value |
| --- | --- |
| Action | Click "Park" button on John Smith's row |

| Expected | Value |
| --- | --- |
| Confirmation modal | Visible, showing: Agent: John Smith, Claim Date: 2026-01-15, Commission: R 42 000,00 |
| Modal buttons | "Cancel" and "Confirm Park" |

| Input | Value |
| --- | --- |
| Action | Click "Confirm Park" |

| Expected | Value |
| --- | --- |
| API call | PUT /v1/payments/park with { PaymentIds: [paymentId] } and LastChangedUser header |
| Loading indicator | Shown while API call is in progress |
| After success | John Smith's payment disappears from Main Grid and appears in Parked Grid |
| Data refresh | Both grids updated via re-fetch from GET /v1/payments |

---

### 8. Single park: cancel does not make API call

| Setup | Value |
| --- | --- |
| API response | READY payment for John Smith |

| Input | Value |
| --- | --- |
| Action | Click "Park" on John Smith's row, then click "Cancel" in the modal |

| Expected | Value |
| --- | --- |
| Modal | Closes |
| API call | No PUT /v1/payments/park request made |
| Main Grid | John Smith's row remains unchanged |

---

### 9. Bulk park: select multiple, confirm, and grid update

| Setup | Value |
| --- | --- |
| API response | 5 READY payments with commissions: R 10 000, R 20 000, R 30 000, R 40 000, R 50 000 |

| Input | Value |
| --- | --- |
| Action | Select checkboxes for payment 1 (R 10 000) and payment 3 (R 30 000) |

| Expected | Value |
| --- | --- |
| "Park Selected" button | Becomes enabled |

| Input | Value |
| --- | --- |
| Action | Click "Park Selected" |

| Expected | Value |
| --- | --- |
| Bulk confirmation modal | Shows: "Park 2 payments?" and total commission: R 40 000,00 |

| Input | Value |
| --- | --- |
| Action | Click "Confirm Park" |

| Expected | Value |
| --- | --- |
| API call | PUT /v1/payments/park with { PaymentIds: [id1, id3] } and LastChangedUser header |
| After success | Both selected payments move from Main Grid to Parked Grid |

---

### 10. Single unpark: confirmation modal and grid update

| Setup | Value |
| --- | --- |
| API response | PARKED payment: Agent "Jane Doe", Claim Date "2026-01-20", Commission Amount R 17 800,00 |

| Input | Value |
| --- | --- |
| Action | Click "Unpark" button on Jane Doe's row in the Parked Grid |

| Expected | Value |
| --- | --- |
| Confirmation modal | Visible, showing: Agent: Jane Doe, Claim Date: 2026-01-20, Commission: R 17 800,00 |

| Input | Value |
| --- | --- |
| Action | Click "Confirm Unpark" |

| Expected | Value |
| --- | --- |
| API call | PUT /v1/payments/unpark with { PaymentIds: [paymentId] } and LastChangedUser header |
| After success | Jane Doe's payment moves from Parked Grid back to Main Grid |

---

### 11. Bulk unpark: select multiple and confirm

| Setup | Value |
| --- | --- |
| API response | 3 PARKED payments with commissions: R 5 000, R 15 000, R 25 000 |

| Input | Value |
| --- | --- |
| Action | Select all 3 parked payments using checkboxes |

| Expected | Value |
| --- | --- |
| "Unpark Selected" button | Becomes enabled |

| Input | Value |
| --- | --- |
| Action | Click "Unpark Selected" |

| Expected | Value |
| --- | --- |
| Bulk confirmation modal | Shows: "Unpark 3 payments?" and total commission: R 45 000,00 |

| Input | Value |
| --- | --- |
| Action | Click "Confirm Unpark" |

| Expected | Value |
| --- | --- |
| API call | PUT /v1/payments/unpark with all 3 payment IDs and LastChangedUser header |
| After success | All 3 payments return to the Main Grid |

## Edge and Alternate Examples

### Edge 1. Park API call fails -- error displayed, no state change

| Setup | Value |
| --- | --- |
| API park response | Error (e.g., 500 Internal Server Error) |

| Input | Value |
| --- | --- |
| Action | Click "Park" on a payment, then "Confirm Park" |

| Expected | Value |
| --- | --- |
| Error message | Visible, describing the failure |
| Main Grid | Payment remains in Main Grid (not moved to Parked Grid) |

---

### Edge 2. Pagination on Main Grid with many rows

| Setup | Value |
| --- | --- |
| API response | 25 READY payments (more than one page) |

| Input | Value |
| --- | --- |
| Action | Page loads |

| Expected | Value |
| --- | --- |
| Main Grid | Shows first page of rows (e.g., 10 per page) |
| Pagination controls | "Previous" and "Next" buttons visible below the grid |

| Input | Value |
| --- | --- |
| Action | Click "Next" |

| Expected | Value |
| --- | --- |
| Main Grid | Shows next page of rows |

---

### Edge 3. Loading indicator during park/unpark mutation

| Setup | Value |
| --- | --- |
| API park response | Delayed (in progress) |

| Input | Value |
| --- | --- |
| Action | Confirm a park action |

| Expected | Value |
| --- | --- |
| Loading indicator | Visible while the API call is in progress |

---

### Edge 4. "Park Selected" button disabled when no rows selected

| Setup | Value |
| --- | --- |
| API response | 5 READY payments, none selected |

| Input | Value |
| --- | --- |
| Action | Page loads (no checkboxes checked) |

| Expected | Value |
| --- | --- |
| "Park Selected" button | Disabled |

> **BA decision required:** Should the "Park Selected" button be hidden entirely when no rows are selected, or visible but disabled?
>
> Options:
> - Option A: Visible but disabled (greyed out)
> - Option B: Hidden entirely until at least one row is selected

---

### Edge 5. Both grids empty (no READY and no PARKED payments)

| Setup | Value |
| --- | --- |
| API response | 0 READY payments, 0 PARKED payments |

| Input | Value |
| --- | --- |
| Action | Page loads |

| Expected | Value |
| --- | --- |
| Main Grid header | "Ready Payments (0)" |
| Main Grid | Empty state or no rows displayed |
| Parked Grid | Visible with empty state message (e.g., "No parked payments") |

## Out of Scope / Not For This Story

- "Initiate Payment" button and payment batch processing (Story 2)
- Payments Made modal/dialog functionality (Epic 4)
- Column sorting within grids (not specified in acceptance criteria)
- Server-side filtering or pagination (story specifies client-side for both)
- Dashboard page behavior (Epic 2, completed)
- Authentication and login flow (Epic 1, completed)
