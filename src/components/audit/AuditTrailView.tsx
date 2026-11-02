/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  Printer,
  Calendar,
  Clock,
  User,
  FileText,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowRight,
  RefreshCw,
  Hash,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Sparkles,
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { AuditLogEntry, VoucherType } from '../../types/erp';

interface AuditTrailViewProps {
  onNavigateTab?: (tab: string) => void;
  onOpenVoucher?: (type: VoucherType) => void;
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({
  onNavigateTab,
  onOpenVoucher,
}) => {
  const { auditLogs, activeCompany, reportingPeriod } = useErp();

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');
  const [selectedVoucherType, setSelectedVoucherType] = useState<string>('ALL');
  const [fromDate, setFromDate] = useState(reportingPeriod.from || '2026-04-01');
  const [toDate, setToDate] = useState(reportingPeriod.to || '2027-03-31');
  const [selectedVoucherFilter, setSelectedVoucherFilter] = useState<string | null>(null);
  const [expandedLogIds, setExpandedLogIds] = useState<Record<string, boolean>>({});

  // Toggle single log expansion for field diffs
  const toggleExpand = (id: string) => {
    setExpandedLogIds(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Filter audit logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      // Voucher specific filter
      if (selectedVoucherFilter && log.voucherNumber !== selectedVoucherFilter) {
        return false;
      }

      // Action filter
      if (selectedAction !== 'ALL' && log.action !== selectedAction) {
        return false;
      }

      // Voucher type filter
      if (selectedVoucherType !== 'ALL' && log.voucherType !== selectedVoucherType) {
        return false;
      }

      // Date range filter
      const logDate = log.timestamp.split('T')[0];
      if (logDate < fromDate || logDate > toDate) {
        return false;
      }

      // Query search across fields
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesDetails = (log.details || '').toLowerCase().includes(q);
        const matchesVoucher = (log.voucherNumber || '').toLowerCase().includes(q);
        const matchesType = (log.voucherType || '').toLowerCase().includes(q);
        const matchesUser = (log.user || '').toLowerCase().includes(q);
        const matchesMobile = (log.userMobile || '').toLowerCase().includes(q);
        const matchesReason = (log.reason || '').toLowerCase().includes(q);
        const matchesHash = (log.hash || '').toLowerCase().includes(q);

        // Also search within field changes
        const matchesDiffs = log.fieldChanges?.some(
          fc =>
            fc.fieldLabel.toLowerCase().includes(q) ||
            fc.oldValue.toLowerCase().includes(q) ||
            fc.newValue.toLowerCase().includes(q)
        );

        if (
          !matchesDetails &&
          !matchesVoucher &&
          !matchesType &&
          !matchesUser &&
          !matchesMobile &&
          !matchesReason &&
          !matchesHash &&
          !matchesDiffs
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    auditLogs,
    selectedVoucherFilter,
    selectedAction,
    selectedVoucherType,
    fromDate,
    toDate,
    searchQuery,
  ]);

  // Statistics
  const totalEvents = auditLogs.length;
  const alterEvents = auditLogs.filter(l => l.action === 'ALTER').length;
  const cancelEvents = auditLogs.filter(l => l.action === 'CANCEL' || l.action === 'DELETE').length;
  const uniqueUsers = new Set(auditLogs.map(l => l.user)).size;

  // Format date-time into IST readable format
  const formatIstTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
    } catch {
      return isoString;
    }
  };

