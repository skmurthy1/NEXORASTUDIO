/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Search,
  HelpCircle,
  Building2,
  User,
  Crown,
  Calendar,
  LogOut,
  Sun,
  Moon,
  Sparkles,
  ShieldCheck,
  Database,
  Home,
  Globe,
  ArrowLeft,
  LifeBuoy,
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { useTheme } from '../../context/ThemeContext';
import { NexoraLogo } from '../common/NexoraLogo';

interface TopBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenGoTo: () => void;
  onOpenCompanyModal: () => void;
  onOpenCheatSheet: () => void;
  onOpenAuthModal: () => void;
  onOpenSubscriptionModal: () => void;
  onOpenPeriodModal: () => void;
  onNavigateLanding?: () => void;
  onOpenAdmin?: () => void;
  onOpenSupportModal?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  setActiveTab,
  onOpenGoTo,
  onOpenCompanyModal,
  onOpenCheatSheet,
  onOpenAuthModal,
  onOpenSubscriptionModal,
  onOpenPeriodModal,
  onNavigateLanding,
  onOpenAdmin,
  onOpenSupportModal,
}) => {
  const { activeCompany, auth, subscription, logout } = useErp();
  const { resolvedTheme, toggleTheme } = useTheme();

  const navLinks = [
    { id: 'gateway', label: 'Gateway' },
    { id: 'vouchers', label: 'Day Book' },
    { id: 'orders', label: 'Orders & Challans' },
    { id: 'masters', label: 'Masters' },
    { id: 'gst', label: 'GST Returns' },
    { id: 'statements', label: 'Statements' },
    { id: 'audit-trail', label: 'Audit Trail' },
    { id: 'backup-restore', label: 'Backup & Restore' },
    { id: 'ca-portal', label: 'CA Firm' },
    { id: 'my-subscription', label: 'My Subscription' },
  ];

  return (
    <header className="sticky top-0 z-40 flex h-13 items-center gap-2 border-b bg-sidebar px-3 select-none no-print transition-colors">
      {/* Brand & Wordmark */}
      <div
        onClick={() => setActiveTab('gateway')}
        className="flex items-center gap-2 cursor-pointer shrink-0 group py-1"
        aria-label="Gateway"
      >
        <NexoraLogo size={28} />
        <span className="font-serif text-2xl font-bold leading-none tracking-tight text-foreground whitespace-nowrap">
          Nexora Books
          <span className="text-accent text-amber-500">.</span>
        </span>
      </div>

      {/* Return to Public Website Button */}
      {onNavigateLanding && (
        <button
          type="button"
          onClick={onNavigateLanding}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-sm bg-muted/80 hover:bg-muted text-foreground border border-border transition-colors cursor-pointer shrink-0 shadow-2xs"
          title="Return to Main Frontend Website & Plans"
        >
          <ArrowLeft className="size-3.5" />
          <span>Website</span>
        </button>
      )}

      <div className="mx-1 hidden h-6 w-px bg-border sm:block" />

      {/* Active Company Pill Button (F3) */}
      <button
        type="button"
        onClick={onOpenCompanyModal}
        className="flex min-w-0 cursor-pointer items-center gap-2 rounded-sm px-2.5 py-1 transition-colors hover:bg-accent hover:text-accent-foreground text-xs font-medium text-foreground"
        title="Switch or Alter Company [F3]"
      >
        <Building2 className="size-3.5 shrink-0 text-muted-foreground" />
        <span className="truncate max-w-[130px] sm:max-w-[200px] font-medium">
          {activeCompany.tradeName || activeCompany.name}
        </span>
        <kbd className="hidden font-mono text-[10px] text-primary bg-muted px-1.5 py-0.5 rounded border border-border md:inline-flex">
          F3
        </kbd>
      </button>

      {/* Navigation Links for Desktop */}
      <nav className="hidden xl:flex items-center gap-0.5 mx-2">
        {navLinks.map(link => {
          const isActive = activeTab === link.id;
          return (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded-sm whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {link.label}
            </button>
          );
        })}
      </nav>

      {/* Right Action Cluster */}
      <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
        {/* Period Selector (Alt+F2) */}
        <button
          type="button"
          onClick={onOpenPeriodModal}
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-sm border border-border bg-card hover:bg-accent hover:text-accent-foreground text-xs text-foreground transition-colors cursor-pointer shadow-2xs"
          title="Change Period [Alt+F2]"
        >
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Period:</span>
          <span className="font-mono text-xs font-medium">FY {activeCompany.financialYear}</span>
          <kbd className="text-[10px] font-mono text-primary bg-muted px-1 rounded">Alt+F2</kbd>
        </button>

        {/* Date Selector (F2) */}
        <button
          type="button"
          onClick={onOpenPeriodModal}
          className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-sm border border-border bg-card hover:bg-accent hover:text-accent-foreground text-xs text-foreground transition-colors cursor-pointer shadow-2xs"
          title="Current Date [F2]"
        >
          <Calendar className="size-3 text-muted-foreground" />
          <span className="font-mono text-xs font-medium">
            {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
          </span>
          <kbd className="text-[10px] font-mono text-primary bg-muted px-1 rounded">F2</kbd>
        </button>

        {/* Go To Global Search (Alt+G) */}
        <button
          type="button"
          onClick={onOpenGoTo}
          className="flex cursor-pointer items-center gap-1.5 rounded-sm border border-border bg-card hover:bg-accent hover:text-accent-foreground px-2.5 py-1 text-xs font-medium text-foreground transition-colors shadow-2xs"
          title="Go To Quick Navigator [Alt+G]"
        >
          <Search className="size-3.5 text-primary" />
          <span className="hidden sm:inline">Go To</span>
          <kbd className="hidden sm:inline-flex text-[10px] font-mono text-primary bg-muted px-1 rounded border border-border">
            Alt+G
          </kbd>
        </button>

        {/* Data Backup & Restore Hub Button */}
        <button
          type="button"
          onClick={() => setActiveTab('backup-restore')}
          className={`flex cursor-pointer items-center gap-1.5 rounded-sm border px-2.5 py-1 text-xs font-medium transition-colors shadow-2xs ${
            activeTab === 'backup-restore'
              ? 'bg-primary text-primary-foreground border-primary font-semibold'
              : 'border-border bg-card hover:bg-accent hover:text-accent-foreground text-foreground'
          }`}
          title="Tally Prime & Busy Accounting Backup/Restore Hub"
        >
          <Database className="size-3.5 text-primary" />
          <span className="hidden md:inline">Backup & Restore</span>
        </button>

        {/* Theme Toggle (Light / Dark) */}
        <button
          type="button"
          onClick={toggleTheme}
          className="flex cursor-pointer items-center justify-center size-8 rounded-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle theme"
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="size-4 text-amber-400" />
          ) : (
            <Moon className="size-4 text-muted-foreground hover:text-foreground" />
          )}
        </button>

        {/* Keyboard Shortcuts Cheat Sheet */}
        <button
          type="button"
          onClick={onOpenCheatSheet}
          className="hidden sm:flex cursor-pointer items-center justify-center size-8 rounded-sm text-muted-foreground hover:text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          title="Keyboard shortcuts cheat sheet [?]"
          aria-label="Keyboard shortcuts"
        >
          <HelpCircle className="size-4" />
        </button>

        {/* Helpdesk & Support Tickets */}
        {onOpenSupportModal && (
          <button
            type="button"
            onClick={onOpenSupportModal}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-sm border border-border bg-card hover:bg-accent text-foreground transition-colors cursor-pointer shadow-2xs"
            title="Helpdesk & Support Tickets"
          >
            <LifeBuoy className="size-3.5 text-primary" />
            <span className="hidden lg:inline">Support</span>
          </button>
        )}

        {/* Return to Landing Page Button */}
        {onNavigateLanding && (
          <button
            type="button"
            onClick={onNavigateLanding}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-sm border border-border bg-card hover:bg-accent text-foreground transition-colors cursor-pointer shadow-2xs"
            title="Return to Public Website & Plans"
          >
            <Globe className="size-3.5 text-primary" />
            <span className="hidden md:inline">Public Site</span>
          </button>
        )}

        {/* Subscription Badge */}
        <button
          type="button"
          onClick={() => setActiveTab('my-subscription')}
          className={`hidden sm:flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-sm transition-colors cursor-pointer ${
            activeTab === 'my-subscription'
              ? 'bg-primary text-primary-foreground font-bold shadow-xs'
              : subscription.status === 'TRIAL'
              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
              : 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20'
          }`}
          title="Open My Subscription & Billing Dashboard"
        >
          <Crown className="size-3 text-amber-500" />
          <span>{subscription.tier} {subscription.status === 'TRIAL' ? '· TRIAL' : ''}</span>
        </button>

        {/* User Account Button */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={onOpenAuthModal}
            className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-sm transition-colors cursor-pointer"
            title={auth.isLoggedIn ? `Logged in as ${auth.name} (+91 ${auth.mobile})` : 'Sign in'}
          >
            <div className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[11px]">
              {(auth.name || 'U').charAt(0).toUpperCase()}
            </div>
            <span className="hidden md:inline font-medium truncate max-w-[100px]">
              {auth.name.split(' ')[0]}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
