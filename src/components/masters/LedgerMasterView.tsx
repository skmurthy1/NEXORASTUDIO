/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Search, Building2, Package, Layers, MapPin, Sparkles, Trash2, Edit2, X, Send } from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { STANDARD_TALLY_GROUPS, INDIAN_STATES } from '../../data/seedData';
import { lookupGstin } from '../../services/gstEngine';
import { Ledger, StockItem, Godown } from '../../types/erp';
import { WhatsAppDocType } from '../../services/whatsappService';

interface LedgerMasterViewProps {
  onOpenWhatsApp?: (docType: WhatsAppDocType, voucher?: any, ledger?: any) => void;
}

export const LedgerMasterView: React.FC<LedgerMasterViewProps> = ({ onOpenWhatsApp }) => {
  const { ledgers, stockItems, godowns, createLedger, createStockItem, createGodown, activeCompany } = useErp();
  const [activeTab, setActiveTab] = useState<'LEDGERS' | 'STOCK' | 'GODOWNS'>('LEDGERS');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('ALL');

  // Modals for creation
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isGodownModalOpen, setIsGodownModalOpen] = useState(false);

  // New Ledger Form State
  const [ledgerName, setLedgerName] = useState('');
  const [ledgerGroup, setLedgerGroup] = useState('Sundry Debtors');
  const [ledgerOpeningBal, setLedgerOpeningBal] = useState<number>(0);
  const [ledgerDrCr, setLedgerDrCr] = useState<'Dr' | 'Cr'>('Dr');
  const [ledgerGstin, setLedgerGstin] = useState('');
  const [ledgerPan, setLedgerPan] = useState('');
  const [ledgerStateCode, setLedgerStateCode] = useState('27');
  const [ledgerAddress, setLedgerAddress] = useState('');
  const [ledgerPhone, setLedgerPhone] = useState('');
  const [ledgerEmail, setLedgerEmail] = useState('');
  const [ledgerCreditDays, setLedgerCreditDays] = useState<number>(30);

  // New Stock Form State
  const [itemName, setItemName] = useState('');
  const [itemGroup, setItemGroup] = useState('General Electronics');
  const [itemHsn, setItemHsn] = useState('8471');
  const [itemUnit, setItemUnit] = useState('NOS');
  const [itemGstRate, setItemGstRate] = useState<number>(18);
  const [itemSalePrice, setItemSalePrice] = useState<number>(0);
  const [itemPurchasePrice, setItemPurchasePrice] = useState<number>(0);
  const [itemOpeningStock, setItemOpeningStock] = useState<number>(0);
  const [itemReorderLevel, setItemReorderLevel] = useState<number>(5);

  // New Godown Form State
  const [godownName, setGodownName] = useState('');
  const [godownLocation, setGodownLocation] = useState('');

  // Auto-fill from GSTIN in Ledger modal
  const handleGstinBlur = (gst: string) => {
    const found = lookupGstin(gst);
    if (found) {
      setLedgerName(found.legalName || found.tradeName);
      setLedgerStateCode(found.stateCode);
      setLedgerAddress(found.address);
      if (gst.length === 15) {
        setLedgerPan(gst.substring(2, 12));
      }
    }
  };

  const handleSaveLedger = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ledgerName.trim()) return;

    createLedger({
      companyId: activeCompany.id,
      name: ledgerName.trim(),
      group: ledgerGroup,
      openingBalance: Number(ledgerOpeningBal) || 0,
      currentBalance: Number(ledgerOpeningBal) || 0,
      drCr: ledgerDrCr,
      gstin: ledgerGstin ? ledgerGstin.toUpperCase().trim() : undefined,
      pan: ledgerPan ? ledgerPan.toUpperCase().trim() : undefined,
      stateCode: ledgerStateCode,
      state: INDIAN_STATES.find(s => s.code === ledgerStateCode)?.name || 'Maharashtra',
      address: ledgerAddress.trim() || undefined,
      phone: ledgerPhone.trim() || undefined,
      email: ledgerEmail.trim() || undefined,
      creditDays: ledgerCreditDays || 30,
    });

    setIsLedgerModalOpen(false);
    // Reset
    setLedgerName('');
    setLedgerOpeningBal(0);
    setLedgerGstin('');
    setLedgerAddress('');
  };

  const handleSaveStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    createStockItem({
      companyId: activeCompany.id,
      name: itemName.trim(),
      group: itemGroup,
      hsnCode: itemHsn.trim() || '8471',
      unit: itemUnit,
      gstRate: Number(itemGstRate) || 18,
      cessRate: 0,
      salePrice: Number(itemSalePrice) || 0,
      purchasePrice: Number(itemPurchasePrice) || 0,
      mrp: (Number(itemSalePrice) || 0) * 1.15,
      openingStock: Number(itemOpeningStock) || 0,
      currentStock: Number(itemOpeningStock) || 0,
      reorderLevel: Number(itemReorderLevel) || 5,
      valuationMethod: 'FIFO',
      godownStock: {},
      batchEnabled: false,
    });

    setIsStockModalOpen(false);
    setItemName('');
  };

  const handleSaveGodown = (e: React.FormEvent) => {
    e.preventDefault();
    if (!godownName.trim()) return;
    createGodown({
      companyId: activeCompany.id,
      name: godownName.trim(),
      location: godownLocation.trim(),
      isDefault: false,
    });
    setIsGodownModalOpen(false);
    setGodownName('');
    setGodownLocation('');
  };

  const filteredLedgers = ledgers.filter(l => {
    const matchesGroup = selectedGroupFilter === 'ALL' || l.group === selectedGroupFilter;
    const matchesSearch =
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.group.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.gstin && l.gstin.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesGroup && matchesSearch;
  });

  const filteredStock = stockItems.filter(
    s =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.hsnCode.includes(searchQuery) ||
      s.group.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs">
            <span className="uppercase tracking-wider font-semibold text-muted-foreground">
              Master Directory
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="text-primary font-mono font-medium">
              28 Standard Tally Groups
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-foreground">
            Chart of Accounts & Stock Masters
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'LEDGERS' && (
            <button
              onClick={() => setIsLedgerModalOpen(true)}
              className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} /> Create Ledger [Alt+C]
            </button>
          )}
          {activeTab === 'STOCK' && (
            <button
              onClick={() => setIsStockModalOpen(true)}
              className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} /> Create Stock Item [Alt+C]
            </button>
          )}
          {activeTab === 'GODOWNS' && (
            <button
              onClick={() => setIsGodownModalOpen(true)}
              className="px-3 py-1.5 text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-sm shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} /> Add Godown
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-sm w-fit text-xs border border-border">
        <button
          onClick={() => setActiveTab('LEDGERS')}
          className={`px-3 py-1.5 font-medium rounded-sm transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'LEDGERS'
              ? 'bg-card text-foreground font-semibold shadow-2xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Building2 size={13} /> Ledgers ({ledgers.length})
        </button>
        <button
          onClick={() => setActiveTab('STOCK')}
          className={`px-3 py-1.5 font-medium rounded-sm transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'STOCK'
              ? 'bg-card text-foreground font-semibold shadow-2xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Package size={13} /> Stock Items ({stockItems.length})
        </button>
        <button
          onClick={() => setActiveTab('GODOWNS')}
          className={`px-3 py-1.5 font-medium rounded-sm transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'GODOWNS'
              ? 'bg-card text-foreground font-semibold shadow-2xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <MapPin size={13} /> Godowns ({godowns.length})
        </button>
      </div>

      {/* Search & Sub-Filter Strip */}
      <div className="bg-card p-3.5 rounded-sm border border-border shadow-2xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={`Search in ${activeTab.toLowerCase()} by name, group, code...`}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-border rounded-sm bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary transition-all"
          />
        </div>

        {activeTab === 'LEDGERS' && (
          <div className="flex items-center gap-2 self-start md:self-auto text-xs">
            <span className="text-muted-foreground whitespace-nowrap font-medium">Group:</span>
            <select
              value={selectedGroupFilter}
              onChange={e => setSelectedGroupFilter(e.target.value)}
              className="px-2.5 py-1 text-xs border border-border rounded-sm bg-background text-foreground font-medium"
            >
              <option value="ALL">All Standard Groups</option>
              {STANDARD_TALLY_GROUPS.map(g => (
                <option key={g.id} value={g.name}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Table view for Ledgers */}
      {activeTab === 'LEDGERS' && (
        <div className="bg-card rounded-sm border border-border shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/60 text-muted-foreground font-semibold border-b border-border text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Ledger Name</th>
                <th className="py-2.5 px-3">Tally Group</th>
                <th className="py-2.5 px-3">GSTIN / State</th>
                <th className="py-2.5 px-3 text-right">Opening Bal (₹)</th>
                <th className="py-2.5 px-3 text-right">Current Balance (₹)</th>
                <th className="py-2.5 px-2 text-center">Dr / Cr</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLedgers.map(led => (
                <tr key={led.id} className="hover:bg-muted/40 transition-colors">
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-foreground">{led.name}</div>
                    {led.address && <div className="text-[11px] text-muted-foreground truncate max-w-xs">{led.address}</div>}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-foreground">{led.group}</td>
                  <td className="py-2.5 px-3 font-mono text-muted-foreground">
                    {led.gstin ? (
                      <div>
                        <span className="font-bold text-foreground">{led.gstin}</span>
                        <div className="text-[10px] text-muted-foreground">{led.state}</div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-muted-foreground">
                    ₹{led.openingBalance.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground tabular-nums">
                    ₹{led.currentBalance.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-xs font-mono ${
                        led.drCr === 'Dr'
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                      }`}
                    >
                      {led.drCr}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {onOpenWhatsApp && (
                      <button
                        onClick={() => onOpenWhatsApp('LEDGER_REPORT', undefined, led)}
                        title="Send Ledger Statement via WhatsApp"
                        className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-sm transition-colors cursor-pointer"
                      >
                        <Send className="size-3 text-emerald-600 dark:text-emerald-400" />
                        <span>WhatsApp</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Stock Items Table */}
      {activeTab === 'STOCK' && (
        <div className="bg-card rounded-sm border border-border shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/60 text-muted-foreground font-semibold border-b border-border text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Stock Item Name</th>
                <th className="py-2.5 px-3">HSN Code</th>
                <th className="py-2.5 px-3">Group</th>
                <th className="py-2.5 px-3 text-right">Sale Price (₹)</th>
                <th className="py-2.5 px-3 text-right">Purchase (₹)</th>
                <th className="py-2.5 px-2 text-center">GST Rate</th>
                <th className="py-2.5 px-3 text-right">Current Stock</th>
                <th className="py-2.5 px-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredStock.map(it => (
                <tr key={it.id} className="hover:bg-muted/40 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-foreground">{it.name}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-primary">{it.hsnCode}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{it.group}</td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-foreground">₹{it.salePrice.toLocaleString('en-IN')}</td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-muted-foreground">₹{it.purchasePrice.toLocaleString('en-IN')}</td>
                  <td className="py-2.5 px-2 text-center font-mono font-bold text-foreground">{it.gstRate}%</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground tabular-nums">
                    {it.currentStock} {it.unit}
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    {it.currentStock <= it.reorderLevel ? (
                      <span className="text-[10px] bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20 font-bold px-1.5 py-0.5 rounded-xs">
                        Reorder Alert
                      </span>
                    ) : (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-bold px-1.5 py-0.5 rounded-xs">
                        In Stock
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Godowns Grid */}
      {activeTab === 'GODOWNS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {godowns.map(g => (
            <div key={g.id} className="bg-card p-4 rounded-sm border border-border shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-primary font-mono">
                  {g.isDefault ? 'Primary Warehouse' : 'Sub-Godown'}
                </span>
                <MapPin size={14} className="text-muted-foreground" />
              </div>
              <h3 className="font-bold text-sm text-foreground">{g.name}</h3>
              <p className="text-xs text-muted-foreground">{g.location}</p>
            </div>
          ))}
        </div>
      )}

      {/* Create Ledger Modal */}
      {isLedgerModalOpen && (
        <div className="fixed inset-0 z-60 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground w-full max-w-lg rounded-sm shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-sidebar border-b border-border p-4 flex items-center justify-between">
              <h3 className="font-serif font-bold text-sm text-foreground">Create New Ledger Account</h3>
              <button onClick={() => setIsLedgerModalOpen(false)} className="text-muted-foreground hover:text-foreground p-1 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveLedger} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">Ledger Name *</label>
                <input
                  type="text"
                  required
                  value={ledgerName}
                  onChange={e => setLedgerName(e.target.value)}
                  placeholder="e.g. Acme Tech Solutions Pvt Ltd"
                  className="w-full px-3 py-1.5 border border-border rounded-sm bg-background text-foreground text-xs"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Under Group *</label>
                  <select
                    value={ledgerGroup}
                    onChange={e => setLedgerGroup(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-border rounded-sm bg-background text-foreground text-xs"
                  >
                    {STANDARD_TALLY_GROUPS.map(g => (
                      <option key={g.id} value={g.name}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">GSTIN (Optional auto-fill)</label>
                  <input
                    type="text"
                    maxLength={15}
                    value={ledgerGstin}
                    onChange={e => setLedgerGstin(e.target.value.toUpperCase())}
                    onBlur={e => handleGstinBlur(e.target.value)}
                    placeholder="27AAAAA0000A1Z5"
                    className="w-full px-2.5 py-1.5 font-mono uppercase border border-border rounded-sm bg-background text-foreground text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Registered Address</label>
                <input
                  type="text"
                  value={ledgerAddress}
                  onChange={e => setLedgerAddress(e.target.value)}
                  placeholder="Street, Industrial Area, City"
                  className="w-full px-3 py-1.5 border border-border rounded-sm bg-background text-foreground text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">State & POS</label>
                  <select
                    value={ledgerStateCode}
                    onChange={e => setLedgerStateCode(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-border rounded-sm bg-background text-foreground text-xs"
                  >
                    {INDIAN_STATES.map(s => (
                      <option key={s.code} value={s.code}>
                        {s.code} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Opening Balance (₹)</label>
                  <div className="flex gap-1">
                    <input
                      type="number"
                      value={ledgerOpeningBal || ''}
                      onChange={e => setLedgerOpeningBal(Number(e.target.value) || 0)}
                      placeholder="0.00"
                      className="w-full px-2.5 py-1.5 font-mono border border-border rounded-sm bg-background text-foreground text-xs"
                    />
                    <select
                      value={ledgerDrCr}
                      onChange={e => setLedgerDrCr(e.target.value as any)}
                      className="px-2 py-1.5 font-mono font-bold border border-border rounded-sm bg-muted text-foreground text-xs"
                    >
                      <option value="Dr">Dr</option>
                      <option value="Cr">Cr</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsLedgerModalOpen(false)}
                  className="px-3 py-1.5 text-muted-foreground hover:bg-muted rounded-sm font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-sm shadow-2xs cursor-pointer"
                >
                  Save Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Stock Modal */}
      {isStockModalOpen && (
        <div className="fixed inset-0 z-60 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground w-full max-w-lg rounded-sm shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-sidebar border-b border-border p-4 flex items-center justify-between">
              <h3 className="font-serif font-bold text-sm text-foreground">Create Stock Item</h3>
              <button onClick={() => setIsStockModalOpen(false)} className="text-muted-foreground hover:text-foreground p-1 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveStock} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">Item Name *</label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={e => setItemName(e.target.value)}
                  placeholder="e.g. Dell Latitude 5440 Core i7"
                  className="w-full px-3 py-1.5 border border-border rounded-sm bg-background text-foreground text-xs"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">HSN/SAC Code *</label>
                  <input
                    type="text"
                    required
                    value={itemHsn}
                    onChange={e => setItemHsn(e.target.value)}
                    placeholder="8471"
                    className="w-full px-2.5 py-1.5 font-mono border border-border rounded-sm bg-background text-foreground text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Unit of Measure</label>
                  <select
                    value={itemUnit}
                    onChange={e => setItemUnit(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-border rounded-sm bg-background text-foreground text-xs font-mono"
                  >
                    <option value="NOS">NOS - Numbers</option>
                    <option value="PCS">PCS - Pieces</option>
                    <option value="KGS">KGS - Kilograms</option>
                    <option value="BOX">BOX - Boxes</option>
                    <option value="MTR">MTR - Meters</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">GST Rate %</label>
                  <select
                    value={itemGstRate}
                    onChange={e => setItemGstRate(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-border rounded-sm bg-background text-foreground font-mono font-bold text-xs"
                  >
                    <option value={0}>0%</option>
                    <option value={5}>5%</option>
                    <option value={12}>12%</option>
                    <option value={18}>18%</option>
                    <option value={28}>28%</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    value={itemSalePrice || ''}
                    onChange={e => setItemSalePrice(Number(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full px-2.5 py-1.5 font-mono border border-border rounded-sm bg-background text-foreground text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Purchase Price (₹)</label>
                  <input
                    type="number"
                    value={itemPurchasePrice || ''}
                    onChange={e => setItemPurchasePrice(Number(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full px-2.5 py-1.5 font-mono border border-border rounded-sm bg-background text-foreground text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Opening Stock Qty</label>
                  <input
                    type="number"
                    value={itemOpeningStock || ''}
                    onChange={e => setItemOpeningStock(Number(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-2.5 py-1.5 font-mono border border-border rounded-sm bg-background text-foreground text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Reorder Level Alert</label>
                  <input
                    type="number"
                    value={itemReorderLevel || ''}
                    onChange={e => setItemReorderLevel(Number(e.target.value) || 0)}
                    placeholder="5"
                    className="w-full px-2.5 py-1.5 font-mono border border-border rounded-sm bg-background text-foreground text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsStockModalOpen(false)}
                  className="px-3 py-1.5 text-muted-foreground hover:bg-muted rounded-sm font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-sm shadow-2xs cursor-pointer"
                >
                  Save Stock Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Godown Modal */}
      {isGodownModalOpen && (
        <div className="fixed inset-0 z-60 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground w-full max-w-sm rounded-sm shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-sidebar border-b border-border p-4 flex items-center justify-between">
              <h3 className="font-serif font-bold text-sm text-foreground">Create Warehouse / Godown</h3>
              <button onClick={() => setIsGodownModalOpen(false)} className="text-muted-foreground hover:text-foreground p-1 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveGodown} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">Godown Name *</label>
                <input
                  type="text"
                  required
                  value={godownName}
                  onChange={e => setGodownName(e.target.value)}
                  placeholder="e.g. Bhiwandi Depot Warehouse"
                  className="w-full px-2.5 py-1.5 border border-border rounded-sm bg-background text-foreground text-xs"
                  autoFocus
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Location / City</label>
                <input
                  type="text"
                  value={godownLocation}
                  onChange={e => setGodownLocation(e.target.value)}
                  placeholder="Thane, Maharashtra"
                  className="w-full px-2.5 py-1.5 border border-border rounded-sm bg-background text-foreground text-xs"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsGodownModalOpen(false)}
                  className="px-3 py-1.5 text-muted-foreground hover:bg-muted rounded-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 font-medium rounded-sm shadow-2xs cursor-pointer"
                >
                  Save Godown
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
