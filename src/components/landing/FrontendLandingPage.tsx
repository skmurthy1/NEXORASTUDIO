/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { NexoraLogo } from '../common/NexoraLogo';
import { useTheme } from '../../context/ThemeContext';
import { getSubscriptionPlans } from '../../services/adminService';
import { SubscriptionPlanConfig } from '../../types/admin';
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  FileCheck,
  Send,
  Building2,
  Database,
  Lock,
  Check,
  Sun,
  Moon,
  ExternalLink,
  Laptop,
  Layers,
  ChevronRight,
  Sparkles,
  HelpCircle,
  Download,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  Users,
  BarChart3,
  Globe,
  Tag,
  Star,
  Award,
} from 'lucide-react';

export type WebsitePage = 'home' | 'features' | 'pricing' | 'migration' | 'about' | 'contact';

interface FrontendLandingPageProps {
  onLaunchClientErp: () => void;
  onOpenAdminLogin: () => void;
  initialPage?: WebsitePage;
}

export const FrontendLandingPage: React.FC<FrontendLandingPageProps> = ({
  onLaunchClientErp,
  onOpenAdminLogin,
  initialPage = 'home',
}) => {
  const { theme, toggleTheme } = useTheme();
  const [activePage, setActivePage] = useState<WebsitePage>(initialPage);
  const [plans, setPlans] = useState<SubscriptionPlanConfig[]>([]);
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('ANNUAL');

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactBusiness, setContactBusiness] = useState('');
  const [contactMobile, setContactMobile] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  useEffect(() => {
    setPlans(getSubscriptionPlans());
  }, []);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setContactName('');
      setContactBusiness('');
      setContactMobile('');
      setContactEmail('');
      setContactMessage('');
    }, 4000);
  };

  const navItems: { id: WebsitePage; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'features', label: 'Features' },
    { id: 'pricing', label: 'Pricing Plans' },
    { id: 'migration', label: 'Tally & Busy Migration' },
    { id: 'about', label: 'About Us' },
    { id: 'contact', label: 'Contact & Sales' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary transition-colors">
      {/* 1. Multi-Page Navigation Header */}
      <header className="sticky top-0 z-40 bg-sidebar/90 backdrop-blur-md border-b border-border select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div
            onClick={() => setActivePage('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <NexoraLogo size={34} />
            <div>
              <span className="font-serif font-bold text-lg tracking-tight text-foreground group-hover:text-primary transition-colors">
                Nexora Books
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded-sm border border-primary/20">
                Cloud ERP
              </span>
            </div>
          </div>

          {/* Desktop Multi-Page Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-medium">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`px-3 py-1.5 rounded-sm transition-colors cursor-pointer ${
                  activePage === item.id
                    ? 'bg-primary/10 text-primary font-bold border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted border border-border rounded-sm transition-colors cursor-pointer"
              title="Toggle Dark / Light Theme"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Client Portal Login */}
            <button
              onClick={onLaunchClientErp}
              className="px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted border border-border rounded-sm transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Laptop size={13} className="text-primary" />
              <span>Client Login</span>
            </button>

            {/* Primary CTA */}
            <button
              onClick={onLaunchClientErp}
              className="px-4 py-1.5 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Start Free Trial</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="lg:hidden flex items-center overflow-x-auto px-4 py-2 border-t border-border bg-sidebar/50 gap-2 text-xs">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`px-2.5 py-1 rounded-sm whitespace-nowrap cursor-pointer ${
                activePage === item.id
                  ? 'bg-primary text-primary-foreground font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      {/* ========================================================================= */}
      {/* PAGE 1: HOME */}
      {/* ========================================================================= */}
      {activePage === 'home' && (
        <div className="flex-1 flex flex-col animate-in fade-in duration-200">
          {/* Hero Section */}
          <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-border overflow-hidden">
            <div className="absolute inset-0 bg-radial from-primary/5 via-transparent to-transparent pointer-events-none" />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-muted text-xs font-medium text-foreground border border-border">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Nexora Cloud ERP 2026.1 Release</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-primary font-semibold">Tally &amp; Busy Migration Ready</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.15]">
                Enterprise Cloud Accounting with{' '}
                <span className="text-primary italic font-serif">Tally Prime Speed</span>
              </h1>

              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                The next-generation Indian GST ERP engineered for business owners, accountants, and CAs. Unrivaled keyboard shortcuts (F1-F9, Alt+G), automated WhatsApp invoicing with UPI QR, MCA Rule 3(1) immutable audit trail, and seamless data restore.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={onLaunchClientErp}
                  className="w-full sm:w-auto px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-sm hover:bg-primary/90 transition-all shadow-md flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  <span>Launch Client ERP Workspace</span>
                  <ArrowRight size={16} />
                </button>

                <button
                  onClick={() => setActivePage('pricing')}
                  className="w-full sm:w-auto px-6 py-3 bg-card text-foreground font-semibold rounded-sm border border-border hover:bg-muted transition-all shadow-2xs flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  <Tag size={16} className="text-primary" />
                  <span>View Pricing &amp; Plans</span>
                </button>

                <button
                  onClick={() => setActivePage('migration')}
                  className="w-full sm:w-auto px-5 py-3 bg-card text-foreground font-semibold rounded-sm border border-border hover:bg-muted transition-all shadow-2xs flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  <Database size={15} className="text-amber-500" />
                  <span>Migrate from Tally / Busy</span>
                </button>
              </div>

              {/* Trust Matrix Chips */}
              <div className="pt-8 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-muted-foreground font-mono">
                <div className="flex items-center gap-1.5">
                  <Check size={13} className="text-emerald-500" />
                  <span>MCA Rule 3(1) Edit Log Compliant</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check size={13} className="text-emerald-500" />
                  <span>GSTR-1, 3B, 2B Portal JSON</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check size={13} className="text-emerald-500" />
                  <span>UPI QR Code Dynamic Generation</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check size={13} className="text-emerald-500" />
                  <span>5,000+ Enterprise Scale Ready</span>
                </div>
              </div>
            </div>
          </section>

          {/* Live ERP Interactive Preview Teaser */}
          <section className="py-12 bg-sidebar/40 border-b border-border">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <div className="bg-card rounded-md border border-border shadow-xl overflow-hidden">
                <div className="bg-muted/80 p-3 px-4 border-b border-border flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="size-3 rounded-full bg-rose-500 inline-block" />
                    <span className="size-3 rounded-full bg-amber-500 inline-block" />
                    <span className="size-3 rounded-full bg-emerald-500 inline-block" />
                    <span className="ml-2 font-mono text-muted-foreground">Gateway of Tally · Live ERP Workspace</span>
                  </div>
                  <button
                    onClick={onLaunchClientErp}
                    className="font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    <span>Open Fullscreen Workspace</span>
                    <ExternalLink size={12} />
                  </button>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-background/50">
                  <div className="space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Masters &amp; Accounts</span>
                    <div className="p-3 bg-card rounded-sm border border-border text-xs space-y-1">
                      <div className="font-semibold text-foreground">Ledger Creation [Alt+C]</div>
                      <div className="text-muted-foreground text-[11px]">Sundry Debtors, Creditors, GST rates, bank accounts.</div>
                    </div>
                    <div className="p-3 bg-card rounded-sm border border-border text-xs space-y-1">
                      <div className="font-semibold text-foreground">Multi-Godown Inventory</div>
                      <div className="text-muted-foreground text-[11px]">Stock items, HSN/SAC codes, units, reorder levels.</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Transactions (F1 - F9)</span>
                    <div className="p-3 bg-card rounded-sm border border-border text-xs space-y-1">
                      <div className="font-semibold text-foreground">Tax Invoicing [F8] &amp; Purchase [F9]</div>
                      <div className="text-muted-foreground text-[11px]">Instant CGST/SGST/IGST split with e-Way &amp; IRN QR.</div>
                    </div>
                    <div className="p-3 bg-card rounded-sm border border-border text-xs space-y-1">
                      <div className="font-semibold text-foreground">Day Book &amp; Audit Trail [Alt+A]</div>
                      <div className="text-muted-foreground text-[11px]">MCA Rule 3(1) compliant timestamped change log.</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Automations &amp; Delivery</span>
                    <div className="p-3 bg-card rounded-sm border border-border text-xs space-y-1">
                      <div className="font-semibold text-emerald-600 dark:text-emerald-400">WhatsApp Invoicing</div>
                      <div className="text-muted-foreground text-[11px]">Send invoices directly with dynamic UPI QR code.</div>
                    </div>
                    <div className="p-3 bg-card rounded-sm border border-border text-xs space-y-1">
                      <div className="font-semibold text-primary">Print Preview [Ctrl+P]</div>
                      <div className="text-muted-foreground text-[11px]">Clean professional GST Tax Invoice layout.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Core Feature Pillars */}
          <section className="py-16 border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
              <div className="text-center space-y-2">
                <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider">
                  Engineered for High-Velocity Businesses
                </span>
                <h2 className="font-serif text-3xl font-bold text-foreground">
                  Why 5,000+ Enterprises Are Upgrading to Nexora Books
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
                  Experience seamless desktop speed on modern web architecture with zero software installations.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-md border border-border bg-card space-y-3">
                  <div className="size-10 rounded-sm bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <Zap size={20} />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-foreground">100% Keyboard-Driven Workflow</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Designed for seasoned accountants who refuse to touch the mouse. F1 to F9 keys for vouchers, Alt+G for universal search, and Ctrl+A for 100ms invoice commits.
                  </p>
                </div>

                <div className="p-6 rounded-md border border-border bg-card space-y-3">
                  <div className="size-10 rounded-sm bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <ShieldCheck size={20} />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-foreground">MCA Rule 3(1) Statutory Audit Trail</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Mandatory audit trail with non-tamperable edit logs, before-and-after change diffs, user IDs, and timestamps to keep your business 100% compliant during ROC audits.
                  </p>
                </div>

                <div className="p-6 rounded-md border border-border bg-card space-y-3">
                  <div className="size-10 rounded-sm bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                    <Send size={20} />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-foreground">WhatsApp Invoicing &amp; UPI QR</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Eliminate 45-day payment cycles. Dispatch GST invoices directly to buyer WhatsApp numbers with dynamic UPI QR codes and automated renewal reminders.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Testimonial & Social Proof */}
          <section className="py-16 bg-sidebar/50 border-b border-border">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <h3 className="font-serif text-2xl font-bold text-foreground">
                  Trusted by Over 5,000+ Indian Businesses &amp; CAs
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                <div className="p-5 bg-card rounded-md border border-border space-y-3">
                  <p className="italic text-muted-foreground leading-relaxed">
                    &quot;Migrating our entire Busy database with FIXNOW_20261030_MSAll.DAT took less than 2 minutes. The keyboard navigation is indistinguishable from desktop software.&quot;
                  </p>
                  <div className="border-t border-border pt-2">
                    <div className="font-bold text-foreground">Rajesh K. Mehta</div>
                    <div className="text-muted-foreground text-[11px]">Mehta Steel Distributors, Mumbai</div>
                  </div>
                </div>

                <div className="p-5 bg-card rounded-md border border-border space-y-3">
                  <p className="italic text-muted-foreground leading-relaxed">
                    &quot;The WhatsApp invoice dispatch with instant UPI QR has cut our receivables cycle from 30 days down to 4 days. Highly recommended for any distributor.&quot;
                  </p>
                  <div className="border-t border-border pt-2">
                    <div className="font-bold text-foreground">Suresh V. Patel</div>
                    <div className="text-muted-foreground text-[11px]">Patel Automation &amp; Electricals, Ahmedabad</div>
                  </div>
                </div>

                <div className="p-5 bg-card rounded-md border border-border space-y-3">
                  <p className="italic text-muted-foreground leading-relaxed">
                    &quot;As a practicing CA firm with 40+ corporate clients, the MCA Rule 3(1) edit log and CA firm multi-client view saves us hours during annual statutory tax audits.&quot;
                  </p>
                  <div className="border-t border-border pt-2">
                    <div className="font-bold text-foreground">CA Anita N. Rao, FCA</div>
                    <div className="text-muted-foreground text-[11px]">Rao &amp; Associates Chartered Accountants, Bangalore</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Bottom Call to Action */}
          <section className="py-16 text-center space-y-6">
            <h2 className="font-serif text-3xl font-bold text-foreground">
              Ready to Upgrade Your Accounting Workflow?
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
              Join thousands of Indian enterprises enjoying cloud freedom with zero learning curve.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={onLaunchClientErp}
                className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-sm shadow-md hover:bg-primary/90 transition-all cursor-pointer flex items-center gap-2 text-sm"
              >
                <span>Launch Client ERP</span>
                <ArrowRight size={15} />
              </button>
              <button
                onClick={() => setActivePage('contact')}
                className="px-6 py-3 bg-card text-foreground font-semibold rounded-sm border border-border hover:bg-muted transition-all cursor-pointer text-sm"
              >
                <span>Talk to Sales</span>
              </button>
            </div>
          </section>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE 2: FEATURES / ERP MODULES */}
      {/* ========================================================================= */}
      {activePage === 'features' && (
        <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-12 space-y-12 animate-in fade-in duration-200">
          <div className="text-center space-y-2 max-w-3xl mx-auto">
            <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider">
              Comprehensive ERP Capabilities
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
              Built for Speed, Statutory Compliance &amp; Scalability
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Everything your enterprise requires from first voucher entry to audited statutory financial statements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Feature 1 */}
            <div className="bg-card p-6 rounded-md border border-border space-y-4 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-sm bg-primary/10 text-primary">
                  <Zap size={22} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-foreground">Double-Entry Core &amp; Keyboard Speed</h3>
                  <span className="text-[11px] font-mono text-muted-foreground">Keys: F1 - F9 · Alt+G · Alt+C · Ctrl+A</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Seamless vouchers for Sales, Purchase, Receipts, Payments, Contra, Journal, Debit Note, and Credit Note. Fast keyboard entry with zero waiting, inline master creation, and automatic Dr/Cr balancing.
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs pt-2 font-mono">
                <div className="p-2 bg-muted/40 rounded-sm border border-border">F8: Sales Voucher</div>
                <div className="p-2 bg-muted/40 rounded-sm border border-border">F9: Purchase Voucher</div>
                <div className="p-2 bg-muted/40 rounded-sm border border-border">F5: Payment Voucher</div>
                <div className="p-2 bg-muted/40 rounded-sm border border-border">F6: Receipt Voucher</div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-card p-6 rounded-md border border-border space-y-4 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-sm bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <FileCheck size={22} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-foreground">Indian GST Compliance &amp; e-Invoicing</h3>
                  <span className="text-[11px] font-mono text-muted-foreground">GSTR-1 · GSTR-3B · GSTR-2B · IRN · e-Way</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Live intra-state (CGST + SGST) vs inter-state (IGST) calculations based on 2-digit state codes. Instant generation of e-Way bills for consignments over ₹50,000, 64-character IRN simulated hash, and GST portal JSON export.
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs pt-2 font-mono">
                <div className="p-2 bg-muted/40 rounded-sm border border-border">HSN/SAC Table Schedule</div>
                <div className="p-2 bg-muted/40 rounded-sm border border-border">Reverse Charge (RCM)</div>
                <div className="p-2 bg-muted/40 rounded-sm border border-border">e-Way Bill Generation</div>
                <div className="p-2 bg-muted/40 rounded-sm border border-border">NIC / GSP API Proxy</div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-card p-6 rounded-md border border-border space-y-4 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-sm bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Layers size={22} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-foreground">Multi-Godown Inventory Logistics</h3>
                  <span className="text-[11px] font-mono text-muted-foreground">Batches · Reorder Levels · Stock Valuation</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Track inventory across multiple godowns (Main Warehouse, Shop Floor, Finished Goods Depot). Real-time stock alerts, minimum reorder warnings, units of measure, and valuation via FIFO and Weighted Average.
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs pt-2 font-mono">
                <div className="p-2 bg-muted/40 rounded-sm border border-border">Godown Stock Transfer</div>
                <div className="p-2 bg-muted/40 rounded-sm border border-border">Delivery Challan &amp; GRN</div>
                <div className="p-2 bg-muted/40 rounded-sm border border-border">Low Stock Alerts</div>
                <div className="p-2 bg-muted/40 rounded-sm border border-border">Batch &amp; Expiry Control</div>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-card p-6 rounded-md border border-border space-y-4 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-sm bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-foreground">MCA Rule 3(1) Immutable Edit Log</h3>
                  <span className="text-[11px] font-mono text-muted-foreground">Companies Act 2013 Statutory Compliance</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Ministry of Corporate Affairs (MCA) mandated audit trail. Every voucher creation, modification, or cancellation generates an irreversible audit record with timestamp, operator ID, and field-level diffs.
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs pt-2 font-mono">
                <div className="p-2 bg-muted/40 rounded-sm border border-border">Books Freeze Date Lock</div>
                <div className="p-2 bg-muted/40 rounded-sm border border-border">Field Value Before / After</div>
                <div className="p-2 bg-muted/40 rounded-sm border border-border">Exportable Audit PDF/CSV</div>
                <div className="p-2 bg-muted/40 rounded-sm border border-border">Auditor Verification Stamp</div>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="bg-card p-6 rounded-md border border-border space-y-4 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-sm bg-[#075E54]/10 text-[#075E54] dark:text-emerald-400">
                  <Send size={22} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-foreground">WhatsApp Invoicing &amp; Dynamic UPI QR</h3>
                  <span className="text-[11px] font-mono text-muted-foreground">Instant Settlement Matrix</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                One-click WhatsApp dispatch sends formatted PDF invoices, payment links, and dynamic UPI QR codes directly to the customer&apos;s phone. Automated overdue balance reminders keep cash flow predictable.
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs pt-2 font-mono">
                <div className="p-2 bg-muted/40 rounded-sm border border-border">Dynamic UPI QR Code</div>
                <div className="p-2 bg-muted/40 rounded-sm border border-border">Automated Due Alerts</div>
                <div className="p-2 bg-muted/40 rounded-sm border border-border">WhatsApp Message Engine</div>
                <div className="p-2 bg-muted/40 rounded-sm border border-border">Payment Receipt Sharing</div>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="bg-card p-6 rounded-md border border-border space-y-4 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-sm bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <Users size={22} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-foreground">CA Firm Multi-Client Collaboration Portal</h3>
                  <span className="text-[11px] font-mono text-muted-foreground">Direct Tax Audit Hub</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Allow your Chartered Accountant or tax consultant to review your books remotely. CA firm dashboard supports assigning staff, reviewing ledgers, adjusting journal entries, and generating tax audit reports.
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs pt-2 font-mono">
                <div className="p-2 bg-muted/40 rounded-sm border border-border">Multi-Client Switcher</div>
                <div className="p-2 bg-muted/40 rounded-sm border border-border">Article Assistant Roles</div>
                <div className="p-2 bg-muted/40 rounded-sm border border-border">Year-End Adjustments</div>
                <div className="p-2 bg-muted/40 rounded-sm border border-border">Trial Balance Verification</div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-muted/40 rounded-md border border-border text-center space-y-4">
            <h3 className="font-serif text-xl font-bold text-foreground">Ready to test these capabilities in real-time?</h3>
            <button
              onClick={onLaunchClientErp}
              className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-sm hover:bg-primary/90 transition-all shadow-xs cursor-pointer inline-flex items-center gap-2 text-xs"
            >
              <span>Launch Client ERP Workspace</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE 3: PRICING & SUBSCRIPTION PLANS */}
      {/* ========================================================================= */}
      {activePage === 'pricing' && (
        <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-12 space-y-12 animate-in fade-in duration-200">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider">
              Transparent, Scalable Commercial Pricing
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
              Simple Plans for Every Stage of Business Growth
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              14-day free trial on all plans. No credit card required. Upgrade, downgrade, or cancel anytime.
            </p>

            {/* Billing Cycle Toggle */}
            <div className="inline-flex items-center gap-1 bg-muted p-1 rounded-sm border border-border text-xs mt-2">
              <button
                type="button"
                onClick={() => setBillingCycle('MONTHLY')}
                className={`px-3 py-1 rounded-xs font-medium transition-colors cursor-pointer ${
                  billingCycle === 'MONTHLY'
                    ? 'bg-primary text-primary-foreground font-bold shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('ANNUAL')}
                className={`px-3 py-1 rounded-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  billingCycle === 'ANNUAL'
                    ? 'bg-primary text-primary-foreground font-bold shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>Annual Billing</span>
                <span className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] px-1.5 py-0.2 rounded-xs font-bold border border-emerald-500/30">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map(plan => {
              const price = billingCycle === 'ANNUAL' ? plan.annualPrice : plan.monthlyPrice;
              const isPopular = plan.isPopular || plan.id === 'plan-gold';

              return (
                <div
                  key={plan.id}
                  className={`bg-card rounded-md border p-6 flex flex-col justify-between relative transition-all shadow-2xs hover:shadow-md ${
                    isPopular
                      ? 'border-primary ring-1 ring-primary/40'
                      : 'border-border'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-sm shadow-xs">
                      Most Popular
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-foreground">{plan.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1 min-h-[32px]">{plan.description}</p>
                    </div>

                    <div className="pt-2 border-t border-border">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs font-mono text-muted-foreground">₹</span>
                        <span className="text-3xl font-serif font-bold tracking-tight text-foreground">
                          {price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                          /{billingCycle === 'ANNUAL' ? 'yr' : 'mo'}
                        </span>
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                        Includes GST invoice for full 18% ITC
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-border text-xs">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                        Included Features:
                      </div>
                      {plan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                          <span className="text-foreground/90">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-border">
                    <button
                      onClick={onLaunchClientErp}
                      className={`w-full py-2 px-3 text-xs font-bold rounded-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                        isPopular
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs'
                          : 'bg-muted hover:bg-muted/80 text-foreground border border-border'
                      }`}
                    >
                      <span>Choose {plan.name}</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* FAQ Strip */}
          <div className="p-6 bg-card rounded-md border border-border space-y-4">
            <h3 className="font-serif text-lg font-bold text-foreground">Frequently Asked Questions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <strong className="text-foreground">Can I get an Indian GST Tax Invoice for my subscription?</strong>
                <p className="text-muted-foreground">Yes. Nexora Books provides a compliant GST Tax invoice with our GSTIN and your GSTIN so you can claim 100% Input Tax Credit (ITC).</p>
              </div>
              <div className="space-y-1">
                <strong className="text-foreground">What happens after the 14-day free trial?</strong>
                <p className="text-muted-foreground">Your data remains 100% safe. You can activate any commercial license key generated from the Master Admin desk or pay online to continue.</p>
              </div>
              <div className="space-y-1">
                <strong className="text-foreground">Can I migrate all my data from Tally or Busy?</strong>
                <p className="text-muted-foreground">Yes. We support standard Tally Prime XML files and Busy Accounting FIXNOW_20261030_MSAll.DAT and XML backups.</p>
              </div>
              <div className="space-y-1">
                <strong className="text-foreground">Is the MCA Rule 3(1) audit trail guaranteed?</strong>
                <p className="text-muted-foreground">Yes. Our system creates an irreversible, timestamped audit log for every transaction to satisfy Companies Act 2013 ROC audits.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE 4: TALLY & BUSY MIGRATION SUITE */}
      {/* ========================================================================= */}
      {activePage === 'migration' && (
        <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-12 space-y-12 animate-in fade-in duration-200">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-mono font-bold text-amber-500 uppercase tracking-wider">
              Zero-Downtime Data Migration Suite
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
              Effortless Transition from Tally Prime &amp; Busy Accounting
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Don&apos;t abandon your legacy accounts. Import all masters, stock items with HSN codes, opening balances, and vouchers into Nexora Books in under 3 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Tally Migration Card */}
            <div className="bg-card p-6 rounded-md border border-border space-y-4 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 text-primary rounded-sm">
                  <Database size={24} />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-foreground">Tally Prime &amp; ERP 9 Migration</h3>
                  <span className="text-xs text-muted-foreground font-mono">Format: Standard XML (&lt;ENVELOPE&gt;)</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Export from Tally using <strong>Alt+E (Export) &gt; Masters &amp; Transactions &gt; XML format</strong>. Nexora Books maps all Sundry Debtors, Creditors, Duties &amp; Taxes, opening balances, and double-entry postings seamlessly.
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-500" />
                  <span>Preserves ledger groups, party GSTINs &amp; state codes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-500" />
                  <span>Restores full double-entry voucher journals</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-500" />
                  <span>Merge (Safe) or Replace All policy options</span>
                </div>
              </div>
              <div className="pt-4 border-t border-border flex items-center gap-3">
                <button
                  onClick={onLaunchClientErp}
                  className="px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-sm hover:bg-primary/90 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Database size={13} />
                  <span>Open Tally Restore Hub</span>
                </button>
              </div>
            </div>

            {/* Busy Migration Card */}
            <div className="bg-card p-6 rounded-md border border-border space-y-4 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-sm">
                  <FileCheck size={24} />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-foreground">Busy Accounting Software Migration</h3>
                  <span className="text-xs text-muted-foreground font-mono">Format: FIXNOW_20261030_MSAll.DAT / XML</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Full compatibility with Busy 17, 18, and 21 backups including <strong>FIXNOW_20261030_MSAll.DAT</strong> sectional backup files, &lt;BUSYDATA&gt; XML exports, and JSON formats.
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-500" />
                  <span>Direct parser for [COMPANY], [ACCOUNTS], [ITEMS], [TRANSACTIONS]</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-500" />
                  <span>Imports inventory stock items with 4/6/8-digit HSN codes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-500" />
                  <span>Auto-generates MCA Rule 3(1) edit log migration entry</span>
                </div>
              </div>
              <div className="pt-4 border-t border-border flex items-center gap-3">
                <button
                  onClick={onLaunchClientErp}
                  className="px-4 py-2 bg-amber-600 text-white font-bold text-xs rounded-sm hover:bg-amber-700 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <FileCheck size={13} />
                  <span>Open Busy .DAT Restore Hub</span>
                </button>
              </div>
            </div>
          </div>

          {/* 3-Step Guide */}
          <div className="p-8 bg-sidebar/50 rounded-md border border-border space-y-6">
            <h3 className="font-serif text-xl font-bold text-foreground text-center">3-Step Zero-Downtime Migration Process</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div className="p-4 bg-card rounded-sm border border-border space-y-2">
                <div className="size-7 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center font-mono text-xs">1</div>
                <div className="font-bold text-foreground text-sm">Export from Old Software</div>
                <p className="text-muted-foreground">In Tally Prime, press Alt+E &gt; Masters/Vouchers as XML. In Busy, generate your MSAll.DAT or XML backup file.</p>
              </div>
              <div className="p-4 bg-card rounded-sm border border-border space-y-2">
                <div className="size-7 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center font-mono text-xs">2</div>
                <div className="font-bold text-foreground text-sm">Upload to Nexora Books</div>
                <p className="text-muted-foreground">Go to Backup &amp; Restore Hub in Nexora Books. Select your file or test with preloaded sample backups.</p>
              </div>
              <div className="p-4 bg-card rounded-sm border border-border space-y-2">
                <div className="size-7 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center font-mono text-xs">3</div>
                <div className="font-bold text-foreground text-sm">Verify &amp; Invoice Immediately</div>
                <p className="text-muted-foreground">Inspect accounts and opening balances. Start issuing GST invoices with dynamic UPI QR codes in minutes.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE 5: ABOUT US */}
      {/* ========================================================================= */}
      {activePage === 'about' && (
        <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-12 space-y-12 animate-in fade-in duration-200">
          <div className="text-center space-y-3">
            <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider">
              About Nexora Books
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
              Engineered by Accountants, for Indian Businesses
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto">
              Headquartered in Bangalore, Karnataka. Built to deliver enterprise-grade accounting speed to 5,000+ Indian MSMEs and growing enterprises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4 text-xs text-muted-foreground leading-relaxed">
              <h2 className="font-serif text-2xl font-bold text-foreground">
                Our Mission &amp; Vision
              </h2>
              <p>
                For decades, Indian businesses were forced to choose between fast desktop software that lacked cloud mobility, or slow cloud tools that slowed down billers with sluggish mouse clicks.
              </p>
              <p>
                Nexora Books was built to eliminate that compromise. Led by senior systems engineer <strong>S. K. Murthy</strong>, our team engineered a high-performance web architecture that matches Tally Prime&apos;s F1-F9 keyboard speed while delivering instant cloud access, automated WhatsApp invoicing, and statutory MCA Rule 3(1) edit log compliance.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-foreground font-semibold">
                <div className="p-3 bg-card rounded-sm border border-border">5,000+ Client Scale</div>
                <div className="p-3 bg-card rounded-sm border border-border">100% MCA Compliant</div>
                <div className="p-3 bg-card rounded-sm border border-border">Bangalore, Karnataka HQ</div>
                <div className="p-3 bg-card rounded-sm border border-border">99.99% Cloud Uptime</div>
              </div>
            </div>

            <div className="bg-card p-6 rounded-md border border-border space-y-4">
              <div className="p-3 bg-primary/10 text-primary rounded-sm w-fit">
                <Award size={28} />
              </div>
              <h3 className="font-serif text-lg font-bold text-foreground">Statutory Certifications &amp; Standards</h3>
              <ul className="space-y-2.5 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>MCA Rule 3(1) Edit Log:</strong> Compliant with the Companies (Accounts) Rules, 2014 amendment mandating non-disableable audit trails.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>GST Act 2017:</strong> Native support for intra/inter-state tax schedules, HSN/SAC classifications, and GSP portal APIs.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Data Sovereignty:</strong> Hosted on secured cloud servers within the Indian territory with automatic encrypted snapshots.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE 6: CONTACT & SALES DESK */}
      {/* ========================================================================= */}
      {activePage === 'contact' && (
        <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-12 space-y-12 animate-in fade-in duration-200">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider">
              Get in Touch
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
              Sales, Support &amp; Commercial Enquiries
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Speak directly with our technical team in Bangalore for enterprise licenses, bulk migration, or custom multi-branch setups.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Contact Details Column */}
            <div className="md:col-span-5 space-y-6">
              <div className="bg-card p-6 rounded-md border border-border space-y-4">
                <h3 className="font-serif text-lg font-bold text-foreground">Direct Desk Information</h3>
                
                <div className="space-y-3.5 text-xs text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <Phone size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-foreground">Sales &amp; WhatsApp Support</div>
                      <div>+91 98450 12345 / +91 80 4123 4567</div>
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400">Available Mon - Sat (9 AM - 8 PM IST)</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail size={16} className="text-primary shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-foreground">Official Email Contacts</div>
                      <div>sales@nexorabooks.in</div>
                      <div>skmurthy1@gmail.com</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-foreground">Head Office Address</div>
                      <div>Nexora Books Technologies Pvt Ltd</div>
                      <div>Brigade Tech Gardens, Whitefield, Bangalore, Karnataka 560066</div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <button
                    onClick={() => {
                      const text = encodeURIComponent('Hello Nexora Books! I want to enquire about commercial subscription and software demo.');
                      window.open(`https://wa.me/919845012345?text=${text}`, '_blank');
                    }}
                    className="w-full py-2 bg-[#075E54] hover:bg-[#064E46] text-white font-bold rounded-sm text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                  >
                    <Send size={14} />
                    <span>Chat on WhatsApp Directly</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Contact Form Column */}
            <div className="md:col-span-7">
              <div className="bg-card p-6 sm:p-8 rounded-md border border-border shadow-2xs space-y-5">
                <div>
                  <h3 className="font-serif text-xl font-bold text-foreground">Send a Request / Demo Inquiry</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">We typically respond within 30 minutes during business hours.</p>
                </div>

                {contactSubmitted ? (
                  <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-sm text-center space-y-2 text-xs">
                    <CheckCircle2 size={32} className="text-emerald-600 dark:text-emerald-400 mx-auto" />
                    <div className="font-bold text-foreground text-sm">Thank You for Reaching Out!</div>
                    <p className="text-muted-foreground">Our Bangalore sales desk has received your request and will contact you via WhatsApp or phone shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-foreground mb-1">Your Full Name *</label>
                        <input
                          type="text"
                          required
                          value={contactName}
                          onChange={e => setContactName(e.target.value)}
                          placeholder="e.g. Ramesh Kumar"
                          className="w-full px-3 py-2 text-xs border border-input rounded-sm bg-background text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-foreground mb-1">Business / Company Name *</label>
                        <input
                          type="text"
                          required
                          value={contactBusiness}
                          onChange={e => setContactBusiness(e.target.value)}
                          placeholder="e.g. Apex Industrial Works"
                          className="w-full px-3 py-2 text-xs border border-input rounded-sm bg-background text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-foreground mb-1">Indian Mobile Number *</label>
                        <input
                          type="tel"
                          required
                          value={contactMobile}
                          onChange={e => setContactMobile(e.target.value)}
                          placeholder="98450 12345"
                          className="w-full px-3 py-2 text-xs border border-input rounded-sm bg-background text-foreground focus:ring-1 focus:ring-primary focus:outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-foreground mb-1">Business Email ID</label>
                        <input
                          type="email"
                          value={contactEmail}
                          onChange={e => setContactEmail(e.target.value)}
                          placeholder="ramesh@apexworks.in"
                          className="w-full px-3 py-2 text-xs border border-input rounded-sm bg-background text-foreground focus:ring-1 focus:ring-primary focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-foreground mb-1">Requirement / Questions</label>
                      <textarea
                        rows={3}
                        value={contactMessage}
                        onChange={e => setContactMessage(e.target.value)}
                        placeholder="Tell us about your business, current accounting software (Tally / Busy), number of users, or any specific requirements..."
                        className="w-full px-3 py-2 text-xs border border-input rounded-sm bg-background text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-primary text-primary-foreground font-bold rounded-sm text-xs hover:bg-primary/90 transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Send size={14} />
                      <span>Submit Enquiry to Sales Desk</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* COMPREHENSIVE MULTI-PAGE FOOTER */}
      {/* ========================================================================= */}
      <footer className="border-t border-border bg-sidebar/80 text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand info */}
          <div className="col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <NexoraLogo size={30} />
              <span className="font-serif font-bold text-base text-foreground">Nexora Books</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
              Next-generation cloud ERP with authentic Tally keyboard speed, WhatsApp billing, and MCA Rule 3(1) audit trail. Designed for 5,000+ Indian MSMEs.
            </p>
            <div className="text-[11px] font-mono text-muted-foreground">
              Bangalore, Karnataka · support@nexorabooks.in
            </div>
          </div>

          {/* Nav links 1 */}
          <div className="space-y-2">
            <div className="font-bold text-foreground text-xs uppercase tracking-wider">Product</div>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button onClick={() => setActivePage('home')} className="hover:text-foreground cursor-pointer">
                  Overview
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('features')} className="hover:text-foreground cursor-pointer">
                  ERP Capabilities
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('pricing')} className="hover:text-foreground cursor-pointer">
                  Pricing Plans
                </button>
              </li>
              <li>
                <button onClick={onLaunchClientErp} className="hover:text-foreground cursor-pointer font-semibold text-primary">
                  Launch Client ERP
                </button>
              </li>
            </ul>
          </div>

          {/* Nav links 2 */}
          <div className="space-y-2">
            <div className="font-bold text-foreground text-xs uppercase tracking-wider">Migration</div>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button onClick={() => setActivePage('migration')} className="hover:text-foreground cursor-pointer">
                  Tally Prime XML
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('migration')} className="hover:text-foreground cursor-pointer">
                  Busy MSAll.DAT
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('migration')} className="hover:text-foreground cursor-pointer">
                  Migration Guide
                </button>
              </li>
            </ul>
          </div>

          {/* Nav links 3 */}
          <div className="space-y-2">
            <div className="font-bold text-foreground text-xs uppercase tracking-wider">Company</div>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button onClick={() => setActivePage('about')} className="hover:text-foreground cursor-pointer">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('contact')} className="hover:text-foreground cursor-pointer">
                  Contact &amp; Sales
                </button>
              </li>
              <li>
                <a href="#compliance" onClick={() => setActivePage('about')} className="hover:text-foreground cursor-pointer">
                  MCA Compliance
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Discreet Super Admin Access */}
        <div className="border-t border-border py-4 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-muted-foreground">
            <div>
              © 2026 Nexora Books Pvt Ltd · MCA Rule 3(1) Compliant · Engineered in Bangalore
            </div>
            <div className="flex items-center gap-3">
              <span>All Rights Reserved</span>
              <span>·</span>
              {/* Discreet, separate entry point for Super Admin */}
              <button
                onClick={onOpenAdminLogin}
                className="text-muted-foreground/70 hover:text-foreground underline transition-colors cursor-pointer"
                title="Restricted platform administrator login"
              >
                Admin Portal
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
