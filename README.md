AGAML EL HDAYA ERP

Agmal El Hdaya Management System

نظام متكامل لإدارة مكتبة أجمل الهدايا، يجمع بين إدارة المبيعات والمخزون والحسابات والعملاء والموظفين والخدمات في منصة واحدة.

1. Project Overview

- Project Name: AGAML EL HDAYA ERP
- Business Name: مكتبة أجمل الهدايا
- System Type: Mini ERP – POS – Inventory – Accounting
- Language: Arabic (RTL)
- Currency: EGP
- Timezone: Africa/Cairo
- Frontend: HTML, CSS, JavaScript ES Modules
- Backend: Firebase
- Database: Cloud Firestore
- Authentication: Firebase Authentication
- Hosting: Firebase Hosting
- Design: Premium Black & Gold

2. Design System

- Background: "#060A13"
- Gold: "#E9BD72"
- Dark cards and panels.
- Cairo font.
- Fully responsive interface.
- Arabic RTL layout.
- Premium modern dashboard.
- Smooth transitions and organized navigation.

3. Main Modules

3.1 Authentication & Users

- Email and Google sign-in.
- Owner approval for new accounts.
- Pending, approved, rejected and disabled accounts.
- Owner, Admin, Cashier and Employee roles.
- Granular permissions.
- Login and logout audit records.

3.2 Dashboard

- Daily and monthly sales.
- Revenue, expenses and net profit.
- Cash and wallet balances.
- Customer debts and supplier payables.
- Inventory value and low-stock alerts.
- Pending orders.
- Employee performance.
- Date-range filtering.

3.3 POS & Sales

- Product search by name or barcode.
- Shopping cart and quantity controls.
- Authorized price changes and discounts.
- Cash, wallet, account and credit payments.
- Partial payments.
- Customer selection.
- Automatic invoice numbering.
- Invoice history and search.
- Returns and cancellations.
- A4 and thermal invoice printing.

3.4 Products & Inventory

- Product name, internal code and barcode.
- Purchase and selling prices.
- Categories, units and suppliers.
- Product images.
- Stock quantities and minimum limits.
- Stock receipts, issues, adjustments and waste.
- Product movement history.
- Unit conversion.
- Duplicate barcode prevention.

3.5 Barcode & QR Label Printing

- Generate unique barcodes and QR codes.
- Display product name, price and product code.
- Print individual or multiple product labels.
- Multiple products and quantities on one A4 sheet.
- Adjustable label width and height.
- Adjustable rows, columns and spacing.
- Cutting guides and print preview.
- Save label layout settings.
- Print and cut labels for product packaging.

3.6 Purchases & Suppliers

- Supplier profiles and contact information.
- Purchase invoices.
- Purchase discounts and additional costs.
- Automatic stock increases.
- Partial and full supplier payments.
- Supplier balances and statements.
- Purchase returns.

3.7 Customers & Debts

- Customer profiles and phone numbers.
- Total purchases and outstanding debts.
- Partial and full debt collection.
- Payment dates and due dates.
- Customer account statements.
- Debt history and reminders.
- Credit limits.
- Collections must not be counted as new sales.

3.8 Treasury & Financial Accounts

- Cash drawer.
- Electronic wallets.
- Payment accounts.
- Recharge balances.
- Banks and other accounts.
- Deposits, withdrawals and transfers.
- Expenses and income.
- Debt collections and supplier payments.
- Manual transaction recording.
- Automatic server timestamps.
- Complete account transaction history.

3.9 Printing & Copy Services

- Black-and-white printing.
- Color printing.
- PDF and document services.
- Research formatting.
- Lecture notes and memos.
- Configurable service prices.
- Paper stock deduction.
- Duplex printing calculations.
- Machine counter tracking.
- Waste and service profitability.

3.10 Special Orders

- Customer and contact information.
- Order description and service type.
- Optional attached files.
- Cost, paid amount and remaining balance.
- Due dates and assigned employees.
- New, In Progress, Ready, Delivered and Cancelled statuses.
- Overdue notifications.

3.11 Employees & Shifts

- Employee accounts and permissions.
- Shift opening and closing.
- Opening cash balance.
- Sales, expenses and collections.
- Expected and actual cash.
- Shortage and overage calculations.
- Shift reports and Z-reports.

3.12 Accounting

- Double-entry accounting.
- Journal entries and ledger.
- Debit and credit validation.
- Cost of goods sold.
- Revenue and expense tracking.
- Financial transaction reversals.
- No deletion of posted financial records.
- No direct balance manipulation.

