/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TenantClient, SubscriptionPlanConfig, AutomationSettings } from '../types/admin';

const STORAGE_KEY_CLIENTS = 'nexora_admin_clients';
const STORAGE_KEY_PLANS = 'nexora_admin_plans';
const STORAGE_KEY_AUTOMATION = 'nexora_admin_automation';
const STORAGE_KEY_ADMIN_PIN = 'nexora_admin_master_pin';

export const DEFAULT_MASTER_PIN = '9999';

export const INITIAL_PLANS: SubscriptionPlanConfig[] = [
  {
    id: 'starter',
    name: 'Starter Solo',
    description: 'Perfect for small retailers, traders, and freelancers needing fast GST billing.',
    monthlyPrice: 499,
    annualPrice: 4999,
    features: [
      'Single GSTIN / 1 Company Account',
      'Unlimited B2B & B2C Invoicing',
      'Tally Speed Shortcuts (F1 - F9)',
      'Basic GSTR-1 & 3B Summary',
      'WhatsApp Invoicing with UPI QR',
      'Standard Email Support',
    ],
  },
  {
    id: 'professional',
    name: 'Business Pro',
    description: 'Our most popular plan for MSMEs, manufacturers, and multi-godown distributors.',
    monthlyPrice: 999,
    annualPrice: 9999,
    isPopular: true,
    features: [
      'Up to 3 Companies / GSTINs',
      'Multi-Godown Inventory & Batches',
      'Real-time GSP E-Invoice & E-Way Bill',
      'GSTR-2B Auto-Reconciliation',
      'MCA Rule 3(1) Compliant Audit Trail',
      'Automated WhatsApp Ledger Reminders',
      'Tally Prime & Busy XML Migration',
      'Priority Phone & Desk Support',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise Cloud',
    description: 'Designed for scaling operations, multi-branch corporations, and large trade houses.',
    monthlyPrice: 1999,
    annualPrice: 19999,
    features: [
      'Unlimited Companies & Godowns',
      'Multi-User Roles & Permissions (RBAC)',
      'Direct GSP Real-Time Portal Sync',
      'Automated Daily Cloud Backups',
      'Dedicated Account Manager',
      'Custom ERP API Integrations',
      '24/7 SLA Hotline',
    ],
  },
  {
    id: 'ca_firm',
    name: 'CA & Tax Consultant',
    description: 'Special multi-client workspace for Chartered Accountants and Tax Practitioners.',
    monthlyPrice: 2499,
    annualPrice: 24999,
    features: [
      'Manage up to 50 Client Databases',
      'Staff Assignment & Client Audit Lock',
      '1-Click Bulk GSTR-1/3B JSON Filing',
      'Client WhatsApp Due Date Reminders',
      'Statutory Books Freeze Control',
      'White-label Client Portal Access',
    ],
  },
];

export const INITIAL_AUTOMATION: AutomationSettings = {
  autoDeactivateExpiredTrial: true,
  defaultTrialDays: 14,
  reminderDaysBeforeDue: [7, 3, 1],
  whatsappTemplate: `Hello {client_name},\n\nYour Nexora Books subscription for {business_name} ({plan_name}) is approaching its renewal due date on *{due_date}*.\n\nPending Renewal Amount: *₹{amount}*\n\nPlease make payment via UPI link: {payment_link} to avoid service disruption.\n\nThank you,\nNexora Books Finance Team`,
  sendAutomaticReminders: true,
  lastAutoDeactivationRun: new Date().toISOString(),
};

export const INITIAL_CLIENTS: TenantClient[] = [
  {
    id: 'cli-001',
    name: 'S. K. Murthy',
    businessName: 'Bharat Electronics & Appliances',
    mobile: '9820045678',
    email: 'contact@bharatelectronics.in',
    gstin: '27AABCB2212M1Z5',
    portalPin: '1234',
    role: 'OWNER',
    status: 'ACTIVE',
    planId: 'professional',
    planName: 'Business Pro',
    amount: 9999,
    billingCycle: 'ANNUAL',
    dueDate: new Date(Date.now() + 25 * 86400000).toISOString().split('T')[0],
    paymentStatus: 'PAID',
    lastLogin: 'Today, 11:20 AM',
    createdAt: '2026-01-15',
    notes: 'Primary active flagship company with multi-godown stock.',
    dbStats: {
      ledgersCount: 42,
      vouchersCount: 156,
      stockCount: 88,
      sizeKb: 340,
    },
  },
  {
    id: 'cli-002',
    name: 'Rajesh Agrawal',
    businessName: 'Agrawal Textiles & Garments',
    mobile: '9833112244',
    email: 'rajesh@agrawaltextiles.com',
    gstin: '24AAACT9988K1ZQ',
    portalPin: '4321',
    role: 'OWNER',
    status: 'ACTIVE',
    planId: 'professional',
    planName: 'Business Pro',
    amount: 999,
    billingCycle: 'MONTHLY',
    dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0], // 2 days away!
    paymentStatus: 'PENDING',
    lastLogin: 'Yesterday, 04:45 PM',
    createdAt: '2026-03-01',
    notes: 'Renewal due in 2 days. WhatsApp reminder pending.',
    dbStats: {
      ledgersCount: 28,
      vouchersCount: 92,
      stockCount: 45,
      sizeKb: 210,
    },
  },
  {
    id: 'cli-003',
    name: 'Pooja Sharma',
    businessName: 'Surya Steel & Engineering Works',
    mobile: '9711223344',
    email: 'pooja@suryasteel.co.in',
    gstin: '07AAGCS5544L1ZP',
    portalPin: '8899',
    role: 'OWNER',
    status: 'TRIAL',
    planId: 'professional',
    planName: 'Business Pro (Trial)',
    amount: 0,
    billingCycle: 'MONTHLY',
    trialStartDate: new Date(Date.now() - 11 * 86400000).toISOString().split('T')[0],
    trialEndDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0], // 3 days remaining in trial
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    paymentStatus: 'PENDING',
    lastLogin: 'Today, 09:15 AM',
    createdAt: new Date(Date.now() - 11 * 86400000).toISOString().split('T')[0],
    notes: 'Trial expiring in 3 days. Conversion reminder required.',
    dbStats: {
      ledgersCount: 16,
      vouchersCount: 38,
      stockCount: 22,
      sizeKb: 95,
    },
  },
  {
    id: 'cli-004',
    name: 'Vikram Joshi',
    businessName: 'Krishna Cold Storage & Logistics',
    mobile: '9845012399',
    email: 'admin@krishnalogistics.in',
    gstin: '29AAACK7711B1ZU',
    portalPin: '5678',
    role: 'OWNER',
    status: 'TRIAL',
    planId: 'starter',
    planName: 'Starter Solo (Trial)',
    amount: 0,
    billingCycle: 'MONTHLY',
    trialStartDate: new Date(Date.now() - 16 * 86400000).toISOString().split('T')[0],
    trialEndDate: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0], // Expired 2 days ago!
    dueDate: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    paymentStatus: 'OVERDUE',
    lastLogin: '3 days ago',
    createdAt: new Date(Date.now() - 16 * 86400000).toISOString().split('T')[0],
    notes: 'Trial expired 2 days ago. Ready for automated deactivation.',
    dbStats: {
      ledgersCount: 12,
      vouchersCount: 24,
      stockCount: 10,
      sizeKb: 68,
    },
  },
  {
    id: 'cli-005',
    name: 'CA Harish Chawla',
    businessName: 'Chawla & Associates Chartered Accountants',
    mobile: '9810054321',
    email: 'audit@chawlaca.com',
    gstin: '06AAAFC3322N1Z4',
    portalPin: '9000',
    role: 'AUDITOR',
    status: 'ACTIVE',
    planId: 'ca_firm',
    planName: 'CA & Tax Consultant',
    amount: 24999,
    billingCycle: 'ANNUAL',
    dueDate: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
    paymentStatus: 'PAID',
    lastLogin: 'Today, 02:00 PM',
    createdAt: '2025-11-20',
    notes: 'Audit partner managing 18 client corporate books.',
    dbStats: {
      ledgersCount: 110,
      vouchersCount: 640,
      stockCount: 180,
      sizeKb: 1240,
    },
  },
  {
    id: 'cli-006',
    name: 'Anand Verma',
    businessName: 'Verma Auto Spares & Ancillaries',
    mobile: '9899123450',
    email: 'anand@vermaautospares.in',
    gstin: '09AAABV6655P1ZK',
    portalPin: '7777',
    role: 'OWNER',
    status: 'INACTIVE',
    planId: 'starter',
    planName: 'Starter Solo',
    amount: 499,
    billingCycle: 'MONTHLY',
    dueDate: new Date(Date.now() - 15 * 86400000).toISOString().split('T')[0],
    paymentStatus: 'OVERDUE',
    lastLogin: '18 days ago',
    createdAt: '2025-10-10',
    notes: 'Account suspended due to non-payment.',
    dbStats: {
      ledgersCount: 18,
      vouchersCount: 44,
      stockCount: 30,
      sizeKb: 110,
    },
  },
];

