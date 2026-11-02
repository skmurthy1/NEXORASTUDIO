/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SubscriptionPlanConfig, AutomationSettings } from '../../types/admin';
import {
  saveSubscriptionPlans,
  saveAutomationSettings,
} from '../../services/adminService';
import {
  Tag,
  Check,
  Clock,
  Sparkles,
  Save,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Edit2,
  DollarSign,
} from 'lucide-react';

interface PricingPlansTabProps {
  plans: SubscriptionPlanConfig[];
  automation: AutomationSettings;
  onRefresh: () => void;
}

export const PricingPlansTab: React.FC<PricingPlansTabProps> = ({
  plans,
  automation,
  onRefresh,
}) => {
  const [editablePlans, setEditablePlans] = useState<SubscriptionPlanConfig[]>(plans);
  const [trialDaysInput, setTrialDaysInput] = useState<number>(automation.defaultTrialDays);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const handlePriceChange = (
    planId: string,
    field: 'monthlyPrice' | 'annualPrice',
    value: string
  ) => {
    const num = Math.max(0, parseInt(value, 10) || 0);
    setEditablePlans(prev =>
      prev.map(p => (p.id === planId ? { ...p, [field]: num } : p))
    );
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    saveSubscriptionPlans(editablePlans);
    saveAutomationSettings({
      ...automation,
      defaultTrialDays: trialDaysInput,
    });
    onRefresh();
    setSaveSuccess('Subscription prices and trial days updated across all tenant signups.');
    setTimeout(() => setSaveSuccess(null), 3500);
  };

  return (
    <form onSubmit={handleSaveAll} className="space-y-6">
      {saveSuccess && (
        <div className="flex items-center gap-2 p-3 text-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 rounded-sm animate-in fade-in">
          <CheckCircle size={15} />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* Global Trial Period Setting Card */}
      <div className="bg-card p-5 rounded-md border border-border shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-primary" />
              <h3 className="font-serif font-bold text-sm text-foreground">
                Tenant Free Trial Duration Controller
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Configure the trial duration granted automatically to new business signups. Once these days elapse, access is auto-locked until payment.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={90}
                value={trialDaysInput}
                onChange={e => setTrialDaysInput(parseInt(e.target.value, 10) || 14)}
                className="w-20 px-3 py-1.5 font-mono text-center text-sm font-bold bg-background border border-border rounded-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
              />
              <span className="text-xs font-semibold text-muted-foreground">Days</span>
            </div>

            <div className="flex gap-1">
              {[7, 14, 21, 30].map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setTrialDaysInput(d)}
                  className={`px-2 py-1 text-[11px] rounded-sm font-medium border cursor-pointer transition-colors ${
                    trialDaysInput === d
                      ? 'bg-primary text-primary-foreground border-primary font-bold'
                      : 'bg-muted text-muted-foreground hover:text-foreground border-border'
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Live Plan Pricing Matrix */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-sm text-foreground">
              Subscription Tiers & Rate Configuration
            </h3>
            <p className="text-xs text-muted-foreground">
              Adjust monthly and annual prices. Changes reflect instantly on the public landing page and client billing modal.
            </p>
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-sm hover:bg-primary/90 transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5 text-xs shrink-0"
          >
            <Save size={14} />
            <span>Save Pricing Changes</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {editablePlans.map(plan => {
            return (
              <div
                key={plan.id}
                className={`bg-card rounded-md border p-4 flex flex-col justify-between transition-shadow shadow-2xs relative ${
                  plan.isPopular ? 'border-primary ring-1 ring-primary/30' : 'border-border'
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-2.5 right-3 bg-primary text-primary-foreground font-mono text-[9px] font-bold px-2 py-0.5 rounded-sm shadow-2xs uppercase tracking-wider">
                    Most Popular
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <h4 className="font-serif font-bold text-base text-foreground">{plan.name}</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug line-clamp-2">
                      {plan.description}
                    </p>
                  </div>

                  {/* Monthly Price Input */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-muted-foreground block">
                      Monthly Rate (₹/month)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1.5 text-xs font-mono text-muted-foreground">₹</span>
                      <input
                        type="number"
                        value={plan.monthlyPrice}
                        onChange={e => handlePriceChange(plan.id, 'monthlyPrice', e.target.value)}
                        className="w-full pl-6 pr-2 py-1 font-mono text-sm font-bold bg-background border border-border rounded-sm text-foreground focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Annual Price Input */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-muted-foreground block flex justify-between">
                      <span>Annual Rate (₹/year)</span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                        {Math.round((1 - plan.annualPrice / (plan.monthlyPrice * 12)) * 100)}% off
                      </span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1.5 text-xs font-mono text-muted-foreground">₹</span>
                      <input
                        type="number"
                        value={plan.annualPrice}
                        onChange={e => handlePriceChange(plan.id, 'annualPrice', e.target.value)}
                        className="w-full pl-6 pr-2 py-1 font-mono text-sm font-bold bg-background border border-border rounded-sm text-foreground focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Feature Checklist */}
                  <div className="pt-2 border-t border-border/60 space-y-1.5">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                      Included Features
                    </span>
                    <ul className="space-y-1 text-[11px] text-foreground/80">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <Check size={12} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <span className="leading-tight">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-border/60">
                  <div className="text-[10px] text-muted-foreground text-center">
                    Billed to tenant on active GSTIN
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </form>
  );
};
