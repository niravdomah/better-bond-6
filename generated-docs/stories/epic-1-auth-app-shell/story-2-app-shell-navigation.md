# Story: App Shell with Navigation and Protected Layout

**Epic:** Authentication and App Shell | **Story:** 2 of 2 | **Wireframe:** `generated-docs/specs/wireframes/05-shared-components.md`

## Story Metadata
| Field | Value |
|-------|-------|
| **Route** | `/` |
| **Target File** | `app/(protected)/layout.tsx`, `app/page.tsx` |
| **Page Action** | `modify_existing` |

## User Story
**As an** operator **I want** a branded header with navigation links **so that** I can move between Dashboard and Payment Management.

## Acceptance Criteria

### Navigation Bar
- [ ] AC-1: Given I am signed in, when any page loads, then I see the MortgageMax logo in the header
- [ ] AC-2: Given I am signed in, when I look at the header, then I see navigation links for Dashboard and Payment Management
- [ ] AC-3: Given I am on the Dashboard page, when I click Payment Management in the navigation, then I navigate to the Payment Management page
- [ ] AC-4: Given I am on any page, when I look at the navigation, then the current page link is visually highlighted

### User Identity and Sign Out
- [ ] AC-5: Given I am signed in, when I look at the header, then I see my username or email displayed
- [ ] AC-6: Given I am signed in, when I click Sign Out in the header, then I am signed out and redirected to the login page

### Home Page
- [ ] AC-7: Given I am signed in, when I visit the home page, then I see a "Dashboard" heading (replacing the template placeholder content)

### API Integration
- [ ] AC-8: Given a component makes a data-changing API call and passes the current user's identity to the API client, when the request is sent, then it includes a LastChangedUser header with that identity value (caller-responsibility pattern — the API client does not automatically read from the session)

### Responsive Layout
- [ ] AC-9: Given I am viewing the app on a mobile device, when I look at the header, then I see a hamburger menu button instead of the full navigation bar
- [ ] AC-10: Given I am viewing the app on a desktop, when I look at the header, then I see the full navigation bar with all links visible

## API Endpoints (from OpenAPI spec)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| N/A | N/A | No API calls in this story — LastChangedUser header is wired into the existing API client for use by future stories |

## Implementation Notes
- Create a route stub for `/payment-management` inside `app/(protected)/` with a placeholder heading. This will be fully implemented in a later epic. No stub was created for `/payments-made` in this story.
- The `LastChangedUser` header is supported by the API client at `lib/api/client.ts` via a caller-responsibility pattern: the client includes the header when a user string is explicitly passed by the caller. The client does not automatically read from the authenticated session. Future stories that make mutating API calls are responsible for reading the session and passing the user identity to the API client.
- Build a `<NavBar />` component per the shared components wireframe. Use the `(protected)` layout to include it on all authenticated pages.
- NavBar layout: `flex items-center justify-between` with logo, nav links, and user info section.
- Active link should use the design tokens secondary color (teal) with underline styling.
- On mobile viewports (<768px), collapse navigation into a hamburger menu using Shadcn `<Sheet>` or similar.
- This story enables manual verification of Story 1 (login page) since it provides the navigation target for post-login redirect.
