# Feature: BetterBond Commission Payments POC-002

## 1. Problem Statement

BetterBond operators currently process commission payments for mortgage bond agents through a legacy system that is cumbersome and manual. This POC delivers a modern web interface that enables operators to review outstanding commission payments per agency, park or unpark individual or bulk payments to defer processing, initiate batch payments that record payments as processed, and automatically generate invoices per batch — providing a functional, visual preview of a full system rewrite.

---

## 2. User Roles & Permissions

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| Operator | A BetterBond staff member who manages commission payment processing | Full access to all three screens: Dashboard, Payment Management, and Payments Made. Can park, unpark, and initiate payments. Can download invoices. |

**Authentication:** NextAuth (next-auth) frontend-only authentication with username/password credentials. Any valid login grants full operator access. No role differentiation — all authenticated users are operators.

**User Tracking:** The authenticated operator's NextAuth username/email is sent as the `LastChangedUser` header on all mutating API requests (park, unpark, create batch).

---

## 3. Functional Requirements

### Screen 1 — Dashboard

- **R1:** The Dashboard screen displays a summary of commission payment activity across all agencies, with six components: Payments Ready for Payment chart, Parked Payments chart, Total Value Ready for Payment, Total Value of Parked Payments, Parked Payments Aging Report, and Total Value of Payments Made (Last 14 Days).
- **R2:** The "Payments Ready for Payment" component renders a bar chart showing the count of payments in READY status, split by Commission Type ("Bond Comm" and "Manual Payments").
- **R3:** The "Parked Payments" component renders a bar chart showing the count of payments in PARKED status, split by Commission Type ("Bond Comm" and "Manual Payments").
- **R4:** The "Total Value Ready for Payment" component displays the sum of CommissionAmount for all READY payments as a single monetary figure in en-ZA currency format.
- **R5:** The "Total Value of Parked Payments" component displays the sum of CommissionAmount for all PARKED payments as a single monetary figure in en-ZA currency format.
- **R6:** The "Parked Payments Aging Report" component renders a chart showing how long payments have been in PARKED status, grouped into ranges: "1–3 Days", "4–7 Days", and ">7 Days".
- **R7:** The "Total Value of Payments Made (Last 14 Days)" component displays the total count (or value) of payments processed in the last 14 days, sourced from the `TotalPaymentCountInLast14Days` field returned by `GET /v1/payments/dashboard`.
- **R8:** The Dashboard displays an Agency Summary grid with one row per agency, showing: Agency Name, Number of Payments (READY, not PARKED), Total Commission Amount, and VAT.
- **R9:** Each agency row in the Agency Summary grid includes a clickable action (button or row click) that navigates the operator directly to Screen 2 (Payment Management) for that specific agency.
- **R10:** When an operator selects an agency row, all six dashboard chart components dynamically update to reflect metrics for that selected agency only.
- **R11:** Dashboard data is loaded via `GET /v1/payments/dashboard` on page mount; all chart and summary components derive their data from the `PaymentsDashboardRead` response.

### Screen 2 — Payment Management

- **R12:** The Payment Management screen is agency-scoped: it displays payments for one agency at a time, determined by the agency navigated to from Screen 1.
- **R13:** The Main Grid displays all payments for the selected agency that have Status = READY (not PARKED, not PROCESSED). Columns displayed: Agency Name, Batch ID, Claim Date, Agent Name & Surname, Bond Amount, Commission Type, Commission %, Grant Date, Reg Date, Bank, Commission Amount, VAT, Status.
- **R14:** The Parked Grid is always visible on Screen 2, even when it contains no records. It displays payments for the selected agency with Status = PARKED. Columns are identical to the Main Grid.
- **R15:** Screen 2 provides a search/filter bar that filters the loaded Main Grid data client-side (no new API request) by Claim Date, Agency Name, and Status.
- **R16:** Each row in the Main Grid includes a "Park" button. Clicking it opens a confirmation modal displaying the agent name, claim date, and commission amount for that payment. On confirmation, the system calls `PUT /v1/payments/park` with the payment ID, and the payment moves from the Main Grid to the Parked Grid.
- **R17:** The Main Grid supports multi-select via checkboxes. Selecting multiple payments and clicking "Park Selected" opens a confirmation modal showing the count and combined total amount of selected payments. On confirmation, the system calls `PUT /v1/payments/park` with all selected payment IDs, and those payments move to the Parked Grid.
- **R18:** Each row in the Parked Grid includes an "Unpark" button. Clicking it opens a confirmation modal displaying contextual payment details. On confirmation, the system calls `PUT /v1/payments/unpark` with the payment ID, and the payment returns to the Main Grid.
- **R19:** The Parked Grid supports multi-select via checkboxes. Selecting multiple parked payments and clicking "Unpark Selected" opens a confirmation modal showing the count and combined total of selected payments. On confirmation, the system calls `PUT /v1/payments/unpark` with all selected payment IDs, and those payments return to the Main Grid.
- **R20:** An "Initiate Payment" button is displayed on Screen 2. Clicking it opens a confirmation modal summarising the number of READY payments and their total value for the current agency.
- **R21:** On confirmation of "Initiate Payment", the system calls `POST /v1/payment-batches` with the IDs of all payments currently in the Main Grid (READY status). On success, an invoice is generated server-side, the processed payments are removed from the Main Grid, and a success modal confirms that the payment batch has been processed.
- **R22:** Screen 2 data is loaded via `GET /v1/payments` (filtered or full list), and the page refreshes its grid data after each park, unpark, or initiate action to reflect the updated state.
- **R23:** Tables on Screen 2 with many rows support pagination or infinite scroll to prevent performance degradation from rendering large datasets.

