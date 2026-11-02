/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { INDIAN_STATES, MOCK_GSTIN_DIRECTORY, MockGstinRecord } from '../data/seedData';
import { Voucher, Company, IndianState } from '../types/erp';

export function validateGstin(gstin: string): { isValid: boolean; stateCode: string; pan: string; error?: string } {
  const clean = gstin.trim().toUpperCase();
  if (clean.length !== 15) {
    return { isValid: false, stateCode: '', pan: '', error: 'GSTIN must be exactly 15 characters long.' };
  }
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (!gstinRegex.test(clean)) {
    return { isValid: false, stateCode: clean.substring(0, 2), pan: clean.substring(2, 12), error: 'Invalid GSTIN structure (Format: 22AAAAA0000A1Z5).' };
  }
  const stateCode = clean.substring(0, 2);
  const state = INDIAN_STATES.find(s => s.code === stateCode);
  if (!state) {
    return { isValid: false, stateCode, pan: clean.substring(2, 12), error: `Invalid GST state code "${stateCode}".` };
  }
  const pan = clean.substring(2, 12);
  return { isValid: true, stateCode, pan };
}

export function getStateByCode(code: string): IndianState | undefined {
  const padded = code.padStart(2, '0');
  return INDIAN_STATES.find(s => s.code === padded);
}

export function lookupGstin(gstin: string): MockGstinRecord | undefined {
  const clean = gstin.trim().toUpperCase();
  if (MOCK_GSTIN_DIRECTORY[clean]) {
    return MOCK_GSTIN_DIRECTORY[clean];
  }
  // Auto-generate realistic details if not in hardcoded directory
  const validation = validateGstin(clean);
  if (validation.isValid) {
    const state = getStateByCode(validation.stateCode);
    return {
      gstin: clean,
      legalName: `ENTERPRISE TRADING CORP (${validation.pan})`,
      tradeName: `Enterprise Solutions`,
      stateCode: validation.stateCode,
      stateName: state ? state.name : 'Unknown State',
      address: `Industrial Complex Phase 2, City, ${state ? state.name : ''}`,
      pincode: `${validation.stateCode}0001`,
      taxpayerType: 'REGULAR',
      status: 'ACTIVE',
    };
  }
  return undefined;
}

export function isIntraStateSupply(supplierStateCode: string, placeOfSupplyCode: string): boolean {
  if (!supplierStateCode || !placeOfSupplyCode) return true;
  return supplierStateCode.padStart(2, '0') === placeOfSupplyCode.padStart(2, '0');
}

export function calculateLineGst(
  quantity: number,
  rate: number,
  discountPercent = 0,
  gstRate = 18,
  isIntraState = true,
  cessRate = 0
) {
  const gross = quantity * rate;
  const discountAmount = (gross * discountPercent) / 100;
  const taxableAmount = Math.max(0, gross - discountAmount);

  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;

  if (isIntraState) {
    const halfRate = gstRate / 2;
    cgstAmount = (taxableAmount * halfRate) / 100;
    sgstAmount = (taxableAmount * halfRate) / 100;
  } else {
    igstAmount = (taxableAmount * gstRate) / 100;
  }

  const cessAmount = (taxableAmount * cessRate) / 100;
  const totalAmount = taxableAmount + cgstAmount + sgstAmount + igstAmount + cessAmount;

  return {
    gross,
    discountAmount,
    taxableAmount,
    cgstAmount,
    sgstAmount,
    igstAmount,
    cessAmount,
    totalAmount,
  };
}