3.13 Reports

- Sales and profit reports.
- Expenses and revenue.
- Treasury and account statements.
- Customer debts and supplier balances.
- Inventory and product movement.
- Best-selling and slow-moving products.
- Returns and waste.
- Printing and copy services.
- Employee performance.
- PDF, Excel and CSV exports.

3.14 Audit & Notifications

- User activity logs.
- Invoice and stock changes.
- Financial operation history.
- Permission changes.
- Approval and restore logs.
- Low-stock alerts.
- Debt and order reminders.
- Shift closing alerts.
- Cash variance notifications.

3.15 Backup & Restore

- JSON backup.
- CSV exports.
- Manual and scheduled backups.
- Backup history.
- Data validation.
- Owner-only restore permissions.
- Restore testing.

4. User Roles & Permissions

- Owner: Full system control, approvals, financial accounts, permissions, reports, backup and restore.
- Admin: Authorized operational and management functions.
- Cashier: Sales, invoices, collections and shifts.
- Employee: Only assigned modules and permitted operations.

Owner privileges must be verified securely on the server, never through client-side identity checks alone.

5. Technical Architecture

Frontend:

- HTML
- CSS
- JavaScript ES Modules
- Responsive SPA architecture

Backend:

- Firebase Authentication
- Cloud Firestore
- Firebase Cloud Functions
- Firestore Security Rules
- Firebase Hosting

Sensitive operations must be processed and validated on the server.

6. Database Collections

- users
- roles
- permissions
- products
- categories
- units
- warehouses
- inventory_movements
- customers
- suppliers
- sales
- sale_items
- purchases
- purchase_items
- returns
- orders
- services
- service_prices
- accounts
- account_transactions
- journal_entries
- journal_lines
- shifts
- expenses
- machine_counters
- notifications
- audit_logs
- settings
- backups

7. Data Integrity & Security

- Server timestamps.
- Integer piastres for money calculations.
- Firestore transactions and batched writes.
- Idempotency keys to prevent duplicate operations.
- Unique invoice references.
- No direct balance editing.
- No direct stock quantity changes without movement records.
- No deletion of posted financial transactions.
- Reversals and adjustments preserve history.
- Strict Firestore Security Rules.
- Server-side permission validation.
- No sensitive server secrets in frontend code.

8. Development Phases

Phase 1 — Foundation

- Project structure.
- Firebase integration.
- Authentication.
- User management.
- Owner approval.
- Roles and permissions.
- Audit logs.
- Dashboard foundation.

Phase 2 — Inventory

- Products and categories.
- Barcode and QR generation.
- A4 label printing.
- Units and conversions.
- Suppliers and purchases.
- Stock movements.

Phase 3 — Sales & Services

- POS.
- Invoices.
- Partial and credit payments.
- Returns.
- Printing and copy services.
- Special orders.
- Machine counters.

Phase 4 — Finance

- Treasury and financial accounts.
- Wallets and manual transactions.
- Customer debt collections.
- Supplier payments.
- Shifts.
- Accounting and journal entries.

Phase 5 — Reports & Launch

- Reports and exports.
- Inventory stocktake.
- Backup and restore.
- Security tests.
- Multi-device tests.
- Final deployment.

9. Acceptance Tests

1. Sales appear across multiple devices.
2. Unauthorized employees cannot change prices.
3. Sales update stock correctly.
4. Credit sales update customer debts.
5. Debt collections are not counted as new sales.
6. Recharge commissions are calculated correctly.
7. Shift cash differences are accurate.
8. Unit conversions are correct.
9. Printing consumes the correct paper quantity.
10. Good and damaged returns are handled differently.
11. Journal entries are balanced.
12. Duplicate clicks cannot post transactions twice.
13. Backup and restore are tested.
14. Employees cannot access unauthorized data.
15. Mobile and desktop layouts work correctly.
16. Multiple barcode and QR labels print correctly on A4 sheets.

10. Development Rules

- No omitted approved features.
- No fake or inactive buttons.
- No hardcoded financial figures.
- No localStorage as the primary database.
- No client-side owner privilege checks.
- No unprotected financial operations.
- Modular and documented code.
- Test each phase before moving to the next.
- Preserve financial and audit history.

---

Project Status: Foundation Setup

Current Phase: Phase 1 — Foundation

Development Approach: Modular, secure, tested and incremental.
