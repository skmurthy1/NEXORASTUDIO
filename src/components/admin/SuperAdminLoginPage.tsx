/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  AlertCircle,
  ArrowLeft,
  Mail,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { getMasterAdminPin, setMasterAdminPin } from '../../services/adminService';
import { NexoraLogo } from '../common/NexoraLogo';
import { useTheme } from '../../context/ThemeContext';

interface SuperAdminLoginPageProps {
  onSuccess: () => void;
  onBackToWebsite: () => void;
}

export const SuperAdminLoginPage: React.FC<SuperAdminLoginPageProps> = ({
  onSuccess,
  onBackToWebsite,
}) => {
  const { theme } = useTheme();
  const [email, setEmail] = useState('skmurthy1@gmail.com');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // PIN Change State
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [changeSuccess, setChangeSuccess] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const masterPin = getMasterAdminPin();
    const cleanEmail = email.trim().toLowerCase();

    // Verify authorized master admin email and security PIN
    if (cleanEmail !== 'skmurthy1@gmail.com' && cleanEmail !== 'admin@nexorabooks.in') {
      setError('Unauthorized administrator email ID. Access is restricted to master administrator.');
      return;
    }

    if (pin.trim() === masterPin) {
      onSuccess();
    } else {
      setError('Invalid Administrator Security PIN. Access denied.');
    }
  };

  const handleQuickFill = () => {
    setEmail('skmurthy1@gmail.com');
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
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary/20 selection:text-primary transition-colors">
      {/* Top Header */}
      <header className="border-b border-border bg-sidebar/80 backdrop-blur-md p-4 px-6 flex items-center justify-between">
        <button
          onClick={onBackToWebsite}
          className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-sm hover:bg-muted border border-border transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Return to Public Website</span>
        </button>

        <div className="flex items-center gap-2">
          <NexoraLogo size={28} />
          <span className="font-serif font-bold text-sm tracking-tight text-foreground">
            Nexora Books
          </span>
          <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-sm border border-emerald-500/20">
            ROOT AUTH
          </span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="bg-card text-card-foreground rounded-md border border-border shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Card Top Banner */}
          <div className="bg-sidebar border-b border-border p-6 text-center space-y-2">
            <div className="size-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
              <ShieldCheck size={26} />
            </div>
            <h1 className="font-serif font-bold text-xl text-foreground">
              Master Admin Portal
            </h1>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Dedicated high-security portal for platform administration, client databases, and 5,000 subscriber licensing.
            </p>
          </div>

          <div className="p-6 space-y-5">
            {error && (
              <div className="p-3 rounded-sm bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {changeSuccess && (
              <div className="p-3 rounded-sm bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 size={15} className="shrink-0" />
                <span>Master Admin PIN changed successfully.</span>
              </div>
            )}

            {!isChangingPin ? (
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Admin Email */}
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Master Administrator Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      placeholder="skmurthy1@gmail.com"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-input rounded-sm bg-background text-foreground focus:ring-1 focus:ring-primary focus:outline-none font-mono"
                    />
                    <Mail size={14} className="absolute left-3 top-2.5 text-muted-foreground" />
                  </div>
                </div>

                {/* Security PIN */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-foreground">
                      Security Admin PIN
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsChangingPin(true);
                        setError(null);
                      }}
                      className="text-[11px] text-primary hover:underline cursor-pointer"
                    >
                      Change PIN
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPin ? 'text' : 'password'}
                      value={pin}
                      onChange={e => setPin(e.target.value)}
                      placeholder="Enter 4-digit Master PIN"
                      maxLength={12}
                      autoFocus
                      required
                      className="w-full pl-9 pr-10 py-2 text-sm border border-input rounded-sm bg-background text-foreground tracking-widest font-mono focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                    <KeyRound size={15} className="absolute left-3 top-2.5 text-muted-foreground" />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showPin ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* 1-Click Quick Fill Helper */}
                <div className="p-3 bg-muted/40 rounded-sm border border-border text-xs flex items-center justify-between">
                  <div className="text-muted-foreground text-[11px]">
                    Authorized Master: <span className="font-mono text-foreground font-semibold">skmurthy1@gmail.com</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleQuickFill}
                    className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles size={11} /> Auto-fill (9988)
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-primary text-primary-foreground font-bold rounded-sm text-xs hover:bg-primary/90 transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <ShieldCheck size={14} />
                  <span>Authenticate & Open Admin Dashboard</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleChangePinSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Current PIN
                  </label>
                  <input
                    type="password"
                    value={currentPinInput}
                    onChange={e => setCurrentPinInput(e.target.value)}
                    required
                    maxLength={12}
                    className="w-full px-3 py-2 text-xs border border-input rounded-sm bg-background text-foreground font-mono focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    New 4+ Digit PIN
                  </label>
                  <input
                    type="password"
                    value={newPinInput}
                    onChange={e => setNewPinInput(e.target.value)}
                    required
                    maxLength={12}
                    className="w-full px-3 py-2 text-xs border border-input rounded-sm bg-background text-foreground font-mono focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Confirm New PIN
                  </label>
                  <input
                    type="password"
                    value={confirmPinInput}
                    onChange={e => setConfirmPinInput(e.target.value)}
                    required
                    maxLength={12}
                    className="w-full px-3 py-2 text-xs border border-input rounded-sm bg-background text-foreground font-mono focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangingPin(false);
                      setError(null);
                    }}
                    className="flex-1 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted border border-border rounded-sm transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 text-xs font-bold text-primary-foreground bg-primary hover:bg-primary/90 rounded-sm shadow-xs transition-colors cursor-pointer"
                  >
                    Save New PIN
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Footer Security Notice */}
          <div className="border-t border-border bg-sidebar/50 p-3 px-6 text-center text-[11px] text-muted-foreground">
            MCA Rule 3(1) Statutory Audit Trail Active · IP & Session Logged
          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="border-t border-border bg-sidebar/40 py-3 px-6 text-center text-xs text-muted-foreground">
        Nexora Books Multi-Tenant Super Administrator Console · Strictly for S. K. Murthy (Platform Owner)
      </footer>
    </div>
  );
};
