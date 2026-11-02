/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, X, Sparkles, Building2, Package } from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { STANDARD_TALLY_GROUPS, INDIAN_STATES } from '../../data/seedData';
import { lookupGstin } from '../../services/gstEngine';

interface QuickMasterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickMasterModal: React.FC<QuickMasterModalProps> = ({ isOpen, onClose }) => {
  const { createLedger, createStockItem, activeCompany } = useErp();
  const [masterType, setMasterType] = useState<'LEDGER' | 'STOCK'>('LEDGER');

  // Ledger fields
  const [ledgerName, setLedgerName] = useState('');
  const [ledgerGroup, setLedgerGroup] = useState('Sundry Debtors');
  const [ledgerGstin, setLedgerGstin] = useState('');
  const [ledgerStateCode, setLedgerStateCode] = useState('27');
  const [ledgerAddress, setLedgerAddress] = useState('');

  // Stock fields
  const [itemName, setItemName] = useState('');
  const [itemHsn, setItemHsn] = useState('8471');
  const [itemUnit, setItemUnit] = useState('NOS');
  const [itemGstRate, setItemGstRate] = useState<number>(18);
  const [itemPrice, setItemPrice] = useState<number>(0);

  if (!isOpen) return null;

  const handleGstinBlur = (gst: string) => {
    const found = lookupGstin(gst);
    if (found) {
      if (!ledgerName) setLedgerName(found.tradeName || found.legalName);
      setLedgerAddress(found.address);
      setLedgerStateCode(found.stateCode);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (masterType === 'LEDGER') {
      if (!ledgerName.trim()) return;
      const stateObj = INDIAN_STATES.find(s => s.code === ledgerStateCode);
      createLedger({
        companyId: activeCompany.id,
        name: ledgerName.trim(),
        group: ledgerGroup,
        openingBalance: 0,
        currentBalance: 0,
        drCr: ledgerGroup.includes('Creditors') ? 'Cr' : 'Dr',
        gstin: ledgerGstin.trim().toUpperCase() || undefined,
        pan: ledgerGstin ? ledgerGstin.substring(2, 12) : undefined,
        state: stateObj?.name,
        stateCode: ledgerStateCode,
        address: ledgerAddress,
      });
    } else {
      if (!itemName.trim()) return;
      createStockItem({
        companyId: activeCompany.id,
        name: itemName.trim(),
        group: 'General',
        hsnCode: itemHsn.trim(),
        unit: itemUnit,
        gstRate: itemGstRate,
        cessRate: 0,
        salePrice: Number(itemPrice) || 0,
        purchasePrice: (Number(itemPrice) || 0) * 0.8,
        mrp: (Number(itemPrice) || 0) * 1.15,
        openingStock: 10,
        currentStock: 10,
        reorderLevel: 2,
        valuationMethod: 'FIFO',
        godownStock: {},
        batchEnabled: false,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-70 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card text-card-foreground w-full max-w-md rounded-sm shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-muted/60 text-foreground p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-sm">Quick Master Creation [Alt+C]</span>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
            <X size={16} />
          </button>
        </div>

        {/* Master Selector */}
        <div className="p-2 bg-muted flex gap-2 text-xs border-b border-border">
          <button
            type="button"
            onClick={() => setMasterType('LEDGER')}
            className={`flex-1 py-1.5 font-bold rounded-sm transition-all ${
              masterType === 'LEDGER' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Create Ledger (Party / A/c)
          </button>
          <button
            type="button"
            onClick={() => setMasterType('STOCK')}
            className={`flex-1 py-1.5 font-bold rounded-sm transition-all ${
              masterType === 'STOCK' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Create Stock Item
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3 text-xs">
          {masterType === 'LEDGER' ? (
            <>
              <div>
                <label className="block font-semibold text-foreground mb-1">Ledger Name *</label>
                <input
                  type="text"
                  required
                  value={ledgerName}
                  onChange={e => setLedgerName(e.target.value)}
                  placeholder="e.g. Reliance Retail Ltd"
                  className="w-full px-3 py-1.5 border border-input rounded-sm text-sm bg-background text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Group *</label>
                  <select
                    value={ledgerGroup}
                    onChange={e => setLedgerGroup(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-input rounded-sm bg-background text-foreground focus:ring-1 focus:ring-primary focus:outline-none font-medium"
                  >
                    {STANDARD_TALLY_GROUPS.map(g => (
                      <option key={g.id} value={g.name}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">GSTIN</label>
                  <input
                    type="text"
                    maxLength={15}
                    value={ledgerGstin}
                    onChange={e => setLedgerGstin(e.target.value.toUpperCase())}
                    onBlur={e => handleGstinBlur(e.target.value)}
                    placeholder="27AAACB2212M1Z1"
                    className="w-full px-2.5 py-1.5 font-mono uppercase border border-input rounded-sm bg-background text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Address & State</label>
                <input
                  type="text"
                  value={ledgerAddress}
                  onChange={e => setLedgerAddress(e.target.value)}
                  placeholder="Office Address, City"
                  className="w-full px-2.5 py-1.5 border border-input rounded-sm bg-background text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block font-semibold text-foreground mb-1">Stock Item Name *</label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={e => setItemName(e.target.value)}
                  placeholder="e.g. 32-inch Smart LED TV"
                  className="w-full px-3 py-1.5 border border-input rounded-sm text-sm bg-background text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-foreground mb-1">HSN/SAC Code</label>
                  <input
                    type="text"
                    value={itemHsn}
                    onChange={e => setItemHsn(e.target.value)}
                    placeholder="8528"
                    className="w-full px-2.5 py-1.5 font-mono border border-input rounded-sm bg-background text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Unit</label>
                  <select
                    value={itemUnit}
                    onChange={e => setItemUnit(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-input rounded-sm bg-background text-foreground font-mono focus:ring-1 focus:ring-primary focus:outline-none"
                  >
                    <option value="NOS">NOS</option>
                    <option value="PCS">PCS</option>
                    <option value="BOX">BOX</option>
                    <option value="KGS">KGS</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-foreground mb-1">GST Rate %</label>
                  <select
                    value={itemGstRate}
                    onChange={e => setItemGstRate(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 font-bold border border-input rounded-sm bg-background text-foreground font-mono focus:ring-1 focus:ring-primary focus:outline-none"
                  >
                    <option value={0}>0%</option>
                    <option value={5}>5%</option>
                    <option value={12}>12%</option>
                    <option value={18}>18%</option>
                    <option value={28}>28%</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Standard Rate (₹)</label>
                  <input
                    type="number"
                    value={itemPrice || ''}
                    onChange={e => setItemPrice(Number(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full px-2.5 py-1.5 font-mono border border-input rounded-sm bg-background text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-muted-foreground hover:bg-muted rounded-sm font-medium transition-colors"
            >
              Cancel [Esc]
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-sm shadow-xs transition-colors"
            >
              Commit Master [Ctrl+A]
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
