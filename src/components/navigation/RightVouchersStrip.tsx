/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { VoucherType } from '../../types/erp';
import { Zap, Plus, ArrowRight } from 'lucide-react';

interface RightVouchersStripProps {
  onOpenVoucher: (type: VoucherType) => void;
  onNavigateTab?: (tab: string) => void;
}

export const RightVouchersStrip: React.FC<RightVouchersStripProps> = ({
  onOpenVoucher,
  onNavigateTab,
}) => {
  const voucherButtons: {
    type: VoucherType;
    label: string;
    combo: string;
    highlight?: boolean;
    hint?: string;
  }[] = [
    { type: 'SALES', label: 'Sales Invoice', combo: 'F8', highlight: true, hint: 'Tax invoice' },
    { type: 'PURCHASE', label: 'Purchase Bill', combo: 'F9', highlight: true, hint: 'Inward supplies' },
    { type: 'RECEIPT', label: 'Receipt Voucher', combo: 'F6', hint: 'Customer cash/bank' },
    { type: 'PAYMENT', label: 'Payment Voucher', combo: 'F5', hint: 'Supplier settlement' },
    { type: 'CONTRA', label: 'Contra Voucher', combo: 'F4', hint: 'Bank / Cash transfer' },
    { type: 'JOURNAL', label: 'Journal Voucher', combo: 'F7', hint: 'Provisions & adjustments' },
    { type: 'CREDIT_NOTE', label: 'Credit Note', combo: 'Ctrl+F8', hint: 'Sales return' },
    { type: 'DEBIT_NOTE', label: 'Debit Note', combo: 'Ctrl+F9', hint: 'Purchase return' },
    { type: 'QUOTATION', label: 'Quotation / Est', combo: 'Alt+F8', hint: 'Price quote' },
    { type: 'DELIVERY_CHALLAN', label: 'Delivery Challan', combo: 'Alt+F8', hint: 'Goods dispatch' },
  ];

  return (
    <aside className="hidden w-44 shrink-0 flex-col gap-1 overflow-y-auto border-l border-border bg-sidebar p-2 xl:flex print:hidden select-none transition-colors">
      <div className="px-2 pt-1 pb-1.5 flex items-center justify-between border-b border-border/60 mb-1">
        <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
          Vouchers
        </span>
        <Zap className="size-3 text-amber-500" />
      </div>

      <div className="space-y-1">
        {voucherButtons.map(item => (
          <button
            key={item.label}
            type="button"
            onClick={() => onOpenVoucher(item.type)}
            className={`group flex w-full cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-left text-xs transition-colors hover:bg-accent hover:text-accent-foreground ${
              item.highlight
                ? 'font-semibold text-foreground bg-primary/5 hover:bg-accent border border-primary/20'
                : 'text-foreground/85 hover:bg-accent border border-transparent'
            }`}
          >
            <div className="min-w-0 pr-1">
              <span className="block truncate text-[11px] font-medium leading-tight">
                {item.label}
              </span>
            </div>
            <kbd className="font-mono text-[10px] font-bold text-primary bg-background px-1 py-0.2 rounded border border-border shadow-2xs shrink-0">
              {item.combo}
            </kbd>
          </button>
        ))}
      </div>

      {onNavigateTab && (
        <div className="mt-3 pt-2 border-t border-border/60 space-y-1">
          <span className="px-2 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase block mb-1">
            Statutory
          </span>
          <button
            type="button"
            onClick={() => onNavigateTab('gst')}
            className="flex w-full cursor-pointer items-center justify-between rounded-sm px-2 py-1 text-xs text-foreground/80 hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <span className="text-[11px]">GST Returns</span>
            <kbd className="font-mono text-[9px] text-muted-foreground">Alt+G</kbd>
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('audit-trail')}
            className="flex w-full cursor-pointer items-center justify-between rounded-sm px-2 py-1 text-xs text-foreground/80 hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <span className="text-[11px]">Audit Log</span>
            <kbd className="font-mono text-[9px] text-emerald-600 dark:text-emerald-400">Rule 3</kbd>
          </button>
        </div>
      )}
    </aside>
  );
};
