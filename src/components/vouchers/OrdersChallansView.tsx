/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, ArrowRight, Share2, Printer, CheckCircle, FileText, Send } from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { VoucherType, Voucher } from '../../types/erp';
import { WhatsAppDocType } from '../../services/whatsappService';

interface OrdersChallansViewProps {
  onOpenVoucher: (type: VoucherType) => void;
  onPrintVoucher: (voucherId: string) => void;
  onOpenWhatsApp?: (docType: WhatsAppDocType, voucher: Voucher) => void;
}

export const OrdersChallansView: React.FC<OrdersChallansViewProps> = ({
  onOpenVoucher,
  onPrintVoucher,
  onOpenWhatsApp,
}) => {
  const { vouchers, createVoucher, activeCompany } = useErp();
  const [activeTab, setActiveTab] = useState<'QUOTATION' | 'DELIVERY_CHALLAN' | 'SALES_ORDER' | 'GRN'>('QUOTATION');

  const orderVouchers = vouchers.filter(v => v.status === 'ACTIVE' && v.voucherType === activeTab);

  const handleConvertToInvoice = (v: Voucher) => {
    const isSalesCycle = ['QUOTATION', 'SALES_ORDER', 'DELIVERY_CHALLAN'].includes(v.voucherType);
    const targetType: VoucherType = isSalesCycle ? 'SALES' : 'PURCHASE';
    const randNum = String(Math.floor(100 + Math.random() * 900));
    const invNumber = isSalesCycle ? `INV/26-27/CV${randNum}` : `PUR/26-27/CV${randNum}`;

    createVoucher({
      ...v,
      voucherType: targetType,
      voucherNumber: invNumber,
      date: new Date().toISOString().split('T')[0],
      narration: `Converted from ${v.voucherType} ${v.voucherNumber}`,
    });
  };

  const handleWhatsAppOrder = (v: Voucher) => {
    if (onOpenWhatsApp) {
      const type: WhatsAppDocType = v.voucherType === 'QUOTATION' ? 'QUOTATION' : 'DELIVERY_CHALLAN';
      onOpenWhatsApp(type, v);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs">
            <span className="uppercase tracking-wider font-semibold text-muted-foreground">
              Order Management & Logistics
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              1-Click Convert to Invoice
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-foreground">
            Quotations, Orders & Delivery Challans
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenVoucher('QUOTATION')}
            className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} /> New Quotation
          </button>
          <button
            onClick={() => onOpenVoucher('DELIVERY_CHALLAN')}
            className="px-3 py-1.5 text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-sm shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} /> New Delivery Challan
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-sm w-fit text-xs border border-border">
        {[
          { id: 'QUOTATION' as const, label: 'Quotations / Estimates' },
          { id: 'DELIVERY_CHALLAN' as const, label: 'Delivery Challans' },
          { id: 'SALES_ORDER' as const, label: 'Sales Orders' },
          { id: 'GRN' as const, label: 'Goods Receipt Notes (GRN)' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 font-medium rounded-sm transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-card text-foreground font-semibold shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {orderVouchers.length === 0 ? (
          <div className="col-span-2 p-12 bg-card rounded-sm border border-border text-center text-xs text-muted-foreground">
            No active {activeTab.replace(/_/g, ' ')} records found. Click "+ New" above to generate one.
          </div>
        ) : (
          orderVouchers.map(v => (
            <div key={v.id} className="bg-card rounded-sm border border-border p-4 shadow-2xs space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-foreground text-sm">{v.voucherNumber}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-xs bg-muted border border-border text-foreground font-mono">
                      {v.voucherType}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-foreground mt-1">{v.partyName}</div>
                  <div className="text-[11px] text-muted-foreground font-mono">Date: {v.date}</div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold font-mono text-foreground">
                    ₹{v.grandTotal.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Taxable: ₹{v.taxableTotal.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Items summary */}
              <div className="p-2.5 bg-muted/40 rounded-sm text-xs space-y-1">
                {v.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-muted-foreground">
                    <span className="truncate max-w-[220px]">
                      {it.itemName} ({it.quantity} {it.unit})
                    </span>
                    <span className="font-mono tabular-nums text-foreground">
                      ₹{it.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Actions: Convert to Invoice, Print, WhatsApp */}
              <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onPrintVoucher(v.id)}
                    className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xs transition-colors flex items-center gap-1 cursor-pointer"
                    title="Print Document [Alt+P]"
                  >
                    <Printer size={13} /> Print
                  </button>
                  <button
                    onClick={() => handleWhatsAppOrder(v)}
                    className="p-1 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 rounded-xs transition-colors flex items-center gap-1 cursor-pointer"
                    title="Share via WhatsApp"
                  >
                    <Share2 size={13} /> WhatsApp
                  </button>
                </div>

                <button
                  onClick={() => handleConvertToInvoice(v)}
                  className="px-2.5 py-1 bg-primary text-primary-foreground hover:bg-primary/90 font-medium rounded-sm shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Convert to Invoice</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
