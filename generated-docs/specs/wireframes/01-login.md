# Screen: Login

**Route:** `/login`
**Auth:** Public (unauthenticated users redirected here)

## Wireframe

```
+----------------------------------------------------------+
|                                                          |
|                  [ MortgageMax Logo ]                    |
|                                                          |
|              Commission Payments System                   |
|                                                          |
|          +----------------------------------+            |
|          |  Username                        |            |
|          +----------------------------------+            |
|                                                          |
|          +----------------------------------+            |
|          |  Password                        |            |
|          +----------------------------------+            |
|                                                          |
|          [         Sign In (Button)         ]            |
|                                                          |
|          (Error message area — hidden by default)        |
|                                                          |
+----------------------------------------------------------+
```

## Component Breakdown

| Area | Component | Notes |
|------|-----------|-------|
| Logo | `<img>` | MortgageMax logo from `documentation/morgagemaxlogo.png` |
| Title | `<h1>` | "Commission Payments System" — `text-xl font-bold` |
| Username | `<Input>` + `<Label>` | Shadcn Input with label "Username" |
| Password | `<Input>` + `<Label>` | Shadcn Input with label "Password", type="password" |
| Sign In | `<Button>` | Primary variant, full width within the form card |
| Error | Inline text | `text-destructive text-sm` — shown on invalid credentials |

## Layout

- Centered card layout (`max-w-sm mx-auto mt-24`)
- Card wraps form fields with `p-6 space-y-4`
- Logo centered above the card

## Behaviour

- On submit, authenticate via NextAuth credentials provider
- On success, redirect to `/dashboard`
- On failure, display inline error message
- Loading spinner on the button while authenticating
