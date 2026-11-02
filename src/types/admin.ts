/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ClientStatus = 'ACTIVE' | 'INACTIVE' | 'TRIAL' | 'EXPIRED';
export type PaymentStatus = 'PAID' | 'PENDING' | 'OVERDUE';
export type BillingCycle = 'MONTHLY' | 'ANNUAL' | 'LIFETIME';

export interface TenantClient {
  id: string;
  name: string;
  businessName: string;
  mobile: string;
  email: string;
  gstin?: string;
  portalPin: string; // Default portal access PIN
  role: 'OWNER' | 'ADMIN' | 'ACCOUNTANT' | 'AUDITOR';
  status: ClientStatus;
  planId: string;
  planName: string;
  amount: number;
  billingCycle: BillingCycle;
  trialStartDate?: string;
  trialEndDate?: string;
  dueDate: string; // YYYY-MM-DD
  paymentStatus: PaymentStatus;
  lastLogin: string;
  createdAt: string;
  notes?: string;
  recurringMandate?: {
    isRecurring: boolean;
    mandateId: string;
    method: string;
    nextDebitDate: string;
    amount: number;
    cycle: BillingCycle;
    status: 'ACTIVE' | 'PAUSED' | 'CANCELLED';
    autoDebitBank?: string;
  };
  dbStats: {
    ledgersCount: number;
    vouchersCount: number;
    stockCount: number;
    sizeKb: number;
  };
}

export interface SubscriptionPlanConfig {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  isPopular?: boolean;
  features: string[];
}

export interface AutomationSettings {
  autoDeactivateExpiredTrial: boolean;
  defaultTrialDays: number;
  reminderDaysBeforeDue: number[]; // e.g. [7, 3, 1]
  whatsappTemplate: string;
  sendAutomaticReminders: boolean;
  lastAutoDeactivationRun?: string;
}

export interface AdminAuthState {
  isLoggedIn: boolean;
  adminName: string;
  role: 'SUPER_ADMIN';
  lastLogin?: string;
}
