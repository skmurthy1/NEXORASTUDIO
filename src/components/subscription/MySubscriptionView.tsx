/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  QrCode,
  Building,
  CheckCircle2,
  Download,
  Printer,
  Plus,
  Trash2,
  Star,
  Zap,
  Repeat,
  Clock,
  ShieldCheck,
  AlertCircle,
  Calendar,
  ArrowUpRight,
  FileText,
  Sparkles,
  ExternalLink,
  X,
  ChevronRight,
  Info,
  Lock,
  Pause,
  Play,
  Ban,
  Search,
  Check,
  Building2,
  Receipt,
  FileSpreadsheet,
  LifeBuoy,
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { SubscriptionTier, BillingCycle, PaymentTransaction } from '../../types/erp';
import { QrCodeSvg } from '../common/QrCodeSvg';

export interface SavedPaymentMethod {
  id: string;
  type: 'UPI' | 'CARD' | 'NET_BANKING';
  title: string;
  subtitle: string;
  isDefault: boolean;
  brand?: 'Visa' | 'Mastercard' | 'RuPay' | 'UPI' | 'Bank';
  cardLast4?: string;
  cardExpiry?: string;
  vpa?: string;
  bankName?: string;
  accountLast4?: string;
  mandateId?: string;
  addedAt: string;
}

const SAVED_METHODS_STORAGE_KEY = 'nexora_saved_payment_methods';

const DEFAULT_PAYMENT_METHODS: SavedPaymentMethod[] = [
  {
    id: 'pm-upi-1',
    type: 'UPI',
    title: 'BHIM UPI AutoPay',
    subtitle: 'skmurthy@oksbi',
    isDefault: true,
    brand: 'UPI',
    vpa: 'skmurthy@oksbi',
    mandateId: 'UMRN-AUTOPAY-202688192',
    addedAt: '2026-04-30',
  },
  {
    id: 'pm-card-1',
    type: 'CARD',
    title: 'HDFC Business Regalia Card',
    subtitle: 'Mastercard ending in 4488',
    isDefault: false,
    brand: 'Mastercard',
    cardLast4: '4488',
    cardExpiry: '08/29',
    addedAt: '2026-04-15',
  },
  {
    id: 'pm-bank-1',
    type: 'NET_BANKING',
    title: 'State Bank of India (e-NACH)',
    subtitle: 'Current Account ending in 9102',
    isDefault: false,
    brand: 'Bank',
    bankName: 'State Bank of India',
    accountLast4: '9102',
    mandateId: 'UMRN-NACH-202611029',
    addedAt: '2026-03-20',
  },
];

interface MySubscriptionViewProps {
  onOpenSubscriptionModal: () => void;
  onNavigateTab: (tab: string) => void;
  onOpenSupportModal?: () => void;
}

