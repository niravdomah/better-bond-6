# Shared Components & Navigation

## Top Navigation Bar

```
+----------------------------------------------------------------------+
| [ MortgageMax Logo ]    Dashboard    Payment Management    Payments Made    [ operator@co.za | Sign Out ] |
+----------------------------------------------------------------------+
```

**Component:** Custom `<NavBar />` — present on all authenticated screens.

| Element | Component | Notes |
|---------|-----------|-------|
| Logo | `<img>` | MortgageMax logo, links to `/dashboard` |
| Nav links | `<a>` / `<Link>` | Active link highlighted with `text-secondary` (teal) and underline |
| User info | Text + `<Button>` ghost | Shows authenticated username/email, "Sign Out" triggers NextAuth signOut |

**Layout:** `flex items-center justify-between px-6 h-16 bg-primary text-primary-foreground`

---

## Loading States (R34)

All screens display loading placeholders while API data is being fetched:

- **Cards:** `<Skeleton>` matching card dimensions
- **Charts:** `<Skeleton>` rectangular placeholder inside chart Card
- **Tables:** 3-5 `<Skeleton>` rows matching column widths

---

## Error States (R35)

When an API call fails:

```
+------------------------------------------+
|  [!] Unable to load data                 |
|                                          |
|  Something went wrong. Please try again. |
|                                          |
|  [ Retry ]                               |
+------------------------------------------+
```

- Displayed inline within the affected section (not a full-page takeover)
- `<Button>` secondary variant for "Retry"
- Error text uses `text-destructive`

---

## Demo Reset (R36)

Accessible via a small link or button in the navigation bar or a settings area (not prominent):

```
[ Reset Demo Data ]
```

- Calls `POST /demo/reset-demo`
- Shows a confirmation dialog before executing
- On success, reloads the current page

---

## Responsive Behaviour

| Breakpoint | Layout Changes |
|------------|----------------|
| Mobile (<768px) | Single column cards, tables scroll horizontally, nav collapses to hamburger menu |
| Tablet (768-1279px) | 2-column card grids, tables may scroll horizontally |
| Desktop (1280px+) | Full layout as wireframed — `max-w-7xl mx-auto` |
