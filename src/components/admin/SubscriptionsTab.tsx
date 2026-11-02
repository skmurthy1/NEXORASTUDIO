/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  TenantClient,
} from '../../types/admin';
import {
  runAutomatedTrialDeactivation,
  openWhatsAppReminderWindow,
  generateWhatsAppReminderMessage,
  saveTenantClients,
  getAutomationSettings,
} from '../../services/adminService';
import {
  CreditCard,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Send,
  Zap,
  RefreshCw,
  Search,
  Building2,
  Phone,
  ArrowUpRight,
  Sparkles,
  MessageSquare,
  X,
  Repeat,
} from 'lucide-react';

interface SubscriptionsTabProps {
  clients: TenantClient[];
  onRefresh: () => void;
}

export const SubscriptionsTab: React.FC<SubscriptionsTabProps> = ({
  clients,
  onRefresh,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'RECURRING' | 'TRIAL' | 'PENDING' | 'OVERDUE' | 'EXPIRED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [deactivationResult, setDeactivationResult] = useState<string | null>(null);

  // WhatsApp Preview Modal State
  const [selectedClientForWhatsApp, setSelectedClientForWhatsApp] = useState<TenantClient | null>(null);
  const [customMsg, setCustomMsg] = useState('');

  const today = new Date();

  // Metrics
  const activeCount = clients.filter(c => c.status === 'ACTIVE').length;
  const recurringCount = clients.filter(
    c => c.recurringMandate?.isRecurring && c.recurringMandate.status === 'ACTIVE'
  ).length;
  const trialCount = clients.filter(c => c.status === 'TRIAL').length;
  const pendingCount = clients.filter(c => c.paymentStatus === 'PENDING').length;
  const overdueCount = clients.filter(c => c.paymentStatus === 'OVERDUE' || c.status === 'EXPIRED').length;

  const totalMonthlyARR = clients
    .filter(c => c.status === 'ACTIVE')
    .reduce((sum, c) => sum + (c.billingCycle === 'ANNUAL' ? c.amount : c.amount * 12), 0);

  const recurringMRR = clients
    .filter(c => c.recurringMandate?.isRecurring && c.recurringMandate.status === 'ACTIVE')
    .reduce((sum, c) => sum + (c.billingCycle === 'ANNUAL' ? Math.round(c.amount / 12) : c.amount), 0);

  const handleRunAutoDeactivation = () => {
    setIsDeactivating(true);
    setTimeout(() => {
      const res = runAutomatedTrialDeactivation();
      setIsDeactivating(false);
      onRefresh();
      if (res.updatedCount > 0) {
        setDeactivationResult(
          `Deactivated ${res.updatedCount} expired trial/overdue accounts successfully.`
        );
      } else {
        setDeactivationResult('All active and trial accounts are up to date. No accounts need deactivation.');
      }
      setTimeout(() => setDeactivationResult(null), 4000);
    }, 600);
  };

  const handleOpenWhatsAppModal = (client: TenantClient) => {
    setSelectedClientForWhatsApp(client);
    setCustomMsg(generateWhatsAppReminderMessage(client));
  };

  const handleSendWhatsApp = () => {
    if (!selectedClientForWhatsApp) return;
    openWhatsAppReminderWindow(selectedClientForWhatsApp, customMsg);
    setSelectedClientForWhatsApp(null);
  };

  const handleMarkAsPaid = (client: TenantClient) => {
    const nextDue = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
    const updated = clients.map(c =>
      c.id === client.id
        ? {
            ...c,
            status: 'ACTIVE' as const,
            paymentStatus: 'PAID' as const,
            dueDate: nextDue,
          }
        : c
    );
    saveTenantClients(updated);
    onRefresh();
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch =
      client.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.mobile.includes(searchTerm);

    if (!matchesSearch) return false;

    if (filter === 'ACTIVE') return client.status === 'ACTIVE';
    if (filter === 'RECURRING') return client.recurringMandate?.isRecurring && client.recurringMandate.status === 'ACTIVE';
    if (filter === 'TRIAL') return client.status === 'TRIAL';
    if (filter === 'PENDING') return client.paymentStatus === 'PENDING';
    if (filter === 'OVERDUE') return client.paymentStatus === 'OVERDUE';
    if (filter === 'EXPIRED') return client.status === 'EXPIRED' || client.status === 'INACTIVE';
    return true;
  });

  return (
    <div className="space-y-4">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-card p-3 rounded-md border border-border shadow-2xs">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center justify-between">
            <span>Active Paid</span>
            <CheckCircle size={14} className="text-emerald-500" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-foreground">{activeCount}</span>
            <span className="text-[10px] text-muted-foreground">accounts</span>
          </div>
          <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            ARR: ₹{totalMonthlyARR.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="bg-card p-3 rounded-md border border-purple-500/30 bg-purple-500/5 shadow-2xs">
          <div className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 uppercase flex items-center justify-between">
            <span>⚡ AutoPay</span>
            <Repeat size={14} className="text-purple-500" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-purple-700 dark:text-purple-300">{recurringCount}</span>
            <span className="text-[10px] text-muted-foreground">mandates</span>
          </div>
          <div className="text-[11px] font-mono text-purple-600 dark:text-purple-400 mt-1 font-semibold">
            MRR: ₹{recurringMRR.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="bg-card p-3 rounded-md border border-border shadow-2xs">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center justify-between">
            <span>Free Trials</span>
            <Clock size={14} className="text-blue-500" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-foreground">{trialCount}</span>
            <span className="text-[10px] text-muted-foreground">in trial</span>
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            Auto-deactivates at expiry
          </div>
        </div>

        <div className="bg-card p-3 rounded-md border border-border shadow-2xs">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center justify-between">
            <span>Pending Renewals</span>
            <AlertTriangle size={14} className="text-amber-500" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-amber-600 dark:text-amber-400">
              {pendingCount}
            </span>
            <span className="text-[10px] text-muted-foreground">within 7 days</span>
          </div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
            WhatsApp reminder queued
          </div>
        </div>

        <div className="bg-card p-3 rounded-md border border-border shadow-2xs">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center justify-between">
            <span>Overdue / Expired</span>
            <X size={14} className="text-rose-500" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-rose-600 dark:text-rose-400">
              {overdueCount}
            </span>
            <span className="text-[10px] text-muted-foreground">accounts</span>
          </div>
          <div className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">
            Access locked in ERP
          </div>
        </div>
      </div>

      {/* Auto Deactivation Banner / Trigger */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-sidebar rounded-md border border-border">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Zap size={15} className="text-amber-500" />
            <h4 className="font-serif font-bold text-xs text-foreground">
              Automated Subscription & Trial Engine
            </h4>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Checks all client databases against their trial expiration date and due dates, locking expired portals automatically.
          </p>
        </div>

        <button
          onClick={handleRunAutoDeactivation}
          disabled={isDeactivating}
          className="px-3.5 py-1.5 bg-card hover:bg-accent text-foreground text-xs font-semibold rounded-sm border border-border shadow-2xs transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={13} className={isDeactivating ? 'animate-spin' : ''} />
          <span>{isDeactivating ? 'Scanning...' : 'Run Auto-Deactivate Check'}</span>
        </button>
      </div>

      {deactivationResult && (
        <div className="p-3 text-xs bg-primary/10 text-foreground border border-primary/20 rounded-sm animate-in fade-in">
          {deactivationResult}
        </div>
      )}

      {/* Control Strip */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-md border border-border">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-2.5 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search subscriptions by business or mobile..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-background border border-border rounded-sm text-foreground focus:outline-hidden"
          />
        </div>

        <div className="flex items-center p-0.5 bg-muted rounded-sm text-xs border border-border overflow-x-auto">
          {(['ALL', 'ACTIVE', 'RECURRING', 'TRIAL', 'PENDING', 'OVERDUE', 'EXPIRED'] as const).map(st => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-2.5 py-1 text-xs font-medium rounded-sm transition-colors cursor-pointer whitespace-nowrap ${
                filter === st
                  ? 'bg-card text-foreground font-semibold shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {st === 'RECURRING' ? '⚡ AutoPay' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-card border border-border rounded-md overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-sidebar border-b border-border text-muted-foreground font-semibold">
                <th className="py-2.5 px-3">Subscriber Business</th>
                <th className="py-2.5 px-3">Plan & Tier</th>
                <th className="py-2.5 px-3">Amount & Cycle</th>
                <th className="py-2.5 px-3">Due Date / Trial End</th>
                <th className="py-2.5 px-3">Days Remaining</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">WhatsApp Reminder</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredClients.map(client => {
                const dueDateObj = new Date(client.dueDate);
                const diffTime = dueDateObj.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                const isUpcoming = diffDays >= 0 && diffDays <= 7;
                const isOverdue = diffDays < 0;

                return (
                  <tr key={client.id} className="hover:bg-muted/40 transition-colors">
                    {/* Subscriber Business */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-foreground flex items-center gap-1.5">
                        <Building2 size={13} className="text-primary shrink-0" />
                        <span>{client.businessName}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground font-mono flex items-center gap-1 mt-0.5">
                        <Phone size={11} />
                        <span>+91 {client.mobile}</span>
                      </div>
                    </td>

                    {/* Plan */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-medium text-foreground">{client.planName}</span>
                        {client.recurringMandate?.isRecurring && (
                          <span
                            className={`inline-flex items-center gap-0.5 text-[10px] border px-1 rounded-sm font-semibold font-mono ${
                              client.recurringMandate.status === 'ACTIVE'
                                ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30'
                                : 'bg-muted text-muted-foreground border-border'
                            }`}
                          >
                            <Zap size={9} className="text-purple-500" />
                            AutoPay
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-muted-foreground uppercase">
                        {client.billingCycle}
                      </div>
                      {client.recurringMandate?.isRecurring && client.recurringMandate.nextDebitDate && (
                        <div className="text-[10px] text-purple-600 dark:text-purple-400 font-mono mt-0.5">
                          Next: {client.recurringMandate.nextDebitDate}
                        </div>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-3 font-mono">
                      <div className="font-bold text-foreground">
                        {client.amount === 0 ? 'Free Trial' : `₹${client.amount.toLocaleString('en-IN')}`}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {client.paymentStatus}
                      </div>
                    </td>

                    {/* Due Date */}
                    <td className="py-3 px-3">
                      <div className="font-mono font-medium text-foreground">{client.dueDate}</div>
                      {client.status === 'TRIAL' && client.trialEndDate && (
                        <div className="text-[10px] text-blue-600 dark:text-blue-400">
                          Trial ends: {client.trialEndDate}
                        </div>
                      )}
                    </td>

                    {/* Days Remaining */}
                    <td className="py-3 px-3">
                      {isOverdue ? (
                        <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">
                          Overdue by {Math.abs(diffDays)}d
                        </span>
                      ) : (
                        <span
                          className={`font-mono font-medium ${
                            isUpcoming
                              ? 'text-amber-600 dark:text-amber-400 font-bold'
                              : 'text-foreground'
                          }`}
                        >
                          {diffDays} days left
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-sm text-[10px] font-bold border ${
                          client.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                            : client.status === 'TRIAL'
                            ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20'
                            : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20'
                        }`}
                      >
                        {client.status}
                      </span>
                    </td>

                    {/* WhatsApp Action */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {client.paymentStatus !== 'PAID' && (
                          <button
                            onClick={() => handleMarkAsPaid(client)}
                            className="px-2 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20 rounded-sm cursor-pointer transition-colors"
                            title="Mark payment as received and extend 30 days"
                          >
                            Mark Paid
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenWhatsAppModal(client)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-sm text-[11px] shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                          title="Open WhatsApp reminder draft with UPI payment link"
                        >
                          <Send size={11} />
                          <span>WhatsApp Notice</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* WhatsApp Message Preview Modal */}
      {selectedClientForWhatsApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none">
          <div className="bg-card text-card-foreground rounded-md border border-border shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <MessageSquare size={18} className="text-emerald-600" />
                <h3 className="font-serif font-bold text-base text-foreground">
                  Dispatch WhatsApp Renewal Notice
                </h3>
              </div>
              <button
                onClick={() => setSelectedClientForWhatsApp(null)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-sm hover:bg-muted cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-muted rounded-sm border border-border">
                <div className="text-muted-foreground font-semibold">Recipient Client:</div>
                <div className="text-foreground font-bold text-sm mt-0.5">
                  {selectedClientForWhatsApp.businessName} ({selectedClientForWhatsApp.name})
                </div>
                <div className="font-mono text-muted-foreground mt-0.5">
                  WhatsApp: +91 {selectedClientForWhatsApp.mobile} · Plan: {selectedClientForWhatsApp.planName}
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">
                  Message Text (Customizable)
                </label>
                <textarea
                  rows={6}
                  value={customMsg}
                  onChange={e => setCustomMsg(e.target.value)}
                  className="w-full px-3 py-2 font-mono text-xs bg-background border border-border rounded-sm text-foreground focus:outline-hidden"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setSelectedClientForWhatsApp(null)}
                  className="flex-1 py-2 border border-border hover:bg-muted rounded-sm font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-sm shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send size={13} />
                  <span>Send via WhatsApp API</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