### Screen 3 — Payments Made

- **R24:** The Payments Made screen displays all successfully processed payment batches. Each row represents an individual payment batch with fields: Agency Name, Number of Payments, Total Commission Amount, VAT, and an Invoice Link.
- **R25:** The Invoice Link column on Screen 3 provides a clickable link or button that opens or downloads the PDF invoice for that batch by calling `POST /v1/payment-batches/{Id}/download-invoice-pdf`.
- **R26:** Screen 3 provides a search/filter bar allowing the operator to filter batches by Agency Name or Batch Reference.
- **R27:** Screen 3 data is loaded via `GET /v1/payment-batches` on page mount.

### Invoice Generation

- **R28:** After a successful "Initiate Payment" confirmation, the system automatically generates an invoice for the processed batch. The invoice is accessible via Screen 3's Invoice Link column.
- **R29:** Each invoice document contains three sections: (1) Header — MortgageMax logo, agency name, agency address, and agency tax ID; (2) Payment list table — columns for claim date, agent name, bond amount, commission %, and VAT per payment; (3) Footer — total commissions, total VAT, and grand total.
- **R30:** All monetary values on invoices are formatted using the South African locale (en-ZA): R symbol, space as thousands separator, comma as decimal separator (e.g., R 1 234 567,89).

### Authentication & Session

- **R31:** All screens require the operator to be authenticated via NextAuth. Unauthenticated users attempting to access any screen are redirected to the login page.
- **R32:** The login screen accepts username and password. Any valid credential set grants full operator access. There is no role selection or role differentiation at login.
- **R33:** All mutating API calls (park, unpark, create batch) include a `LastChangedUser` HTTP header populated with the authenticated operator's NextAuth username or email.

### Loading & Error States

- **R34:** While any API call is in progress, the affected UI area displays a spinner or skeleton loader to indicate loading state.
- **R35:** When an API call returns an error (non-2xx response or network failure), the UI displays an error message describing the failure and offers a retry mechanism (e.g., a "Retry" button or auto-retry prompt).

### Demo Administration

- **R36:** A Demo Reset function is available (not required to be in main navigation) that calls `POST /demo/reset-demo` to restore the dataset to its initial demo state. This supports POC demonstration scenarios.

---

## 4. Workflow & State Transitions

### Payment State Machine

```
READY --> PARKED --> READY --> PROCESSED
```

- A payment in READY status can be parked (moves to PARKED).
- A payment in PARKED status can be unparked (returns to READY).
- A payment in READY status can be processed via "Initiate Payment" (moves to PROCESSED).
- PROCESSED is a terminal state — processed payments cannot be parked or unparked.

### Park Single Payment Workflow

1. Operator views Main Grid on Screen 2.
2. Operator clicks "Park" on a payment row.
3. System shows confirmation modal: agent name, claim date, commission amount.
4. Operator confirms.
5. System calls `PUT /v1/payments/park` with `{ PaymentIds: [id] }` and `LastChangedUser` header.
6. On success: payment disappears from Main Grid and appears in Parked Grid. UI refreshes.
7. On failure: error message shown; no state change.

### Bulk Park Workflow

