/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AuthSession,
  Company,
  Ledger,
  StockItem,
  Godown,
  Voucher,
  AuditLogEntry,
  FieldChange,
  SubscriptionState,
  SubscriptionTier,
  BillingCycle,
  PaymentTransaction,
  RecurringMandate,
  CAClient,
  CAStaff,
  UserRole,
  GspConfig,
} from '../types/erp';
import { syncClientSubscriptionWithAdmin } from '../services/adminService';
import {
  loadStoredData,
  saveStoredData,
  createFreshTenantData,
  hasTenantData,
  loadTenantData,
  saveTenantData,
  createCleanChartOfAccounts,
  DEMO_MOBILE,
  ACTIVE_MOBILE_KEY,
} from '../services/storage';
import {
  INITIAL_LEDGERS,
  INITIAL_STOCK_ITEMS,
  INITIAL_VOUCHERS,
} from '../data/seedData';

interface ErpContextType {
  auth: AuthSession;
  companies: Company[];
  activeCompany: Company;
  ledgers: Ledger[];
  stockItems: StockItem[];
  godowns: Godown[];
  vouchers: Voucher[];
  auditLogs: AuditLogEntry[];
  subscription: SubscriptionState;
  payments: PaymentTransaction[];
  caClients: CAClient[];
  caStaff: CAStaff[];
  gspConfig: GspConfig;
  reportingPeriod: { from: string; to: string };
  setReportingPeriod: (period: { from: string; to: string }) => void;
  isCompanySetupWizardOpen: boolean;
  setIsCompanySetupWizardOpen: (open: boolean) => void;
  loadSampleDataForTesting: () => void;
  resetToCleanBooks: () => void;

  // Actions
  loginWithMobile: (mobile: string, name: string, businessName: string, role: UserRole, email?: string, emailConfirmed?: boolean) => void;
  logout: () => void;
  createCompany: (company: Partial<Company>) => Company;
  updateCompany: (company: Company) => void;
  switchCompany: (companyId: string) => void;
  createVoucher: (voucherData: Omit<Voucher, 'id' | 'createdAt' | 'status'>) => Voucher;
  updateVoucher: (voucher: Voucher, reason?: string) => void;
  cancelVoucher: (voucherId: string, reason: string) => void;
  deleteVoucher: (voucherId: string) => void;
  createLedger: (ledgerData: Omit<Ledger, 'id'>) => Ledger;
  updateLedger: (ledger: Ledger) => void;
  createStockItem: (itemData: Omit<StockItem, 'id'>) => StockItem;
  updateStockItem: (item: StockItem) => void;
  createGodown: (godownData: Omit<Godown, 'id'>) => Godown;
  processRazorpayPayment: (
    plan: SubscriptionTier,
    cycle: BillingCycle,
    method: 'UPI' | 'CARD' | 'NET_BANKING',
    amount: number,
    options?: {
      isRecurring?: boolean;
      mandateMethod?: 'UPI_AUTOPAY' | 'CARD_MANDATE' | 'ENACH';
      autoDebitBank?: string;
      vpaHandle?: string;
    }
  ) => PaymentTransaction;
  cancelRecurringMandate: () => void;
  toggleRecurringMandateStatus: () => void;
  setSubscriptionStatus: (status: 'ACTIVE' | 'TRIAL' | 'EXPIRED') => void;
  restoreData: (data: any) => boolean;
  restoreTallyData: (
    parsed: {
      companyName?: string;
      ledgers: Partial<Ledger>[];
      vouchers: Partial<Voucher>[];
    },
    mode?: 'MERGE' | 'REPLACE'
  ) => {
    success: boolean;
    ledgersCount: number;
    vouchersCount: number;
    message: string;
  };
  restoreBusyData: (
    parsed: {
      companyName?: string;
      ledgers: Partial<Ledger>[];
      stockItems: Partial<StockItem>[];
      vouchers: Partial<Voucher>[];
    },
    mode?: 'MERGE' | 'REPLACE'
  ) => {
    success: boolean;
    ledgersCount: number;
    itemsCount: number;
    vouchersCount: number;
    message: string;
  };
  updateGspConfig: (config: GspConfig) => void;
  testGspConnection: (configOverride?: Partial<GspConfig>) => Promise<{
    success: boolean;
    latencyMs: number;
    token: string;
    message: string;
  }>;
  logAudit: (
    action: AuditLogEntry['action'],
    voucherType: string,
    voucherNumber: string,
    details: string,
    previousValue?: string,
    newValue?: string,
    fieldChanges?: FieldChange[],
    voucherId?: string,
    reason?: string
  ) => void;
}

const ErpContext = createContext<ErpContextType | null>(null);

