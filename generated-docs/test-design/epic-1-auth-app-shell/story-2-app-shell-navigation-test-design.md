# Test Design: App Shell with Navigation and Protected Layout

> **Note:** This document was updated by the spec-compliance-watchdog to reflect the final implementation (approved by user). Changes: (1) Navigation links reduced from three to two — "Payments Made" link was not implemented; (2) /payments-made route stub was not created — only /payment-management stub exists; (3) LastChangedUser wiring updated to reflect caller-responsibility pattern — the API client does not automatically read from the authenticated session.

## Story Summary

**Epic:** 1
**Story:** 2
**As an** operator
**I want** a branded header with navigation links
**So that** I can move between Dashboard and Payment Management

## Review Purpose

This document presents concrete business examples for BA review before executable tests are written.

Its purpose is to:
- surface missing business decisions
- let the BA review behavior using examples and expected outcomes
- provide an approved source for downstream test generation

## Business Behaviors Identified

- All authenticated pages display a branded navigation bar with the MortgageMax logo
- The navigation bar contains links to Dashboard and Payment Management
- Clicking a navigation link takes the operator to the correct page
- The current page link is visually highlighted in the navigation bar
- The operator's username or email is displayed in the header
- Clicking Sign Out signs the operator out and redirects to the login page
- The home page displays a "Dashboard" heading instead of the template placeholder
- The API client includes a LastChangedUser header when the caller explicitly passes a user identity string (caller-responsibility pattern — the client does not read from the session automatically)
- On mobile viewports, the navigation collapses into a hamburger menu
- On desktop viewports, the full navigation bar with all links is visible

## Key Decisions Surfaced by AI

- **Template conflict (protected layout):** The existing `(protected)/layout.tsx` only calls `requireAuth()` and renders children with no navigation bar. The FRS requires a branded NavBar on all authenticated pages. The layout must be updated to include the NavBar component wrapping all protected content.
- **Home page route:** The current `app/page.tsx` shows template placeholder content ("Welcome / Replace this with your feature implementation"). Per AC-7, this must be replaced with a "Dashboard" heading. The home page (`/`) should live inside the `(protected)` group so it requires authentication.
- **Route stub:** The story creates a placeholder page at `/payment-management` with a simple heading, so the navigation link has a valid target. No stub was created for `/payments-made` in this story — that route will be added when Epic 4 is implemented.
- **LastChangedUser wiring:** The API client supports a `lastChangedUser` parameter on `post()`, `put()`, and `del()` convenience methods. The client includes the header only when the caller explicitly passes a user string — it does not automatically read from the authenticated session. Future stories that make mutating API calls are responsible for reading the session and passing the user identity to the API client.
- **Active link styling:** Per the wireframe and design tokens, the active navigation link should use `text-secondary` (teal) with an underline. The tests should verify the active link is visually distinct without testing specific CSS classes.

## Test Scenarios / Review Examples

### 1. Navigation bar shows MortgageMax logo

| Setup | Value |
| --- | --- |
| User | Signed in as operator@example.com |

| Input | Value |
| --- | --- |
| Action | Visit the home page |

| Expected | Value |
| --- | --- |
| Logo | MortgageMax logo is displayed in the header |

---

### 2. Navigation bar shows both navigation links

| Setup | Value |
| --- | --- |
| User | Signed in as operator@example.com |

| Input | Value |
| --- | --- |
| Action | Visit the home page |

| Expected | Value |
| --- | --- |
| Link 1 | "Dashboard" link is visible in the navigation |
| Link 2 | "Payment Management" link is visible in the navigation |

---

### 3. Clicking a navigation link navigates to the correct page

| Setup | Value |
| --- | --- |
| User | Signed in as operator@example.com |
| Current page | Home page (Dashboard) |

| Input | Value |
| --- | --- |
| Action | Click "Payment Management" in the navigation |

| Expected | Value |
| --- | --- |
| Result | The Payment Management page is displayed |
| Heading | "Payment Management" heading is visible |

---

### 4. Current page link is visually highlighted

| Setup | Value |
| --- | --- |
| User | Signed in as operator@example.com |

| Input | Value |
| --- | --- |
| Action | Visit the home page (Dashboard) |

| Expected | Value |
| --- | --- |
| Active link | The "Dashboard" link in the navigation appears highlighted (visually distinct from the other links) |
| Other links | "Payment Management" link is not highlighted |

---

### 5. Operator's identity is displayed in the header

| Setup | Value |
| --- | --- |
| User | Signed in as operator@example.com |

| Input | Value |
| --- | --- |
| Action | Visit any authenticated page |

