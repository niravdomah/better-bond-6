# Story: Payment Grids with Park and Unpark Workflows

**Epic:** Payment Management (Screen 2) | **Story:** 1 of 2 | **Wireframe:** `generated-docs/specs/wireframes/03-payment-management.md`

## Story Metadata
| Field | Value |
|-------|-------|
| **Route** | `/payment-management?agency={agencyName}` |
| **Target File** | `app/(protected)/payment-management/page.tsx` |
| **Page Action** | `modify_existing` |

## User Story
**As an** operator **I want** to view all READY and parked payments for a specific agency, filter them, and park or unpark individual or multiple payments **so that** I can manage which payments are deferred and which are ready for processing.

## Acceptance Criteria

### Page Structure & Agency Scoping (R12)
- [ ] AC-1: Given I navigate from the Dashboard to Payment Management for an agency, when the page loads, then I see a heading "Payment Management -- {Agency Name}" where {Agency Name} matches the agency I selected
- [ ] AC-2: Given no `agency` query parameter is provided in the URL, when the page loads, then I am redirected back to the Dashboard

### Data Loading (R22, R34, R35)
- [ ] AC-3: Given I am on the Payment Management page for an agency, when the page first loads, then the app fetches payment data from `GET /v1/payments?AgencyName={agencyName}`
- [ ] AC-4: Given the payment data is loading, when I look at the page, then I see skeleton loading placeholders in both the Main Grid and Parked Grid areas
- [ ] AC-5: Given the payment data API call fails, when I look at the page, then I see an error message explaining something went wrong with a Retry button
- [ ] AC-6: Given I see an error message, when I click the Retry button, then the app re-fetches the payment data

### Main Grid - READY Payments (R13)
- [ ] AC-7: Given payment data has loaded, when I look at the Main Grid, then I see all payments with Status = READY (not PARKED, not PROCESSED) for the selected agency
- [ ] AC-8: Given payment data has loaded, when I look at the Main Grid columns, then I see: Agency Name, Batch ID, Claim Date, Agent Name & Surname, Bond Amount, Commission Type, Commission %, Grant Date, Reg Date, Bank, Commission Amount, VAT, Status
- [ ] AC-9: Given the Main Grid has payments, when I look at the grid header, then I see the count of READY payments displayed (e.g., "Ready Payments (12)")

### Parked Grid (R14)
- [ ] AC-10: Given payment data has loaded, when I look at the Parked Grid, then I see all payments with Status = PARKED for the selected agency, with the same columns as the Main Grid
- [ ] AC-11: Given there are no parked payments for the agency, when I look at the Parked Grid section, then the Parked Grid is still visible with an empty state message (e.g., "No parked payments")

### Client-Side Filtering (R15)
- [ ] AC-12: Given payment data has loaded, when I type in the search/filter bar, then the Main Grid filters client-side (no new API request) to show only matching rows
- [ ] AC-13: Given a filter bar with Claim Date, Agency Name, and Status fields, when I apply filters, then only rows matching the filter criteria are shown in the Main Grid

### Single Park (R16)
- [ ] AC-14: Given I see a payment row in the Main Grid, when I click the "Park" button on that row, then a confirmation modal appears showing the agent name, claim date, and commission amount for that payment
- [ ] AC-15: Given the park confirmation modal is open, when I click "Confirm Park", then the app calls `PUT /v1/payments/park` with `{ PaymentIds: [paymentId] }` and the `LastChangedUser` header set to my username
- [ ] AC-16: Given the park API call succeeds, when the response returns, then the payment disappears from the Main Grid and appears in the Parked Grid without a full page reload
- [ ] AC-17: Given the park confirmation modal is open, when I click "Cancel", then the modal closes and no API call is made

### Bulk Park (R17)
- [ ] AC-18: Given the Main Grid has payments, when I select multiple rows using checkboxes, then a "Park Selected" button becomes enabled
- [ ] AC-19: Given I have selected multiple payments, when I click "Park Selected", then a confirmation modal appears showing the count of selected payments and their combined total commission amount
- [ ] AC-20: Given the bulk park confirmation modal is open, when I click "Confirm Park", then the app calls `PUT /v1/payments/park` with all selected payment IDs and the `LastChangedUser` header
- [ ] AC-21: Given the bulk park API call succeeds, when the response returns, then all selected payments move from the Main Grid to the Parked Grid

### Single Unpark (R18)
- [ ] AC-22: Given I see a payment row in the Parked Grid, when I click the "Unpark" button on that row, then a confirmation modal appears showing the agent name, claim date, and commission amount
- [ ] AC-23: Given the unpark confirmation modal is open, when I click "Confirm Unpark", then the app calls `PUT /v1/payments/unpark` with `{ PaymentIds: [paymentId] }` and the `LastChangedUser` header
- [ ] AC-24: Given the unpark API call succeeds, when the response returns, then the payment disappears from the Parked Grid and appears in the Main Grid

