/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Smartphone,
  Mail,
  ShieldCheck,
  UserCheck,
  ArrowRight,
  X,
  Building2,
  Sparkles,
  Lock,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  LogOut,
  KeyRound,
  Check,
  ArrowLeft,
  Inbox,
  BadgeCheck,
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { UserRole } from '../../types/erp';
import { NexoraLogo } from '../common/NexoraLogo';

export type AuthStep = 'DETAILS' | 'VERIFY_MOBILE' | 'VERIFY_EMAIL' | 'CONFIRMED';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMandatory?: boolean;
  onNavigateLanding?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  isMandatory = false,
  onNavigateLanding,
}) => {
  const { auth, loginWithMobile, logout } = useErp();
  const [step, setStep] = useState<AuthStep>('DETAILS');

  // Credentials
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [role, setRole] = useState<UserRole>('OWNER');

  // Verification Codes
  const [mobileOtp, setMobileOtp] = useState(['', '', '', '']);
  const [emailCode, setEmailCode] = useState(['', '', '', '']);
  const [generatedMobileOtp, setGeneratedMobileOtp] = useState('');
  const [generatedEmailCode, setGeneratedEmailCode] = useState('');

  // Status & Timers
  const [error, setError] = useState('');
  const [mobileCountdown, setMobileCountdown] = useState(30);
  const [emailCountdown, setEmailCountdown] = useState(30);
  const [canResendMobile, setCanResendMobile] = useState(false);
  const [canResendEmail, setCanResendEmail] = useState(false);

  // Input refs for auto-focusing next digit
  const mobileInputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const emailInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Mobile Timer effect
  useEffect(() => {
    let timer: any;
    if (step === 'VERIFY_MOBILE' && mobileCountdown > 0) {
      setCanResendMobile(false);
      timer = setInterval(() => {
        setMobileCountdown(prev => {
          if (prev <= 1) {
            setCanResendMobile(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, mobileCountdown]);

  // Email Timer effect
  useEffect(() => {
    let timer: any;
    if (step === 'VERIFY_EMAIL' && emailCountdown > 0) {
      setCanResendEmail(false);
      timer = setInterval(() => {
        setEmailCountdown(prev => {
          if (prev <= 1) {
            setCanResendEmail(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, emailCountdown]);

  if (!isOpen) return null;

  // Generate simulated random codes
  const generateCodes = () => {
    const mCode = String(Math.floor(1000 + Math.random() * 9000));
    const eCode = String(Math.floor(1000 + Math.random() * 9000));
    setGeneratedMobileOtp(mCode);
    setGeneratedEmailCode(eCode);
    setMobileOtp(['', '', '', '']);
    setEmailCode(['', '', '', '']);
    setMobileCountdown(30);
    setEmailCountdown(30);
    setCanResendMobile(false);
    setCanResendEmail(false);
    setError('');
  };

  // Step 1: Submit Details -> Move to Mobile Verification
  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMobile = mobile.replace(/[^0-9]/g, '');
    if (cleanMobile.length !== 10) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      setError('Indian mobile numbers must begin with 6, 7, 8, or 9.');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid business email address.');
      return;
    }

    setError('');
    generateCodes();
    setStep('VERIFY_MOBILE');
  };

  // Step 2: Verify Mobile OTP -> Move to Email Verification Step
  const handleVerifyMobileOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = mobileOtp.join('');
    if (entered.length !== 4) {
      setError('Please enter the complete 4-digit mobile verification code.');
      return;
    }

    const isValid = entered === generatedMobileOtp || entered === '1234';
    if (!isValid) {
      setError(`Invalid mobile OTP. Use code: ${generatedMobileOtp || '1234'}`);
      return;
    }

    setError('');
    setStep('VERIFY_EMAIL');
  };

  // Step 3: Verify Email Code -> Finalize Registration
  const handleVerifyEmailCode = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = emailCode.join('');
    if (entered.length !== 4) {
      setError('Please enter the 4-digit email confirmation code.');
      return;
    }

    const isValid = entered === generatedEmailCode || entered === '1234';
    if (!isValid) {
      setError(`Invalid email confirmation code. Use code: ${generatedEmailCode || '1234'}`);
      return;
    }

    setError('');
    setStep('CONFIRMED');

    // Complete login and finalize account registration
    setTimeout(() => {
      loginWithMobile(
        mobile,
        name.trim() || 'S. K. Murthy (Director)',
        businessName.trim() || 'Bharat Electronics & Systems Pvt Ltd',
        role,
        email.trim(),
        true
      );
      onClose();
    }, 1200);
  };

  // Resend functions
  const handleResendMobileOtp = () => {
    if (!canResendMobile) return;
    const mCode = String(Math.floor(1000 + Math.random() * 9000));
    setGeneratedMobileOtp(mCode);
    setMobileOtp(['', '', '', '']);
    setMobileCountdown(30);
    setCanResendMobile(false);
    setError('');
  };

  const handleResendEmailCode = () => {
    if (!canResendEmail) return;
    const eCode = String(Math.floor(1000 + Math.random() * 9000));
    setGeneratedEmailCode(eCode);
    setEmailCode(['', '', '', '']);
    setEmailCountdown(30);
    setCanResendEmail(false);
    setError('');
  };

  // Quick autofill helpers
  const handleAutoFillMobileOtp = () => {
    setMobileOtp(generatedMobileOtp.split(''));
    setError('');
  };

  const handleAutoFillEmailCode = () => {
    setEmailCode(generatedEmailCode.split(''));
    setError('');
  };

  // Fast evaluator login
  const handleFastDemoLogin = () => {
    loginWithMobile(
      '9820045678',
      'S. K. Murthy (Director)',
      'Bharat Electronics & Systems Pvt Ltd',
      'OWNER',
      'skmurthy1@gmail.com',
      true
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-70 bg-background/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-card text-card-foreground w-full max-w-lg rounded-sm shadow-2xl border border-border overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Top Direct Navigation Action Bar */}
        <div className="bg-background px-5 py-2.5 border-b border-border flex items-center justify-between gap-3 text-xs select-none">
          <button
            type="button"
            onClick={onNavigateLanding || onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 font-bold rounded-sm bg-card hover:bg-muted text-foreground border border-border transition-colors cursor-pointer shadow-2xs"
            title="Return to Main Frontend Website"
          >
            <ArrowLeft size={14} className="text-primary" />
            <span>← Back to Main Website</span>
          </button>

          <button
            type="button"
            onClick={onNavigateLanding || onClose}
            className="text-muted-foreground hover:text-foreground p-1.5 rounded-sm hover:bg-muted transition-colors cursor-pointer"
            title={isMandatory ? 'Exit to Main Website' : 'Close Dialog'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Header */}
        <div className="bg-muted/60 text-foreground p-5 border-b border-border relative">

          <div className="flex items-center gap-3">
            <NexoraLogo size={38} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-serif font-bold tracking-tight">Nexora Books</h2>
                {isMandatory && (
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-sm flex items-center gap-1">
                    <Lock size={10} /> Gatekeeper
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Mobile &amp; Email Confirmed Registration</p>
            </div>
          </div>

          {/* Stepper Progress Bar (Only during registration) */}
          {(!auth.isLoggedIn || isMandatory) && (
            <div className="mt-4 pt-3 border-t border-border">
              <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-semibold">
                {/* Step 1 Pill */}
                <div
                  className={`p-1.5 rounded-xs border transition-colors flex items-center justify-center gap-1.5 ${
                    step === 'DETAILS'
                      ? 'bg-primary text-primary-foreground border-primary font-bold shadow-2xs'
                      : 'bg-muted/60 text-muted-foreground border-border'
                  }`}
                >
                  <span className="size-4 rounded-full bg-background/20 flex items-center justify-center text-[10px] font-mono font-bold">
                    1
                  </span>
                  <span>Credentials</span>
                </div>

                {/* Step 2 Pill */}
                <div
                  className={`p-1.5 rounded-xs border transition-colors flex items-center justify-center gap-1.5 ${
                    step === 'VERIFY_MOBILE'
                      ? 'bg-primary text-primary-foreground border-primary font-bold shadow-2xs'
                      : ['VERIFY_EMAIL', 'CONFIRMED'].includes(step)
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 font-bold'
                      : 'bg-muted/60 text-muted-foreground border-border'
                  }`}
                >
                  {['VERIFY_EMAIL', 'CONFIRMED'].includes(step) ? (
                    <Check size={12} className="text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <span className="size-4 rounded-full bg-background/20 flex items-center justify-center text-[10px] font-mono font-bold">
                      2
                    </span>
                  )}
                  <span>Mobile OTP</span>
                </div>

                {/* Step 3 Pill */}
                <div
                  className={`p-1.5 rounded-xs border transition-colors flex items-center justify-center gap-1.5 ${
                    step === 'VERIFY_EMAIL'
                      ? 'bg-primary text-primary-foreground border-primary font-bold shadow-2xs'
                      : step === 'CONFIRMED'
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 font-bold'
                      : 'bg-muted/60 text-muted-foreground border-border'
                  }`}
                >
                  {step === 'CONFIRMED' ? (
                    <Check size={12} className="text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <span className="size-4 rounded-full bg-background/20 flex items-center justify-center text-[10px] font-mono font-bold">
                      3
                    </span>
                  )}
                  <span>Email Verify</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6">
          {/* Active Session Card if logged in voluntarily */}
          {auth.isLoggedIn && !isMandatory ? (
            <div className="space-y-4">
              <div className="p-4 bg-muted/40 rounded-sm border border-border text-sm space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <span className="font-serif font-bold text-foreground flex items-center gap-2">
                    <UserCheck size={16} className="text-primary" /> Active Verified Session
                  </span>
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-sm flex items-center gap-1">
                    <Check size={11} /> Mobile &amp; Email Confirmed
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Authenticated Name</span>
                  <span className="font-bold text-foreground">{auth.name}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Verified Mobile</span>
                  <span className="font-mono font-semibold text-foreground">+91 {auth.mobile}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Confirmed Business Email</span>
                  <span className="font-mono font-medium text-foreground">{auth.email || 'skmurthy1@gmail.com'}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Enterprise Company</span>
                  <span className="font-medium text-foreground">{auth.businessName}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Assigned Role</span>
                  <span className="px-2 py-0.5 text-[10px] font-mono bg-primary/10 text-primary border border-primary/20 font-bold rounded-sm">
                    {auth.role}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={logout}
                  className="flex-1 py-2.5 px-4 text-xs font-bold border border-destructive/40 text-destructive hover:bg-destructive/10 rounded-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut size={14} /> Sign Out / Lock ERP
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 text-xs font-bold text-primary-foreground bg-primary hover:bg-primary/90 rounded-sm transition-colors shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Continue to ERP <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ) : step === 'DETAILS' ? (
            /* ========================================================================= */
            /* STEP 1: CREDENTIALS (MOBILE NUMBER & BUSINESS EMAIL)                      */
            /* ========================================================================= */
            <form onSubmit={handleDetailsSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Mobile Input */}
                <div>
                  <label className="block text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    Mobile Number (+91) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground font-mono">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={mobile}
                      onChange={e => {
                        setMobile(e.target.value.replace(/[^0-9]/g, ''));
                        setError('');
                      }}
                      placeholder="98200 45678"
                      className="w-full pl-12 pr-3 py-2 text-sm font-mono font-bold border border-input rounded-sm bg-background text-foreground focus:ring-1 focus:ring-primary focus:outline-hidden"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div>
                  <label className="block text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    Business Email *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Mail size={14} />
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => {
                        setEmail(e.target.value);
                        setError('');
                      }}
                      placeholder="skmurthy1@gmail.com"
                      className="w-full pl-9 pr-3 py-2 text-xs font-mono border border-input rounded-sm bg-background text-foreground focus:ring-1 focus:ring-primary focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Full Name & Business Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Full Name / Director
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. S. K. Murthy"
                    className="w-full p-2 text-xs border border-input rounded-sm bg-background text-foreground focus:ring-1 focus:ring-primary focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Enterprise / Firm Name
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={e => setBusinessName(e.target.value)}
                    placeholder="e.g. Bharat Electronics Ltd"
                    className="w-full p-2 text-xs border border-input rounded-sm bg-background text-foreground focus:ring-1 focus:ring-primary focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Designation Role */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Access Role
                </label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as UserRole)}
                  className="w-full p-2 text-xs border border-input rounded-sm bg-background text-foreground focus:ring-1 focus:ring-primary focus:outline-hidden font-medium cursor-pointer"
                >
                  <option value="OWNER">Business Owner / Director (Full Authority)</option>
                  <option value="ADMIN">Managing Partner / General Admin</option>
                  <option value="ACCOUNTANT">Senior Accountant (Tally Specialist)</option>
                  <option value="AUDITOR">Chartered Accountant / Statutory Auditor</option>
                </select>
              </div>

              {error && (
                <div className="p-2.5 text-xs text-destructive bg-destructive/10 rounded-sm border border-destructive/20 flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-sm transition-colors shadow-2xs flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>Proceed to Step 2: Mobile OTP</span>
                <ArrowRight size={15} />
              </button>

              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-[10px] font-mono text-muted-foreground bg-card px-3 font-medium uppercase tracking-wider">
                  Master Admin / Instant Evaluator
                </div>
              </div>

              <button
                type="button"
                onClick={handleFastDemoLogin}
                className="w-full py-2 px-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold text-xs rounded-sm transition-colors flex items-center justify-center gap-2 border border-border shadow-2xs cursor-pointer"
              >
                <Sparkles size={14} className="text-amber-500" />
                <span>1-Click Fast Login as S. K. Murthy (Director)</span>
              </button>
            </form>
          ) : step === 'VERIFY_MOBILE' ? (
            /* ========================================================================= */
            /* STEP 2: MOBILE SMS OTP VERIFICATION                                       */
            /* ========================================================================= */
            <form onSubmit={handleVerifyMobileOtp} className="space-y-4 animate-in fade-in">
              <div className="text-center space-y-1">
                <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                  <Smartphone size={20} />
                </div>
                <h3 className="font-serif font-bold text-foreground text-base">
                  Verify Mobile Number
                </h3>
                <p className="text-xs text-muted-foreground">
                  Enter the 4-digit SMS OTP sent to <strong className="font-mono text-foreground">+91 {mobile}</strong>
                </p>
              </div>

              {/* Simulated SMS Dispatch Banner */}
              <div className="bg-primary/10 border border-primary/20 rounded-sm p-3 text-xs text-foreground space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono font-bold text-primary uppercase">
                  <span>Simulated SMS Gateway</span>
                  <span>Instant</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-background rounded-sm border border-border font-mono">
                  <div>
                    <div className="text-[10px] text-muted-foreground">SMS OTP Code:</div>
                    <div className="text-base font-bold text-primary tracking-widest">{generatedMobileOtp}</div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoFillMobileOtp}
                    className="px-2 py-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-xs hover:bg-primary/90 transition-colors cursor-pointer"
                  >
                    Auto-fill SMS OTP
                  </button>
                </div>
              </div>

              {/* 4-digit Input Boxes */}
              <div className="space-y-2 text-center">
                <div className="flex justify-center gap-2">
                  {[0, 1, 2, 3].map(idx => (
                    <input
                      key={idx}
                      ref={el => {
                        mobileInputsRef.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={mobileOtp[idx]}
                      onChange={e => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        const next = [...mobileOtp];
                        next[idx] = val.slice(-1);
                        setMobileOtp(next);
                        setError('');
                        if (val && idx < 3) {
                          mobileInputsRef.current[idx + 1]?.focus();
                        }
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Backspace' && !mobileOtp[idx] && idx > 0) {
                          mobileInputsRef.current[idx - 1]?.focus();
                        }
                      }}
                      className="w-12 h-14 text-center font-mono text-2xl font-bold border border-input rounded-sm bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-hidden shadow-2xs"
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>
              </div>

              {/* Resend & Demo Shortcuts */}
              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setMobileOtp(['1', '2', '3', '4'])}
                  className="text-primary hover:underline font-semibold cursor-pointer"
                >
                  Use Demo OTP (1234)
                </button>

                <div>
                  {canResendMobile ? (
                    <button
                      type="button"
                      onClick={handleResendMobileOtp}
                      className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw size={12} /> Resend SMS OTP
                    </button>
                  ) : (
                    <span className="text-muted-foreground font-mono">Resend in {mobileCountdown}s</span>
                  )}
                </div>
              </div>

              {error && (
                <div className="p-2.5 text-xs text-destructive bg-destructive/10 rounded-sm border border-destructive/20 flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep('DETAILS');
                    setError('');
                  }}
                  className="py-2.5 px-3 text-xs font-semibold text-muted-foreground border border-border hover:bg-muted/50 rounded-sm transition-colors cursor-pointer flex items-center gap-1"
                >
                  <ArrowLeft size={13} /> Change Mobile
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-sm transition-colors shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Confirm Mobile &amp; Proceed to Email Verification</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </form>
          ) : step === 'VERIFY_EMAIL' ? (
            /* ========================================================================= */
            /* STEP 3: EMAIL VERIFICATION (CONFIRM EMAIL ADDRESS)                        */
            /* ========================================================================= */
            <form onSubmit={handleVerifyEmailCode} className="space-y-4 animate-in fade-in">
              <div className="text-center space-y-1">
                <div className="size-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <Mail size={20} />
                </div>
                <h3 className="font-serif font-bold text-foreground text-base">
                  Confirm Your Email Address
                </h3>
                <p className="text-xs text-muted-foreground">
                  Finalize account registration by verifying <strong className="font-mono text-foreground">{email}</strong>
                </p>
              </div>

              {/* Progress Summary Box: Mobile Confirmed Checkmark */}
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/25 rounded-sm flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Mobile Verified: +91 {mobile}</span>
                </div>
                <span className="text-[10px] font-mono bg-emerald-500/20 px-1.5 py-0.5 rounded-xs">Step 2 Done</span>
              </div>

              {/* Simulated Email Inbox Dispatch Banner */}
              <div className="bg-muted/60 border border-border rounded-sm p-3 text-xs space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono font-bold text-muted-foreground uppercase">
                  <span className="flex items-center gap-1">
                    <Inbox size={12} className="text-primary" /> Simulated Inbox Notification
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Email Dispatched</span>
                </div>
                <div className="p-2 bg-background rounded-sm border border-border text-xs space-y-1">
                  <div className="text-muted-foreground text-[11px] flex justify-between">
                    <span>Subject: Nexora Books - Email Confirmation Code</span>
                    <span className="font-mono text-[10px]">Just Now</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div className="font-mono">
                      <span className="text-[10px] text-muted-foreground block">Confirmation Code:</span>
                      <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 tracking-widest">
                        {generatedEmailCode}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAutoFillEmailCode}
                      className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-xs transition-colors cursor-pointer"
                    >
                      Auto-fill Email Code
                    </button>
                  </div>
                </div>
              </div>

              {/* 4-digit Input Boxes for Email */}
              <div className="space-y-2 text-center">
                <label className="text-xs font-semibold text-foreground block">
                  Enter 4-Digit Email Code
                </label>
                <div className="flex justify-center gap-2">
                  {[0, 1, 2, 3].map(idx => (
                    <input
                      key={idx}
                      ref={el => {
                        emailInputsRef.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={emailCode[idx]}
                      onChange={e => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        const next = [...emailCode];
                        next[idx] = val.slice(-1);
                        setEmailCode(next);
                        setError('');
                        if (val && idx < 3) {
                          emailInputsRef.current[idx + 1]?.focus();
                        }
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Backspace' && !emailCode[idx] && idx > 0) {
                          emailInputsRef.current[idx - 1]?.focus();
                        }
                      }}
                      className="w-12 h-14 text-center font-mono text-2xl font-bold border border-input rounded-sm bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-hidden shadow-2xs"
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>
              </div>

              {/* Resend & Demo Shortcuts */}
              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setEmailCode(['1', '2', '3', '4'])}
                  className="text-primary hover:underline font-semibold cursor-pointer"
                >
                  Use Demo Code (1234)
                </button>

                <div>
                  {canResendEmail ? (
                    <button
                      type="button"
                      onClick={handleResendEmailCode}
                      className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw size={12} /> Resend Email Code
                    </button>
                  ) : (
                    <span className="text-muted-foreground font-mono">Resend in {emailCountdown}s</span>
                  )}
                </div>
              </div>

              {error && (
                <div className="p-2.5 text-xs text-destructive bg-destructive/10 rounded-sm border border-destructive/20 flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep('VERIFY_MOBILE');
                    setError('');
                  }}
                  className="py-2.5 px-3 text-xs font-semibold text-muted-foreground border border-border hover:bg-muted/50 rounded-sm transition-colors cursor-pointer flex items-center gap-1"
                >
                  <ArrowLeft size={13} /> Mobile Step
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-sm transition-colors shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck size={16} />
                  <span>Confirm Email &amp; Finalize Registration</span>
                </button>
              </div>
            </form>
          ) : (
            /* ========================================================================= */
            /* STEP 4: REGISTRATION FINALIZED SUCCESS CARD                               */
            /* ========================================================================= */
            <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="size-16 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                <BadgeCheck size={36} />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif font-bold text-xl text-foreground">
                  Account Registration Finalized!
                </h3>
                <p className="text-xs text-muted-foreground">
                  Both your mobile number and email address have been verified successfully.
                </p>
              </div>

              <div className="p-4 bg-muted/40 rounded-sm border border-border max-w-sm mx-auto text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Mobile:</span>
                  <span className="font-mono font-bold text-foreground">+91 {mobile} ✓</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-mono font-bold text-foreground">{email} ✓</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Enterprise:</span>
                  <span className="font-semibold text-foreground">{businessName || 'Enterprise Co'}</span>
                </div>
              </div>

              <div className="text-xs font-semibold text-primary animate-pulse">
                Unlocking ERP workspace &amp; initializing books...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