| Expected | Value |
| --- | --- |
| User display | "operator@example.com" (or the operator's name) is visible in the header |

---

### 6. Sign Out redirects to login page

| Setup | Value |
| --- | --- |
| User | Signed in as operator@example.com |

| Input | Value |
| --- | --- |
| Action | Click "Sign Out" in the header |

| Expected | Value |
| --- | --- |
| Result | The operator is signed out and redirected to the login page |

---

### 7. Home page shows Dashboard heading

| Setup | Value |
| --- | --- |
| User | Signed in as operator@example.com |

| Input | Value |
| --- | --- |
| Action | Visit the home page (/) |

| Expected | Value |
| --- | --- |
| Heading | "Dashboard" heading is displayed |
| Placeholder gone | The template placeholder text ("Welcome" / "Replace this with your feature implementation") is not visible |

---

### 8. LastChangedUser header is included when caller passes user identity

| Setup | Value |
| --- | --- |
| User | Caller passes "operator@example.com" as the user identity string to the API client |

| Input | Value |
| --- | --- |
| Action | A component calls the API client's `post()`, `put()`, or `del()` method with a user identity string |

| Expected | Value |
| --- | --- |
| HTTP header | The request includes a `LastChangedUser` header with the value "operator@example.com" |
| Without user string | When no user string is passed, no `LastChangedUser` header is included |

## Edge and Alternate Examples

### 9. Navigation on mobile viewport shows hamburger menu

| Setup | Value |
| --- | --- |
| User | Signed in as operator@example.com |
| Viewport | Mobile (less than 768px wide) |

| Input | Value |
| --- | --- |
| Action | Visit the home page |

| Expected | Value |
| --- | --- |
| Full nav links | Not visible (hidden) |
| Hamburger button | A menu button is visible in the header |

---

### 10. Opening the mobile menu shows navigation links

| Setup | Value |
| --- | --- |
| User | Signed in as operator@example.com |
| Viewport | Mobile (less than 768px wide) |

| Input | Value |
| --- | --- |
| Action | Tap the hamburger menu button |

| Expected | Value |
| --- | --- |
| Link 1 | "Dashboard" link is visible |
| Link 2 | "Payment Management" link is visible |
| User info | Operator's identity is visible |
| Sign Out | "Sign Out" option is available |

---

### 11. Desktop viewport shows full navigation bar

| Setup | Value |
| --- | --- |
| User | Signed in as operator@example.com |
| Viewport | Desktop (1280px or wider) |

| Input | Value |
| --- | --- |
| Action | Visit the home page |

| Expected | Value |
| --- | --- |
| All links | Dashboard and Payment Management links are both visible |
| User info | Operator's identity is visible |
| Sign Out | "Sign Out" button is visible |
| Hamburger | No hamburger menu button is visible |

---

### 12. Route stub exists for Payment Management

| Setup | Value |
| --- | --- |
| User | Signed in as operator@example.com |

| Input | Value |
| --- | --- |
| Action | Navigate to /payment-management |

| Expected | Value |
| --- | --- |
| Heading | "Payment Management" heading is visible |
| Navigation | The navigation bar is present with the "Payment Management" link highlighted |

---

### 13. Navigation between pages preserves the navigation bar

| Setup | Value |
| --- | --- |
| User | Signed in as operator@example.com |

| Input | Value |
| --- | --- |
| Step 1 | Visit Dashboard |
| Step 2 | Click "Payment Management" |
| Step 3 | Click "Dashboard" |

| Expected | Value |
| --- | --- |
| Navigation bar | Visible and functional on every page visited |
| Active link | Updates to match the current page at each step |

## Out of Scope / Not For This Story

- Dashboard content, charts, and data (Epic 2)
- Payment Management grid and actions (Epic 3)
- Payments Made grid and invoice download (Epic 4)
- Login page functionality (Story 1 — already complete)
- Role-based access control beyond single Operator role
- Demo Reset button in the navigation (Epic 5)
- Loading states and error handling (Epic 5)
- /payments-made route stub (not implemented in this story — deferred to Epic 4)

## Coverage for WRITE-TESTS (AC to Example Mapping)

| AC | Covered By |
| --- | --- |
| AC-1 (MortgageMax logo in header) | Scenario 1 |
| AC-2 (Navigation links visible) | Scenario 2 |
| AC-3 (Navigation click navigates) | Scenario 3 |
| AC-4 (Active link highlighted) | Scenario 4 |
| AC-5 (Username displayed) | Scenario 5 |
| AC-6 (Sign Out) | Scenario 6 |
| AC-7 (Dashboard heading on home page) | Scenario 7 |
| AC-8 (LastChangedUser header — caller-responsibility) | Scenario 8 |
| AC-9 (Mobile hamburger menu) | Scenarios 9, 10 |
| AC-10 (Desktop full nav bar) | Scenario 11 |

## Handoff Notes for WRITE-TESTS

- **Mock NextAuth session:** Tests will need to mock the authenticated session to provide operator identity (e.g., `operator@example.com`). Use `next-auth/react` session mock.
- **Mock `next/navigation`:** Navigation tests need `useRouter` and `usePathname` mocks to verify routing and active link detection.
- **Responsive tests:** For mobile vs desktop scenarios, use viewport resizing or media query mocks. If viewport simulation is impractical in unit tests, consider testing the hamburger menu component's visibility toggle directly.
- **API client test (Scenario 8):** Test the API client helper functions directly — verify that `post()`, `put()`, and `del()` include the `LastChangedUser` header when a user identity string is explicitly passed by the caller. This is a unit test of the client infrastructure, not a component rendering test. The client does not read from the session automatically; that responsibility belongs to the calling component.
- **Sign Out test (Scenario 6):** Mock `signOut` from `next-auth/react` and verify it is called when the Sign Out button is clicked. The redirect to the login page is handled by NextAuth's `callbackUrl` config.
- **Template code to replace:** The `(protected)/layout.tsx` currently renders only `{children}`. It must be updated to wrap children in a NavBar + layout structure. The `app/page.tsx` must be moved into `(protected)` and updated to show "Dashboard".
- **FRS is the source of truth:** Design tests against FRS requirements R31-R33, the story acceptance criteria, and the wireframe — not the existing template code.
