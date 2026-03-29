# Screen: Payment Management

**Route:** `/payment-management?agency={agencyName}`
**Auth:** Required (operator)
**Data Source:** `GET /v1/payments` -> `PaymentReadList`
**FRS:** R12 - R23

## Wireframe

```
+----------------------------------------------------------------------+
| [ MortgageMax Logo ]    Dashboard    Payment Management    Payments Made    [ User | Sign Out ] |
+----------------------------------------------------------------------+
|                                                                      |
|  Payment Management — ABC Properties                                 |
|                                                                      |
|  +------------------------------------------------------------------+|
|  | Search: [___________] | Claim Date: [___] | Status: [dropdown]   ||
|  +------------------------------------------------------------------+|
|                                                                      |
|  Ready Payments (12)                     [ Park Selected ] [ Initiate Payment ] |
|  +------------------------------------------------------------------+|
|  | [ ] | Agency  | Batch | Claim  | Agent Name | Bond Amt | Comm   ||
|  |     |  Name   |  ID   | Date   | & Surname  |          | Type   ||
|  |     |         |       |        |            |          |        ||
|  |     | Comm %  | Grant | Reg    | Bank       | Comm Amt | VAT    ||
|  |     |         | Date  | Date   |            |          |        ||
|  |     | Status  |       |        |            |          | [Park] ||
|  |------------------------------------------------------------------|
|  | [ ] | ABC     | 1001  | 2026-  | John Smith | R 1.2M   | Bond   ||
|  |     | Props   |       | 01-15  |            |          | Comm   ||
|  |     | 3.5%    | 2025- | 2026-  | FNB        | R 42 000 | R 6.3k ||
|  |     |         | 12-01 | 01-10  |            |          |        ||
|  |     | READY   |       |        |            |          | [Park] ||
|  |------------------------------------------------------------------|
|  | [ ] | ...     | ...   | ...    | ...        | ...      | ...    ||
|  +------------------------------------------------------------------+|
|  | Page 1 of 3   [ < Prev ]  [ Next > ]                            ||
|  +------------------------------------------------------------------+|
|                                                                      |
|  Parked Payments (3)                              [ Unpark Selected ]|
|  +------------------------------------------------------------------+|
|  | [ ] | Agency  | Batch | Claim  | Agent Name | Bond Amt | Comm   ||
|  |     |  Name   |  ID   | Date   | & Surname  |          | Type   ||
|  |     | Comm %  | Grant | Reg    | Bank       | Comm Amt | VAT    ||
|  |     |         | Date  | Date   |            |          |        ||
|  |     | Status  |       |        |            |          |[Unpark]||
|  |------------------------------------------------------------------|
|  | [ ] | ABC     | --    | 2026-  | Jane Doe   | R 890k   | Manual ||
|  |     | Props   |       | 01-20  |            |          | Pymt   ||
|  |     | 2.0%    | 2025- | 2026-  | ABSA       | R 17 800 | R 2.7k ||
|  |     |         | 11-15 | 01-05  |            |          |        ||
|  |     | PARKED  |       |        |            |          |[Unpark]||
|  +------------------------------------------------------------------+|
|                                                                      |
+----------------------------------------------------------------------+
```

## Modals

### Park Confirmation Modal
```
+------------------------------------------+
|  Park Payment?                           |
|                                          |
|  Agent: John Smith                       |
|  Claim Date: 2026-01-15                  |
|  Commission: R 42 000,00                 |
|                                          |
|  [ Cancel ]              [ Confirm Park ]|
+------------------------------------------+
```

### Bulk Park Confirmation Modal
```
+------------------------------------------+
|  Park 5 Payments?                        |
|                                          |
|  Total amount: R 210 000,00              |
|                                          |
|  [ Cancel ]              [ Confirm Park ]|
+------------------------------------------+
```

### Unpark Confirmation Modal
```
+------------------------------------------+
|  Unpark Payment?                         |
|                                          |
|  Agent: Jane Doe                         |
|  Claim Date: 2026-01-20                  |
|  Commission: R 17 800,00                 |
|                                          |
|  [ Cancel ]            [ Confirm Unpark ]|
+------------------------------------------+
```

### Initiate Payment Modal
```
+------------------------------------------+
|  Initiate Payment?                       |
|                                          |
|  Agency: ABC Properties                  |
|  Payments: 12                            |
|  Total Value: R 504 000,00               |
|                                          |
|  [ Cancel ]       [ Confirm Payment ]    |
+------------------------------------------+
```

### Payment Success Modal
```
+------------------------------------------+
|  Payment Batch Processed                 |
|                                          |
|  12 payments totalling R 504 000,00      |
|  have been processed successfully.       |
|                                          |
|  [ Close ]                               |
+------------------------------------------+
```

## Component Breakdown

| Area | Component | Notes |
|------|-----------|-------|
| Page title | `<h1>` | "Payment Management -- {Agency Name}" — `text-2xl font-bold` |
| Filter bar | `<Input>` + `<Select>` | Horizontal flex row: search input, claim date, status dropdown |
| Main Grid | `<Table>` | Payments with Status = READY, multi-select checkboxes |
| Parked Grid | `<Table>` | Payments with Status = PARKED, always visible even when empty |
| Checkbox | `<Checkbox>` | First column in both grids for multi-select |
| Park button | `<Button>` ghost | Per-row action in Main Grid |
| Unpark button | `<Button>` ghost | Per-row action in Parked Grid |
| Park Selected | `<Button>` secondary | Bulk action above Main Grid, disabled when none selected |
| Unpark Selected | `<Button>` secondary | Bulk action above Parked Grid, disabled when none selected |
| Initiate Payment | `<Button>` primary | Above Main Grid, triggers batch processing |
| Modals | `<Dialog>` | Confirmation modals for park, unpark, initiate, success |
| Pagination | Prev/Next buttons | Below Main Grid for large datasets (R23) |
| Loading | `<Skeleton>` | Table skeleton rows while loading |
| Error | Error banner + Retry | On API failure |

## Layout

- Filter bar: `flex items-center gap-2` above Main Grid
- Action buttons: right-aligned in a flex row above each grid
- Both grids: full width, `overflow-x-auto` for mobile
- Parked Grid always visible (R14), even with 0 rows — shows empty state message
- Section gaps: `space-y-6`

## Data Flow

1. On mount, call `GET /v1/payments?AgencyName={agency}`
2. Split response into READY (Main Grid) and PARKED (Parked Grid)
3. Filter bar applies client-side filtering on Main Grid (R15)
4. Park: `PUT /v1/payments/park` with `{ PaymentIds: [...] }`, then refresh
5. Unpark: `PUT /v1/payments/unpark` with `{ PaymentIds: [...] }`, then refresh
6. Initiate: `POST /v1/payment-batches` with `{ PaymentIds: [...] }`, then refresh
7. All mutating calls include `LastChangedUser` header (R33)
