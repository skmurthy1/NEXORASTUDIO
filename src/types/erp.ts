/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'OWNER' | 'ADMIN' | 'ACCOUNTANT' | 'DATA_ENTRY' | 'AUDITOR';

export interface AuthSession {
  mobile: string;
  email?: string;
  emailConfirmed?: boolean;
  name: string;
  businessName: string;
  role: UserRole;
  isLoggedIn: boolean;
  token?: string;
  lastLoginTime: string;
}

export type SubscriptionTier = 'STARTER' | 'PRO' | 'ENTERPRISE';
export type BillingCycle = 'MONTHLY' | 'ANNUAL';

export interface RecurringMandate {
  isEnabled: boolean;
  mandateId: string; // e.g. UMRN-AUTOPAY-202688192
  method: 'UPI_AUTOPAY' | 'CARD_MANDATE' | 'ENACH';
  cycle: BillingCycle;
  frequency: 'Monthly' | 'Yearly';
  maxDebitAmount: number;
  nextDebitDate: string;
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED';
  createdAt: string;
  autoDebitBank?: string;
  vpaHandle?: string;
}

export interface SubscriptionState {
  tier: SubscriptionTier;
  cycle: BillingCycle;
  status: 'ACTIVE' | 'TRIAL' | 'EXPIRED';
  validTill: string;
  amountPaid: number;
  lastPaymentDate: string;
  invoiceNumber: string;
  recurringMandate?: RecurringMandate;
  features: {
    unlimitedVouchers: boolean;
    allGstReturns: boolean;
    eWayBillAndEInvoice: boolean;
    whatsAppIntegration: boolean;
    tallyXmlSync: boolean;
    multiGodowns: boolean;
    caWorkspace: boolean;
  };
}

export interface PaymentTransaction {
  id: string;
  date: string;
  amount: number;
  taxableAmount: number;
  gstAmount: number;
  plan: SubscriptionTier;
  cycle: BillingCycle;
  method: 'UPI' | 'CARD' | 'NET_BANKING';
  referenceId: string;
  invoiceUrl?: string;
  isRecurring?: boolean;
  mandateId?: string;
}

export interface IndianState {
  code: string; // e.g. "27"
  name: string; // e.g. "Maharashtra"
  tin: string;
}

export interface Company {
  id: string;
  name: string;
  tradeName: string;
  gstin: string;
  pan: string;
  state: string;
  stateCode: string;
  address: string;
  pincode: string;
  phone: string;
  email: string;
  logoUrl?: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  branch: string;
  upiId: string;
  signatureUrl?: string;
  defaultTerms: string;
  defaultNotes: string;
  registrationType: 'REGULAR' | 'COMPOSITION' | 'UNREGISTERED' | 'SEZ';
  filingFrequency: 'MONTHLY' | 'QUARTERLY_QRMP';
  financialYear: string; // "2026-27"
  booksBeginningDate: string; // "2026-04-01"
  voucherPrefix: string; // "NB/26-27/"
  autoVoucherNumbering: boolean;
  lockDate?: string;
}

export type TallyPrimaryGroup = 
  | 'Branch / Divisions'
  | 'Capital Account'
  | 'Reserves & Surplus'
  | 'Current Assets'
  | 'Bank Accounts'
  | 'Cash-in-hand'
  | 'Deposits (Asset)'
  | 'Loans & Advances (Asset)'
  | 'Stock-in-hand'
  | 'Sundry Debtors'
  | 'Current Liabilities'
  | 'Duties & Taxes'
  | 'Provisions'
  | 'Sundry Creditors'
  | 'Direct Expenses'
  | 'Direct Incomes'
  | 'Fixed Assets'
  | 'Indirect Expenses'
  | 'Indirect Incomes'
  | 'Investments'
  | 'Loans (Liability)'
  | 'Bank OD A/c'
  | 'Secured Loans'
  | 'Unsecured Loans'
  | 'Misc. Expenses (ASSET)'
  | 'Purchase Accounts'
  | 'Sales Accounts'
  | 'Suspense A/c';

