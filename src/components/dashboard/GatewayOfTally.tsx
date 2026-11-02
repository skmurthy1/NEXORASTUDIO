/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Scale,
  CreditCard,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
  Share2,
  Printer,
  FileText,
  Clock,
  Sparkles,
  PhoneCall,
  ShieldCheck,
  Package,
  Receipt,
  FileCheck,
  Sliders,
  Database,
  Upload,
  Server,
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { VoucherType } from '../../types/erp';
import { WhatsAppDocType } from '../../services/whatsappService';

interface GatewayOfTallyProps {
  onNavigateTab: (tabId: string) => void;
  onOpenVoucher: (type: VoucherType) => void;
  onPrintVoucher: (voucherId: string) => void;
  onOpenCompany: () => void;
  onOpenDataBackup: () => void;
  onOpenSubscription: () => void;
  onOpenWhatsApp?: (docType: WhatsAppDocType, voucher?: any, ledger?: any) => void;
  onNavigateLanding?: () => void;
}

export const GatewayOfTally: React.FC<GatewayOfTallyProps> = ({
  onNavigateTab,
  onOpenVoucher,
  onPrintVoucher,
  onOpenCompany,
  onOpenDataBackup,
  onOpenSubscription,
  onOpenWhatsApp,
  onNavigateLanding,
}) => {
  const {
    activeCompany,
    vouchers,
    ledgers,
    stockItems,
    gspConfig,
    setIsCompanySetupWizardOpen,
    loadSampleDataForTesting,
  } = useErp();

  // Financial aggregates
  const activeSales = vouchers.filter(v => v.status === 'ACTIVE' && v.voucherType === 'SALES');
  const activePurchases = vouchers.filter(v => v.status === 'ACTIVE' && v.voucherType === 'PURCHASE');

  const totalSalesTaxable = activeSales.reduce((acc, v) => acc + v.taxableTotal, 0);
  const totalSalesGrand = activeSales.reduce((acc, v) => acc + v.grandTotal, 0);
  const totalOutputGst = activeSales.reduce((acc, v) => acc + v.cgstTotal + v.sgstTotal + v.igstTotal, 0);

  const totalPurchasesTaxable = activePurchases.reduce((acc, v) => acc + v.taxableTotal, 0);
  const totalPurchasesGrand = activePurchases.reduce((acc, v) => acc + v.grandTotal, 0);
  const totalInputGst = activePurchases.reduce((acc, v) => acc + v.cgstTotal + v.sgstTotal + v.igstTotal, 0);

  const netGstPayable = Math.max(0, totalOutputGst - totalInputGst);

  // Debtors & Creditors balances
  const debtorLedgers = ledgers.filter(l => l.group === 'Sundry Debtors');
  const totalReceivables = debtorLedgers.reduce((acc, l) => acc + (l.drCr === 'Dr' ? l.currentBalance : -l.currentBalance), 0);

  const creditorLedgers = ledgers.filter(l => l.group === 'Sundry Creditors');
  const totalPayables = creditorLedgers.reduce((acc, l) => acc + (l.drCr === 'Cr' ? l.currentBalance : -l.currentBalance), 0);

  // Bank & Cash Balances
  const bankAndCashLedgers = ledgers.filter(l => l.group === 'Bank Accounts' || l.group === 'Cash-in-hand');
  const totalCashBank = bankAndCashLedgers.reduce((acc, l) => acc + (l.drCr === 'Dr' ? l.currentBalance : -l.currentBalance), 0);

  // Stock Valuation
  const totalStockValue = stockItems.reduce((acc, it) => acc + it.currentStock * it.purchasePrice, 0);

  // Send WhatsApp bill helper
  const handleWhatsAppShare = (v: typeof vouchers[0]) => {
    if (onOpenWhatsApp) {
      onOpenWhatsApp('INVOICE', v);
    }
  };

  // Keyboard navigation for menu items
  const [activeItemIndex, setActiveItemIndex] = useState<number>(0);

  const menuSections = [
    {
      title: 'MASTERS',
      items: [
        {
          id: 'create-master',
          letter: 'C',
          label: 'Create Master',
          hint: 'Ledgers, Stock, Godowns',
          action: () => onNavigateTab('masters'),
        },
        {
          id: 'chart-accounts',
          letter: 'A',
          label: 'Chart of Accounts',
          hint: 'Tally Standard 28 Groups',
          action: () => onNavigateTab('masters'),
        },
        {
          id: 'stock-inventory',
          letter: 'I',
          label: 'Inventory & Stock Items',
          hint: 'HSN, GST Slabs, Godowns',
          action: () => onNavigateTab('masters'),
        },
      ],
    },
    {
      title: 'TRANSACTIONS',
      items: [
        {
          id: 'vouchers-entry',
          letter: 'V',
          label: 'Vouchers Entry',
          hint: 'F4 to F9 Double-Entry',
          action: () => onOpenVoucher('SALES'),
        },
        {
          id: 'day-book',
          letter: 'D',
          label: 'Day Book',
          hint: 'Transaction Register',
          action: () => onNavigateTab('vouchers'),
        },
        {
          id: 'orders-challans',
          letter: 'O',
          label: 'Orders & Challans',
          hint: 'Quotes, Sales Orders, DC',
          action: () => onNavigateTab('orders'),
        },
      ],
    },
    {
      title: 'REPORTS & STATEMENTS',
      items: [
        {
          id: 'balance-sheet',
          letter: 'B',
          label: 'Balance Sheet',
          hint: 'Horizontal T-Format',
          action: () => onNavigateTab('statements'),
        },
        {
          id: 'profit-loss',
          letter: 'P',
          label: 'Profit & Loss Account',
          hint: 'Trading & Net Profit',
          action: () => onNavigateTab('statements'),
        },
        {
          id: 'trial-balance',
          letter: 'T',
          label: 'Trial Balance',
          hint: 'Dr/Cr Ledger Drill-Down',
          action: () => onNavigateTab('statements'),
        },
        {
          id: 'ratio-analysis',
          letter: 'R',
          label: 'Ratio Analysis',
          hint: 'Liquidity & Working Capital',
          action: () => onNavigateTab('statements'),
        },
      ],
    },
    {
      title: 'STATUTORY & COMPLIANCE',
      items: [
        {
          id: 'gstr1',
          letter: 'G',
          label: 'GSTR-1 Outward Return',
          hint: 'B2B, B2C, HSN & Portal JSON',
          action: () => onNavigateTab('gst'),
        },
        {
          id: 'gstr3b',
          letter: '3',
          label: 'GSTR-3B Tax Liability',
          hint: 'Output Tax & ITC Offset',
          action: () => onNavigateTab('gst'),
        },
        {
          id: 'gstr2b',
          letter: '2',
          label: 'GSTR-2B Matching',
          hint: 'Inward ITC Reconciliation',
          action: () => onNavigateTab('gst'),
        },
        {
          id: 'eway-einv',
          letter: 'E',
          label: 'e-Way Bill & e-Invoice',
          hint: 'IRN & Signed QR Code',
          action: () => onNavigateTab('gst'),
        },
        {
          id: 'gsp-settings',
          letter: 'S',
          label: 'GSP API & IRP Credentials',
          hint: `${gspConfig.provider} (${gspConfig.environment})`,
          badge: gspConfig.authStatus === 'CONNECTED' ? 'Connected' : 'Setup',
          action: () => onNavigateTab('gsp-settings'),
        },
        {
          id: 'audit-trail',
          letter: 'L',
          label: 'Audit Trail & Edit Log',
          hint: 'MCA Rule 3(1) Compliant',
          badge: 'Active',
          action: () => onNavigateTab('audit-trail'),
        },
      ],
    },
    {
      title: 'UTILITIES & CLOUD',
      items: [
        {
          id: 'backup-restore',
          letter: 'B',
          label: 'Backup & Restore (Tally & Busy Migration)',
          hint: 'Restore Tally XML / Busy / JSON',
          action: () => onNavigateTab('backup-restore'),
        },
        {
          id: 'my-subscription',
          letter: 'M',
          label: 'My Subscription & Invoices',
          hint: 'Tier, Tax Invoices & Payment Methods',
          badge: 'Billing',
          action: () => onNavigateTab('my-subscription'),
        },
        {
          id: 'subscription',
          letter: 'U',
          label: 'Upgrade ERP License',
          hint: 'Razorpay Pro Plan Checkout',
          action: onOpenSubscription,
        },
      ],
    },
  ];

  const flatItems = menuSections.flatMap(s => s.items);

  // Global keydown handler when viewing Gateway
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      const key = e.key.toUpperCase();
      const match = flatItems.find(it => it.letter.toUpperCase() === key);
      if (match && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        match.action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flatItems]);

  const currentDateFormatted = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 pb-24 md:pb-6 lg:grid-cols-[1fr_21rem]">
      {/* Return to Public Website Banner */}
      {onNavigateLanding && (
        <div className="lg:col-span-2 p-2.5 px-4 bg-muted/40 rounded-sm border border-border flex items-center justify-between text-xs text-muted-foreground shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">Client ERP Workspace Active</span>
            <span className="text-border">·</span>
            <span className="hidden sm:inline">Browse commercial pricing plans or company information on public site:</span>
          </div>
          <button
            onClick={onNavigateLanding}
            className="font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span>Return to Main Website</span>
            <ArrowRight size={13} />
          </button>
        </div>
      )}

      {/* LEFT SECTION (Main Workspace & Overview) */}
      <section className="min-w-0 space-y-4">
        {/* Company Title Header */}
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Gateway of
            </p>
            <span className="text-muted-foreground/40">·</span>
            <button
              onClick={() => onNavigateTab('audit-trail')}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              <ShieldCheck size={12} />
              <span>MCA Rule 3(1) Edit Log: Active</span>
            </button>
          </div>
          <h1 className="truncate font-serif text-3xl sm:text-4xl tracking-tight text-foreground font-bold">
            {activeCompany.name}
          </h1>
        </div>

        {/* Company Overview Strip (Matches nexorabooks.onhercules.app PI component) */}
        <div className="rounded-md border border-border bg-card shadow-xs overflow-hidden">
          <dl className="grid grid-cols-2 divide-x divide-y divide-border text-sm sm:grid-cols-4 sm:divide-y-0">
            <div className="min-w-0 px-4 py-3">
              <dt className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                Current period
              </dt>
              <dd className="truncate pt-0.5 font-mono text-xs text-foreground font-semibold">
                01-Apr-2026 to 31-Mar-2027
              </dd>
            </div>
            <div className="min-w-0 px-4 py-3">
              <dt className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                Current date
              </dt>
              <dd className="truncate pt-0.5 font-mono text-xs text-foreground font-semibold">
                {currentDateFormatted}
              </dd>
            </div>
            <div className="min-w-0 px-4 py-3">
              <dt className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                GSTIN
              </dt>
              <dd className="truncate pt-0.5 font-mono text-xs text-foreground font-bold">
                {activeCompany.gstin || 'Unregistered'}
              </dd>
            </div>
            <div className="min-w-0 px-4 py-3">
              <dt className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                Registration
              </dt>
              <dd className="truncate pt-0.5 font-mono text-xs text-foreground">
                {activeCompany.registrationType} · {activeCompany.state} ({activeCompany.stateCode})
              </dd>
            </div>
          </dl>
        </div>

        {/* Quick Voucher Entry Action Buttons Strip */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onOpenVoucher('SALES')}
            className="px-3.5 py-1.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-sm shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>+ Sales Invoice</span>
            <kbd className="font-mono text-[10px] bg-primary-foreground/20 text-primary-foreground px-1 py-0.2 rounded">
              F8
            </kbd>
          </button>
          <button
            onClick={() => onOpenVoucher('PURCHASE')}
            className="px-3.5 py-1.5 text-xs font-semibold bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-sm border border-border shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>+ Purchase</span>
            <kbd className="font-mono text-[10px] bg-muted text-foreground px-1 py-0.2 rounded border border-border">
              F9
            </kbd>
          </button>
          <button
            onClick={onOpenCompany}
            className="px-3 py-1.5 text-xs font-medium bg-card hover:bg-accent hover:text-accent-foreground text-foreground rounded-sm border border-border transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Building2 size={13} className="text-muted-foreground" />
            <span>Alter Company</span>
            <kbd className="font-mono text-[10px] text-muted-foreground">F3</kbd>
          </button>
          <button
            onClick={() => onNavigateTab('gsp-settings')}
            className="px-3 py-1.5 text-xs font-medium bg-card hover:bg-accent hover:text-accent-foreground text-foreground rounded-sm border border-border transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span
              className={`size-2 rounded-full ${
                gspConfig.authStatus === 'CONNECTED' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span>GSP: {gspConfig.provider}</span>
          </button>
        </div>

        {/* Real-time Business KPI Metric Strip (Matches nexorabooks.onhercules.app) */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {/* Total Turnover */}
          <div className="rounded-md border border-border bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Turnover (Sales)</span>
              <TrendingUp className="size-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="pt-2 font-mono text-lg font-bold tabular-nums text-foreground">
              ₹{totalSalesGrand.toLocaleString('en-IN')}
            </p>
            <div className="mt-1 text-[11px] text-muted-foreground flex items-center justify-between">
              <span>Taxable: ₹{totalSalesTaxable.toLocaleString('en-IN')}</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                GST ₹{totalOutputGst.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Total Purchases & ITC */}
          <div className="rounded-md border border-border bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Purchases (Inward)</span>
              <TrendingDown className="size-4 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="pt-2 font-mono text-lg font-bold tabular-nums text-foreground">
              ₹{totalPurchasesGrand.toLocaleString('en-IN')}
            </p>
            <div className="mt-1 text-[11px] text-muted-foreground flex items-center justify-between">
              <span>Taxable: ₹{totalPurchasesTaxable.toLocaleString('en-IN')}</span>
              <span className="text-blue-600 dark:text-blue-400 font-mono">
                ITC ₹{totalInputGst.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Net GST Output Liability */}
          <div className="rounded-md border border-border bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Net GST Output</span>
              <Scale className="size-4 text-amber-500" />
            </div>
            <p className="pt-2 font-mono text-lg font-bold tabular-nums text-foreground">
              ₹{netGstPayable.toLocaleString('en-IN')}
            </p>
            <div className="mt-1 text-[11px] text-muted-foreground">
              <span>Outward ₹{totalOutputGst.toLocaleString('en-IN')} - Inward ITC ₹{totalInputGst.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Receivables (Debtors) */}
          <div className="rounded-md border border-border bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Receivables (Debtors)</span>
              <Receipt className="size-4 text-emerald-600" />
            </div>
            <p className="pt-2 font-mono text-lg font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
              ₹{totalReceivables.toLocaleString('en-IN')}
            </p>
            <div className="mt-1 text-[11px] text-muted-foreground">
              <span>{debtorLedgers.length} registered customers</span>
            </div>
          </div>

          {/* Payables (Creditors) */}
          <div className="rounded-md border border-border bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Payables (Creditors)</span>
              <CreditCard className="size-4 text-rose-600" />
            </div>
            <p className="pt-2 font-mono text-lg font-bold tabular-nums text-rose-700 dark:text-rose-400">
              ₹{totalPayables.toLocaleString('en-IN')}
            </p>
            <div className="mt-1 text-[11px] text-muted-foreground">
              <span>{creditorLedgers.length} suppliers</span>
            </div>
          </div>

          {/* Cash & Bank Balances */}
          <div className="rounded-md border border-border bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Cash & Bank Balances</span>
              <Building2 className="size-4 text-primary" />
            </div>
            <p className="pt-2 font-mono text-lg font-bold tabular-nums text-primary">
              ₹{totalCashBank.toLocaleString('en-IN')}
            </p>
            <div className="mt-1 text-[11px] text-muted-foreground">
              <span>Stock Value: ₹{totalStockValue.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Prominent Software Migration & Restore Hub Card */}
        <div className="rounded-md border border-border bg-card shadow-xs p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="p-2 rounded-sm bg-primary/10 text-primary shrink-0 mt-0.5">
              <Database className="size-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-xs sm:text-sm text-foreground">
                  Tally Prime & Busy Accounting Migration
                </h3>
                <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded-xs bg-muted text-primary border border-border">
                  2-Way Compatible
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-xl">
                Restore company masters, inventory items, and historical vouchers directly from old Tally Prime/ERP 9 XML backups or Busy Accounting files.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => onNavigateTab('backup-restore')}
              className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="size-3.5" />
              <span>Open Migration Hub</span>
            </button>
          </div>
        </div>

        {/* Recent Tax Invoices & Day Book List */}
        <div className="rounded-md border border-border bg-card shadow-xs p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-foreground">Recent Tax Invoices & Day Book</h3>
              <p className="text-xs text-muted-foreground">Instant Print [Alt+P] or WhatsApp directly to customer</p>
            </div>
            <button
              onClick={() => onNavigateTab('vouchers')}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              View Full Day Book <ArrowRight size={12} />
            </button>
          </div>

          <div className="divide-y divide-border">
            {vouchers.length === 0 ? (
              <div className="py-8 px-4 text-center rounded-sm bg-muted/20 border border-dashed border-border space-y-3">
                <Receipt className="mx-auto size-8 text-muted-foreground/50" />
                <div>
                  <h4 className="font-bold text-sm text-foreground">Clean Books Active · Zero Vouchers</h4>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto mt-0.5">
                    Your company <strong>{activeCompany.name}</strong> is freshly initialized. Start by recording your first sale or setup your GST and bank details.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <button
                    onClick={() => onOpenVoucher('SALES')}
                    className="px-3 py-1.5 text-xs font-bold bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Record First Sale [F8]</span>
                    <ArrowRight size={13} />
                  </button>

                  <button
                    onClick={() => setIsCompanySetupWizardOpen(true)}
                    className="px-3 py-1.5 text-xs font-semibold bg-card hover:bg-muted text-foreground border border-border rounded-sm transition-colors cursor-pointer"
                  >
                    Edit Business Details
                  </button>

                  <button
                    onClick={loadSampleDataForTesting}
                    className="px-3 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-sm transition-colors cursor-pointer"
                  >
                    Preload Sample MSME Data
                  </button>
                </div>
              </div>
            ) : (
              vouchers.slice(0, 5).map(v => (
                <div key={v.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-foreground">{v.voucherNumber}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.2 rounded-sm ${
                          v.voucherType === 'SALES'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                            : v.voucherType === 'PURCHASE'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {v.voucherType}
                      </span>
                      <span className="text-muted-foreground font-mono text-[11px]">{v.date}</span>
                    </div>
                    <div className="text-muted-foreground truncate max-w-sm mt-0.5">
                      {v.partyName || 'Cash / Bank Transfer'} {v.partyGstin ? `· GSTIN: ${v.partyGstin}` : ''}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono font-bold text-sm text-foreground">
                      ₹{v.grandTotal.toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => onPrintVoucher(v.id)}
                      className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-sm transition-colors cursor-pointer"
                      title="Print Voucher [Alt+P]"
                    >
                      <Printer size={14} />
                    </button>
                    {onOpenWhatsApp && (
                      <button
                        onClick={() => handleWhatsAppShare(v)}
                        className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-sm transition-colors cursor-pointer"
                        title="Send Tax Invoice via WhatsApp"
                      >
                        <Share2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* RIGHT SECTION: Authentic Gateway of Tally Sticky Menu Panel (Matches nexorabooks.onhercules.app sI component) */}
      <nav
        aria-label="Gateway of Nexora"
        className="h-fit lg:sticky lg:top-18 overflow-hidden rounded-md border border-border bg-card shadow-sm select-none"
      >
        <h2 className="border-b border-border bg-primary px-4 py-2 text-center text-sm font-semibold tracking-wide text-primary-foreground">
          Gateway of Nexora
        </h2>

        <div className="py-2 divide-y divide-border/60">
          {menuSections.map((sec, sIdx) => (
            <div key={sec.title} className={sIdx > 0 ? 'pt-2' : ''}>
              <p className="px-5 pt-1.5 pb-1 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                {sec.title}
              </p>
              <div className="space-y-0.5 pb-1">
                {sec.items.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={item.action}
                    className="group flex w-full cursor-pointer items-center justify-between px-5 py-1.5 text-left text-xs transition-colors hover:bg-accent hover:text-accent-foreground text-foreground"
                  >
                    <span className="flex items-center gap-2 font-medium">
                      {/* Highlighted Hotkey single-letter in bold amber */}
                      <span>
                        <span className="text-amber-600 dark:text-amber-400 font-bold underline decoration-amber-500/80 decoration-2 underline-offset-2">
                          {item.letter}
                        </span>
                        {item.label.replace(new RegExp(`^${item.letter}`, 'i'), '')}
                      </span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      {item.badge && (
                        <span className="text-[10px] font-mono text-primary bg-primary/10 px-1 py-0.2 rounded border border-primary/20">
                          {item.badge}
                        </span>
                      )}
                      <ArrowRight
                        size={12}
                        className="text-muted-foreground/50 group-hover:text-foreground transition-colors group-hover:translate-x-0.5"
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer tip */}
        <div className="p-3 bg-muted/40 border-t border-border text-[11px] text-muted-foreground text-center">
          Press underlined letters to jump directly
        </div>
      </nav>
    </div>
  );
};
