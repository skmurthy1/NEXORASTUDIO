/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Company,
  Ledger,
  StockItem,
  Godown,
  Voucher,
  AuditLogEntry,
  AuthSession,
  SubscriptionState,
  PaymentTransaction,
  CAClient,
  CAStaff,
  GspConfig,
} from '../types/erp';
import {
  INITIAL_COMPANY,
  INITIAL_LEDGERS,
  INITIAL_STOCK_ITEMS,
  INITIAL_GODOWNS,
  INITIAL_VOUCHERS,
  INITIAL_SUBSCRIPTION,
  INITIAL_CA_CLIENTS,
  INITIAL_CA_STAFF,
  INITIAL_AUDIT_LOGS,
  INITIAL_GSP_CONFIG,
} from '../data/seedData';

export const DEMO_MOBILE = '9820045678';
export const ACTIVE_MOBILE_KEY = 'nexora_active_mobile_v1';
export const TENANT_PREFIX = 'nexora_tenant_data_';

const STORAGE_KEYS = {
  COMPANIES: 'nexora_companies_v1',
  ACTIVE_COMPANY_ID: 'nexora_active_company_id_v1',
  LEDGERS: 'nexora_ledgers_v1',
  STOCK_ITEMS: 'nexora_stock_items_v1',
  GODOWNS: 'nexora_godowns_v1',
  VOUCHERS: 'nexora_vouchers_v1',
  AUDIT_LOGS: 'nexora_audit_logs_v1',
  AUTH: 'nexora_auth_session_v1',
  SUBSCRIPTION: 'nexora_subscription_v1',
  PAYMENTS: 'nexora_payments_v1',
  CA_CLIENTS: 'nexora_ca_clients_v1',
  CA_STAFF: 'nexora_ca_staff_v1',
  GSP_CONFIG: 'nexora_gsp_config_v1',
};

export interface StoredErpData {
  companies: Company[];
  activeCompanyId: string;
  ledgers: Ledger[];
  stockItems: StockItem[];
  godowns: Godown[];
  vouchers: Voucher[];
  auditLogs: AuditLogEntry[];
  auth: AuthSession;
  subscription: SubscriptionState;
  payments: PaymentTransaction[];
  caClients: CAClient[];
  caStaff: CAStaff[];
  gspConfig: GspConfig;
  isNewClient?: boolean;
}

export function createCleanChartOfAccounts(companyId: string = 'comp-1'): Ledger[] {
  return [
    {
      id: 'led-cash',
      companyId,
      name: 'Cash in Hand',
      group: 'Cash-in-hand',
      openingBalance: 0,
      currentBalance: 0,
      drCr: 'Dr',
      isSystem: true,
    },
    {
      id: 'led-bank',
      companyId,
      name: 'Bank Current Account',
      group: 'Bank Accounts',
      openingBalance: 0,
      currentBalance: 0,
      drCr: 'Dr',
      isSystem: true,
    },
    {
      id: 'led-sales',
      companyId,
      name: 'Sales Account',
      group: 'Sales Accounts',
      openingBalance: 0,
      currentBalance: 0,
      drCr: 'Cr',
      isSystem: true,
    },
    {
      id: 'led-purchase',
      companyId,
      name: 'Purchase Account',
      group: 'Purchase Accounts',
      openingBalance: 0,
      currentBalance: 0,
      drCr: 'Dr',
      isSystem: true,
    },
    {
      id: 'led-in-cgst',
      companyId,
      name: 'Input CGST',
      group: 'Duties & Taxes',
      openingBalance: 0,
      currentBalance: 0,
      drCr: 'Dr',
      isSystem: true,
    },
    {
      id: 'led-in-sgst',
      companyId,
      name: 'Input SGST',
      group: 'Duties & Taxes',
      openingBalance: 0,
      currentBalance: 0,
      drCr: 'Dr',
      isSystem: true,
    },
    {
      id: 'led-in-igst',
      companyId,
      name: 'Input IGST',
      group: 'Duties & Taxes',
      openingBalance: 0,
      currentBalance: 0,
      drCr: 'Dr',
      isSystem: true,
    },
    {
      id: 'led-out-cgst',
      companyId,
      name: 'Output CGST',
      group: 'Duties & Taxes',
      openingBalance: 0,
      currentBalance: 0,
      drCr: 'Cr',
      isSystem: true,
    },
    {
      id: 'led-out-sgst',
      companyId,
      name: 'Output SGST',
      group: 'Duties & Taxes',
      openingBalance: 0,
      currentBalance: 0,
      drCr: 'Cr',
      isSystem: true,
    },
    {
      id: 'led-out-igst',
      companyId,
      name: 'Output IGST',
      group: 'Duties & Taxes',
      openingBalance: 0,
      currentBalance: 0,
      drCr: 'Cr',
      isSystem: true,
    },
    {
      id: 'led-round-off',
      companyId,
      name: 'Round Off',
      group: 'Indirect Incomes',
      openingBalance: 0,
      currentBalance: 0,
      drCr: 'Cr',
      isSystem: true,
    },
    {
      id: 'led-capital',
      companyId,
      name: 'Capital Account',
      group: 'Capital Account',
      openingBalance: 0,
      currentBalance: 0,
      drCr: 'Cr',
      isSystem: true,
    },
    {
      id: 'led-pnl',
      companyId,
      name: 'Profit & Loss A/c',
      group: 'Primary',
      openingBalance: 0,
      currentBalance: 0,
      drCr: 'Cr',
      isSystem: true,
    },
  ];
}

export function hasTenantData(mobile: string): boolean {
  try {
    const cleanMobile = mobile.replace(/\D/g, '');
    if (!cleanMobile) return false;
    return !!localStorage.getItem(`${TENANT_PREFIX}${cleanMobile}`);
  } catch {
    return false;
  }
}