export interface LedgerGroup {
  id: string;
  name: string;
  parentGroup?: string;
  nature: 'ASSET' | 'LIABILITY' | 'INCOME' | 'EXPENSE';
  isPrimary: boolean;
}

export interface Ledger {
  id: string;
  companyId: string;
  name: string;
  group: string; // Matches Tally group name
  openingBalance: number;
  currentBalance: number;
  drCr: 'Dr' | 'Cr';
  gstin?: string;
  pan?: string;
  state?: string;
  stateCode?: string;
  address?: string;
  pincode?: string;
  phone?: string;
  email?: string;
  creditLimit?: number;
  creditDays?: number;
  bankDetails?: {
    accountNumber?: string;
    ifsc?: string;
    bankName?: string;
  };
  isSystem?: boolean; // For CGST, SGST, IGST, Round Off, Cash
}

export interface Godown {
  id: string;
  companyId: string;
  name: string;
  location: string;
  isDefault: boolean;
}

export interface BatchInfo {
  batchNumber: string;
  mfgDate: string;
  expiryDate: string;
  quantity: number;
  mrp: number;
}

export interface StockItem {
  id: string;
  companyId: string;
  name: string;
  group: string;
  hsnCode: string;
  unit: string; // NOS, KGS, PCS, BOX, MTR, LTR
  gstRate: number; // 0, 5, 12, 18, 28
  cessRate: number;
  salePrice: number;
  purchasePrice: number;
  mrp: number;
  openingStock: number;
  currentStock: number;
  reorderLevel: number;
  valuationMethod: 'FIFO' | 'WEIGHTED_AVG';
  godownStock: { [godownId: string]: number };
  batchEnabled: boolean;
  batches?: BatchInfo[];
}

export type VoucherType =
  | 'SALES'
  | 'PURCHASE'
  | 'PAYMENT'
  | 'RECEIPT'
  | 'CONTRA'
  | 'JOURNAL'
  | 'CREDIT_NOTE'
  | 'DEBIT_NOTE'
  | 'QUOTATION'
  | 'SALES_ORDER'
  | 'DELIVERY_CHALLAN'
  | 'PURCHASE_ORDER'
  | 'GRN'
  | 'STOCK_JOURNAL';

export interface VoucherItem {
  itemId: string;
  itemName: string;
  hsnCode: string;
  godownId?: string;
  batchNumber?: string;
  quantity: number;
  unit: string;
  rate: number;
  discountPercent: number;
  taxableAmount: number;
  gstRate: number;
  cessRate: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  cessAmount: number;
  totalAmount: number;
}

export interface BillAllocation {
  refType: 'NEW_REF' | 'AGAINST_REF' | 'ADVANCE' | 'ON_ACCOUNT';
  refNo: string;
  amount: number;
  drCr: 'Dr' | 'Cr';
}

export interface LedgerVoucherEntry {
  ledgerId: string;
  ledgerName: string;
  amount: number;
  drCr: 'Dr' | 'Cr';
}

