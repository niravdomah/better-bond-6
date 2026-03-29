# Screen: Payments Made

**Route:** `/payments-made`
**Auth:** Required (operator)
**Data Source:** `GET /v1/payment-batches` -> `PaymentBatchReadList`
**FRS:** R24 - R27

## Wireframe

```
+----------------------------------------------------------------------+
| [ MortgageMax Logo ]    Dashboard    Payment Management    Payments Made    [ User | Sign Out ] |
+----------------------------------------------------------------------+
|                                                                      |
|  Payments Made                                                       |
|                                                                      |
|  +------------------------------------------------------------------+|
|  | Search: [___________] | Agency: [dropdown/input]                 ||
|  +------------------------------------------------------------------+|
|                                                                      |
|  +------------------------------------------------------------------+|
|  | Agency Name    | # Payments | Total Commission | VAT     |Invoice||
|  |------------------------------------------------------------------|
|  | ABC Properties |         12 | R 504 000,00     | R 75.6k | [PDF]||
|  | XYZ Realty     |          8 | R 312 000,00     | R 46.8k | [PDF]||
|  | DEF Group      |          5 | R 178 500,00     | R 26.8k | [PDF]||
|  | ...            |        ... | ...              | ...     | ...  ||
|  +------------------------------------------------------------------+|
|  | Page 1 of 2   [ < Prev ]  [ Next > ]                            ||
|  +------------------------------------------------------------------+|
|                                                                      |
+----------------------------------------------------------------------+
```

## Component Breakdown

| Area | Component | Notes |
|------|-----------|-------|
| Page title | `<h1>` | "Payments Made" — `text-2xl font-bold` |
| Filter bar | `<Input>` + `<Input>` | Search by Agency Name and Batch Reference (R26) |
| Batch table | `<Table>` | One row per payment batch from `PaymentBatchReadList` |
| Invoice link | `<Button>` ghost | Downloads PDF via `POST /v1/payment-batches/{Id}/download-invoice-pdf` |
| Pagination | Prev/Next buttons | Below table for large datasets |
| Loading | `<Skeleton>` | Table skeleton rows while loading |
| Error | Error banner + Retry | On API failure |

## Layout

- Filter bar: `flex items-center gap-2` above table
- Table: full width, `overflow-x-auto` for mobile
- Page padding: `p-6` desktop, `p-4` mobile

## Table Columns

| Column | Source Field | Format |
|--------|-------------|--------|
| Agency Name | `AgencyName` | Plain text |
| # Payments | `PaymentCount` | Integer |
| Total Commission | `TotalCommissionAmount` | en-ZA currency: `R 504 000,00` |
| VAT | `TotalVat` | en-ZA currency |
| Invoice | `Id` (for download link) | PDF download button |

## Data Flow

1. On mount, call `GET /v1/payment-batches`
2. Render each batch as a table row
3. Filter bar: `GET /v1/payment-batches?AgencyName={}&Reference={}` (R26)
4. Invoice download: `POST /v1/payment-batches/{Id}/download-invoice-pdf` — triggers file download (R25)
