/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Calendar,
  Filter,
  Download,
  Printer,
  Share2,
  Trash2,
  XCircle,
  Copy,
  Plus,
  Search,
  ArrowUpDown,
  ShieldCheck,
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { Voucher, VoucherType } from '../../types/erp';
import { WhatsAppDocType } from '../../services/whatsappService';

interface DayBookViewProps {
  onOpenVoucher: (type: VoucherType) => void;
  onPrintVoucher: (voucherId: string) => void;
  onOpenWhatsApp?: (docType: WhatsAppDocType, voucher: Voucher) => void;
  onNavigateTab?: (tab: string) => void;
}

export const DayBookView: React.FC<DayBookViewProps> = ({
  onOpenVoucher,
  onPrintVoucher,
  onOpenWhatsApp,
  onNavigateTab,
}) => {
  const { vouchers, activeCompany, cancelVoucher, deleteVoucher, createVoucher } = useErp();
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState('2026-04-01');
  const [toDate, setToDate] = useState('2027-03-31');

  const filteredVouchers = vouchers.filter(v => {
    const matchesType = filterType === 'ALL' || v.voucherType === filterType;
    const matchesSearch =
      v.voucherNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.partyName && v.partyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (v.narration && v.narration.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDate = v.date >= fromDate && v.date <= toDate;
    return matchesType && matchesSearch && matchesDate;
  });

  const totalAmount = filteredVouchers
    .filter(v => v.status === 'ACTIVE')
    .reduce((acc, v) => acc + v.grandTotal, 0);

  const handleDuplicate = (v: Voucher) => {
    const randNum = String(Math.floor(100 + Math.random() * 900));
    createVoucher({
      ...v,
      voucherNumber: `${v.voucherNumber}-DUP${randNum}`,
      date: new Date().toISOString().split('T')[0],
      narration: `Duplicated from ${v.voucherNumber}`,
    });
  };

  const handleWhatsAppShare = (v: Voucher) => {
    if (onOpenWhatsApp) {
      onOpenWhatsApp('INVOICE', v);
    }
  };

  const handleExportCsv = () => {
    const headers = [
      'Date',
      'Voucher No',
      'Voucher Type',
      'Party Name',
      'Party GSTIN',
      'Taxable Total',
      'CGST',
      'SGST',
      'IGST',
      'Grand Total',
      'Status',
      'Narration',
    ];

    const rows = filteredVouchers.map(v => [
      v.date,
      v.voucherNumber,
      v.voucherType,
      `"${(v.partyName || '').replace(/"/g, '""')}"`,
      v.partyGstin || '',
      v.taxableTotal,
      v.cgstTotal,
      v.sgstTotal,
      v.igstTotal,
      v.grandTotal,
      v.status,
      `"${(v.narration || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `DayBook_${activeCompany.name.replace(/[^A-Za-z0-9]/g, '_')}_${fromDate}_to_${toDate}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Title & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs">
            <span className="uppercase tracking-wider font-semibold text-muted-foreground">
              Day Book Register
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="text-foreground font-mono font-medium">
              {filteredVouchers.length} Transactions
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-foreground">
            Day Book & Audit Vouchers
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onOpenVoucher('SALES')}
            className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} /> New Sales [F8]
          </button>
          <button
            onClick={() => onOpenVoucher('PURCHASE')}
            className="px-3 py-1.5 text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-sm shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} /> New Purchase [F9]
          </button>
          <button
            onClick={handleExportCsv}
            className="px-3 py-1.5 text-xs font-medium bg-card hover:bg-accent text-foreground rounded-sm border border-border transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Download size={13} /> Export CSV [Alt+E]
          </button>
          {filteredVouchers.length > 0 && (
            <button
              onClick={() => onPrintVoucher(filteredVouchers[0].id)}
              className="px-3 py-1.5 text-xs font-semibold bg-card hover:bg-accent text-foreground rounded-sm border border-border transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="Print Current Voucher [Ctrl+P / Alt+P]"
            >
              <Printer size={13} /> Print [Ctrl+P]
            </button>
          )}
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('audit-trail')}
              className="px-3 py-1.5 text-xs font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded-sm border border-amber-500/30 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="View MCA Rule 3(1) Edit Log and Change Audit Trail"
            >
              <ShieldCheck size={14} className="text-amber-600 dark:text-amber-400" />
              <span>Audit Trail (MCA)</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Ribbon: Search, Date Range, Voucher Type Tabs */}
      <div className="bg-card p-4 rounded-sm border border-border shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by Voucher No, Party name, narration..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-border rounded-sm bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-2 self-start md:self-auto text-xs text-muted-foreground">
            <span className="font-medium text-foreground">From:</span>
            <input
              type="date"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              className="px-2.5 py-1 font-mono text-xs border border-border rounded-sm bg-background text-foreground"
            />
            <span className="font-medium text-foreground">To:</span>
            <input
              type="date"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              className="px-2.5 py-1 font-mono text-xs border border-border rounded-sm bg-background text-foreground"
            />
          </div>
        </div>

        {/* Voucher Type Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pt-1 no-scrollbar text-xs">
          {[
            { id: 'ALL', label: 'All Vouchers' },
            { id: 'SALES', label: 'Sales (F8)' },
            { id: 'PURCHASE', label: 'Purchase (F9)' },
            { id: 'PAYMENT', label: 'Payment (F5)' },
            { id: 'RECEIPT', label: 'Receipt (F6)' },
            { id: 'CONTRA', label: 'Contra (F4)' },
            { id: 'JOURNAL', label: 'Journal (F7)' },
            { id: 'CREDIT_NOTE', label: 'Credit Note' },
            { id: 'DEBIT_NOTE', label: 'Debit Note' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-2.5 py-1 rounded-sm whitespace-nowrap font-medium transition-colors cursor-pointer ${
                filterType === tab.id
                  ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                  : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vouchers Table */}
      <div className="bg-card rounded-sm border border-border shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/60 text-muted-foreground font-semibold border-b border-border text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Voucher No.</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Particulars (Party / Account)</th>
                <th className="py-2.5 px-3 text-right">Taxable (₹)</th>
                <th className="py-2.5 px-3 text-right">GST (₹)</th>
                <th className="py-2.5 px-3 text-right">Total Amount (₹)</th>
                <th className="py-2.5 px-2 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredVouchers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-muted-foreground text-xs">
                    No vouchers found matching the current filters.
                  </td>
                </tr>
              ) : (
                filteredVouchers.map(v => (
                  <tr key={v.id} className="hover:bg-muted/40 transition-colors">
                    {/* Date */}
                    <td className="py-2.5 px-3 font-mono text-muted-foreground whitespace-nowrap">
                      {v.date}
                    </td>

                    {/* Voucher Number */}
                    <td className="py-2.5 px-3 font-mono font-bold text-foreground whitespace-nowrap">
                      {v.voucherNumber}
                    </td>

                    {/* Type Badge */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-xs font-mono bg-muted border border-border text-foreground">
                        {v.voucherType}
                      </span>
                    </td>

                    {/* Particulars */}
                    <td className="py-2.5 px-3 min-w-[200px]">
                      <div className="font-semibold text-foreground truncate">
                        {v.partyName || (v.ledgerEntries[0] ? v.ledgerEntries[0].ledgerName : 'General Journal Entry')}
                      </div>
                      {v.narration && (
                        <div className="text-[11px] text-muted-foreground truncate max-w-sm">{v.narration}</div>
                      )}
                    </td>

                    {/* Taxable */}
                    <td className="py-2.5 px-3 text-right font-mono text-foreground tabular-nums">
                      {v.taxableTotal > 0 ? `₹${v.taxableTotal.toLocaleString('en-IN')}` : '-'}
                    </td>

                    {/* GST Total */}
                    <td className="py-2.5 px-3 text-right font-mono text-foreground tabular-nums">
                      {v.cgstTotal + v.sgstTotal + v.igstTotal > 0
                        ? `₹${(v.cgstTotal + v.sgstTotal + v.igstTotal).toLocaleString('en-IN')}`
                        : '-'}
                    </td>

                    {/* Grand Total */}
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground tabular-nums">
                      ₹{v.grandTotal.toLocaleString('en-IN')}
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-2 text-center">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-xs ${
                          v.status === 'ACTIVE'
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                            : 'bg-destructive/15 text-destructive border border-destructive/30 line-through'
                        }`}
                      >
                        {v.status}
                      </span>
                    </td>

                    {/* Action buttons */}
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onPrintVoucher(v.id)}
                          className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xs transition-colors cursor-pointer"
                          title="Print Tax Invoice [Alt+P]"
                        >
                          <Printer size={13} />
                        </button>
                        <button
                          onClick={() => handleWhatsAppShare(v)}
                          className="p-1 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 rounded-xs transition-colors cursor-pointer"
                          title="WhatsApp Invoice"
                        >
                          <Share2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDuplicate(v)}
                          className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xs transition-colors cursor-pointer"
                          title="Duplicate Voucher"
                        >
                          <Copy size={13} />
                        </button>
                        {onNavigateTab && (
                          <button
                            onClick={() => onNavigateTab('audit-trail')}
                            className="p-1 text-primary hover:bg-primary/10 rounded-xs transition-colors cursor-pointer"
                            title="View Voucher Edit History [MCA Rule 3]"
                          >
                            <ShieldCheck size={13} />
                          </button>
                        )}
                        {v.status === 'ACTIVE' && (
                          <button
                            onClick={() => cancelVoucher(v.id, 'Cancelled by user')}
                            className="p-1 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 rounded-xs transition-colors cursor-pointer"
                            title="Cancel Voucher"
                          >
                            <XCircle size={13} />
                          </button>
                        )}
                        <button
                          onClick={() => deleteVoucher(v.id)}
                          className="p-1 text-destructive hover:bg-destructive/10 rounded-xs transition-colors cursor-pointer"
                          title="Delete Voucher [Alt+D]"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary Strip */}
        <div className="bg-muted/30 p-3.5 px-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="text-muted-foreground">
            Showing <strong className="text-foreground">{filteredVouchers.length}</strong> vouchers between{' '}
            <span className="font-mono">{fromDate}</span> and <span className="font-mono">{toDate}</span>
          </div>
          <div className="text-xs font-semibold text-foreground flex items-center gap-2">
            <span>Filtered Total Turnover:</span>
            <span className="font-mono text-primary font-bold text-sm">
              ₹{totalAmount.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
