/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  LifeBuoy,
  X,
  Plus,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  FileCheck,
  Cpu,
  Database,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  MessageSquare,
  Search,
  User,
  Check,
  RotateCcw,
  Sparkles,
  Phone,
  Mail,
  ChevronRight,
  Building2,
} from 'lucide-react';
import {
  SupportTicket,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from '../../types/support';
import {
  getClientSupportTickets,
  createSupportTicket,
  addMessageToTicket,
  updateTicketStatus,
} from '../../services/supportService';
import { useErp } from '../../context/ErpContext';

interface SupportTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: TicketCategory;
  defaultSubject?: string;
}

export const SupportTicketModal: React.FC<SupportTicketModalProps> = ({
  isOpen,
  onClose,
  defaultCategory = 'GST_COMPLIANCE',
  defaultSubject = '',
}) => {
  const { activeCompany, auth } = useErp();

  const [activeTab, setActiveTab] = useState<'NEW' | 'TRACKER'>('NEW');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // New Ticket Form State
  const [category, setCategory] = useState<TicketCategory>(defaultCategory);
  const [priority, setPriority] = useState<TicketPriority>('MEDIUM');
  const [subject, setSubject] = useState(defaultSubject);
  const [description, setDescription] = useState('');
  const [submittedTicket, setSubmittedTicket] = useState<SupportTicket | null>(null);

  // Tracker Filter & Search
  const [statusFilter, setStatusFilter] = useState<'ALL' | TicketStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');

  // Load tickets on mount & open
  useEffect(() => {
    if (isOpen) {
      const data = getClientSupportTickets();
      setTickets(data);
      if (data.length > 0 && !selectedTicketId) {
        setSelectedTicketId(data[0].id);
      }
      if (defaultCategory) setCategory(defaultCategory);
      if (defaultSubject) setSubject(defaultSubject);
    }
  }, [isOpen, defaultCategory, defaultSubject]);

  if (!isOpen) return null;

  const refreshTickets = () => {
    const data = getClientSupportTickets();
    setTickets(data);
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    const newTicket = createSupportTicket({
      subject,
      category,
      priority,
      description,
      companyName: activeCompany.name || 'Bharat Electronics',
      gstin: activeCompany.gstin,
      clientMobile: auth.mobile || '9820045678',
      clientEmail: auth.email || activeCompany.email || 'accounts@bharat.in',
    });

    refreshTickets();
    setSubmittedTicket(newTicket);
    setSelectedTicketId(newTicket.id);
    setSubject('');
    setDescription('');
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketId || !replyText.trim()) return;

    addMessageToTicket(
      selectedTicketId,
      replyText,
      'CLIENT',
      auth.name || activeCompany.name
    );
    setReplyText('');
    refreshTickets();
  };

  const handleStatusChange = (ticketId: string, status: TicketStatus) => {
    updateTicketStatus(ticketId, status);
    refreshTickets();
  };

  const openCount = tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;

  const filteredTickets = tickets.filter(t => {
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.id.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const selectedTicket = tickets.find(t => t.id === selectedTicketId) || tickets[0];

  const quickSuggestions: { [key in TicketCategory]: string[] } = {
    GST_COMPLIANCE: [
      'GSTR-2B Input Tax Credit reconciliation difference',
      'e-Way bill generation failure for interstate supply',
      'IRN e-Invoice QR code generation query',
      'Table 4(A)(5) ITC classification assistance',
    ],
    BILLING: [
      'Need tax invoice copy with SAC code 998313 for auditor',
      'Recurring AutoPay e-Mandate cancellation request',
      'Billing cycle upgrade from Monthly to Annual (Save 20%)',
      'GSTIN amendment on subscription tax invoice',
    ],
    TECHNICAL: [
      'Trial Balance debit/credit mismatch investigation',
      'Voucher print layout alignment adjustment',
      'Stock valuation FIFO report query',
      'Tally shortcut keys response optimization',
    ],
    MIGRATION: [
      'Assistance restoring Tally Prime XML backup',
      'Busy Accounting company masters import help',
      'JSON full system restore verification',
      'Historical voucher migration checksum test',
    ],
  };

  return (
    <div className="fixed inset-0 z-80 bg-background/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-card text-card-foreground w-full max-w-4xl rounded-sm shadow-2xl border border-border overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="bg-muted/80 px-4 sm:px-6 py-3 border-b border-border flex items-center justify-between gap-3 select-none">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-sm bg-primary/10 text-primary flex items-center justify-center font-bold">
              <LifeBuoy size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-bold text-base text-foreground tracking-tight">
                  Nexora Client Support &amp; Helpdesk
                </h2>
                <span className="text-[10px] font-mono bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded-xs font-semibold">
                  SLA: &lt; 2h
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Dedicated assistance for Indian GST compliance, subscription billing, and ERP operations
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1.5 rounded-sm hover:bg-muted transition-colors cursor-pointer"
            title="Close Support Modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation Strip */}
        <div className="px-6 py-2 bg-sidebar border-b border-border flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTab('NEW');
                setSubmittedTicket(null);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-sm transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'NEW'
                  ? 'bg-primary text-primary-foreground shadow-2xs font-bold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Plus size={13} />
              <span>Raise New Ticket</span>
            </button>

            <button
              onClick={() => setActiveTab('TRACKER')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-sm transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'TRACKER'
                  ? 'bg-primary text-primary-foreground shadow-2xs font-bold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Clock size={13} />
              <span>Track Tickets</span>
              {openCount > 0 && (
                <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-bold font-mono">
                  {openCount} active
                </span>
              )}
            </button>
          </div>

          <div className="text-[11px] text-muted-foreground font-mono hidden sm:flex items-center gap-2">
            <span>Client: {activeCompany.name}</span>
            <span>·</span>
            <span>GSTIN: {activeCompany.gstin || '27AAACB2212M1Z1'}</span>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeTab === 'NEW' ? (
            submittedTicket ? (
              /* Success Submission Screen */
              <div className="py-8 px-4 text-center max-w-lg mx-auto space-y-4 animate-in fade-in zoom-in-95">
                <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                  <CheckCircle2 size={36} />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-sm border border-primary/20">
                    Ticket Acknowledged
                  </span>
                  <h3 className="font-serif font-bold text-2xl text-foreground mt-2">
                    Query Registered: {submittedTicket.id}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your request has been routed to the <strong>{submittedTicket.assignedTo}</strong>. You will receive real-time updates and SMS/email notifications.
                  </p>
                </div>

                <div className="p-4 bg-muted/40 rounded-sm border border-border text-xs text-left space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subject:</span>
                    <strong className="text-foreground">{submittedTicket.subject}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category:</span>
                    <span className="font-mono">{submittedTicket.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="text-amber-600 dark:text-amber-400 font-bold font-mono">OPEN</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Target SLA:</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">Under 2 hours</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      setSubmittedTicket(null);
                    }}
                    className="flex-1 py-2 px-3 text-xs font-semibold bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border rounded-sm transition-colors cursor-pointer"
                  >
                    Raise Another Query
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('TRACKER');
                      setSelectedTicketId(submittedTicket.id);
                    }}
                    className="flex-1 py-2 px-3 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-sm transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <span>View in Status Tracker</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            ) : (
              /* Raise New Ticket Form */
              <form onSubmit={handleCreateTicket} className="space-y-5 max-w-3xl mx-auto">
                {/* Category Selection */}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-2">
                    1. Select Query Category:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      {
                        id: 'GST_COMPLIANCE' as TicketCategory,
                        label: 'GST Compliance',
                        desc: 'GSTR-1, 3B, 2B Recon, e-Way & e-Invoice',
                        icon: <FileCheck size={16} />,
                      },
                      {
                        id: 'BILLING' as TicketCategory,
                        label: 'Billing & Plans',
                        desc: 'Invoices, e-Mandate, Razorpay & AutoPay',
                        icon: <CreditCard size={16} />,
                      },
                      {
                        id: 'TECHNICAL' as TicketCategory,
                        label: 'Technical Issues',
                        desc: 'Vouchers, reports, drill-down & calculations',
                        icon: <Cpu size={16} />,
                      },
                      {
                        id: 'MIGRATION' as TicketCategory,
                        label: 'Data Migration',
                        desc: 'Tally Prime XML & Busy restore help',
                        icon: <Database size={16} />,
                      },
                    ].map(cat => (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setCategory(cat.id)}
                        className={`p-3 rounded-sm border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          category === cat.id
                            ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/40 shadow-xs'
                            : 'border-border bg-card hover:bg-muted/50 text-foreground'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={category === cat.id ? 'text-primary' : 'text-muted-foreground'}>
                            {cat.icon}
                          </span>
                          {category === cat.id && (
                            <Check size={14} className="text-primary font-bold" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-foreground">{cat.label}</div>
                          <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{cat.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Priority Selection */}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    2. Urgency &amp; Impact:
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as TicketPriority[]).map(p => (
                      <button
                        type="button"
                        key={p}
                        onClick={() => setPriority(p)}
                        className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-sm border transition-colors cursor-pointer ${
                          priority === p
                            ? p === 'CRITICAL'
                              ? 'bg-rose-600 text-white border-rose-600 font-bold'
                              : p === 'HIGH'
                              ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold'
                              : 'bg-primary text-primary-foreground border-primary font-bold'
                            : 'bg-card text-muted-foreground border-border hover:text-foreground'
                        }`}
                      >
                        {p} Priority {p === 'CRITICAL' ? '(Blocker)' : ''}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subject & Quick Suggestions */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-foreground">
                    3. Subject / Query Summary:
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="Briefly state your question or issue..."
                    className="w-full px-3 py-2 text-xs bg-background border border-border rounded-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary font-medium"
                  />

                  {/* Quick Suggestions Chips */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-mono font-medium block">
                      Common Topics:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {quickSuggestions[category].map((sug, idx) => (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => setSubject(sug)}
                          className="text-[11px] px-2 py-0.5 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-xs transition-colors cursor-pointer text-left"
                        >
                          + {sug}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Description Textarea */}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    4. Detailed Explanation / Voucher or Error Details:
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Provide specific details such as voucher numbers, tax periods (e.g. October 2026), GSTINs involved, or error messages..."
                    className="w-full px-3 py-2 text-xs bg-background border border-border rounded-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary leading-relaxed"
                  />
                </div>

                {/* Sender Identity Verification Summary */}
                <div className="bg-muted/40 p-3.5 rounded-sm border border-border text-xs flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Building2 size={16} className="text-primary" />
                    <div>
                      <span className="font-semibold text-foreground">{activeCompany.name}</span>
                      <div className="text-[11px] text-muted-foreground font-mono">
                        GSTIN: {activeCompany.gstin || '27AAACB2212M1Z1'} · +91 {auth.mobile || '9820045678'}
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <ShieldCheck size={14} /> Verified Enterprise Session
                  </span>
                </div>

                {/* Submit Action */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold text-secondary-foreground bg-secondary hover:bg-secondary/80 border border-border rounded-sm transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-sm transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    <Send size={13} />
                    <span>Submit Ticket to Helpdesk</span>
                  </button>
                </div>
              </form>
            )
          ) : (
            /* Tab 2: Track Tickets & Status Tracker */
            <div className="space-y-4">
              {/* Tracker Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-muted/40 p-3 rounded-sm border border-border">
                <div className="relative flex-1 max-w-xs">
                  <Search size={14} className="absolute left-3 top-2.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search tickets by ID or keyword..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-background border border-border rounded-sm text-foreground focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center gap-1 overflow-x-auto text-xs">
                  {(['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const).map(st => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-sm transition-colors cursor-pointer whitespace-nowrap ${
                        statusFilter === st
                          ? 'bg-card text-foreground font-semibold shadow-2xs border border-border'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tickets Tracker Split View */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Tickets Master List */}
                <div className="md:col-span-5 space-y-2 max-h-[58vh] overflow-y-auto pr-1">
                  {filteredTickets.length > 0 ? (
                    filteredTickets.map(ticket => {
                      const isSelected = ticket.id === selectedTicketId;
                      return (
                        <div
                          key={ticket.id}
                          onClick={() => setSelectedTicketId(ticket.id)}
                          className={`p-3 rounded-sm border transition-all cursor-pointer text-xs space-y-1.5 ${
                            isSelected
                              ? 'border-primary bg-primary/5 ring-1 ring-primary/40 shadow-xs'
                              : 'border-border bg-card hover:bg-muted/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-foreground">
                              {ticket.id}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded-xs uppercase font-mono ${
                                ticket.status === 'OPEN'
                                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                                  : ticket.status === 'IN_PROGRESS'
                                  ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30'
                                  : ticket.status === 'RESOLVED'
                                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                                  : 'bg-muted text-muted-foreground border border-border'
                              }`}
                            >
                              {ticket.status}
                            </span>
                          </div>

                          <div className="font-semibold text-foreground line-clamp-1">
                            {ticket.subject}
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                            <span className="font-mono">{ticket.category}</span>
                            <span className="font-mono">{ticket.createdAt}</span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-12 text-center text-muted-foreground text-xs p-4 bg-muted/20 border border-dashed border-border rounded-sm">
                      No support tickets found matching the selected filter.
                    </div>
                  )}
                </div>

                {/* Ticket Detail & Conversation View */}
                <div className="md:col-span-7 rounded-sm border border-border bg-card p-4 sm:p-5 flex flex-col justify-between max-h-[58vh] overflow-y-auto">
                  {selectedTicket ? (
                    <div className="space-y-4">
                      {/* Ticket Header */}
                      <div className="border-b border-border pb-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-primary text-sm">
                              {selectedTicket.id}
                            </span>
                            <span className="text-[10px] font-mono uppercase bg-muted px-1.5 py-0.2 rounded-xs border border-border text-muted-foreground">
                              {selectedTicket.category}
                            </span>
                            <span className="text-[10px] font-mono uppercase font-bold text-foreground">
                              {selectedTicket.priority} Priority
                            </span>
                          </div>

                          {/* Quick Status Control */}
                          <div className="flex items-center gap-1.5">
                            {selectedTicket.status !== 'RESOLVED' && (
                              <button
                                onClick={() => handleStatusChange(selectedTicket.id, 'RESOLVED')}
                                className="px-2 py-0.5 text-[11px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xs transition-colors cursor-pointer"
                                title="Close query as solved"
                              >
                                Mark Resolved
                              </button>
                            )}
                            {selectedTicket.status === 'RESOLVED' && (
                              <button
                                onClick={() => handleStatusChange(selectedTicket.id, 'IN_PROGRESS')}
                                className="px-2 py-0.5 text-[11px] font-medium bg-secondary text-secondary-foreground hover:bg-muted border border-border rounded-xs transition-colors cursor-pointer"
                                title="Reopen ticket"
                              >
                                Reopen
                              </button>
                            )}
                          </div>
                        </div>

                        <h3 className="font-bold text-foreground text-sm">
                          {selectedTicket.subject}
                        </h3>

                        <div className="text-[11px] text-muted-foreground flex items-center justify-between">
                          <span>Assigned: <strong>{selectedTicket.assignedTo || 'Helpdesk Lead'}</strong></span>
                          <span>Opened: {selectedTicket.createdAt}</span>
                        </div>
                      </div>

                      {/* Visual Status Lifecycle Bar */}
                      <div className="bg-muted/40 p-2.5 rounded-sm border border-border">
                        <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-mono">
                          <div
                            className={`p-1 rounded-xs font-semibold ${
                              ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(selectedTicket.status)
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            1. Raised
                          </div>
                          <div
                            className={`p-1 rounded-xs font-semibold ${
                              ['IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(selectedTicket.status)
                                ? 'bg-blue-600 text-white'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            2. Reviewing
                          </div>
                          <div
                            className={`p-1 rounded-xs font-semibold ${
                              ['RESOLVED', 'CLOSED'].includes(selectedTicket.status)
                                ? 'bg-emerald-600 text-white'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            3. Solved
                          </div>
                          <div
                            className={`p-1 rounded-xs font-semibold ${
                              selectedTicket.status === 'CLOSED'
                                ? 'bg-slate-700 text-white'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            4. Closed
                          </div>
                        </div>
                      </div>

                      {/* Conversation Thread */}
                      <div className="space-y-3 pt-1">
                        <div className="text-[11px] font-mono font-semibold uppercase text-muted-foreground">
                          Communication Log:
                        </div>

                        <div className="space-y-2.5">
                          {selectedTicket.messages.map(msg => (
                            <div
                              key={msg.id}
                              className={`p-3 rounded-sm text-xs space-y-1 ${
                                msg.sender === 'CLIENT'
                                  ? 'bg-primary/10 border border-primary/20 ml-4'
                                  : 'bg-muted/60 border border-border mr-4'
                              }`}
                            >
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="font-bold text-foreground flex items-center gap-1">
                                  {msg.sender === 'CLIENT' ? (
                                    <User size={11} className="text-primary" />
                                  ) : (
                                    <ShieldCheck size={11} className="text-emerald-500" />
                                  )}
                                  {msg.senderName}
                                </span>
                                <span className="text-muted-foreground font-mono">{msg.timestamp}</span>
                              </div>
                              <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                                {msg.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Reply Form */}
                      <form onSubmit={handleSendReply} className="pt-2 border-t border-border flex gap-2">
                        <input
                          type="text"
                          required
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          placeholder="Type follow-up message or extra details..."
                          className="flex-1 px-3 py-1.5 text-xs bg-background border border-border rounded-sm text-foreground focus:outline-hidden"
                        />
                        <button
                          type="submit"
                          className="px-3 py-1.5 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-sm transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                        >
                          <Send size={12} />
                          <span>Reply</span>
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground text-xs">
                      Select a ticket from the list to track its real-time progress and messages.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Strip */}
        <div className="bg-muted/40 px-6 py-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground select-none">
          <div className="flex items-center gap-2">
            <ShieldCheck size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              Direct escalation to Chartered Accountant GST review desk &amp; Senior ERP architects.
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 text-xs font-semibold bg-card hover:bg-muted border border-border rounded-sm transition-colors cursor-pointer text-foreground shadow-2xs"
          >
            Close Helpdesk
          </button>
        </div>
      </div>
    </div>
  );
};
