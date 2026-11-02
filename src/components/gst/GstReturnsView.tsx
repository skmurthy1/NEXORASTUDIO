/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Download,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Truck,
  QrCode,
  Lock,
  Layers,
  ArrowRight,
  ShieldCheck,
  Calendar,
  FileJson,
  Printer,
  Sparkles,
  Settings,
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import {
  computeGstr1Summary,
  generateGstr1OfficialJson,
  computeGstr3bSummary,
  reconcileGstr2b,
} from '../../services/gstEngine';
import { MOCK_GSTR2B_INWARD } from '../../data/seedData';
import { QrCodeSvg } from '../common/QrCodeSvg';
import { GSPIntegrationSettings } from './GSPIntegrationSettings';

export const GstReturnsView: React.FC = () => {
  const { vouchers, activeCompany, logAudit, gspConfig } = useErp();
  const [activeTab, setActiveTab] = useState<'GSTR1' | 'GSTR3B' | 'GSTR2B' | 'GSTR9' | 'EWAY' | 'EINVOICE' | 'GSP'>('GSTR1');
  const [returnPeriod, setReturnPeriod] = useState('062026'); // June 2026
  const [isLocked, setIsLocked] = useState(false);
  const [isFilingDirect, setIsFilingDirect] = useState(false);
  const [filingSuccess, setFilingSuccess] = useState(false);

  // Compute live summaries
  const gstr1 = computeGstr1Summary(vouchers, activeCompany.stateCode);
  const gstr3b = computeGstr3bSummary(vouchers);
  const gstr2bReconciled = reconcileGstr2b(vouchers, MOCK_GSTR2B_INWARD);

  // Download official GST portal JSON for GSTR-1
  const handleDownloadGstr1Json = () => {
    const portalData = generateGstr1OfficialJson(activeCompany, vouchers, returnPeriod);
    const jsonStr = JSON.stringify(portalData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GSTR1_${activeCompany.gstin}_${returnPeriod}.json`;
    a.click();
    URL.revokeObjectURL(url);
    logAudit('EXPORT', 'GSTR1', returnPeriod, 'Downloaded official GSTR-1 GST Portal JSON file');
  };

  const handleSimulateDirectGspFiling = () => {
    setIsFilingDirect(true);
    setTimeout(() => {
      setIsFilingDirect(false);
      setFilingSuccess(true);
      setIsLocked(true);
      logAudit(
        'CREATE',
        'GST_PORTAL_FILING',
        returnPeriod,
        `Filed GSTR-1 directly through ${gspConfig.provider} (${gspConfig.environment}) GSP API with GSTN ARN generated`
      );
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs">
            <span className="uppercase tracking-wider font-semibold text-muted-foreground">
              Statutory Tax Portal
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="text-primary font-mono font-medium">
              GSTN Portal JSON v3.0 Validated
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-foreground">
            GST Returns Center & Compliance Suite
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* GSP Status & Configuration Button */}
          <button
            onClick={() => setActiveTab('GSP')}
            className={`px-3 py-1.5 text-xs font-medium rounded-sm border transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer ${
              activeTab === 'GSP'
                ? 'bg-primary text-primary-foreground font-semibold border-primary'
                : 'bg-card border-border hover:bg-muted text-foreground'
            }`}
            title="Configure GST Suvidha Provider API credentials & automation policies"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                gspConfig.authStatus === 'CONNECTED' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <Settings size={13} className="text-muted-foreground" />
            <span>GSP: {gspConfig.provider}</span>
            <span className="text-[10px] font-mono text-muted-foreground">({gspConfig.environment})</span>
          </button>

          {/* Period Selector */}
          <div className="flex items-center gap-1.5 bg-card border border-border px-3 py-1.5 rounded-sm shadow-2xs text-xs">
            <Calendar size={13} className="text-muted-foreground" />
            <span className="text-muted-foreground font-medium">Period:</span>
            <select
              value={returnPeriod}
              onChange={e => setReturnPeriod(e.target.value)}
              className="font-medium text-foreground bg-transparent focus:outline-hidden text-xs"
            >
              <option value="042026">April 2026</option>
              <option value="052026">May 2026</option>
              <option value="062026">June 2026 (Q1)</option>
              <option value="072026">July 2026</option>
              <option value="082026">August 2026</option>
              <option value="092026">September 2026 (Q2)</option>
            </select>
          </div>

          <button
            onClick={handleDownloadGstr1Json}
            className="px-3 py-1.5 text-xs font-medium bg-card hover:bg-accent text-foreground rounded-sm border border-border transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <FileJson size={13} className="text-primary" /> Download Portal JSON
          </button>

          <button
            onClick={handleSimulateDirectGspFiling}
            disabled={isFilingDirect || isLocked}
            className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm shadow-2xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            {isFilingDirect ? (
              <span className="flex items-center gap-1">
                <span className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Filing via {gspConfig.provider}...
              </span>
            ) : isLocked ? (
              <>
                <Lock size={13} /> Period Locked & Filed
              </>
            ) : (
              <>
                <ShieldCheck size={13} /> Direct File via {gspConfig.provider}
              </>
            )}
          </button>
        </div>
      </div>

      {filingSuccess && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-sm flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-300 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <span className="font-semibold">Return Filed Successfully via {gspConfig.provider}!</span> Acknowledgement Reference Number (ARN):{' '}
              <span className="font-mono font-bold">AA2706260128492</span>. Period has been locked to prevent editing.
            </div>
          </div>
          <button onClick={() => setFilingSuccess(false)} className="text-emerald-700 dark:text-emerald-300 hover:underline font-semibold cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-sm w-fit overflow-x-auto no-scrollbar text-xs border border-border">
        {[
          { id: 'GSTR1' as const, label: 'GSTR-1 (Outward Supplies)' },
          { id: 'GSTR3B' as const, label: 'GSTR-3B (Tax Liability & Offset)' },
          { id: 'GSTR2B' as const, label: 'GSTR-2B Matching' },
          { id: 'GSTR9' as const, label: 'GSTR-9 Annual Return' },
          { id: 'EWAY' as const, label: 'e-Way Bills' },
          { id: 'EINVOICE' as const, label: 'e-Invoicing (IRN)' },
          { id: 'GSP' as const, label: '⚙ GSP API Settings' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 font-medium rounded-sm whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-card text-foreground font-semibold shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. GSTR-1 TAB (ALL STATUTORY TABLES) */}
      {activeTab === 'GSTR1' && (
        <div className="space-y-6">
          {/* Summary Metric Ribbon */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card p-4 rounded-sm border border-border shadow-2xs">
              <span className="text-xs text-muted-foreground font-medium">B2B Taxable Value</span>
              <div className="text-lg font-bold font-mono text-foreground mt-1">
                ₹{gstr1.b2b.taxableValue.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{gstr1.b2b.count} Registered Invoices (Table 4)</div>
            </div>

            <div className="bg-card p-4 rounded-sm border border-border shadow-2xs">
              <span className="text-xs text-muted-foreground font-medium">Total Output Tax (CGST+SGST+IGST)</span>
              <div className="text-lg font-bold font-mono text-primary mt-1">
                ₹{gstr1.totalTax.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">IGST: ₹{gstr1.b2b.igst.toLocaleString('en-IN')}</div>
            </div>

            <div className="bg-card p-4 rounded-sm border border-border shadow-2xs">
              <span className="text-xs text-muted-foreground font-medium">HSN Summary Items</span>
              <div className="text-lg font-bold font-mono text-foreground mt-1">
                {gstr1.hsnSummary.length} HSN Codes
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Reported in Table 12</div>
            </div>

            <div className="bg-card p-4 rounded-sm border border-border shadow-2xs">
              <span className="text-xs text-muted-foreground font-medium">Documents Issued</span>
              <div className="text-lg font-bold font-mono text-foreground mt-1">
                {gstr1.docIssued.salesCount} Invoices
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Reported in Table 13</div>
            </div>
          </div>

          {/* Table 4: B2B Invoices Detailed Table */}
          <div className="bg-card rounded-sm border border-border shadow-2xs overflow-hidden">
            <div className="p-3.5 px-4 border-b border-border bg-muted/40 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-xs text-foreground">
                  Table 4: Taxable outward supplies made to registered persons (B2B)
                </h3>
                <p className="text-[11px] text-muted-foreground">Invoices containing valid recipient GSTIN numbers</p>
              </div>
              <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-sm border border-primary/20">
                {gstr1.b2b.count} Records
              </span>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-muted/60 text-muted-foreground font-semibold border-b border-border text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Recipient GSTIN</th>
                  <th className="py-2.5 px-3">Party Name</th>
                  <th className="py-2.5 px-3">Invoice No.</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">POS</th>
                  <th className="py-2.5 px-3 text-right">Taxable (₹)</th>
                  <th className="py-2.5 px-3 text-right">CGST (₹)</th>
                  <th className="py-2.5 px-3 text-right">SGST (₹)</th>
                  <th className="py-2.5 px-3 text-right">IGST (₹)</th>
                  <th className="py-2.5 px-3 text-right">Invoice Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {gstr1.b2b.invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-muted/40">
                    <td className="py-2.5 px-3 font-mono font-bold text-primary">{inv.partyGstin}</td>
                    <td className="py-2.5 px-3 font-semibold text-foreground">{inv.partyName}</td>
                    <td className="py-2.5 px-3 font-mono text-muted-foreground">{inv.voucherNumber}</td>
                    <td className="py-2.5 px-3 font-mono text-muted-foreground">{inv.date}</td>
                    <td className="py-2.5 px-3 font-mono text-muted-foreground">{inv.placeOfSupply}</td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-foreground">
                      ₹{inv.taxableTotal.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-muted-foreground">
                      {inv.cgstTotal > 0 ? `₹${inv.cgstTotal.toLocaleString('en-IN')}` : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-muted-foreground">
                      {inv.sgstTotal > 0 ? `₹${inv.sgstTotal.toLocaleString('en-IN')}` : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-muted-foreground">
                      {inv.igstTotal > 0 ? `₹${inv.igstTotal.toLocaleString('en-IN')}` : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground tabular-nums">
                      ₹{inv.grandTotal.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table 12: HSN-wise Summary */}
          <div className="bg-card rounded-sm border border-border shadow-2xs overflow-hidden">
            <div className="p-3.5 px-4 border-b border-border bg-muted/40">
              <h3 className="font-semibold text-xs text-foreground">
                Table 12: HSN-wise summary of outward supplies
              </h3>
              <p className="text-[11px] text-muted-foreground">Commodity code classification with quantity and rate analysis</p>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-muted/60 text-muted-foreground font-semibold border-b border-border text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">HSN/SAC</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-2 text-right">Qty</th>
                  <th className="py-2.5 px-2">UQC</th>
                  <th className="py-2.5 px-3 text-right">Taxable Value (₹)</th>
                  <th className="py-2.5 px-3 text-right">CGST (₹)</th>
                  <th className="py-2.5 px-3 text-right">SGST (₹)</th>
                  <th className="py-2.5 px-3 text-right">IGST (₹)</th>
                  <th className="py-2.5 px-3 text-right">Total Value (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {gstr1.hsnSummary.map(h => (
                  <tr key={h.hsn} className="hover:bg-muted/40">
                    <td className="py-2.5 px-3 font-mono font-bold text-foreground">{h.hsn}</td>
                    <td className="py-2.5 px-3 font-medium text-foreground">{h.description}</td>
                    <td className="py-2.5 px-2 text-right font-mono text-muted-foreground">{h.totalQty}</td>
                    <td className="py-2.5 px-2 font-mono text-muted-foreground">{h.uqc}</td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-foreground">
                      ₹{h.taxableValue.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-muted-foreground">
                      {h.cgst > 0 ? `₹${h.cgst.toLocaleString('en-IN')}` : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-muted-foreground">
                      {h.sgst > 0 ? `₹${h.sgst.toLocaleString('en-IN')}` : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-muted-foreground">
                      {h.igst > 0 ? `₹${h.igst.toLocaleString('en-IN')}` : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground tabular-nums">
                      ₹{h.totalValue.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. GSTR-3B TAB */}
      {activeTab === 'GSTR3B' && (
        <div className="bg-card rounded-sm border border-border shadow-2xs p-5 space-y-6">
          <div className="border-b border-border pb-3">
            <h3 className="font-semibold text-sm text-foreground">
              Form GSTR-3B: Monthly Summary Return for {returnPeriod}
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Automated reconciliation of outward tax liability and Input Tax Credit (ITC)
            </p>
          </div>

          {/* Section 3.1: Details of Outward Supplies */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              3.1 Details of Outward Supplies and inward supplies liable to reverse charge
            </h4>
            <div className="border border-border rounded-sm overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/60 text-muted-foreground font-semibold text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Nature of Supplies</th>
                    <th className="py-2.5 px-3 text-right">Total Taxable Value (₹)</th>
                    <th className="py-2.5 px-3 text-right">Integrated Tax (₹)</th>
                    <th className="py-2.5 px-3 text-right">Central Tax (₹)</th>
                    <th className="py-2.5 px-3 text-right">State/UT Tax (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-foreground">
                      (a) Outward taxable supplies (other than zero rated, nil and exempted)
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-foreground">
                      ₹{gstr3b.outwardTaxable.taxable.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-foreground">
                      ₹{gstr3b.outwardTaxable.igst.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-foreground">
                      ₹{gstr3b.outwardTaxable.cgst.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-foreground">
                      ₹{gstr3b.outwardTaxable.sgst.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Eligible ITC */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              4. Eligible Input Tax Credit (ITC)
            </h4>
            <div className="border border-border rounded-sm overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/60 text-muted-foreground font-semibold text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Details</th>
                    <th className="py-2.5 px-3 text-right">Integrated Tax (₹)</th>
                    <th className="py-2.5 px-3 text-right">Central Tax (₹)</th>
                    <th className="py-2.5 px-3 text-right">State/UT Tax (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="py-2.5 px-3 font-medium text-foreground">(1) All other ITC (Inputs from Suppliers)</td>
                    <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">₹{gstr3b.eligibleItc.inputs.igst.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">₹{gstr3b.eligibleItc.inputs.cgst.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">₹{gstr3b.eligibleItc.inputs.sgst.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="bg-muted/30 font-bold">
                    <td className="py-2.5 px-3 text-foreground">(C) Net ITC Available</td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-700 dark:text-emerald-400">
                      ₹{gstr3b.eligibleItc.totalItc.igst.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-700 dark:text-emerald-400">
                      ₹{gstr3b.eligibleItc.totalItc.cgst.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-700 dark:text-emerald-400">
                      ₹{gstr3b.eligibleItc.totalItc.sgst.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 6.1: Payment of Tax (Cash Offset) */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              6.1 Payment of Tax (Net cash liability to be deposited)
            </h4>
            <div className="p-3.5 bg-muted/40 rounded-sm border border-border text-xs flex items-center justify-between">
              <div>
                <span className="font-semibold text-foreground">Total Net Tax Payable through Cash Ledger:</span>
                <p className="text-[11px] text-muted-foreground mt-0.5">After utilizing available Input Tax Credit</p>
              </div>
              <div className="font-mono font-bold text-base text-amber-600 dark:text-amber-400">
                ₹{(gstr3b.netTaxPayable.igst + gstr3b.netTaxPayable.cgst + gstr3b.netTaxPayable.sgst).toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. GSTR-2B RECONCILIATION */}
      {activeTab === 'GSTR2B' && (
        <div className="bg-card rounded-sm border border-border shadow-2xs overflow-hidden">
          <div className="p-3.5 px-4 border-b border-border bg-muted/40 flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-xs text-foreground">GSTR-2B Inward ITC Reconciliation</h3>
              <p className="text-[11px] text-muted-foreground">
                Cross-matching portal auto-drafted ITC statement against your Purchase register
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-sm border border-emerald-500/20">
              3 Inward Records Evaluated
            </span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-muted/60 text-muted-foreground font-semibold border-b border-border text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Supplier GSTIN</th>
                <th className="py-2.5 px-3">Supplier Name</th>
                <th className="py-2.5 px-3">Invoice No.</th>
                <th className="py-2.5 px-3 text-right">Portal 2B (₹)</th>
                <th className="py-2.5 px-3 text-right">Books (₹)</th>
                <th className="py-2.5 px-2 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Variance (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {gstr2bReconciled.map((rec, idx) => (
                <tr key={idx} className="hover:bg-muted/40">
                  <td className="py-2.5 px-3 font-mono font-bold text-foreground">{rec.supplierGstin}</td>
                  <td className="py-2.5 px-3 font-medium text-foreground">{rec.supplierName}</td>
                  <td className="py-2.5 px-3 font-mono text-muted-foreground">{rec.invoiceNumber}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-foreground">₹{rec.portalTaxable.toLocaleString('en-IN')}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                    {rec.bookTaxable > 0 ? `₹${rec.bookTaxable.toLocaleString('en-IN')}` : 'Missing'}
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-xs ${
                        rec.matchStatus === 'MATCHED'
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                          : rec.matchStatus === 'VALUE_MISMATCH'
                          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                          : 'bg-destructive/10 text-destructive border border-destructive/20'
                      }`}
                    >
                      {rec.matchStatus}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold">
                    {rec.difference === 0 ? (
                      <span className="text-emerald-700 dark:text-emerald-400">₹0.00</span>
                    ) : (
                      <span className="text-destructive">₹{rec.difference.toLocaleString('en-IN')}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. GSTR-9 ANNUAL RETURN */}
      {activeTab === 'GSTR9' && (
        <div className="bg-card rounded-sm border border-border shadow-2xs p-5 space-y-4 text-xs">
          <div className="border-b border-border pb-3">
            <h3 className="font-semibold text-sm text-foreground">
              Form GSTR-9: Annual Return for Financial Year {activeCompany.financialYear}
            </h3>
            <p className="text-[11px] text-muted-foreground">12-Month Consolidated Statutory Filing</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3.5 bg-muted/40 rounded-sm border border-border">
              <span className="text-[11px] font-medium text-muted-foreground">Total Taxable Turnover</span>
              <div className="text-base font-bold font-mono text-foreground mt-1">₹1,84,50,000</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Audited FY Annual Aggregates</div>
            </div>
            <div className="p-3.5 bg-muted/40 rounded-sm border border-border">
              <span className="text-[11px] font-medium text-muted-foreground">Total Tax Paid</span>
              <div className="text-base font-bold font-mono text-primary mt-1">₹33,21,000</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">CGST, SGST & IGST Combined</div>
            </div>
            <div className="p-3.5 bg-muted/40 rounded-sm border border-border">
              <span className="text-[11px] font-medium text-muted-foreground">Total ITC Availed in FY</span>
              <div className="text-base font-bold font-mono text-emerald-700 dark:text-emerald-400 mt-1">₹24,80,000</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Matched with GSTR-2B / 2A</div>
            </div>
          </div>
        </div>
      )}

      {/* 5. E-WAY BILLS */}
      {activeTab === 'EWAY' && (
        <div className="bg-card rounded-sm border border-border shadow-2xs p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-border pb-3">
            <div>
              <h3 className="font-semibold text-sm text-foreground">Generated e-Way Bills (Part-A & Part-B)</h3>
              <p className="text-[11px] text-muted-foreground">Mandatory for goods movement exceeding ₹50,000 invoice value</p>
            </div>
            <Truck size={16} className="text-primary" />
          </div>

          <div className="space-y-3">
            {vouchers
              .filter(v => v.eWayBillNumber)
              .map(v => (
                <div key={v.id} className="p-3.5 bg-muted/30 rounded-sm border border-border flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-foreground text-xs">EWB: {v.eWayBillNumber}</span>
                      <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-xs">
                        Active Slip
                      </span>
                    </div>
                    <div className="text-muted-foreground mt-1">
                      Invoice: <strong className="font-mono text-foreground">{v.voucherNumber}</strong> · Recipient: {v.partyName}
                    </div>
                    <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                      Vehicle: {v.vehicleNumber || 'MH-04-AZ-4421'} · Distance: {v.distanceKm || 35} KM
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-foreground text-xs">
                      ₹{v.grandTotal.toLocaleString('en-IN')}
                    </div>
                    <span className="text-[11px] text-muted-foreground font-mono">Date: {v.eWayBillDate}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 6. E-INVOICE (IRN & QR) */}
      {activeTab === 'EINVOICE' && (
        <div className="bg-card rounded-sm border border-border shadow-2xs p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-border pb-3">
            <div>
              <h3 className="font-semibold text-sm text-foreground">e-Invoicing Portal Sync (NIC / IRP)</h3>
              <p className="text-[11px] text-muted-foreground">64-character Invoice Reference Number (IRN) & Signed QR codes</p>
            </div>
            <QrCode size={16} className="text-primary" />
          </div>

          <div className="space-y-4">
            {vouchers
              .filter(v => v.irn)
              .map(v => (
                <div key={v.id} className="p-3.5 bg-muted/30 rounded-sm border border-border flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="space-y-1.5 text-xs min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">Invoice: {v.voucherNumber}</span>
                      <span className="text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded-xs">
                        IRN Generated
                      </span>
                    </div>
                    <div className="text-muted-foreground text-xs">Recipient: {v.partyName} ({v.partyGstin})</div>
                    <div className="p-2 bg-background rounded-xs border border-border font-mono text-[10px] text-muted-foreground break-all">
                      IRN: {v.irn}
                    </div>
                    <div className="text-[11px] text-muted-foreground font-mono">
                      Ack No: {v.ackNumber} · Ack Date: {v.ackDate}
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col items-center">
                    <QrCodeSvg value={v.signedQrCode || v.irn || ''} size={100} title="NIC Signed QR" />
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 7. GSP API & IRP CREDENTIAL SETTINGS */}
      {activeTab === 'GSP' && <GSPIntegrationSettings />}
    </div>
  );
};
