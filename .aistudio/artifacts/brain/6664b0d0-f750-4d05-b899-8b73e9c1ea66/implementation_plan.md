# Implementation Plan: Public Frontend Landing Page & Super Admin Dashboard

Create a high-converting public frontend landing page matching the Nexora Books aesthetic (`https://nexorabooks.onhercules.app/`) with a direct gateway selector, paired with an uncluttered, tabbed Super Admin Dashboard for tenant client database management, subscription controls, pricing configuration, trial duration adjustment, and automated WhatsApp payment reminders.

---

## 1. Proposed Changes & Architecture

### A. High-Level Flow & User Journey
1. **Public Frontend / Landing Page (`FrontendLandingPage.tsx`)**:
   - Modern, editorial B2B landing page with hero, live product capability showcase (Tally-speed accounting, MCA Rule 3 compliance, WhatsApp invoicing, GST reconciliation), interactive feature matrix, and pricing tiers.
   - **Direct Gateway Selector**: Top-right & Hero primary CTA to seamlessly route between:
     - **Client ERP Portal**: Mobile OTP login into full ERP Gateway, day book, and vouchers.
     - **Super Admin Dashboard**: Secure administrative console with dedicated PIN & credential verification.
2. **Super Admin Authentication (`AdminAuthModal.tsx` & context)**:
   - Protected entry for authorized personnel using Master Admin PIN / Password.
   - Default master credentials pre-configured with the ability for admins to update security PIN.
   - Session persistence in local storage with automatic timeout security.
3. **Super Admin Dashboard (`SuperAdminDashboard.tsx`)**:
   - **Tabbed, Zero-Clutter Layout**: Instead of overwhelming users with all metrics on a single screen, structured into 4 clean, focused tabs:
     - **Tab 1: Clients & Databases (`ClientsDatabaseTab.tsx`)**:
       - List of all tenant client accounts with business name, registered mobile, portal credentials (masked with toggle reveal), GSTIN, ledger/voucher statistics, and active database size.
       - Quick actions: Access/impersonate client workspace, toggle Active/Inactive, reset client credentials, export individual client JSON database, and trigger MCA compliance audit check.
     - **Tab 2: Subscriptions & Due Date Management (`SubscriptionsTab.tsx`)**:
       - Filter by status: All, Active, Trial, Expiring Soon, Expired/Deactivated, Payment Pending.
       - Clear due date badges with days remaining calculation.
       - **Auto-Deactivation Engine**: Automatically marks subscriptions inactive once trial days or plan duration has passed without payment.
       - **WhatsApp Payment Reminders**: 1-click & automated triggers to send WhatsApp payment alerts with dynamic payment link (UPI) and due date warning directly to the client's registered mobile.
     - **Tab 3: Plans & Pricing Control (`PricingPlansTab.tsx`)**:
       - Live editor for subscription tiers (Starter, Professional, Enterprise, CA Multi-Firm).
       - Ability to change plan prices (₹/month, ₹/year), discount percentage, and billing cycles.
       - **Trial Duration Controller**: Direct input to change trial days (e.g. 7, 14, 30 days) applied to all new client signups.
     - **Tab 4: Automation & Notification Rules (`AutomationSettingsTab.tsx`)**:
       - Configure WhatsApp reminder trigger thresholds (e.g., 3 days before due date, on due date, 2 days overdue).
       - Editable WhatsApp template message with placeholders `{client_name}`, `{plan_name}`, `{due_date}`, `{amount}`, `{payment_link}`.
       - Automatic trial expiry toggle switch.

---

## 2. Component Architecture & Data Model

### New Files to Create:
- `src/components/landing/FrontendLandingPage.tsx`: Public-facing landing page with hero, feature breakdown, live screenshots/interactive demo, pricing matrix, and gateway selector.
- `src/components/admin/SuperAdminDashboard.tsx`: Primary administrative layout with navigation tabs, key KPI cards, quick actions, and return-to-landing button.
- `src/components/admin/ClientsDatabaseTab.tsx`: Tab for tenant client management, database inspector, and credentials manager.
- `src/components/admin/SubscriptionsTab.tsx`: Tab for subscription health, pending payments, due dates, and WhatsApp reminder triggers.
- `src/components/admin/PricingPlansTab.tsx`: Tab for live price editing and trial days configuration.
- `src/components/admin/AutomationSettingsTab.tsx`: Tab for WhatsApp schedule rules and automated trial expiration parameters.
- `src/components/admin/AdminAuthModal.tsx`: Secure modal for administrative PIN/credential sign-in.
- `src/types/admin.ts`: TypeScript interfaces for AdminState, TenantClient, SubscriptionPlanConfig, AutomationRule.
- `src/services/adminService.ts`: Local storage persistence and state management for client accounts, plans, automated reminders, and trial expiration checks.

### Modifications to Existing Files:
- `src/App.tsx`:
  - Introduce global view state: `'landing'` | `'erp'` | `'admin'`.
  - When in `'landing'`, display `FrontendLandingPage`.
  - When in `'erp'`, display existing full ERP with `MainAppContent` and mobile OTP auth.
  - When in `'admin'`, display `SuperAdminDashboard` (guarded by `AdminAuthModal`).
  - Add quick portal switcher in header or navigation for effortless testing and seamless transitions.
- `src/context/ErpContext.tsx`:
  - Connect client registration and trial creation to dynamic trial duration set by Admin.
  - Support switching active tenant client context when Admin chooses "Access Client Database".

---

## 3. Design & Styling System (Nexora Theme Compliance)

- **OKLCH Theme Tokens**: Strict adherence to `bg-background`, `bg-card`, `text-card-foreground`, `border-border`, `bg-sidebar`, `bg-muted`, `bg-primary`, `text-primary-foreground`.
- **Typography Hierarchy**:
  - Headings & Page Titles: Noto Serif (`font-serif`) with tight tracking.
  - Body & Form Controls: IBM Plex Sans (`font-sans`).
  - Numbers, Currency, GSTINs, Voucher IDs, and Timestamps: IBM Plex Mono (`font-mono font-medium`).
- **Anti-Slop Discipline**:
  - No static pill capsules for metadata — clean unboxed typographic separators (`·`).
  - Tabbed segmented controls for clean cognitive separation — avoid putting everything on one screen.
  - Standardized `rounded-sm` (0.375rem / 6px) border radii.
  - High tabular density with clear numeric alignments.

---

## 4. Verification Plan

1. **Compilation & Linting**:
   - Run `lint_applet` (`tsc --noEmit`) to verify zero TypeScript errors.
   - Run `compile_applet` to verify clean Vite build.
2. **Landing Page & Gateway Selector**:
   - Verify public landing page renders with hero, feature breakdown, and branding.
   - Test Gateway Selector button to switch into Client ERP and Super Admin Dashboard.
3. **Super Admin Authentication**:
   - Test Admin PIN gate modal (default PIN `9999` with reset capability).
4. **Tenant Client Database Management**:
   - Verify client list displays all mock/active tenant databases with credentials and record stats.
   - Test status toggle (Active vs Deactive) and credentials inspection.
   - Test "Access Client Database" to switch directly into that client's ERP.
5. **Subscription Controls & Price Adjustment**:
   - Test editing plan prices and verify updated pricing reflects across the application.
   - Test changing trial days (e.g., from 14 to 30 days) and verify new signups receive the new duration.
6. **Automated Trial Expiration & WhatsApp Reminders**:
   - Test due date filter and click "Send WhatsApp Reminder" to verify WhatsApp alert dispatch with formatted UPI payment link.
   - Verify auto-deactivation logic identifies expired trial periods correctly.
