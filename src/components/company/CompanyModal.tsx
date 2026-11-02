/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Building2,
  X,
  Plus,
  Check,
  Sparkles,
  ShieldCheck,
  CreditCard,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { Company } from '../../types/erp';
import { validateGstin, lookupGstin, getStateByCode } from '../../services/gstEngine';
import { INDIAN_STATES } from '../../data/seedData';
import { NexoraLogo } from '../common/NexoraLogo';

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CompanyModal: React.FC<CompanyModalProps> = ({ isOpen, onClose }) => {
  const { companies, activeCompany, switchCompany, createCompany, updateCompany } = useErp();
  const [mode, setMode] = useState<'LIST' | 'CREATE' | 'ALTER'>('LIST');

  // Form State
  const [name, setName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [gstin, setGstin] = useState('');
  const [pan, setPan] = useState('');
  const [stateCode, setStateCode] = useState('27');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [bankName, setBankName] = useState('HDFC Bank Ltd');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [branch, setBranch] = useState('');
  const [upiId, setUpiId] = useState('');
  const [registrationType, setRegistrationType] = useState<'REGULAR' | 'COMPOSITION' | 'UNREGISTERED'>('REGULAR');
  const [voucherPrefix, setVoucherPrefix] = useState('NB/26-27/');
  const [defaultTerms, setDefaultTerms] = useState(
    '1. Payment due within 30 days.\n2. Delayed interest @ 18% p.a.\n3. Subject to local state jurisdiction.'
  );

  const [gstinError, setGstinError] = useState('');

  if (!isOpen) return null;

  const handleOpenAlter = () => {
    setName(activeCompany.name);
    setTradeName(activeCompany.tradeName);
    setGstin(activeCompany.gstin);
    setPan(activeCompany.pan);
    setStateCode(activeCompany.stateCode);
    setAddress(activeCompany.address);
    setPincode(activeCompany.pincode);
    setPhone(activeCompany.phone);
    setEmail(activeCompany.email);
    setBankName(activeCompany.bankName);
    setAccountNumber(activeCompany.accountNumber);
    setIfsc(activeCompany.ifsc);
    setBranch(activeCompany.branch);
    setUpiId(activeCompany.upiId);
    setRegistrationType(activeCompany.registrationType as any);
    setVoucherPrefix(activeCompany.voucherPrefix);
    setDefaultTerms(activeCompany.defaultTerms);
    setMode('ALTER');
  };

  const handleGstinChange = (input: string) => {
    const clean = input.toUpperCase().trim();
    setGstin(clean);

    if (clean.length === 15) {
      const validation = validateGstin(clean);
      if (!validation.isValid) {
        setGstinError(validation.error || 'Invalid GSTIN');
      } else {
        setGstinError('');
        setPan(validation.pan);
        setStateCode(validation.stateCode);

        // Auto-fill from mock registry if found
        const found = lookupGstin(clean);
        if (found) {
          if (!name || mode === 'CREATE') {
            setName(found.legalName);
            setTradeName(found.tradeName);
          }
          setAddress(found.address);
          setPincode(found.pincode);
        }
      }
    } else {
      setGstinError('');
    }
  };

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const stateObj = getStateByCode(stateCode);

    if (mode === 'CREATE') {
      createCompany({
        name: name.trim(),
        tradeName: tradeName.trim() || name.trim(),
        gstin: gstin.trim(),
        pan: pan.trim() || (gstin ? gstin.substring(2, 12) : ''),
        state: stateObj?.name || 'Maharashtra',
        stateCode,
        address: address.trim(),
        pincode: pincode.trim(),
        phone: phone.trim(),
        email: email.trim(),
        bankName,
        accountNumber,
        ifsc,
        branch,
        upiId: upiId || (name.toLowerCase().replace(/[^a-z0-9]/g, '') + '@hdfcbank'),
        registrationType,
        voucherPrefix,
        defaultTerms,
      });
    } else {
      updateCompany({
        ...activeCompany,
        name: name.trim(),
        tradeName: tradeName.trim() || name.trim(),
        gstin: gstin.trim(),
        pan: pan.trim(),
        state: stateObj?.name || activeCompany.state,
        stateCode,
        address: address.trim(),
        pincode: pincode.trim(),
        phone: phone.trim(),
        email: email.trim(),
        bankName,
        accountNumber,
        ifsc,
        branch,
        upiId,
        registrationType,
        voucherPrefix,
        defaultTerms,
      });
    }
    setMode('LIST');
  };

  return (
    <div className="fixed inset-0 z-60 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card text-card-foreground w-full max-w-2xl rounded-sm shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-muted/60 text-foreground p-5 px-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NexoraLogo size={32} />
            <div>
              <h3 className="font-serif font-bold text-base">Company Setup & Switcher [F3]</h3>
              <p className="text-xs text-muted-foreground">Manage multiple business entities and books of accounts</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
            <X size={18} />
          </button>
        </div>

        {mode === 'LIST' ? (
          <div className="p-6 space-y-5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                Available Companies ({companies.length})
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleOpenAlter}
                  className="px-3 py-1.5 text-xs font-semibold text-secondary-foreground bg-secondary hover:bg-secondary/80 border border-border rounded-sm transition-colors"
                >
                  Alter Active Profile
                </button>
                <button
                  onClick={() => {
                    setName('');
                    setTradeName('');
                    setGstin('');
                    setPan('');
                    setAddress('');
                    setMode('CREATE');
                  }}
                  className="px-3.5 py-1.5 text-xs font-bold text-primary-foreground bg-primary hover:bg-primary/90 rounded-sm transition-colors flex items-center gap-1 shadow-2xs"
                >
                  <Plus size={13} /> Create Company
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {companies.map(comp => {
                const isActive = comp.id === activeCompany.id;
                return (
                  <div
                    key={comp.id}
                    onClick={() => {
                      switchCompany(comp.id);
                      onClose();
                    }}
                    className={`p-4 rounded-sm border flex items-center justify-between cursor-pointer transition-all ${
                      isActive
                        ? 'border-primary bg-primary/5 shadow-xs ring-1 ring-primary'
                        : 'border-border bg-card hover:border-primary/50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-foreground text-sm">{comp.name}</span>
                        {isActive && (
                          <span className="text-[10px] font-mono font-bold bg-primary text-primary-foreground px-2 py-0.2 rounded-sm">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-mono text-muted-foreground">
                        GSTIN: <strong className="text-foreground">{comp.gstin || 'Unregistered'}</strong> · State: {comp.state} ({comp.stateCode})
                      </div>
                      <div className="text-[11px] text-muted-foreground font-mono">
                        Financial Year: FY {comp.financialYear} · Bank: {comp.bankName}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-semibold text-primary hover:underline">
                        {isActive ? 'Current Company' : 'Switch [F3]'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Form for Create / Alter */
          <form onSubmit={handleSaveCompany} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="font-serif font-bold text-sm text-foreground">
                {mode === 'CREATE' ? 'Create New Company' : 'Alter Company Profile'}
              </span>
              <button
                type="button"
                onClick={() => setMode('LIST')}
                className="text-xs text-primary hover:underline font-medium"
              >
                ← Back to Companies List
              </button>
            </div>

            {/* GSTIN Input with real-time auto-fill */}
            <div className="p-3 bg-muted/50 rounded-sm border border-border space-y-1.5">
              <label className="block font-bold text-foreground">
                GSTIN (Enter 15-character GSTIN to auto-fill details)
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={15}
                  value={gstin}
                  onChange={e => handleGstinChange(e.target.value)}
                  placeholder="e.g. 27AAACB2212M1Z1"
                  className="w-full px-3 py-2 font-mono text-sm font-bold uppercase border border-input rounded-sm bg-background text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                  autoFocus
                />
              </div>
              {gstinError ? (
                <div className="text-destructive font-medium flex items-center gap-1">
                  <AlertCircle size={12} /> {gstinError}
                </div>
              ) : gstin.length === 15 ? (
                <div className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <ShieldCheck size={13} /> Valid Indian GSTIN format verified
                </div>
              ) : (
                <div className="text-muted-foreground text-[11px]">
                  State code, PAN, and registered address will automatically populate.
                </div>
              )}
            </div>

            {/* Legal Name & Trade Name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-foreground mb-1">Legal Company Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Bharat Electronics & Systems Pvt Ltd"
                  className="w-full px-3 py-2 border border-input rounded-sm bg-background text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Trade Name / Brand</label>
                <input
                  type="text"
                  value={tradeName}
                  onChange={e => setTradeName(e.target.value)}
                  placeholder="e.g. Bharat Electronics"
                  className="w-full px-3 py-2 border border-input rounded-sm bg-background text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Address & State */}
            <div>
              <label className="block font-semibold text-foreground mb-1">Registered Business Address</label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Plot No, Industrial Estate, City"
                className="w-full px-3 py-2 border border-input rounded-sm bg-background text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-foreground mb-1">State & Code</label>
                <select
                  value={stateCode}
                  onChange={e => setStateCode(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-sm bg-background text-foreground focus:ring-1 focus:ring-primary focus:outline-none font-medium"
                >
                  {INDIAN_STATES.map(s => (
                    <option key={s.code} value={s.code}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">PAN Number</label>
                <input
                  type="text"
                  maxLength={10}
                  value={pan}
                  onChange={e => setPan(e.target.value.toUpperCase())}
                  placeholder="AAACB2212M"
                  className="w-full px-3 py-2 font-mono uppercase border border-input rounded-sm bg-background text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Pincode</label>
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={e => setPincode(e.target.value)}
                  placeholder="400093"
                  className="w-full px-3 py-2 font-mono border border-input rounded-sm bg-background text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Banking Details */}
            <div className="p-3 bg-muted/40 rounded-sm border border-border space-y-2">
              <div className="font-bold text-foreground flex items-center gap-1.5">
                <CreditCard size={14} className="text-primary" /> Bank & Settlement Details (For Invoices)
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground mb-0.5">Bank Name</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                    placeholder="HDFC Bank"
                    className="w-full px-2.5 py-1.5 border border-input rounded-sm bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-0.5">Account Number</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={e => setAccountNumber(e.target.value)}
                    placeholder="50200049281723"
                    className="w-full px-2.5 py-1.5 font-mono border border-input rounded-sm bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-0.5">IFSC Code</label>
                  <input
                    type="text"
                    value={ifsc}
                    onChange={e => setIfsc(e.target.value.toUpperCase())}
                    placeholder="HDFC0000060"
                    className="w-full px-2.5 py-1.5 font-mono uppercase border border-input rounded-sm bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-0.5">UPI ID (For Dynamic Payment QR)</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={e => setUpiId(e.target.value)}
                    placeholder="company@bank"
                    className="w-full px-2.5 py-1.5 font-mono border border-input rounded-sm bg-background text-foreground"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-border">
              <button
                type="button"
                onClick={() => setMode('LIST')}
                className="px-4 py-2 text-muted-foreground hover:bg-muted rounded-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-sm shadow-xs transition-colors"
              >
                {mode === 'CREATE' ? 'Create Company' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
