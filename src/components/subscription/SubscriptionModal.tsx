/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Check,
  CreditCard,
  QrCode,
  Building,
  ShieldCheck,
  X,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Download,
  CheckCircle2,
  Lock,
  Repeat,
  Zap,
  Play,
  Pause,
  Ban,
  Calendar,
  Info,
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { SubscriptionTier, BillingCycle, PaymentTransaction } from '../../types/erp';
import { QrCodeSvg } from '../common/QrCodeSvg';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMandatory?: boolean;
  onNavigateLanding?: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  isMandatory = false,
  onNavigateLanding,
}) => {
  const {
    subscription,
    processRazorpayPayment,
    payments,
    setSubscriptionStatus,
    cancelRecurringMandate,
    toggleRecurringMandateStatus,
  } = useErp();

  const [cycle, setCycle] = useState<BillingCycle>('ANNUAL');
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>('PRO');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentChannel, setPaymentChannel] = useState<'UPI' | 'CARD' | 'NET_BANKING'>('UPI');
  const [enableRecurring, setEnableRecurring] = useState(true);
  const [autoDebitBank, setAutoDebitBank] = useState('HDFC Bank');
  const [vpaHandle, setVpaHandle] = useState('user@oksbi');
  const [processing, setProcessing] = useState(false);
  const [completedTxn, setCompletedTxn] = useState<PaymentTransaction | null>(null);

  if (!isOpen) return null;

  const plans = [
    {
      tier: 'STARTER' as SubscriptionTier,
      name: 'Starter Bookkeeper',
      subtitle: 'For individual traders & solo freelancers',
      monthlyPrice: 499,
      annualPrice: 4990,
      features: [
        'Up to 100 Vouchers / month',
        'Sales & Purchase Invoicing',
        'Basic GSTR-1 & GSTR-3B summary',
        'Standard Tally Shortcut Keys',
        'Single Godown & 1 User',
      ],
    },
    {
      tier: 'PRO' as SubscriptionTier,
      name: 'Professional GST ERP',
      subtitle: 'For growing MSMEs, traders & manufacturers',
      badge: 'Most Popular',
      monthlyPrice: 1199,
      annualPrice: 11990,
      features: [
        'Unlimited Vouchers & Daybook',
        'Full GSTR-1, 3B, 9 & e-Way Bill',
        'GSTR-2B Automated Reconciliation',
        'WhatsApp Invoice & UPI Reminders',
        'Tally Prime XML & JSON Backup',
        'Multi-Godowns & Batch Expiry',
        'Full P&L, Balance Sheet Drill-down',
      ],
    },
    {
      tier: 'ENTERPRISE' as SubscriptionTier,
      name: 'Enterprise Multi-GST',
      subtitle: 'For large firms & Chartered Accountants',
      monthlyPrice: 2499,
      annualPrice: 23990,
      features: [
        'Everything in Professional ERP',
        'Unlimited Multi-Companies (F3)',
        'CA Multi-Client Workspace Portal',
        'Staff Role Delegation (Admin/Auditor)',
        'e-Invoice IRN & Signed QR Codes',
        'MCA Rule 3(1) Tamper Audit Trail',
        'Dedicated SLA & WhatsApp Support',
      ],
    },
  ];

  const currentPlanObj = plans.find(p => p.tier === selectedTier) || plans[1];
  const payableAmount = cycle === 'ANNUAL' ? currentPlanObj.annualPrice : currentPlanObj.monthlyPrice;

  // Next debit date calculation for preview
  const previewNextDebitDate = new Date(
    Date.now() + (cycle === 'ANNUAL' ? 365 : 30) * 86400000
  ).toISOString().split('T')[0];

  const handleOpenRazorpay = (tier: SubscriptionTier) => {
    setSelectedTier(tier);
    setIsCheckoutOpen(true);
    setCompletedTxn(null);
  };

  const handleExecutePayment = () => {
    setProcessing(true);
    setTimeout(() => {
      const txn = processRazorpayPayment(selectedTier, cycle, paymentChannel, payableAmount, {
        isRecurring: enableRecurring,
        mandateMethod:
          paymentChannel === 'UPI'
            ? 'UPI_AUTOPAY'
            : paymentChannel === 'CARD'
            ? 'CARD_MANDATE'
            : 'ENACH',
        autoDebitBank,
        vpaHandle: paymentChannel === 'UPI' ? vpaHandle : undefined,
      });
      setProcessing(false);
      setCompletedTxn(txn);
    }, 1200);
  };

  const handleDownloadInvoice = (txn: PaymentTransaction) => {
    const text = `
=============================================================
             NEXORA TECHNOLOGIES PRIVATE LIMITED
         Corporate Office: BKC Complex, Bandra, Mumbai
               GSTIN: 27AABCN8899K1ZV
=============================================================
TAX INVOICE FOR CLOUD SOFTWARE SUBSCRIPTION
Invoice No: ${txn.invoiceUrl || 'NEXORA-INV-2026-00481'}
Date: ${txn.date}
Payment Ref: ${txn.referenceId}
Payment Channel: ${txn.method}${txn.isRecurring ? `\nRecurring Mandate ID (UMRN): ${txn.mandateId}` : ''}
-------------------------------------------------------------
Client: Bharat Electronics & Systems Pvt Ltd
Client GSTIN: 27AAACB2212M1Z1
Address: MIDC Andheri East, Mumbai, Maharashtra (27)
-------------------------------------------------------------
DESCRIPTION                          SAC CODE    AMOUNT (INR)
-------------------------------------------------------------
Nexora Books Cloud ERP Subscription   998313      ₹${txn.taxableAmount.toLocaleString('en-IN')}
Tier: ${txn.plan} (${txn.cycle})
Billing Model: ${txn.isRecurring ? 'Recurring Auto-Debit (NPCI Mandate)' : 'One-Time Payment'}
-------------------------------------------------------------
Taxable Value:                                   ₹${txn.taxableAmount.toLocaleString('en-IN')}
CGST @ 9%:                                       ₹${(txn.gstAmount / 2).toLocaleString('en-IN')}
SGST @ 9%:                                       ₹${(txn.gstAmount / 2).toLocaleString('en-IN')}
-------------------------------------------------------------
TOTAL AMOUNT PAID (INCL. GST):                   ₹${txn.amount.toLocaleString('en-IN')}
=============================================================
This is a computer generated tax invoice. Input Tax Credit is
fully available to the recipient under GST rules.
=============================================================
    `.trim();

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NexoraBooks_Subscription_Invoice_${txn.date}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeMandate = subscription.recurringMandate;

  return (
    <div className="fixed inset-0 z-70 bg-background/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-card text-card-foreground w-full max-w-4xl rounded-sm shadow-2xl border border-border overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Top Direct Navigation Action Bar */}
        <div className="bg-background px-4 sm:px-6 py-2.5 border-b border-border flex items-center justify-between gap-3 text-xs select-none">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={onNavigateLanding || onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 font-bold rounded-sm bg-card hover:bg-muted text-foreground border border-border transition-colors cursor-pointer shadow-2xs"
              title="Return to Main Frontend Website"
            >
              <ArrowLeft size={14} className="text-primary" />
              <span>← Back to Main Website</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSubscriptionStatus('TRIAL');
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 font-bold rounded-sm bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-xs"
              title="Activate Instant 14-Day Full ERP Access with Zero Payment"
            >
              <Sparkles size={13} />
              <span>Start 14-Day Free Trial (Instant Access)</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onNavigateLanding || onClose}
            className="text-muted-foreground hover:text-foreground p-1.5 rounded-sm hover:bg-muted transition-colors cursor-pointer"
            title={isMandatory ? 'Exit to Main Website' : 'Close Dialog'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Header */}
        <div className="bg-muted/60 text-foreground p-5 sm:p-6 border-b border-border relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-primary">SaaS Cloud Subscription</span>
              {subscription.status === 'ACTIVE' || subscription.status === 'TRIAL' ? (
                <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-sm border border-emerald-500/30 font-medium">
                  <CheckCircle2 size={12} /> Active Plan: {subscription.tier} ({subscription.cycle})
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] bg-destructive/15 text-destructive px-2 py-0.5 rounded-sm border border-destructive/30 font-bold">
                  <Lock size={12} /> Subscription Inactive / Expired
                </span>
              )}

              {activeMandate && activeMandate.isEnabled && activeMandate.status === 'ACTIVE' && (
                <span className="inline-flex items-center gap-1 text-[11px] bg-purple-500/15 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-sm border border-purple-500/30 font-semibold font-mono">
                  <Zap size={12} className="text-purple-500" /> AutoPay Active ({activeMandate.frequency})
                </span>
              )}

              {/* Simulation switch for testing */}
              {!isMandatory && (
                <button
                  type="button"
                  onClick={() => setSubscriptionStatus(subscription.status === 'EXPIRED' ? 'ACTIVE' : 'EXPIRED')}
                  className="text-[10px] bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border px-2 py-0.5 rounded-sm transition-colors"
                  title="Toggle subscription status to test ERP paywall"
                >
                  {subscription.status === 'EXPIRED' ? 'Simulate Active Status' : 'Simulate Expired (Test Lock)'}
                </button>
              )}
            </div>
            <h2 className="text-2xl font-serif font-bold tracking-tight">Flexible ERP Plans for Indian Businesses</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isMandatory
                ? 'Your subscription is expired or inactive. Subscribe below or start a trial to unlock the complete ERP suite.'
                : 'Instant activation with Razorpay recurring e-Mandate & 100% GST ITC claimable invoice'}
            </p>
          </div>

          {/* Monthly / Annual Toggle */}
          <div className="flex items-center bg-secondary/80 p-1 rounded-sm border border-border self-start md:self-auto shrink-0">
            <button
              onClick={() => setCycle('MONTHLY')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-sm transition-all ${
                cycle === 'MONTHLY' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setCycle('ANNUAL')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-sm transition-all flex items-center gap-1 ${
                cycle === 'ANNUAL' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Annual Billing <span className="bg-amber-400 text-slate-950 text-[10px] font-bold px-1.5 py-0.2 rounded-sm font-mono">Save 20%</span>
            </button>
          </div>
        </div>

        {/* Active AutoPay / Mandate Status Card (When mandate exists) */}
        {activeMandate && (
          <div className="mx-6 mt-5 p-4 rounded-sm border border-purple-500/30 bg-purple-500/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Repeat size={16} className="text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 font-mono">
                  Recurring Auto-Debit Mandate (e-Mandate)
                </span>
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
              </div>
              <div className="text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                <span>
                  Mandate UMRN: <strong className="font-mono text-foreground">{activeMandate.mandateId}</strong>
                </span>
                <span>
                  Channel: <strong className="text-foreground">{activeMandate.method}</strong> ({activeMandate.autoDebitBank || activeMandate.vpaHandle || 'Bank AutoPay'})
                </span>
                <span>
                  Next Scheduled Debit: <strong className="font-mono text-foreground">{activeMandate.nextDebitDate}</strong>
                </span>
                <span>
                  Max Debit Cap: <strong className="font-mono text-foreground">₹{activeMandate.maxDebitAmount.toLocaleString('en-IN')}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {activeMandate.status !== 'CANCELLED' && (
                <button
                  type="button"
                  onClick={toggleRecurringMandateStatus}
                  className="px-3 py-1.5 text-xs font-semibold bg-card hover:bg-muted border border-border rounded-sm transition-colors flex items-center gap-1.5 cursor-pointer text-foreground"
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
              )}

              {activeMandate.status !== 'CANCELLED' && (
                <button
                  type="button"
                  onClick={cancelRecurringMandate}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 rounded-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Revoke recurring mandate authorization"
                >
                  <Ban size={13} />
                  <span>Revoke Mandate</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Pricing Cards Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {plans.map(p => {
              const isSelected = selectedTier === p.tier;
              const isCurrent = subscription.tier === p.tier && subscription.status === 'ACTIVE';
              const price = cycle === 'ANNUAL' ? p.annualPrice : p.monthlyPrice;

              return (
                <div
                  key={p.tier}
                  className={`rounded-sm border p-5 flex flex-col justify-between transition-all relative ${
                    p.badge
                      ? 'border-primary bg-primary/5 shadow-md ring-1 ring-primary'
                      : 'border-border bg-card hover:border-primary/50'
                  }`}
                >
                  {p.badge && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-sm shadow-xs font-mono">
                      {p.badge}
                    </span>
                  )}

                  <div>
                    <h3 className="font-serif font-bold text-foreground text-lg">{p.name}</h3>
                    <p className="text-xs text-muted-foreground mb-4">{p.subtitle}</p>

                    <div className="mb-4">
                      <span className="text-3xl font-extrabold text-foreground font-mono">
                        ₹{price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1 font-mono">
                        /{cycle === 'ANNUAL' ? 'year' : 'month'} + GST
                      </span>
                    </div>

                    <ul className="space-y-2.5 text-xs text-muted-foreground mb-6">
                      {p.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check size={14} className="text-primary shrink-0 mt-0.5" />
                          <span className="text-foreground">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => handleOpenRazorpay(p.tier)}
                    className={`w-full py-2.5 px-4 text-xs font-bold rounded-sm transition-all shadow-xs flex items-center justify-center gap-1.5 ${
                      isCurrent
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : p.badge
                        ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                        : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border'
                    }`}
                  >
                    {isCurrent ? 'Current Active Plan' : `Upgrade to ${p.name.split(' ')[0]}`}
                    <ArrowRight size={14} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Past Invoices Strip */}
          {payments.length > 0 && (
            <div className="mt-8 pt-6 border-t border-border">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center justify-between">
                <span>Subscription Invoices & Payment History</span>
                <span className="text-[11px] font-normal lowercase">{payments.length} transaction(s) recorded</span>
              </h4>
              <div className="space-y-2">
                {payments.map(p => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 bg-muted/40 rounded-sm border border-border text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-sm bg-primary/10 text-primary flex items-center justify-center font-bold font-mono">
                        ₹
                      </div>
                      <div>
                        <div className="font-semibold text-foreground flex items-center gap-2">
                          <span>{p.plan} Plan ({p.cycle})</span>
                          <span className="font-mono text-muted-foreground text-[11px]">Ref: {p.referenceId}</span>
                          {p.isRecurring && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 px-1 rounded-sm font-semibold">
                              <Repeat size={10} /> Mandate: {p.mandateId || 'NPCI'}
                            </span>
                          )}
                        </div>
                        <div className="text-muted-foreground text-[11px] font-mono">
                          Paid on {p.date} via {p.method} · Total: ₹{p.amount.toLocaleString('en-IN')} (GST ₹
                          {p.gstAmount.toLocaleString('en-IN')})
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDownloadInvoice(p)}
                      className="px-3 py-1.5 text-xs font-medium text-foreground bg-secondary hover:bg-secondary/80 border border-border rounded-sm transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <Download size={13} /> Tax Invoice
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Strip */}
        <div className="bg-muted/40 p-4 px-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground select-none">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              Need to explore first? Start a 14-day free trial or return to the main website to explore features and guides.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onNavigateLanding || onClose}
              className="px-3 py-1.5 font-semibold text-foreground hover:bg-muted border border-border rounded-sm transition-colors cursor-pointer"
            >
              ← Return to Main Website
            </button>
            <button
              type="button"
              onClick={() => {
                setSubscriptionStatus('TRIAL');
                onClose();
              }}
              className="px-3.5 py-1.5 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Sparkles size={13} />
              <span>Start 14-Day Free Trial</span>
            </button>
          </div>
        </div>

        {/* Razorpay Simulated Checkout Dialog */}
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-80 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-card text-card-foreground w-full max-w-lg rounded-sm shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Razorpay Branded Top Banner */}
              <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-blue-600 rounded-sm flex items-center justify-center text-white font-extrabold text-xs font-mono">
                    R
                  </div>
                  <div>
                    <div className="text-xs font-bold tracking-tight">Razorpay Secure Checkout & e-Mandate</div>
                    <div className="text-[10px] text-slate-300">Nexora Technologies Pvt Ltd · Merchant ID: 2948102</div>
                  </div>
                </div>
                <button
                  onClick={() => setIsCheckoutOpen(false)}
                  className="text-slate-400 hover:text-white p-1 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {completedTxn ? (
                <div className="p-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto animate-bounce">
                    <Check size={32} />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif font-bold text-foreground">Payment & Mandate Authorized!</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      ₹{completedTxn.amount.toLocaleString('en-IN')} received. Your {selectedTier} license has been
                      activated instantly.
                    </p>
                    <div className="mt-3 text-xs font-mono text-foreground bg-muted p-3 rounded-sm border border-border space-y-1 text-left">
                      <div>Payment Ref: <strong>{completedTxn.referenceId}</strong></div>
                      <div>Invoice Number: <strong>{completedTxn.invoiceUrl || 'INV-2026-NEX'}</strong></div>
                      {completedTxn.isRecurring && (
                        <div className="text-purple-700 dark:text-purple-300 font-semibold pt-1 border-t border-border">
                          ⚡ AutoPay UMRN: {completedTxn.mandateId} (Next Debit: {previewNextDebitDate})
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleDownloadInvoice(completedTxn)}
                      className="flex-1 py-2 px-3 text-xs font-semibold text-secondary-foreground bg-secondary hover:bg-secondary/80 rounded-sm transition-colors flex items-center justify-center gap-1.5 border border-border cursor-pointer"
                    >
                      <Download size={14} /> Download Tax Invoice
                    </button>
                    <button
                      onClick={() => {
                        setIsCheckoutOpen(false);
                        onClose();
                      }}
                      className="flex-1 py-2 px-3 text-xs font-bold text-primary-foreground bg-primary hover:bg-primary/90 rounded-sm transition-colors cursor-pointer"
                    >
                      Open Nexora ERP
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-5 space-y-4">
                  {/* Summary Bar */}
                  <div className="flex justify-between items-center bg-muted/60 p-3 rounded-sm border border-border">
                    <div>
                      <span className="text-xs text-muted-foreground">Plan Upgrade:</span>
                      <div className="font-serif font-bold text-foreground text-sm">
                        {currentPlanObj.name} ({cycle})
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground">Amount Payable:</span>
                      <div className="font-extrabold text-primary text-base font-mono">
                        ₹{payableAmount.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  {/* Recurring Billing Toggle */}
                  <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={enableRecurring}
                          onChange={e => setEnableRecurring(e.target.checked)}
                          className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                        />
                        <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <Zap size={14} className="text-purple-600" />
                          Enable Recurring Auto-Debit (e-Mandate / UPI AutoPay)
                        </span>
                      </label>
                      <span className="text-[10px] font-mono bg-purple-500/20 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded-sm font-semibold">
                        {cycle === 'ANNUAL' ? 'Every 365 Days' : 'Every 30 Days'}
                      </span>
                    </div>

                    {enableRecurring && (
                      <div className="text-[11px] text-muted-foreground space-y-1 pl-6">
                        <p>
                          Auto-renews at ₹{payableAmount.toLocaleString('en-IN')} on <strong className="text-foreground">{previewNextDebitDate}</strong>.
                          RBI/NPCI compliant e-Mandate. You will receive pre-debit notification 24 hours prior via SMS.
                          Cancel or pause anytime with one click in your account settings.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Payment Channel Tabs */}
                  <div className="grid grid-cols-3 gap-1 p-1 bg-muted rounded-sm border border-border">
                    <button
                      onClick={() => setPaymentChannel('UPI')}
                      className={`py-2 text-xs font-semibold rounded-sm flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        paymentChannel === 'UPI' ? 'bg-card text-foreground shadow-xs font-bold' : 'text-muted-foreground'
                      }`}
                    >
                      <QrCode size={14} /> UPI AutoPay
                    </button>
                    <button
                      onClick={() => setPaymentChannel('CARD')}
                      className={`py-2 text-xs font-semibold rounded-sm flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        paymentChannel === 'CARD' ? 'bg-card text-foreground shadow-xs font-bold' : 'text-muted-foreground'
                      }`}
                    >
                      <CreditCard size={14} /> Card Mandate
                    </button>
                    <button
                      onClick={() => setPaymentChannel('NET_BANKING')}
                      className={`py-2 text-xs font-semibold rounded-sm flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        paymentChannel === 'NET_BANKING' ? 'bg-card text-foreground shadow-xs font-bold' : 'text-muted-foreground'
                      }`}
                    >
                      <Building size={14} /> e-NACH / Bank
                    </button>
                  </div>

                  {/* Channel specifics */}
                  {paymentChannel === 'UPI' && (
                    <div className="text-center space-y-3 py-1">
                      <p className="text-xs text-muted-foreground font-medium">Scan QR or enter UPI ID for instant AutoPay authorization</p>
                      <div className="flex justify-center p-3 bg-white rounded-sm w-fit mx-auto border border-border">
                        <QrCodeSvg
                          value={`upi://mandate?pa=nexoratech@icici&pn=Nexora%20Books&am=${payableAmount}&cu=INR&recur=${cycle === 'ANNUAL' ? 'YEARLY' : 'MONTHLY'}&block=N`}
                          size={130}
                          title="UPI AutoPay: nexoratech@icici"
                        />
                      </div>
                      <div className="flex items-center gap-2 max-w-xs mx-auto text-xs">
                        <input
                          type="text"
                          value={vpaHandle}
                          onChange={e => setVpaHandle(e.target.value)}
                          placeholder="yourname@okhdfcbank"
                          className="w-full px-3 py-1.5 font-mono border border-input rounded-sm bg-background text-foreground text-xs"
                        />
                      </div>
                      <div className="text-[10px] font-mono text-muted-foreground">Supported: Google Pay, PhonePe, Paytm, BHIM, Cred</div>
                    </div>
                  )}

                  {paymentChannel === 'CARD' && (
                    <div className="space-y-3 py-1 text-xs">
                      <div>
                        <label className="block text-muted-foreground mb-1">Debit / Credit Card (Recurring Enabled)</label>
                        <input
                          type="text"
                          defaultValue="4111 2222 3333 4444"
                          className="w-full px-3 py-2 font-mono border border-input rounded-sm text-sm bg-background text-foreground"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-muted-foreground mb-1">Expiry (MM/YY)</label>
                          <input
                            type="text"
                            defaultValue="08/29"
                            className="w-full px-3 py-2 font-mono border border-input rounded-sm text-sm bg-background text-foreground"
                          />
                        </div>
                        <div>
                          <label className="block text-muted-foreground mb-1">CVV</label>
                          <input
                            type="password"
                            defaultValue="789"
                            maxLength={3}
                            className="w-full px-3 py-2 font-mono border border-input rounded-sm text-sm bg-background text-foreground"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentChannel === 'NET_BANKING' && (
                    <div className="space-y-2 py-1 text-xs">
                      <label className="block text-muted-foreground">Select e-NACH Auto-Debit Bank</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank'].map(bank => (
                          <button
                            type="button"
                            key={bank}
                            onClick={() => setAutoDebitBank(bank)}
                            className={`p-2 border rounded-sm text-center font-medium transition-colors cursor-pointer text-xs ${
                              autoDebitBank === bank
                                ? 'border-primary bg-primary/10 text-primary font-bold'
                                : 'border-border bg-muted/40 text-foreground hover:border-primary/50'
                            }`}
                          >
                            {bank}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleExecutePayment}
                    disabled={processing}
                    className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm rounded-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {processing ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                        Authorizing via Razorpay Gateway...
                      </span>
                    ) : (
                      <>
                        <Lock size={15} /> Authorize ₹{payableAmount.toLocaleString('en-IN')}{enableRecurring ? ' & Setup Mandate' : ''}
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
                    <ShieldCheck size={13} className="text-emerald-500" /> 256-bit SSL Encrypted & RBI Guidelines Compliant
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
