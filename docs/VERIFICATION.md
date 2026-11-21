# Spark account-flow verification, 21 November 2026

Status: review source only, not deployed. Approved v16 static preview remains live. Phase 1 is not complete.

## Passed locally

- 21 policy and signup-payload unit tests.
- Production Vite build. A roughly 605 kB JS chunk triggers the existing bundle warning.
- Auth + Firestore emulators only, fixed demo project. No Functions runtime.
- Isolated owner-bootstrap rehearsal: loopback/demo/UID/email-verification gates, one owner, marker/audit, concurrent exclusion.
- Six baseline/activity rules suites: anonymous denial, own-profile reads, owner-only user/audit reads, denied unsafe profile writes and closed operational data.
- Real Auth-client Spark integration: email registration, duplicate/concurrent registration without duplicate audit, requested role preserved, no automatic permissions, owner review race with one winning decision, atomic audit, suspension propagation and suspended-owner denial.
- Direct forged writes bypassing client validation: owner promotion, privileged requested role, extra fields, forged email/verification, unauthorized financial permissions, false audit actor/before-state, profile change without audit, audit modification, owner self-demotion. All denied.
- Synthetic Google provider-token fixture: verified token metadata recorded, employee request remains pending without permissions. This is not a real Google OAuth acceptance test.
- Real browser against emulators: owner approval/rejection, cancel writes nothing, exact permission grant, audit pair, stale dialog closure, suspended owner removed, employee denied owner navigation, 320/390px no overflow.
- Browser email signup with employee request, actual pending profile, page reload/session persistence, logout and login again.
- Desktop owner screen and mobile pending-state screenshots inspected as pixels.

Expected permission-denied log entries are negative-test assertions, not ignored test failures.

## Trust boundary

Every client write remains untrusted. Firestore rules validate field allowlists, authenticated token email/verification, pending/empty initial state, allowed status transitions, immutable identity fields, role-specific permission scopes, owner authority and request-time timestamps. Profile and new audit must cross-reference each other through lastAuditId and getAfter; audit update/delete are denied. The browser cannot grant owner to anyone. Transactions reject stale review targets.

Registration display name is untrusted display text. Email verification is the authenticated token snapshot at registration, clearly labelled in the UI; it is not refreshed when the Auth account later changes. A verified display snapshot is not owner identity proof. Real email verification and provider behavior must be checked during production acceptance.

The former callable path is no longer referenced by active Firebase configuration or services. Historical callable files are retained for comparison, not deployment. Emulator fixtures alone use Admin SDK, bypassing rules only for explicit test seeds and bootstrap rehearsal.

## Not verified or enabled

- Live project quotas, current provider settings, authorized domains and app identifiers.
- Production rules deployment, App Check provider/site key/enforcement.
- Real Google OAuth, password reset delivery, live registration/review and cross-device acceptance.
- First owner UID binding, account approval and production privileged bootstrap.
- Dedicated suspension/reactivation management UI; transaction/rules support exists and is tested.
- Operational modules, per-customer operational queries, money, backup/restore, QR.

No live Firebase mutation, public site publication or billing change was made for the Spark revision. Test credentials and accounts are synthetic and local only.

Runtime audits previously reported zero vulnerabilities; the development Firebase CLI tree had 14 moderate transitive advisories. That older audit is not a fresh full dependency-security assessment.

## Latest acceptance additions

Email verification screen, resend and fresh-token recheck pass in browser emulators. Unverified approval is denied by rules. Verification refresh permits only a token-backed false-to-true verification update and timestamp, never role/status/permissions. An owner cannot operate with an unverified auth token.

Owner account total, paging, suspend and reactivate UI pass against emulators; each decision appends its audit. Registration and last-login times use Cairo display. Device label is browser-reported; two unit tests assert no fabricated iPhone precision and Android model/fallback parsing. Activity negative tests deny another-user writes, backdated timestamps, extra fields and non-owner reads. The latest sign-in replaces the previous activity document.

Live rules and Pages authorized-domain setting were applied after explicit activation approval. App Check remains unconfigured pending a Google Cloud terms decision. No live account, owner promotion or revised build publication has occurred at this checkpoint.