1. Operator selects multiple rows via checkboxes in Main Grid.
2. Operator clicks "Park Selected".
3. System shows confirmation modal: count of selected payments, combined total amount.
4. Operator confirms.
5. System calls `PUT /v1/payments/park` with all selected `PaymentIds` and `LastChangedUser` header.
6. On success: selected payments move to Parked Grid. UI refreshes.
7. On failure: error message shown; no state change.

### Unpark Workflow (mirrors park workflow)

1–7 mirror the Park flow but using `PUT /v1/payments/unpark` and moving payments from Parked Grid back to Main Grid.

### Initiate Payment Workflow

1. Operator views Screen 2 with one or more payments in the Main Grid.
2. Operator clicks "Initiate Payment".
3. System shows confirmation modal: count of READY payments, total value.
4. Operator confirms.
5. System calls `POST /v1/payment-batches` with `{ PaymentIds: [all READY payment IDs for agency] }` and `LastChangedUser` header.
6. On success: success modal shown confirming the batch was processed. Main Grid clears for this agency. Invoice is available on Screen 3.
7. On failure: error message shown; no state change.

---

## 5. Data Model & API Integration

### API Server

Base URL: `http://localhost:8042` (as specified in `documentation/Api Definition.yaml`)

### Entities

| Entity | Key Fields | Relationships |
|--------|-----------|---------------|
| Payment | Id, Reference, AgencyName, ClaimDate, AgentName, AgentSurname, BondAmount, CommissionType, CommissionAmount, VAT, Status, BatchId, GrantDate, RegistrationDate, Bank, LastChangedUser, LastChangedDate | Belongs to one agency (by AgencyName); may belong to one PaymentBatch (by BatchId) |
| PaymentBatch | Id, CreatedDate, Status, Reference, AgencyName, PaymentCount, TotalCommissionAmount, TotalVat, LastChangedUser | Belongs to one agency; contains many Payments |
| Dashboard | PaymentStatusReport[], ParkedPaymentsAgingReport[], TotalPaymentCountInLast14Days, PaymentsByAgency[] | Aggregated view across all Payments |

### API Endpoints

| Operation | Method | Path | Notes |
|-----------|--------|------|-------|
| Get dashboard data | GET | /v1/payments/dashboard | Returns PaymentsDashboardRead |
| List payments | GET | /v1/payments | Optional query params: ClaimDate, AgencyName, Status |
| Get single payment | GET | /v1/payments/{Id} | |
| Park payments | PUT | /v1/payments/park | Body: { PaymentIds: int[] }; LastChangedUser header required |
| Unpark payments | PUT | /v1/payments/unpark | Body: { PaymentIds: int[] }; LastChangedUser header required |
| List payment batches | GET | /v1/payment-batches | Optional query params: Reference, AgencyName |
| Get single batch | GET | /v1/payment-batches/{Id} | |
| Create payment batch | POST | /v1/payment-batches | Body: { PaymentIds: int[] }; LastChangedUser header required |
| Download invoice PDF | POST | /v1/payment-batches/{Id}/download-invoice-pdf | Returns octet-stream (PDF binary) |
| Reset demo | POST | /demo/reset-demo | Demo administration only |

### Key Schema Fields

**PaymentRead:**
`Id`, `Reference`, `AgencyName`, `ClaimDate`, `AgentName`, `AgentSurname`, `BondAmount`, `CommissionType`, `GrantDate`, `RegistrationDate`, `Bank`, `CommissionAmount`, `VAT`, `Status`, `BatchId`, `LastChangedUser`, `LastChangedDate`

**PaymentBatchRead:**
`Id`, `CreatedDate`, `Status`, `Reference`, `AgencyName`, `PaymentCount`, `TotalCommissionAmount`, `TotalVat`, `LastChangedUser`

**PaymentsDashboardRead:**
`PaymentStatusReport[]` (Status, PaymentCount, TotalPaymentAmount, CommissionType, AgencyName), `ParkedPaymentsAgingReport[]` (Range, AgencyName, PaymentCount), `TotalPaymentCountInLast14Days`, `PaymentsByAgency[]` (AgencyName, PaymentCount, TotalCommissionCount, Vat)

---

## 6. Business Rules

