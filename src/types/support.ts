/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TicketCategory = 'BILLING' | 'GST_COMPLIANCE' | 'TECHNICAL' | 'MIGRATION';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface TicketMessage {
  id: string;
  sender: 'CLIENT' | 'SUPPORT_AGENT';
  senderName: string;
  text: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string; // e.g. TKT-2026-1048
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  description: string;
  createdAt: string;
  updatedAt: string;
  companyName: string;
  gstin?: string;
  clientMobile: string;
  clientEmail: string;
  assignedTo?: string;
  resolutionNotes?: string;
  messages: TicketMessage[];
}
