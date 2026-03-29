# Test Design: Login Page with MortgageMax Branding

## Story Summary

**Epic:** 1
**Story:** 1
**As an** operator
**I want to** sign in with my username and password on a branded login page
**So that** I can access the commission payments system

## Review Purpose

This document presents concrete business examples for BA review before executable tests are written.

Its purpose is to:
- surface missing business decisions
- let the BA review behavior using examples and expected outcomes
- provide an approved source for downstream test generation

## Business Behaviors Identified

- Unauthenticated users are redirected to the login page when trying to access any protected page
- The login page displays MortgageMax branding (logo and "Commission Payments System" heading)
- Valid credentials authenticate the operator and redirect to the Dashboard
- Already-authenticated operators are redirected away from the login page to the Dashboard
- Invalid credentials display an error message
- Empty/missing fields trigger validation messages
- The Sign In button shows a loading state while authentication is in progress

## Key Decisions Surfaced by AI

- The template currently uses "Email" as the username field label, but the FRS and wireframe refer to "Username." The story should rename the field label from "Email" to "Username" to match the FRS. The input type may also change from `email` to `text` to support non-email usernames.
- The template includes a "Don't have an account? Sign up" link in the login form footer. The FRS does not mention self-registration. This link should be removed during implementation.
- The template uses 4 demo roles. Per the FRS, there is only one role (Operator). The demo user list should be simplified to a single operator credential set.

## Test Scenarios / Review Examples

### 1. Login page shows MortgageMax branding

| Setup | Value |
| --- | --- |
| User | Not signed in |

| Input | Value |
| --- | --- |
| Action | Visit the login page |

| Expected | Value |
| --- | --- |
| Logo visible | MortgageMax logo is displayed |
| Heading | "Commission Payments System" is displayed |
| Username field | A text input labelled "Username" is visible |
| Password field | A password input labelled "Password" is visible |
| Sign In button | A "Sign In" button is visible |

---

### 2. Successful login with valid credentials

| Setup | Value |
| --- | --- |
| User | Not signed in |

| Input | Value |
| --- | --- |
| Username | operator@example.com |
| Password | Operator123! |
| Action | Click "Sign In" |

| Expected | Value |
| --- | --- |
| Result | Operator is redirected to the home page (Dashboard) |

---

### 3. Login with incorrect password

| Setup | Value |
| --- | --- |
| User | Not signed in |

| Input | Value |
| --- | --- |
| Username | operator@example.com |
| Password | WrongPassword99 |
| Action | Click "Sign In" |

| Expected | Value |
| --- | --- |
| Error message | An error message is displayed indicating invalid credentials |
| Location | The operator stays on the login page |

---

### 4. Login with non-existent username

| Setup | Value |
| --- | --- |
| User | Not signed in |

| Input | Value |
| --- | --- |
| Username | nobody@example.com |
| Password | SomePassword1! |
| Action | Click "Sign In" |

| Expected | Value |
| --- | --- |
| Error message | An error message is displayed indicating invalid credentials |
| Location | The operator stays on the login page |

---

### 5. Empty username field on submit

| Setup | Value |
| --- | --- |
| User | Not signed in |

| Input | Value |
| --- | --- |
| Username | (empty) |
| Password | Operator123! |
| Action | Click "Sign In" |

| Expected | Value |
| --- | --- |
| Validation message | A message asking the operator to fill in the username field |
| Form | Not submitted to the server |

---

### 6. Empty password field on submit

| Setup | Value |
| --- | --- |
| User | Not signed in |

| Input | Value |
| --- | --- |
| Username | operator@example.com |
| Password | (empty) |
| Action | Click "Sign In" |

| Expected | Value |
| --- | --- |
| Validation message | A message asking the operator to fill in the password field |
| Form | Not submitted to the server |

---

### 7. Loading state while authenticating

| Setup | Value |
| --- | --- |
| User | Not signed in |

| Input | Value |
| --- | --- |
| Username | operator@example.com |
| Password | Operator123! |
| Action | Click "Sign In" (authentication in progress) |

| Expected | Value |
| --- | --- |
| Sign In button | Shows a loading indicator (e.g., "Signing in...") |
| Sign In button | Not clickable while loading |
| Form fields | Disabled while loading |

---

### 8. Already signed-in user visits login page

| Setup | Value |
| --- | --- |
| User | Already signed in as operator@example.com |

| Input | Value |
| --- | --- |
| Action | Visit the login page directly |

| Expected | Value |
| --- | --- |
| Result | Operator is redirected to the home page (Dashboard) |

## Edge and Alternate Examples

### 9. Unauthenticated user tries to access a protected page

| Setup | Value |
| --- | --- |
| User | Not signed in |

| Input | Value |
| --- | --- |
| Action | Visit /payment-management (a protected page) |

| Expected | Value |
| --- | --- |
| Result | Operator is redirected to the login page |

---

### 10. Both fields empty on submit

| Setup | Value |
| --- | --- |
| User | Not signed in |

| Input | Value |
| --- | --- |
| Username | (empty) |
| Password | (empty) |
| Action | Click "Sign In" |

| Expected | Value |
| --- | --- |
| Validation message | Messages asking the operator to fill in the required fields |
| Form | Not submitted to the server |

## Out of Scope / Not For This Story

- Navigation bar and header layout (covered in Story 2)
- Sign-out functionality (covered in Story 2)
- Self-registration / "Sign up" flow (not in the FRS — the link will be removed)
- Role-based access control beyond single Operator role
- Password reset or recovery
- Session expiration handling