export function numberToIndianWords(amount: number): string {
  if (amount === 0) return 'Zero Rupees Only';

  const singleDigits = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertTwoDigits(num: number): string {
    if (num < 10) return singleDigits[num];
    if (num < 20) return teens[num - 10];
    return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + singleDigits[num % 10] : '');
  }

  function convertThreeDigits(num: number): string {
    const hundred = Math.floor(num / 100);
    const remainder = num % 100;
    let res = '';
    if (hundred > 0) {
      res += singleDigits[hundred] + ' Hundred';
      if (remainder > 0) res += ' and ';
    }
    if (remainder > 0) {
      res += convertTwoDigits(remainder);
    }
    return res;
  }

  const rounded = Math.round(amount * 100) / 100;
  const rupees = Math.floor(rounded);
  const paise = Math.round((rounded - rupees) * 100);

  let remaining = rupees;
  let words = '';

  // Crores (>= 1,00,00,000)
  const crores = Math.floor(remaining / 10000000);
  remaining %= 10000000;
  if (crores > 0) {
    words += convertTwoDigits(crores) + ' Crore ';
  }

  // Lakhs (>= 1,00,000)
  const lakhs = Math.floor(remaining / 100000);
  remaining %= 100000;
  if (lakhs > 0) {
    words += convertTwoDigits(lakhs) + ' Lakh ';
  }

  // Thousands (>= 1,000)
  const thousands = Math.floor(remaining / 1000);
  remaining %= 1000;
  if (thousands > 0) {
    words += convertTwoDigits(thousands) + ' Thousand ';
  }

  // Hundreds & rest
  if (remaining > 0) {
    words += convertThreeDigits(remaining) + ' ';
  }

  words = words.trim();
  if (words === '') words = 'Zero';

  let result = 'Rupees ' + words;
  if (paise > 0) {
    result += ' and ' + convertTwoDigits(paise) + ' Paise';
  }
  return result + ' Only';
}

export function generateSimulatedIrn(sellerGstin: string, docNo: string, docType = 'INV', date = '2026-05-15'): string {
  // Simulates a 64-character SHA-256 IRN hash
  const raw = `${sellerGstin}${docType}${docNo}${date}`.replace(/[^A-Za-z0-9]/g, '');
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = (hash << 5) - hash + raw.charCodeAt(i);
    hash |= 0;
  }
  const prefix = Math.abs(hash).toString(16).padStart(8, '0');
  const middle = '4c8996fb92427ae41e4649b934ca495991b7852b8559f86d081884c7d659a';
  return (prefix + middle).substring(0, 64);
}

export function generateQrPayload(
  sellerGstin: string,
  buyerGstin: string,
  docNo: string,
  date: string,
  taxableValue: number,
  taxValue: number,
  irn: string
): string {
  return JSON.stringify({
    SellerGstin: sellerGstin,
    BuyerGstin: buyerGstin || 'URP',
    DocNo: docNo,
    DocTyp: 'INV',
    DocDt: date,
    TotInvVal: Math.round(taxableValue + taxValue),
    ItemCnt: 1,
    MainHsnCode: '8471',
    Irn: irn,
  });
}

export interface Gstr1Summary {
  b2b: { count: number; taxableValue: number; cgst: number; sgst: number; igst: number; totalTax: number; invoices: Voucher[] };
  b2cl: { count: number; taxableValue: number; igst: number; invoices: Voucher[] };
  b2cs: { count: number; taxableValue: number; cgst: number; sgst: number; igst: number; totalTax: number };
  cdnr: { count: number; taxableValue: number; cgst: number; sgst: number; igst: number; totalTax: number; notes: Voucher[] };
  exports: { count: number; taxableValue: number; igst: number; invoices: Voucher[] };
  hsnSummary: Array<{ hsn: string; description: string; uqc: string; totalQty: number; totalValue: number; taxableValue: number; cgst: number; sgst: number; igst: number }>;
  docIssued: { salesCount: number; creditNoteCount: number; deliveryChallanCount: number };
  totalTurnover: number;
  totalTax: number;
}

