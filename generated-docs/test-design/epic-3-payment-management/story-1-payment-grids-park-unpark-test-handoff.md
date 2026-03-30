# Test Handoff: Payment Grids with Park and Unpark Workflows

> Engineering document for downstream agents. Not reviewed by the BA.

**Source:** [story-1-payment-grids-park-unpark-test-design.md](./story-1-payment-grids-park-unpark-test-design.md)
**Epic:** 3 | **Story:** 1

## Coverage for WRITE-TESTS

- AC-1: Heading shows "Payment Management -- {Agency Name}" -> Example 1
- AC-2: Redirect to Dashboard when no agency param -> Example 2
- AC-3: Fetch payment data from GET /v1/payments?AgencyName={agencyName} -> Example 1
- AC-4: Skeleton loading placeholders during fetch -> Example 3
- AC-5: Error message when API fails -> Example 4
- AC-6: Retry button re-fetches data -> Example 4
- AC-7: Main Grid shows READY payments only -> Example 1, Example 5
- AC-8: Main Grid columns displayed correctly -> Example 1
- AC-9: Main Grid header shows READY count -> Example 1, Edge 5
- AC-10: Parked Grid shows PARKED payments -> Example 1
- AC-11: Parked Grid shows empty state when no parked payments -> Example 5
- AC-12: Text search filters Main Grid client-side -> Example 6
- AC-13: Filter bar with Claim Date, Agency Name, Status -> Example 6
- AC-14: Single Park confirmation modal with details -> Example 7
- AC-15: Confirm Park calls PUT /v1/payments/park with ID and LastChangedUser -> Example 7
- AC-16: After park success, payment moves from Main to Parked Grid -> Example 7
- AC-17: Cancel closes modal without API call -> Example 8
- AC-18: Multi-select enables "Park Selected" button -> Example 9, Edge 4
- AC-19: Bulk Park confirmation shows count and total -> Example 9
- AC-20: Bulk Park calls API with all selected IDs -> Example 9
- AC-21: Bulk Park success moves all selected payments -> Example 9
- AC-22: Single Unpark confirmation modal -> Example 10
- AC-23: Confirm Unpark calls PUT /v1/payments/unpark -> Example 10
- AC-24: After unpark success, payment returns to Main Grid -> Example 10
- AC-25: Multi-select in Parked Grid enables "Unpark Selected" -> Example 11
- AC-26: Bulk Unpark confirmation shows count and total -> Example 11
- AC-27: Bulk Unpark calls API with all selected IDs -> Example 11
- AC-28: Bulk Unpark success returns all to Main Grid -> Example 11
- AC-29: Data refresh after mutations via re-fetch -> Example 7, Example 9, Example 10, Example 11
- AC-30: Pagination controls for Main Grid -> Edge 2
- AC-31: Loading indicator during park/unpark mutation -> Edge 3
- AC-32: Error during park/unpark shows error, no state change -> Edge 1

## Handoff Notes for WRITE-TESTS

- Only generate executable tests from examples in the test-design document
- Do not invent behavior not represented there or explicitly approved
- Preferred render scope: full page component (`PaymentManagementPage`)
- Suggested primary assertions:
  - Page heading text matches agency name from URL
  - Grid row counts match expected READY/PARKED splits
  - Modal content shows correct payment details (agent name, claim date, commission amount)
  - API calls made with correct HTTP method, endpoint, body, and headers
  - Grid state updates after successful mutations (re-fetch triggered)
  - Skeleton/loading states render during async operations
  - Error states display with retry capability
  - Pagination controls appear and function correctly
  - Client-side filtering reduces visible rows without API calls
- Important ambiguity flags:
  - Commission % column may be absent from API data; test should handle missing field gracefully
  - Filter bar field composition: text search + Claim Date + Status (not Agency Name, since page is already agency-scoped)
  - "Park Selected" / "Unpark Selected" button visibility vs. disabled state is a BA decision (Edge 4)

### Mock Strategy

