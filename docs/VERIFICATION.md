# Revision 12 foundation verification, 21 November 2026

Phase 1 design/foundation review only. Phase 1 is not complete.

Passed locally:
- 19 unit tests (16 policy/validation and 3 signup payload tests), covering pending/suspended users, owner-only review validation and customer/employee financial restrictions.
- Vite production build. Bundle-size warning remains.
- Owner, employee and customer dashboard preview visibility checks.
- Mobile sidebar open/close and no horizontal overflow at 320, 390 and 768 pixels.
- Disabled unconfigured login/signup, mode switching, customer/employee request radios and no runtime errors in smoke checks.
- Final desktop/mobile login, signup and dashboard screenshots inspected for layout, readable labels and role-specific content.

Revision 11.1 fixes the signup callable payload and adds regression coverage. Revision 11 adds a customer/employee account-type request in email and Google signup. It is not a role grant. Every new account remains pending with no operational permissions until owner approval. The client profile-creation race was removed so the requested account type reaches the registration callable first.

Design previews are development-only. All figures are unavailable rather than fake zero values. There is no claim of a working cloud connection. The supplied shop logo and owner-supplied generated bookstore artwork are used. The artwork is not a photograph of the real shop. The owner portrait remains a placeholder.

Owner navigation includes the requested service list, local navigation search, notification bell, not-yet-synced status and current-shift widget. Notification and close-shift controls stay disabled until real services exist. Employee and customer views exclude financial/admin content outside their scope. QR generation and camera scanning remain Phase 2 work.

Not verified/completed:
- Real Firebase account/project state or configuration.
- Live authentication, App Check, owner bootstrap or account-review UI.
- Live Firebase acceptance tests. Local emulator rules and callable integration checks now pass.
- Customer ownership-query isolation against operational data (all such collections remain closed). Local second-client suspension propagation passes.
- Stock, sales, invoices, accounting, orders, reports and backup workflows.
- Live deployment and production App Check acceptance.

The source follows the latest blueprint for implemented foundation files. Future modules are intentionally not supplied as empty stubs. Existing design concepts are labelled and must not be presented as finished operational modules.

This revision is packaged as a source ZIP for the review branch. Expanded repository source and Firebase setup are later steps. This checkpoint does not replace the main branch or change GitHub Pages settings.

## Revision 12 local security checks

Five Firestore rules suites and one callable integration suite pass on demo-only Firestore/Auth/Functions emulators. Coverage includes anonymous denial, own-profile status reads, owner-only user/audit reads, blocked client profile writes and self-promotion, closed operational collections, requested-role preservation, duplicate registration, invalid financial permission denial, owner approval, suspension and second-client real-time suspension updates. Production App Check remains untested, deliberately disabled only in emulators. Functions region uses ERP_FUNCTION_REGION because the FUNCTION_ prefix is reserved.

Node 22 and Java 21+ are required for emulator checks. Production npm audit reports zero vulnerabilities. The development Firebase CLI dependency tree currently reports 14 moderate advisories; these must be reviewed before broader tooling use. No claim that all dependencies are vulnerability-free.

## Owner approvals: local implementation, not published

Pending-account review uses an owner-only Firestore list and the reviewUser callable. Decisions include expectedStatus=pending and fail if another session already handled the request. The UI shows registered email and verification as recorded at signup, never treats the display name as identity proof, defaults all permissions off and confirms the exact target/role/permissions. Server registration obtains those identity display fields from the authenticated token.

A real browser emulator workflow passes approval, rejection, cancel/no-write, exact permission grants, two audit records, real-time stale closure, suspended-owner removal, staff navigation denial and 320/390px overflow checks. Desktop/mobile and confirmation screenshots are awaiting owner visual review. Production login, App Check and live backend acceptance remain untested.

The isolated owner bootstrap rehearsal passes loopback/demo gating, explicit UID match, Auth verification, pending profile, concurrent attempt exclusion and single owner/marker/audit assertions. It refuses real Firebase projects by design.