export function loadTenantData(mobile: string): StoredErpData | null {
  try {
    const cleanMobile = mobile.replace(/\D/g, '');
    const raw = localStorage.getItem(`${TENANT_PREFIX}${cleanMobile}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load tenant data for', mobile, e);
  }
  return null;
}

export function saveTenantData(mobile: string, data: any) {
  try {
    const cleanMobile = mobile.replace(/\D/g, '');
    if (cleanMobile) {
      localStorage.setItem(`${TENANT_PREFIX}${cleanMobile}`, JSON.stringify(data));
      localStorage.setItem(ACTIVE_MOBILE_KEY, cleanMobile);
    }
  } catch (e) {
    console.error('Failed to save tenant data for', mobile, e);
  }
}

export function createFreshTenantData(params: {
  mobile: string;
  name?: string;
  businessName?: string;
  email?: string;
  role?: any;
}) {
  const cleanMobile = params.mobile.replace(/\D/g, '');
  const companyId = `comp-${Date.now()}`;
  const companyName = params.businessName?.trim() || 'My Business Enterprises';
  const cleanComp: Company = {
    id: companyId,
    name: companyName,
    tradeName: companyName,
    gstin: '',
    pan: '',
    state: 'Maharashtra',
    stateCode: '27',
    address: '',
    pincode: '',
    phone: cleanMobile,
    email: params.email?.trim() || '',
    bankName: 'State Bank of India',
    accountNumber: '',
    ifsc: '',
    branch: '',
    upiId: '',
    defaultTerms: '1. Payment due within 30 days.\n2. Goods once sold will not be returned.',
    defaultNotes: 'Thank you for your business.',
    registrationType: 'REGULAR',
    filingFrequency: 'MONTHLY',
    financialYear: '2026-27',
    booksBeginningDate: '2026-04-01',
    voucherPrefix: 'INV/26-27/',
    autoVoucherNumbering: true,
  };

  const freshSubscription: SubscriptionState = {
    tier: 'PRO',
    cycle: 'ANNUAL',
    status: 'TRIAL',
    validTill: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    amountPaid: 0,
    lastPaymentDate: new Date().toISOString().split('T')[0],
    invoiceNumber: 'TRIAL-ACCESS-14D',
    features: {
      unlimitedVouchers: true,
      allGstReturns: true,
      eWayBillAndEInvoice: true,
      whatsAppIntegration: true,
      tallyXmlSync: true,
      multiGodowns: true,
      caWorkspace: true,
    },
  };

  const freshAuth: AuthSession = {
    mobile: cleanMobile,
    email: params.email?.trim(),
    emailConfirmed: true,
    name: params.name?.trim() || 'Business Owner',
    businessName: companyName,
    role: params.role || 'OWNER',
    isLoggedIn: true,
    lastLoginTime: new Date().toISOString(),
  };

  return {
    companies: [cleanComp],
    activeCompanyId: companyId,
    ledgers: createCleanChartOfAccounts(companyId),
    stockItems: [] as StockItem[], // Zero old products!
    godowns: [
      {
        id: 'godown-main',
        companyId,
        name: 'Main Location / Head Office',
        location: 'Primary Location',
        isDefault: true,
      },
    ],
    vouchers: [] as Voucher[], // Zero old transactions!
    auditLogs: [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'CREATE' as const,
        voucherType: 'COMPANY',
        voucherNumber: 'SETUP',
        user: params.name || 'Owner',
        userMobile: `+91 ${cleanMobile}`,
        userRole: params.role || 'OWNER',
        details: `Fresh business account initiated for ${companyName}. Ready for company profile setup.`,
      },
    ],
    auth: freshAuth,
    subscription: freshSubscription,
    payments: [] as PaymentTransaction[],
    caClients: [] as CAClient[],
    caStaff: [] as CAStaff[],
    gspConfig: INITIAL_GSP_CONFIG,
    isNewClient: true,
  };
}

export function loadStoredData(): StoredErpData {
  try {
    const activeMobile = localStorage.getItem(ACTIVE_MOBILE_KEY);
    if (activeMobile && activeMobile !== DEMO_MOBILE) {
      const tenantData = loadTenantData(activeMobile);
      if (tenantData && tenantData.companies && tenantData.auth) {
        return tenantData;
      }
    }

    const rawCompanies = localStorage.getItem(STORAGE_KEYS.COMPANIES);
    const companies: Company[] = rawCompanies ? JSON.parse(rawCompanies) : [INITIAL_COMPANY];

    const rawActiveCompId = localStorage.getItem(STORAGE_KEYS.ACTIVE_COMPANY_ID);
    const activeCompanyId: string = rawActiveCompId || companies[0].id;

    const rawLedgers = localStorage.getItem(STORAGE_KEYS.LEDGERS);
    const ledgers: Ledger[] = rawLedgers ? JSON.parse(rawLedgers) : INITIAL_LEDGERS;

    const rawStock = localStorage.getItem(STORAGE_KEYS.STOCK_ITEMS);
    const stockItems: StockItem[] = rawStock ? JSON.parse(rawStock) : INITIAL_STOCK_ITEMS;

    const rawGodowns = localStorage.getItem(STORAGE_KEYS.GODOWNS);
    const godowns: Godown[] = rawGodowns ? JSON.parse(rawGodowns) : INITIAL_GODOWNS;

    const rawVouchers = localStorage.getItem(STORAGE_KEYS.VOUCHERS);
    const vouchers: Voucher[] = rawVouchers ? JSON.parse(rawVouchers) : INITIAL_VOUCHERS;

    const rawAuditLogs = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    const auditLogs: AuditLogEntry[] = rawAuditLogs
      ? JSON.parse(rawAuditLogs)
      : INITIAL_AUDIT_LOGS;

    const rawAuth = localStorage.getItem(STORAGE_KEYS.AUTH);
    const auth: AuthSession = rawAuth
      ? JSON.parse(rawAuth)
      : {
          mobile: '9820045678',
          name: 'S. K. Murthy',
          businessName: 'Bharat Electronics & Systems Pvt Ltd',
          role: 'OWNER',
          isLoggedIn: false,
          lastLoginTime: '',
        };

    const rawSub = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION);
    const subscription: SubscriptionState = rawSub ? JSON.parse(rawSub) : INITIAL_SUBSCRIPTION;

    const rawPay = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    const payments: PaymentTransaction[] = rawPay
      ? JSON.parse(rawPay)
      : [
          {
            id: 'pay-seed-1',
            date: '2026-04-30',
            amount: 11990,
            taxableAmount: 10161.02,
            gstAmount: 1828.98,
            plan: 'PRO',
            cycle: 'ANNUAL',
            method: 'UPI',
            referenceId: 'UPI-RAZORPAY-88492019',
          },
        ];

    const rawCaClients = localStorage.getItem(STORAGE_KEYS.CA_CLIENTS);
    const caClients: CAClient[] = rawCaClients ? JSON.parse(rawCaClients) : INITIAL_CA_CLIENTS;

    const rawCaStaff = localStorage.getItem(STORAGE_KEYS.CA_STAFF);
    const caStaff: CAStaff[] = rawCaStaff ? JSON.parse(rawCaStaff) : INITIAL_CA_STAFF;

    const rawGsp = localStorage.getItem(STORAGE_KEYS.GSP_CONFIG);
    const gspConfig: GspConfig = rawGsp ? JSON.parse(rawGsp) : INITIAL_GSP_CONFIG;

    return {
      companies,
      activeCompanyId,
      ledgers,
      stockItems,
      godowns,
      vouchers,
      auditLogs,
      auth,
      subscription,
      payments,
      caClients,
      caStaff,
      gspConfig,
      isNewClient: false,
    };
  } catch (err) {
    console.error('Failed to load data from storage, fallback to defaults', err);
    return {
      companies: [INITIAL_COMPANY],
      activeCompanyId: INITIAL_COMPANY.id,
      ledgers: INITIAL_LEDGERS,
      stockItems: INITIAL_STOCK_ITEMS,
      godowns: INITIAL_GODOWNS,
      vouchers: INITIAL_VOUCHERS,
      auditLogs: [],
      auth: {
        mobile: '9820045678',
        name: 'S. K. Murthy',
        businessName: 'Bharat Electronics',
        role: 'OWNER' as const,
        isLoggedIn: true,
        lastLoginTime: new Date().toISOString(),
      },
      subscription: INITIAL_SUBSCRIPTION,
      payments: [],
      caClients: INITIAL_CA_CLIENTS,
      caStaff: INITIAL_CA_STAFF,
      gspConfig: INITIAL_GSP_CONFIG,
      isNewClient: false,
    };
  }
}

export function saveStoredData(data: {
  companies?: Company[];
  activeCompanyId?: string;
  ledgers?: Ledger[];
  stockItems?: StockItem[];
  godowns?: Godown[];
  vouchers?: Voucher[];
  auditLogs?: AuditLogEntry[];
  auth?: AuthSession;
  subscription?: SubscriptionState;
  payments?: PaymentTransaction[];
  caClients?: CAClient[];
  caStaff?: CAStaff[];
  gspConfig?: GspConfig;
  isNewClient?: boolean;
}) {
  try {
    const cleanMobile = data.auth?.mobile?.replace(/\D/g, '');
    if (cleanMobile && cleanMobile !== DEMO_MOBILE) {
      saveTenantData(cleanMobile, data);
      return;
    }

    if (data.companies) localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(data.companies));
    if (data.activeCompanyId) localStorage.setItem(STORAGE_KEYS.ACTIVE_COMPANY_ID, data.activeCompanyId);
    if (data.ledgers) localStorage.setItem(STORAGE_KEYS.LEDGERS, JSON.stringify(data.ledgers));
    if (data.stockItems) localStorage.setItem(STORAGE_KEYS.STOCK_ITEMS, JSON.stringify(data.stockItems));
    if (data.godowns) localStorage.setItem(STORAGE_KEYS.GODOWNS, JSON.stringify(data.godowns));
    if (data.vouchers) localStorage.setItem(STORAGE_KEYS.VOUCHERS, JSON.stringify(data.vouchers));
    if (data.auditLogs) localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(data.auditLogs));
    if (data.auth) localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(data.auth));
    if (data.subscription) localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION, JSON.stringify(data.subscription));
    if (data.payments) localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(data.payments));
    if (data.caClients) localStorage.setItem(STORAGE_KEYS.CA_CLIENTS, JSON.stringify(data.caClients));
    if (data.caStaff) localStorage.setItem(STORAGE_KEYS.CA_STAFF, JSON.stringify(data.caStaff));
    if (data.gspConfig) localStorage.setItem(STORAGE_KEYS.GSP_CONFIG, JSON.stringify(data.gspConfig));
  } catch (err) {
    console.error('Failed to save to localStorage', err);
  }
}

export function generateTallyXmlBackup(company: Company, ledgers: Ledger[], vouchers: Voucher[]): string {
  const xmlLines: string[] = [
    '<ENVELOPE>',
    '  <HEADER>',
    '    <TALLYREQUEST>Export Data</TALLYREQUEST>',
    '    <TYPE>Data</TYPE>',
    '    <ID>All Masters and Vouchers</ID>',
    '  </HEADER>',
    '  <BODY>',
    '    <IMPORTDATA>',
    '      <REQUESTDESC>',
    '        <REPORTNAME>All Masters and Vouchers</REPORTNAME>',
    '        <STATICVARIABLES>',
    `          <SVCURRENTCOMPANY>${company.name}</SVCURRENTCOMPANY>`,
    '        </STATICVARIABLES>',
    '      </REQUESTDESC>',
    '      <REQUESTDATA>',
  ];

  // Export Ledgers
  ledgers.forEach(led => {
    xmlLines.push('        <TALLYMESSAGE xmlns:UDF="TallyUDF">');
    xmlLines.push(`          <LEDGER NAME="${led.name}" ACTION="Create">`);
    xmlLines.push(`            <NAME>${led.name}</NAME>`);
    xmlLines.push(`            <PARENT>${led.group}</PARENT>`);
    xmlLines.push(`            <OPENINGBALANCE>${led.openingBalance}</OPENINGBALANCE>`);
    if (led.gstin) xmlLines.push(`            <PARTYGSTIN>${led.gstin}</PARTYGSTIN>`);
    if (led.state) xmlLines.push(`            <LEDSTATENAME>${led.state}</LEDSTATENAME>`);
    xmlLines.push('          </LEDGER>');
    xmlLines.push('        </TALLYMESSAGE>');
  });

  // Export Vouchers
  vouchers.forEach(vch => {
    xmlLines.push('        <TALLYMESSAGE xmlns:UDF="TallyUDF">');
    xmlLines.push(`          <VOUCHER VCHTYPE="${vch.voucherType}" ACTION="Create">`);
    xmlLines.push(`            <DATE>${vch.date.replace(/-/g, '')}</DATE>`);
    xmlLines.push(`            <VOUCHERTYPENAME>${vch.voucherType}</VOUCHERTYPENAME>`);
    xmlLines.push(`            <VOUCHERNUMBER>${vch.voucherNumber}</VOUCHERNUMBER>`);
    xmlLines.push(`            <PARTYLEDGERNAME>${vch.partyName || ''}</PARTYLEDGERNAME>`);
    xmlLines.push(`            <NARRATION>${vch.narration || ''}</NARRATION>`);
    xmlLines.push(`            <EFFECTIVEDATE>${vch.date.replace(/-/g, '')}</EFFECTIVEDATE>`);
    
    // Ledger entries
    vch.ledgerEntries.forEach(entry => {
      xmlLines.push('            <ALLLEDGERENTRIES.LIST>');
      xmlLines.push(`              <LEDGERNAME>${entry.ledgerName}</LEDGERNAME>`);
      xmlLines.push(`              <ISDEEMEDPOSITIVE>${entry.drCr === 'Dr' ? 'Yes' : 'No'}</ISDEEMEDPOSITIVE>`);
      xmlLines.push(`              <AMOUNT>${entry.drCr === 'Dr' ? -entry.amount : entry.amount}</AMOUNT>`);
      xmlLines.push('            </ALLLEDGERENTRIES.LIST>');
    });

    xmlLines.push('          </VOUCHER>');
    xmlLines.push('        </TALLYMESSAGE>');
  });

  xmlLines.push('      </REQUESTDATA>');
  xmlLines.push('    </IMPORTDATA>');
  xmlLines.push('  </BODY>');
  xmlLines.push('</ENVELOPE>');

  return xmlLines.join('\n');
}

export function exportFullJsonBackup(data: {
  companies: Company[];
  ledgers: Ledger[];
  stockItems: StockItem[];
  godowns: Godown[];
  vouchers: Voucher[];
  auditLogs: AuditLogEntry[];
  subscription: SubscriptionState;
}) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `NexoraBooks_Backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseTallyXmlBackup(xmlStr: string): {
  success: boolean;
  companyName?: string;
  ledgers: Partial<Ledger>[];
  vouchers: Partial<Voucher>[];
  message: string;
} {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlStr, 'text/xml');
    const parseError = doc.querySelector('parsererror');
    if (parseError) {
      return { success: false, ledgers: [], vouchers: [], message: 'XML parsing error: ' + parseError.textContent };
    }

    const companyName = doc.querySelector('SVCURRENTCOMPANY')?.textContent || doc.querySelector('COMPANY NAME')?.textContent || undefined;
    
    // Parse Ledgers
    const ledgerEls = doc.querySelectorAll('LEDGER');
    const parsedLedgers: Partial<Ledger>[] = [];
    ledgerEls.forEach(el => {
      const name = el.getAttribute('NAME') || el.querySelector('NAME')?.textContent;
      if (!name) return;
      const parent = el.querySelector('PARENT')?.textContent || 'Sundry Debtors';
      const opBalStr = el.querySelector('OPENINGBALANCE')?.textContent || '0';
      const opBal = Math.abs(parseFloat(opBalStr) || 0);
      const gstin = el.querySelector('PARTYGSTIN')?.textContent || undefined;
      const state = el.querySelector('LEDSTATENAME')?.textContent || undefined;

      parsedLedgers.push({
        id: `led-tally-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name,
        group: parent as any,
        openingBalance: opBal,
        currentBalance: opBal,
        drCr: parseFloat(opBalStr) < 0 ? 'Cr' : 'Dr',
        gstin,
        state,
        stateCode: gstin ? gstin.slice(0, 2) : '27',
      });
    });

    // Parse Vouchers
    const voucherEls = doc.querySelectorAll('VOUCHER');
    const parsedVouchers: Partial<Voucher>[] = [];
    voucherEls.forEach(el => {
      const vchTypeRaw = el.getAttribute('VCHTYPE') || el.querySelector('VOUCHERTYPENAME')?.textContent || 'Sales';
      const vchNumber = el.querySelector('VOUCHERNUMBER')?.textContent || `VCH-${Date.now()}`;
      const rawDate = el.querySelector('DATE')?.textContent || '';
      let date = new Date().toISOString().split('T')[0];
      if (rawDate.length === 8) {
        date = `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`;
      }
      const partyName = el.querySelector('PARTYLEDGERNAME')?.textContent || '';
      const narration = el.querySelector('NARRATION')?.textContent || 'Imported from Tally Prime';

      let totalAmount = 0;
      const ledgerEntries: any[] = [];
      const entryEls = el.querySelectorAll('ALLLEDGERENTRIES\\.LIST, ALLLEDGERENTRIES');
      entryEls.forEach(entryEl => {
        const ledName = entryEl.querySelector('LEDGERNAME')?.textContent || 'Unknown';
        const amtStr = entryEl.querySelector('AMOUNT')?.textContent || '0';
        const amtNum = parseFloat(amtStr) || 0;
        const isDeemedPos = entryEl.querySelector('ISDEEMEDPOSITIVE')?.textContent?.toLowerCase() === 'yes';
        const amount = Math.abs(amtNum);
        if (amount > totalAmount) totalAmount = amount;
        ledgerEntries.push({
          id: `entry-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          ledgerId: 'imported',
          ledgerName: ledName,
          amount,
          drCr: amtNum < 0 || isDeemedPos ? 'Dr' : 'Cr',
        });
      });

      let mappedType: Voucher['voucherType'] = 'SALES';
      const vt = vchTypeRaw.toUpperCase();
      if (vt.includes('PURCHASE')) mappedType = 'PURCHASE';
      else if (vt.includes('PAYMENT')) mappedType = 'PAYMENT';
      else if (vt.includes('RECEIPT')) mappedType = 'RECEIPT';
      else if (vt.includes('CONTRA')) mappedType = 'CONTRA';
      else if (vt.includes('JOURNAL')) mappedType = 'JOURNAL';
      else if (vt.includes('CREDIT')) mappedType = 'CREDIT_NOTE';
      else if (vt.includes('DEBIT')) mappedType = 'DEBIT_NOTE';

      parsedVouchers.push({
        id: `vch-tally-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        voucherNumber: vchNumber,
        voucherType: mappedType,
        date,
        partyName,
        narration,
        grandTotal: totalAmount || 10000,
        taxableTotal: totalAmount ? Math.round(totalAmount / 1.18 * 100) / 100 : 8474.58,
        cgstTotal: totalAmount ? Math.round((totalAmount - totalAmount / 1.18) / 2 * 100) / 100 : 762.71,
        sgstTotal: totalAmount ? Math.round((totalAmount - totalAmount / 1.18) / 2 * 100) / 100 : 762.71,
        igstTotal: 0,
        roundOff: 0,
        status: 'ACTIVE',
        items: [],
        ledgerEntries: ledgerEntries.length > 0 ? ledgerEntries : [
          { id: '1', ledgerId: 'p', ledgerName: partyName || 'Party', amount: totalAmount || 10000, drCr: 'Dr' },
          { id: '2', ledgerId: 's', ledgerName: 'Sales Account', amount: totalAmount || 10000, drCr: 'Cr' },
        ],
      });
    });

    return {
      success: true,
      companyName,
      ledgers: parsedLedgers,
      vouchers: parsedVouchers,
      message: `Successfully parsed Tally Prime XML: ${parsedLedgers.length} ledgers and ${parsedVouchers.length} vouchers ready to restore.`,
    };
  } catch (err: any) {
    return {
      success: false,
      ledgers: [],
      vouchers: [],
      message: 'Failed to parse Tally XML file: ' + (err?.message || 'Invalid format'),
    };
  }
}

export function generateBusyXmlBackup(
  company: Company,
  ledgers: Ledger[],
  stockItems: StockItem[],
  vouchers: Voucher[]
): string {
  const xml: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<BUSYDATA version="21.0">',
    '  <COMPANY>',
    `    <NAME>${company.name}</NAME>`,
    `    <TRADENAME>${company.tradeName || company.name}</TRADENAME>`,
    `    <GSTIN>${company.gstin}</GSTIN>`,
    `    <STATE>${company.state}</STATE>`,
    `    <FINANCIALYEAR>${company.financialYear}</FINANCIALYEAR>`,
    '  </COMPANY>',
    '  <ACCOUNTS>',
  ];

  ledgers.forEach(l => {
    xml.push('    <ACCOUNT>');
    xml.push(`      <NAME>${l.name}</NAME>`);
    xml.push(`      <GROUP>${l.group}</GROUP>`);
    xml.push(`      <OP_BAL>${l.openingBalance}</OP_BAL>`);
    xml.push(`      <OP_BAL_TYPE>${l.drCr}</OP_BAL_TYPE>`);
    if (l.gstin) xml.push(`      <GSTIN>${l.gstin}</GSTIN>`);
    if (l.state) xml.push(`      <STATE>${l.state}</STATE>`);
    xml.push('    </ACCOUNT>');
  });
  xml.push('  </ACCOUNTS>');

  xml.push('  <ITEMS>');
  stockItems.forEach(it => {
    xml.push('    <ITEM>');
    xml.push(`      <NAME>${it.name}</NAME>`);
    xml.push(`      <HSN>${it.hsnCode}</HSN>`);
    xml.push(`      <UNIT>${it.unit}</UNIT>`);
    xml.push(`      <GST_RATE>${it.gstRate}</GST_RATE>`);
    xml.push(`      <SALE_PRICE>${it.salePrice}</SALE_PRICE>`);
    xml.push(`      <PUR_PRICE>${it.purchasePrice}</PUR_PRICE>`);
    xml.push(`      <OPENING_QTY>${it.openingStock}</OPENING_QTY>`);
    xml.push('    </ITEM>');
  });
  xml.push('  </ITEMS>');

  xml.push('  <VOUCHERS>');
  vouchers.forEach(v => {
    xml.push('    <VOUCHER>');
    xml.push(`      <TYPE>${v.voucherType}</TYPE>`);
    xml.push(`      <VCH_NO>${v.voucherNumber}</VCH_NO>`);
    xml.push(`      <DATE>${v.date}</DATE>`);
    xml.push(`      <PARTY>${v.partyName || ''}</PARTY>`);
    xml.push(`      <AMOUNT>${v.grandTotal}</AMOUNT>`);
    xml.push(`      <NARRATION>${v.narration || ''}</NARRATION>`);
    xml.push('    </VOUCHER>');
  });
  xml.push('  </VOUCHERS>');
  xml.push('</BUSYDATA>');

  return xml.join('\n');
}

export function parseBusyBackup(contentStr: string): {
  success: boolean;
  companyName?: string;
  ledgers: Partial<Ledger>[];
  stockItems: Partial<StockItem>[];
  vouchers: Partial<Voucher>[];
  message: string;
} {
  try {
    const trimmed = contentStr.trim();
    if (!trimmed) {
      return { success: false, ledgers: [], stockItems: [], vouchers: [], message: 'Backup file is empty.' };
    }

    // --- ENGINE 1: BUSY JSON FORMAT ---
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const data = JSON.parse(trimmed);
        const accounts = data.accounts || data.ACCOUNTS || data.ledgers || [];
        const items = data.items || data.ITEMS || data.stockItems || [];
        const vouchers = data.vouchers || data.VOUCHERS || [];

        return {
          success: true,
          companyName: data.company?.name || data.COMPANY?.NAME || undefined,
          ledgers: accounts.map((a: any) => ({
            id: `led-busy-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            name: a.name || a.NAME || 'Unnamed Account',
            group: a.group || a.GROUP || 'Sundry Debtors',
            openingBalance: Math.abs(parseFloat(a.opBal || a.OP_BAL || '0')),
            currentBalance: Math.abs(parseFloat(a.opBal || a.OP_BAL || '0')),
            drCr: (a.opBalType || a.OP_BAL_TYPE || 'Dr') as any,
            gstin: a.gstin || a.GSTIN || undefined,
            state: a.state || a.STATE || undefined,
            stateCode: (a.gstin || a.GSTIN)?.slice(0, 2) || '27',
          })),
          stockItems: items.map((it: any) => ({
            id: `item-busy-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            name: it.name || it.NAME || 'Unnamed Item',
            hsnCode: it.hsn || it.HSN || '8532',
            unit: it.unit || it.UNIT || 'NOS',
            gstRate: parseFloat(it.gstRate || it.GST_RATE || '18'),
            salePrice: parseFloat(it.salePrice || it.SALE_PRICE || '0'),
            purchasePrice: parseFloat(it.purchasePrice || it.PUR_PRICE || '0'),
            openingStock: parseFloat(it.openingQty || it.OPENING_QTY || '0'),
            currentStock: parseFloat(it.openingQty || it.OPENING_QTY || '0'),
          })),
          vouchers: vouchers.map((v: any) => ({
            id: `vch-busy-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            voucherNumber: v.vchNo || v.VCH_NO || `BUSY-${Date.now()}`,
            voucherType: (v.type || v.TYPE || 'SALES').toUpperCase() as any,
            date: v.date || v.DATE || new Date().toISOString().split('T')[0],
            partyName: v.party || v.PARTY || '',
            narration: v.narration || v.NARRATION || 'Imported from Busy Accounting',
            grandTotal: parseFloat(v.amount || v.AMOUNT || '0') || 10000,
            taxableTotal: Math.round((parseFloat(v.amount || v.AMOUNT || '0') || 10000) / 1.18 * 100) / 100,
            cgstTotal: Math.round(((parseFloat(v.amount || v.AMOUNT || '0') || 10000) - (parseFloat(v.amount || v.AMOUNT || '0') || 10000) / 1.18) / 2 * 100) / 100,
            sgstTotal: Math.round(((parseFloat(v.amount || v.AMOUNT || '0') || 10000) - (parseFloat(v.amount || v.AMOUNT || '0') || 10000) / 1.18) / 2 * 100) / 100,
            igstTotal: 0,
            roundOff: 0,
            status: 'ACTIVE',
            items: [],
            ledgerEntries: [],
          })),
          message: `Successfully parsed Busy JSON backup: ${accounts.length} accounts, ${items.length} items, and ${vouchers.length} vouchers.`,
        };
      } catch {
        // Fall through to other engines
      }
    }

    // --- ENGINE 2: EMBEDDED OR PURE BUSY XML (<BUSYDATA>, <DATA>, etc.) ---
    const xmlStartIdx = contentStr.indexOf('<');
    if (xmlStartIdx !== -1 && (contentStr.includes('<BUSYDATA') || contentStr.includes('<ACCOUNTS') || contentStr.includes('<COMPANY') || contentStr.includes('<ACCOUNT>'))) {
      const xmlChunk = contentStr.substring(xmlStartIdx);
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlChunk, 'text/xml');
      const parseError = doc.querySelector('parsererror');

      if (!parseError) {
        const companyName = doc.querySelector('COMPANY > NAME')?.textContent || doc.querySelector('NAME')?.textContent || undefined;
        
        // Accounts
        const accountEls = doc.querySelectorAll('ACCOUNT');
        const parsedLedgers: Partial<Ledger>[] = [];
        accountEls.forEach(el => {
          const name = el.querySelector('NAME')?.textContent;
          if (!name) return;
          const group = el.querySelector('GROUP')?.textContent || 'Sundry Debtors';
          const opBal = parseFloat(el.querySelector('OP_BAL')?.textContent || '0') || 0;
          const drCr = (el.querySelector('OP_BAL_TYPE')?.textContent || 'Dr') as any;
          const gstin = el.querySelector('GSTIN')?.textContent || undefined;
          const state = el.querySelector('STATE')?.textContent || undefined;

          parsedLedgers.push({
            id: `led-busy-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            name,
            group: group as any,
            openingBalance: opBal,
            currentBalance: opBal,
            drCr,
            gstin,
            state,
            stateCode: gstin ? gstin.slice(0, 2) : '27',
          });
        });

        // Items
        const itemEls = doc.querySelectorAll('ITEM');
        const parsedItems: Partial<StockItem>[] = [];
        itemEls.forEach(el => {
          const name = el.querySelector('NAME')?.textContent;
          if (!name) return;
          const hsn = el.querySelector('HSN')?.textContent || '8532';
          const unit = el.querySelector('UNIT')?.textContent || 'NOS';
          const gstRate = parseFloat(el.querySelector('GST_RATE')?.textContent || '18') || 18;
          const salePrice = parseFloat(el.querySelector('SALE_PRICE')?.textContent || '0') || 0;
          const purchasePrice = parseFloat(el.querySelector('PUR_PRICE')?.textContent || '0') || 0;
          const openingStock = parseFloat(el.querySelector('OPENING_QTY')?.textContent || '0') || 0;

          parsedItems.push({
            id: `item-busy-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            name,
            hsnCode: hsn,
            unit,
            gstRate,
            salePrice,
            purchasePrice,
            openingStock,
            currentStock: openingStock,
          });
        });

        // Vouchers
        const voucherEls = doc.querySelectorAll('VOUCHER');
        const parsedVouchers: Partial<Voucher>[] = [];
        voucherEls.forEach(el => {
          const vchNo = el.querySelector('VCH_NO')?.textContent || `BUSY-${Date.now()}`;
          const vchType = el.querySelector('TYPE')?.textContent || 'Sales';
          const date = el.querySelector('DATE')?.textContent || new Date().toISOString().split('T')[0];
          const party = el.querySelector('PARTY')?.textContent || '';
          const amount = parseFloat(el.querySelector('AMOUNT')?.textContent || '0') || 10000;
          const narration = el.querySelector('NARRATION')?.textContent || 'Imported from Busy Accounting';

          let mappedType: Voucher['voucherType'] = 'SALES';
          const vt = vchType.toUpperCase();
          if (vt.includes('PURCHASE')) mappedType = 'PURCHASE';
          else if (vt.includes('PAYMENT')) mappedType = 'PAYMENT';
          else if (vt.includes('RECEIPT')) mappedType = 'RECEIPT';
          else if (vt.includes('CONTRA')) mappedType = 'CONTRA';
          else if (vt.includes('JOURNAL')) mappedType = 'JOURNAL';

          parsedVouchers.push({
            id: `vch-busy-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            voucherNumber: vchNo,
            voucherType: mappedType,
            date,
            partyName: party,
            narration,
            grandTotal: amount,
            taxableTotal: Math.round(amount / 1.18 * 100) / 100,
            cgstTotal: Math.round((amount - amount / 1.18) / 2 * 100) / 100,
            sgstTotal: Math.round((amount - amount / 1.18) / 2 * 100) / 100,
            igstTotal: 0,
            roundOff: 0,
            status: 'ACTIVE',
            items: [],
            ledgerEntries: [],
          });
        });

        if (parsedLedgers.length > 0 || parsedItems.length > 0 || parsedVouchers.length > 0) {
          return {
            success: true,
            companyName,
            ledgers: parsedLedgers,
            stockItems: parsedItems,
            vouchers: parsedVouchers,
            message: `Successfully parsed Busy XML backup: ${parsedLedgers.length} accounts, ${parsedItems.length} items, and ${parsedVouchers.length} vouchers ready to restore.`,
          };
        }
      }
    }

    // --- ENGINE 3: BUSY .DAT / TEXT / DELIMITED FORMAT (FIXNOW_20261030_MSAll.DAT) ---
    // Handles sections like [COMPANY], [ACCOUNTS], [ITEMS], [VOUCHERS] or pipe/comma/tab lines
    const lines = contentStr.split(/\r?\n/);
    let companyName: string | undefined;
    const parsedLedgers: Partial<Ledger>[] = [];
    const parsedItems: Partial<StockItem>[] = [];
    const parsedVouchers: Partial<Voucher>[] = [];

    let currentSection = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('#') || line.startsWith('//') || line.startsWith(';')) {
        continue;
      }

      // Check section headers: e.g. [COMPANY], [ACCOUNT_MASTERS], [ACCOUNTS], [ITEM_MASTERS], [ITEMS], [TRANSACTIONS], [VOUCHERS]
      const sectionMatch = line.match(/^\[([A-Z0-9_\s-]+)\]$/i);
      if (sectionMatch) {
        currentSection = sectionMatch[1].toUpperCase().replace(/\s+/g, '_');
        continue;
      }

      // 1. Company Metadata
      if (currentSection.includes('COMPANY') || (!currentSection && (line.startsWith('NAME=') || line.startsWith('COMPANY=')))) {
        if (line.includes('=')) {
          const [key, ...rest] = line.split('=');
          const val = rest.join('=').trim();
          if (key.trim().toUpperCase() === 'NAME' || key.trim().toUpperCase() === 'COMPANY') {
            companyName = val;
          }
        } else if (line.includes('|')) {
          const parts = line.split('|');
          if (parts[0] && !companyName) companyName = parts[0].trim();
        }
        continue;
      }

      // Split line by pipe '|' or tab '\t' or comma ','
      let delimiter = '|';
      if (!line.includes('|')) {
        if (line.includes('\t')) delimiter = '\t';
        else if (line.includes(',') && !line.startsWith('{')) delimiter = ',';
      }

      const parts = line.split(delimiter).map(p => p.trim());
      if (parts.length < 2) continue;

      // 2. Account Section or 'ACC' prefix
      if (
        currentSection.includes('ACCOUNT') ||
        currentSection.includes('LEDGER') ||
        parts[0].toUpperCase() === 'ACC' ||
        parts[0].toUpperCase() === 'ACCOUNT' ||
        parts[0].toUpperCase() === 'M_ACC'
      ) {
        const offset = ['ACC', 'ACCOUNT', 'M_ACC'].includes(parts[0].toUpperCase()) ? 1 : 0;
        const name = parts[offset];
        if (name && name !== 'AccountName' && name !== 'NAME') {
          const group = parts[offset + 1] || 'Sundry Debtors';
          const opBalRaw = parts[offset + 2] || '0';
          const opBal = Math.abs(parseFloat(opBalRaw.replace(/[^0-9.-]/g, '')) || 0);
          const drCr = (parts[offset + 3] || (opBalRaw.includes('Cr') ? 'Cr' : 'Dr')).toUpperCase().includes('CR') ? 'Cr' : 'Dr';
          const gstin = parts[offset + 4] && parts[offset + 4].length === 15 ? parts[offset + 4].toUpperCase() : undefined;
          const state = parts[offset + 5] || undefined;

          parsedLedgers.push({
            id: `led-busy-${Date.now()}-${parsedLedgers.length}-${Math.random().toString(36).substring(2, 5)}`,
            name,
            group: group as any,
            openingBalance: opBal,
            currentBalance: opBal,
            drCr: drCr as any,
            gstin,
            state,
            stateCode: gstin ? gstin.slice(0, 2) : '27',
          });
        }
        continue;
      }

      // 3. Item Section or 'ITM' prefix
      if (
        currentSection.includes('ITEM') ||
        currentSection.includes('STOCK') ||
        parts[0].toUpperCase() === 'ITM' ||
        parts[0].toUpperCase() === 'ITEM' ||
        parts[0].toUpperCase() === 'M_ITM'
      ) {
        const offset = ['ITM', 'ITEM', 'M_ITM'].includes(parts[0].toUpperCase()) ? 1 : 0;
        const name = parts[offset];
        if (name && name !== 'ItemName' && name !== 'NAME') {
          const group = parts[offset + 1] || 'General';
          const unit = parts[offset + 2] || 'NOS';
          const hsn = parts[offset + 3] || '8412';
          const gstRate = parseFloat(parts[offset + 4]) || 18;
          const salePrice = parseFloat(parts[offset + 5]) || 0;
          const purchasePrice = parseFloat(parts[offset + 6]) || 0;
          const openingStock = parseFloat(parts[offset + 7]) || 0;

          parsedItems.push({
            id: `item-busy-${Date.now()}-${parsedItems.length}-${Math.random().toString(36).substring(2, 5)}`,
            name,
            group,
            hsnCode: hsn,
            unit,
            gstRate,
            salePrice,
            purchasePrice,
            openingStock,
            currentStock: openingStock,
          });
        }
        continue;
      }

      // 4. Voucher / Transactions Section or 'VCH' prefix
      if (
        currentSection.includes('VOUCHER') ||
        currentSection.includes('TRANSACTION') ||
        parts[0].toUpperCase() === 'VCH' ||
        parts[0].toUpperCase() === 'VOUCHER' ||
        parts[0].toUpperCase() === 'T_VCH' ||
        ['SALES', 'PURCHASE', 'PAYMENT', 'RECEIPT', 'CONTRA', 'JOURNAL'].includes(parts[0].toUpperCase())
      ) {
        let vchTypeRaw = parts[0];
        let offset = 1;
        if (['VCH', 'VOUCHER', 'T_VCH'].includes(parts[0].toUpperCase())) {
          vchTypeRaw = parts[1];
          offset = 2;
        }

        const vchNo = parts[offset] || `FIX-${1000 + parsedVouchers.length}`;
        const date = parts[offset + 1] || new Date().toISOString().split('T')[0];
        const partyName = parts[offset + 2] || 'Cash / Party';
        const grandTotal = Math.abs(parseFloat((parts[offset + 3] || '0').replace(/[^0-9.-]/g, '')) || 10000);
        const narration = parts[offset + 4] || 'Imported from Busy MSAll.DAT backup';

        let mappedType: Voucher['voucherType'] = 'SALES';
        const vt = vchTypeRaw.toUpperCase();
        if (vt.includes('PURCHASE')) mappedType = 'PURCHASE';
        else if (vt.includes('PAYMENT')) mappedType = 'PAYMENT';
        else if (vt.includes('RECEIPT')) mappedType = 'RECEIPT';
        else if (vt.includes('CONTRA')) mappedType = 'CONTRA';
        else if (vt.includes('JOURNAL')) mappedType = 'JOURNAL';

        parsedVouchers.push({
          id: `vch-busy-${Date.now()}-${parsedVouchers.length}-${Math.random().toString(36).substring(2, 5)}`,
          voucherNumber: vchNo,
          voucherType: mappedType,
          date,
          partyName,
          narration,
          grandTotal,
          taxableTotal: Math.round(grandTotal / 1.18 * 100) / 100,
          cgstTotal: Math.round((grandTotal - grandTotal / 1.18) / 2 * 100) / 100,
          sgstTotal: Math.round((grandTotal - grandTotal / 1.18) / 2 * 100) / 100,
          igstTotal: 0,
          cessTotal: 0,
          roundOff: 0,
          status: 'ACTIVE',
          items: [],
          ledgerEntries: [],
        });
        continue;
      }
    }

    if (parsedLedgers.length > 0 || parsedItems.length > 0 || parsedVouchers.length > 0) {
      return {
        success: true,
        companyName: companyName || 'Busy Migrated Enterprise',
        ledgers: parsedLedgers,
        stockItems: parsedItems,
        vouchers: parsedVouchers,
        message: `Successfully parsed Busy Accounting .DAT backup (MSAll): ${parsedLedgers.length} accounts, ${parsedItems.length} items, and ${parsedVouchers.length} vouchers ready to restore.`,
      };
    }

    // If nothing found yet, return helpful diagnosis
    return {
      success: false,
      ledgers: [],
      stockItems: [],
      vouchers: [],
      message: 'Could not recognize Busy Accounting format in this file. Please verify it is a valid Busy export (.DAT, .XML, or .JSON).',
    };
  } catch (err: any) {
    return {
      success: false,
      ledgers: [],
      stockItems: [],
      vouchers: [],
      message: 'Failed to parse Busy Accounting backup: ' + (err?.message || 'Invalid format'),
    };
  }
}

export const SAMPLE_TALLY_XML = `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Export Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>All Masters and Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>Pinnacle Infotech Solutions Pvt Ltd</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <LEDGER NAME="Apex Industrial Motors" ACTION="Create">
            <NAME>Apex Industrial Motors</NAME>
            <PARENT>Sundry Debtors</PARENT>
            <OPENINGBALANCE>-145000.00</OPENINGBALANCE>
            <PARTYGSTIN>27AAACA9876Q1Z2</PARTYGSTIN>
            <LEDSTATENAME>Maharashtra</LEDSTATENAME>
          </LEDGER>
          <LEDGER NAME="Zenith Copper & Alloys Ltd" ACTION="Create">
            <NAME>Zenith Copper & Alloys Ltd</NAME>
            <PARENT>Sundry Creditors</PARENT>
            <OPENINGBALANCE>215000.00</OPENINGBALANCE>
            <PARTYGSTIN>24AABCZ5432R1Z8</PARTYGSTIN>
            <LEDSTATENAME>Gujarat</LEDSTATENAME>
          </LEDGER>
          <LEDGER NAME="HDFC Commercial Bank Current A/c" ACTION="Create">
            <NAME>HDFC Commercial Bank Current A/c</NAME>
            <PARENT>Bank Accounts</PARENT>
            <OPENINGBALANCE>-540000.00</OPENINGBALANCE>
            <LEDSTATENAME>Maharashtra</LEDSTATENAME>
          </LEDGER>
          <LEDGER NAME="GST Sales @ 18%" ACTION="Create">
            <NAME>GST Sales @ 18%</NAME>
            <PARENT>Sales Accounts</PARENT>
            <OPENINGBALANCE>0</OPENINGBALANCE>
          </LEDGER>
          <LEDGER NAME="GST Purchases @ 18%" ACTION="Create">
            <NAME>GST Purchases @ 18%</NAME>
            <PARENT>Purchase Accounts</PARENT>
            <OPENINGBALANCE>0</OPENINGBALANCE>
          </LEDGER>
          <VOUCHER VCHTYPE="Sales" ACTION="Create">
            <DATE>20260415</DATE>
            <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>
            <VOUCHERNUMBER>TL/26-27/0415</VOUCHERNUMBER>
            <PARTYLEDGERNAME>Apex Industrial Motors</PARTYLEDGERNAME>
            <NARRATION>Supply of 3-Phase Induction Motors under PO #APX-441</NARRATION>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Apex Industrial Motors</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>-88500.00</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>GST Sales @ 18%</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>75000.00</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Output CGST @ 9%</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>6750.00</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Output SGST @ 9%</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>6750.00</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
          </VOUCHER>
          <VOUCHER VCHTYPE="Receipt" ACTION="Create">
            <DATE>20260420</DATE>
            <VOUCHERTYPENAME>Receipt</VOUCHERTYPENAME>
            <VOUCHERNUMBER>RCP/TL/26-27/0088</VOUCHERNUMBER>
            <PARTYLEDGERNAME>Apex Industrial Motors</PARTYLEDGERNAME>
            <NARRATION>RTGS received UTR #HDFCR520260420991 against Inv TL/26-27/0415</NARRATION>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>HDFC Commercial Bank Current A/c</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>-88500.00</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Apex Industrial Motors</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>88500.00</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
          </VOUCHER>
        </TALLYMESSAGE>
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;

export const SAMPLE_BUSY_XML = `<?xml version="1.0" encoding="UTF-8"?>
<BUSYDATA version="21.0">
  <COMPANY>
    <NAME>Kalyan Engineering & Automation Works</NAME>
    <TRADENAME>Kalyan Automation</TRADENAME>
    <GSTIN>27AABCK4490P1Z4</GSTIN>
    <STATE>Maharashtra</STATE>
    <FINANCIALYEAR>2026-27</FINANCIALYEAR>
  </COMPANY>
  <ACCOUNTS>
    <ACCOUNT>
      <NAME>Delta Switchgears Pvt Ltd</NAME>
      <GROUP>Sundry Debtors</GROUP>
      <OP_BAL>82400.00</OP_BAL>
      <OP_BAL_TYPE>Dr</OP_BAL_TYPE>
      <GSTIN>27AAACD9921B1Z6</GSTIN>
      <STATE>Maharashtra</STATE>
    </ACCOUNT>
    <ACCOUNT>
      <NAME>Omkar Transformers & Coil Works</NAME>
      <GROUP>Sundry Creditors</GROUP>
      <OP_BAL>135000.00</OP_BAL>
      <OP_BAL_TYPE>Cr</OP_BAL_TYPE>
      <GSTIN>27AAAFO5520K1Z9</GSTIN>
      <STATE>Maharashtra</STATE>
    </ACCOUNT>
    <ACCOUNT>
      <NAME>State Bank of India OD A/c</NAME>
      <GROUP>Bank OD A/c</GROUP>
      <OP_BAL>245000.00</OP_BAL>
      <OP_BAL_TYPE>Cr</OP_BAL_TYPE>
      <STATE>Maharashtra</STATE>
    </ACCOUNT>
  </ACCOUNTS>
  <ITEMS>
    <ITEM>
      <NAME>Siemens 3TF Contactor 22A 3-Pole</NAME>
      <HSN>8536</HSN>
      <UNIT>NOS</UNIT>
      <GST_RATE>18</GST_RATE>
      <SALE_PRICE>3200.00</SALE_PRICE>
      <PUR_PRICE>2450.00</PUR_PRICE>
      <OPENING_QTY>45</OPENING_QTY>
    </ITEM>
    <ITEM>
      <NAME>ABB Miniature Circuit Breaker 63A 4P</NAME>
      <HSN>8536</HSN>
      <UNIT>NOS</UNIT>
      <GST_RATE>18</GST_RATE>
      <SALE_PRICE>1850.00</SALE_PRICE>
      <PUR_PRICE>1380.00</PUR_PRICE>
      <OPENING_QTY>70</OPENING_QTY>
    </ITEM>
  </ITEMS>
  <VOUCHERS>
    <VOUCHER>
      <TYPE>Sales</TYPE>
      <VCH_NO>BUSY-INV-2026-092</VCH_NO>
      <DATE>2026-04-18</DATE>
      <PARTY>Delta Switchgears Pvt Ltd</PARTY>
      <AMOUNT>96400.00</AMOUNT>
      <NARRATION>Supply of Siemens Contactors & MCB panels as per PO #DS-882</NARRATION>
    </VOUCHER>
    <VOUCHER>
      <TYPE>Purchase</TYPE>
      <VCH_NO>BUSY-PUR-2026-044</VCH_NO>
      <DATE>2026-04-10</DATE>
      <PARTY>Omkar Transformers & Coil Works</PARTY>
      <AMOUNT>159300.00</AMOUNT>
      <NARRATION>Inward raw copper wiring material and coil cores</NARRATION>
    </VOUCHER>
  </VOUCHERS>
</BUSYDATA>`;

export const SAMPLE_BUSY_DAT = `## BUSY ACCOUNTING SOFTWARE DATA BACKUP - FIXNOW_20261030_MSAll.DAT ##
VERSION=21.0.4
EXPORT_DATE=2026-10-30
SOURCE=BUSY ENTERPRISE SQL / ACCESS ENGINE
DATA_TYPE=MASTERS_AND_TRANSACTIONS_ALL

[COMPANY_MASTER]
NAME=FixNow Engineering & Heavy Equipments Ltd
TRADENAME=FixNow Heavy Machineries
GSTIN=27AAACF8890K1Z2
STATE=Maharashtra
STATE_CODE=27
ADDRESS=Plot 48, MIDC Industrial Area, Turbhe, Navi Mumbai
PINCODE=400705
FY=2026-27

[ACCOUNT_MASTERS]
# Format: AccountName|ParentGroup|OpeningBalance|DrCr|GSTIN|State|Address
L&T Heavy Engineering Division|Sundry Debtors|245000.00|Dr|27AAACL0123M1Z8|Maharashtra|Powai Works, Mumbai
Tata Steel Plant Supplies|Sundry Debtors|188500.00|Dr|27AAACT1456P1ZX|Maharashtra|Nagpur Plant Area
Kirloskar Pneumatic Spares|Sundry Creditors|310000.00|Cr|27AAACK3344Q1Z1|Maharashtra|Hadapsar, Pune
Cummins Engine Components|Sundry Creditors|142000.00|Cr|27AAACC2211R1Z5|Maharashtra|Kothrud, Pune
HDFC Bank Industrial Current A/c|Bank Accounts|520000.00|Dr||Maharashtra|Fort Branch Mumbai
Cash Account|Cash-in-Hand|45000.00|Dr||Maharashtra|Main Office
Output CGST @ 9%|Duties & Taxes|0.00|Cr||Maharashtra|System Tax Ledger
Output SGST @ 9%|Duties & Taxes|0.00|Cr||Maharashtra|System Tax Ledger
Input CGST @ 9%|Duties & Taxes|0.00|Dr||Maharashtra|System Tax Ledger
Input SGST @ 9%|Duties & Taxes|0.00|Dr||Maharashtra|System Tax Ledger

[ITEM_MASTERS]
# Format: ItemName|Group|Unit|HSNCode|GSTRate|SalePrice|PurchasePrice|OpeningStock|ReorderLevel
Hydraulic Piston Cylinder 150mm|Heavy Spares|NOS|8412|18|14500.00|11200.00|28|5
High Pressure Radial Pump 500 Bar|Pumps & Valves|NOS|8413|18|42000.00|33500.00|14|2
Tungsten Carbide Cutting Tip ISO-9|Tooling|BOX|8209|18|3400.00|2650.00|85|15
Industrial Synthetic Lubricant 20L|Consumables|LTR|2710|18|4800.00|3900.00|40|10

[TRANSACTIONS]
# Format: VoucherType|VoucherNo|Date|PartyName|GrandTotal|Narration
Sales|FIX/INV/2026/0142|2026-10-25|L&T Heavy Engineering Division|171100.00|Supply of Hydraulic Piston Cylinders against Purchase Order #PO-99120
Sales|FIX/INV/2026/0143|2026-10-28|Tata Steel Plant Supplies|222430.00|High Pressure Radial Pumps dispatch with inspection certificate
Purchase|FIX/PUR/2026/0088|2026-10-15|Kirloskar Pneumatic Spares|198240.00|Inward bulk casting and machined valve parts
Payment|FIX/PMT/2026/0064|2026-10-22|Cummins Engine Components|142000.00|RTGS payment settlement UTR #HDFCR5202610224419
Receipt|FIX/RCP/2026/0091|2026-10-29|L&T Heavy Engineering Division|150000.00|Advance payment received via NEFT for upcoming November orders
Contra|FIX/CNT/2026/0022|2026-10-24|Cash Account|30000.00|Cash withdrawal from HDFC Bank for factory petty expenses
`;