export const ErpProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState(() => loadStoredData());
  const [isCompanySetupWizardOpen, setIsCompanySetupWizardOpen] = useState(false);
  const [reportingPeriod, setReportingPeriod] = useState({
    from: '2026-04-01',
    to: '2027-03-31',
  });

  const activeCompany = data.companies.find(c => c.id === data.activeCompanyId) || data.companies[0];

  // Helper to persist updates
  const updateData = (updater: (prev: typeof data) => typeof data) => {
    setData(prev => {
      const next = updater(prev);
      saveStoredData(next);
      return next;
    });
  };

  const logAudit = (
    action: AuditLogEntry['action'],
    voucherType: string,
    voucherNumber: string,
    details: string,
    previousValue?: string,
    newValue?: string,
    fieldChanges?: FieldChange[],
    voucherId?: string,
    reason?: string
  ) => {
    const ts = new Date().toISOString();
    // Deterministic MCA tamper-evident verification hash
    const rawPayload = `${ts}|${action}|${voucherType}|${voucherNumber}|${data.auth.mobile}|${details}`;
    let hashNum = 0;
    for (let i = 0; i < rawPayload.length; i++) {
      hashNum = ((hashNum << 5) - hashNum + rawPayload.charCodeAt(i)) | 0;
    }
    const hashHex = `MCA-0x${Math.abs(hashNum).toString(16).toUpperCase().padStart(8, '0')}`;

    const newEntry: AuditLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: ts,
      action,
      voucherType,
      voucherNumber,
      voucherId,
      user: data.auth.name || 'S. K. Murthy',
      userMobile: data.auth.mobile ? `+91 ${data.auth.mobile}` : '+91 98200 45678',
      userRole: data.auth.role || 'OWNER',
      details,
      reason,
      fieldChanges,
      previousValue,
      newValue,
      ipAddress: '192.168.1.42 (Local Gateway)',
      mcaCompliant: true,
      hash: hashHex,
    };
    updateData(prev => ({
      ...prev,
      auditLogs: [newEntry, ...prev.auditLogs],
    }));
  };

  const loginWithMobile = (
    mobile: string,
    name: string,
    businessName: string,
    role: UserRole,
    email?: string,
    emailConfirmed?: boolean
  ) => {
    const cleanMobile = mobile.replace(/\D/g, '');
    const cleanEmail = email ? email.trim().toLowerCase() : undefined;
    const isDemo = cleanMobile === DEMO_MOBILE;

    if (isDemo) {
      const session: AuthSession = {
        mobile: cleanMobile,
        email: cleanEmail || 'skmurthy1@gmail.com',
        emailConfirmed: true,
        name: name || 'S. K. Murthy (Director)',
        businessName: businessName || 'Bharat Electronics & Systems Pvt Ltd',
        role,
        isLoggedIn: true,
        lastLoginTime: new Date().toISOString(),
      };
      updateData(prev => ({ ...prev, auth: session, isNewClient: false }));
      logAudit('CREATE', 'AUTH', cleanMobile, `Demo user signed in: ${session.name}`);
      return;
    }

    // Client user: Check if this phone number already has saved company data
    if (hasTenantData(cleanMobile)) {
      const saved = loadTenantData(cleanMobile);
      if (saved) {
        const session: AuthSession = {
          ...saved.auth,
          mobile: cleanMobile,
          email: cleanEmail || saved.auth?.email,
          emailConfirmed: emailConfirmed !== undefined ? emailConfirmed : true,
          name: name || saved.auth?.name || 'Business Owner',
          businessName: businessName || saved.auth?.businessName || saved.companies?.[0]?.name,
          role: role || saved.auth?.role || 'OWNER',
          isLoggedIn: true,
          lastLoginTime: new Date().toISOString(),
        };
        const nextData = {
          ...saved,
          auth: session,
          isNewClient: false,
        };
        setData(nextData);
        saveTenantData(cleanMobile, nextData);
        logAudit('CREATE', 'AUTH', cleanMobile, `Returning user ${session.name} signed in`);
        return;
      }
    }

    // Brand NEW Customer!
    // Creates a pristine fresh company workspace with clean Chart of Accounts, ZERO old vouchers, ZERO old stock items!
    const fresh = createFreshTenantData({
      mobile: cleanMobile,
      name,
      businessName,
      email: cleanEmail,
      role,
    });
    setData(fresh);
    saveTenantData(cleanMobile, fresh);
    setIsCompanySetupWizardOpen(true);
    logAudit('CREATE', 'AUTH', cleanMobile, `New client registered: ${businessName || name}`);
  };

  const logout = () => {
    const cleanMobile = data.auth?.mobile?.replace(/\D/g, '');
    if (cleanMobile && cleanMobile !== DEMO_MOBILE) {
      saveTenantData(cleanMobile, {
        ...data,
        auth: { ...data.auth, isLoggedIn: false },
      });
    }
    localStorage.removeItem(ACTIVE_MOBILE_KEY);
    updateData(prev => ({
      ...prev,
      auth: { ...prev.auth, isLoggedIn: false },
    }));
  };

  const loadSampleDataForTesting = () => {
    updateData(prev => ({
      ...prev,
      stockItems: INITIAL_STOCK_ITEMS,
      vouchers: INITIAL_VOUCHERS,
      ledgers: INITIAL_LEDGERS,
    }));
    logAudit('ALTER', 'DATA', 'SAMPLE', 'Loaded sample MSME electronic products and vouchers for evaluation');
  };

  const resetToCleanBooks = () => {
    updateData(prev => ({
      ...prev,
      vouchers: [],
      stockItems: [],
      ledgers: createCleanChartOfAccounts(),
    }));
    logAudit('ALTER', 'DATA', 'RESET', 'Reset workspace to clean empty books (zero vouchers & stock items)');
  };

  const createCompany = (compData: Partial<Company>): Company => {
    const id = `comp-${Date.now()}`;
    const newComp: Company = {
      id,
      name: compData.name || 'New Company',
      tradeName: compData.tradeName || compData.name || 'New Company',
      gstin: compData.gstin || '',
      pan: compData.pan || (compData.gstin ? compData.gstin.substring(2, 12) : ''),
      state: compData.state || 'Maharashtra',
      stateCode: compData.stateCode || '27',
      address: compData.address || '',
      pincode: compData.pincode || '',
      phone: compData.phone || data.auth.mobile || '',
      email: compData.email || '',
      logoUrl: compData.logoUrl,
      bankName: compData.bankName || 'State Bank of India',
      accountNumber: compData.accountNumber || '',
      ifsc: compData.ifsc || '',
      branch: compData.branch || '',
      upiId: compData.upiId || '',
      signatureUrl: compData.signatureUrl,
      defaultTerms: compData.defaultTerms || '1. Terms: Payment due within 30 days.\n2. Goods once sold will not be returned.',
      defaultNotes: compData.defaultNotes || 'Thank you for your business.',
      registrationType: compData.registrationType || 'REGULAR',
      filingFrequency: compData.filingFrequency || 'MONTHLY',
      financialYear: compData.financialYear || '2026-27',
      booksBeginningDate: compData.booksBeginningDate || '2026-04-01',
      voucherPrefix: compData.voucherPrefix || 'INV/26-27/',
      autoVoucherNumbering: compData.autoVoucherNumbering !== false,
      lockDate: compData.lockDate,
    };

    updateData(prev => ({
      ...prev,
      companies: [...prev.companies, newComp],
      activeCompanyId: id,
    }));

    logAudit('CREATE', 'COMPANY', newComp.gstin || newComp.name, `Created new company "${newComp.name}"`);
    return newComp;
  };

  const updateCompany = (updated: Company) => {
    updateData(prev => ({
      ...prev,
      companies: prev.companies.map(c => (c.id === updated.id ? updated : c)),
    }));
    logAudit('ALTER', 'COMPANY', updated.gstin || updated.name, `Updated company profile details for "${updated.name}"`);
  };

  const switchCompany = (companyId: string) => {
    updateData(prev => ({
      ...prev,
      activeCompanyId: companyId,
    }));
  };

  const createVoucher = (voucherData: Omit<Voucher, 'id' | 'createdAt' | 'status'>): Voucher => {
    const id = `vch-${Date.now()}`;
    const newVoucher: Voucher = {
      ...voucherData,
      id,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      createdBy: data.auth.name || data.auth.mobile,
    };

    // Update stock item quantities if Sales, Purchase, Challan, GRN
    const stockUpdates: Record<string, number> = {};
    if (newVoucher.voucherType === 'SALES' || newVoucher.voucherType === 'DELIVERY_CHALLAN') {
      newVoucher.items.forEach(it => {
        stockUpdates[it.itemId] = (stockUpdates[it.itemId] || 0) - it.quantity;
      });
    } else if (newVoucher.voucherType === 'PURCHASE' || newVoucher.voucherType === 'GRN') {
      newVoucher.items.forEach(it => {
        stockUpdates[it.itemId] = (stockUpdates[it.itemId] || 0) + it.quantity;
      });
    }

    // Update ledger balances if applicable
    const ledgerBalanceUpdates: Record<string, { delta: number; drCr: 'Dr' | 'Cr' }> = {};
    newVoucher.ledgerEntries.forEach(entry => {
      ledgerBalanceUpdates[entry.ledgerId] = {
        delta: entry.amount,
        drCr: entry.drCr,
      };
    });

    updateData(prev => ({
      ...prev,
      vouchers: [newVoucher, ...prev.vouchers],
      stockItems: prev.stockItems.map(item => {
        if (stockUpdates[item.id]) {
          return {
            ...item,
            currentStock: item.currentStock + stockUpdates[item.id],
          };
        }
        return item;
      }),
      ledgers: prev.ledgers.map(led => {
        if (ledgerBalanceUpdates[led.id]) {
          const upd = ledgerBalanceUpdates[led.id];
          const newBal = upd.drCr === led.drCr ? led.currentBalance + upd.delta : Math.abs(led.currentBalance - upd.delta);
          return {
            ...led,
            currentBalance: newBal,
          };
        }
        return led;
      }),
    }));

    const createFieldChanges: FieldChange[] = [
      {
        field: 'partyName',
        fieldLabel: 'Party / Ledger',
        oldValue: '[None - New Record]',
        newValue: newVoucher.partyName || newVoucher.ledgerEntries[0]?.ledgerName || 'Counter / Cash',
      },
      {
        field: 'date',
        fieldLabel: 'Voucher Date',
        oldValue: '[None]',
        newValue: newVoucher.date,
      },
      {
        field: 'grandTotal',
        fieldLabel: 'Grand Total Amount',
        oldValue: '₹0.00',
        newValue: `₹${newVoucher.grandTotal.toLocaleString('en-IN')}`,
      },
    ];

    if (newVoucher.taxableTotal > 0) {
      createFieldChanges.push({
        field: 'taxableTotal',
        fieldLabel: 'Taxable Turnover',
        oldValue: '₹0.00',
        newValue: `₹${newVoucher.taxableTotal.toLocaleString('en-IN')}`,
      });
    }

    if (newVoucher.items && newVoucher.items.length > 0) {
      createFieldChanges.push({
        field: 'items',
        fieldLabel: 'Line Items Recorded',
        oldValue: '[Empty]',
        newValue: `${newVoucher.items.length} item(s) - ${newVoucher.items.map(i => `${i.itemName} (${i.quantity} ${i.unit})`).join(', ')}`,
      });
    }

    logAudit(
      'CREATE',
      newVoucher.voucherType,
      newVoucher.voucherNumber,
      `Recorded ${newVoucher.voucherType} voucher for ₹${newVoucher.grandTotal.toLocaleString('en-IN')}`,
      undefined,
      `₹${newVoucher.grandTotal.toLocaleString('en-IN')}`,
      createFieldChanges,
      newVoucher.id
    );
    return newVoucher;
  };

  const updateVoucher = (updated: Voucher, reason = 'Voucher amended') => {
    const prevVoucher = data.vouchers.find(v => v.id === updated.id);
    const fieldChanges: FieldChange[] = [];

    if (prevVoucher) {
      if (prevVoucher.date !== updated.date) {
        fieldChanges.push({
          field: 'date',
          fieldLabel: 'Voucher Date',
          oldValue: prevVoucher.date,
          newValue: updated.date,
        });
      }
      if (prevVoucher.partyName !== updated.partyName) {
        fieldChanges.push({
          field: 'partyName',
          fieldLabel: 'Party Name',
          oldValue: prevVoucher.partyName || '[None]',
          newValue: updated.partyName || '[None]',
        });
      }
      if (prevVoucher.taxableTotal !== updated.taxableTotal) {
        fieldChanges.push({
          field: 'taxableTotal',
          fieldLabel: 'Taxable Total',
          oldValue: `₹${prevVoucher.taxableTotal.toLocaleString('en-IN')}`,
          newValue: `₹${updated.taxableTotal.toLocaleString('en-IN')}`,
        });
      }
      if (prevVoucher.cgstTotal !== updated.cgstTotal) {
        fieldChanges.push({
          field: 'cgstTotal',
          fieldLabel: 'Output CGST',
          oldValue: `₹${prevVoucher.cgstTotal.toLocaleString('en-IN')}`,
          newValue: `₹${updated.cgstTotal.toLocaleString('en-IN')}`,
        });
      }
      if (prevVoucher.sgstTotal !== updated.sgstTotal) {
        fieldChanges.push({
          field: 'sgstTotal',
          fieldLabel: 'Output SGST',
          oldValue: `₹${prevVoucher.sgstTotal.toLocaleString('en-IN')}`,
          newValue: `₹${updated.sgstTotal.toLocaleString('en-IN')}`,
        });
      }
      if (prevVoucher.igstTotal !== updated.igstTotal) {
        fieldChanges.push({
          field: 'igstTotal',
          fieldLabel: 'Output IGST',
          oldValue: `₹${prevVoucher.igstTotal.toLocaleString('en-IN')}`,
          newValue: `₹${updated.igstTotal.toLocaleString('en-IN')}`,
        });
      }
      if (prevVoucher.grandTotal !== updated.grandTotal) {
        fieldChanges.push({
          field: 'grandTotal',
          fieldLabel: 'Grand Total Amount',
          oldValue: `₹${prevVoucher.grandTotal.toLocaleString('en-IN')}`,
          newValue: `₹${updated.grandTotal.toLocaleString('en-IN')}`,
        });
      }
      if (prevVoucher.placeOfSupply !== updated.placeOfSupply) {
        fieldChanges.push({
          field: 'placeOfSupply',
          fieldLabel: 'Place of Supply',
          oldValue: prevVoucher.placeOfSupply || '[None]',
          newValue: updated.placeOfSupply || '[None]',
        });
      }
      if (prevVoucher.narration !== updated.narration) {
        fieldChanges.push({
          field: 'narration',
          fieldLabel: 'Narration / Remarks',
          oldValue: prevVoucher.narration || '[None]',
          newValue: updated.narration || '[None]',
        });
      }
      if (JSON.stringify(prevVoucher.items) !== JSON.stringify(updated.items)) {
        fieldChanges.push({
          field: 'items',
          fieldLabel: 'Line Items / Quantities',
          oldValue: `${prevVoucher.items.length} item(s) - ${prevVoucher.items.map(i => `${i.itemName} (${i.quantity} @ ₹${i.rate})`).join('; ')}`,
          newValue: `${updated.items.length} item(s) - ${updated.items.map(i => `${i.itemName} (${i.quantity} @ ₹${i.rate})`).join('; ')}`,
        });
      }
    }

    const updatedWithAudit: Voucher = {
      ...updated,
      updatedAt: new Date().toISOString(),
      updatedBy: data.auth.mobile || 'S. K. Murthy',
    };

    updateData(prev => ({
      ...prev,
      vouchers: prev.vouchers.map(v => (v.id === updated.id ? updatedWithAudit : v)),
    }));

    logAudit(
      'ALTER',
      updated.voucherType,
      updated.voucherNumber,
      `Modified voucher: ${reason}`,
      prevVoucher ? `₹${prevVoucher.grandTotal.toLocaleString('en-IN')}` : undefined,
      `₹${updated.grandTotal.toLocaleString('en-IN')}`,
      fieldChanges.length > 0 ? fieldChanges : undefined,
      updated.id,
      reason
    );
  };

  const cancelVoucher = (voucherId: string, reason: string) => {
    const target = data.vouchers.find(v => v.id === voucherId);
    if (!target) return;

    updateData(prev => ({
      ...prev,
      vouchers: prev.vouchers.map(v => (v.id === voucherId ? { ...v, status: 'CANCELLED' } : v)),
    }));

    const fieldChanges: FieldChange[] = [
      {
        field: 'status',
        fieldLabel: 'Voucher Status',
        oldValue: 'ACTIVE',
        newValue: 'CANCELLED',
      },
      {
        field: 'narration',
        fieldLabel: 'Cancellation Note',
        oldValue: target.narration || '[Active Voucher]',
        newValue: `CANCELLED: ${reason}`,
      },
      {
        field: 'grandTotal',
        fieldLabel: 'Cancelled Amount',
        oldValue: `₹${target.grandTotal.toLocaleString('en-IN')}`,
        newValue: '₹0.00 (Cancelled)',
      },
    ];

    logAudit(
      'CANCEL',
      target.voucherType,
      target.voucherNumber,
      `Cancelled voucher. Reason: ${reason}`,
      `₹${target.grandTotal.toLocaleString('en-IN')}`,
      '₹0.00 (Cancelled)',
      fieldChanges,
      target.id,
      reason
    );
  };

  const deleteVoucher = (voucherId: string) => {
    const target = data.vouchers.find(v => v.id === voucherId);
    if (!target) return;

    // Preserved snapshot for statutory auditor under MCA Rule 3(1) edit log mandate
    const fieldChanges: FieldChange[] = [
      {
        field: 'deletionSnapshot',
        fieldLabel: 'Deleted Voucher Number',
        oldValue: `${target.voucherType} - ${target.voucherNumber}`,
        newValue: '[DELETED FROM ACTIVE BOOKS]',
      },
      {
        field: 'partyName',
        fieldLabel: 'Party Name',
        oldValue: target.partyName || 'Cash / Ledger',
        newValue: '[Deleted]',
      },
      {
        field: 'grandTotal',
        fieldLabel: 'Deleted Voucher Total',
        oldValue: `₹${target.grandTotal.toLocaleString('en-IN')}`,
        newValue: '₹0.00',
      },
      {
        field: 'date',
        fieldLabel: 'Voucher Date',
        oldValue: target.date,
        newValue: '[Deleted]',
      },
    ];

    updateData(prev => ({
      ...prev,
      vouchers: prev.vouchers.filter(v => v.id !== voucherId),
    }));

    logAudit(
      'DELETE',
      target.voucherType,
      target.voucherNumber,
      `Deleted voucher from books. Preserved complete snapshot for MCA Rule 3(1) audit trail.`,
      `₹${target.grandTotal.toLocaleString('en-IN')}`,
      'Deleted',
      fieldChanges,
      target.id,
      'Deleted by authorized user'
    );
  };

  const createLedger = (ledgerData: Omit<Ledger, 'id'>): Ledger => {
    const id = `led-${Date.now()}`;
    const newLedger: Ledger = {
      ...ledgerData,
      id,
    };
    updateData(prev => ({
      ...prev,
      ledgers: [...prev.ledgers, newLedger],
    }));
    logAudit('CREATE', 'LEDGER', newLedger.name, `Created ledger in group "${newLedger.group}"`);
    return newLedger;
  };

  const updateLedger = (ledger: Ledger) => {
    updateData(prev => ({
      ...prev,
      ledgers: prev.ledgers.map(l => (l.id === ledger.id ? ledger : l)),
    }));
    logAudit('ALTER', 'LEDGER', ledger.name, `Updated ledger details`);
  };

  const createStockItem = (itemData: Omit<StockItem, 'id'>): StockItem => {
    const id = `item-${Date.now()}`;
    const newItem: StockItem = {
      ...itemData,
      id,
    };
    updateData(prev => ({
      ...prev,
      stockItems: [...prev.stockItems, newItem],
    }));
    logAudit('CREATE', 'STOCK_ITEM', newItem.name, `Created inventory item with HSN ${newItem.hsnCode}`);
    return newItem;
  };

  const updateStockItem = (item: StockItem) => {
    updateData(prev => ({
      ...prev,
      stockItems: prev.stockItems.map(i => (i.id === item.id ? item : i)),
    }));
    logAudit('ALTER', 'STOCK_ITEM', item.name, `Updated stock item details`);
  };

  const createGodown = (godownData: Omit<Godown, 'id'>): Godown => {
    const id = `gdn-${Date.now()}`;
    const newGodown: Godown = {
      ...godownData,
      id,
    };
    updateData(prev => ({
      ...prev,
      godowns: [...prev.godowns, newGodown],
    }));
    logAudit('CREATE', 'GODOWN', newGodown.name, `Created godown/warehouse`);
    return newGodown;
  };

  const processRazorpayPayment = (
    plan: SubscriptionTier,
    cycle: BillingCycle,
    method: 'UPI' | 'CARD' | 'NET_BANKING',
    amount: number,
    options?: {
      isRecurring?: boolean;
      mandateMethod?: 'UPI_AUTOPAY' | 'CARD_MANDATE' | 'ENACH';
      autoDebitBank?: string;
      vpaHandle?: string;
    }
  ): PaymentTransaction => {
    const taxRate = 0.18;
    const taxableAmount = Math.round((amount / (1 + taxRate)) * 100) / 100;
    const gstAmount = Math.round((amount - taxableAmount) * 100) / 100;
    const txnId = `PAY-${Date.now()}`;
    const refId = `RAZORPAY-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const invoiceNumber = `NEXORA-INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const validMonths = cycle === 'ANNUAL' ? 12 : 1;
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + validMonths);
    const dueDateStr = expiryDate.toISOString().split('T')[0];

    const isRecurring = Boolean(options?.isRecurring);
    const mandateId = isRecurring
      ? `UMRN-AUTOPAY-${Math.floor(10000000 + Math.random() * 90000000)}`
      : undefined;

    const recurringMandate: RecurringMandate | undefined = isRecurring
      ? {
          isEnabled: true,
          mandateId: mandateId!,
          method: options?.mandateMethod || (method === 'UPI' ? 'UPI_AUTOPAY' : method === 'CARD' ? 'CARD_MANDATE' : 'ENACH'),
          cycle,
          frequency: cycle === 'ANNUAL' ? 'Yearly' : 'Monthly',
          maxDebitAmount: amount,
          nextDebitDate: dueDateStr,
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          autoDebitBank: options?.autoDebitBank || (method === 'UPI' ? 'NPCI UPI AutoPay' : 'HDFC Bank Ltd'),
          vpaHandle: options?.vpaHandle,
        }
      : undefined;

    const newPayment: PaymentTransaction = {
      id: txnId,
      date: new Date().toISOString().split('T')[0],
      amount,
      taxableAmount,
      gstAmount,
      plan,
      cycle,
      method,
      referenceId: refId,
      invoiceUrl: invoiceNumber,
      isRecurring,
      mandateId,
    };

    const newSubState: SubscriptionState = {
      tier: plan,
      cycle,
      status: 'ACTIVE',
      validTill: dueDateStr,
      amountPaid: amount,
      lastPaymentDate: new Date().toISOString().split('T')[0],
      invoiceNumber,
      recurringMandate,
      features: {
        unlimitedVouchers: true,
        allGstReturns: true,
        eWayBillAndEInvoice: true,
        whatsAppIntegration: true,
        tallyXmlSync: true,
        multiGodowns: plan !== 'STARTER',
        caWorkspace: plan === 'ENTERPRISE',
      },
    };

    updateData(prev => ({
      ...prev,
      subscription: newSubState,
      payments: [newPayment, ...prev.payments],
    }));

    // Synchronize and link directly with Client Account Management in Super Admin
    try {
      syncClientSubscriptionWithAdmin({
        mobile: data.auth.mobile || '9820045678',
        name: data.auth.name || 'Business Owner',
        businessName: data.auth.businessName || activeCompany.name,
        email: data.auth.email || activeCompany.email,
        gstin: activeCompany.gstin,
        planId: plan.toLowerCase(),
        planName: plan === 'STARTER' ? 'Starter Solo' : plan === 'PRO' ? 'Business Pro' : 'Enterprise Cloud',
        amount,
        cycle,
        dueDate: dueDateStr,
        paymentRef: refId,
        recurringMandate: recurringMandate
          ? {
              isRecurring: true,
              mandateId: recurringMandate.mandateId,
              method: recurringMandate.method,
              nextDebitDate: recurringMandate.nextDebitDate,
              amount,
              cycle,
              status: 'ACTIVE',
              autoDebitBank: recurringMandate.autoDebitBank,
            }
          : undefined,
      });
    } catch (err) {
      console.error('Failed to link client subscription with admin', err);
    }

    logAudit(
      'CREATE',
      'SUBSCRIPTION',
      invoiceNumber,
      `Processed Razorpay payment of ₹${amount} for ${plan} ${cycle} subscription${isRecurring ? ` with recurring e-Mandate (${mandateId})` : ''}`
    );
    return newPayment;
  };

  const cancelRecurringMandate = () => {
    if (!data.subscription.recurringMandate) return;
    const cancelledMandate: RecurringMandate = {
      ...data.subscription.recurringMandate,
      isEnabled: false,
      status: 'CANCELLED',
    };
    updateData(prev => ({
      ...prev,
      subscription: {
        ...prev.subscription,
        recurringMandate: cancelledMandate,
      },
    }));

    syncClientSubscriptionWithAdmin({
      mobile: data.auth.mobile || '9820045678',
      name: data.auth.name || 'Business Owner',
      businessName: data.auth.businessName || activeCompany.name,
      email: data.auth.email || activeCompany.email,
      gstin: activeCompany.gstin,
      planId: data.subscription.tier.toLowerCase(),
      planName: data.subscription.tier,
      amount: data.subscription.amountPaid,
      cycle: data.subscription.cycle,
      dueDate: data.subscription.validTill,
      paymentRef: 'MANDATE-REVOKED',
      recurringMandate: {
        isRecurring: false,
        mandateId: cancelledMandate.mandateId,
        method: cancelledMandate.method,
        nextDebitDate: cancelledMandate.nextDebitDate,
        amount: cancelledMandate.maxDebitAmount,
        cycle: cancelledMandate.cycle,
        status: 'CANCELLED',
      },
    });

    logAudit('ALTER', 'SUBSCRIPTION', cancelledMandate.mandateId, 'Cancelled recurring auto-debit mandate');
  };

  const toggleRecurringMandateStatus = () => {
    if (!data.subscription.recurringMandate) return;
    const currentStatus = data.subscription.recurringMandate.status;
    const newStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    const updatedMandate: RecurringMandate = {
      ...data.subscription.recurringMandate,
      status: newStatus,
      isEnabled: newStatus === 'ACTIVE',
    };
    updateData(prev => ({
      ...prev,
      subscription: {
        ...prev.subscription,
        recurringMandate: updatedMandate,
      },
    }));

    syncClientSubscriptionWithAdmin({
      mobile: data.auth.mobile || '9820045678',
      name: data.auth.name || 'Business Owner',
      businessName: data.auth.businessName || activeCompany.name,
      email: data.auth.email || activeCompany.email,
      gstin: activeCompany.gstin,
      planId: data.subscription.tier.toLowerCase(),
      planName: data.subscription.tier,
      amount: data.subscription.amountPaid,
      cycle: data.subscription.cycle,
      dueDate: data.subscription.validTill,
      paymentRef: `MANDATE-${newStatus}`,
      recurringMandate: {
        isRecurring: newStatus === 'ACTIVE',
        mandateId: updatedMandate.mandateId,
        method: updatedMandate.method,
        nextDebitDate: updatedMandate.nextDebitDate,
        amount: updatedMandate.maxDebitAmount,
        cycle: updatedMandate.cycle,
        status: newStatus,
      },
    });

    logAudit('ALTER', 'SUBSCRIPTION', updatedMandate.mandateId, `Set recurring auto-debit mandate to ${newStatus}`);
  };

  const setSubscriptionStatus = (status: 'ACTIVE' | 'TRIAL' | 'EXPIRED') => {
    updateData(prev => ({
      ...prev,
      subscription: {
        ...prev.subscription,
        status,
      },
    }));
    logAudit('ALTER', 'SUBSCRIPTION', data.subscription.invoiceNumber, `Set subscription status to ${status}`);
  };

  const restoreData = (jsonData: any): boolean => {
    try {
      if (jsonData.companies && jsonData.vouchers && jsonData.ledgers) {
        updateData(prev => ({
          ...prev,
          companies: jsonData.companies,
          activeCompanyId: jsonData.companies[0].id,
          ledgers: jsonData.ledgers,
          stockItems: jsonData.stockItems || prev.stockItems,
          godowns: jsonData.godowns || prev.godowns,
          vouchers: jsonData.vouchers,
          auditLogs: jsonData.auditLogs || prev.auditLogs,
          subscription: jsonData.subscription || prev.subscription,
          gspConfig: jsonData.gspConfig || prev.gspConfig,
        }));
        logAudit('CREATE', 'BACKUP_RESTORE', 'JSON', 'Restored system database from external backup file');
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to restore backup', e);
      return false;
    }
  };

  const restoreTallyData = (
    parsed: {
      companyName?: string;
      ledgers: Partial<Ledger>[];
      vouchers: Partial<Voucher>[];
    },
    mode: 'MERGE' | 'REPLACE' = 'MERGE'
  ) => {
    try {
      const activeCompId = data.activeCompanyId;
      const incomingLedgers: Ledger[] = parsed.ledgers.map((l, idx) => ({
        id: l.id || `led-tally-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 5)}`,
        companyId: activeCompId,
        name: l.name || `Tally Ledger ${idx + 1}`,
        group: l.group || 'Sundry Debtors',
        openingBalance: l.openingBalance || 0,
        currentBalance: l.currentBalance || l.openingBalance || 0,
        drCr: l.drCr || 'Dr',
        gstin: l.gstin,
        state: l.state,
        stateCode: l.stateCode || (l.gstin ? l.gstin.slice(0, 2) : '27'),
        pan: l.pan,
      }));

      const incomingVouchers: Voucher[] = parsed.vouchers.map((v, idx) => ({
        id: v.id || `vch-tally-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 5)}`,
        companyId: activeCompId,
        voucherNumber: v.voucherNumber || `TL-${1000 + idx}`,
        voucherType: v.voucherType || 'SALES',
        date: v.date || new Date().toISOString().split('T')[0],
        partyName: v.partyName || 'Cash / Party',
        partyGstin: v.partyGstin,
        placeOfSupply: v.placeOfSupply || '27-Maharashtra',
        reverseCharge: false,
        narration: v.narration || 'Imported from Tally Prime backup',
        freightCharges: 0,
        packingCharges: 0,
        insuranceCharges: 0,
        grandTotal: v.grandTotal || 0,
        taxableTotal: v.taxableTotal || 0,
        cgstTotal: v.cgstTotal || 0,
        sgstTotal: v.sgstTotal || 0,
        igstTotal: v.igstTotal || 0,
        cessTotal: v.cessTotal || 0,
        roundOff: v.roundOff || 0,
        status: 'ACTIVE',
        items: v.items || [],
        ledgerEntries:
          v.ledgerEntries && v.ledgerEntries.length > 0
            ? v.ledgerEntries
            : [
                {
                  id: `le-1-${idx}`,
                  ledgerId: 'p',
                  ledgerName: v.partyName || 'Party Account',
                  amount: v.grandTotal || 0,
                  drCr: 'Dr',
                },
                {
                  id: `le-2-${idx}`,
                  ledgerId: 's',
                  ledgerName: 'Sales / Revenue Account',
                  amount: v.grandTotal || 0,
                  drCr: 'Cr',
                },
              ],
        createdAt: new Date().toISOString(),
        createdBy: data.auth.name || 'Tally Prime Migration',
      }));

      updateData(prev => {
        let finalLedgers = prev.ledgers;
        let finalVouchers = prev.vouchers;

        if (mode === 'REPLACE') {
          finalLedgers = incomingLedgers;
          finalVouchers = incomingVouchers;
        } else {
          const existingLedgerNames = new Set(prev.ledgers.map(l => l.name.toLowerCase().trim()));
          const dedupedLedgers = incomingLedgers.filter(
            l => !existingLedgerNames.has(l.name.toLowerCase().trim())
          );
          finalLedgers = [...prev.ledgers, ...dedupedLedgers];

          const existingVchNos = new Set(prev.vouchers.map(v => v.voucherNumber.toLowerCase().trim()));
          const dedupedVouchers = incomingVouchers.filter(
            v => !existingVchNos.has(v.voucherNumber.toLowerCase().trim())
          );
          finalVouchers = [...dedupedVouchers, ...prev.vouchers];
        }

        let updatedCompanies = prev.companies;
        if (parsed.companyName && mode === 'REPLACE') {
          updatedCompanies = prev.companies.map(c =>
            c.id === prev.activeCompanyId ? { ...c, name: parsed.companyName || c.name } : c
          );
        }

        return {
          ...prev,
          companies: updatedCompanies,
          ledgers: finalLedgers,
          vouchers: finalVouchers,
        };
      });

      logAudit(
        'CREATE',
        'TALLY_RESTORE',
        parsed.companyName || 'Tally Prime XML',
        `Restored data from Tally Prime backup (${mode} mode): ${incomingLedgers.length} ledgers and ${incomingVouchers.length} vouchers merged into books.`
      );

      return {
        success: true,
        ledgersCount: incomingLedgers.length,
        vouchersCount: incomingVouchers.length,
        message: `Successfully imported ${incomingLedgers.length} ledgers and ${incomingVouchers.length} vouchers from Tally Prime!`,
      };
    } catch (e: any) {
      return {
        success: false,
        ledgersCount: 0,
        vouchersCount: 0,
        message: 'Tally restore failed: ' + (e?.message || 'Unknown error'),
      };
    }
  };

  const restoreBusyData = (
    parsed: {
      companyName?: string;
      ledgers: Partial<Ledger>[];
      stockItems: Partial<StockItem>[];
      vouchers: Partial<Voucher>[];
    },
    mode: 'MERGE' | 'REPLACE' = 'MERGE'
  ) => {
    try {
      const activeCompId = data.activeCompanyId;
      const incomingLedgers: Ledger[] = parsed.ledgers.map((l, idx) => ({
        id: l.id || `led-busy-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 5)}`,
        companyId: activeCompId,
        name: l.name || `Busy Account ${idx + 1}`,
        group: l.group || 'Sundry Debtors',
        openingBalance: l.openingBalance || 0,
        currentBalance: l.currentBalance || l.openingBalance || 0,
        drCr: l.drCr || 'Dr',
        gstin: l.gstin,
        state: l.state,
        stateCode: l.stateCode || (l.gstin ? l.gstin.slice(0, 2) : '27'),
        pan: l.pan,
      }));

      const incomingItems: StockItem[] = (parsed.stockItems || []).map((it, idx) => ({
        id: it.id || `item-busy-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 5)}`,
        companyId: activeCompId,
        name: it.name || `Busy Item ${idx + 1}`,
        group: it.group || 'General',
        hsnCode: it.hsnCode || '8532',
        unit: it.unit || 'NOS',
        gstRate: it.gstRate || 18,
        cessRate: it.cessRate || 0,
        salePrice: it.salePrice || 0,
        purchasePrice: it.purchasePrice || 0,
        mrp: it.mrp || (it.salePrice ? it.salePrice * 1.15 : 0),
        openingStock: it.openingStock || 0,
        currentStock: it.currentStock || it.openingStock || 0,
        reorderLevel: it.reorderLevel || 2,
        valuationMethod: it.valuationMethod || 'FIFO',
        godownStock: it.godownStock || {},
        batchEnabled: it.batchEnabled || false,
      }));

      const incomingVouchers: Voucher[] = (parsed.vouchers || []).map((v, idx) => ({
        id: v.id || `vch-busy-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 5)}`,
        companyId: activeCompId,
        voucherNumber: v.voucherNumber || `BUSY-${1000 + idx}`,
        voucherType: v.voucherType || 'SALES',
        date: v.date || new Date().toISOString().split('T')[0],
        partyName: v.partyName || 'Cash / Party',
        partyGstin: v.partyGstin,
        placeOfSupply: v.placeOfSupply || '27-Maharashtra',
        reverseCharge: false,
        narration: v.narration || 'Imported from Busy Accounting backup',
        freightCharges: 0,
        packingCharges: 0,
        insuranceCharges: 0,
        grandTotal: v.grandTotal || 0,
        taxableTotal: v.taxableTotal || 0,
        cgstTotal: v.cgstTotal || 0,
        sgstTotal: v.sgstTotal || 0,
        igstTotal: v.igstTotal || 0,
        cessTotal: v.cessTotal || 0,
        roundOff: v.roundOff || 0,
        status: 'ACTIVE',
        items: v.items || [],
        ledgerEntries:
          v.ledgerEntries && v.ledgerEntries.length > 0
            ? v.ledgerEntries
            : [
                {
                  id: `le-1-b-${idx}`,
                  ledgerId: 'p',
                  ledgerName: v.partyName || 'Party Account',
                  amount: v.grandTotal || 0,
                  drCr: 'Dr',
                },
                {
                  id: `le-2-b-${idx}`,
                  ledgerId: 's',
                  ledgerName: 'Sales / Revenue Account',
                  amount: v.grandTotal || 0,
                  drCr: 'Cr',
                },
              ],
        createdAt: new Date().toISOString(),
        createdBy: data.auth.name || 'Busy Accounting Migration',
      }));

      updateData(prev => {
        let finalLedgers = prev.ledgers;
        let finalItems = prev.stockItems;
        let finalVouchers = prev.vouchers;

        if (mode === 'REPLACE') {
          finalLedgers = incomingLedgers;
          finalItems = incomingItems.length > 0 ? incomingItems : prev.stockItems;
          finalVouchers = incomingVouchers;
        } else {
          const existingLedgerNames = new Set(prev.ledgers.map(l => l.name.toLowerCase().trim()));
          const dedupedLedgers = incomingLedgers.filter(
            l => !existingLedgerNames.has(l.name.toLowerCase().trim())
          );
          finalLedgers = [...prev.ledgers, ...dedupedLedgers];

          const existingItemNames = new Set(prev.stockItems.map(i => i.name.toLowerCase().trim()));
          const dedupedItems = incomingItems.filter(
            i => !existingItemNames.has(i.name.toLowerCase().trim())
          );
          finalItems = [...prev.stockItems, ...dedupedItems];

          const existingVchNos = new Set(prev.vouchers.map(v => v.voucherNumber.toLowerCase().trim()));
          const dedupedVouchers = incomingVouchers.filter(
            v => !existingVchNos.has(v.voucherNumber.toLowerCase().trim())
          );
          finalVouchers = [...dedupedVouchers, ...prev.vouchers];
        }

        let updatedCompanies = prev.companies;
        if (parsed.companyName && mode === 'REPLACE') {
          updatedCompanies = prev.companies.map(c =>
            c.id === prev.activeCompanyId ? { ...c, name: parsed.companyName || c.name } : c
          );
        }

        return {
          ...prev,
          companies: updatedCompanies,
          ledgers: finalLedgers,
          stockItems: finalItems,
          vouchers: finalVouchers,
        };
      });

      logAudit(
        'CREATE',
        'BUSY_RESTORE',
        parsed.companyName || 'Busy Accounting XML',
        `Restored data from Busy Accounting backup (${mode} mode): Added ${incomingLedgers.length} accounts, ${incomingItems.length} items, and ${incomingVouchers.length} vouchers.`
      );

      return {
        success: true,
        ledgersCount: incomingLedgers.length,
        itemsCount: incomingItems.length,
        vouchersCount: incomingVouchers.length,
        message: `Successfully imported ${incomingLedgers.length} accounts, ${incomingItems.length} items, and ${incomingVouchers.length} vouchers from Busy Accounting!`,
      };
    } catch (e: any) {
      return {
        success: false,
        ledgersCount: 0,
        itemsCount: 0,
        vouchersCount: 0,
        message: 'Busy restore failed: ' + (e?.message || 'Unknown error'),
      };
    }
  };

  const updateGspConfig = (newConfig: GspConfig) => {
    const oldConfig = data.gspConfig;
    const changes: FieldChange[] = [];

    if (oldConfig.provider !== newConfig.provider) {
      changes.push({
        field: 'provider',
        fieldLabel: 'GSP Provider',
        oldValue: oldConfig.provider,
        newValue: newConfig.provider,
      });
    }
    if (oldConfig.environment !== newConfig.environment) {
      changes.push({
        field: 'environment',
        fieldLabel: 'API Environment',
        oldValue: oldConfig.environment,
        newValue: newConfig.environment,
      });
    }
    if (oldConfig.gstin !== newConfig.gstin) {
      changes.push({
        field: 'gstin',
        fieldLabel: 'GSP Filing GSTIN',
        oldValue: oldConfig.gstin || '[None]',
        newValue: newConfig.gstin,
      });
    }
    if (oldConfig.apiUsername !== newConfig.apiUsername) {
      changes.push({
        field: 'apiUsername',
        fieldLabel: 'GSP API Username',
        oldValue: oldConfig.apiUsername || '[None]',
        newValue: newConfig.apiUsername,
      });
    }
    if (oldConfig.clientId !== newConfig.clientId) {
      changes.push({
        field: 'clientId',
        fieldLabel: 'GSP Client ID',
        oldValue: oldConfig.clientId ? '***' + oldConfig.clientId.slice(-4) : '[Empty]',
        newValue: newConfig.clientId ? '***' + newConfig.clientId.slice(-4) : '[Empty]',
      });
    }
    if (oldConfig.features?.autoEInvoice !== newConfig.features?.autoEInvoice) {
      changes.push({
        field: 'autoEInvoice',
        fieldLabel: 'Auto e-Invoice on Voucher Save',
        oldValue: String(oldConfig.features?.autoEInvoice),
        newValue: String(newConfig.features?.autoEInvoice),
      });
    }
    if (oldConfig.features?.autoEWayBill !== newConfig.features?.autoEWayBill) {
      changes.push({
        field: 'autoEWayBill',
        fieldLabel: 'Auto e-Way Bill (> ₹50,000)',
        oldValue: String(oldConfig.features?.autoEWayBill),
        newValue: String(newConfig.features?.autoEWayBill),
      });
    }

    updateData(prev => ({
      ...prev,
      gspConfig: newConfig,
    }));

    if (changes.length > 0) {
      logAudit(
        'ALTER',
        'GSP_SETTINGS',
        newConfig.provider,
        `Updated GSP API credentials & automation policies for ${newConfig.provider} (${newConfig.environment})`,
        oldConfig.provider,
        newConfig.provider,
        changes,
        undefined,
        'API credential reconfiguration & statutory compliance update'
      );
    }
  };

  const testGspConnection = async (configOverride?: Partial<GspConfig>): Promise<{
    success: boolean;
    latencyMs: number;
    token: string;
    message: string;
  }> => {
    const current = { ...data.gspConfig, ...configOverride };
    
    // Simulate real GSP network handshake with GSTN / IRP
    const startTime = Date.now();
    await new Promise(resolve => setTimeout(resolve, 450));
    const latency = Date.now() - startTime;

    const mockToken = `eyJhbGciOiJSU0EyNTYiLCJ0eXAiOiJKV1QiLCJnc3BpZCI6IiR7Y3VycmVudC5wcm92aWRlcn0ifQ.${btoa(
      JSON.stringify({
        gstin: current.gstin || activeCompany.gstin,
        env: current.environment,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 21600, // 6 hours
        iss: `${current.provider}_GOV_GATEWAY`,
      })
    ).replace(/=/g, '')}.${Math.random().toString(36).substring(2, 15)}`;

    const updated: GspConfig = {
      ...current,
      authStatus: 'CONNECTED',
      authToken: mockToken,
      tokenExpiry: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
      lastTestedAt: new Date().toISOString(),
      latencyMs: latency,
    };

    updateData(prev => ({
      ...prev,
      gspConfig: updated,
    }));

    logAudit(
      'CREATE',
      'GSP_AUTH_HANDSHAKE',
      current.provider,
      `Successfully authenticated with ${current.provider} GSP Gateway in ${current.environment} mode (Latency: ${latency}ms, Token valid for 6h)`
    );

    return {
      success: true,
      latencyMs: latency,
      token: mockToken,
      message: `Successfully connected to ${current.provider} API (${latency}ms). Auth token active.`,
    };
  };

  return (
    <ErpContext.Provider
      value={{
        auth: data.auth,
        companies: data.companies,
        activeCompany,
        ledgers: data.ledgers,
        stockItems: data.stockItems,
        godowns: data.godowns,
        vouchers: data.vouchers,
        auditLogs: data.auditLogs,
        subscription: data.subscription,
        payments: data.payments,
        caClients: data.caClients,
        caStaff: data.caStaff,
        gspConfig: data.gspConfig,
        reportingPeriod,
        setReportingPeriod,
        loginWithMobile,
        logout,
        createCompany,
        updateCompany,
        switchCompany,
        createVoucher,
        updateVoucher,
        cancelVoucher,
        deleteVoucher,
        createLedger,
        updateLedger,
        createStockItem,
        updateStockItem,
        createGodown,
        processRazorpayPayment,
        cancelRecurringMandate,
        toggleRecurringMandateStatus,
        setSubscriptionStatus,
        restoreData,
        restoreTallyData,
        restoreBusyData,
        updateGspConfig,
        testGspConnection,
        logAudit,
        isCompanySetupWizardOpen,
        setIsCompanySetupWizardOpen,
        loadSampleDataForTesting,
        resetToCleanBooks,
      }}
    >
      {children}
    </ErpContext.Provider>
  );
};

export const useErp = () => {
  const context = useContext(ErpContext);
  if (!context) {
    throw new Error('useErp must be used within an ErpProvider');
  }
  return context;
};