export function computeGstr1Summary(vouchers: Voucher[], companyStateCode = '27'): Gstr1Summary {
  const activeSales = vouchers.filter(v => v.status === 'ACTIVE' && v.voucherType === 'SALES');
  const creditNotes = vouchers.filter(v => v.status === 'ACTIVE' && v.voucherType === 'CREDIT_NOTE');
  const deliveryChallans = vouchers.filter(v => v.status === 'ACTIVE' && v.voucherType === 'DELIVERY_CHALLAN');

  const b2bInvoices: Voucher[] = [];
  const b2clInvoices: Voucher[] = [];
  let b2csTaxable = 0;
  let b2csCgst = 0;
  let b2csSgst = 0;
  let b2csIgst = 0;

  activeSales.forEach(inv => {
    const isInterState = inv.placeOfSupply ? inv.placeOfSupply !== companyStateCode : inv.igstTotal > 0;
    if (inv.partyGstin && inv.partyGstin.trim().length === 15) {
      b2bInvoices.push(inv);
    } else if (isInterState && inv.grandTotal > 250000) {
      b2clInvoices.push(inv);
    } else {
      b2csTaxable += inv.taxableTotal;
      b2csCgst += inv.cgstTotal;
      b2csSgst += inv.sgstTotal;
      b2csIgst += inv.igstTotal;
    }
  });

  const b2bSummary = {
    count: b2bInvoices.length,
    taxableValue: b2bInvoices.reduce((acc, v) => acc + v.taxableTotal, 0),
    cgst: b2bInvoices.reduce((acc, v) => acc + v.cgstTotal, 0),
    sgst: b2bInvoices.reduce((acc, v) => acc + v.sgstTotal, 0),
    igst: b2bInvoices.reduce((acc, v) => acc + v.igstTotal, 0),
    totalTax: b2bInvoices.reduce((acc, v) => acc + v.cgstTotal + v.sgstTotal + v.igstTotal, 0),
    invoices: b2bInvoices,
  };

  const b2clSummary = {
    count: b2clInvoices.length,
    taxableValue: b2clInvoices.reduce((acc, v) => acc + v.taxableTotal, 0),
    igst: b2clInvoices.reduce((acc, v) => acc + v.igstTotal, 0),
    invoices: b2clInvoices,
  };

  const b2csSummary = {
    count: b2csTaxable > 0 ? 1 : 0,
    taxableValue: b2csTaxable,
    cgst: b2csCgst,
    sgst: b2csSgst,
    igst: b2csIgst,
    totalTax: b2csCgst + b2csSgst + b2csIgst,
  };

  const cdnrSummary = {
    count: creditNotes.length,
    taxableValue: creditNotes.reduce((acc, v) => acc + v.taxableTotal, 0),
    cgst: creditNotes.reduce((acc, v) => acc + v.cgstTotal, 0),
    sgst: creditNotes.reduce((acc, v) => acc + v.sgstTotal, 0),
    igst: creditNotes.reduce((acc, v) => acc + v.igstTotal, 0),
    totalTax: creditNotes.reduce((acc, v) => acc + v.cgstTotal + v.sgstTotal + v.igstTotal, 0),
    notes: creditNotes,
  };

  // HSN Aggregator across sales items
  const hsnMap: Record<string, { hsn: string; description: string; uqc: string; totalQty: number; totalValue: number; taxableValue: number; cgst: number; sgst: number; igst: number }> = {};
  activeSales.forEach(inv => {
    inv.items.forEach(it => {
      const hsn = it.hsnCode || '999999';
      if (!hsnMap[hsn]) {
        hsnMap[hsn] = {
          hsn,
          description: it.itemName,
          uqc: it.unit || 'NOS',
          totalQty: 0,
          totalValue: 0,
          taxableValue: 0,
          cgst: 0,
          sgst: 0,
          igst: 0,
        };
      }
      hsnMap[hsn].totalQty += it.quantity;
      hsnMap[hsn].taxableValue += it.taxableAmount;
      hsnMap[hsn].cgst += it.cgstAmount;
      hsnMap[hsn].sgst += it.sgstAmount;
      hsnMap[hsn].igst += it.igstAmount;
      hsnMap[hsn].totalValue += it.totalAmount;
    });
  });

  const hsnSummary = Object.values(hsnMap);
  const totalTurnover = b2bSummary.taxableValue + b2clSummary.taxableValue + b2csSummary.taxableValue;
  const totalTax = b2bSummary.totalTax + b2clSummary.igst + b2csSummary.totalTax;

  return {
    b2b: b2bSummary,
    b2cl: b2clSummary,
    b2cs: b2csSummary,
    cdnr: cdnrSummary,
    exports: { count: 0, taxableValue: 0, igst: 0, invoices: [] },
    hsnSummary,
    docIssued: {
      salesCount: activeSales.length,
      creditNoteCount: creditNotes.length,
      deliveryChallanCount: deliveryChallans.length,
    },
    totalTurnover,
    totalTax,
  };
}