  // Export Audit Trail as CSV
  const handleExportCsv = () => {
    const headers = [
      'Log ID',
      'Date Time (IST)',
      'Action',
      'Voucher Type',
      'Voucher Number',
      'User',
      'Mobile',
      'Role',
      'Details',
      'Field Changed',
      'Old Value',
      'New Value',
      'MCA Tamper Hash',
      'IP / Terminal',
    ];

    const rows: string[][] = [];

    filteredLogs.forEach(l => {
      if (l.fieldChanges && l.fieldChanges.length > 0) {
        l.fieldChanges.forEach((fc, idx) => {
          rows.push([
            idx === 0 ? l.id : '',
            idx === 0 ? formatIstTime(l.timestamp) : '',
            idx === 0 ? l.action : '',
            idx === 0 ? l.voucherType : '',
            idx === 0 ? l.voucherNumber : '',
            idx === 0 ? l.user : '',
            idx === 0 ? l.userMobile || '' : '',
            idx === 0 ? l.userRole || '' : '',
            idx === 0 ? `"${(l.details || '').replace(/"/g, '""')}"` : '',
            `"${fc.fieldLabel.replace(/"/g, '""')}"`,
            `"${fc.oldValue.replace(/"/g, '""')}"`,
            `"${fc.newValue.replace(/"/g, '""')}"`,
            idx === 0 ? l.hash || '' : '',
            idx === 0 ? l.ipAddress || '' : '',
          ]);
        });
      } else {
        rows.push([
          l.id,
          formatIstTime(l.timestamp),
          l.action,
          l.voucherType,
          l.voucherNumber,
          l.user,
          l.userMobile || '',
          l.userRole || '',
          `"${(l.details || '').replace(/"/g, '""')}"`,
          '-',
          `"${(l.previousValue || '').replace(/"/g, '""')}"`,
          `"${(l.newValue || '').replace(/"/g, '""')}"`,
          l.hash || '',
          l.ipAddress || '',
        ]);
      }
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MCA_Rule3_AuditTrail_${activeCompany.gstin || 'GST'}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const getActionBadge = (action: AuditLogEntry['action']) => {
    switch (action) {
      case 'CREATE':
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
      case 'ALTER':
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 font-bold';
      case 'CANCEL':
        return 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30';
      case 'DELETE':
        return 'bg-destructive/10 text-destructive border-destructive/30 font-bold';
      case 'PRINT':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'EXPORT':
        return 'bg-secondary text-secondary-foreground border-border';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Title & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs">
            <span className="uppercase tracking-wider font-semibold text-muted-foreground">
              Statutory Compliance Engine
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-mono font-medium flex items-center gap-1">
              <ShieldCheck size={13} />
              MCA Rule 3(1) Edit Log Mandate Active
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-foreground">
            Statutory Audit Trail & Voucher Edit Log
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Download CSV for Statutory Auditors"
          >
            <Download size={13} />
            <span>Export Audit Trail (CSV)</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 text-xs font-medium bg-card hover:bg-accent text-foreground border border-border rounded-sm transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            title="Print Audit Report"
          >
            <Printer size={13} />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Events */}
        <div className="bg-card p-4 rounded-sm border border-border shadow-2xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span className="font-medium">Total Audit Events</span>
            <Clock size={14} className="text-primary" />
          </div>
          <div className="text-2xl font-bold font-mono text-foreground">{totalEvents}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Continuous audit trail recording</div>
        </div>

        {/* Alterations */}
        <div className="bg-card p-4 rounded-sm border border-amber-500/30 bg-amber-500/5 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 mb-1">
            <span className="font-semibold">Alterations / Amendments</span>
            <RefreshCw size={14} />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-700 dark:text-amber-300">{alterEvents}</div>
          <div className="text-[11px] text-amber-700/80 dark:text-amber-300/80 mt-0.5">MCA Rule 3(1) edit log inspection</div>
        </div>

        {/* Cancellations & Deletions */}
        <div className="bg-card p-4 rounded-sm border border-rose-500/30 bg-rose-500/5 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-rose-600 dark:text-rose-400 mb-1">
            <span className="font-semibold">Cancelled & Deleted</span>
            <AlertCircle size={14} />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-700 dark:text-rose-300">{cancelEvents}</div>
          <div className="text-[11px] text-rose-700/80 dark:text-rose-300/80 mt-0.5">Preserved immutable snapshots</div>
        </div>

        {/* Distinct Operators */}
        <div className="bg-card p-4 rounded-sm border border-border shadow-2xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span className="font-medium">Active Operators</span>
            <User size={14} className="text-foreground" />
          </div>
          <div className="text-2xl font-bold font-mono text-foreground">{uniqueUsers}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Mobile OTP authenticated users</div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-card rounded-sm border border-border p-4 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by Voucher #, Party, User, Reason, Field change, or Hash..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-background border border-border rounded-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              onClick={() => {
                setSelectedAction('ALL');
                setSelectedVoucherType('ALL');
                setSelectedVoucherFilter(null);
                setSearchQuery('');
              }}
              className={`px-2.5 py-1 rounded-sm border text-xs font-medium transition-colors cursor-pointer ${
                selectedAction === 'ALL' && !selectedVoucherFilter
                  ? 'bg-primary text-primary-foreground font-semibold border-primary shadow-2xs'
                  : 'bg-card border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              All Events ({totalEvents})
            </button>

            <button
              onClick={() => {
                setSelectedAction('ALTER');
                setSelectedVoucherFilter(null);
              }}
              className={`px-2.5 py-1 rounded-sm border text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                selectedAction === 'ALTER'
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-700 dark:text-amber-300 font-bold'
                  : 'bg-card border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>Edits / Amendments</span>
              <span className="font-mono bg-muted px-1 py-0.2 rounded-xs text-[10px]">
                {alterEvents}
              </span>
            </button>

            <button
              onClick={() => {
                setSelectedAction('CANCEL');
                setSelectedVoucherFilter(null);
              }}
              className={`px-2.5 py-1 rounded-sm border text-xs font-medium transition-colors cursor-pointer ${
                selectedAction === 'CANCEL'
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-700 dark:text-rose-300 font-bold'
                  : 'bg-card border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              Cancellations
            </button>

            <button
              onClick={() => {
                setSelectedAction('DELETE');
                setSelectedVoucherFilter(null);
              }}
              className={`px-2.5 py-1 rounded-sm border text-xs font-medium transition-colors cursor-pointer ${
                selectedAction === 'DELETE'
                  ? 'bg-destructive/20 border-destructive/40 text-destructive font-bold'
                  : 'bg-card border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              Deletions
            </button>
          </div>
        </div>

        {/* Secondary Filter Row: Action, Voucher Type, Dates */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground font-medium">Action:</span>
            <select
              value={selectedAction}
              onChange={e => setSelectedAction(e.target.value)}
              className="px-2 py-1 bg-background border border-border rounded-sm text-foreground text-xs font-medium"
            >
              <option value="ALL">All Actions</option>
              <option value="ALTER">ALTER (Voucher Modified)</option>
              <option value="CREATE">CREATE (Voucher Recorded)</option>
              <option value="CANCEL">CANCEL (Voucher Voided)</option>
              <option value="DELETE">DELETE (Record Removed)</option>
              <option value="PRINT">PRINT (Voucher Issued)</option>
              <option value="EXPORT">EXPORT (Data Exported)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground font-medium">Type:</span>
            <select
              value={selectedVoucherType}
              onChange={e => setSelectedVoucherType(e.target.value)}
              className="px-2 py-1 bg-background border border-border rounded-sm text-foreground text-xs font-medium"
            >
              <option value="ALL">All Types</option>
              <option value="SALES">Sales Invoice</option>
              <option value="PURCHASE">Purchase Voucher</option>
              <option value="PAYMENT">Payment</option>
              <option value="RECEIPT">Receipt</option>
              <option value="CONTRA">Contra</option>
              <option value="JOURNAL">Journal</option>
              <option value="DELIVERY_CHALLAN">Delivery Challan</option>
              <option value="SALES_ORDER">Sales Order</option>
              <option value="QUOTATION">Quotation</option>
              <option value="COMPANY">Company Setup</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            <Calendar size={13} className="text-muted-foreground" />
            <span className="text-muted-foreground">Period:</span>
            <input
              type="date"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              className="px-2 py-1 bg-background border border-border rounded-sm text-foreground text-xs font-mono"
            />
            <span className="text-muted-foreground">to</span>
            <input
              type="date"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              className="px-2 py-1 bg-background border border-border rounded-sm text-foreground text-xs font-mono"
            />
          </div>
        </div>

        {/* Selected Voucher Drilldown Banner */}
        {selectedVoucherFilter && (
          <div className="bg-primary/10 border border-primary/20 rounded-sm p-2.5 px-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-primary">Drilling Down on Voucher:</span>
              <code className="bg-background border border-border text-foreground px-2 py-0.5 rounded-xs font-mono font-bold">
                {selectedVoucherFilter}
              </code>
              <span className="text-muted-foreground">Showing full lifecycle history from inception to amendment</span>
            </div>
            <button
              onClick={() => setSelectedVoucherFilter(null)}
              className="text-primary hover:underline font-semibold cursor-pointer"
            >
              Clear Drilldown
            </button>
          </div>
        )}
      </div>

      {/* Main Audit Trail List */}
      <div className="bg-card rounded-sm border border-border shadow-2xs overflow-hidden">
        <div className="p-3.5 px-4 border-b border-border bg-muted/40 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-xs text-foreground">
              Audit Log Register ({filteredLogs.length} events matching filter)
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Compliant with Section 128 of Companies Act, 2013 & Companies (Accounts) Rules, 2014
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => {
                const allWithDiffs: Record<string, boolean> = {};
                filteredLogs.forEach(l => {
                  if (l.fieldChanges && l.fieldChanges.length > 0) {
                    allWithDiffs[l.id] = true;
                  }
                });
                setExpandedLogIds(allWithDiffs);
              }}
              className="px-2 py-1 bg-background border border-border rounded-sm hover:bg-muted text-foreground transition-colors cursor-pointer text-xs"
            >
              Expand All Diffs
            </button>
            <button
              onClick={() => setExpandedLogIds({})}
              className="px-2 py-1 bg-background border border-border rounded-sm hover:bg-muted text-foreground transition-colors cursor-pointer text-xs"
            >
              Collapse All
            </button>
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground">
              <ShieldCheck size={20} />
            </div>
            <h3 className="font-semibold text-foreground text-xs">No Audit Trail Events Match Selected Filters</h3>
            <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
              Try adjusting your search query, action filter, or date range. Every voucher recorded, altered, or deleted in the system is automatically tracked here.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedAction('ALL');
                setSelectedVoucherType('ALL');
                setSelectedVoucherFilter(null);
              }}
              className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors cursor-pointer shadow-2xs"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredLogs.map(log => {
              const hasDiffs = log.fieldChanges && log.fieldChanges.length > 0;
              const isExpanded = expandedLogIds[log.id] || false;

              return (
                <div
                  key={log.id}
                  className={`p-3.5 transition-colors ${
                    log.action === 'ALTER'
                      ? 'bg-amber-500/5 hover:bg-amber-500/10'
                      : log.action === 'DELETE'
                      ? 'bg-destructive/5 hover:bg-destructive/10'
                      : 'hover:bg-muted/40'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                    {/* Left: Action, Timestamp, Voucher, Details */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Action Badge */}
                        <span
                          className={`px-2 py-0.5 rounded-xs text-[10px] font-mono border ${getActionBadge(
                            log.action
                          )}`}
                        >
                          {log.action}
                        </span>

                        {/* Voucher Type & Number */}
                        <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                          <span>{log.voucherType}</span>
                          <button
                            onClick={() => setSelectedVoucherFilter(log.voucherNumber)}
                            className="font-mono text-primary hover:underline bg-muted px-1.5 py-0.2 rounded-xs border border-border cursor-pointer text-xs"
                            title="Filter full timeline for this voucher"
                          >
                            {log.voucherNumber}
                          </button>
                        </span>

                        {/* IST Timestamp */}
                        <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                          <Clock size={11} className="text-muted-foreground" />
                          <span>{formatIstTime(log.timestamp)}</span>
                        </span>

                        {/* MCA Verified Stamp */}
                        {log.mcaCompliant !== false && (
                          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-1.5 py-0.2 rounded-xs border border-emerald-500/20">
                            <CheckCircle2 size={10} /> MCA Rule 3(1) Verified
                          </span>
                        )}
                      </div>

                      {/* Log Details / Reason */}
                      <p className="text-xs text-foreground leading-normal font-medium">
                        {log.details}
                      </p>

                      {log.reason && (
                        <p className="text-[11px] text-muted-foreground italic">
                          Stated Business Reason: &ldquo;{log.reason}&rdquo;
                        </p>
                      )}

                      {/* User & Station Metadata */}
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground pt-0.5">
                        <span className="flex items-center gap-1">
                          <User size={11} className="text-muted-foreground" />
                          <strong className="text-foreground">{log.user}</strong>
                          {log.userMobile && <span className="font-mono">({log.userMobile})</span>}
                          {log.userRole && (
                            <span className="bg-muted text-muted-foreground px-1.5 py-0.2 rounded-xs text-[10px] uppercase font-semibold">
                              {log.userRole}
                            </span>
                          )}
                        </span>

                        {log.ipAddress && (
                          <span className="hidden sm:inline text-muted-foreground">
                            Terminal: <span className="font-mono text-foreground">{log.ipAddress}</span>
                          </span>
                        )}

                        {log.hash && (
                          <span className="text-muted-foreground font-mono text-[10px] flex items-center gap-0.5">
                            <Hash size={10} />
                            <span>{log.hash}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: Field Changes Indicator & Toggle */}
                    <div className="shrink-0 flex items-center gap-2">
                      {hasDiffs && (
                        <button
                          onClick={() => toggleExpand(log.id)}
                          className={`px-2.5 py-1 text-xs font-medium rounded-sm border transition-all flex items-center gap-1.5 cursor-pointer ${
                            isExpanded
                              ? 'bg-primary text-primary-foreground border-primary shadow-2xs'
                              : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30'
                          }`}
                        >
                          <span>
                            {isExpanded ? 'Hide Changes' : `View ${log.fieldChanges!.length} Diffs`}
                          </span>
                          {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>
                      )}

                      {onNavigateTab && (
                        <button
                          onClick={() => onNavigateTab('vouchers')}
                          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-sm transition-colors cursor-pointer"
                          title="View Day Book"
                        >
                          <ArrowRight size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expandable Field-Level Diff Inspector */}
                  {hasDiffs && isExpanded && (
                    <div className="mt-3 pt-3 border-t border-border bg-muted/40 rounded-sm p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <FileCheck size={12} className="text-amber-500" />
                          Field-Level Edit Log (Before vs. After Values)
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          Timestamp: {formatIstTime(log.timestamp)}
                        </span>
                      </div>

                      <div className="overflow-x-auto border border-border rounded-sm bg-card shadow-2xs">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-muted/60 text-muted-foreground uppercase text-[10px] font-semibold border-b border-border">
                            <tr>
                              <th className="p-2 px-3 w-1/4">Field Modified</th>
                              <th className="p-2 px-3 w-3/8 text-destructive bg-destructive/10">
                                Original Value (Before Amendment)
                              </th>
                              <th className="p-2 px-3 w-3/8 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10">
                                Modified Value (After Amendment)
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border font-mono text-[11px]">
                            {log.fieldChanges!.map((fc, idx) => (
                              <tr key={idx} className="hover:bg-muted/30">
                                <td className="p-2 px-3 font-sans font-medium text-foreground">
                                  {fc.fieldLabel}
                                  <span className="block text-[10px] text-muted-foreground font-mono font-normal">
                                    {fc.field}
                                  </span>
                                </td>
                                <td className="p-2 px-3 text-destructive bg-destructive/5 break-words">
                                  <span className="line-through decoration-destructive/60 decoration-1">
                                    {fc.oldValue}
                                  </span>
                                </td>
                                <td className="p-2 px-3 text-emerald-700 dark:text-emerald-400 bg-emerald-500/5 font-semibold break-words flex items-center gap-1">
                                  <CheckCircle2 size={12} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                                  <span>{fc.newValue}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Summary */}
        <div className="p-3.5 px-4 bg-muted/40 border-t border-border text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Showing <strong className="text-foreground">{filteredLogs.length}</strong> of{' '}
            <strong className="text-foreground">{totalEvents}</strong> audit entries · Preserved in local tamper-proof store
          </div>
          <div className="font-mono text-muted-foreground text-[11px]">
            Companies (Accounts) Rules, 2014 · Rule 3(1) Compliant
          </div>
        </div>
      </div>
    </div>
  );
};
