/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SupportTicket, TicketCategory, TicketPriority, TicketMessage } from '../types/support';

const SUPPORT_TICKETS_KEY = 'nexora_client_support_tickets';

const INITIAL_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: 'TKT-2026-0842',
    subject: 'GSTR-2B ITC Matching discrepancy for October purchases',
    category: 'GST_COMPLIANCE',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    description: 'Two supplier purchase vouchers from Maharashtra are showing as unmatched in GSTR-2B reconciliation report despite valid invoice numbers.',
    createdAt: '2026-10-29 14:30',
    updatedAt: '2026-10-30 11:15',
    companyName: 'Bharat Electronics & Systems Pvt Ltd',
    gstin: '27AAACB2212M1Z1',
    clientMobile: '9820045678',
    clientEmail: 'accounts@bharat.in',
    assignedTo: 'Rajesh Sharma (GST Compliance Specialist)',
    messages: [
      {
        id: 'msg-1',
        sender: 'CLIENT',
        senderName: 'S. K. Murthy (Accounts Head)',
        text: 'Uploaded 2 inward purchase invoices from Sunstar Infotech. In the 2B reconciliation tool, tax mismatch of ₹14,200 is flagged.',
        timestamp: '2026-10-29 14:30',
      },
      {
        id: 'msg-2',
        sender: 'SUPPORT_AGENT',
        senderName: 'Rajesh Sharma (GST Specialist)',
        text: 'Hello Mr. Murthy, we verified your supplier GSTIN. Sunstar Infotech filed their GSTR-1 as QRMP quarterly filer. Their invoice data will reflect in your GSTR-2B on the 14th of next month. Your purchase ledger is correct.',
        timestamp: '2026-10-30 11:15',
      },
    ],
  },
  {
    id: 'TKT-2026-0719',
    subject: 'Annual Pro Plan Tax Invoice with SAC 998313 for ITC claim',
    category: 'BILLING',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    description: 'Need formal signed tax invoice for ₹11,990 annual subscription renewal to provide to auditor for CGST/SGST ITC claim.',
    createdAt: '2026-10-20 09:45',
    updatedAt: '2026-10-20 10:30',
    companyName: 'Bharat Electronics & Systems Pvt Ltd',
    gstin: '27AAACB2212M1Z1',
    clientMobile: '9820045678',
    clientEmail: 'accounts@bharat.in',
    assignedTo: 'Billing Desk (Nexora)',
    resolutionNotes: 'Tax Invoice NEXORA-INV-2026-00481 with recipient GSTIN 27AAACB2212M1Z1 and SAC 998313 generated and available in My Subscription tab.',
    messages: [
      {
        id: 'msg-101',
        sender: 'CLIENT',
        senderName: 'S. K. Murthy',
        text: 'Could you share the tax invoice with SAC code 998313 and GSTIN for our FY 2026 audit?',
        timestamp: '2026-10-20 09:45',
      },
      {
        id: 'msg-102',
        sender: 'SUPPORT_AGENT',
        senderName: 'Billing Support',
        text: 'Tax Invoice NEXORA-INV-2026-00481 has been issued with 100% ITC credit eligibility. You can also download it directly under My Subscription -> Past Invoices.',
        timestamp: '2026-10-20 10:30',
      },
    ],
  },
];

export function getClientSupportTickets(): SupportTicket[] {
  try {
    const raw = localStorage.getItem(SUPPORT_TICKETS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to load support tickets', err);
  }
  return INITIAL_SUPPORT_TICKETS;
}

export function saveClientSupportTickets(tickets: SupportTicket[]) {
  try {
    localStorage.setItem(SUPPORT_TICKETS_KEY, JSON.stringify(tickets));
  } catch (err) {
    console.error('Failed to save support tickets', err);
  }
}

export function createSupportTicket(params: {
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  description: string;
  companyName: string;
  gstin?: string;
  clientMobile: string;
  clientEmail: string;
}): SupportTicket {
  const existing = getClientSupportTickets();
  const ticketId = `TKT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

  const newTicket: SupportTicket = {
    id: ticketId,
    subject: params.subject.trim(),
    category: params.category,
    priority: params.priority,
    status: 'OPEN',
    description: params.description.trim(),
    createdAt: now,
    updatedAt: now,
    companyName: params.companyName,
    gstin: params.gstin,
    clientMobile: params.clientMobile,
    clientEmail: params.clientEmail,
    assignedTo:
      params.category === 'GST_COMPLIANCE'
        ? 'GST Compliance Specialist (Assigned)'
        : params.category === 'BILLING'
        ? 'Billing & Subscriptions Helpdesk'
        : params.category === 'MIGRATION'
        ? 'Data & Tally Migration Engineer'
        : 'Technical Engineering Lead',
    messages: [
      {
        id: `msg-${Date.now()}`,
        sender: 'CLIENT',
        senderName: params.companyName,
        text: params.description.trim(),
        timestamp: now,
      },
      {
        id: `msg-${Date.now() + 1}`,
        sender: 'SUPPORT_AGENT',
        senderName: 'Nexora AI Helpdesk & Dispatcher',
        text: `Thank you for contacting Nexora Support. Ticket ${ticketId} has been acknowledged. Our ${
          params.category === 'GST_COMPLIANCE'
            ? 'GST Chartered Accountant desk'
            : params.category === 'BILLING'
            ? 'Billing team'
            : 'technical engineering team'
        } will review your request and reply shortly. Target SLA: < 2 hours.`,
        timestamp: now,
      },
    ],
  };

  const updated = [newTicket, ...existing];
  saveClientSupportTickets(updated);
  return newTicket;
}

export function addMessageToTicket(
  ticketId: string,
  text: string,
  sender: 'CLIENT' | 'SUPPORT_AGENT',
  senderName: string
): SupportTicket | null {
  const existing = getClientSupportTickets();
  const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
  let updatedTicket: SupportTicket | null = null;

  const updated = existing.map(t => {
    if (t.id === ticketId) {
      const newMsg: TicketMessage = {
        id: `msg-${Date.now()}`,
        sender,
        senderName,
        text: text.trim(),
        timestamp: now,
      };
      updatedTicket = {
        ...t,
        updatedAt: now,
        status: t.status === 'RESOLVED' ? 'IN_PROGRESS' : t.status,
        messages: [...t.messages, newMsg],
      };
      return updatedTicket;
    }
    return t;
  });

  if (updatedTicket) {
    saveClientSupportTickets(updated);
  }
  return updatedTicket;
}

export function updateTicketStatus(ticketId: string, newStatus: SupportTicket['status']): boolean {
  const existing = getClientSupportTickets();
  const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
  let changed = false;

  const updated = existing.map(t => {
    if (t.id === ticketId) {
      changed = true;
      return {
        ...t,
        status: newStatus,
        updatedAt: now,
        resolutionNotes:
          newStatus === 'RESOLVED'
            ? t.resolutionNotes || 'Marked as resolved by user.'
            : t.resolutionNotes,
      };
    }
    return t;
  });

  if (changed) {
    saveClientSupportTickets(updated);
  }
  return changed;
}