export function generateGstr1OfficialJson(company: Company, vouchers: Voucher[], period = '062026') {
  const summary = computeGstr1Summary(vouchers, company.stateCode);
  return {
    gstin: company.gstin,
    fp: period,
    gt: 18450000,
    cur_gt: summary.totalTurnover,
    version: 'GSTR1_3.0',
    b2b: summary.b2b.invoices.map(inv => ({
      ctin: inv.partyGstin,
      inv: [
        {
          inum: inv.voucherNumber,
          idt: inv.date.split('-').reverse().join('-'), // DD-MM-YYYY
          val: inv.grandTotal,
          pos: inv.placeOfSupply || company.stateCode,
          rchrg: inv.reverseCharge ? 'Y' : 'N',
          inv_typ: 'R',
          itms: inv.items.map((item, idx) => ({
            num: idx + 1,
            itm_det: {
              txval: item.taxableAmount,
              rt: item.gstRate,
              iamt: item.igstAmount,
              camt: item.cgstAmount,
              samt: item.sgstAmount,
              csamt: item.cessAmount,
            },
          })),
        },
      ],
    })),
    hsn: {
      data: summary.hsnSummary.map((h, idx) => ({
        num: idx + 1,
        hsn_sc: h.hsn,
        desc: h.description,
        uqc: h.uqc,
        qty: h.totalQty,
        val: h.totalValue,
        txval: h.taxableValue,
        iamt: h.igst,
        camt: h.cgst,
        samt: h.sgst,
        csamt: 0,
      })),
    },
    doc_issue: {
      doc_det: [
        {
          doc_num: 1,
          doc_typ: 'Invoices for outward supply',
          from: 'NB/26-27/001',
          to: `NB/26-27/00${summary.docIssued.salesCount}`,
          totnum: summary.docIssued.salesCount,
          canc: 0,
          net_issue: summary.docIssued.salesCount,
        },
      ],
    },
  };
}

export interface Gstr3bSummary {
  outwardTaxable: { taxable: number; igst: number; cgst: number; sgst: number; cess: number };
  eligibleItc: {
    inputs: { igst: number; cgst: number; sgst: number; cess: number };
    capitalGoods: { igst: number; cgst: number; sgst: number; cess: number };
    services: { igst: number; cgst: number; sgst: number; cess: number };
    totalItc: { igst: number; cgst: number; sgst: number; cess: number };
  };
  netTaxPayable: { igst: number; cgst: number; sgst: number; cess: number };
  taxPaidByCash: { igst: number; cgst: number; sgst: number; cess: number };
}

