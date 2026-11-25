# StockWise — Computer Shop ERP

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=000)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=fff)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=fff)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%7C%20Auth%20%7C%20RLS-3ECF8E?logo=supabase&logoColor=fff)
![pnpm](https://img.shields.io/badge/pnpm-10-F69220?logo=pnpm&logoColor=fff)

---

## 1. Project Overview

**StockWise** is a web-based Computer Shop Enterprise Resource Planning (ERP) application designed to manage daily retail and inventory operations for computer hardware and IT stores. It centralizes product catalog tracking, supplier purchase orders, point-of-sale (POS) invoicing, customer and supplier payments, operational expenses, financial analytics, and role-based staff access on top of a Supabase PostgreSQL backend.

---

## 2. Key Features

- **Dashboard**: Live KPI cards (Billed Sales, Total Invoices, Purchase Bills, Low Stock Alert, Cash Received, Total Cash Outflow, Net Cash Flow, Outstanding Receivable), interactive SVG/chart visualizations (Sales vs. Purchase comparison, Revenue Trend over 7d/30d/6m, Inventory Status breakdown), and a searchable Recent Sales table.
- **Product Management**: Add, edit, archive (soft delete), and restore hardware products with SKU, barcode, category, cost/selling price, unit, stock quantity, and minimum stock threshold (`min_stock_level`), with atomic opening-stock logging.
- **Inventory Management**: Real-time catalog overview with total SKUs, total stock units, cost valuation, low-stock counters, and filtering by search query (name, SKU, barcode), category, stock status, and lifecycle status (`active`, `inactive`, `archived`).
- **Purchase Management**: Create, view, edit, and (Admin-only) delete supplier purchase orders with multi-item lines, discounts, VAT, payment tracking, and fulfillment statuses (`pending`, `ordered`, `received`).
- **POS / Sales Management**: Create, view, and manage POS sale invoices for registered or walk-in customers with multi-item lines, discounts, tax/VAT, payment method selection (`Cash`, `Card`, `Bank Transfer`, `MFS`), payment history tracking, and invoice detail views. Sales records can be viewed and managed, but permanent deletion is not available through the application.
- **Customer Management**: Maintain customer profiles and receivable balances in Supabase, including inline customer creation during POS checkout for authorized roles.
- **Supplier Management**: Maintain vendor profiles (contact person, phone, email, address) integrated with purchase order creation and supplier payable tracking.
- **Payment Management**: Dedicated tabs under Financial Accounts for tracking **Customer Payments** (inward receipts linked to sales), **Supplier Payments** (outward disbursements linked to purchases), and **Income Management**.
- **Expense Management**: Record, search, filter, and delete store operating expenses (e.g., rent, utilities, salaries) with category, payment method, and reference numbers.
- **Reports & Financial Analytics**: Monthly Income vs. Expense bar charts (6-month and 12-month toggles), average monthly cash metrics, category-wise expense breakdowns, and a Profit & Loss summary within Financial Accounts.
- **User Management**: Manage operator accounts backed by Supabase Auth and `profiles`, supporting profile creation/syncing, role assignment, and account activation/deactivation.

---

## 3. User Roles & Permissions

Access control is enforced both in the frontend (`apps/web/src/utils/permissions.ts`) and in PostgreSQL via Supabase Row Level Security (RLS) policies and trigger checks (`supabase/migrations/02_rbac_policies.sql`).

| Role | Module Access | Key Permissions |
| :--- | :--- | :--- |
| **Admin** | Dashboard, Sales, Purchase, Inventory, Accounts, User Management | Full operational control across all modules; create, view, and edit sales (permanent deletion is not available through the application); create/edit/delete purchases; create/edit/delete customers, suppliers, and expenses; create/edit/archive/restore products; manage all user accounts and assign `admin`, `manager`, or `staff` roles (protected against removing or demoting the last active Admin). |
| **Manager** | Dashboard, Sales, Purchase, Inventory, Accounts, User Management | Create, view, and edit sales, purchases, and inventory products (cannot delete purchases; permanent deletion of sales records is not available through the application); full management of customers, suppliers, and expenses; view accounts analytics; view users and manage `staff` accounts only (cannot assign or modify Admin/Manager roles or access system settings). |
| **Staff** | Dashboard, Sales, Inventory (read-only) | View Dashboard metrics, Inventory catalog, and Customer records; create POS sales and view/record payments only on sales they created (`created_by = auth.uid()`). No access to Purchases, Accounts, Suppliers, Expenses, or User Management. |

---

## 4. Business Workflow

1. **Product Setup**: Admins or Managers register hardware SKUs with cost price, selling price, minimum stock threshold, and optional opening stock (recorded as an initial `stock_in` movement).
2. **Purchase Creation & Receiving**: Admins or Managers create supplier purchase orders (`pending`, `ordered`, or `received`). Confirming goods receipt executes the atomic `receive_purchase_goods_transaction` RPC.
3. **Inventory Stock Updates**: Receiving a purchase order increments `products.stock_quantity` (or `quantity`) and inserts `stock_in` audit entries in `stock_movements`.
4. **POS Sales & Stock Deduction**: Staff, Managers, or Admins process POS invoices via `process_sale_transaction`. Completed sales validate available stock under row locks, deduct sold quantities, and insert `stock_out` entries in `stock_movements`. Payment updates on existing sales are recorded via `update_sale_payment_transaction`.
5. **Payment & Expense Management**: Customer receipts and supplier payouts are recorded in `payments`, while operational bills are logged in `expenses` and aggregated into Financial Accounts.
6. **Low-Stock Monitoring**: Products with `stock_quantity > 0` and `stock_quantity <= min_stock_level` (as well as out-of-stock items) are surfaced in Inventory filters and Dashboard alerts.

> **Stock Integrity Rule:** Stock increases when purchases are marked as **received** and decreases when sales are **completed**. Payment status (`paid`, `partial`, `unpaid`) tracks financial settlement only and does **not** independently change stock quantities.

---

## 5. Technology Stack

| Technology | Purpose |
| :--- | :--- |
| **React 19** | Component-based frontend UI |
| **TypeScript 6** | Static typing across components, services, and database models |
| **Vite 8** | Frontend build tool and local development server |
| **Styled Components 6** | Component-level styling and responsive theming |
| **Lucide React** | UI iconography |
| **Supabase (`@supabase/supabase-js`)** | PostgreSQL database client, authentication, and RPC execution |
| **PostgreSQL + Supabase Auth** | Relational storage, authentication, Row Level Security (RLS), triggers, and PL/pgSQL RPCs |
| **pnpm 10** | Monorepo workspace package management |
| **ESLint 10** | Static code linting and React Hooks checks |

---

## 6. Project Structure

```text
StockWise/
├── apps/
│   └── web/                        # Frontend React + TypeScript + Vite application
│       ├── .env.example            # Frontend environment variable template
│       ├── package.json            # Web app scripts and dependencies
│       ├── index.html              # HTML entry point
│       └── src/
│           ├── components/         # Feature modules (accounts, auth, common, dashboard, inventory, layout, purchase, sales, users)
│           ├── context/            # AuthContext and ToastContext providers
│           ├── hooks/              # Custom hooks for accounts and financial analytics
│           ├── lib/                # Supabase client initialization
│           ├── routes/             # Module routing and RBAC access guard
│           ├── services/           # Supabase queries and RPC wrappers per domain
│           ├── theme/              # Theme tokens, breakpoints, and global styles
│           ├── types/              # Domain and database TypeScript definitions
│           ├── utils/              # Permissions matrix, formatters, constants, calculations
│           └── validations/        # Form validation logic for sales, purchases, products, expenses
├── docs/
│   └── database-schema.md          # Entity-relationship and schema documentation
├── supabase/
│   └── migrations/                 # SQL migrations for Auth, RBAC RLS, soft delete, stock sync, and profile sync
├── package.json                    # Root workspace scripts
└── pnpm-workspace.yaml             # pnpm workspace configuration
```

---

## 7. Database Overview

StockWise runs on **Supabase PostgreSQL** with **Supabase Auth**, **Row Level Security (RLS)** enabled on all **12 core ERP tables**, database triggers (such as role escalation protection and product hard-delete prevention), and atomic `SECURITY DEFINER` **RPC functions** (`create_product_with_opening_stock`, `receive_purchase_goods_transaction`, `process_sale_transaction`, `update_sale_payment_transaction`, `upsert_user_profile`).

| Table | Responsibility |
| :--- | :--- |
| `profiles` | Extended user profile metadata (`full_name`, `email`, `phone`, `role`, `is_active`) linked 1:1 to `auth.users` |
| `categories` | Product classification groups |
| `products` | Hardware catalog, SKU/barcode, cost & selling prices, stock quantity, minimum threshold, and archive status |
| `customers` | Customer directory and receivable balances |
| `suppliers` | Vendor directory and payable balances |
| `purchases` | Purchase order headers, supplier links, totals, fulfillment status, and payment status |
| `purchase_items` | Line items (product, quantity, unit cost, subtotal) belonging to a purchase order |
| `sales` | POS invoice headers, optional customer link, totals, discounts, tax, and order status |
| `sale_items` | Line items (product, quantity, unit price, subtotal) belonging to a sale invoice |
| `stock_movements` | Audit ledger of stock additions, deductions, and adjustments with before/after quantities |
| `payments` | Monetary receipts and disbursements tied to sales, purchases, customers, or suppliers |
| `expenses` | Store operating expenditures by category, date, and payment method |

For full schema details and relationships, see [`docs/database-schema.md`](docs/database-schema.md).

---

## 8. Installation & Setup

### Prerequisites
- **Node.js** (LTS recommended)
- **pnpm** (`10.x`)
- A configured **Supabase** project with the 12 ERP tables and SQL migrations in `supabase/migrations/` applied

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/FarjanaAkterLaila/StockWise.git
   cd StockWise
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment variables**
   Copy `apps/web/.env.example` to `apps/web/.env` and fill in your Supabase project credentials:
   ```bash
   cp apps/web/.env.example apps/web/.env
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. **Build for production**
   ```bash
   pnpm build
   ```

Other available root scripts:
- `pnpm lint` — Runs ESLint across the web application
- `pnpm preview` — Previews the production Vite build locally

---

## 9. Environment Variables

Configure the following required frontend variables in `apps/web/.env`:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-public-anon-key
```

> Never expose Supabase `service_role` keys or private credentials in frontend environment files.

---

## 10. Live Demo

[https://stock-wise-seven-beige.vercel.app/](https://stock-wise-seven-beige.vercel.app/)

---

## 11. Future Improvements

The following items are potential future enhancements and are **not** currently implemented:

- Barcode Scanning
- Advanced Sales and Profit Reports
- Invoice and Receipt Printing
- Automated Low-Stock Notifications
- Data Export and Backup
- Multi-Branch Support
