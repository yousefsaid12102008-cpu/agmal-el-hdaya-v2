# Local work 2026-11-27 (NOT deployed, branch only)

Base: main at commit 324e38c. Nothing here changes main, the live site, the live Firebase rules or live data.

## Changed files (in assets/)
- 2-cx1-mx3-app-db1.js: sidebar items "المصروفات" and "تذكيرات العملاء" enabled for owner/director; "المصروفات" opens the finance view with type = expense; "تذكيرات العملاء" loads assets/7-reminders.js.
- 6-cx1-mx3-phase3-connected-pi2.js: expense form (category dropdown with Arabic labels: rent, electricity, transport, salaries, other; optional name field for "أخرى"; reason optional for expenses; review screen shows the Arabic category).
- 7-reminders.js (new): customer reminders screen (15-day logic, tabs, call, WhatsApp wa.me link, "تم التذكير" writes phase4_reminders).

## Other files (local-work/)
- candidate-strict-v7-rem.rules: Firestore rules v7 plus one block for phase4_reminders (+344 characters). Staged v7 ruleset on the project is ffc21001-51b9-4583-abde-dd55a8a7ffa2 (not active; activation returns 503).
- tests/: emulator UI scenarios used for testing (test password replaced by a placeholder).

## Tested (emulator only, v7 rules)
Expenses: 3 expense kinds saved, balances and reason checked. Reminders: lists, counts, WhatsApp link, "تم التذكير" write and move to the followed-up tab.

## Before this can be deployed
1. Attach rules v7 (activation call currently returns 503 UNAVAILABLE; support ticket sent 2026-11-27 00:52).
2. Then publish the reminders block (second rules publish) after checking the compiled size.
3. Copy the 3 assets to the site, then test on the real site with the real owner account.
4. Not done: suppliers/purchases screens, reports, staff management (marked "لاحقًا" in the UI).
