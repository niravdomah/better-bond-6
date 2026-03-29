# Feature: BetterBond Commission Payments POC-002

## Summary
A modern web interface for BetterBond operators to review, manage, and process commission payments for mortgage bond agents. Includes a dashboard with charts, payment management with park/unpark workflows, batch payment processing, invoice generation, and demo reset capabilities.

## Epics
1. **Epic 1: Authentication and App Shell** - Set up NextAuth with username/password credentials, protected route layout, app header with MortgageMax branding/logo, and main navigation between the three screens. Includes the LastChangedUser header utility for mutating API calls. | Status: Pending | Dir: `epic-1-auth-app-shell/`
2. **Epic 2: Dashboard (Screen 1)** - Build the Dashboard screen with all six chart/summary components, the Agency Summary grid, agency row selection that filters charts, and navigation from an agency row to Screen 2. Data loaded via GET /v1/payments/dashboard. | Status: Pending | Dir: `epic-2-dashboard/`
3. **Epic 3: Payment Management (Screen 2)** - Build the Payment Management screen with Main Grid (READY payments) and always-visible Parked Grid. Includes single/bulk park/unpark with confirmation modals, search/filter, "Initiate Payment" flow, pagination, and data refresh. | Status: Pending | Dir: `epic-3-payment-management/`
4. **Epic 4: Payments Made (Screen 3) and Invoice Download** - Build the Payments Made screen showing processed payment batches with search/filter and invoice PDF download. | Status: Pending | Dir: `epic-4-payments-made/`
5. **Epic 5: Loading States, Error Handling, and Demo Reset** - Cross-cutting polish: loading spinners/skeletons, standardized error messages with retry, and Demo Reset function. | Status: Pending | Dir: `epic-5-loading-error-demo/`

## Epic Dependencies
- Epic 1: Authentication and App Shell (no dependencies — must be first)
- Epic 2: Dashboard (depends on Epic 1) — independent of Epics 3, 4
- Epic 3: Payment Management (depends on Epic 1, Epic 2) — Epic 2 provides the navigation entry point
- Epic 4: Payments Made (depends on Epic 1) — independent of Epics 2, 3; can parallel with Epic 2
- Epic 5: Loading States, Error Handling, and Demo Reset (depends on Epics 2, 3, 4) — must be last; cross-cutting polish
