# Test Handoff: Dashboard with Charts and Summary Cards

> Engineering document for downstream agents. Not reviewed by the BA.

**Source:** [story-1-dashboard-charts-summary-test-design.md](./story-1-dashboard-charts-summary-test-design.md)
**Epic:** 2 | **Story:** 1

> **Note:** This document was updated by the spec-compliance-watchdog to reflect the final implementation (approved by user). AC-10 ("Payments Made (Last 14 Days)") was not implemented. Its mapping entry has been marked accordingly. All "six components" references have been updated to "five components".

## Coverage for WRITE-TESTS

- AC-1: Fetch dashboard data and display five components on load -> Example 1
- AC-2: Show loading skeletons while data is loading -> Example 2
- AC-3: Show error banner when API call fails -> Example 3
- AC-4: Retry button re-fetches dashboard data -> Example 4
- AC-5: Total Value Ready card shows sum in ZAR format -> Example 1, Example 5
- AC-6: Total Value Parked card shows sum in ZAR format -> Example 1, Example 5
- AC-7: Payments Ready bar chart shows counts by commission type -> Example 6
- AC-8: Parked Payments bar chart shows counts by commission type -> Example 6
- AC-9: Parked Payments Aging Report shows three range buckets -> Example 7
- AC-10: ~~Payments Made (Last 14 Days) shows count~~ **NOT IMPLEMENTED** — no test coverage; card was not built
- AC-11: Dashboard heading visible at top -> Example 1
- AC-12: Desktop layout uses two-column grid -> Example 8
- AC-13: Mobile layout stacks to single column -> Example 8

## Handoff Notes for WRITE-TESTS

- Only generate executable tests from examples in the test-design document
- Do not invent behavior not represented there or explicitly approved
- Preferred render scope: full page (render `DashboardPage` component)
- The dashboard renders five components: two monetary summary cards ("Total Value Ready for Payment", "Total Value of Parked Payments"), two bar charts ("Payments Ready for Payment", "Parked Payments"), and one aging report chart ("Parked Payments Aging Report"). The "Payments Made (Last 14 Days)" card was not built.
- Suggested primary assertions:
  - Verify text content of headings, card labels, and monetary values using `getByRole('heading')` and `getByText()`
  - Verify loading skeletons appear when API response is pending (use `findByText` or `waitFor` patterns)
  - Verify error banner text and retry button presence using `getByRole('button', { name: /retry/i })`
  - For bar charts (Recharts), verify user-visible labels/text rendered alongside charts, NOT internal SVG structure
  - Verify currency format matches "R X XXX,XX" pattern
- Mock strategy:
  - Mock `lib/api/client.ts` or the endpoint function to control API responses
  - Use `mockResolvedValue` for success cases, `mockRejectedValue` for error cases
  - For loading state test, use a deferred promise pattern or `mockImplementation` with a never-resolving promise
- Important ambiguity flags:
  - The API field `CommissionType` returns "Bond Registration Commission" in the spec, but the story and wireframe display it as "Bond Comm". The component will likely need to map or abbreviate this label. Tests should assert the user-visible label ("Bond Comm").
  - `TotalCommissionCount` in `PaymentsByAgencyReportItem` is a number type (not integer) — likely represents a monetary amount despite the "Count" suffix. This field is consumed by Story 2, not this story.
- Responsive layout tests (AC-12, AC-13): Testing CSS breakpoints in jsdom is unreliable. Classify as unit-testable only for verifying the correct CSS classes are applied. The actual responsive behavior is runtime-only.

## Testability Classification

| Scenario | Category | Reason |
| --- | --- | --- |
| 1. Dashboard loads and displays all five components | Unit-testable (RTL) | Component renders correct content based on mocked API data |
| 2. Loading state shows skeleton placeholders | Unit-testable (RTL) | Component renders skeletons when data is pending |
| 3. API failure shows error banner with Retry | Unit-testable (RTL) | Component renders error state based on rejected API call |
| 4. Clicking Retry re-fetches data successfully | Unit-testable (RTL) | Button click triggers re-fetch, component re-renders with data |
| 5. Currency formatting for monetary cards | Unit-testable (RTL) | Text content assertion on rendered output |
| 6. Bar chart data derived from PaymentStatusReport | Unit-testable (RTL) | Verify user-visible text labels alongside charts (not SVG internals) |
| 7. Aging report displays three range buckets | Unit-testable (RTL) | Verify user-visible text labels alongside chart |
| 8. Responsive layout | Runtime-only | CSS media query breakpoints cannot be verified in jsdom |
| Edge 1. All payment amounts are zero | Unit-testable (RTL) | Component renders "R 0,00" and zero-state content |
| Edge 2. Only one commission type exists | Unit-testable (RTL) | Component renders with partial data |
| Edge 3. Empty aging report | Unit-testable (RTL) | Component renders empty chart state |

## Runtime Verification Checklist

These items cannot be verified by automated tests and must be checked during QA manual verification:

- [ ] On a desktop screen (>= 1024px wide), the dashboard cards and charts are arranged in a two-column grid
- [ ] On a mobile screen (< 1024px wide), the dashboard cards and charts stack into a single column
