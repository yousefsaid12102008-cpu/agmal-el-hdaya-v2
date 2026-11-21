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