- **GET /v1/payments:** Mock the API client's `getPayments` (or equivalent endpoint function from `lib/api/endpoints.ts`) to return a `PaymentReadList` with a `PaymentList` array containing sample `PaymentRead` objects. Split READY and PARKED payments across different mock responses as needed per scenario.
- **PUT /v1/payments/park:** Mock to return success (or error for Edge 1). Verify request body contains `{ PaymentIds: [...] }` and the `LastChangedUser` header.
- **PUT /v1/payments/unpark:** Same mock pattern as park.
- **Re-fetch after mutation:** After a successful park/unpark, the component should call GET /v1/payments again. Use sequential mock responses (`mockResolvedValueOnce`) to return updated data reflecting the mutation.
- **NextAuth session:** Mock the session to provide the operator's username for the `LastChangedUser` header.
- **next/navigation:** Mock `useSearchParams` to return the agency name, and mock `useRouter` for the redirect scenario (AC-2).

### Sample Payment Data

Use these representative `PaymentRead` objects in mocks:

```typescript
const readyPayment1 = {
  Id: 101,
  AgencyName: "ABC Properties",
  BatchId: 1001,
  ClaimDate: "2026-01-15",
  AgentName: "John",
  AgentSurname: "Smith",
  BondAmount: 1200000,
  CommissionType: "Bond Registration Commission",
  GrantDate: "2025-12-01",
  RegistrationDate: "2026-01-10",
  Bank: "FNB",
  CommissionAmount: 42000,
  VAT: 6300,
  Status: "READY",
};

const readyPayment2 = {
  Id: 102,
  AgencyName: "ABC Properties",
  BatchId: 1002,
  ClaimDate: "2026-01-18",
  AgentName: "Bob",
  AgentSurname: "Johnson",
  BondAmount: 950000,
  CommissionType: "Manual Payment",
  GrantDate: "2025-11-20",
  RegistrationDate: "2026-01-12",
  Bank: "ABSA",
  CommissionAmount: 28500,
  VAT: 4275,
  Status: "READY",
};

const parkedPayment1 = {
  Id: 201,
  AgencyName: "ABC Properties",
  ClaimDate: "2026-01-20",
  AgentName: "Jane",
  AgentSurname: "Doe",
  BondAmount: 890000,
  CommissionType: "Manual Payment",
  GrantDate: "2025-11-15",
  RegistrationDate: "2026-01-05",
  Bank: "ABSA",
  CommissionAmount: 17800,
  VAT: 2670,
  Status: "PARKED",
};
```

## Testability Classification

| Scenario | Category | Reason |
| --- | --- | --- |
| 1. Page loads with agency-scoped heading and data | Unit-testable (RTL) | Component renders correct heading and grid rows from mocked API data |
| 2. Redirect when no agency parameter | Unit-testable (RTL) | Can verify router.push('/') is called when searchParams has no agency |
| 3. Loading skeleton during fetch | Unit-testable (RTL) | Skeleton components render while API promise is pending |
| 4. Error state with Retry | Unit-testable (RTL) | Error message and retry button render on API rejection; retry triggers re-fetch |
| 5. Parked Grid empty state | Unit-testable (RTL) | Empty state message renders when no PARKED payments in response |
| 6. Client-side text search | Unit-testable (RTL) | Typing in search input filters rendered rows without triggering API call |
| 7. Single park flow | Unit-testable (RTL) | Modal renders with details; confirm triggers API call; re-fetch updates grid |
| 8. Single park cancel | Unit-testable (RTL) | Cancel closes modal; no API call made |
| 9. Bulk park flow | Unit-testable (RTL) | Checkbox selection enables button; modal shows count/total; confirm triggers API |
| 10. Single unpark flow | Unit-testable (RTL) | Mirror of scenario 7 for Parked Grid |
| 11. Bulk unpark flow | Unit-testable (RTL) | Mirror of scenario 9 for Parked Grid |
| Edge 1. Park API failure | Unit-testable (RTL) | Error message renders on API rejection; grid state unchanged |
| Edge 2. Pagination | Unit-testable (RTL) | Pagination controls render; clicking Next/Prev changes visible rows |
| Edge 3. Loading during mutation | Unit-testable (RTL) | Loading indicator renders while park/unpark API is pending |
| Edge 4. Park Selected disabled | Unit-testable (RTL) | Button disabled attribute when no checkboxes selected |
| Edge 5. Both grids empty | Unit-testable (RTL) | Main Grid shows 0 count; Parked Grid shows empty message |

All scenarios in this story are unit-testable. No runtime verification needed.
