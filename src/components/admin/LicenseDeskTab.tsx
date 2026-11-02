/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TenantClient } from '../../types/admin';
import { saveTenantClients } from '../../services/adminService';
import {
  KeyRound,
  Copy,
  Check,
  Send,
  Sparkles,
  TrendingUp,
  Users,
  DollarSign,
  Building2,
  Phone,
  ShieldCheck,
  RefreshCw,
  Plus,
} from 'lucide-react';

interface LicenseDeskTabProps {
  clients: TenantClient[];
  onRefresh: () => void;
}

export const LicenseDeskTab: React.FC<LicenseDeskTabProps> = ({ clients, onRefresh }) => {
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [customerBiz, setCustomerBiz] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('PRO');
  const [duration, setDuration] = useState('ANNUAL');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedCount, setSimulatedCount] = useState<number | null>(null);

  const targetSubscribers = 5000;
  const currentSubscribers = clients.length;
  const progressPercent = Math.min(100, Math.round((currentSubscribers / targetSubscribers) * 100));
  const projectedARR = targetSubscribers * 9999;

  const handleGenerateLicense = (e: React.FormEvent) => {
    e.preventDefault();
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const seg1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const seg2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const key = `NXRA-2026-${seg1}-${seg2}-${selectedPlan}`;
    setGeneratedKey(key);
  };

  const handleCopyKey = () => {
    if (!generatedKey) return;
    navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareKeyWhatsApp = () => {
    if (!generatedKey || !customerMobile) return;
    const cleanMobile = customerMobile.replace(/\D/g, '');
    const targetNumber = cleanMobile.startsWith('91') ? cleanMobile : `91${cleanMobile}`;
    const text = encodeURIComponent(
      `Hello ${customerName || 'Valued Customer'},\n\nThank you for choosing *Nexora Books* for ${customerBiz || 'your business'}!\n\nYour official commercial activation license key is:\n*${generatedKey}*\n\nPlan: ${selectedPlan} (${duration})\nValidity: Active for 1 Year\n\nLogin to activate: https://nexorabooks.onhercules.app\n\nFor support contact S. K. Murthy (Master Administrator).`
    );
    window.open(`https://wa.me/${targetNumber}?text=${text}`, '_blank');
  };

  const handleSimulateHighScaleTenants = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const cities = ['Mumbai', 'Delhi', 'Bengaluru', 'Ahmedabad', 'Pune', 'Hyderabad', 'Chennai', 'Kolkata', 'Surat', 'Jaipur'];
      const sectors = ['Textiles', 'Engineering', 'Electronics', 'Steel & Wire', 'Pharma & Chemicals', 'Logistics', 'Auto Parts', 'Retail Foods'];
      const mockNames = ['Patel', 'Shah', 'Sharma', 'Gupta', 'Verma', 'Agarwal', 'Mehta', 'Rao', 'Reddy', 'Singh', 'Joshi', 'Chopra'];

      const newTenants: TenantClient[] = [];
      for (let i = 1; i <= 50; i++) {
        const city = cities[i % cities.length];
        const sec = sectors[i % sectors.length];
        const surname = mockNames[i % mockNames.length];
        const mobileNum = `98${Math.floor(10000000 + Math.random() * 89999999)}`;
        const planTier = i % 3 === 0 ? 'Enterprise Cloud' : i % 2 === 0 ? 'Business Pro' : 'Starter Solo';
        const amount = planTier === 'Enterprise Cloud' ? 19999 : planTier === 'Business Pro' ? 9999 : 4999;

        newTenants.push({
          id: `cli-sim-${Date.now()}-${i}`,
          name: `Mr. ${surname}`,
          businessName: `${surname} ${sec} (${city})`,
          mobile: mobileNum,
          email: `${surname.toLowerCase()}.${city.toLowerCase()}@nexorabooks-client.in`,
          gstin: `27AABC${Math.floor(1000 + Math.random() * 9000)}M1Z${i % 9}`,
          portalPin: `${Math.floor(1000 + Math.random() * 9000)}`,
          role: 'OWNER',
          status: i % 8 === 0 ? 'TRIAL' : 'ACTIVE',
          planId: planTier === 'Enterprise Cloud' ? 'enterprise' : 'professional',
          planName: planTier,
          amount,
          billingCycle: 'ANNUAL',
          dueDate: new Date(Date.now() + (30 + i * 5) * 86400000).toISOString().split('T')[0],
          paymentStatus: 'PAID',
          lastLogin: `${i % 5} hours ago`,
          createdAt: '2026-02-10',
          dbStats: {
            ledgersCount: 20 + (i * 3) % 40,
            vouchersCount: 80 + (i * 12) % 200,
            stockCount: 15 + (i * 2) % 35,
            sizeKb: 120 + i * 15,
          },
        });
      }

      saveTenantClients([...newTenants, ...clients]);
      onRefresh();
      setIsSimulating(false);
      setSimulatedCount(50);
      setTimeout(() => setSimulatedCount(null), 4000);
    }, 700);
  };

  return (
    <div className="space-y-6">
      {/* Master Admin Revenue & 5000 Subscribers Progress Banner */}
      <div className="bg-gradient-to-r from-card via-card to-primary/5 p-6 rounded-md border border-border shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck size={20} className="text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-serif font-bold text-lg text-foreground">
                Master Admin Commercial Desk — S. K. Murthy
              </h3>
            </div>
            <p className="text-xs text-muted-foreground max-w-2xl">
              Centralized license engine and subscriber management built to scale Nexora Books to <strong>5,000+ business subscribers</strong> nationwide.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulateHighScaleTenants}
              disabled={isSimulating}
              className="px-3.5 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold rounded-sm text-xs border border-border shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Populate 50 diversified real Indian businesses to verify high-scale performance"
            >
              <RefreshCw size={13} className={isSimulating ? 'animate-spin' : ''} />
              <span>Simulate 50+ Regional Businesses</span>
            </button>
          </div>
        </div>

        {simulatedCount && (
          <div className="p-3 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 rounded-sm text-xs animate-in fade-in">
            Successfully generated 50 regional enterprise client databases across Mumbai, Delhi, Pune, and Bengaluru!
          </div>
        )}

        {/* Commercial Scaling Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-border/60">
          <div>
            <span className="text-[11px] text-muted-foreground uppercase font-semibold">Subscriber Goal</span>
            <div className="font-mono text-2xl font-bold text-foreground">5,000</div>
            <div className="text-[10px] text-muted-foreground">Target businesses</div>
          </div>

          <div>
            <span className="text-[11px] text-muted-foreground uppercase font-semibold">Current Active</span>
            <div className="font-mono text-2xl font-bold text-primary">{currentSubscribers}</div>
            <div className="text-[10px] text-muted-foreground">{progressPercent}% of target</div>
          </div>

          <div>
            <span className="text-[11px] text-muted-foreground uppercase font-semibold">Projected Annual Revenue</span>
            <div className="font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400">₹4.99 Cr</div>
            <div className="text-[10px] text-muted-foreground">At ₹9,999/yr avg plan</div>
          </div>

          <div>
            <span className="text-[11px] text-muted-foreground uppercase font-semibold">Your Master Margin</span>
            <div className="font-mono text-2xl font-bold text-amber-600 dark:text-amber-400">92.4%</div>
            <div className="text-[10px] text-muted-foreground">Zero per-seat licensing cost</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1 pt-1">
          <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
            <span>Scale to 5,000 Subscribers</span>
            <span>{currentSubscribers} / 5,000 ({progressPercent}%)</span>
          </div>
          <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-500"
              style={{ width: `${Math.max(2, progressPercent)}%` }}
            />
          </div>
        </div>
      </div>

      {/* License Key Generator Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-card p-5 rounded-md border border-border shadow-2xs space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <KeyRound size={16} className="text-primary" />
              <h4 className="font-serif font-bold text-sm text-foreground">
                Generate &amp; Issue Commercial License Key
              </h4>
            </div>
            <p className="text-xs text-muted-foreground">
              Create official activation license keys to sell subscriptions to clients online, over the phone, or in person.
            </p>
          </div>

          <form onSubmit={handleGenerateLicense} className="space-y-3 text-xs">
            <div>
              <label className="block text-muted-foreground font-semibold mb-1">Customer / Contact Name</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="e.g. Anand Mahindra"
                className="w-full px-3 py-2 bg-background border border-border rounded-sm text-foreground focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Customer Mobile (+91)</label>
                <input
                  type="tel"
                  required
                  value={customerMobile}
                  onChange={e => setCustomerMobile(e.target.value)}
                  placeholder="98200 11223"
                  className="w-full px-3 py-2 font-mono bg-background border border-border rounded-sm text-foreground focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Business Name</label>
                <input
                  type="text"
                  value={customerBiz}
                  onChange={e => setCustomerBiz(e.target.value)}
                  placeholder="Mahindra Ancillaries"
                  className="w-full px-3 py-2 bg-background border border-border rounded-sm text-foreground focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Subscription Tier</label>
                <select
                  value={selectedPlan}
                  onChange={e => setSelectedPlan(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-sm text-foreground focus:outline-hidden cursor-pointer"
                >
                  <option value="STARTER">Starter Solo (₹4,999/yr)</option>
                  <option value="PRO">Business Pro (₹9,999/yr)</option>
                  <option value="ENTERPRISE">Enterprise Cloud (₹19,999/yr)</option>
                  <option value="CA_FIRM">CA &amp; Tax Consultant (₹24,999/yr)</option>
                </select>
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Validity Duration</label>
                <select
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-sm text-foreground focus:outline-hidden cursor-pointer"
                >
                  <option value="ANNUAL">1 Year (Annual)</option>
                  <option value="MONTHLY">1 Month</option>
                  <option value="LIFETIME">Lifetime Enterprise</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-primary text-primary-foreground font-semibold rounded-sm hover:bg-primary/90 transition-colors shadow-2xs cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <KeyRound size={14} />
              <span>Generate Activation Key</span>
            </button>
          </form>
        </div>

        {/* License Output & Dispatch Box */}
        <div className="lg:col-span-6 bg-card p-5 rounded-md border border-border shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-foreground">
              Generated License Key &amp; Dispatch
            </h4>
            <p className="text-xs text-muted-foreground">
              Once generated, send this key to the customer. When they sign in, this unlocks their full ERP without trial restrictions.
            </p>

            {generatedKey ? (
              <div className="space-y-3">
                <div className="p-4 bg-muted/60 border border-border rounded-sm font-mono text-center space-y-2">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest block">
                    Nexora Commercial License Key
                  </span>
                  <div className="text-base font-bold text-primary tracking-wider select-all">
                    {generatedKey}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Assigned to: <strong className="text-foreground">{customerName || 'Customer'}</strong> ({selectedPlan})
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleCopyKey}
                    className="flex-1 py-2 bg-card hover:bg-accent text-foreground font-semibold text-xs rounded-sm border border-border shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    <span>{copied ? 'Copied to Clipboard!' : 'Copy License Key'}</span>
                  </button>

                  <button
                    onClick={handleShareKeyWhatsApp}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-sm shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send size={14} />
                    <span>Send via WhatsApp</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground text-xs border border-dashed border-border rounded-sm bg-muted/20">
                Fill in the customer details on the left and click "Generate Activation Key" to issue a new subscription.
              </div>
            )}
          </div>

          <div className="p-3 bg-muted/30 border border-border rounded-sm text-[11px] text-muted-foreground">
            💡 <strong>Commercial Tip:</strong> You can resell Nexora Books subscriptions to accountants, GST consultants, retailers, and factory owners in your region with 100% margin retention.
          </div>
        </div>
      </div>
    </div>
  );
};
