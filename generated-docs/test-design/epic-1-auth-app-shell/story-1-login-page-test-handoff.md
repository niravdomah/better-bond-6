# Test Handoff: Login Page with MortgageMax Branding

> Engineering document for downstream agents. Not reviewed by the BA.

**Source:** [story-1-login-page-test-design.md](./story-1-login-page-test-design.md)
**Epic:** 1 | **Story:** 1

## Coverage for WRITE-TESTS

Reference the AC-N identifiers from the story file. Every AC from the story MUST appear in this mapping.

- AC-1: Unauthenticated users are redirected to the login page → Example 9
- AC-2: Login page shows MortgageMax logo and "Commission Payments System" heading → Example 1
- AC-3: Valid credentials redirect to Dashboard → Example 2
- AC-4: Already signed in redirects to Dashboard → Example 8
- AC-5: Invalid credentials show error message → Example 3, Example 4
- AC-6: Empty fields show validation message → Example 5, Example 6, Example 10
- AC-7: Loading state on Sign In button during auth → Example 7

## Handoff Notes for WRITE-TESTS

- Only generate executable tests from examples in the test-design document
- Do not invent behavior not represented there or explicitly approved
- Preferred render scope: component (render the SignInForm/SignInPage component directly)
- Suggested primary assertions:
  - Logo image is present (by role `img` or alt text)
  - Heading text "Commission Payments System" is visible
  - Form fields labelled "Username" and "Password" are present
  - Error alert is visible after failed sign-in attempt (use `role="alert"`)
  - Button text changes to "Signing in..." and becomes disabled during loading
  - Navigation/redirect is called after successful sign-in
- Mock strategy:
  - Mock `@/lib/auth/auth-client` (`signIn` function) to control auth outcomes
  - Mock `next/navigation` (`useRouter`, `useSearchParams`) for redirect assertions
  - For Example 8 (already signed in redirect): this is a server-side redirect via middleware or layout — classify as runtime-only
  - For Example 9 (unauthenticated redirect): this is a middleware/layout redirect — classify as runtime-only
- Important ambiguity flags:
  - The template currently labels the first field "Email" with type="email". The FRS calls it "Username." Implementation should change the label and possibly the input type. Tests should assert against "Username" label per the FRS.
  - The template shows "Invalid credentials" as the error message text. The exact error message wording is not specified in the FRS. Tests should check for the presence of an error alert rather than exact wording.

## Testability Classification

| Scenario | Category | Reason |
| --- | --- | --- |
| 1. Login page shows MortgageMax branding | Unit-testable (RTL) | Component renders correct branding elements based on static content |
| 2. Successful login with valid credentials | Unit-testable (RTL) | Mock signIn to return success, assert router.push is called |
| 3. Login with incorrect password | Unit-testable (RTL) | Mock signIn to return error, assert error message appears |
| 4. Login with non-existent username | Unit-testable (RTL) | Mock signIn to return error, assert error message appears |
| 5. Empty username field on submit | Unit-testable (RTL) | HTML required attribute prevents submission, or form validation fires |
| 6. Empty password field on submit | Unit-testable (RTL) | HTML required attribute prevents submission, or form validation fires |
| 7. Loading state while authenticating | Unit-testable (RTL) | Mock signIn to pend, assert button text and disabled state |
| 8. Already signed-in user visits login page | Runtime-only | Requires server-side session check and redirect via middleware or server component |
| 9. Unauthenticated user tries to access protected page | Runtime-only | Requires Next.js middleware/layout auth guard to trigger redirect |
| 10. Both fields empty on submit | Unit-testable (RTL) | HTML required attributes prevent submission |

## Runtime Verification Checklist

These items cannot be verified by automated tests and must be checked during QA manual verification:

- [ ] Visiting any protected page (e.g., /payment-management) without signing in redirects to the login page
- [ ] Visiting the login page while already signed in redirects to the home page (Dashboard)