### Bulk Unpark (R19)
- [ ] AC-25: Given the Parked Grid has payments, when I select multiple rows using checkboxes, then an "Unpark Selected" button becomes enabled
- [ ] AC-26: Given I have selected multiple parked payments, when I click "Unpark Selected", then a confirmation modal appears showing the count and combined total of selected payments
- [ ] AC-27: Given the bulk unpark confirmation modal is open, when I click "Confirm Unpark", then the app calls `PUT /v1/payments/unpark` with all selected payment IDs and the `LastChangedUser` header
- [ ] AC-28: Given the bulk unpark API call succeeds, when the response returns, then all selected payments return to the Main Grid

### Data Refresh After Mutations (R22)
- [ ] AC-29: Given a park, unpark, or bulk operation completes successfully, when the grid updates, then both the Main Grid and Parked Grid reflect the current state by re-fetching from `GET /v1/payments?AgencyName={agencyName}`

### Pagination (R23)
- [ ] AC-30: Given the Main Grid has more rows than the page size, when I look at the bottom of the grid, then I see pagination controls (Previous/Next) to navigate between pages

### Loading State During Mutations (R34)
- [ ] AC-31: Given I have confirmed a park or unpark action, when the API call is in progress, then a loading indicator is shown to indicate the action is being processed

### Error State During Mutations (R35)
- [ ] AC-32: Given I have confirmed a park or unpark action, when the API call fails, then I see an error message describing the failure and no payment state changes in the grids

## FRS Traceability
| AC | FRS Requirement |
|----|----------------|
| AC-1, AC-2 | R12 |
| AC-3, AC-29 | R22 |
| AC-4, AC-31 | R34 |
| AC-5, AC-6, AC-32 | R35 |
| AC-7, AC-8, AC-9 | R13 |
| AC-10, AC-11 | R14 |
| AC-12, AC-13 | R15 |
| AC-14, AC-15, AC-16, AC-17 | R16 |
| AC-18, AC-19, AC-20, AC-21 | R17 |
| AC-22, AC-23, AC-24 | R18 |
| AC-25, AC-26, AC-27, AC-28 | R19 |
| AC-30 | R23 |
| AC-15, AC-20, AC-23, AC-27 | R33 |

## API Endpoints (from OpenAPI spec)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/v1/payments?AgencyName={agencyName}` | Fetch all payments for the selected agency; split into READY (Main Grid) and PARKED (Parked Grid) client-side based on `Status` field |
| PUT | `/v1/payments/park` | Park one or more payments. Body: `{ PaymentIds: int[] }`. Include `LastChangedUser` header (R33). Note: header not in OpenAPI spec for this endpoint but required by FRS |
| PUT | `/v1/payments/unpark` | Unpark one or more payments. Body: `{ PaymentIds: int[] }`. Include `LastChangedUser` header (R33). Note: header not in OpenAPI spec for this endpoint but required by FRS |

## Implementation Notes
- Replace the existing placeholder content in `app/(protected)/payment-management/page.tsx` with the full Payment Management implementation.
- Read `agency` from the URL search params (`useSearchParams`). If absent, redirect to `/` (Dashboard).
- Use the API client (`lib/api/client.ts`) for all API calls. Define endpoint functions in `lib/api/endpoints.ts`.
- `GET /v1/payments` returns `PaymentReadList` with a `PaymentList` array of `PaymentRead` objects. Filter client-side by `Status` to split into READY and PARKED grids.
- The `PaymentRead` schema fields: Id, Reference, AgencyName, ClaimDate, AgentName, AgentSurname, BondAmount, CommissionType, GrantDate, RegistrationDate, Bank, CommissionAmount, VAT, Status, BatchId, LastChangedUser, LastChangedDate. Note: no `CommissionPercentage` field exists in the API schema — "Commission %" column should display what is available or be omitted if the field is not returned.
- Client-side filtering (R15/BR8): filter the loaded payment list without making new API requests. Filter bar fields: search text, Claim Date, Status.
- Currency formatting: use `Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' })` for commission amounts in modals and grid.
- Use Shadcn `<Table>`, `<Checkbox>`, `<Button>`, `<Dialog>`, `<Input>`, `<Select>`, `<Skeleton>` components.
- The `LastChangedUser` header value comes from the authenticated operator's NextAuth session (username or email).
- After each mutation (park/unpark), re-fetch `GET /v1/payments?AgencyName={agencyName}` to refresh both grids.
- Pagination: implement client-side pagination for the Main Grid with configurable page size.
- Wireframe reference: `generated-docs/specs/wireframes/03-payment-management.md` shows exact layout with filter bar, Main Grid with Park/Park Selected buttons, and Parked Grid with Unpark/Unpark Selected buttons.
