/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Search, ArrowRight, CornerDownLeft, FileText, BarChart3, ShieldCheck, Database, Layers } from 'lucide-react';
import { VoucherType } from '../../types/erp';

interface GoToModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tabId: string) => void;
  onOpenVoucher: (type: VoucherType) => void;
  onOpenCompany: () => void;
  onOpenSubscription: () => void;
  onOpenDataBackup: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  hotkey?: string;
  category: 'Vouchers' | 'Reports' | 'Statutory' | 'Masters' | 'Utilities';
  action: () => void;
}

export const GoToModal: React.FC<GoToModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onOpenVoucher,
  onOpenCompany,
  onOpenSubscription,
  onOpenDataBackup,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const commands: CommandItem[] = [
    // Vouchers
    { id: 'vch-sales', title: 'Create Sales Invoice', subtitle: 'B2B/B2C Outward GST Tax Invoicing', hotkey: 'F8', category: 'Vouchers', action: () => onOpenVoucher('SALES') },
    { id: 'vch-pur', title: 'Create Purchase Voucher', subtitle: 'Record Inward supplies and ITC', hotkey: 'F9', category: 'Vouchers', action: () => onOpenVoucher('PURCHASE') },
    { id: 'vch-pay', title: 'Create Payment Voucher', subtitle: 'Record Bank or Cash disbursements', hotkey: 'F5', category: 'Vouchers', action: () => onOpenVoucher('PAYMENT') },
    { id: 'vch-rec', title: 'Create Receipt Voucher', subtitle: 'Customer inward settlements', hotkey: 'F6', category: 'Vouchers', action: () => onOpenVoucher('RECEIPT') },
    { id: 'vch-cnt', title: 'Create Contra Voucher', subtitle: 'Bank-to-cash or inter-bank transfers', hotkey: 'F4', category: 'Vouchers', action: () => onOpenVoucher('CONTRA') },
    { id: 'vch-jrn', title: 'Create Journal Voucher', subtitle: 'Depreciation, provisions and adjusting entries', hotkey: 'F7', category: 'Vouchers', action: () => onOpenVoucher('JOURNAL') },
    { id: 'vch-crn', title: 'Credit Note', subtitle: 'Sales return / Price difference', hotkey: 'Ctrl+F8', category: 'Vouchers', action: () => onOpenVoucher('CREDIT_NOTE') },
    { id: 'vch-drn', title: 'Debit Note', subtitle: 'Purchase return', hotkey: 'Ctrl+F9', category: 'Vouchers', action: () => onOpenVoucher('DEBIT_NOTE') },
    { id: 'vch-qtn', title: 'Create Quotation / Estimate', subtitle: 'Generate sales price quote', hotkey: 'Alt+F8', category: 'Vouchers', action: () => onOpenVoucher('QUOTATION') },
    { id: 'vch-dc', title: 'Create Delivery Challan', subtitle: 'Goods dispatch without invoice', hotkey: 'Alt+F8', category: 'Vouchers', action: () => onOpenVoucher('DELIVERY_CHALLAN') },

    // Reports & Statements
    { id: 'rep-pl', title: 'Profit & Loss Account', subtitle: 'Trading account & Net Profit statement', category: 'Reports', action: () => onNavigateTab('statements') },
    { id: 'rep-bs', title: 'Balance Sheet', subtitle: 'Horizontal & Vertical financial posture', category: 'Reports', action: () => onNavigateTab('statements') },
    { id: 'rep-tb', title: 'Trial Balance', subtitle: 'Dr/Cr ledger summary with drill-down', category: 'Reports', action: () => onNavigateTab('statements') },
    { id: 'rep-daybook', title: 'Day Book', subtitle: 'Chronological transaction register', category: 'Reports', action: () => onNavigateTab('vouchers') },
    { id: 'rep-stock', title: 'Stock Summary', subtitle: 'Multi-godown inventory & valuation', category: 'Reports', action: () => onNavigateTab('masters') },
    { id: 'rep-ratio', title: 'Financial Ratio Analysis', subtitle: 'Current ratio, GP%, NP%, debtor days', category: 'Reports', action: () => onNavigateTab('statements') },
    { id: 'rep-ageing', title: 'Debtors & Creditors Ageing', subtitle: '0-30, 31-60, 61-90, 90+ days overdue analysis', category: 'Reports', action: () => onNavigateTab('statements') },

    // Statutory Compliance
    { id: 'gst-gstr1', title: 'GSTR-1 Outward Return', subtitle: 'B2B, B2CL, B2CS, HSN Table & JSON export', category: 'Statutory', action: () => onNavigateTab('gst') },
    { id: 'gst-gstr3b', title: 'GSTR-3B Tax Offset & ITC', subtitle: 'Monthly summary & cash tax payable', category: 'Statutory', action: () => onNavigateTab('gst') },
    { id: 'gst-gstr2b', title: 'GSTR-2B Automated Reconciliation', subtitle: 'Match portal 2B vs purchase books', category: 'Statutory', action: () => onNavigateTab('gst') },
    { id: 'gst-gstr9', title: 'GSTR-9 Annual Return', subtitle: '12-month annual consolidated return', category: 'Statutory', action: () => onNavigateTab('gst') },
    { id: 'gst-eway', title: 'e-Way Bill Generator', subtitle: 'Part-A & Part-B transporter slips (> ₹50k)', category: 'Statutory', action: () => onNavigateTab('gst') },
    { id: 'gst-einv', title: 'e-Invoice Management', subtitle: '64-character IRN and signed QR code', category: 'Statutory', action: () => onNavigateTab('gst') },
    { id: 'gst-gsp', title: 'GSP API & e-Invoice Credentials', subtitle: 'ClearTax, Cygnet, Masters India live portal integration', category: 'Statutory', action: () => onNavigateTab('gsp-settings') },
    { id: 'gst-audit', title: 'Audit Trail & Edit Log (MCA Rule 3)', subtitle: 'Voucher change history, field-level diffs & CARO 2020 export', category: 'Statutory', action: () => onNavigateTab('audit-trail') },

    // Masters
    { id: 'mst-chart', title: 'Chart of Accounts (Ledgers)', subtitle: '28 Tally standard groups & opening balances', category: 'Masters', action: () => onNavigateTab('masters') },
    { id: 'mst-items', title: 'Stock Items & HSN Directory', subtitle: 'HSN/SAC codes, GST slabs & reorder levels', category: 'Masters', action: () => onNavigateTab('masters') },
    { id: 'mst-godowns', title: 'Godowns & Warehouses', subtitle: 'Multi-location storage depots', category: 'Masters', action: () => onNavigateTab('masters') },

    // Utilities
    { id: 'utl-my-sub', title: 'My Subscription & Billing', subtitle: 'View billing tier, download tax invoices & manage payment methods', category: 'Utilities', action: () => onNavigateTab('my-subscription') },
    { id: 'utl-comp', title: 'Select / Alter Company', subtitle: 'Company profile, GSTIN, bank details', hotkey: 'F3', category: 'Utilities', action: onOpenCompany },
    { id: 'utl-sub', title: 'Subscription & Razorpay Gateway', subtitle: 'Upgrade SaaS plan & download tax invoices', category: 'Utilities', action: onOpenSubscription },
    { id: 'utl-backup-hub', title: 'Backup & Restore Hub (Tally & Busy)', subtitle: 'Full migration, 1-click sample restore, XML/JSON export', hotkey: 'Alt+B', category: 'Utilities', action: () => onNavigateTab('backup-restore') },
    { id: 'utl-tally-xml', title: 'Restore from Tally Prime Backup (.xml)', subtitle: 'Import <ENVELOPE> vouchers, ledgers & stock items', category: 'Utilities', action: () => onNavigateTab('backup-restore') },
    { id: 'utl-busy-data', title: 'Restore from Busy Accounting Backup (.xml / .json)', subtitle: 'Import <BUSYDATA> masters, transactions & party books', category: 'Utilities', action: () => onNavigateTab('backup-restore') },
    { id: 'utl-data-modal', title: 'Quick Backup & Books Lock Date', subtitle: 'Statutory MCA Rule 3 lock date & local snapshots', category: 'Utilities', action: onOpenDataBackup },
    { id: 'utl-ca', title: 'CA Multi-Client Workspace', subtitle: 'Manage client accounts and auditor staff', category: 'Utilities', action: () => onNavigateTab('ca-portal') },
  ];

  const filtered = query.trim()
    ? commands.filter(
        c =>
          c.title.toLowerCase().includes(query.toLowerCase()) ||
          c.subtitle.toLowerCase().includes(query.toLowerCase()) ||
          c.category.toLowerCase().includes(query.toLowerCase()) ||
          (c.hotkey && c.hotkey.toLowerCase().includes(query.toLowerCase()))
      )
    : commands;

  const handleSelect = (cmd: CommandItem) => {
    onClose();
    cmd.action();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1 < filtered.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 >= 0 ? prev - 1 : filtered.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        handleSelect(filtered[selectedIndex]);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-60 bg-background/80 backdrop-blur-xs flex items-start justify-center pt-20 p-4">
      <div className="bg-card text-card-foreground w-full max-w-xl rounded-sm shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-border flex items-center gap-3 bg-muted/40">
          <Search size={18} className="text-primary shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Go To: Type a report, voucher (F8, F9), Tally/Busy restore, ledger..."
            className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-sm font-medium focus:outline-none"
          />
          <kbd className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-sm border border-border shadow-2xs shrink-0">
            Esc to exit
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No matching commands found for "{query}".
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 rounded-sm flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected ? 'bg-secondary text-secondary-foreground font-medium' : 'hover:bg-muted/50 text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-sm flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {item.category === 'Vouchers' && <FileText size={14} />}
                      {item.category === 'Reports' && <BarChart3 size={14} />}
                      {item.category === 'Statutory' && <ShieldCheck size={14} />}
                      {item.category === 'Masters' && <Layers size={14} />}
                      {item.category === 'Utilities' && <Database size={14} />}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs truncate flex items-center gap-2">
                        <span>{item.title}</span>
                        <span className="text-[10px] text-muted-foreground font-normal">({item.category})</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">{item.subtitle}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.hotkey && (
                      <kbd className="text-[11px] font-mono font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded-sm shadow-2xs">
                        {item.hotkey}
                      </kbd>
                    )}
                    {isSelected && <CornerDownLeft size={14} className="text-primary" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Hint */}
        <div className="p-2.5 bg-muted/40 border-t border-border flex justify-between text-[11px] text-muted-foreground px-4">
          <span>Navigate with ↑ / ↓ keys</span>
          <span>Press Enter to Open</span>
        </div>
      </div>
    </div>
  );
};