// --- Local Storage Getters and Setters ---

export function getMasterAdminPin(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_ADMIN_PIN);
    return saved || DEFAULT_MASTER_PIN;
  } catch {
    return DEFAULT_MASTER_PIN;
  }
}

export function setMasterAdminPin(newPin: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_ADMIN_PIN, newPin.trim());
  } catch (err) {
    console.error('Failed to save master admin pin', err);
  }
}

export function getTenantClients(): TenantClient[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_CLIENTS);
    if (data) {
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to load tenant clients', err);
  }
  return INITIAL_CLIENTS;
}

export function saveTenantClients(clients: TenantClient[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CLIENTS, JSON.stringify(clients));
  } catch (err) {
    console.error('Failed to save tenant clients', err);
  }
}

export function getSubscriptionPlans(): SubscriptionPlanConfig[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_PLANS);
    if (data) {
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to load subscription plans', err);
  }
  return INITIAL_PLANS;
}

export function saveSubscriptionPlans(plans: SubscriptionPlanConfig[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PLANS, JSON.stringify(plans));
  } catch (err) {
    console.error('Failed to save subscription plans', err);
  }
}

export function getAutomationSettings(): AutomationSettings {
  try {
    const data = localStorage.getItem(STORAGE_KEY_AUTOMATION);
    if (data) {
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to load automation settings', err);
  }
  return INITIAL_AUTOMATION;
}

export function saveAutomationSettings(settings: AutomationSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_AUTOMATION, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save automation settings', err);
  }
}