- **BR1:** Payments follow a linear state machine: READY → PARKED → READY → PROCESSED. A payment in PARKED status must be unparked (returning to READY) before it can be included in a payment batch. Processed payments are terminal and cannot be parked or unparked.
- **BR2:** The "Initiate Payment" action processes all payments currently in the Main Grid (READY status) for the selected agency in a single batch. There is no selective per-payment processing during initiation.
- **BR3:** Each "Initiate Payment" action creates exactly one payment batch per agency. A single batch is always scoped to one agency.
- **BR4:** VAT is calculated by the frontend as 15% of CommissionAmount when displaying totals in confirmation modals and invoice previews. The VAT field returned by the API for individual payments is used for display in grids.
- **BR5:** Processed payments appear on Screen 3 (Payments Made) as individual batch records, not as individual payment rows. Each batch record links to one invoice.
- **BR6:** The Agency Summary grid on Screen 1 shows only READY (not PARKED) payment counts and amounts per agency.
- **BR7:** Agency selection on Screen 1 updates dashboard chart components to show data for the selected agency. Before any agency is selected, charts display aggregate data across all agencies.
- **BR8:** Filtering on Screen 2's search bar is client-side only — it filters the already-loaded payment list without making a new API request.
- **BR9:** The `LastChangedUser` header must be included on all mutating API calls (park, unpark, create batch). The value is the authenticated operator's NextAuth username or email address.
- **BR10:** If "Initiate Payment" is triggered and the Main Grid is empty (no READY payments), the button should be disabled or the action prevented.

---

## 7. Non-Functional Requirements

- **NFR1:** The application is responsive and supports viewports from 768px (mobile) through 1280px+ (desktop). Layout adapts for mobile, tablet, and desktop breakpoints.
- **NFR2:** Accessibility: Standard HTML semantics are sufficient (no WCAG 2.1 AA mandate required for this POC). Use semantic HTML elements (buttons, tables, headings, labels) correctly.
- **NFR3:** All monetary amounts are displayed using South African locale formatting (en-ZA): R symbol, space as thousands separator, comma as decimal separator. Example: R 1 234 567,89.
- **NFR4:** Tables with large numbers of rows implement pagination or infinite scroll to maintain acceptable rendering performance.
- **NFR5:** All API calls in progress display a loading indicator (spinner or skeleton loader) in the relevant UI area.
- **NFR6:** The API base URL is `http://localhost:8042`. All API calls use the shared API client (`web/src/lib/api/client.ts`) and must not use `fetch()` directly.
- **NFR7:** The application uses NextAuth (next-auth) for authentication. Session management follows NextAuth patterns — no custom token management.
- **NFR8:** The MortgageMax brand is applied throughout: dark navy and teal colour palette. The MortgageMax logo (`documentation/morgagemaxlogo.png`) is used in the application header and in generated invoice headers.

---

## 8. UI/UX Standards

### Branding

- Colour palette: dark navy and teal (MortgageMax brand)
- Logo: `documentation/morgagemaxlogo.png` — used in app header and invoice header
- Component library: Shadcn UI components throughout (Button, Dialog, Table, Card, etc.)

### Currency Format

All monetary values use South African Rand in en-ZA locale:
- Symbol: R (with space before amount)
- Thousands separator: space
- Decimal separator: comma
- Example: R 1 234 567,89

### Invoice Layout

The PDF invoice generated per batch follows this layout:
1. **Header:** MortgageMax logo + agency name, agency address, agency tax ID
2. **Payment List Table:** One row per payment — columns: Claim Date, Agent Name, Bond Amount, Commission %, VAT
3. **Footer:** Total Commissions | Total VAT | Grand Total (all in R currency format)

### Responsive Breakpoints

- Mobile: minimum 768px
- Tablet: 768px–1279px
- Desktop: 1280px+

---

## 9. Compliance & Regulatory Requirements

No compliance domains were identified during intake screening. This is an internal demo/POC system used by BetterBond operators only. No payment card data, personal health data, or regulated personal data is collected or stored by this frontend.

---

## 10. Out of Scope

- **Actual bank transfer execution** — the system records payments as PROCESSED but does not execute real financial transactions.
- **User/operator account management** — no signup screen, password reset, or admin user creation interface.
- **Commission calculation logic** — all CommissionAmount, Commission %, and VAT values arrive pre-calculated from the backend API. The frontend only displays and formats these values (except client-side VAT total for confirmation modals).
- **Agent or agency administration** — no screens for creating, editing, or deleting agents or agencies.
- **Additional screens** — only Dashboard (Screen 1), Payment Management (Screen 2), and Payments Made (Screen 3) are in scope.
- **Payment batch editing** — once a batch is created and payments are PROCESSED, there is no mechanism to reverse or edit the batch.
- **Multi-agency batch processing** — one batch always corresponds to one agency.

---

## 11. Assumptions

