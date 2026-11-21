# First owner setup: preparation and release gate

Status: emulator rehearsal only. No live owner account has been created or promoted. No production bootstrap action is exposed by the browser or a callable function.

## Authority and identity before any live promotion

1. The owner signs into the intended Firebase project with the intended account. Read its current Firebase Auth UID from that project's own Auth record. Do not infer the owner from an email in a profile, a display name, first signup, a client-supplied role or a matching phone number.
2. Bind that exact UID and verified Auth email to the owner through the authenticated conversation. Show which account will become the owner and obtain approval for that specific promotion. The account must be enabled and its email verified. No password or service-account key is collected in chat.
3. Re-read the Auth record and Firestore profile immediately before applying anything. Hold on any mismatch, unexpected existing owner, conflicting email or disabled account. Back up the relevant pre-change documents through an approved private route. Do not publish account data in GitHub.

## One-time operation design

- A privileged, separately reviewed administrative operation, never a public signup path.
- Read a fixed bootstrap marker, the candidate pending profile and the query for any existing owner in one Firestore transaction.
- Refuse if the marker exists or any owner already exists, including suspended owners. Owner replacement/recovery is a separate approved procedure.
- In the same transaction set only the approved UID to active owner, create the marker and append an audit record. Never promote by email lookup alone.
- Confirm the record and audit entry, then test live owner access and denial from a separate non-owner account. Verify App Check and default-deny operational rules before enabling live access.
- Do not leave broad admin credentials on a workstation, in browser code, environment samples, logs or the repository. No live command is provided here because live setup is not yet authorized or reviewed.

## Rehearsal supplied

`scripts/owner-bootstrap-emulator.mjs` refuses non-demo projects, non-loopback emulator hosts, mismatched UID confirmation, unverified/disabled Auth accounts, missing pending profiles and profile/Auth email conflicts. The atomic marker and existing-owner check prevent concurrent first-owner promotions. It is not imported by deployed Functions.

`tests/bootstrap.emulator.js` checks fail-closed project/UID/verification gates, missing profile, concurrent attempts, one owner, one marker, one audit event and refusal to run again. This rehearsal establishes behavior, not permission or readiness to promote a real account.

Live deployment still requires separately approved Firebase changes, production App Check acceptance and the billing decision for Cloud Functions. Spark remains unchanged.
