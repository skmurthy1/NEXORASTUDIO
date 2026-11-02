/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Save,
  Share2,
  Printer,
  Sparkles,
  HelpCircle,
  Truck,
  CheckCircle,
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { VoucherType, VoucherItem, LedgerVoucherEntry } from '../../types/erp';
import {
  calculateLineGst,
  isIntraStateSupply,
  generateSimulatedIrn,
  generateQrPayload,
} from '../../services/gstEngine';
import { INDIAN_STATES } from '../../data/seedData';

interface VoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  voucherType: VoucherType;
  onPrintVoucher?: (voucherId: string) => void;
  onOpenMasterCreateModal?: () => void;
}

export const VoucherModal: React.FC<VoucherModalProps> = ({
  isOpen,
  onClose,
  voucherType,
  onPrintVoucher,
  onOpenMasterCreateModal,
}) => {
  const { activeCompany, ledgers, stockItems, godowns, createVoucher } = useErp();

  // Basic voucher state
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [voucherNumber, setVoucherNumber] = useState('');
  const [partyLedgerId, setPartyLedgerId] = useState('');
  const [placeOfSupply, setPlaceOfSupply] = useState(activeCompany.stateCode);
  const [reverseCharge, setReverseCharge] = useState(false);
  const [narration, setNarration] = useState('');
  const [supplierInvNo, setSupplierInvNo] = useState('');
  const [supplierInvDate, setSupplierInvDate] = useState('');
  const [itcEligibility, setItcEligibility] = useState<'INPUTS' | 'CAPITAL_GOODS' | 'INELIGIBLE'>('INPUTS');
  const [originalInvoiceRef, setOriginalInvoiceRef] = useState('');

  // Transport & e-Way Bill
  const [transporterId, setTransporterId] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [generateEWay, setGenerateEWay] = useState(false);

  // Charges
  const [freightCharges, setFreightCharges] = useState<number>(0);
  const [packingCharges, setPackingCharges] = useState<number>(0);
  const [insuranceCharges, setInsuranceCharges] = useState<number>(0);

  // Line Items (for Sales, Purchase, Challan, Quote, Order)
  const isInventoryVoucher = [
    'SALES',
    'PURCHASE',
    'CREDIT_NOTE',
    'DEBIT_NOTE',
    'QUOTATION',
    'SALES_ORDER',
    'DELIVERY_CHALLAN',
    'PURCHASE_ORDER',
    'GRN',
  ].includes(voucherType);

  const [items, setItems] = useState<VoucherItem[]>([]);

  // Double-entry ledger entries for Accounting Vouchers (Payment, Receipt, Contra, Journal)
  const [ledgerEntries, setLedgerEntries] = useState<LedgerVoucherEntry[]>([]);

  // Auto-generate voucher number on open
  useEffect(() => {
    if (isOpen) {
      const typePrefixMap: Record<VoucherType, string> = {
        SALES: 'INV/26-27/',
        PURCHASE: 'PUR/26-27/',
        PAYMENT: 'PAY/26-27/',
        RECEIPT: 'REC/26-27/',
        CONTRA: 'CNT/26-27/',
        JOURNAL: 'JRN/26-27/',
        CREDIT_NOTE: 'CN/26-27/',
        DEBIT_NOTE: 'DN/26-27/',
        QUOTATION: 'QTN/26-27/',
        SALES_ORDER: 'SO/26-27/',
        DELIVERY_CHALLAN: 'DC/26-27/',
        PURCHASE_ORDER: 'PO/26-27/',
        GRN: 'GRN/26-27/',
        STOCK_JOURNAL: 'STK/26-27/',
      };
      const prefix = typePrefixMap[voucherType] || 'VCH/26-27/';
      const randNum = String(Math.floor(10 + Math.random() * 90)).padStart(3, '0');
      setVoucherNumber(`${prefix}${randNum}`);

      // Initialize default items or ledger rows
      if (isInventoryVoucher) {
        if (stockItems.length > 0) {
          const first = stockItems[0];
          const isIntra = isIntraStateSupply(activeCompany.stateCode, placeOfSupply);
          const rate = voucherType === 'PURCHASE' ? first.purchasePrice : first.salePrice;
          const lineTax = calculateLineGst(1, rate, 0, first.gstRate, isIntra, first.cessRate);
          setItems([
            {
              itemId: first.id,
              itemName: first.name,
              hsnCode: first.hsnCode,
              godownId: godowns[0]?.id,
              quantity: 1,
              unit: first.unit,
              rate,
              discountPercent: 0,
              taxableAmount: lineTax.taxableAmount,
              gstRate: first.gstRate,
              cessRate: first.cessRate,
              cgstAmount: lineTax.cgstAmount,
              sgstAmount: lineTax.sgstAmount,
              igstAmount: lineTax.igstAmount,
              cessAmount: lineTax.cessAmount,
              totalAmount: lineTax.totalAmount,
            },
          ]);
        }
      } else {
        // Accounting voucher
        if (voucherType === 'PAYMENT') {
          const bank = ledgers.find(l => l.group === 'Bank Accounts') || ledgers[0];
          const vendor = ledgers.find(l => l.group === 'Sundry Creditors') || ledgers[1];
          setLedgerEntries([
            { ledgerId: vendor.id, ledgerName: vendor.name, amount: 10000, drCr: 'Dr' },
            { ledgerId: bank.id, ledgerName: bank.name, amount: 10000, drCr: 'Cr' },
          ]);
        } else if (voucherType === 'RECEIPT') {
          const bank = ledgers.find(l => l.group === 'Bank Accounts') || ledgers[0];
          const debtor = ledgers.find(l => l.group === 'Sundry Debtors') || ledgers[1];
          setLedgerEntries([
            { ledgerId: bank.id, ledgerName: bank.name, amount: 25000, drCr: 'Dr' },
            { ledgerId: debtor.id, ledgerName: debtor.name, amount: 25000, drCr: 'Cr' },
          ]);
        } else if (voucherType === 'CONTRA') {
          const cash = ledgers.find(l => l.group === 'Cash-in-hand') || ledgers[0];
          const bank = ledgers.find(l => l.group === 'Bank Accounts') || ledgers[1];
          setLedgerEntries([
            { ledgerId: cash.id, ledgerName: cash.name, amount: 5000, drCr: 'Dr' },
            { ledgerId: bank.id, ledgerName: bank.name, amount: 5000, drCr: 'Cr' },
          ]);
        } else {
          // JOURNAL
          setLedgerEntries([
            { ledgerId: ledgers[0].id, ledgerName: ledgers[0].name, amount: 5000, drCr: 'Dr' },
            { ledgerId: ledgers[1]?.id || ledgers[0].id, ledgerName: ledgers[1]?.name || ledgers[0].name, amount: 5000, drCr: 'Cr' },
          ]);
        }
      }
    }
  }, [isOpen, voucherType]);

  // When party changes, auto-detect place of supply from party's state
  const handlePartyChange = (ledgerId: string) => {
    setPartyLedgerId(ledgerId);
    const party = ledgers.find(l => l.id === ledgerId);
    if (party?.stateCode) {
      setPlaceOfSupply(party.stateCode);
      recalculateAllItemTaxes(party.stateCode);
    }
  };

  const handlePlaceOfSupplyChange = (code: string) => {
    setPlaceOfSupply(code);
    recalculateAllItemTaxes(code);
  };

  const recalculateAllItemTaxes = (posCode: string) => {
    const isIntra = isIntraStateSupply(activeCompany.stateCode, posCode);
    setItems(prev =>
      prev.map(it => {
        const lineTax = calculateLineGst(it.quantity, it.rate, it.discountPercent, it.gstRate, isIntra, it.cessRate);
        return {
          ...it,
          taxableAmount: lineTax.taxableAmount,
          cgstAmount: lineTax.cgstAmount,
          sgstAmount: lineTax.sgstAmount,
          igstAmount: lineTax.igstAmount,
          cessAmount: lineTax.cessAmount,
          totalAmount: lineTax.totalAmount,
        };
      })
    );
  };

  // Add Item Line
  const handleAddItem = () => {
    if (stockItems.length === 0) return;
    const item = stockItems[0];
    const isIntra = isIntraStateSupply(activeCompany.stateCode, placeOfSupply);
    const rate = voucherType === 'PURCHASE' ? item.purchasePrice : item.salePrice;
    const lineTax = calculateLineGst(1, rate, 0, item.gstRate, isIntra, item.cessRate);

    setItems(prev => [
      ...prev,
      {
        itemId: item.id,
        itemName: item.name,
        hsnCode: item.hsnCode,
        godownId: godowns[0]?.id,
        quantity: 1,
        unit: item.unit,
        rate,
        discountPercent: 0,
        taxableAmount: lineTax.taxableAmount,
        gstRate: item.gstRate,
        cessRate: item.cessRate,
        cgstAmount: lineTax.cgstAmount,
        sgstAmount: lineTax.sgstAmount,
        igstAmount: lineTax.igstAmount,
        cessAmount: lineTax.cessAmount,
        totalAmount: lineTax.totalAmount,
      },
    ]);
  };

  const handleItemFieldChange = (index: number, field: string, value: any) => {
    setItems(prev => {
      const next = [...prev];
      const target = { ...next[index], [field]: value };

      if (field === 'itemId') {
        const selected = stockItems.find(s => s.id === value);
        if (selected) {
          target.itemName = selected.name;
          target.hsnCode = selected.hsnCode;
          target.unit = selected.unit;
          target.gstRate = selected.gstRate;
          target.cessRate = selected.cessRate;
          target.rate = voucherType === 'PURCHASE' ? selected.purchasePrice : selected.salePrice;
        }
      }

      const isIntra = isIntraStateSupply(activeCompany.stateCode, placeOfSupply);
      const lineTax = calculateLineGst(
        Number(target.quantity) || 0,
        Number(target.rate) || 0,
        Number(target.discountPercent) || 0,
        Number(target.gstRate) || 0,
        isIntra,
        Number(target.cessRate) || 0
      );

      target.taxableAmount = lineTax.taxableAmount;
      target.cgstAmount = lineTax.cgstAmount;
      target.sgstAmount = lineTax.sgstAmount;
      target.igstAmount = lineTax.igstAmount;
      target.cessAmount = lineTax.cessAmount;
      target.totalAmount = lineTax.totalAmount;

      next[index] = target;
      return next;
    });
  };

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  // Calculations for totals
  const itemsTaxable = items.reduce((acc, it) => acc + it.taxableAmount, 0);
  const itemsCgst = items.reduce((acc, it) => acc + it.cgstAmount, 0);
  const itemsSgst = items.reduce((acc, it) => acc + it.sgstAmount, 0);
  const itemsIgst = items.reduce((acc, it) => acc + it.igstAmount, 0);
  const itemsCess = items.reduce((acc, it) => acc + it.cessAmount, 0);

  const extraCharges = (Number(freightCharges) || 0) + (Number(packingCharges) || 0) + (Number(insuranceCharges) || 0);
  const taxableTotal = itemsTaxable + extraCharges;
  const rawGrandTotal = taxableTotal + itemsCgst + itemsSgst + itemsIgst + itemsCess;
  const grandTotal = Math.round(rawGrandTotal);
  const roundOff = Math.round((grandTotal - rawGrandTotal) * 100) / 100;

    // Save Voucher
  const handleSaveVoucher = (forcePrint = false) => {
    const party = ledgers.find(l => l.id === partyLedgerId);

    // Generate simulated IRN and e-Way bill if sales > 50k
    let irn: string | undefined;
    let signedQrCode: string | undefined;
    let ackNumber: string | undefined;
    let ackDate: string | undefined;
    let eWayBillNumber: string | undefined;
    let eWayBillDate: string | undefined;

    if (voucherType === 'SALES' && party?.gstin) {
      irn = generateSimulatedIrn(activeCompany.gstin, voucherNumber, 'INV', date);
      signedQrCode = generateQrPayload(activeCompany.gstin, party.gstin, voucherNumber, date, taxableTotal, itemsCgst + itemsSgst + itemsIgst, irn);
      ackNumber = `11261${Math.floor(1000000 + Math.random() * 9000000)}`;
      ackDate = `${date} 12:00:00`;
    }

    if (generateEWay || grandTotal > 50000) {
      eWayBillNumber = `27100${Math.floor(1000000 + Math.random() * 9000000)}`;
      eWayBillDate = date;
    }

    // Prepare ledger entries for double entry posting
    let finalLedgerEntries: LedgerVoucherEntry[] = [];
    if (isInventoryVoucher) {
      if (voucherType === 'SALES') {
        const isIntra = isIntraStateSupply(activeCompany.stateCode, placeOfSupply);
        finalLedgerEntries = [
          { ledgerId: partyLedgerId, ledgerName: party?.name || 'Customer', amount: grandTotal, drCr: 'Dr' },
          { ledgerId: 'led-sales-dom', ledgerName: isIntra ? 'Sales Domestic GST' : 'Sales Inter-State IGST', amount: taxableTotal, drCr: 'Cr' },
        ];
        if (itemsCgst > 0) finalLedgerEntries.push({ ledgerId: 'led-cgst-out', ledgerName: 'Output CGST', amount: itemsCgst, drCr: 'Cr' });
        if (itemsSgst > 0) finalLedgerEntries.push({ ledgerId: 'led-sgst-out', ledgerName: 'Output SGST', amount: itemsSgst, drCr: 'Cr' });
        if (itemsIgst > 0) finalLedgerEntries.push({ ledgerId: 'led-igst-out', ledgerName: 'Output IGST', amount: itemsIgst, drCr: 'Cr' });
      } else if (voucherType === 'PURCHASE') {
        const isIntra = isIntraStateSupply(activeCompany.stateCode, placeOfSupply);
        finalLedgerEntries = [
          { ledgerId: 'led-pur-dom', ledgerName: isIntra ? 'Purchase Domestic GST' : 'Purchase Inter-State IGST', amount: taxableTotal, drCr: 'Dr' },
          { ledgerId: partyLedgerId, ledgerName: party?.name || 'Supplier', amount: grandTotal, drCr: 'Cr' },
        ];
        if (itemsCgst > 0) finalLedgerEntries.push({ ledgerId: 'led-cgst-in', ledgerName: 'Input CGST', amount: itemsCgst, drCr: 'Dr' });
        if (itemsSgst > 0) finalLedgerEntries.push({ ledgerId: 'led-sgst-in', ledgerName: 'Input SGST', amount: itemsSgst, drCr: 'Dr' });
        if (itemsIgst > 0) finalLedgerEntries.push({ ledgerId: 'led-igst-in', ledgerName: 'Input IGST', amount: itemsIgst, drCr: 'Dr' });
      }
    } else {
      finalLedgerEntries = ledgerEntries;
    }

    const created = createVoucher({
      companyId: activeCompany.id,
      voucherType,
      voucherNumber,
      date,
      partyLedgerId: partyLedgerId || undefined,
      partyName: party?.name,
      partyGstin: party?.gstin,
      partyState: party?.state,
      partyStateCode: party?.stateCode,
      placeOfSupply,
      reverseCharge,
      billingAddress: party?.address,
      supplierInvoiceNumber: supplierInvNo || undefined,
      supplierInvoiceDate: supplierInvDate || undefined,
      itcEligibility: voucherType === 'PURCHASE' ? itcEligibility : undefined,
      originalInvoiceRef: originalInvoiceRef || undefined,
      items,
      ledgerEntries: finalLedgerEntries,
      freightCharges,
      packingCharges,
      insuranceCharges,
      roundOff,
      taxableTotal,
      cgstTotal: itemsCgst,
      sgstTotal: itemsSgst,
      igstTotal: itemsIgst,
      cessTotal: itemsCess,
      grandTotal: isInventoryVoucher ? grandTotal : (ledgerEntries[0]?.amount || 0),
      narration: narration || `Voucher ${voucherNumber} recorded on ${date}`,
      eWayBillNumber,
      eWayBillDate,
      transporterId: transporterId || undefined,
      vehicleNumber: vehicleNumber || undefined,
      distanceKm: distanceKm || undefined,
      irn,
      signedQrCode,
      ackNumber,
      ackDate,
      createdBy: activeCompany.name,
    });

    onClose();
    if (onPrintVoucher && (forcePrint || voucherType === 'SALES' || voucherType === 'DELIVERY_CHALLAN' || voucherType === 'QUOTATION')) {
      onPrintVoucher(created.id);
    }
  };

  // Keyboard shortcut listener for Ctrl+P inside the active voucher modal
  useEffect(() => {
    if (!isOpen) return;
    const handleModalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey || e.altKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        handleSaveVoucher(true);
      }
    };
    window.addEventListener('keydown', handleModalKeyDown);
    return () => window.removeEventListener('keydown', handleModalKeyDown);
  }, [
    isOpen,
    partyLedgerId,
    date,
    voucherNumber,
    items,
    ledgerEntries,
    taxableTotal,
    itemsCgst,
    itemsSgst,
    itemsIgst,
    itemsCess,
    grandTotal,
    narration,
  ]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-card text-card-foreground w-full max-w-5xl rounded-sm shadow-2xl border border-border overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Voucher Header with Tally Ribbon */}
        <div className="bg-muted/60 text-foreground p-4 px-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-wider font-extrabold bg-primary text-primary-foreground px-2.5 py-1 rounded-sm font-mono shadow-xs">
              {voucherType} VOUCHER
            </span>
            <div className="text-muted-foreground text-xs">
              Company: <strong className="text-foreground">{activeCompany.tradeName || activeCompany.name}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSaveVoucher(true)}
              className="px-2.5 py-1 text-xs font-semibold bg-card hover:bg-accent text-foreground border border-border rounded-sm transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Save & Open GST Print Preview [Ctrl+P]"
            >
              <Printer size={13} />
              <span className="hidden sm:inline">Print Preview [Ctrl+P]</span>
            </button>
            <span className="text-xs text-muted-foreground font-mono hidden md:inline">
              [Ctrl+A] Save · [Esc] Cancel
            </span>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-sm">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 max-h-[78vh] overflow-y-auto space-y-5">
          {/* Top metadata grid: Voucher No, Date, Party, Place of Supply */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/40 rounded-sm border border-border">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Voucher No.
              </label>
              <input
                type="text"
                value={voucherNumber}
                onChange={e => setVoucherNumber(e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-mono font-bold border border-input rounded-sm bg-background text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Date [F2]
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-mono border border-input rounded-sm bg-background text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>

            {isInventoryVoucher && (
              <>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                      Party A/c Name
                    </label>
                    {onOpenMasterCreateModal && (
                      <button
                        type="button"
                        onClick={onOpenMasterCreateModal}
                        className="text-[10px] text-primary hover:underline font-bold"
                      >
                        + Create [Alt+C]
                      </button>
                    )}
                  </div>
                  <select
                    value={partyLedgerId}
                    onChange={e => handlePartyChange(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-medium border border-input rounded-sm bg-background text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                  >
                    <option value="">-- Select Party Ledger --</option>
                    {ledgers
                      .filter(l =>
                        voucherType === 'PURCHASE'
                          ? l.group === 'Sundry Creditors'
                          : l.group === 'Sundry Debtors' || l.group === 'Cash-in-hand'
                      )
                      .map(led => (
                        <option key={led.id} value={led.id}>
                          {led.name} {led.gstin ? `(${led.gstin})` : ''}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Place of Supply (POS)
                  </label>
                  <select
                    value={placeOfSupply}
                    onChange={e => handlePlaceOfSupplyChange(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-medium border border-input rounded-sm bg-background text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                  >
                    {INDIAN_STATES.map(s => (
                      <option key={s.code} value={s.code}>
                        {s.code} - {s.name} {s.code === activeCompany.stateCode ? '(Intra-State)' : '(Inter-State IGST)'}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Supplier Reference & Notes linkage if Purchase / Credit Note */}
          {voucherType === 'PURCHASE' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 bg-muted/40 rounded-sm border border-border text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-foreground mb-1">Supplier Inv No.</label>
                <input
                  type="text"
                  placeholder="e.g. DELL-2026-991"
                  value={supplierInvNo}
                  onChange={e => setSupplierInvNo(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-input rounded-sm bg-background text-foreground font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-foreground mb-1">Supplier Inv Date</label>
                <input
                  type="date"
                  value={supplierInvDate}
                  onChange={e => setSupplierInvDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-input rounded-sm bg-background text-foreground font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-foreground mb-1">ITC Eligibility</label>
                <select
                  value={itcEligibility}
                  onChange={e => setItcEligibility(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 border border-input rounded-sm bg-background text-foreground font-medium"
                >
                  <option value="INPUTS">Eligible ITC - Inputs (Goods)</option>
                  <option value="CAPITAL_GOODS">Eligible ITC - Capital Goods</option>
                  <option value="INELIGIBLE">Ineligible ITC</option>
                </select>
              </div>
            </div>
          )}

          {/* Linked Invoice Ref if Credit or Debit Note */}
          {(voucherType === 'CREDIT_NOTE' || voucherType === 'DEBIT_NOTE') && (
            <div className="p-3 bg-amber-500/10 rounded-sm border border-amber-500/30 text-xs flex items-center gap-3">
              <span className="font-semibold text-foreground">Original Tax Invoice Ref:</span>
              <input
                type="text"
                value={originalInvoiceRef}
                onChange={e => setOriginalInvoiceRef(e.target.value)}
                placeholder="e.g. NB/26-27/001"
                className="px-3 py-1 bg-background text-foreground border border-input rounded-sm font-mono text-xs"
              />
              <span className="text-[11px] text-muted-foreground font-mono">Required under GST Table 9B reporting</span>
            </div>
          )}

          {/* Line Items Table (For Inventory Vouchers) */}
          {isInventoryVoucher ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                  Itemized Supplies & HSN Tax Schedule
                </h4>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-3 py-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-sm transition-colors flex items-center gap-1 border border-primary/20"
                >
                  <Plus size={13} /> Add Stock Item [Alt+C]
                </button>
              </div>

              <div className="border border-border rounded-sm overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted text-muted-foreground font-semibold border-b border-border text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">Item Description</th>
                      <th className="py-2.5 px-2">HSN/SAC</th>
                      <th className="py-2.5 px-2">Godown</th>
                      <th className="py-2.5 px-2 text-right">Qty</th>
                      <th className="py-2.5 px-2 text-right">Rate (₹)</th>
                      <th className="py-2.5 px-2 text-right">Disc %</th>
                      <th className="py-2.5 px-2 text-right">Taxable (₹)</th>
                      <th className="py-2.5 px-2 text-right">GST %</th>
                      <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                      <th className="py-2.5 px-2 text-center w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((row, idx) => (
                      <tr key={idx} className="hover:bg-muted/30 transition-colors">
                        {/* Item Picker */}
                        <td className="py-2 px-3">
                          <select
                            value={row.itemId}
                            onChange={e => handleItemFieldChange(idx, 'itemId', e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-input rounded-sm bg-background text-foreground font-medium"
                          >
                            {stockItems.map(s => (
                              <option key={s.id} value={s.id}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* HSN */}
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            value={row.hsnCode}
                            onChange={e => handleItemFieldChange(idx, 'hsnCode', e.target.value)}
                            className="w-20 px-2 py-1 font-mono text-xs border border-input rounded-sm text-foreground bg-background"
                          />
                        </td>

                        {/* Godown */}
                        <td className="py-2 px-2">
                          <select
                            value={row.godownId}
                            onChange={e => handleItemFieldChange(idx, 'godownId', e.target.value)}
                            className="w-24 px-1.5 py-1 text-xs border border-input rounded-sm bg-background text-foreground truncate"
                          >
                            {godowns.map(g => (
                              <option key={g.id} value={g.id}>
                                {g.name}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Qty */}
                        <td className="py-2 px-2 text-right">
                          <input
                            type="number"
                            min="1"
                            value={row.quantity}
                            onChange={e => handleItemFieldChange(idx, 'quantity', e.target.value)}
                            className="w-16 px-2 py-1 font-mono text-xs border border-input rounded-sm text-right bg-background text-foreground"
                          />
                        </td>

                        {/* Rate */}
                        <td className="py-2 px-2 text-right">
                          <input
                            type="number"
                            value={row.rate}
                            onChange={e => handleItemFieldChange(idx, 'rate', e.target.value)}
                            className="w-24 px-2 py-1 font-mono text-xs border border-input rounded-sm text-right bg-background text-foreground"
                          />
                        </td>

                        {/* Disc % */}
                        <td className="py-2 px-2 text-right">
                          <input
                            type="number"
                            value={row.discountPercent}
                            onChange={e => handleItemFieldChange(idx, 'discountPercent', e.target.value)}
                            className="w-14 px-2 py-1 font-mono text-xs border border-input rounded-sm text-right bg-background text-foreground"
                          />
                        </td>

                        {/* Taxable Value */}
                        <td className="py-2 px-2 text-right font-mono font-medium text-foreground">
                          ₹{row.taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>

                        {/* GST % */}
                        <td className="py-2 px-2 text-right">
                          <select
                            value={row.gstRate}
                            onChange={e => handleItemFieldChange(idx, 'gstRate', Number(e.target.value))}
                            className="px-1.5 py-1 text-xs border border-input rounded-sm bg-background text-foreground font-mono"
                          >
                            <option value={0}>0%</option>
                            <option value={5}>5%</option>
                            <option value={12}>12%</option>
                            <option value={18}>18%</option>
                            <option value={28}>28%</option>
                          </select>
                        </td>

                        {/* Total Line Amount */}
                        <td className="py-2 px-3 text-right font-mono font-bold text-foreground">
                          ₹{row.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>

                        {/* Delete row */}
                        <td className="py-2 px-2 text-center">
                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="text-muted-foreground hover:text-destructive p-1 rounded-sm transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Accounting Voucher Ledger Grid */
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                Accounting Ledger Breakdown (Double-Entry)
              </h4>
              <div className="border border-border rounded-sm overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted text-muted-foreground font-semibold border-b border-border text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3 w-20">Dr / Cr</th>
                      <th className="py-2.5 px-3">Particulars (Ledger Name)</th>
                      <th className="py-2.5 px-3 text-right">Debit (₹)</th>
                      <th className="py-2.5 px-3 text-right">Credit (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {ledgerEntries.map((entry, idx) => (
                      <tr key={idx} className="hover:bg-muted/30 transition-colors">
                        <td className="py-2 px-3">
                          <span
                            className={`font-mono font-bold px-2 py-0.5 rounded-sm text-xs ${
                              entry.drCr === 'Dr' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                            }`}
                          >
                            {entry.drCr}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <select
                            value={entry.ledgerId}
                            onChange={e => {
                              const chosen = ledgers.find(l => l.id === e.target.value);
                              setLedgerEntries(prev => {
                                const next = [...prev];
                                next[idx] = {
                                  ...next[idx],
                                  ledgerId: e.target.value,
                                  ledgerName: chosen?.name || '',
                                };
                                return next;
                              });
                            }}
                            className="w-full px-2 py-1 text-xs border border-input rounded-sm bg-background text-foreground"
                          >
                            {ledgers.map(l => (
                              <option key={l.id} value={l.id}>
                                {l.name} ({l.group})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 px-3 text-right">
                          {entry.drCr === 'Dr' ? (
                            <input
                              type="number"
                              value={entry.amount}
                              onChange={e => {
                                const val = Number(e.target.value) || 0;
                                setLedgerEntries(prev => prev.map(p => ({ ...p, amount: val })));
                              }}
                              className="w-32 px-2 py-1 text-xs font-mono text-right border border-input rounded-sm bg-background text-foreground"
                            />
                          ) : (
                            <span className="text-muted-foreground font-mono">-</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right">
                          {entry.drCr === 'Cr' ? (
                            <input
                              type="number"
                              value={entry.amount}
                              onChange={e => {
                                const val = Number(e.target.value) || 0;
                                setLedgerEntries(prev => prev.map(p => ({ ...p, amount: val })));
                              }}
                              className="w-32 px-2 py-1 text-xs font-mono text-right border border-input rounded-sm bg-background text-foreground"
                            />
                          ) : (
                            <span className="text-muted-foreground font-mono">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Additional Charges & Freight */}
          {isInventoryVoucher && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-muted/40 rounded-sm border border-border text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-foreground mb-1">Freight Charges (₹)</label>
                <input
                  type="number"
                  value={freightCharges || ''}
                  onChange={e => setFreightCharges(Number(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full px-2.5 py-1.5 font-mono border border-input rounded-sm bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-foreground mb-1">Packaging Charges (₹)</label>
                <input
                  type="number"
                  value={packingCharges || ''}
                  onChange={e => setPackingCharges(Number(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full px-2.5 py-1.5 font-mono border border-input rounded-sm bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-foreground mb-1">Insurance (₹)</label>
                <input
                  type="number"
                  value={insuranceCharges || ''}
                  onChange={e => setInsuranceCharges(Number(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full px-2.5 py-1.5 font-mono border border-input rounded-sm bg-background text-foreground"
                />
              </div>
            </div>
          )}

          {/* e-Way Bill Collapsible Toggle */}
          {isInventoryVoucher && (
            <div className="p-3 bg-muted/40 rounded-sm border border-border space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-foreground">
                  <input
                    type="checkbox"
                    checked={generateEWay || grandTotal > 50000}
                    onChange={e => setGenerateEWay(e.target.checked)}
                    className="w-4 h-4 text-primary rounded-sm"
                  />
                  <span>Generate e-Way Bill {grandTotal > 50000 && '(Mandatory for Consignment > ₹50,000)'}</span>
                </label>
                <Truck size={15} className="text-primary" />
              </div>

              {(generateEWay || grandTotal > 50000) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
                  <div>
                    <label className="block text-[11px] text-muted-foreground mb-1">Transporter ID (GSTIN)</label>
                    <input
                      type="text"
                      value={transporterId}
                      onChange={e => setTransporterId(e.target.value)}
                      placeholder="27AAACK4411P1Z0"
                      className="w-full px-2.5 py-1.5 font-mono border border-input rounded-sm bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-muted-foreground mb-1">Vehicle Number</label>
                    <input
                      type="text"
                      value={vehicleNumber}
                      onChange={e => setVehicleNumber(e.target.value)}
                      placeholder="MH-04-AZ-4421"
                      className="w-full px-2.5 py-1.5 font-mono border border-input rounded-sm bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-muted-foreground mb-1">Approx Distance (KM)</label>
                    <input
                      type="number"
                      value={distanceKm || ''}
                      onChange={e => setDistanceKm(Number(e.target.value) || 0)}
                      placeholder="45"
                      className="w-full px-2.5 py-1.5 font-mono border border-input rounded-sm bg-background text-foreground"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Narration & Calculation Summary Footer */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end pt-2">
            <div className="md:col-span-7">
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Narration / Remarks
              </label>
              <textarea
                rows={3}
                value={narration}
                onChange={e => setNarration(e.target.value)}
                placeholder="Being goods sold on 30-day credit against purchase order..."
                className="w-full px-3 py-2 text-xs border border-input rounded-sm bg-background text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>

            {/* Calculations Breakdown */}
            {isInventoryVoucher && (
              <div className="md:col-span-5 bg-muted/40 p-4 rounded-sm border border-border text-xs space-y-1.5">
                <div className="flex justify-between text-muted-foreground">
                  <span>Taxable Value:</span>
                  <span className="font-mono tabular-nums text-foreground">₹{taxableTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                {itemsCgst > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Central GST (CGST):</span>
                    <span className="font-mono tabular-nums text-foreground">₹{itemsCgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                {itemsSgst > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>State GST (SGST):</span>
                    <span className="font-mono tabular-nums text-foreground">₹{itemsSgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                {itemsIgst > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Integrated GST (IGST):</span>
                    <span className="font-mono tabular-nums text-foreground">₹{itemsIgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                {roundOff !== 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Round Off:</span>
                    <span className="font-mono tabular-nums text-foreground">{roundOff > 0 ? `+₹${roundOff}` : `-₹${Math.abs(roundOff)}`}</span>
                  </div>
                )}
                <div className="flex justify-between text-foreground font-extrabold text-sm border-t border-border pt-2">
                  <span className="font-serif">Invoice Total:</span>
                  <span className="font-mono text-primary font-bold">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="bg-muted/40 p-4 px-6 border-t border-border flex items-center justify-between">
          <div className="text-[11px] text-muted-foreground font-mono">
            Save shortcut: <kbd className="font-bold text-foreground bg-muted px-1.5 py-0.5 rounded-sm border border-border">Ctrl + A</kbd>
          </div>

          <div className="flex gap-2 items-center">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 text-xs font-semibold text-muted-foreground hover:bg-muted rounded-sm transition-colors cursor-pointer"
            >
              Cancel [Esc]
            </button>
            <button
              type="button"
              onClick={() => handleSaveVoucher(true)}
              className="py-2 px-3.5 text-xs font-semibold text-foreground bg-card hover:bg-muted border border-border rounded-sm shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Save voucher and instantly open professional GST print layout [Ctrl+P]"
            >
              <Printer size={14} /> Print Preview [Ctrl+P]
            </button>
            <button
              type="button"
              onClick={() => handleSaveVoucher(false)}
              className="py-2 px-5 text-xs font-bold text-primary-foreground bg-primary hover:bg-primary/90 rounded-sm shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Save size={14} /> Commit Voucher [Ctrl+A]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
