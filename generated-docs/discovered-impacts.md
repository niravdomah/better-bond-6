# Discovered Impacts

Design changes and scope impacts discovered during implementation.

---

## DI-001: Payments Made merged into Payment Management

**Discovered:** 2026-03-30 (Epic 1, Story 2 QA)
**Requested by:** User (manual verification feedback)
**Affects:** Epic 4 (Payments Made — Screen 3)

### Change

"Payments Made" is no longer a separate page with its own route (`/payments-made`). Instead, Payments Made functionality will be implemented as a modal/dialog within the Payment Management page.

### Impact

- **Navigation:** Reduced from 3 links to 2 (Dashboard, Payment Management). The `/payments-made` route stub has been removed.
- **Epic 4 scope:** The entire epic needs to be re-scoped. Instead of building a standalone page at `/payments-made`, the processed-batches grid and invoice PDF download will be implemented as a modal accessible from the Payment Management page.
- **Epic 3 (Payment Management):** May need to include a trigger (button/link) to open the Payments Made modal. This should be planned during Epic 3 story definition.
