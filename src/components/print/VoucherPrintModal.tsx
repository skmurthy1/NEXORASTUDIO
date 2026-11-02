/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Printer,
  Download,
  Share2,
  X,
  Sliders,
  Check,
  Building,
  QrCode,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { Voucher, InvoiceTemplate } from '../../types/erp';
import { numberToIndianWords } from '../../services/gstEngine';
import { QrCodeSvg } from '../common/QrCodeSvg';
import { NexoraLogo } from '../common/NexoraLogo';

interface VoucherPrintModalProps {
  voucherId: string | null;
  onClose: () => void;
  onOpenWhatsApp?: (voucher: Voucher) => void;
}

export const VoucherPrintModal: React.FC<VoucherPrintModalProps> = ({ voucherId, onClose, onOpenWhatsApp }) => {
  const { vouchers, activeCompany } = useErp();
  const [template, setTemplate] = useState<InvoiceTemplate>('CLASSIC_TALLY');
  const [copyType, setCopyType] = useState<'ORIGINAL' | 'DUPLICATE' | 'TRIPLICATE'>('ORIGINAL');

  // Customization Toggles
  const [showLogo, setShowLogo] = useState(true);
  const [showBankDetails, setShowBankDetails] = useState(true);
  const [showUpiQr, setShowUpiQr] = useState(true);
  const [showSignature, setShowSignature] = useState(true);
  const [showTerms, setShowTerms] = useState(true);
  const [showHsnBreakup, setShowHsnBreakup] = useState(true);

  const voucher = vouchers.find(v => v.id === voucherId) || vouchers[0];
  if (!voucherId || !voucher) return null;

  const handleBrowserPrint = () => {
    window.print();
  };

  React.useEffect(() => {
    const handlePrintKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey || e.altKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        handleBrowserPrint();
      }
    };
    window.addEventListener('keydown', handlePrintKeyDown);
    return () => window.removeEventListener('keydown', handlePrintKeyDown);
  }, []);

  const handleWhatsAppSend = () => {
    if (onOpenWhatsApp) {
      onOpenWhatsApp(voucher);
      return;
    }
    const text = `Greetings from *${activeCompany.tradeName || activeCompany.name}*!
Your Tax Invoice No: *${voucher.voucherNumber}*
Date: ${voucher.date}
Grand Total: *₹${voucher.grandTotal.toLocaleString('en-IN')}*
UPI ID for instant payment: ${activeCompany.upiId}

Terms: ${voucher.partyName || 'Valued Customer'} can scan the QR code to clear payment.`;
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const amountInWords = numberToIndianWords(voucher.grandTotal);
  const upiPayload = `upi://pay?pa=${activeCompany.upiId}&pn=${encodeURIComponent(activeCompany.tradeName || activeCompany.name)}&am=${voucher.grandTotal}&cu=INR`;

  return (
    <div className="fixed inset-0 z-60 bg-background/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-card text-card-foreground w-full max-w-5xl rounded-sm shadow-2xl border border-border overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Top Control Header (Hidden when printing) */}
        <div className="bg-muted/60 text-foreground p-4 px-6 flex flex-col md:flex-row md:items-center justify-between gap-4 no-print border-b border-border">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-wider font-extrabold bg-primary text-primary-foreground px-2.5 py-1 rounded-sm font-mono shadow-xs">
              TAX INVOICE DESIGNER
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              {voucher.voucherNumber} · ₹{voucher.grandTotal.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleWhatsAppSend}
              className="px-3 py-1.5 text-xs font-semibold bg-[#075E54] hover:bg-[#064E46] text-white rounded-sm transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Share2 size={13} /> Send WhatsApp
            </button>
            <button
              onClick={handleBrowserPrint}
              className="px-4 py-1.5 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-sm transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Print Tax Invoice [Ctrl+P / Alt+P]"
            >
              <Printer size={13} /> Print [Ctrl+P]
            </button>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-sm cursor-pointer">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Toolbar: Template Switcher & Feature Toggles (Hidden when printing) */}
        <div className="bg-muted/40 p-3 px-6 border-b border-border flex flex-wrap items-center justify-between gap-3 text-xs no-print">
          {/* Template selector */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-semibold">Template:</span>
            <div className="flex items-center gap-1 bg-card p-1 rounded-sm border border-border">
              {[
                { id: 'CLASSIC_TALLY' as const, label: 'Classic Tally' },
                { id: 'MODERN_CLOUD' as const, label: 'Modern Cloud' },
                { id: 'COMPACT' as const, label: 'Compact' },
                { id: 'THERMAL_80MM' as const, label: '80mm POS Thermal' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={`px-2.5 py-1 rounded-sm font-medium transition-colors ${
                    template === t.id ? 'bg-primary text-primary-foreground font-bold shadow-xs' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Copy Type */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-semibold">Copy:</span>
            <div className="flex items-center gap-1 bg-card p-1 rounded-sm border border-border">
              {[
                { id: 'ORIGINAL' as const, label: 'Original for Recipient' },
                { id: 'DUPLICATE' as const, label: 'Duplicate for Transporter' },
                { id: 'TRIPLICATE' as const, label: 'Triplicate for Supplier' },
              ].map(c => (
                <button
                  key={c.id}
                  onClick={() => setCopyType(c.id)}
                  className={`px-2 py-1 rounded-sm text-[11px] font-medium transition-colors ${
                    copyType === c.id ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer text-foreground font-medium">
              <input
                type="checkbox"
                checked={showBankDetails}
                onChange={e => setShowBankDetails(e.target.checked)}
                className="w-3.5 h-3.5 accent-primary rounded-xs cursor-pointer"
              />
              <span>Bank</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-foreground font-medium">
              <input
                type="checkbox"
                checked={showUpiQr}
                onChange={e => setShowUpiQr(e.target.checked)}
                className="w-3.5 h-3.5 accent-primary rounded-xs cursor-pointer"
              />
              <span>UPI QR</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-foreground font-medium">
              <input
                type="checkbox"
                checked={showHsnBreakup}
                onChange={e => setShowHsnBreakup(e.target.checked)}
                className="w-3.5 h-3.5 accent-primary rounded-xs cursor-pointer"
              />
              <span>HSN Breakup</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-foreground font-medium">
              <input
                type="checkbox"
                checked={showSignature}
                onChange={e => setShowSignature(e.target.checked)}
                className="w-3.5 h-3.5 accent-primary rounded-xs cursor-pointer"
              />
              <span>Signatory</span>
            </label>
          </div>
        </div>

        {/* Printable Voucher Canvas Body */}
        <div className="p-6 max-h-[72vh] overflow-y-auto bg-slate-100 flex justify-center">
          <div
            id="printable-voucher"
            className={`bg-white shadow-lg p-8 rounded-xl border border-slate-300 text-slate-900 ${
              template === 'THERMAL_80MM' ? 'max-w-xs p-4 text-[11px]' : 'max-w-3xl w-full text-xs'
            }`}
          >
            {/* Top Banner: Copy indicator */}
            <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-300">
              <span>GST TAX INVOICE</span>
              <span className="font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {copyType.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Header: Company & Recipient */}
            <div className="py-4 border-b border-slate-300 grid grid-cols-2 gap-6 items-start">
              {/* Seller details with Brand Logo */}
              <div className="flex items-start gap-3.5">
                {showLogo && (
                  <div className="shrink-0 p-1 bg-white border border-slate-200 rounded-xl shadow-2xs">
                    <NexoraLogo size={46} />
                  </div>
                )}
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                    {activeCompany.name}
                  </h2>
                  <div className="text-slate-600 text-xs mt-0.5">{activeCompany.address}</div>
                  <div className="mt-1 font-mono text-xs">
                    <strong>GSTIN:</strong> {activeCompany.gstin}
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    State: {activeCompany.state} (Code {activeCompany.stateCode}) · Phone: {activeCompany.phone}
                  </div>
                </div>
              </div>

              {/* Invoice Meta & e-Invoice IRN info */}
              <div className="text-right space-y-1">
                <div className="text-base font-bold font-mono text-blue-900">
                  {voucher.voucherNumber}
                </div>
                <div className="font-mono text-slate-700">
                  Invoice Date: <strong>{voucher.date}</strong>
                </div>
                {voucher.placeOfSupply && (
                  <div className="text-[11px] text-slate-500">
                    Place of Supply: <strong>{voucher.placeOfSupply}</strong>
                  </div>
                )}
                {voucher.reverseCharge && (
                  <div className="text-[10px] text-rose-700 font-bold">Reverse Charge (RCM): Applicable</div>
                )}
              </div>
            </div>

            {/* Buyer Details */}
            <div className="py-3 border-b border-slate-300 grid grid-cols-2 gap-6 bg-slate-50/50 p-2 rounded-lg my-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Billed To (Recipient):
                </span>
                <div className="font-bold text-slate-900 text-sm mt-0.5">
                  {voucher.partyName || 'Cash Walk-in Customer'}
                </div>
                <div className="text-slate-600 text-xs">{voucher.billingAddress || 'Local Address'}</div>
                {voucher.partyGstin && (
                  <div className="font-mono text-xs mt-0.5">
                    <strong>GSTIN:</strong> {voucher.partyGstin}
                  </div>
                )}
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Transport / e-Way Details:
                </span>
                <div className="text-xs text-slate-700 mt-0.5 font-mono">
                  {voucher.eWayBillNumber ? (
                    <div>
                      e-Way Bill No: <strong>{voucher.eWayBillNumber}</strong>
                      <div className="text-[11px] text-slate-500">Vehicle: {voucher.vehicleNumber || 'MH-04-AZ-4421'}</div>
                    </div>
                  ) : (
                    <div className="text-slate-400">Standard Delivery / Hand Delivery</div>
                  )}
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="my-4 border border-slate-300 rounded overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 text-[11px]">
                  <tr>
                    <th className="py-2 px-2.5 w-8">#</th>
                    <th className="py-2 px-2.5">Description of Goods / Services</th>
                    <th className="py-2 px-2">HSN/SAC</th>
                    <th className="py-2 px-2 text-right">Qty</th>
                    <th className="py-2 px-2 text-right">Rate (₹)</th>
                    <th className="py-2 px-2 text-right">Taxable (₹)</th>
                    <th className="py-2 px-2 text-center">GST %</th>
                    <th className="py-2 px-2.5 text-right">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {voucher.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-2.5 text-slate-500">{idx + 1}</td>
                      <td className="py-2 px-2.5 font-semibold text-slate-900">{it.itemName}</td>
                      <td className="py-2 px-2 font-mono text-slate-700">{it.hsnCode}</td>
                      <td className="py-2 px-2 text-right font-mono">
                        {it.quantity} {it.unit}
                      </td>
                      <td className="py-2 px-2 text-right font-mono">₹{it.rate.toLocaleString('en-IN')}</td>
                      <td className="py-2 px-2 text-right font-mono">₹{it.taxableAmount.toLocaleString('en-IN')}</td>
                      <td className="py-2 px-2 text-center font-mono">{it.gstRate}%</td>
                      <td className="py-2 px-2.5 text-right font-mono font-bold">
                        ₹{it.totalAmount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations Breakdown */}
            <div className="grid grid-cols-2 gap-4 py-2">
              <div className="space-y-1">
                <div className="text-[11px] text-slate-500 font-medium">Invoice Amount in Words:</div>
                <div className="font-bold text-slate-900 text-xs italic">{amountInWords}</div>

                {voucher.narration && (
                  <div className="mt-3 text-[11px] text-slate-500">
                    <strong>Remarks:</strong> {voucher.narration}
                  </div>
                )}
              </div>

              <div className="space-y-1 text-xs text-right border-l border-slate-200 pl-4">
                <div className="flex justify-between text-slate-600">
                  <span>Taxable Amount:</span>
                  <span className="font-mono">₹{voucher.taxableTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                {voucher.cgstTotal > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Central Tax (CGST):</span>
                    <span className="font-mono">₹{voucher.cgstTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                {voucher.sgstTotal > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>State Tax (SGST):</span>
                    <span className="font-mono">₹{voucher.sgstTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                {voucher.igstTotal > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Integrated Tax (IGST):</span>
                    <span className="font-mono">₹{voucher.igstTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                {voucher.roundOff !== 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Round Off:</span>
                    <span className="font-mono">{voucher.roundOff}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-900 font-extrabold text-sm border-t-2 border-slate-900 pt-2">
                  <span>Grand Total (INR):</span>
                  <span className="font-mono text-base">₹{voucher.grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* HSN Tax Breakup Table */}
            {showHsnBreakup && (
              <div className="my-4 pt-3 border-t border-slate-200">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Tax Breakup Schedule
                </h4>
                <table className="w-full text-left text-[11px] border border-slate-200">
                  <thead className="bg-slate-100 font-semibold border-b">
                    <tr>
                      <th className="p-1.5">HSN/SAC</th>
                      <th className="p-1.5 text-right">Taxable (₹)</th>
                      <th className="p-1.5 text-right">CGST (₹)</th>
                      <th className="p-1.5 text-right">SGST (₹)</th>
                      <th className="p-1.5 text-right">IGST (₹)</th>
                      <th className="p-1.5 text-right">Total Tax (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {voucher.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="p-1.5">{it.hsnCode}</td>
                        <td className="p-1.5 text-right">₹{it.taxableAmount.toLocaleString('en-IN')}</td>
                        <td className="p-1.5 text-right">{it.cgstAmount > 0 ? `₹${it.cgstAmount.toLocaleString('en-IN')}` : '-'}</td>
                        <td className="p-1.5 text-right">{it.sgstAmount > 0 ? `₹${it.sgstAmount.toLocaleString('en-IN')}` : '-'}</td>
                        <td className="p-1.5 text-right">{it.igstAmount > 0 ? `₹${it.igstAmount.toLocaleString('en-IN')}` : '-'}</td>
                        <td className="p-1.5 text-right font-bold">
                          ₹{(it.cgstAmount + it.sgstAmount + it.igstAmount).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Bottom Footer: Bank Details + UPI QR Code + Signatory */}
            <div className="mt-6 pt-4 border-t-2 border-slate-300 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              {/* Bank Details */}
              {showBankDetails && (
                <div className="space-y-1 text-xs">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Bank Settlement Details:
                  </div>
                  <div className="font-semibold text-slate-900">{activeCompany.bankName}</div>
                  <div className="font-mono text-slate-700">A/C: {activeCompany.accountNumber}</div>
                  <div className="font-mono text-slate-700">IFSC: {activeCompany.ifsc}</div>
                  <div className="text-[11px] text-slate-500">{activeCompany.branch}</div>
                </div>
              )}

              {/* Dynamic UPI Payment QR Code */}
              {showUpiQr && (
                <div className="flex flex-col items-center justify-center text-center">
                  <QrCodeSvg value={upiPayload} size={95} title="Scan UPI to Pay" />
                  <span className="text-[10px] text-slate-500 mt-0.5 font-mono">{activeCompany.upiId}</span>
                </div>
              )}

              {/* Authorised Signatory */}
              {showSignature && (
                <div className="text-right space-y-8">
                  <div className="text-xs font-semibold text-slate-800">
                    For {activeCompany.name}
                  </div>
                  <div className="text-xs font-bold text-slate-900 border-t border-slate-400 pt-1 inline-block min-w-[140px]">
                    Authorised Signatory
                  </div>
                </div>
              )}
            </div>

            {/* Terms & Conditions */}
            {showTerms && (
              <div className="mt-6 pt-3 border-t border-slate-200 text-[10px] text-slate-500 space-y-0.5">
                <span className="font-bold text-slate-700">Declaration & Terms:</span>
                <p className="whitespace-pre-line">{activeCompany.defaultTerms}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