export function computeGstr3bSummary(vouchers: Voucher[]): Gstr3bSummary {
  const activeSales = vouchers.filter(v => v.status === 'ACTIVE' && v.voucherType === 'SALES');
  const activePurchases = vouchers.filter(v => v.status === 'ACTIVE' && v.voucherType === 'PURCHASE');

  const outwardTaxable = {
    taxable: activeSales.reduce((acc, v) => acc + v.taxableTotal, 0),
    igst: activeSales.reduce((acc, v) => acc + v.igstTotal, 0),
    cgst: activeSales.reduce((acc, v) => acc + v.cgstTotal, 0),
    sgst: activeSales.reduce((acc, v) => acc + v.sgstTotal, 0),
    cess: activeSales.reduce((acc, v) => acc + v.cessTotal, 0),
  };

  const eligiblePurchases = activePurchases.filter(p => p.itcEligibility !== 'INELIGIBLE');
  const itcInputs = {
    igst: eligiblePurchases.filter(p => p.itcEligibility === 'INPUTS').reduce((acc, v) => acc + v.igstTotal, 0),
    cgst: eligiblePurchases.filter(p => p.itcEligibility === 'INPUTS').reduce((acc, v) => acc + v.cgstTotal, 0),
    sgst: eligiblePurchases.filter(p => p.itcEligibility === 'INPUTS').reduce((acc, v) => acc + v.sgstTotal, 0),
    cess: eligiblePurchases.filter(p => p.itcEligibility === 'INPUTS').reduce((acc, v) => acc + v.cessTotal, 0),
  };

  const itcCapital = {
    igst: eligiblePurchases.filter(p => p.itcEligibility === 'CAPITAL_GOODS').reduce((acc, v) => acc + v.igstTotal, 0),
    cgst: eligiblePurchases.filter(p => p.itcEligibility === 'CAPITAL_GOODS').reduce((acc, v) => acc + v.cgstTotal, 0),
    sgst: eligiblePurchases.filter(p => p.itcEligibility === 'CAPITAL_GOODS').reduce((acc, v) => acc + v.sgstTotal, 0),
    cess: eligiblePurchases.filter(p => p.itcEligibility === 'CAPITAL_GOODS').reduce((acc, v) => acc + v.cessTotal, 0),
  };

  const totalItc = {
    igst: itcInputs.igst + itcCapital.igst,
    cgst: itcInputs.cgst + itcCapital.cgst,
    sgst: itcInputs.sgst + itcCapital.sgst,
    cess: itcInputs.cess + itcCapital.cess,
  };

  // Offset logic: Output - ITC = Net Tax Payable through Cash
  const netTaxPayable = {
    igst: Math.max(0, outwardTaxable.igst - totalItc.igst),
    cgst: Math.max(0, outwardTaxable.cgst - totalItc.cgst),
    sgst: Math.max(0, outwardTaxable.sgst - totalItc.sgst),
    cess: Math.max(0, outwardTaxable.cess - totalItc.cess),
  };

  return {
    outwardTaxable,
    eligibleItc: {
      inputs: itcInputs,
      capitalGoods: itcCapital,
      services: { igst: 0, cgst: 0, sgst: 0, cess: 0 },
      totalItc,
    },
    netTaxPayable,
    taxPaidByCash: netTaxPayable,
  };
}

export function reconcileGstr2b(vouchers: Voucher[], gstr2bList: Array<{
  supplierGstin: string;
  supplierName: string;
  invoiceNumber: string;
  invoiceDate: string;
  taxableValue: number;
  igst: number;
  cgst: number;
  sgst: number;
  itcEligible: boolean;
}>) {
  const purchaseVouchers = vouchers.filter(v => v.status === 'ACTIVE' && v.voucherType === 'PURCHASE');
  
  return gstr2bList.map(item => {
    // Look for matching purchase in books
    const matched = purchaseVouchers.find(p => 
      p.supplierInvoiceNumber?.toLowerCase() === item.invoiceNumber.toLowerCase() ||
      (p.partyGstin === item.supplierGstin && Math.abs(p.taxableTotal - item.taxableValue) < 5)
    );

    let matchStatus: 'MATCHED' | 'VALUE_MISMATCH' | 'MISSING_IN_BOOKS' = 'MISSING_IN_BOOKS';
    let difference = item.taxableValue;

    if (matched) {
      if (Math.abs(matched.taxableTotal - item.taxableValue) < 1) {
        matchStatus = 'MATCHED';
        difference = 0;
      } else {
        matchStatus = 'VALUE_MISMATCH';
        difference = item.taxableValue - matched.taxableTotal;
      }
    }

    return {
      supplierGstin: item.supplierGstin,
      supplierName: item.supplierName,
      invoiceNumber: item.invoiceNumber,
      invoiceDate: item.invoiceDate,
      portalTaxable: item.taxableValue,
      portalTax: item.igst + item.cgst + item.sgst,
      bookVoucherNumber: matched ? matched.voucherNumber : undefined,
      bookTaxable: matched ? matched.taxableTotal : 0,
      bookTax: matched ? matched.igstTotal + matched.cgstTotal + matched.sgstTotal : 0,
      matchStatus,
      difference,
    };
  });
}
