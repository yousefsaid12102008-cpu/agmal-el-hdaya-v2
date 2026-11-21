# أجمل الهدايا ERP

Arabic RTL, Cairo, black/gold identity. Phase 1 is in progress, not ready for shop operations or financial records.

## Current checkpoint: Spark-only account flow

The review branch replaces callable registration/review with Firebase Auth and Firestore client transactions, independently enforced by security rules. No Cloud Functions or paid runtime is required by the active application.

- Email/password and Google sign-in clients.
- Customer/employee requested account type, always pending with no permissions.
- Owner-only review with explicit role/permission selection and confirmation.
- Atomic profile plus append-only audit writes. Neither half can be committed alone.
- Rules reject self-promotion, owner changes, forged email/verification, invalid permission scope, audit tampering and stale decisions.
- Active owner can review pending accounts. The transaction/rules layer also supports active-to-suspended and suspended-to-active transitions; dedicated management UI is not implemented yet.
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

## Production remains gated

The existing public site still serves the approved v16 read-only preview. This Spark revision is review-branch source only. Do not blindly merge over the main branch's static Pages entry.

No live Firebase configuration, rules or billing changes were made for this revision. Copy `.env.example` locally only after verifying the existing `agmal-el-hdaya-erp` web-app configuration. Preserve the existing `me-central2` Firestore database. No second project, Blaze upgrade or payment is approved.

Before live activation: verify Spark/database state, Email/Google providers and authorized domain, deploy reviewed rules, confirm exact first-owner identity, apply a separately approved bootstrap, configure and verify App Check, then run real account acceptance checks. The optional App Check client uses reCAPTCHA v3; no site key or enforcement was enabled here. Never put admin credentials, service-account keys or real customer data in this public repository.

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

Live Auth/Google OAuth, App Check, production bootstrap and real-project acceptance remain unverified. Stock, sales, invoices, treasury, orders, reports, QR and backup workflows are later work. Dashboard figures are unavailable, not fake zeroes. Preview concepts are labelled. The invoice reference is private and is not included here.

## Activation update: email verification and owner management

The latest review adds verification email/resend/reload with mandatory verified token before dashboard access, an owner-only aggregate registered-profile count, paged account management with suspension/reactivation, and registration/latest-login/device details. Only the latest client-reported sign-in is retained, not full history. Browsers may hide exact phone models; the UI never invents them. Activity reads are owner-only; users may write only their own fixed-shape current-timestamp activity. Each sign-in adds one write, and each account page reads at most 50 profiles plus their activity documents.

Live setup progress: reviewed rules were published and the existing Pages hostname authorized on 21 November 2026. Providers were already enabled. App Check setup is waiting on a Google Cloud terms decision. No new site build or owner bootstrap yet. The owner has chosen email/password signup and an explicitly controlled administrative verification exception for his own first-owner bootstrap, not an exemption for other accounts.

## Login history on Spark

Owner-only detail cards page through 50 sign-in events at a time. New events start at activation, with no historical backfill or automatic deletion. Each successful client sign-in attempts one write, keyed by UID and token auth_time. A modified/offline client can omit it, and sign-ins within the same token timestamp second share an event ID. This is useful account activity, not a guaranteed forensic authentication audit. Event time comes from Auth; device text is browser-reported. Rules reject edits, deletes, other-user writes and forged event times.

One write per sign-in consumes the Firestore daily write allowance. At 1,000 sign-ins per day that is 1,000 history writes, before profile/audit writes, versus the Spark allowance of 20,000 writes/day. Storage grows until separately approved admin cleanup; no 90-day automatic retention is promised. Loading a full account page also reads each account's latest event, and opening history reads up to 50 events. Free allowance is not unlimited. Watch usage in the Firebase console. Pricing/limits: https://firebase.google.com/pricing and https://firebase.google.com/docs/firestore/quotas .

## Visitor reporting

The existing linked Google Analytics web property is initialized only in production when VITE_FIREBASE_MEASUREMENT_ID is configured. No custom events, user IDs, account details or device-model fields are sent by application code. Standard SDK/property collection settings apply. View visitors in Firebase/Google Analytics, not a client-writable Firestore counter. Browser blocking/consent settings can affect measurement; a missing report is not proof of no visitors. No in-app reporting API or invented zero is provided.
