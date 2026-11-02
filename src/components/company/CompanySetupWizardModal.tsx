/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Building2,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  Database,
  FileSpreadsheet,
  AlertCircle,
  HelpCircle,
  Check,
  X,
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { INDIAN_STATES } from '../../data/seedData';
import { validateGstin, lookupGstin } from '../../services/gstEngine';
import { NexoraLogo } from '../common/NexoraLogo';

interface CompanySetupWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CompanySetupWizardModal: React.FC<CompanySetupWizardModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { activeCompany, updateCompany, auth, loadSampleDataForTesting, resetToCleanBooks, logAudit } = useErp();

  const [name, setName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [hasGst, setHasGst] = useState(true);
  const [gstin, setGstin] = useState('');
  const [pan, setPan] = useState('');
  const [stateCode, setStateCode] = useState('27');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [bankName, setBankName] = useState('State Bank of India');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [upiId, setUpiId] = useState('');
  const [dataMode, setDataMode] = useState<'CLEAN' | 'SAMPLE'>('CLEAN');
  const [gstinError, setGstinError] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (activeCompany) {
      setName(activeCompany.name || auth.businessName || 'My Business Enterprises');
      setTradeName(activeCompany.tradeName || activeCompany.name || auth.businessName || 'My Business');
      setGstin(activeCompany.gstin || '');
      setPan(activeCompany.pan || '');
      setStateCode(activeCompany.stateCode || '27');
      setAddress(activeCompany.address || '');
      setPincode(activeCompany.pincode || '');
      setPhone(activeCompany.phone || auth.mobile || '');
      setEmail(activeCompany.email || auth.email || '');
      setBankName(activeCompany.bankName || 'State Bank of India');
      setAccountNumber(activeCompany.accountNumber || '');
      setIfsc(activeCompany.ifsc || '');
      setUpiId(activeCompany.upiId || '');
    }
  }, [activeCompany, auth]);

  if (!isOpen) return null;

  const handleGstinChange = (input: string) => {
    const clean = input.toUpperCase().trim();
    setGstin(clean);

    if (clean.length === 15) {
      const validation = validateGstin(clean);
      if (!validation.isValid) {
        setGstinError(validation.error || 'Invalid 15-character GSTIN');
      } else {
        setGstinError('');
        setPan(validation.pan);
        setStateCode(validation.stateCode);

        const found = lookupGstin(clean);
        if (found) {
          setName(found.legalName);
          setTradeName(found.tradeName);
          setAddress(found.address);
          setPincode(found.pincode);
        }
      }
    } else if (clean.length > 0 && clean.length < 15) {
      setGstinError('GSTIN must be 15 alphanumeric characters');
    } else {
      setGstinError('');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedState = INDIAN_STATES.find(s => s.code === stateCode) || INDIAN_STATES[0];

    const updated = {
      ...activeCompany,
      name: name.trim() || 'My Business Enterprises',
      tradeName: tradeName.trim() || name.trim() || 'My Business Enterprises',
      gstin: hasGst ? gstin.trim().toUpperCase() : '',
      pan: pan.trim().toUpperCase() || (hasGst && gstin.length >= 12 ? gstin.substring(2, 12) : ''),
      state: selectedState.name,
      stateCode: selectedState.code,
      address: address.trim(),
      pincode: pincode.trim(),
      phone: phone.trim() || auth.mobile,
      email: email.trim() || auth.email || '',
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
      ifsc: ifsc.trim().toUpperCase(),
      upiId: upiId.trim(),
      registrationType: hasGst ? ('REGULAR' as const) : ('UNREGISTERED' as const),
    };

    updateCompany(updated);

    if (dataMode === 'SAMPLE') {
      loadSampleDataForTesting();
    } else {
      resetToCleanBooks();
    }

    logAudit(
      'ALTER',
      'COMPANY',
      updated.gstin || updated.name,
      `Fresh organization onboarding finalized for "${updated.name}" (${dataMode === 'CLEAN' ? 'Empty Clean Slate' : 'Preloaded Sample MSME Data'})`
    );

    setIsSaved(true);
    setTimeout(() => {
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-80 bg-background/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-card text-card-foreground w-full max-w-3xl rounded-sm shadow-2xl border border-border overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-muted/70 p-5 sm:p-6 border-b border-border relative">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <NexoraLogo size={36} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-sm">
                    New Organization Setup
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">14-Day Pro Trial Active</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-foreground mt-0.5">
                  Welcome! Set Up Your Business Profile
                </h2>
                <p className="text-xs text-muted-foreground">
                  Your tenant environment is 100% clean and isolated. Enter your fresh business details to generate compliant GST invoices.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground p-1.5 rounded-sm hover:bg-muted transition-colors cursor-pointer shrink-0"
              title="Close and use defaults"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {isSaved ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-xl font-serif font-bold text-foreground">Workspace Successfully Configured!</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Your company profile for <strong>{name}</strong> is live with{' '}
              {dataMode === 'CLEAN' ? 'clean empty books' : 'sample MSME test vouchers'}. Launching Gateway of Tally...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Step 1: Legal Name & Trade Name */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-primary border-b border-border pb-1">
                <Building2 size={14} />
                <span>1. Business Identity</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Company Legal Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Apex Traders Pvt Ltd"
                    className="w-full px-3 py-2 text-xs bg-background border border-input rounded-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary font-medium"
                  />
                  <span className="text-[11px] text-muted-foreground mt-0.5 block">Appears on tax invoices and reports</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Trade Name / Brand Name</label>
                  <input
                    type="text"
                    value={tradeName}
                    onChange={e => setTradeName(e.target.value)}
                    placeholder="e.g. Apex Hardware Stores"
                    className="w-full px-3 py-2 text-xs bg-background border border-input rounded-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                  />
                  <span className="text-[11px] text-muted-foreground mt-0.5 block">Optional if same as legal name</span>
                </div>
              </div>
            </div>

            {/* Step 2: GST & Taxation */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-1">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-primary">
                  <ShieldCheck size={14} />
                  <span>2. GST Registration & State</span>
                </div>

                <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hasGst}
                    onChange={e => {
                      setHasGst(e.target.checked);
                      if (!e.target.checked) setGstinError('');
                    }}
                    className="rounded-xs text-primary focus:ring-primary size-3.5"
                  />
                  <span className="font-semibold text-foreground">Registered under Indian GST</span>
                </label>
              </div>

              {hasGst ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      GSTIN (15 Digits) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={15}
                      value={gstin}
                      onChange={e => handleGstinChange(e.target.value)}
                      placeholder="e.g. 27AABCA1234F1Z8"
                      className={`w-full px-3 py-2 text-xs font-mono uppercase bg-background border rounded-sm text-foreground focus:outline-hidden ${
                        gstinError ? 'border-rose-500 focus:ring-rose-500' : 'border-input focus:ring-primary'
                      }`}
                    />
                    {gstinError && <p className="text-[11px] text-rose-500 mt-1">{gstinError}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">PAN Number</label>
                    <input
                      type="text"
                      maxLength={10}
                      value={pan}
                      onChange={e => setPan(e.target.value.toUpperCase())}
                      placeholder="Auto-extracted from GSTIN"
                      className="w-full px-3 py-2 text-xs font-mono uppercase bg-background border border-input rounded-sm text-foreground focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">State & Code</label>
                    <select
                      value={stateCode}
                      onChange={e => setStateCode(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-background border border-input rounded-sm text-foreground focus:outline-hidden"
                    >
                      {INDIAN_STATES.map(st => (
                        <option key={st.code} value={st.code}>
                          {st.code} - {st.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-muted/40 rounded-sm border border-border text-xs text-muted-foreground flex items-center gap-2">
                  <AlertCircle size={14} className="text-amber-500 shrink-0" />
                  <span>
                    Unregistered / Composition scheme selected. Invoices will be issued without input tax breakdown. You can add a GSTIN later anytime in F3: Company Info.
                  </span>
                </div>
              )}
            </div>

            {/* Step 3: Registered Address & Contact */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-primary border-b border-border pb-1">
                <MapPin size={14} />
                <span>3. Registered Place of Business</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-foreground mb-1">Office / Shop / Factory Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="e.g. Shop No. 14, Commercial Market, M.G. Road"
                    className="w-full px-3 py-2 text-xs bg-background border border-input rounded-sm text-foreground focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">PIN Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={pincode}
                    onChange={e => setPincode(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 400001"
                    className="w-full px-3 py-2 text-xs font-mono bg-background border border-input rounded-sm text-foreground focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 text-xs font-mono bg-background border border-input rounded-sm text-foreground focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-foreground mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="billing@mybusiness.com"
                    className="w-full px-3 py-2 text-xs bg-background border border-input rounded-sm text-foreground focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Step 4: Bank Details & UPI */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-primary border-b border-border pb-1">
                <CreditCard size={14} />
                <span>4. Bank Account & UPI Payment Details (Printed on Invoices)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-foreground mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                    placeholder="State Bank of India / HDFC Bank"
                    className="w-full px-3 py-2 text-xs bg-background border border-input rounded-sm text-foreground focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-foreground mb-1">Account Number</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={e => setAccountNumber(e.target.value)}
                    placeholder="e.g. 982001004829"
                    className="w-full px-3 py-2 text-xs font-mono bg-background border border-input rounded-sm text-foreground focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-foreground mb-1">IFSC Code</label>
                  <input
                    type="text"
                    value={ifsc}
                    onChange={e => setIfsc(e.target.value.toUpperCase())}
                    placeholder="SBIN0001234"
                    className="w-full px-3 py-2 text-xs font-mono uppercase bg-background border border-input rounded-sm text-foreground focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    UPI ID (Generates Dynamic QR Matrix)
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={e => setUpiId(e.target.value)}
                    placeholder="mybusiness@okaxis"
                    className="w-full px-3 py-2 text-xs font-mono bg-background border border-input rounded-sm text-foreground focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Step 5: Choice of Workspace Mode */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-primary border-b border-border pb-1">
                <Database size={14} />
                <span>5. Workspace Starting Mode</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setDataMode('CLEAN')}
                  className={`p-4 rounded-sm border cursor-pointer transition-all ${
                    dataMode === 'CLEAN'
                      ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-xs'
                      : 'border-border bg-card hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                      <Sparkles size={14} className="text-primary" />
                      Clean Empty Books (Recommended)
                    </span>
                    {dataMode === 'CLEAN' && <Check size={16} className="text-primary" />}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Zero past vouchers, zero products. Includes Indian GST standard Chart of Accounts (Cash, Bank, Sales, Purchases, CGST, SGST, IGST) ready for your real entries.
                  </p>
                </div>

                <div
                  onClick={() => setDataMode('SAMPLE')}
                  className={`p-4 rounded-sm border cursor-pointer transition-all ${
                    dataMode === 'SAMPLE'
                      ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-xs'
                      : 'border-border bg-card hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                      <FileSpreadsheet size={14} className="text-amber-500" />
                      Load Sample MSME Invoices & Items
                    </span>
                    {dataMode === 'SAMPLE' && <Check size={16} className="text-primary" />}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Preloads sample electronic items, sales, and purchases to quickly test Daybook, GST returns, and P&amp;L drill-down before recording real data.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground bg-muted/60 hover:bg-muted border border-border rounded-sm transition-colors cursor-pointer"
              >
                Skip &amp; Keep Default Workspace
              </button>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary/90 rounded-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Save Business Profile &amp; Launch Gateway</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
