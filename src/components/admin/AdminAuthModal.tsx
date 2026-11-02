/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff, KeyRound, AlertCircle, ArrowLeft } from 'lucide-react';
import { getMasterAdminPin, setMasterAdminPin } from '../../services/adminService';
import { NexoraLogo } from '../common/NexoraLogo';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onBackToLanding?: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onBackToLanding,
}) => {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [changeSuccess, setChangeSuccess] = useState(false);

  if (!isOpen) return null;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const masterPin = getMasterAdminPin();

    if (pin.trim() === masterPin) {
      onSuccess();
    } else {
      setError('Invalid Administrator PIN. Please verify credentials.');
    }
  };

  const handleQuickFill = () => {
    setPin(getMasterAdminPin());
    setError(null);
  };

  const handleChangePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const masterPin = getMasterAdminPin();

    if (currentPinInput.trim() !== masterPin) {
      setError('Current Admin PIN does not match.');
      return;
    }
    if (newPinInput.length < 4) {
      setError('New PIN must be at least 4 digits.');
      return;
    }
    if (newPinInput !== confirmPinInput) {
      setError('New PIN and Confirm PIN do not match.');
      return;
    }

    setMasterAdminPin(newPinInput);
    setChangeSuccess(true);
    setTimeout(() => {
      setIsChangingPin(false);
      setChangeSuccess(false);
      setCurrentPinInput('');
      setNewPinInput('');
      setConfirmPinInput('');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="bg-card text-card-foreground rounded-md border border-border shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="bg-sidebar border-b border-border p-4 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <NexoraLogo size={28} />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-bold text-base text-foreground">Nexora Super Admin</span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-sm border border-emerald-500/20 font-bold">
                  Root
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">Tenant databases & platform administration</p>
            </div>
          </div>
          {onBackToLanding && (
            <button
              onClick={onBackToLanding}
              className="p-1 text-muted-foreground hover:text-foreground rounded-sm hover:bg-muted transition-colors cursor-pointer"
              title="Return to Home"
            >
              <ArrowLeft size={16} />
            </button>
          )}
        </div>

        {/* Content */}
        {!isChangingPin ? (
          <form onSubmit={handleVerify} className="p-6 space-y-4">
            <div className="text-center space-y-1">
              <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary mb-1">
                <ShieldCheck size={28} />
              </div>
              <h3 className="font-serif text-lg font-bold text-foreground">Administrator Verification</h3>
              <p className="text-xs text-muted-foreground">
                Enter your Master Administrator PIN to access all tenant databases, client credentials, and subscription pricing.
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-2.5 text-xs text-rose-700 dark:text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-sm">
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex justify-between">
                <span>Master Admin PIN</span>
                <button
                  type="button"
                  onClick={handleQuickFill}
                  className="text-[11px] text-primary hover:underline cursor-pointer font-medium"
                >
                  Quick Fill (9999)
                </button>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Lock size={15} />
                </div>
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pin}
                  onChange={e => {
                    setPin(e.target.value);
                    setError(null);
                  }}
                  autoFocus
                  placeholder="Enter 4-digit PIN"
                  className="w-full pl-9 pr-10 py-2.5 font-mono text-sm tracking-widest bg-background border border-border rounded-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showPin ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-sm hover:bg-primary/90 transition-colors shadow-2xs cursor-pointer flex items-center justify-center gap-2 text-sm"
              >
                <KeyRound size={15} /> Unlock Admin Console
              </button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setIsChangingPin(true)}
                  className="text-muted-foreground hover:text-foreground hover:underline cursor-pointer"
                >
                  Change Master PIN
                </button>
                {onBackToLanding && (
                  <button
                    type="button"
                    onClick={onBackToLanding}
                    className="text-muted-foreground hover:text-foreground hover:underline cursor-pointer"
                  >
                    Back to Landing Page
                  </button>
                )}
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleChangePinSubmit} className="p-6 space-y-3.5">
            <div className="space-y-1">
              <h3 className="font-serif text-base font-bold text-foreground">Update Master PIN</h3>
              <p className="text-xs text-muted-foreground">
                Set a new security PIN for administrative authentication.
              </p>
            </div>

            {changeSuccess && (
              <div className="p-2.5 text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-sm">
                Master PIN successfully updated!
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-2.5 text-xs text-rose-700 dark:text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-sm">
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="text-xs text-muted-foreground font-semibold block mb-1">Current PIN</label>
              <input
                type="password"
                value={currentPinInput}
                onChange={e => setCurrentPinInput(e.target.value)}
                placeholder="Current PIN (e.g. 9999)"
                className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-sm text-foreground focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground font-semibold block mb-1">New PIN</label>
              <input
                type="password"
                value={newPinInput}
                onChange={e => setNewPinInput(e.target.value)}
                placeholder="New 4-digit PIN"
                className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-sm text-foreground focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground font-semibold block mb-1">Confirm New PIN</label>
              <input
                type="password"
                value={confirmPinInput}
                onChange={e => setConfirmPinInput(e.target.value)}
                placeholder="Re-enter new PIN"
                className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-sm text-foreground focus:outline-hidden"
              />
            </div>

            <div className="flex gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => {
                  setIsChangingPin(false);
                  setError(null);
                }}
                className="flex-1 py-2 text-xs font-medium border border-border hover:bg-muted rounded-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm cursor-pointer"
              >
                Save New PIN
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
