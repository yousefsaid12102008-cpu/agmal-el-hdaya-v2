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

## Mobile dashboard and product-label review

The owner requested a more usable phone dashboard plus product QR creation and multiple product codes on one sheet. Review dashboard now puts large QR/labels, invoice-preview and product-preview actions first, has a compact mobile header and a closable off-canvas menu. These routes are still gated review features, not live operating modules.

The owner selected a fixed internal product-code QR payload. Labels print product name, an optional current sale-price example and optional short extra details (size, color or description). Those printed fields do not enter the QR. The review uses synthetic codes and does not claim real catalog uniqueness, product registration or price lookup. QR and Code128 generation runs locally, without a third-party code-image endpoint. No database write is opened.

The A4 label workbench supports per-product copy counts, row/column/gap configuration, optional price and per-product short details. A4 paper is confirmed. Plain versus pre-cut adhesive stock, its template and printer calibration remain unresolved. Current proposed layout is 3 columns by 5 rows with 3mm gaps and 10mm A4 margins, leaving 1mm page-height tolerance. 10 + 5 + 8 copies produce 23 labels on 2 pages, 15 then 8. Invalid/fractional/zero totals and undersized layouts are blocked; changed settings disable print until the preview refreshes. The review is capped at 100 labels per request.

All 23 QR labels and all 23 Code128 labels were decoded from rasterized generated PDFs, with exact expected product-code counts. Browser tests decode the three source QR images and check menus, navigation, mobile overflow, counts, invalid quantities and cleanup. Physical printers, scanner hardware, thermal labels, adhesive alignment and real catalog/price lookup are not tested. Invoice issuance remains closed. The original spec requires a trusted backend for sensitive financial operations, which is not supplied by a QR preview or by client-side invoice math.

## Non-issuing draft invoice composer

`#preview/composer` demonstrates selecting synthetic products or typing a fixed demo code followed by Enter, merging repeats, editing whole quantities, removing lines, an exact decimal-to-piastres discount, and example cash/wallet payment inputs. Unknown codes and invalid/excess amounts are refused. Any edit invalidates the old print view. The current draft prints through the A4/80mm preview renderer. Nothing is saved across reloads; no invoice ID, server time, stock deduction, payment, customer debt or audit operation is created. No camera scanner or real catalog price lookup is claimed.

26 unit tests pass. The composer browser test covers repeated/unknown codes, quantities, totals, discount/payment guards, print invalidation, deletion/clear, mobile overflow and one-page A4 output. Initial auth null-state rendering was corrected to avoid needlessly replacing an already visible entry form, then the full emulator account regression passed again.

Review-only product/label/composer/invoice modules now load on demand, and Analytics is a separate chunk. Initial review JavaScript is approximately 637KB / 190KB gzip versus 739KB / 214KB before splitting. Normal production builds exclude gated review modules. The large core chunk warning remains. A fresh-browser local production-review check at 390px, 4x CPU slowdown, 120ms latency and 200KB/s download saw the auth form in about 1.7 seconds; this is one synthetic measurement, not a real phone or live-network guarantee. Initial requests excluded the optional label/composer modules, and direct review routes loaded with no page errors.

### Financial execution gate

The original spec requires trusted backend execution for sensitive financial operations. Firebase's official Cloud Functions setup guide says production deployment requires Blaze: https://firebase.google.com/docs/functions/get-started . That specified route conflicts with the current no-billing-change/Spark-only constraint. No paid service was enabled and no browser-only financial issuance was substituted. A separately approved compatible backend and transaction/idempotency acceptance are still required before real invoice issuance.