export const MySubscriptionView: React.FC<MySubscriptionViewProps> = ({
  onOpenSubscriptionModal,
  onNavigateTab,
  onOpenSupportModal,
}) => {
  const {
    subscription,
    payments,
    activeCompany,
    auth,
    toggleRecurringMandateStatus,
    cancelRecurringMandate,
    setSubscriptionStatus,
  } = useErp();

  // Saved Payment Methods State
  const [paymentMethods, setPaymentMethods] = useState<SavedPaymentMethod[]>(() => {
    try {
      const saved = localStorage.getItem(SAVED_METHODS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load saved payment methods', e);
    }
    return DEFAULT_PAYMENT_METHODS;
  });

  // Modal / Form States
  const [isAddMethodOpen, setIsAddMethodOpen] = useState(false);
  const [newMethodType, setNewMethodType] = useState<'UPI' | 'CARD' | 'NET_BANKING'>('UPI');
  const [newVpa, setNewVpa] = useState('');
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardExpiry, setNewCardExpiry] = useState('');
  const [newCardCvv, setNewCardCvv] = useState('');
  const [newCardHolder, setNewCardHolder] = useState('');
  const [newBankName, setNewBankName] = useState('HDFC Bank');
  const [newAccountNo, setNewAccountNo] = useState('');
  const [newIfsc, setNewIfsc] = useState('');
  const [isNewDefault, setIsNewDefault] = useState(false);

  // Invoices & Invoice Preview Modal
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [previewTxn, setPreviewTxn] = useState<PaymentTransaction | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Sync payment methods to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SAVED_METHODS_STORAGE_KEY, JSON.stringify(paymentMethods));
    } catch (e) {
      console.error('Failed to save payment methods', e);
    }
  }, [paymentMethods]);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  // Plan Details Helper
  const getTierPricing = (tier: SubscriptionTier, cycle: BillingCycle) => {
    if (tier === 'STARTER') return cycle === 'ANNUAL' ? { amount: 4990, label: '₹4,990 / year' } : { amount: 499, label: '₹499 / month' };
    if (tier === 'ENTERPRISE') return cycle === 'ANNUAL' ? { amount: 23990, label: '₹23,990 / year' } : { amount: 2499, label: '₹2,499 / month' };
    return cycle === 'ANNUAL' ? { amount: 11990, label: '₹11,990 / year' } : { amount: 1199, label: '₹1,199 / month' };
  };

  const currentPricing = getTierPricing(subscription.tier, subscription.cycle);

  // Days remaining calculation
  const validTillDate = new Date(subscription.validTill);
  const today = new Date();
  const diffTime = validTillDate.getTime() - today.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  // Handle Setting Default Payment Method
  const handleSetDefaultMethod = (id: string) => {
    const updated = paymentMethods.map(pm => ({
      ...pm,
      isDefault: pm.id === id,
    }));
    setPaymentMethods(updated);
    showNotice('Default payment method updated for recurring subscription renewals.');
  };

  // Handle Deleting Payment Method
  const handleDeleteMethod = (id: string) => {
    if (paymentMethods.length <= 1) {
      showNotice('At least one payment method must remain on file for your active ERP account.');
      return;
    }
    const target = paymentMethods.find(pm => pm.id === id);
    const updated = paymentMethods.filter(pm => pm.id !== id);
    if (target?.isDefault && updated.length > 0) {
      updated[0].isDefault = true;
    }
    setPaymentMethods(updated);
    showNotice('Payment method removed successfully.');
  };

  // Handle Adding New Payment Method
  const handleAddNewMethod = (e: React.FormEvent) => {
    e.preventDefault();

    let newMethod: SavedPaymentMethod;
    const nowStr = new Date().toISOString().split('T')[0];

    if (newMethodType === 'UPI') {
      if (!newVpa.includes('@')) {
        showNotice('Please enter a valid UPI ID (e.g. business@okhdfcbank)');
        return;
      }
      newMethod = {
        id: `pm-upi-${Date.now()}`,
        type: 'UPI',
        title: 'UPI AutoPay Mandate',
        subtitle: newVpa.trim(),
        isDefault: isNewDefault || paymentMethods.length === 0,
        brand: 'UPI',
        vpa: newVpa.trim(),
        mandateId: `UMRN-AUTOPAY-${Math.floor(10000000 + Math.random() * 90000000)}`,
        addedAt: nowStr,
      };
    } else if (newMethodType === 'CARD') {
      const cleanNum = newCardNumber.replace(/\s+/g, '');
      const last4 = cleanNum.slice(-4) || '9981';
      newMethod = {
        id: `pm-card-${Date.now()}`,
        type: 'CARD',
        title: `${newCardHolder.trim() || 'Business'} Corporate Card`,
        subtitle: `Card ending in ${last4}`,
        isDefault: isNewDefault || paymentMethods.length === 0,
        brand: cleanNum.startsWith('4') ? 'Visa' : cleanNum.startsWith('5') ? 'Mastercard' : 'RuPay',
        cardLast4: last4,
        cardExpiry: newCardExpiry || '12/28',
        addedAt: nowStr,
      };
    } else {
      const last4 = newAccountNo.slice(-4) || '5521';
      newMethod = {
        id: `pm-bank-${Date.now()}`,
        type: 'NET_BANKING',
        title: `${newBankName} (e-NACH Mandate)`,
        subtitle: `Current A/C ending in ${last4}`,
        isDefault: isNewDefault || paymentMethods.length === 0,
        brand: 'Bank',
        bankName: newBankName,
        accountLast4: last4,
        mandateId: `UMRN-NACH-${Math.floor(10000000 + Math.random() * 90000000)}`,
        addedAt: nowStr,
      };
    }

    let updatedList = paymentMethods;
    if (newMethod.isDefault) {
      updatedList = updatedList.map(pm => ({ ...pm, isDefault: false }));
    }
    setPaymentMethods([newMethod, ...updatedList]);
    setIsAddMethodOpen(false);
    setNewVpa('');
    setNewCardNumber('');
    setNewCardExpiry('');
    setNewCardCvv('');
    setNewCardHolder('');
    setNewAccountNo('');
    setNewIfsc('');
    setIsNewDefault(false);
    showNotice(`New payment method (${newMethod.title}) authorized and saved.`);
  };

  // Download Invoice as formatted text file
  const handleDownloadInvoice = (txn: PaymentTransaction) => {
    const text = `
=============================================================
             NEXORA TECHNOLOGIES PRIVATE LIMITED
         Corporate Office: BKC Complex, Bandra, Mumbai
               GSTIN: 27AABCN8899K1ZV
                  SAC Code: 998313
=============================================================
TAX INVOICE FOR CLOUD SOFTWARE SUBSCRIPTION
Invoice No: ${txn.invoiceUrl || `NEXORA-INV-2026-${txn.id.slice(-5)}`}
Invoice Date: ${txn.date}
Payment Ref: ${txn.referenceId}
Payment Channel: ${txn.method}${txn.isRecurring ? `\nRecurring Mandate ID (UMRN): ${txn.mandateId}` : ''}
-------------------------------------------------------------
BILLED TO RECIPIENT:
Customer: ${activeCompany.name}
Trade Name: ${activeCompany.tradeName || activeCompany.name}
GSTIN: ${activeCompany.gstin || '27AAACB2212M1Z1'}
Address: ${activeCompany.address || 'MIDC Industrial Area, Andheri East, Mumbai, Maharashtra (27)'}
State / State Code: ${activeCompany.state || 'Maharashtra'} (${activeCompany.stateCode || '27'})
-------------------------------------------------------------
DESCRIPTION                          SAC CODE    AMOUNT (INR)
-------------------------------------------------------------
Nexora Books Cloud ERP Subscription   998313      ₹${txn.taxableAmount.toLocaleString('en-IN')}
Tier: ${txn.plan} (${txn.cycle})
Billing Model: ${txn.isRecurring ? 'Recurring Auto-Debit (NPCI Mandate)' : 'Direct Payment'}
-------------------------------------------------------------
Taxable Value:                                   ₹${txn.taxableAmount.toLocaleString('en-IN')}
CGST @ 9%:                                       ₹${(txn.gstAmount / 2).toLocaleString('en-IN')}
SGST @ 9%:                                       ₹${(txn.gstAmount / 2).toLocaleString('en-IN')}
-------------------------------------------------------------
TOTAL AMOUNT PAID (INCL. GST):                   ₹${txn.amount.toLocaleString('en-IN')}
=============================================================
INPUT TAX CREDIT (ITC) DECLARATION:
This is a computer generated tax invoice. Input Tax Credit (ITC)
is fully available to the recipient under Section 16 of the CGST
Act, 2017. All taxes have been deposited with GSTN.
=============================================================
    `.trim();

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NexoraBooks_Subscription_Invoice_${txn.invoiceUrl || txn.referenceId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showNotice(`Downloaded invoice ${txn.invoiceUrl || txn.referenceId}`);
  };

  // Export all transactions to CSV
  const handleExportCsv = () => {
    if (payments.length === 0) {
      showNotice('No payment records available to export.');
      return;
    }
    const headers = ['Invoice No', 'Date', 'Plan', 'Cycle', 'Method', 'Reference ID', 'Taxable Amount', 'CGST (9%)', 'SGST (9%)', 'Total (INR)', 'Recurring Mandate'];
    const rows = payments.map(p => [
      p.invoiceUrl || `INV-${p.id}`,
      p.date,
      p.plan,
      p.cycle,
      p.method,
      p.referenceId,
      p.taxableAmount.toFixed(2),
      (p.gstAmount / 2).toFixed(2),
      (p.gstAmount / 2).toFixed(2),
      p.amount.toFixed(2),
      p.isRecurring ? p.mandateId || 'Yes' : 'No',
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NexoraBooks_Billing_History_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showNotice('Exported billing history CSV for accounting books.');
  };

  const filteredPayments = payments.filter(p => {
    const q = invoiceSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      p.referenceId.toLowerCase().includes(q) ||
      (p.invoiceUrl && p.invoiceUrl.toLowerCase().includes(q)) ||
      p.plan.toLowerCase().includes(q) ||
      p.method.toLowerCase().includes(q) ||
      p.date.includes(q)
    );
  });

  const activeMandate = subscription.recurringMandate;
  const totalPaidSum = payments.reduce((acc, p) => acc + p.amount, 0);
  const totalGstItc = payments.reduce((acc, p) => acc + p.gstAmount, 0);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Toast Notice */}
      {actionNotice && (
        <div className="fixed bottom-5 right-5 z-80 bg-slate-900 text-white px-4 py-2.5 rounded-sm shadow-xl text-xs flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={15} className="text-emerald-400" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <button
              onClick={() => onNavigateTab('gateway')}
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              Gateway
            </button>
            <ChevronRight size={12} />
            <span className="font-semibold text-foreground">Client Dashboard</span>
            <ChevronRight size={12} />
            <span className="text-primary font-medium">My Subscription & Billing</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Subscription &amp; Billing Management
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            View your current ERP license tier, download statutory GST tax invoices, and manage recurring auto-debit payment methods.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onOpenSupportModal && (
            <button
              onClick={onOpenSupportModal}
              className="px-3.5 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold text-xs rounded-sm border border-border transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Raise a query regarding billing, payments, or tax invoices"
            >
              <LifeBuoy size={14} className="text-primary" />
              <span>Raise Billing Query</span>
            </button>
          )}

          <button
            onClick={onOpenSubscriptionModal}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-sm transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Sparkles size={14} />
            <span>Change Plan / Upgrade</span>
          </button>
        </div>
      </div>

      {/* Section 1: Current Billing Tier & Subscription Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Tier Details Card */}
        <div className="lg:col-span-2 rounded-sm border border-border bg-card p-5 sm:p-6 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-sm border border-primary/20">
                  Current Billing Tier
                </span>
                {subscription.status === 'ACTIVE' ? (
                  <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 px-2.5 py-0.5 rounded-sm border border-emerald-500/30 font-semibold font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    ACTIVE LICENSE
                  </span>
                ) : subscription.status === 'TRIAL' ? (
                  <span className="inline-flex items-center gap-1 text-[11px] bg-blue-500/15 text-blue-700 dark:text-blue-400 px-2.5 py-0.5 rounded-sm border border-blue-500/30 font-semibold font-mono">
                    <Sparkles size={11} /> 14-DAY FREE TRIAL
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] bg-rose-500/15 text-rose-700 dark:text-rose-400 px-2.5 py-0.5 rounded-sm border border-rose-500/30 font-bold font-mono">
                    <Lock size={11} /> EXPIRED / LOCKED
                  </span>
                )}

                {activeMandate?.isEnabled && activeMandate.status === 'ACTIVE' && (
                  <span className="inline-flex items-center gap-1 text-[11px] bg-purple-500/15 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-sm border border-purple-500/30 font-semibold font-mono">
                    <Zap size={11} className="text-purple-500" /> AutoPay Mandate
                  </span>
                )}
              </div>
              <h2 className="font-serif text-2xl font-bold text-foreground">
                {subscription.tier === 'STARTER'
                  ? 'Starter Bookkeeper Edition'
                  : subscription.tier === 'ENTERPRISE'
                  ? 'Enterprise Multi-GST Edition'
                  : 'Professional GST ERP Edition'}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Full access to day book, inventory, GSTR-1, 3B, 2B matching, and WhatsApp invoicing.
              </p>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <div className="text-xs text-muted-foreground">Rate:</div>
              <div className="font-mono text-2xl font-extrabold text-foreground">
                {currentPricing.label}
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">
                + 18% GST (SAC: 998313)
              </span>
            </div>
          </div>

          {/* Dates & Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/40 p-3.5 rounded-sm border border-border text-xs">
            <div>
              <div className="text-muted-foreground text-[11px]">Billing Cycle:</div>
              <div className="font-semibold text-foreground mt-0.5 flex items-center gap-1">
                <span>{subscription.cycle}</span>
                {subscription.cycle === 'ANNUAL' && (
                  <span className="bg-amber-400/20 text-amber-700 dark:text-amber-300 text-[10px] px-1 py-0.2 rounded-sm font-bold font-mono">
                    -20%
                  </span>
                )}
              </div>
            </div>

            <div>
              <div className="text-muted-foreground text-[11px]">Valid Till / Renews:</div>
              <div className="font-mono font-semibold text-foreground mt-0.5">
                {subscription.validTill}
              </div>
            </div>

            <div>
              <div className="text-muted-foreground text-[11px]">Days Remaining:</div>
              <div className={`font-mono font-bold mt-0.5 ${daysRemaining <= 5 ? 'text-rose-600 dark:text-rose-400' : 'text-foreground'}`}>
                {daysRemaining} days left
              </div>
            </div>

            <div>
              <div className="text-muted-foreground text-[11px]">Last Payment:</div>
              <div className="font-mono font-semibold text-foreground mt-0.5">
                ₹{subscription.amountPaid.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Tier Features Checklist */}
          <div>
            <h4 className="text-xs font-semibold uppercase font-mono tracking-wider text-muted-foreground mb-2.5">
              Included Enterprise Capabilities:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 text-foreground">
                <Check size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Unlimited Vouchers, Invoices &amp; Day Book</span>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <Check size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Full GSTR-1, 3B, 9 &amp; GSTR-2B Auto-Recon</span>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <Check size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>WhatsApp Invoice Dispatch with UPI Matrix</span>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <Check size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Tally Prime &amp; Busy Accounting Backup Restore</span>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <Check size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>MCA Rule 3(1) Edit Log Audit Trail Integrity</span>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <Check size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>100% Statutory GST ITC Eligibility</span>
              </div>
            </div>
          </div>

          {/* Quick Plan Actions */}
          <div className="pt-2 flex flex-wrap items-center gap-2.5 border-t border-border">
            <button
              onClick={onOpenSubscriptionModal}
              className="px-3.5 py-1.5 text-xs font-semibold bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-sm border border-border transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <span>Upgrade Tier / Switch to Annual</span>
              <ArrowUpRight size={13} />
            </button>

            {/* Test Simulation Switch */}
            <button
              type="button"
              onClick={() => {
                const next = subscription.status === 'EXPIRED' ? 'ACTIVE' : 'EXPIRED';
                setSubscriptionStatus(next);
                showNotice(`Simulated subscription status: ${next}`);
              }}
              className="px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground border border-border rounded-sm transition-colors cursor-pointer"
              title="Test paywall simulation lock"
            >
              {subscription.status === 'EXPIRED' ? 'Simulate Active Status' : 'Simulate Expired Status'}
            </button>
          </div>
        </div>

        {/* GST Billing & Registered Company Profile Info Card */}
        <div className="rounded-sm border border-border bg-card p-5 sm:p-6 shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-primary mb-2">
              <Building2 size={18} />
              <h3 className="font-serif font-bold text-base text-foreground">GST &amp; Tax Profile</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Invoices are issued with GSTIN verification so your business can claim 100% Input Tax Credit under SAC 998313.
            </p>

            <div className="mt-4 space-y-2.5 text-xs border-t border-border pt-3">
              <div>
                <span className="text-muted-foreground block text-[11px]">Billed Entity Name:</span>
                <span className="font-semibold text-foreground">{activeCompany.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Registered GSTIN:</span>
                <span className="font-mono font-bold text-foreground bg-muted px-1.5 py-0.5 rounded-sm border border-border">
                  {activeCompany.gstin || '27AAACB2212M1Z1'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">State / Place of Supply:</span>
                <span className="text-foreground">
                  {activeCompany.state || 'Maharashtra'} (Code: {activeCompany.stateCode || '27'})
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Primary Billing Mobile:</span>
                <span className="font-mono text-foreground">+91 {auth.mobile || '9820045678'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Billing Contact Email:</span>
                <span className="font-mono text-foreground">{auth.email || activeCompany.email || 'accounts@bharat.in'}</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-sm text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
            <ShieldCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Eligible for full 18% Input Tax Credit in GSTR-3B under Table 4(A)(5). SAC Code 998313.
            </span>
          </div>
        </div>
      </div>

      {/* Section 2: Active Recurring Mandate Management (AutoPay) */}
      <div className="rounded-sm border border-border bg-card p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-sm bg-purple-500/15 text-purple-700 dark:text-purple-300 flex items-center justify-center">
              <Repeat size={16} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-foreground flex items-center gap-2">
                <span>Recurring Billing &amp; AutoPay Mandate</span>
                {activeMandate && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-sm border uppercase ${
                      activeMandate.status === 'ACTIVE'
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                        : activeMandate.status === 'PAUSED'
                        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30'
                        : 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30'
                    }`}
                  >
                    {activeMandate.status}
                  </span>
                )}
              </h3>
              <p className="text-xs text-muted-foreground">
                NPCI / RBI compliant recurring mandate ensuring zero interruption to your cloud ERP books.
              </p>
            </div>
          </div>

          {activeMandate && activeMandate.status !== 'CANCELLED' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleRecurringMandateStatus}
                className="px-3 py-1.5 text-xs font-semibold bg-card hover:bg-muted border border-border rounded-sm transition-colors flex items-center gap-1.5 cursor-pointer text-foreground shadow-2xs"
                title={activeMandate.status === 'ACTIVE' ? 'Pause automatic debits' : 'Resume automatic debits'}
              >
                {activeMandate.status === 'ACTIVE' ? (
                  <>
                    <Pause size={13} className="text-amber-500" />
                    <span>Pause AutoPay</span>
                  </>
                ) : (
                  <>
                    <Play size={13} className="text-emerald-500" />
                    <span>Resume AutoPay</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={cancelRecurringMandate}
                className="px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 rounded-sm transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Revoke recurring auto-debit authorization"
              >
                <Ban size={13} />
                <span>Revoke Mandate</span>
              </button>
            </div>
          )}
        </div>

        {activeMandate ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-purple-500/5 p-4 rounded-sm border border-purple-500/20 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">Mandate UMRN:</span>
              <span className="font-mono font-bold text-foreground">{activeMandate.mandateId}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Channel &amp; Source:</span>
              <span className="font-medium text-foreground">
                {activeMandate.method} ({activeMandate.autoDebitBank || activeMandate.vpaHandle || 'Registered Bank'})
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Next Scheduled Debit:</span>
              <span className="font-mono font-bold text-foreground">{activeMandate.nextDebitDate}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Max Authorized Cap:</span>
              <span className="font-mono font-bold text-foreground">
                ₹{activeMandate.maxDebitAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-muted/40 rounded-sm border border-border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="font-semibold text-foreground">No Recurring Auto-Debit Mandate Configured</span>
              <p className="text-muted-foreground text-[11px]">
                Enable UPI AutoPay or e-Mandate to ensure uninterrupted book closing, automated GST reconciliation, and receipt generation.
              </p>
            </div>
            <button
              onClick={onOpenSubscriptionModal}
              className="px-3 py-1.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-sm transition-colors shrink-0 cursor-pointer shadow-xs"
            >
              Setup AutoPay Mandate
            </button>
          </div>
        )}
      </div>

      {/* Section 3: Saved Payment Methods Management */}
      <div className="rounded-sm border border-border bg-card p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-serif font-bold text-base text-foreground flex items-center gap-2">
              <CreditCard size={18} className="text-primary" />
              <span>Saved Payment Methods</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Manage your verified cards, UPI handles, and e-NACH bank accounts used for subscription renewal.
            </p>
          </div>

          <button
            onClick={() => setIsAddMethodOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-sm transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
          >
            <Plus size={14} />
            <span>Add Payment Method</span>
          </button>
        </div>

        {/* Payment Methods List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {paymentMethods.map(pm => (
            <div
              key={pm.id}
              className={`p-4 rounded-sm border transition-all flex flex-col justify-between ${
                pm.isDefault
                  ? 'border-primary bg-primary/5 shadow-xs ring-1 ring-primary/40'
                  : 'border-border bg-card hover:border-border/80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {pm.type === 'UPI' && (
                      <div className="w-8 h-8 rounded-sm bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <QrCode size={16} />
                      </div>
                    )}
                    {pm.type === 'CARD' && (
                      <div className="w-8 h-8 rounded-sm bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                        <CreditCard size={16} />
                      </div>
                    )}
                    {pm.type === 'NET_BANKING' && (
                      <div className="w-8 h-8 rounded-sm bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <Building size={16} />
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-foreground text-xs">{pm.title}</h4>
                      <span className="text-[10px] text-muted-foreground uppercase font-mono">{pm.brand}</span>
                    </div>
                  </div>

                  {pm.isDefault && (
                    <span className="text-[10px] bg-primary text-primary-foreground font-bold px-1.5 py-0.5 rounded-sm font-mono shadow-2xs">
                      Default
                    </span>
                  )}
                </div>

                <div className="mt-2 text-xs font-mono text-foreground space-y-1 bg-muted/40 p-2.5 rounded-sm border border-border">
                  {pm.type === 'UPI' && (
                    <div>
                      <span className="text-[10px] text-muted-foreground block">VPA Handle:</span>
                      <strong className="text-foreground">{pm.vpa}</strong>
                    </div>
                  )}
                  {pm.type === 'CARD' && (
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Card Details:</span>
                      <strong className="text-foreground">•••• •••• •••• {pm.cardLast4}</strong>
                      <span className="text-[10px] text-muted-foreground ml-2">Exp: {pm.cardExpiry}</span>
                    </div>
                  )}
                  {pm.type === 'NET_BANKING' && (
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Account:</span>
                      <strong className="text-foreground">{pm.bankName}</strong>
                      <span className="text-[10px] text-muted-foreground ml-1">•••• {pm.accountLast4}</span>
                    </div>
                  )}
                  {pm.mandateId && (
                    <div className="text-[10px] text-purple-700 dark:text-purple-300 pt-1 border-t border-border">
                      UMRN: {pm.mandateId}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
                {!pm.isDefault ? (
                  <button
                    onClick={() => handleSetDefaultMethod(pm.id)}
                    className="text-primary hover:underline font-semibold cursor-pointer text-xs"
                  >
                    Set as Default
                  </button>
                ) : (
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-500" /> Default Method
                  </span>
                )}

                <button
                  onClick={() => handleDeleteMethod(pm.id)}
                  className="text-muted-foreground hover:text-rose-600 transition-colors p-1 cursor-pointer"
                  title="Remove this payment method"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 4: Past Payment Invoices & Billing History */}
      <div className="rounded-sm border border-border bg-card p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-serif font-bold text-base text-foreground flex items-center gap-2">
              <Receipt size={18} className="text-primary" />
              <span>Past Payment Invoices &amp; Billing History</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Official computer-generated GST tax invoices for claiming 100% Input Tax Credit under SAC 998313.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 text-xs font-semibold bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-sm border border-border transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Export all billing records as CSV spreadsheet"
            >
              <FileSpreadsheet size={13} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-muted/40 p-3.5 rounded-sm border border-border text-xs">
          <div>
            <span className="text-muted-foreground text-[11px]">Lifetime Payments Total:</span>
            <div className="font-mono text-lg font-extrabold text-foreground mt-0.5">
              ₹{totalPaidSum.toLocaleString('en-IN')}
            </div>
          </div>
          <div>
            <span className="text-muted-foreground text-[11px]">GST Input Tax Credit (ITC):</span>
            <div className="font-mono text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
              ₹{totalGstItc.toLocaleString('en-IN')}
            </div>
          </div>
          <div>
            <span className="text-muted-foreground text-[11px]">Issued Invoices Count:</span>
            <div className="font-mono text-lg font-extrabold text-foreground mt-0.5">
              {payments.length} Tax Invoice(s)
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-2.5 text-muted-foreground" />
          <input
            type="text"
            value={invoiceSearch}
            onChange={e => setInvoiceSearch(e.target.value)}
            placeholder="Search invoice by ref, number or date..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-background border border-border rounded-sm text-foreground focus:outline-hidden"
          />
        </div>

        {/* Invoices Table */}
        <div className="border border-border rounded-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-sidebar border-b border-border text-muted-foreground font-semibold">
                  <th className="py-2.5 px-3">Invoice No &amp; Ref</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Plan / Cycle</th>
                  <th className="py-2.5 px-3">Channel</th>
                  <th className="py-2.5 px-3 font-mono text-right">Taxable Value</th>
                  <th className="py-2.5 px-3 font-mono text-right">GST (18%)</th>
                  <th className="py-2.5 px-3 font-mono text-right">Total Paid</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredPayments.length > 0 ? (
                  filteredPayments.map(p => (
                    <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-foreground font-mono">
                          {p.invoiceUrl || `INV-${p.referenceId.slice(-8)}`}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono">
                          Ref: {p.referenceId}
                        </div>
                        {p.isRecurring && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 px-1 rounded-xs font-semibold font-mono mt-0.5">
                            AutoPay: {p.mandateId || 'NPCI'}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 font-mono">{p.date}</td>

                      <td className="py-3 px-3">
                        <span className="font-medium text-foreground">{p.plan}</span>
                        <div className="text-[10px] text-muted-foreground uppercase">{p.cycle}</div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-mono text-foreground">{p.method}</span>
                      </td>

                      <td className="py-3 px-3 font-mono text-right">
                        ₹{p.taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3 px-3 font-mono text-right text-emerald-600 dark:text-emerald-400 font-medium">
                        ₹{p.gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-right text-foreground">
                        ₹{p.amount.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-sm bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 size={11} /> PAID
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setPreviewTxn(p)}
                            className="px-2 py-1 text-[11px] font-medium bg-card hover:bg-muted text-foreground border border-border rounded-sm transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                            title="View printable tax invoice modal"
                          >
                            <Printer size={12} />
                            <span>View</span>
                          </button>

                          <button
                            onClick={() => handleDownloadInvoice(p)}
                            className="px-2 py-1 text-[11px] font-semibold bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/20 rounded-sm transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                            title="Download official tax invoice"
                          >
                            <Download size={12} />
                            <span>Invoice</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-muted-foreground text-xs">
                      No invoices found matching &quot;{invoiceSearch}&quot;.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Payment Method Modal */}
      {isAddMethodOpen && (
        <div className="fixed inset-0 z-80 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground w-full max-w-md rounded-sm shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 bg-muted/60 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard size={18} className="text-primary" />
                <h3 className="font-serif font-bold text-base text-foreground">Add Payment Method</h3>
              </div>
              <button
                onClick={() => setIsAddMethodOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddNewMethod} className="p-5 space-y-4">
              {/* Method Switcher Tabs */}
              <div className="grid grid-cols-3 gap-1 p-1 bg-muted rounded-sm border border-border text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setNewMethodType('UPI')}
                  className={`py-2 rounded-sm transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                    newMethodType === 'UPI' ? 'bg-card text-foreground font-bold shadow-xs' : 'text-muted-foreground'
                  }`}
                >
                  <QrCode size={13} /> UPI AutoPay
                </button>
                <button
                  type="button"
                  onClick={() => setNewMethodType('CARD')}
                  className={`py-2 rounded-sm transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                    newMethodType === 'CARD' ? 'bg-card text-foreground font-bold shadow-xs' : 'text-muted-foreground'
                  }`}
                >
                  <CreditCard size={13} /> Card
                </button>
                <button
                  type="button"
                  onClick={() => setNewMethodType('NET_BANKING')}
                  className={`py-2 rounded-sm transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                    newMethodType === 'NET_BANKING' ? 'bg-card text-foreground font-bold shadow-xs' : 'text-muted-foreground'
                  }`}
                >
                  <Building size={13} /> e-NACH Bank
                </button>
              </div>

              {/* Form Content by Type */}
              {newMethodType === 'UPI' && (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-muted-foreground mb-1 font-medium">Virtual Payment Address (VPA / UPI ID)</label>
                    <input
                      type="text"
                      required
                      value={newVpa}
                      onChange={e => setNewVpa(e.target.value)}
                      placeholder="e.g. bharatbooks@oksbi"
                      className="w-full px-3 py-2 font-mono border border-input rounded-sm bg-background text-foreground text-xs"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Supported apps: Google Pay, PhonePe, Paytm, BHIM UPI, Cred, and all major Indian bank apps.
                  </p>
                </div>
              )}

              {newMethodType === 'CARD' && (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-muted-foreground mb-1 font-medium">Cardholder Name</label>
                    <input
                      type="text"
                      required
                      value={newCardHolder}
                      onChange={e => setNewCardHolder(e.target.value)}
                      placeholder="Name as on card"
                      className="w-full px-3 py-2 border border-input rounded-sm bg-background text-foreground text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1 font-medium">Card Number</label>
                    <input
                      type="text"
                      required
                      maxLength={19}
                      value={newCardNumber}
                      onChange={e => setNewCardNumber(e.target.value)}
                      placeholder="4111 2222 3333 4444"
                      className="w-full px-3 py-2 font-mono border border-input rounded-sm bg-background text-foreground text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-muted-foreground mb-1 font-medium">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        required
                        maxLength={5}
                        value={newCardExpiry}
                        onChange={e => setNewCardExpiry(e.target.value)}
                        placeholder="08/29"
                        className="w-full px-3 py-2 font-mono border border-input rounded-sm bg-background text-foreground text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-muted-foreground mb-1 font-medium">CVV</label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        value={newCardCvv}
                        onChange={e => setNewCardCvv(e.target.value)}
                        placeholder="•••"
                        className="w-full px-3 py-2 font-mono border border-input rounded-sm bg-background text-foreground text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {newMethodType === 'NET_BANKING' && (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-muted-foreground mb-1 font-medium">Select Bank</label>
                    <select
                      value={newBankName}
                      onChange={e => setNewBankName(e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-sm bg-background text-foreground text-xs"
                    >
                      <option value="HDFC Bank">HDFC Bank</option>
                      <option value="ICICI Bank">ICICI Bank</option>
                      <option value="State Bank of India">State Bank of India</option>
                      <option value="Axis Bank">Axis Bank</option>
                      <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1 font-medium">Account Number</label>
                    <input
                      type="text"
                      required
                      value={newAccountNo}
                      onChange={e => setNewAccountNo(e.target.value)}
                      placeholder="e.g. 50200012345678"
                      className="w-full px-3 py-2 font-mono border border-input rounded-sm bg-background text-foreground text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1 font-medium">IFSC Code</label>
                    <input
                      type="text"
                      required
                      value={newIfsc}
                      onChange={e => setNewIfsc(e.target.value.toUpperCase())}
                      placeholder="e.g. HDFC0000123"
                      className="w-full px-3 py-2 font-mono uppercase border border-input rounded-sm bg-background text-foreground text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Set as Default Checkbox */}
              <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isNewDefault}
                  onChange={e => setIsNewDefault(e.target.checked)}
                  className="rounded text-primary focus:ring-primary"
                />
                <span>Set as default payment method for recurring renewals</span>
              </label>

              {/* Submit Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddMethodOpen(false)}
                  className="flex-1 py-2 px-3 text-xs font-semibold text-secondary-foreground bg-secondary hover:bg-secondary/80 rounded-sm border border-border transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 text-xs font-bold text-primary-foreground bg-primary hover:bg-primary/90 rounded-sm transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck size={14} />
                  <span>Authorize &amp; Save</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Tax Invoice Modal Preview */}
      {previewTxn && (
        <div className="fixed inset-0 z-80 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card text-card-foreground w-full max-w-2xl rounded-sm shadow-2xl border border-border overflow-hidden my-auto animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 bg-muted/60 border-b border-border flex items-center justify-between no-print">
              <div className="flex items-center gap-2">
                <Printer size={18} className="text-primary" />
                <h3 className="font-serif font-bold text-base text-foreground">
                  Statutory Tax Invoice Preview
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-sm transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer size={13} />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => handleDownloadInvoice(previewTxn)}
                  className="px-3 py-1.5 text-xs font-semibold bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-sm border border-border transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Download size={13} />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => setPreviewTxn(null)}
                  className="text-muted-foreground hover:text-foreground p-1 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Invoice Printable Sheet */}
            <div className="p-6 sm:p-8 space-y-6 text-xs bg-white text-slate-900 printable-document">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-300 pb-4">
                <div>
                  <h2 className="text-xl font-serif font-extrabold tracking-tight text-slate-950">
                    NEXORA TECHNOLOGIES PRIVATE LIMITED
                  </h2>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Corporate HQ: BKC Complex, Bandra Kurla Complex, Mumbai, Maharashtra 400051
                  </p>
                  <div className="font-mono text-xs font-bold text-slate-900 mt-1">
                    GSTIN: 27AABCN8899K1ZV · PAN: AABCN8899K
                  </div>
                  <div className="text-[11px] text-slate-600">
                    SAC Code: 998313 (ERP Software as a Service)
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded-sm">
                    ORIGINAL FOR RECIPIENT
                  </span>
                  <div className="font-mono font-extrabold text-slate-900 text-sm mt-2">
                    {previewTxn.invoiceUrl || `INV-${previewTxn.referenceId.slice(-8)}`}
                  </div>
                  <div className="text-[11px] text-slate-600 font-mono">Date: {previewTxn.date}</div>
                </div>
              </div>

              {/* Recipient Details */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-sm border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono font-bold block mb-1">
                    Billed To Recipient:
                  </span>
                  <div className="font-bold text-slate-900 text-sm">{activeCompany.name}</div>
                  <div className="text-[11px] text-slate-700 mt-0.5">
                    {activeCompany.address || 'MIDC Industrial Estate, Andheri East, Mumbai, Maharashtra'}
                  </div>
                  <div className="font-mono font-bold text-slate-900 mt-1">
                    GSTIN: {activeCompany.gstin || '27AAACB2212M1Z1'}
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <div>
                    <span className="text-slate-500 text-[11px]">Payment Reference:</span>
                    <div className="font-mono font-semibold text-slate-900">{previewTxn.referenceId}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px]">Payment Mode:</span>
                    <div className="font-medium text-slate-900">{previewTxn.method}</div>
                  </div>
                  {previewTxn.isRecurring && (
                    <div>
                      <span className="text-slate-500 text-[11px]">AutoPay Mandate (UMRN):</span>
                      <div className="font-mono font-semibold text-purple-700">{previewTxn.mandateId}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Line Items Table */}
              <table className="w-full border-collapse border border-slate-200 text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                    <th className="p-2 text-left">Description</th>
                    <th className="p-2 text-center">SAC</th>
                    <th className="p-2 text-center">Cycle</th>
                    <th className="p-2 text-right">Taxable Value (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="p-2.5">
                      <div className="font-bold text-slate-900">
                        Nexora Books Cloud ERP Subscription
                      </div>
                      <div className="text-[11px] text-slate-600">
                        Tier: {previewTxn.plan} · Multi-Company &amp; Statutory GST Suite
                      </div>
                    </td>
                    <td className="p-2.5 text-center font-mono">998313</td>
                    <td className="p-2.5 text-center font-mono">{previewTxn.cycle}</td>
                    <td className="p-2.5 text-right font-mono font-bold">
                      ₹{previewTxn.taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Tax Breakup & Grand Total */}
              <div className="flex justify-between items-start">
                <div className="max-w-xs space-y-1 text-[11px] text-slate-600">
                  <div className="font-bold text-slate-900">Statutory GST Declarations:</div>
                  <p>
                    1. Input Tax Credit (ITC) is eligible under Section 16 of CGST Act.
                  </p>
                  <p>
                    2. GST on reverse charge is not applicable (RCM: No).
                  </p>
                  <p>
                    3. This is an authentic digitally signed tax invoice.
                  </p>
                </div>

                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Taxable Value:</span>
                    <span className="font-mono">
                      ₹{previewTxn.taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>CGST @ 9%:</span>
                    <span className="font-mono">
                      ₹{(previewTxn.gstAmount / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>SGST @ 9%:</span>
                    <span className="font-mono">
                      ₹{(previewTxn.gstAmount / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="border-t border-slate-300 pt-2 flex justify-between font-bold text-sm text-slate-950">
                    <span>Grand Total:</span>
                    <span className="font-mono">₹{previewTxn.amount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