export interface Voucher {
  id: string;
  companyId: string;
  voucherType: VoucherType;
  voucherNumber: string;
  date: string; // YYYY-MM-DD
  partyLedgerId?: string;
  partyName?: string;
  partyGstin?: string;
  partyState?: string;
  partyStateCode?: string;
  placeOfSupply?: string; // 2-digit state code
  reverseCharge: boolean;
  billingAddress?: string;
  shippingAddress?: string;
  supplierInvoiceNumber?: string;
  supplierInvoiceDate?: string;
  itcEligibility?: 'INPUTS' | 'CAPITAL_GOODS' | 'INELIGIBLE';
  originalInvoiceRef?: string;
  originalInvoiceDate?: string;
  reasonForNote?: string;
  orderRef?: string;
  challanRef?: string;
  items: VoucherItem[];
  ledgerEntries: LedgerVoucherEntry[];
  freightCharges: number;
  packingCharges: number;
  insuranceCharges: number;
  roundOff: number;
  taxableTotal: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  cessTotal: number;
  grandTotal: number;
  narration: string;
  billAllocations?: BillAllocation[];
  eWayBillNumber?: string;
  eWayBillDate?: string;
  transporterId?: string;
  transporterName?: string;
  vehicleNumber?: string;
  distanceKm?: number;
  irn?: string;
  signedQrCode?: string;
  ackNumber?: string;
  ackDate?: string;
  status: 'ACTIVE' | 'CANCELLED';
  isPeriodLocked?: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface FieldChange {
  field: string;
  fieldLabel: string;
  oldValue: string;
  newValue: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: 'CREATE' | 'ALTER' | 'CANCEL' | 'DELETE' | 'PRINT' | 'EXPORT';
  voucherType: string;
  voucherNumber: string;
  voucherId?: string;
  user: string;
  userMobile?: string;
  userRole?: string;
  details: string;
  reason?: string;
  fieldChanges?: FieldChange[];
  previousValue?: string;
  newValue?: string;
  ipAddress?: string;
  mcaCompliant?: boolean;
  hash?: string;
}

export interface CAClient {
  id: string;
  companyName: string;
  gstin: string;
  contactPerson: string;
  phone: string;
  assignedStaff: string;
  gstr1Status: 'FILED' | 'PENDING' | 'OVERDUE';
  gstr3bStatus: 'FILED' | 'PENDING' | 'OVERDUE';
  turnoverCurrentYear: number;
  lastSyncDate: string;
}

export interface CAStaff {
  id: string;
  name: string;
  role: 'SENIOR_ACCOUNTANT' | 'JUNIOR_AUDITOR' | 'DATA_ENTRY';
  assignedClientCount: number;
  email: string;
  phone: string;
}

export type InvoiceTemplate = 'CLASSIC_TALLY' | 'MODERN_CLOUD' | 'COMPACT' | 'THERMAL_80MM';

export interface InvoiceCustomization {
  template: InvoiceTemplate;
  showLogo: boolean;
  showBankDetails: boolean;
  showUpiQr: boolean;
  showSignature: boolean;
  showHsnSummary: boolean;
  showTerms: boolean;
  showNotes: boolean;
  showOriginalCopyText: boolean;
  copyType: 'ORIGINAL_FOR_RECIPIENT' | 'DUPLICATE_FOR_TRANSPORTER' | 'TRIPLICATE_FOR_SUPPLIER';
}

export type GspProvider =
  | 'CLEARTAX'
  | 'CYGNET'
  | 'MASTERS_INDIA'
  | 'ADAEQUARE'
  | 'IRIS_GST'
  | 'NIC_DIRECT'
  | 'TALLY_GSP'
  | 'CUSTOM';

export type GspEnvironment = 'SANDBOX' | 'PRODUCTION';

export type GspConnectionStatus =
  | 'CONNECTED'
  | 'DISCONNECTED'
  | 'CONNECTING'
  | 'ERROR'
  | 'TOKEN_EXPIRED';

export interface GspFeatures {
  autoEInvoice: boolean;
  autoEWayBill: boolean;
  directGstr1Filing: boolean;
  directGstr3bFiling: boolean;
  autoGstr2bSync: boolean;
  liveGstinVerification: boolean;
  eWayBillThreshold: number;
  eInvoiceThreshold: number;
}

export interface GspConfig {
  provider: GspProvider;
  environment: GspEnvironment;
  gstin: string;
  apiUsername: string;
  apiPassword: string;
  clientId: string;
  clientSecret: string;
  authStatus: GspConnectionStatus;
  authToken?: string;
  tokenExpiry?: string;
  lastTestedAt?: string;
  lastSyncAt?: string;
  nicEwbUsername?: string;
  nicEwbPassword?: string;
  ipWhitelisted: boolean;
  dscRegistered: boolean;
  features: GspFeatures;
  latencyMs?: number;
}

