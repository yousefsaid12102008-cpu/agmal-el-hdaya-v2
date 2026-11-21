# أجمل الهدايا ERP | Phase 1 review

هذه نسخة مراجعة للتصميم والأساس، وليست نظامًا جاهزًا لتشغيل المكتبة.

## Source package

Download **3-agaml-phase1-v11.1-review.zip** from this branch, extract it, then run the project from the `agaml-phase1` folder:

```sh
npm ci
npm run dev
npm test
npm run build
```

The full 47-file source is packaged in the ZIP for this review checkpoint. The older loose files inherited from `main` are not the new implementation. Expanded source will replace that older layout in a later build step, preserving Git history.

The earlier v11 ZIP is superseded by v11.1, which fixes employee/customer request payload forwarding. Use v11.1 only.

## Included

- Approved Arabic RTL black/gold login and dashboard designs with the supplied shop logo and generated bookstore artwork.
- Owner, employee and customer design previews with unavailable data shown as dashes.
- Signup account-type selection: customer or employee is a request only. All new accounts remain pending owner approval with no operational access.
- Draft Firebase auth/role foundation, default-deny Firestore rules and policy tests.
- Source documentation, local smoke checks, dependency lockfiles and environment template. No configured Firebase project or credentials.

## Review status

19 unit tests (16 policy and 3 signup payload regression tests), production build and local UI smoke checks passed. Final dashboard/login/signup desktop and mobile screenshots were visually inspected. The production bundle still has a size warning.

Live Firebase authentication, secure owner setup, account-review UI, emulator/rules/integration tests, operational modules, financial workflows, backups and deployment remain unfinished. See `docs/VERIFICATION.md` and `docs/PLAN.ar.md` inside the package.

This review branch does not change the default `main` branch, GitHub Pages source or the existing live site. No Firebase project, billing or deployment settings were changed.

## Integrity

Source ZIP SHA-256:

`ba350ece1bc3abf05dd5791265e990e9d79fc9214c2655eb5e92a80b588ba840`
