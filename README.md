# أجمل الهدايا ERP

Arabic RTL, Cairo, black/gold identity. Phase 1 is in progress, not ready for shop operations or financial records.

## Current checkpoint: Spark-only account flow

The active account flow replaces callable registration/review with Firebase Auth and Firestore client transactions, independently enforced by security rules. No Cloud Functions or paid runtime is required by the active application.

- Email/password and Google sign-in clients.
- Customer/employee requested account type, always pending with no permissions.
- Owner-only review with explicit role/permission selection and confirmation.
- Atomic profile plus append-only audit writes. Neither half can be committed alone.
- Rules reject self-promotion, owner changes, forged email/verification, invalid permission scope, audit tampering and stale decisions.
- Active owner can review pending accounts. Owner account management supports suspension/reactivation, with a confirmation and audit entry.
- Operational collections remain denied to every client until their modules pass acceptance tests.
- No first-signup owner shortcut. First owner requires a separately approved privileged bootstrap for an exact verified UID.

## Run locally

```sh
npm ci
npm run dev
npm test
npm run build
# Node 22 and Java 21+; admin SDK is used only by isolated test fixtures.
npm --prefix functions ci
npm run test:emulators
```

Emulator command starts only Auth and Firestore against `demo-agaml-phase1`. Browser tests expect Google Chrome at `/usr/bin/google-chrome`.

The `functions/` callable code and `tests/functions.emulator.js` are historical comparison material from the superseded paid-runtime design. They are not selected by `firebase.json`, imported as callable services, deployed, or run by the current emulator command. The client reuses only the pure permission validator in `functions/src/policy.js`.

Development-only labelled design views: `#review/owner`, `#review/employee`, `#review/customer`. Public `#preview/accounts` is a disabled illustrative preview only when Firebase is unconfigured.

## Production and review builds are separate

The approved v17 Phase 1 build is live on GitHub Pages. Its main-branch release commit is `c057007ebdc84b9301cd428923d1cc07dbeb42d5`. The current review branch additionally contains Phase 2 inventory layouts and early invoice design work, not approved live features. Do not blindly merge this source over the main branch's static Pages entry. Live publication needs a separate visual approval.

The existing `agmal-el-hdaya-erp` project and `me-central2` database are retained on Spark. No second project, billing upgrade or payment is approved. Reviewed account/history rules were published during activation. Email/password and Google providers are enabled and the Pages hostname is authorized. The configured Enterprise App Check client obtained a production token; Firestore enforcement was enabled during activation. Authentication App Check remains unenforced. These are deployment checkpoints, not proof of end-to-end account acceptance.

The exact first-owner account was bound to the authenticated owner and promoted through a separately approved guarded administrative transaction. Private identity and backup data are not stored here. Real owner/non-owner UI acceptance remains required. Google OAuth and password-reset email delivery still need real-account tests. Never put admin credentials, service-account keys or real customer data in this public repository. Use `.env.example` as a shape only and verify the actual existing web-app configuration privately.

## Free-plan bounds

Firestore Standard free quota: 1 GiB storage, 50,000 document reads/day, 20,000 writes/day, 20,000 deletes/day, 10 GiB outbound/month. Exactly one free database per project. Each registration/decision writes both a profile and an audit entry; rules reads and listeners also consume reads. Spark can stop serving a quota-limited product rather than silently bill overages. Do not upgrade automatically.

Auth has abuse/rate limits. Spark password-reset emails are limited to 150/day and verification emails to 1,000/day. Phone SMS, paid server runtimes, scheduled server jobs and managed backup/restore are not included in this implementation. This is not a promise that a growing ERP will run within free quotas forever.

Sources checked 21 November 2026:
- https://firebase.google.com/pricing
- https://firebase.google.com/docs/firestore/quotas
- https://firebase.google.com/docs/auth/limits
- https://firebase.google.com/docs/firestore/security/rules-conditions
- https://firebase.google.com/docs/firestore/manage-data/transactions
- https://firebase.google.com/docs/auth/web/google-signin
- https://firebase.google.com/docs/auth/web/password-auth

## Scope still incomplete

Real first-owner/non-owner acceptance, Google OAuth, password-reset delivery and real-account acceptance remain incomplete. Live signup/login UI and an App Check token exchange were checked, but those do not replace account acceptance. Stock, sales, invoices, treasury, orders, reports, QR and backup workflows are later work. Dashboard figures are unavailable, not fake zeroes. Preview concepts are labelled. The invoice reference is private and is not included here.

## Account management

