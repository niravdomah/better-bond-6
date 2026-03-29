# Screen: Dashboard

**Route:** `/dashboard`
**Auth:** Required (operator)
**Data Source:** `GET /v1/payments/dashboard` -> `PaymentsDashboardRead`
**FRS:** R1 - R11

## Wireframe

```
+----------------------------------------------------------------------+
| [ MortgageMax Logo ]    Dashboard    Payment Management    Payments Made    [ User | Sign Out ] |
+----------------------------------------------------------------------+
|                                                                      |
|  Dashboard                                                           |
|  (Selected agency: All Agencies v)                                   |
|                                                                      |
|  +-----------------------------+  +-----------------------------+    |
|  | Total Value Ready           |  | Total Value Parked          |    |
|  |                             |  |                             |    |
|  | R 1 234 567,89              |  | R 234 567,89                |    |
|  +-----------------------------+  +-----------------------------+    |
|                                                                      |
|  +-----------------------------+  +-----------------------------+    |
|  | Payments Ready for Payment  |  | Parked Payments             |    |
|  |                             |  |                             |    |
|  | [BAR CHART]                 |  | [BAR CHART]                 |    |
|  | x: CommissionType           |  | x: CommissionType           |    |
|  |    (Bond Comm | Manual)     |  |    (Bond Comm | Manual)     |    |
|  | y: Payment Count            |  | y: Payment Count            |    |
|  +-----------------------------+  +-----------------------------+    |
|                                                                      |
|  +-----------------------------+  +-----------------------------+    |
|  | Parked Payments Aging       |  | Payments Made (Last 14 Days)|    |
|  |                             |  |                             |    |
|  | [BAR/COLUMN CHART]          |  | 42 payments                 |    |
|  | x: 1-3 Days | 4-7 | >7     |  |                             |    |
|  | y: Payment Count            |  |                             |    |
|  +-----------------------------+  +-----------------------------+    |
|                                                                      |
|  Agency Summary                                                      |
|  +------------------------------------------------------------------+|
|  | Agency Name       | # Payments | Total Commission | VAT    | ->  ||
|  |------------------------------------------------------------------|
|  | ABC Properties    |         12 |   R 123 456,00   | R 18k  | Go  ||
|  | XYZ Realty        |          8 |    R 89 012,00   | R 13k  | Go  ||
|  | ...               |        ... |       ...        | ...    | ... ||
|  +------------------------------------------------------------------+|
|                                                                      |
+----------------------------------------------------------------------+
```

## Component Breakdown

| Area | Component | Notes |
|------|-----------|-------|
| Nav bar | Custom nav | Horizontal top nav with logo left, links center, auth info right |
| Page title | `<h1>` | "Dashboard" — `text-2xl font-bold` |
| Metric cards | `<Card>` x2 | Total Value Ready + Total Value Parked — single monetary figure each |
| Bar charts | `<Card>` + Recharts `<BarChart>` x2 | Ready by commission type + Parked by commission type |
| Aging chart | `<Card>` + Recharts `<BarChart>` | Parked aging ranges: 1-3, 4-7, >7 days |
| Last 14 days | `<Card>` | Single metric from `TotalPaymentCountInLast14Days` |
| Agency table | `<Table>` | One row per agency from `PaymentsByAgency` |
| Go button | `<Button>` ghost | Navigates to `/payment-management?agency={name}` |
| Loading | `<Skeleton>` | Skeleton placeholders for each card and chart while loading |
| Error | Error banner | Retry button on API failure |

## Layout

- Top metric cards: `grid grid-cols-2 md:grid-cols-2 gap-4`
- Charts: `grid grid-cols-1 lg:grid-cols-2 gap-4`
- Agency table: full width below charts
- Page padding: `p-6` desktop, `p-4` mobile

## Data Flow

1. On mount, call `GET /v1/payments/dashboard`
2. Derive metrics from `PaymentStatusReport` (filter by Status = READY or PARKED)
3. Derive aging from `ParkedPaymentsAgingReport`
4. Derive agency rows from `PaymentsByAgency`
5. When an agency row is clicked (R9), navigate to Screen 2 for that agency
6. When an agency row is selected (R10), filter all chart data by that agency name

## Behaviour

- R10: Clicking an agency row highlights it and filters all 6 dashboard components to that agency
- R9: A "Go" button or row-level action navigates to Payment Management scoped to that agency
- Currency formatted as en-ZA: `R 1 234 567,89`
