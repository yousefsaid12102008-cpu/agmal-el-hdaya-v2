# Phase 2 groundwork and invoice design preview

## Scope and current state

The owner's original plan puts products, units, warehouses, movements and barcodes in Phase 2. POS, invoices, payment, returns and printing belong to Phase 3. The current invoice preview is early visual groundwork, not an issued invoice or completion of either phase. It writes no business data. Live v17 is a separate approved Phase 1 build.

Review route: `#preview/invoice`, available only in development or a review build with `VITE_REVIEW_PREVIEWS=true`. It is not enabled in a normal production build. Sample names, products, codes, payments and amounts are invented for layout testing. The owner's private sample image and its customer data are not stored in this repository.

The preview has A4 and 80mm display/print layouts. A4 is black-and-white friendly and fits the current sample on one page. Thermal uses a custom 80mm by 400mm preview sheet, not a claim of compatibility with every receipt printer. Real printer margins, cutter/roll settings, many-line pagination and physical paper tests remain required. The preview never books a unique invoice number or assumes tax registration or rates.

## Inventory data boundaries proposed for review

- `products/{productId}`: internal code, unique barcode claim, name, category, image reference, supplier reference, purchase/sale prices in integer piastres, base unit, allowed whole-unit conversion factors, minimum stock threshold, active state and server timestamps. No editable stock balance field.
- `warehouses/{warehouseId}`: name, location description, active state and server timestamps.
- `warehouses/{warehouseId}/stock/{productId}`: derived base-unit balance and the last movement reference. It can change only alongside a validated append-only movement.
- `inventory_movements/{movementId}`: product, source/destination warehouse as appropriate, type, signed base-unit delta, reason, source document reference, actor UID and server timestamp. No update/delete through the client.
- `barcode_claims/{normalizedBarcode}`: one immutable product binding. Claim creation must be atomic with product registration, with duplicate claims refused. A barcode string is never authority to read private data.
- `operation_keys/{actorUid}/requests/{key}`: idempotency claim and canonical result reference. A retry reuses the result rather than applying stock or money again.

Balances are not changed directly. Transfers require one paired source/destination transaction with equal opposite quantities and no partial completion. Sales, returns, purchase receipts and write-offs need their originating business document, movement and audit entry bound together. A count adjustment needs an explicit counted quantity, previous quantity and reason; it is not an unlogged overwrite.

The included pure helpers currently support whole-count units only, including a carton with 12 base pieces. Fractional/weighted stock, conversion-factor edits after use, valuation and rounding policy are not implemented and must not silently be inferred from these helpers. All business collections remain denied by the published rules.

## Invoice/calculation groundwork

`invoice-math.js` uses safe integer piastres, rejects invalid/fractional money, zero/invalid quantity, excessive discount/payment and arithmetic overflow. It is a calculation helper, not trusted invoice issuance. Real issuance still needs authoritative prices/permissions, unique numbering, server time, customer binding, payment-account authorization, stock availability, idempotency and atomic append-only records. Cancellation is by reversal, not deletion.

Tax mode/rates, legal business identifiers, discount authority, credit-sale limits, negative-stock policy, thermal hardware and actual receipts remain unresolved production requirements. The sample does not answer them. Real invoices/payments/stock writes are not opened by this change.

## Checks performed

24 unit tests pass across Phase 1 policy/device tests and initial invoice/inventory math tests. Browser preview loads without page errors; 390px layout has no page overflow; A4 and thermal selection render; printed output was inspected as pixels. This is not a live financial, stock, tax, hardware or multi-device acceptance test.

## Products, units and warehouses review UI

`#preview/products` has the same development/review-build gate. Product list filtering and per-row read-only cards use clearly labeled synthetic examples. Units and warehouse tabs are review layouts, not a production catalog. Actual product totals, valuation and alerts are not fabricated. All buttons that would commit operational data remain disabled or absent. No preview data is persisted, locally or in Firestore.

Browser checks cover correct row/card binding, product search/category filtering, navigation, and no page overflow at 320px and 390px. Desktop, mobile and card screenshots were inspected. These checks do not prove business write rules, barcode uniqueness, concurrent inventory accounting, fractional units, valuation or operational readiness. Those are not implemented here.