// --- Automated Subscription & Trial Expiry Engine ---

export function runAutomatedTrialDeactivation(): {
  updatedCount: number;
  deactivatedClients: TenantClient[];
} {
  const clients = getTenantClients();
  const automation = getAutomationSettings();
  if (!automation.autoDeactivateExpiredTrial) {
    return { updatedCount: 0, deactivatedClients: [] };
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const deactivated: TenantClient[] = [];

  const updatedClients = clients.map(client => {
    // Check if client is in trial and trial end date is in the past
    if (client.status === 'TRIAL' && client.trialEndDate && client.trialEndDate < todayStr) {
      const expiredClient: TenantClient = {
        ...client,
        status: 'EXPIRED',
        paymentStatus: 'OVERDUE',
        notes: `${client.notes || ''} [Auto-Deactivated: Trial expired on ${client.trialEndDate}]`,
      };
      deactivated.push(expiredClient);
      return expiredClient;
    }

    // Check if regular subscription overdue for more than 7 days
    if (client.status === 'ACTIVE' && client.dueDate && client.paymentStatus === 'OVERDUE') {
      const dueDateObj = new Date(client.dueDate);
      const todayObj = new Date();
      const diffDays = Math.floor((todayObj.getTime() - dueDateObj.getTime()) / 86400000);
      if (diffDays > 7) {
        const inactiveClient: TenantClient = {
          ...client,
          status: 'INACTIVE',
          notes: `${client.notes || ''} [Auto-Suspended: Overdue by ${diffDays} days]`,
        };
        deactivated.push(inactiveClient);
        return inactiveClient;
      }
    }

    return client;
  });

  if (deactivated.length > 0) {
    saveTenantClients(updatedClients);
  }

  // Update last run time
  saveAutomationSettings({
    ...automation,
    lastAutoDeactivationRun: new Date().toISOString(),
  });

  return {
    updatedCount: deactivated.length,
    deactivatedClients: deactivated,
  };
}

// --- WhatsApp Payment Reminder Dispatcher ---

export function generateWhatsAppReminderMessage(
  client: TenantClient,
  template?: string
): string {
  const automation = getAutomationSettings();
  const tmpl = template || automation.whatsappTemplate;
  const paymentLink = `https://upiqr.in/pay?pa=nexorabooks@okaxis&pn=Nexora%20Books&am=${client.amount}&cu=INR&tn=Renewal_${client.businessName.replace(/\s+/g, '_')}`;

  return tmpl
    .replace('{client_name}', client.name)
    .replace('{business_name}', client.businessName)
    .replace('{plan_name}', client.planName)
    .replace('{due_date}', client.dueDate)
    .replace('{amount}', client.amount.toLocaleString('en-IN'))
    .replace('{payment_link}', paymentLink);
}

export function openWhatsAppReminderWindow(client: TenantClient, customMessage?: string): void {
  const message = customMessage || generateWhatsAppReminderMessage(client);
  const cleanMobile = client.mobile.replace(/\D/g, '');
  const targetNumber = cleanMobile.startsWith('91') ? cleanMobile : `91${cleanMobile}`;
  const encodedText = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${targetNumber}?text=${encodedText}`;
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
}

export function exportClientDatabaseJson(client: TenantClient): void {
  const exportPayload = {
    exportDate: new Date().toISOString(),
    clientMetadata: client,
    format: 'Nexora_Tenant_Database_Snapshot_v1',
    schemaVersion: '2026.1',
    data: {
      company: {
        name: client.businessName,
        gstin: client.gstin,
        owner: client.name,
        mobile: client.mobile,
      },
      auditNotice: 'Protected under Indian Companies (Accounts) Rules, 2014 - Rule 3(1) Edit Log.',
    },
  };

  const jsonStr = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Nexora_ClientDB_${client.businessName.replace(/\s+/g, '_')}_${client.mobile}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// --- Client Account Management Subscription Linkage ---

export function syncClientSubscriptionWithAdmin(params: {
  mobile: string;
  name: string;
  businessName: string;
  email?: string;
  gstin?: string;
  planId: string;
  planName: string;
  amount: number;
  cycle: 'MONTHLY' | 'ANNUAL' | 'LIFETIME';
  dueDate: string;
  paymentRef: string;
  recurringMandate?: {
    isRecurring: boolean;
    mandateId: string;
    method: string;
    nextDebitDate: string;
    amount: number;
    cycle: 'MONTHLY' | 'ANNUAL' | 'LIFETIME';
    status: 'ACTIVE' | 'PAUSED' | 'CANCELLED';
    autoDebitBank?: string;
  };
}): TenantClient {
  const clients = getTenantClients();
  const cleanMobile = params.mobile.replace(/\D/g, '');
  const existingIdx = clients.findIndex(c => c.mobile.replace(/\D/g, '') === cleanMobile);

  let updatedClient: TenantClient;
  if (existingIdx >= 0) {
    const existing = clients[existingIdx];
    updatedClient = {
      ...existing,
      name: params.name || existing.name,
      businessName: params.businessName || existing.businessName,
      email: params.email || existing.email,
      gstin: params.gstin || existing.gstin,
      status: 'ACTIVE',
      planId: params.planId,
      planName: params.planName,
      amount: params.amount,
      billingCycle: params.cycle,
      dueDate: params.dueDate,
      paymentStatus: 'PAID',
      lastLogin: 'Just now',
      recurringMandate: params.recurringMandate,
      notes: `${existing.notes || ''} [Subscribed to ${params.planName} (${params.cycle})${params.recurringMandate?.isRecurring ? ' with Recurring AutoPay' : ''} - Ref: ${params.paymentRef}]`.trim(),
    };
    clients[existingIdx] = updatedClient;
  } else {
    updatedClient = {
      id: `cli-${Date.now()}`,
      name: params.name || 'Business Owner',
      businessName: params.businessName || 'Business Enterprises',
      mobile: cleanMobile,
      email: params.email || '',
      gstin: params.gstin,
      portalPin: '1234',
      role: 'OWNER',
      status: 'ACTIVE',
      planId: params.planId,
      planName: params.planName,
      amount: params.amount,
      billingCycle: params.cycle,
      dueDate: params.dueDate,
      paymentStatus: 'PAID',
      lastLogin: 'Just now',
      createdAt: new Date().toISOString().split('T')[0],
      recurringMandate: params.recurringMandate,
      notes: `[Registered & Subscribed to ${params.planName} (${params.cycle})${params.recurringMandate?.isRecurring ? ' with AutoPay Mandate' : ''}]`,
      dbStats: {
        ledgersCount: 13,
        vouchersCount: 0,
        stockCount: 0,
        sizeKb: 15,
      },
    };
    clients.unshift(updatedClient);
  }

  saveTenantClients(clients);
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('nexora_admin_clients_updated'));
    }
  } catch (err) {
    console.error('Failed to dispatch client update event', err);
  }
  return updatedClient;
}
