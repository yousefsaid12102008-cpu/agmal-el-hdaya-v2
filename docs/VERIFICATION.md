# Spark activation checkpoint, 21 November 2026

Status: the approved v17 Phase 1 build is live. Phase 1 remains incomplete until exact-owner binding/bootstrap and real account acceptance finish. Additional products/units/warehouses and invoice previews exist only on the review branch, with operational writes closed.

## Tests passed

24 policy, signup-payload, device and initial invoice/inventory unit tests. Production Vite build. Bootstrap rehearsal and 7 Auth/Firestore rules/integration tests. Browser tests cover signup, token-backed email verification refresh, reload/logout/login, owner approval/rejection, exact permissions, audit, cancellation, stale state, suspension/reactivation, owner detail card and login history. Explore navigation works. Mobile 320/390px layout has no horizontal overflow.

Negative tests deny self-promotion, privileged signup, forged email/verification, extra fields, unauthorized finance scope, profile changes without a paired audit, audit edits/deletes and suspended-owner access. Operational collections remain closed. Google token fixtures do not establish real Google OAuth acceptance.

## Login history

One append-only event per Auth sign-in, keyed by token auth_time. Rules bind it to the current UID and authenticated sign-in time, enforce a server receipt timestamp and a strict field list, deny updates/deletes and allow only owners to read. Last login is read from the latest event, not a second write. Newest 50 events are shown with older-page loading. No backfill or automatic deletion. A manual cleanup is separate, not implemented or authorized by this source. Device labels are client-reported, not attestation of an exact phone model. The superseded latest-only login_activity collection is closed to writes.

This browser-driven event log is best-effort, not an authoritative Firebase authentication audit: a modified client can omit an event. An event that exists is token-bound; absence does not prove no login occurred. A duplicate sign-in within the same one-second Auth timestamp shares one event ID.

## Live changes already made under activation approval

Existing project agmal-el-hdaya-erp remains on Spark, with no billing account, paid trial or new project. Email/password and Google providers enabled, Pages hostname authorized. The tested account and append-only history rules were published and the live editor was compared with the tested source. Supported score-based Enterprise/Fraud Defense key created for the production Pages hostname, provider registered in App Check with 1-hour TTL. Production browser acceptance obtained an App Check token with HTTP 200, then Firestore enforcement was enabled and checked in the console. Authentication App Check remains unenforced. Standard Google Cloud terms accepted after explicit owner approval, Egypt, marketing unchecked.

## Still to do

Owner email/password signup, exact live UID/email binding, administrative owner-only verification exception/bootstrap, real owner/non-owner acceptance, Google OAuth and password-reset delivery checks. No production owner has been created or promoted at this checkpoint.

Final visual approval and v17 publication are complete. Live remote entry/script/style files matched the reviewed release files. Browser checks confirmed enabled real-auth UI, correct title, Explore navigation, desktop/mobile overflow checks and no page errors. This does not claim a completed real account sign-in. Minimal production Analytics initialization produced HTTP 204 collection traffic; no visitor count is invented in the app. SDK/property default collection settings and browser blocking still apply.

No Cloud Functions runtime is used by active registration/review. Historical callable files are retained but excluded from active Firebase deployment configuration. Client registration starts pending with no permissions, owner cannot be self-selected and unverified ordinary accounts cannot be approved.

JS bundle is roughly 650 kB before gzip, with the Vite size warning. Historical dependency audit findings are not a fresh security audit.


## Review-only layouts checked after activation

Products list search/category filters, correct row-to-card binding, units/warehouse tabs, invoice navigation and 320/390px overflow checks pass. Desktop/mobile/card screenshots were inspected. Invoice A4 and 80mm preview/PDF checks pass; physical printers remain untested. All sample catalog, stock, payment and invoice values are synthetic and labeled. These preview tests do not certify actual barcode claims, transfers, stock concurrency, valuation or financial issuance. The full account emulator/browser regression was rerun successfully after these source changes.

### Expanded review checks

- `npm run test:composer-expanded`: selectable/searchable synthetic catalog; QR from synthetic camera stream, tracks stopped after decode; A4 PDF download; timestamp/source; optional local watermark image/opacity/remove; draft export invalidation; supported/unsupported device-sharing branches mocked, no external send; responsive widths 320/390/768.
- PDF visually inspected after render, A4 one page, color logo/totals, no default watermark, roughly 200KB JPEG-based proof.
- Production dependency audit: zero advisories at check time. Existing dev-tool advisories remain.
- Built review initial login ~1.7s in local synthetic throttling (4x CPU, 120ms, 200KB/s). QR/camera/export chunks lazy. Not a device/network guarantee.
