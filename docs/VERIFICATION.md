# Spark activation checkpoint, 21 November 2026

Status: source updated and emulator-tested. The reviewed v16 static preview remains live pending final visual approval. Phase 1 is not complete.

## Tests passed

21 policy, signup-payload and device unit tests. Production Vite build. Bootstrap rehearsal and 7 Auth/Firestore rules/integration tests. Browser tests cover signup, token-backed email verification refresh, reload/logout/login, owner approval/rejection, exact permissions, audit, cancellation, stale state, suspension/reactivation, owner detail card and login history. Explore navigation works. Mobile 320/390px layout has no horizontal overflow.

Negative tests deny self-promotion, privileged signup, forged email/verification, extra fields, unauthorized finance scope, profile changes without a paired audit, audit edits/deletes and suspended-owner access. Operational collections remain closed. Google token fixtures do not establish real Google OAuth acceptance.

## Login history

One append-only event per Auth sign-in, keyed by token auth_time. Rules bind it to the current UID and authenticated sign-in time, enforce a server receipt timestamp and a strict field list, deny updates/deletes and allow only owners to read. Last login is read from the latest event, not a second write. Newest 50 events are shown with older-page loading. No backfill or automatic deletion. A manual cleanup is separate, not implemented or authorized by this source. Device labels are client-reported, not attestation of an exact phone model. The superseded latest-only login_activity collection is closed to writes.

This browser-driven event log is best-effort, not an authoritative Firebase authentication audit: a modified client can omit an event. An event that exists is token-bound; absence does not prove no login occurred. A duplicate sign-in within the same one-second Auth timestamp shares one event ID.

## Live changes already made under activation approval

Existing project agmal-el-hdaya-erp remains on Spark, with no billing account, paid trial or new project. Email/password and Google providers enabled, Pages hostname authorized. Earlier tested rules published, with the new history rules still awaiting final publish. Supported score-based Enterprise/Fraud Defense key created for the production Pages hostname, provider registered in App Check with 1-hour TTL. No enforcement until a production token test succeeds. Standard Google Cloud terms accepted after explicit owner approval, Egypt, marketing unchecked.

## Still to do

Final visual approval, source comparison, configured static build publication, real App Check token acceptance then enforcement, owner email/password signup, exact live UID binding, administrative owner-only verification exception/bootstrap, real owner/non-owner acceptance, Google OAuth and password-reset delivery checks. No production owner has been created or promoted at this checkpoint. Real visitor reporting is not enabled by a forgeable Firestore counter. Analytics linkage/report route is under review.

No Cloud Functions runtime is used by active registration/review. Historical callable files are retained but excluded from active Firebase deployment configuration. Client registration starts pending with no permissions, owner cannot be self-selected and unverified ordinary accounts cannot be approved.

JS bundle is roughly 632 kB before gzip, with the Vite size warning. Historical dependency audit findings are not a fresh security audit.
