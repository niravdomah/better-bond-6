# Epic 3: Payment Management (Screen 2)

## Description
Build the Payment Management screen with agency-scoped READY and Parked payment grids, client-side filtering, single and bulk park/unpark workflows with confirmation modals, and the Initiate Payment flow that creates a payment batch. All data loaded via `GET /v1/payments`, mutations via `PUT /v1/payments/park`, `PUT /v1/payments/unpark`, and `POST /v1/payment-batches`.

## Stories
1. **Payment Grids with Park and Unpark Workflows** - Agency-scoped page, Main Grid (READY payments) and Parked Grid (always visible), client-side search/filter bar, single and bulk park with confirmation modals, single and bulk unpark with confirmation modals, pagination, loading skeletons, error handling with retry, data refresh after mutations, LastChangedUser header | File: `story-1-payment-grids-park-unpark.md` | Status: Pending
2. **Initiate Payment Flow** - Initiate Payment button (disabled when no READY payments), confirmation modal with payment count and total value, POST to create batch, success modal, grid refresh after processing, LastChangedUser header | File: `story-2-initiate-payment-flow.md` | Status: Pending
