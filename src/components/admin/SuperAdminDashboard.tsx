/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  TenantClient,
  SubscriptionPlanConfig,
  AutomationSettings,
} from '../../types/admin';
import {
  getTenantClients,
  getSubscriptionPlans,
  getAutomationSettings,
} from '../../services/adminService';
import { ClientsDatabaseTab } from './ClientsDatabaseTab';
import { SubscriptionsTab } from './SubscriptionsTab';
import { PricingPlansTab } from './PricingPlansTab';
import { AutomationSettingsTab } from './AutomationSettingsTab';
import { LicenseDeskTab } from './LicenseDeskTab';
import { NexoraLogo } from '../common/NexoraLogo';
import { useTheme } from '../../context/ThemeContext';
import {
  Database,
  CreditCard,
  Tag,
  Zap,
  ArrowLeft,
  Sun,
  Moon,
  ShieldCheck,
  Building2,
  LogOut,
  ExternalLink,
  Layers,
  KeyRound,
  TrendingUp,
} from 'lucide-react';

interface SuperAdminDashboardProps {
  onBackToLanding: () => void;
  onOpenClientErp: () => void;
  onImpersonateClient?: (client: TenantClient) => void;
  onLogoutAdmin: () => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  onBackToLanding,
  onOpenClientErp,
  onImpersonateClient,
  onLogoutAdmin,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'clients' | 'subscriptions' | 'plans' | 'automation' | 'license-desk'>('clients');

  const [clients, setClients] = useState<TenantClient[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlanConfig[]>([]);
  const [automation, setAutomation] = useState<AutomationSettings>(getAutomationSettings());

  const reloadData = () => {
    setClients(getTenantClients());
    setPlans(getSubscriptionPlans());
    setAutomation(getAutomationSettings());
  };

  useEffect(() => {
    reloadData();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors">
      {/* Super Admin Top Header */}
      <header className="sticky top-0 z-40 bg-sidebar/90 backdrop-blur-md border-b border-border select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Brand & Context */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToLanding}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-foreground bg-muted hover:bg-muted/80 rounded-sm border border-border transition-colors cursor-pointer"
              title="Return to Public Website"
            >
              <ArrowLeft size={14} />
              <span>Website</span>
            </button>
            <NexoraLogo size={30} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-sm tracking-tight text-foreground">
                  Nexora Books Admin
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded-sm border border-emerald-500/20">
                  ROOT CONSOLE
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground hidden sm:inline">
                Tenant Database & Automated Subscription Hub
              </span>
            </div>
          </div>

          {/* Quick Action Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenClientErp}
              className="px-3 py-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground font-semibold rounded-sm text-xs border border-primary/20 shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ExternalLink size={13} />
              <span className="hidden sm:inline">Launch Client ERP</span>
            </button>

            <button
              onClick={toggleTheme}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted border border-border rounded-sm transition-colors cursor-pointer"
              title="Toggle Dark / Light Theme"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            <button
              onClick={onLogoutAdmin}
              className="p-1.5 text-rose-600 hover:bg-rose-500/10 border border-border rounded-sm transition-colors cursor-pointer"
              title="Lock Admin Session"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>

        {/* Tab Navigation Ribbon */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto no-scrollbar border-t border-border/60 py-1">
          <button
            onClick={() => setActiveTab('clients')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-sm transition-colors cursor-pointer shrink-0 ${
              activeTab === 'clients'
                ? 'bg-primary text-primary-foreground shadow-2xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <Database size={13} />
            <span>Clients & Databases</span>
            <span className="font-mono text-[10px] ml-1 opacity-80">({clients.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-sm transition-colors cursor-pointer shrink-0 ${
              activeTab === 'subscriptions'
                ? 'bg-primary text-primary-foreground shadow-2xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <CreditCard size={13} />
            <span>Subscriptions & Due Dates</span>
          </button>

          <button
            onClick={() => setActiveTab('plans')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-sm transition-colors cursor-pointer shrink-0 ${
              activeTab === 'plans'
                ? 'bg-primary text-primary-foreground shadow-2xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <Tag size={13} />
            <span>Plans & Pricing</span>
          </button>

          <button
            onClick={() => setActiveTab('automation')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-sm transition-colors cursor-pointer shrink-0 ${
              activeTab === 'automation'
                ? 'bg-primary text-primary-foreground shadow-2xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <Zap size={13} />
            <span>Automation & WhatsApp</span>
          </button>

          <button
            onClick={() => setActiveTab('license-desk')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-sm transition-colors cursor-pointer shrink-0 ${
              activeTab === 'license-desk'
                ? 'bg-primary text-primary-foreground shadow-2xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <KeyRound size={13} />
            <span>5,000 Scale & License Desk</span>
          </button>
        </div>
      </header>

      {/* Main Tab View Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-4">
        {activeTab === 'clients' && (
          <ClientsDatabaseTab
            clients={clients}
            onRefresh={reloadData}
            onImpersonateClient={onImpersonateClient}
          />
        )}

        {activeTab === 'subscriptions' && (
          <SubscriptionsTab
            clients={clients}
            onRefresh={reloadData}
          />
        )}

        {activeTab === 'plans' && (
          <PricingPlansTab
            plans={plans}
            automation={automation}
            onRefresh={reloadData}
          />
        )}

        {activeTab === 'automation' && (
          <AutomationSettingsTab
            automation={automation}
            sampleClient={clients[0]}
            onRefresh={reloadData}
          />
        )}

        {activeTab === 'license-desk' && (
          <LicenseDeskTab
            clients={clients}
            onRefresh={reloadData}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-sidebar/50 py-3 px-6 text-center text-xs text-muted-foreground">
        Nexora Books Multi-Tenant Super Administrator Console · MCA Rule 3(1) Compliant Audit Active
      </footer>
    </div>
  );
};