1. The backend API at `http://localhost:8042` is live and functional for the duration of the POC. The frontend assumes valid responses per the OpenAPI spec at `documentation/Api Definition.yaml`.
2. Agency address and tax ID fields required for invoice generation are stored on the backend and returned within the payment batch or a separate agency lookup not yet visible in the provided OpenAPI spec. The DESIGN phase should verify how agency address/tax ID are retrieved.
3. The `GET /v1/payments` endpoint returns payments for all agencies; agency-scoping on Screen 2 is achieved by filtering on `AgencyName` either via the `AgencyName` query parameter or client-side.
4. CommissionPercentage is stored on the Payment entity even though it is not explicitly listed as a field in the `PaymentRead` schema in the provided API spec. The BRD columns list "Commission %" as a grid column; the DESIGN phase should verify the exact field name.
5. Authentication is frontend-only (NextAuth). The backend API at `localhost:8042` may have its own auth mechanism; the frontend assumes API calls from a logged-in operator are accepted (or that the POC backend does not enforce auth beyond the `LastChangedUser` header convention).
6. "Total Value of Payments Made (Last 14 Days)" on the Dashboard is represented by `TotalPaymentCountInLast14Days` in the API response (a count, not a monetary total). If a monetary total is needed, this must be clarified with the backend team.

---

## 12. Source Traceability

