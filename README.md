# أجمل الهدايا ERP

Phase 1 work in progress. Arabic RTL, Cairo, black/gold identity.

This source is for review. It is not ready for shop operations, customer records, money, or production deployment.

## Run locally

```sh
npm ci
npm run dev
npm test
npm run build
node phase1-v11-smoke.mjs
# Node 22 and Java 21+
npm --prefix functions ci
npm run test:emulators
```

The screenshot test uses Google Chrome at `/usr/bin/google-chrome`. Adjust that path for another machine.

Development-only design views:
- `#review/owner`
- `#review/employee`
- `#review/customer`

These routes only render labelled design previews. They do not authenticate users and are disabled by the production environment check.

## Current implementation

- Reviewed cinematic login and separate storefront concept.
- Responsive owner, employee and customer dashboard design concepts.
- Firebase client initialized only when required environment configuration exists. Login remains disabled without it.
- Server-side registration/review callable drafts: customer or employee is a requested account type, never a self-granted role. Both create pending profiles with no operational permissions. Owner-only review, atomic profile/audit writes and App Check enforcement outside emulators are drafted.
- Default-deny Firestore rules. Operational collections remain closed.
- 19 unit tests, local UI checks and six Firestore/Auth/Functions emulator suites pass. The emulator integration also checks second-client suspension propagation.

All dashboard figures remain unavailable until real data services are built and connected. No chart, total or online/sync success is invented. Sidebar module names describe planned screens, not completed operational modules.

## Agreed scope

- Continue the existing `agmal-el-hdaya-v2` repository. Keep it public as requested. Do not include secrets.
- Central Firebase storage, not a local browser database.
- Owner administers the system. Employee/cashier daily-work access excludes profits, global balances, financial reports and settings. New accounts may request customer or employee status, but every account remains pending owner approval with no operational access. Customers later access only their own purchases/orders/account.
- The latest five-phase blueprint governs names and paths. Only implemented foundation files are included now. Future module files will be added with their real implementations and tests, not empty stubs.
- Keep old Git history. No real-sales data migration is planned because the previous local edition was an experiment.

## Firebase setup still required

The selected existing project is `agmal-el-hdaya-erp`, with its current `me-central2` database location. It remains on Spark; no billing upgrade is approved. Live rules still deny all.

Copy `.env.example` to a local `.env` and supply verified web app configuration only when live backend setup is ready. Never include service-account keys or other server secrets in client code. Client Firebase web app identifiers are not server credentials, but configuration alone does not secure data.

Project ownership/current setup, region, providers, App Check, owner bootstrap, and any billing/deployment need verification and approved setup. No existing project has been changed by this source revision.

## Not complete

Live Google/email authentication, owner approval UI, secure owner bootstrap, live suspension/cross-device acceptance tests, real operational modules, financial ledger, backups/restore, deployment and final security review. Phase 1 is not complete while these foundation items remain unverified.

## Static preview deployment

The main branch serves a development-only static build on the existing GitHub Pages site. Login and signup remain disabled. The review branch carries expanded source work and must not be merged blindly over the Pages entry. File upload prefixes are reflected in the deployed asset references; keep JS/CSS/image names aligned when replacing a build. No operational backend is deployed.