Verification email/resend/reload requires a verified token before ordinary account access. Owner-only pages include registered-profile count, paged account management, suspension/reactivation and registration/latest-login/device detail. The owner-only verification exception applies solely to the exact first-owner account after private identity binding, not to ordinary users.

Full paged client login history replaces the older latest-only activity design. Browsers may hide exact phone models, and the UI never invents them. Account pages fetch at most 50 profiles plus their latest events; older profiles and history load on demand. The one-time first-owner bootstrap completed, with marker and audit readback. Real user-side dashboard acceptance is still being checked.

## Login history on Spark

Owner-only detail cards page through 50 sign-in events at a time. New events start at activation, with no historical backfill or automatic deletion. Each successful client sign-in attempts one write, keyed by UID and token auth_time. A modified/offline client can omit it, and sign-ins within the same token timestamp second share an event ID. This is useful account activity, not a guaranteed forensic authentication audit. Event time comes from Auth; device text is browser-reported. Rules reject edits, deletes, other-user writes and forged event times.

One write per sign-in consumes the Firestore daily write allowance. At 1,000 sign-ins per day that is 1,000 history writes, before profile/audit writes, versus the Spark allowance of 20,000 writes/day. Storage grows until separately approved admin cleanup; no 90-day automatic retention is promised. Loading a full account page also reads each account's latest event, and opening history reads up to 50 events. Free allowance is not unlimited. Watch usage in the Firebase console. Pricing/limits: https://firebase.google.com/pricing and https://firebase.google.com/docs/firestore/quotas .

## Visitor reporting

The existing linked Google Analytics web property is initialized only in production when VITE_FIREBASE_MEASUREMENT_ID is configured. No custom events, user IDs, account details or device-model fields are sent by application code. Standard SDK/property collection settings apply. View visitors in Firebase/Google Analytics, not a client-writable Firestore counter. Browser blocking/consent settings can affect measurement; a missing report is not proof of no visitors. No in-app reporting API or invented zero is provided.

## Review-only next-stage layouts

`#preview/products` shows product cards, units and warehouses. `#preview/invoice` shows A4 and 80mm invoice layouts. Both routes are development-only unless explicitly enabled with `VITE_REVIEW_PREVIEWS=true`. Examples are synthetic and clearly labeled, with no business writes or local stock persistence. Unit conversion and integer-money helpers are groundwork, not trusted operational issuance. See `docs/PHASE2-GROUNDWORK.md` for scope, limitations and unresolved requirements.

Run `npm run test:products-preview` and `npm run test:invoice-preview` for their browser checks. The current unit suite has 24 passing tests. The production build still warns about a roughly 650KB JavaScript chunk before gzip.

Review now includes a mobile-focused dashboard and `#preview/labels` for local QR/Code128 sample generation, per-product copy counts and A4 multi-label printing. Labels support name, optional price and short extra details; the fixed internal QR contains no price. Paper choice and real printer calibration remain pending. Run `npm run test:labels-preview`. No live label/product or invoice issuance workflow is enabled.

The non-issuing `#preview/composer` review adds synthetic code entry, quantities, discount and example split-payment inputs followed by draft printing. It neither saves nor issues a sale. `npm run test:composer-preview` checks it. Optional review modules are lazy-loaded, reducing initial review JS to approximately 637KB / 190KB gzip. `VITE_REVIEW_PREVIEWS=true npm run build` followed by `npm run test:review-performance` runs the synthetic built-review check. Normal production builds do not expose these review routes. The original trusted financial backend requirement and Spark-only constraint remain an unresolved production gate for real issuance, as described in the groundwork document.

## Expanded invoice review, no issuance

The gated `#preview/composer` screen includes synthetic product selection/name-code search, locally decoded camera QR/Code128 through lazy-loaded ZXing, manual/scanner code input, a Cairo device clock, colored A4 PDF download, device file sharing when available, and optional device-local PNG/JPEG watermark upload with opacity/removal. The PDF export is a rasterized A4 review proof, not a tax invoice, not searchable text and not a saved sale. Long drafts fall back to browser print-to-PDF. Thermal paper remains available through browser print. Camera permission/device support and WhatsApp availability depend on the user's browser/device. No message is sent automatically; unsupported file sharing tells the user to attach the downloaded PDF manually. Images are never uploaded or persisted. The timestamp is explicitly the device's draft time, not a trusted issuance timestamp. `npm run test:composer-expanded` exercises a synthetic camera stream and mocked share API; physical phone/WhatsApp delivery remains unverified. Export/scan libraries are lazy-loaded, not initial login dependencies.
