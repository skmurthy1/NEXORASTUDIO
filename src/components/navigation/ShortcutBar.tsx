/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { VoucherType } from '../../types/erp';
import {
  FileText,
  Calendar,
  Building2,
  Search,
  HelpCircle,
  ShieldCheck,
  Printer,
  FileCheck,
  Zap,
} from 'lucide-react';

interface ShortcutBarProps {
  onOpenVoucher: (type: VoucherType) => void;
  onOpenDate: () => void;
  onOpenPeriod: () => void;
  onOpenCompany: () => void;
  onOpenCheatSheet: () => void;
  onOpenGoTo: () => void;
}

export const ShortcutBar: React.FC<ShortcutBarProps> = ({
  onOpenVoucher,
  onOpenDate,
  onOpenPeriod,
  onOpenCompany,
  onOpenCheatSheet,
  onOpenGoTo,
}) => {
  const entries = [
    { label: 'Date', combo: 'F2', run: onOpenDate },
    { label: 'Period', combo: 'Alt+F2', run: onOpenPeriod },
    { label: 'Company', combo: 'F3', run: onOpenCompany },
    { label: 'Contra', combo: 'F4', run: () => onOpenVoucher('CONTRA') },
    { label: 'Payment', combo: 'F5', run: () => onOpenVoucher('PAYMENT') },
    { label: 'Receipt', combo: 'F6', run: () => onOpenVoucher('RECEIPT') },
    { label: 'Journal', combo: 'F7', run: () => onOpenVoucher('JOURNAL') },
    { label: 'Sales', combo: 'F8', run: () => onOpenVoucher('SALES'), highlight: true },
    { label: 'Cr Note', combo: 'Ctrl+F8', run: () => onOpenVoucher('CREDIT_NOTE') },
    { label: 'Purchase', combo: 'F9', run: () => onOpenVoucher('PURCHASE'), highlight: true },
    { label: 'Dr Note', combo: 'Ctrl+F9', run: () => onOpenVoucher('DEBIT_NOTE') },
    { label: 'Go To', combo: 'Alt+G', run: onOpenGoTo },
  ];

  return (
    <>
      {/* Desktop Bottom Ribbon (Matches nexorabooks.onhercules.app footer) */}
      <footer className="hidden shrink-0 border-t border-border bg-sidebar md:block print:hidden select-none fixed bottom-0 left-0 right-0 z-30 transition-colors shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-3 py-1">
          <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5 overflow-x-auto no-scrollbar">
            {entries.map(e => (
              <button
                key={e.combo}
                type="button"
                onClick={e.run}
                className={`flex cursor-pointer items-center gap-1.5 rounded-sm px-2 py-0.5 text-xs whitespace-nowrap text-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground ${
                  e.highlight ? 'font-semibold text-primary' : ''
                }`}
              >
                <kbd className="bg-background font-mono text-[10px] text-primary border border-border px-1 py-0.2 rounded shadow-2xs">
                  {e.combo}
                </kbd>
                <span className="text-[11px]">{e.label}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onOpenCheatSheet}
            className="flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-sm border border-border bg-card shrink-0 transition-colors cursor-pointer"
            title="Keyboard Shortcuts [?]"
          >
            <HelpCircle size={12} className="text-primary" />
            <span>Shortcuts</span>
            <kbd className="font-mono text-[10px] bg-muted px-1 rounded">?</kbd>
          </button>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar (Matches nexorabooks.onhercules.app mobile nav) */}
      <nav className="flex shrink-0 border-t border-border bg-sidebar md:hidden print:hidden fixed bottom-0 left-0 right-0 z-30 select-none py-1 justify-around text-[10px] text-muted-foreground transition-colors shadow-sm">
        <button
          type="button"
          onClick={() => onOpenVoucher('SALES')}
          className="flex flex-col items-center gap-0.5 py-1 px-3 cursor-pointer text-primary font-medium"
        >
          <Zap className="size-4" />
          <span>+ Sales</span>
        </button>
        <button
          type="button"
          onClick={() => onOpenVoucher('PURCHASE')}
          className="flex flex-col items-center gap-0.5 py-1 px-3 cursor-pointer hover:text-foreground"
        >
          <FileText className="size-4" />
          <span>+ Purchase</span>
        </button>
        <button
          type="button"
          onClick={onOpenGoTo}
          className="flex flex-col items-center gap-0.5 py-1 px-3 cursor-pointer hover:text-foreground"
        >
          <Search className="size-4" />
          <span>Go To</span>
        </button>
        <button
          type="button"
          onClick={onOpenDate}
          className="flex flex-col items-center gap-0.5 py-1 px-3 cursor-pointer hover:text-foreground"
        >
          <Calendar className="size-4" />
          <span>Date</span>
        </button>
      </nav>
    </>
  );
};

export const KeyboardCheatSheetModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const categories = [
    {
      title: 'Voucher Entry Keys',
      shortcuts: [
        { key: 'F4', desc: 'Contra Voucher (Cash to Bank / Bank to Cash)' },
        { key: 'F5', desc: 'Payment Voucher (Vendor & Expense settlement)' },
        { key: 'F6', desc: 'Receipt Voucher (Customer collection)' },
        { key: 'F7', desc: 'Journal Voucher (Adjusting provisions & entries)' },
        { key: 'F8', desc: 'Sales Voucher (B2B / B2C Tax Invoicing)' },
        { key: 'Ctrl + F8', desc: 'Credit Note (Sales Return / Rate difference)' },
        { key: 'Alt + F8', desc: 'Delivery Challan / Quotation' },
        { key: 'F9', desc: 'Purchase Voucher (Inward Tax Invoicing)' },
        { key: 'Ctrl + F9', desc: 'Debit Note (Purchase Return)' },
        { key: 'Alt + F9', desc: 'Goods Receipt Note (GRN)' },
      ],
    },
    {
      title: 'Power Navigation & Global Tools',
      shortcuts: [
        { key: 'Alt + G', desc: 'Go To - Global search modal anywhere in ERP' },
        { key: 'F2', desc: 'Date - Change current transaction voucher date' },
        { key: 'Alt + F2', desc: 'Period - Change financial reporting window' },
        { key: 'F3', desc: 'Company - Select or alter company master' },
        { key: 'Alt + C', desc: 'Quick Master Create (Ledger or Stock Item)' },
        { key: 'Ctrl + A', desc: 'Accept / Save active voucher immediately' },
        { key: 'Esc', desc: 'Quit / Dismiss active modal dialog' },
        { key: 'Alt + P', desc: 'Print active voucher or statement' },
        { key: 'Alt + E', desc: 'Export report (Excel / PDF / JSON)' },
        { key: 'Alt + A', desc: 'Audit Trail (MCA Rule 3 Edit Log)' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none">
      <div className="bg-card text-foreground rounded-md border border-border shadow-lg max-w-2xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="font-serif text-lg font-bold">Keyboard Shortcuts Cheat Sheet</span>
            <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
              Tally Prime Standard
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground rounded-sm hover:bg-muted transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[65vh] overflow-y-auto pr-1">
          {categories.map(cat => (
            <div key={cat.title} className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {cat.title}
              </h4>
              <div className="space-y-1.5">
                {cat.shortcuts.map(sc => (
                  <div
                    key={sc.key}
                    className="flex items-center justify-between p-1.5 rounded-sm bg-muted/40 hover:bg-muted text-xs border border-border/50"
                  >
                    <span className="text-foreground text-[11px] font-medium">{sc.desc}</span>
                    <kbd className="font-mono text-[11px] font-bold text-primary bg-card px-1.5 py-0.5 rounded border border-border shadow-2xs shrink-0 ml-2">
                      {sc.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span>Press <kbd className="font-mono text-foreground font-bold bg-muted px-1 rounded">Esc</kbd> anytime to return</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-primary text-primary-foreground font-semibold rounded-sm hover:bg-primary/90 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
