# Story: Login Page with MortgageMax Branding

**Epic:** Authentication and App Shell | **Story:** 1 of 2 | **Wireframe:** `generated-docs/specs/wireframes/01-login.md`

## Story Metadata
| Field | Value |
|-------|-------|
| **Route** | `/login` |
| **Target File** | `app/auth/signin/page.tsx` (restyle existing) |
| **Page Action** | `modify_existing` |

## User Story
**As an** operator **I want** to sign in with my username and password on a branded login page **so that** I can access the commission payments system.

## Acceptance Criteria

### Happy Path
- [ ] AC-1: Given I am not signed in, when I visit any page, then I am redirected to the login page
- [ ] AC-2: Given I am on the login page, when it loads, then I see the MortgageMax logo and the heading "Commission Payments System"
- [ ] AC-3: Given I am on the login page, when I enter valid credentials and click Sign In, then I am redirected to the home page (Dashboard)
- [ ] AC-4: Given I am already signed in, when I visit the login page, then I am redirected to the home page (Dashboard) — **Note: Not implemented in the current build. The signin page performs no session check on load. This redirect is not in place and must be treated as out-of-scope until a future story adds the server-side session guard.**

### Error Handling
- [ ] AC-5: Given I am on the login page, when I enter an incorrect username or password and click Sign In, then I see an error message telling me the credentials are invalid
- [ ] AC-6: Given I am on the login page, when I click Sign In without filling in the username or password, then I see a validation message asking me to fill in the required fields

### Loading State
- [ ] AC-7: Given I am on the login page, when I click Sign In and authentication is in progress, then the Sign In button shows a loading indicator and is not clickable

## API Endpoints (from OpenAPI spec)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| N/A | NextAuth `/api/auth/...` | Frontend-only auth via NextAuth credentials provider |

## Implementation Notes
- The `UserRole` enum in `types/roles.ts` retains the original four-role system from the template (ADMIN, POWER_USER, STANDARD_USER, READ_ONLY). The FRS required simplification to a single OPERATOR role, but this was not carried out during implementation. The enum and demo-user list remain unchanged.
- Demo users available in development (defined in `lib/auth/auth.config.ts`):
  | Email | Password | Role |
  |-------|----------|------|
  | admin@example.com | Admin123! | ADMIN |
  | power@example.com | Power123! | POWER_USER |
  | user@example.com | User123! | STANDARD_USER |
  | readonly@example.com | Reader123! | READ_ONLY |
- The template has an existing sign-in page at `app/auth/signin/`. It was restyled per the wireframe with MortgageMax branding.
- MortgageMax logo is at `documentation/morgagemaxlogo.png` — copy to `public/` for use.
- Use Shadcn `<Input>`, `<Label>`, `<Button>`, and `<Card>` components for the form layout.
- Centered card layout per wireframe: `max-w-sm mx-auto mt-24`.