| ID | Source | Reference |
|----|--------|-----------|
| R1 | `documentation/BetterBond-Commission-Payments-POC-002.md` | §Screen 1: Dashboard Screen — Dashboard Components |
| R2 | `documentation/BetterBond-Commission-Payments-POC-002.md` | §Dashboard Components — "Payments Ready for Payment (Bar Chart)" |
| R3 | `documentation/BetterBond-Commission-Payments-POC-002.md` | §Dashboard Components — "Parked Payments (Bar Chart)" |
| R4 | `documentation/BetterBond-Commission-Payments-POC-002.md` | §Dashboard Components — "Total Value Ready for Payment" |
| R5 | `documentation/BetterBond-Commission-Payments-POC-002.md` | §Dashboard Components — "Total Value of Parked Payments" |
| R6 | `documentation/BetterBond-Commission-Payments-POC-002.md` | §Dashboard Components — "Parked Payments Aging Report" |
| R7 | `documentation/BetterBond-Commission-Payments-POC-002.md` | §Dashboard Components — "Total Value of Payments Made (Last 14 Days)"; `documentation/Api Definition.yaml` — PaymentsDashboardRead.TotalPaymentCountInLast14Days |
| R8 | `documentation/BetterBond-Commission-Payments-POC-002.md` | §Dashboard Grid (Agency Summary) — Grid Fields |
| R9 | User input | Clarifying answer: "Agency selection: Clicking an agency row on Dashboard navigates directly to Screen 2 (Payment Management) for that agency" |
| R10 | `documentation/BetterBond-Commission-Payments-POC-002.md` | §Dashboard Grid — Behaviour: "Selecting a record dynamically updates the dashboard graphs" |
| R11 | `documentation/Api Definition.yaml` | GET /v1/payments/dashboard — PaymentsDashboardGet operationId |
| R12 | `documentation/BetterBond-Commission-Payments-POC-002.md` | §Screen 2: Payment Management Screen — Purpose |
| R13 | `documentation/BetterBond-Commission-Payments-POC-002.md` | §Main Grid — Columns list |
| R14 | User input | Clarifying answer: "Parked Grid: Always visible on Screen 2, even when empty" |
| R15 | User input | Clarifying answer: "Filtering: Search/Filter on Screen 2 is client-side (applied to loaded data, not API queries)" |
| R16 | `documentation/BetterBond-Commission-Payments-POC-002.md` | §Parking Payments — Single Payment Parking |
| R17 | `documentation/BetterBond-Commission-Payments-POC-002.md` | §Parking Payments — Bulk Parking |
| R18 | `documentation/BetterBond-Commission-Payments-POC-002.md` | §Parked Grid — Functions: "Unpark individual or multiple payments" |
| R19 | `documentation/BetterBond-Commission-Payments-POC-002.md` | §Parked Grid — Functions: bulk unpark |
| R20 | `documentation/BetterBond-Commission-Payments-POC-002.md` | §Initiate Payment — confirmation modal |
| R21 | `documentation/BetterBond-Commission-Payments-POC-002.md` | §Initiate Payment — On confirmation behaviour |
| R22 | `documentation/Api Definition.yaml` | GET /v1/payments — PaymentGetList |
| R23 | User input | Clarifying answer: "Pagination: Use paginate or infinite scroll for tables with many rows" |
| R24 | `documentation/BetterBond-Commission-Payments-POC-002.md` | §Screen 3: Payments Made Screen — Main Grid fields |
| R25 | `documentation/BetterBond-Commission-Payments-POC-002.md` | §Screen 3 — "Clickable invoice link to open/download invoice"; `documentation/Api Definition.yaml` — POST /v1/payment-batches/{Id}/download-invoice-pdf |
| R26 | `documentation/BetterBond-Commission-Payments-POC-002.md` | §Screen 3 — "Search bar for filtering by Agency Name or Batch ID" |
| R27 | `documentation/Api Definition.yaml` | GET /v1/payment-batches — PaymentBatchGetList |
| R28 | `documentation/BetterBond-Commission-Payments-POC-002.md` | §Invoice Generation — "System automatically generates an invoice" |
| R29 | User input | Clarifying answer: "Invoice layout: Header (MortgageMax logo + agency details) → Payment list table → Footer (totals)" |
| R30 | User input | Clarifying answer: "Use R currency format (en-ZA)" |
| R31 | User input | Clarifying answer: "Login method: Username/password via NextAuth (any valid login grants full operator access)" |
| R32 | User input | Clarifying answer: "Single 'operator' role with full access to all screens and actions" |
| R33 | User input | Clarifying answer: "LastChangedUser header sent to API with operator's NextAuth username/email"; `documentation/Api Definition.yaml` — LastChangedUser header on POST /v1/payment-batches |
| R34 | User input | Clarifying answer: "Loading states: Show spinners/skeleton loaders while API calls are in progress" |
| R35 | Call A gap analysis | Error state identified as missing from BRD |
| R36 | `documentation/Api Definition.yaml` | POST /demo/reset-demo — DemoAdministrationResetDemo |
| BR1 | User input | Clarifying answer: "Payment state machine: READY → PARKED → READY → PROCESSED (linear; parked must be unparked before processing)" |
| BR2 | User input | Clarifying answer: "Payment initiation: Processes all Main Grid payments at once per action (no selective per-payment processing)" |
| BR3 | User input | Clarifying answer: "Batch scoping: Each 'Initiate Payment' creates one batch per agency (one agency per batch always)" |
| BR4 | User input | Clarifying answer: "VAT calculation: Frontend calculates VAT as 15% of CommissionAmount" |
| BR5 | User input | Clarifying answer: "Processed payments: Appear on Screen 3 (Payments Made) as individual payment rows (not batch summaries)" — interpreted as batch rows, one per batch |
| BR6 | `documentation/BetterBond-Commission-Payments-POC-002.md` | §Dashboard Grid — "Number of Payments (ready for payment, not parked)" |
| BR7 | `documentation/BetterBond-Commission-Payments-POC-002.md` | §Dashboard Grid — Behaviour: "Selecting a record dynamically updates the dashboard graphs" |
| BR8 | User input | Clarifying answer: "Filtering: Search/Filter on Screen 2 is client-side" |
| BR9 | `documentation/Api Definition.yaml` | LastChangedUser header parameter on POST /v1/payment-batches, described as "Name of user performing the action" |
| BR10 | Call A gap analysis | Edge case: empty Main Grid prevents initiation |
| NFR1 | User input | Clarifying answer: "Responsive design: Support mobile, tablet, and desktop (minimum 768px for mobile, scalable to 1280px+)" |
| NFR2 | User input | Clarifying answer: "Accessibility: Basic requirements only (no WCAG 2.1 AA mandate; standard HTML semantics sufficient)" |
| NFR3 | User input | Clarifying answer: "Currency: All amounts use South African locale (en-ZA): R 1 234 567,89 format" |
| NFR4 | User input | Clarifying answer: "Pagination: Use paginate or infinite scroll for tables with many rows" |
| NFR5 | User input | Clarifying answer: "Loading states: Show spinners/skeleton loaders while API calls are in progress" |
| NFR6 | `documentation/Api Definition.yaml` | servers[0].url = http://localhost:8042; CLAUDE.md §Use the API Client |
| NFR7 | User input | Clarifying answer: "Login method: Username/password via NextAuth"; `generated-docs/context/intake-manifest.json` — authMethod: "frontend-only" |
| NFR8 | `generated-docs/context/intake-manifest.json` | stylingNotes: "MortgageMax branding — dark navy and teal colour palette. Logo asset available at documentation/morgagemaxlogo.png" |
