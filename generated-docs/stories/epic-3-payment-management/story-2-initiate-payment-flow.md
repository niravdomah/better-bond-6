# Story: Initiate Payment Flow

**Epic:** Payment Management (Screen 2) | **Story:** 2 of 2 | **Wireframe:** `generated-docs/specs/wireframes/03-payment-management.md`

## Story Metadata
| Field | Value |
|-------|-------|
| **Route** | `/payment-management?agency={agencyName}` |
| **Target File** | `app/(protected)/payment-management/page.tsx` |
| **Page Action** | `modify_existing` |

## User Story
**As an** operator **I want** to initiate a payment batch for all READY payments of an agency **so that** those payments are processed and an invoice is generated for the batch.

## Acceptance Criteria

### Initiate Payment Button (R20, BR10)
- [ ] AC-1: Given I am on the Payment Management page and the Main Grid has one or more READY payments, when I look at the action area above the Main Grid, then I see an "Initiate Payment" button that is enabled
- [ ] AC-2: Given the Main Grid has no READY payments (all are parked or processed), when I look at the "Initiate Payment" button, then it is disabled and cannot be clicked

### Confirmation Modal (R20)
- [ ] AC-3: Given the Main Grid has READY payments, when I click "Initiate Payment", then a confirmation modal appears showing the agency name, count of READY payments, and their total value in South African currency format (e.g., R 504 000,00)
- [ ] AC-4: Given the initiate payment confirmation modal is open, when I click "Cancel", then the modal closes and no API call is made

### Payment Batch Creation (R21, R33)
- [ ] AC-5: Given the confirmation modal is open, when I click "Confirm Payment", then the app calls `POST /v1/payment-batches` with `{ PaymentIds: [all READY payment IDs] }` and the `LastChangedUser` header set to my username
- [ ] AC-6: Given the batch creation API call is in progress, when I look at the confirmation modal, then a loading indicator is shown and the confirm button is disabled to prevent double submission

### Success State (R21, R22)
- [ ] AC-7: Given the batch creation API call succeeds, when the response returns, then a success modal appears confirming the batch was processed (e.g., "12 payments totalling R 504 000,00 have been processed successfully")
- [ ] AC-8: Given the success modal is displayed, when I click "Close", then the modal closes and the grids refresh to reflect the updated state (processed payments removed from Main Grid)
- [ ] AC-9: Given the batch was processed successfully, when the grids refresh, then the processed payments no longer appear in the Main Grid (they have moved to PROCESSED status and will appear on Screen 3)

### Error State (R35)
- [ ] AC-10: Given the batch creation API call fails, when the response returns, then an error message is shown explaining something went wrong and no payment state changes in the grids

## FRS Traceability
| AC | FRS Requirement |
|----|----------------|
| AC-1, AC-2 | R20, BR10 |
| AC-3, AC-4 | R20 |
| AC-5 | R21, R33 |
| AC-6 | R34 |
| AC-7, AC-8, AC-9 | R21, R22, R28 |
| AC-10 | R35 |

## API Endpoints (from OpenAPI spec)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/v1/payment-batches` | Create a payment batch from all READY payment IDs for the agency. Body: `{ PaymentIds: int[] }`. Header: `LastChangedUser` (required). Returns `DefaultResponse` with `Id` of the created batch |
| GET | `/v1/payments?AgencyName={agencyName}` | Re-fetch payment data after batch creation to refresh both grids |

## Implementation Notes
- This story builds on top of Story 1's Payment Management page. The "Initiate Payment" button is added to the action area alongside "Park Selected".
- The button should be disabled when `readyPayments.length === 0` (BR10).
- The confirmation modal displays: agency name, count of READY payments in the Main Grid, and total commission value formatted in en-ZA currency.
- Total value for the modal is calculated by summing `CommissionAmount` of all READY payments currently in the Main Grid.
- `POST /v1/payment-batches` body contains `PaymentIds` array of all READY payment IDs (not parked, not already processed). The `LastChangedUser` header is required per R33/BR9.
- On success, the API returns a `DefaultResponse` with the batch `Id`. Show the success modal, then on close, re-fetch payments to update both grids.
- On failure, show an error message. Do not change any payment state in the UI.
- The success modal should show the count and total value that was just processed (capture these before the API call, since the grid will refresh after).
- After successful batch creation, the invoice is generated server-side (R28) and will be accessible from Screen 3 (Payments Made). No client-side invoice generation needed.
- Use Shadcn `<Dialog>` for both the confirmation modal and success modal. Use Shadcn `<Button>` for the "Initiate Payment" action.
- Wireframe reference: `generated-docs/specs/wireframes/03-payment-management.md` shows the Initiate Payment modal and Success modal layouts.
