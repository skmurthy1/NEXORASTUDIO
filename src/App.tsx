/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ErpProvider, useErp } from './context/ErpContext';
import { TopBar } from './components/navigation/TopBar';
import { ShortcutBar, KeyboardCheatSheetModal } from './components/navigation/ShortcutBar';
import { GoToModal } from './components/navigation/GoToModal';
import { PeriodModal } from './components/navigation/PeriodModal';
import { AuthModal } from './components/auth/AuthModal';
import { SubscriptionModal } from './components/subscription/SubscriptionModal';
import { CompanyModal } from './components/company/CompanyModal';
import { CompanySetupWizardModal } from './components/company/CompanySetupWizardModal';
import { VoucherModal } from './components/vouchers/VoucherModal';
import { VoucherPrintModal } from './components/print/VoucherPrintModal';
import { QuickMasterModal } from './components/masters/QuickMasterModal';
import { DataManagementModal } from './components/data/DataManagementModal';
import { WhatsAppModal } from './components/whatsapp/WhatsAppModal';
import { WhatsAppDocType } from './services/whatsappService';
import { SupportTicketModal } from './components/support/SupportTicketModal';
import { NexoraLogo } from './components/common/NexoraLogo';
import {
  Lock,
  ShieldCheck,
  Zap,
  FileCheck,
  CreditCard,
  Send,
  LogOut,
  Sparkles,
  Layers,
  ArrowRight,
  ArrowLeft,
  Home,
} from 'lucide-react';

// Views
import { GatewayOfTally } from './components/dashboard/GatewayOfTally';
import { DayBookView } from './components/vouchers/DayBookView';
import { OrdersChallansView } from './components/vouchers/OrdersChallansView';
import { LedgerMasterView } from './components/masters/LedgerMasterView';
import { FinancialStatementsView } from './components/reports/FinancialStatementsView';
import { GstReturnsView } from './components/gst/GstReturnsView';
import { CaFirmPortalView } from './components/ca/CaFirmPortalView';
import { AuditTrailView } from './components/audit/AuditTrailView';
import { GSPIntegrationSettings } from './components/gst/GSPIntegrationSettings';
import { DataBackupRestoreView } from './components/data/DataBackupRestoreView';
import { MySubscriptionView } from './components/subscription/MySubscriptionView';

// Landing & Admin Components
import { FrontendLandingPage } from './components/landing/FrontendLandingPage';
import { SuperAdminDashboard } from './components/admin/SuperAdminDashboard';
import { SuperAdminLoginPage } from './components/admin/SuperAdminLoginPage';
import { AdminAuthModal } from './components/admin/AdminAuthModal';
import { TenantClient } from './types/admin';

// Hooks & Types
import { ThemeProvider } from './context/ThemeContext';
import { RightVouchersStrip } from './components/navigation/RightVouchersStrip';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { VoucherType } from './types/erp';

interface MainAppContentProps {
  onNavigateLanding: () => void;
  onOpenAdmin?: () => void;
}

const MainAppContent: React.FC<MainAppContentProps> = ({
  onNavigateLanding,
  onOpenAdmin,
}) => {
  const {
    auth,
    subscription,
    vouchers,
    logout,
    isCompanySetupWizardOpen,
    setIsCompanySetupWizardOpen,
  } = useErp();
  const [activeTab, setActiveTab] = useState<string>('gateway');

  const isAuthenticated = auth.isLoggedIn;
  const hasActiveSubscription = subscription.status === 'ACTIVE' || subscription.status === 'TRIAL';

  // Modals (when authenticated and subscription active)
  const [isGoToOpen, setIsGoToOpen] = useState(false);
  const [isCheatSheetOpen, setIsCheatSheetOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  const [isQuickMasterModalOpen, setIsQuickMasterModalOpen] = useState(false);
  const [isDataBackupOpen, setIsDataBackupOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  // Active Voucher Modal Type
  const [voucherModalType, setVoucherModalType] = useState<VoucherType | null>(null);

  // Active Printable Voucher ID
  const [printVoucherId, setPrintVoucherId] = useState<string | null>(null);

  // WhatsApp Modal State
  const [whatsappState, setWhatsappState] = useState<{
    isOpen: boolean;
    docType: WhatsAppDocType;
    voucher?: any;
    ledger?: any;
  }>({
    isOpen: false,
    docType: 'INVOICE',
  });

  const handleOpenWhatsApp = (docType: WhatsAppDocType, voucher?: any, ledger?: any) => {
    setWhatsappState({
      isOpen: true,
      docType,
      voucher,
      ledger,
    });
  };

  // Keyboard shortcut routing (ONLY enabled when authenticated AND active subscription)
  useKeyboardShortcuts(
    {
      onOpenGoTo: () => setIsGoToOpen(true),
      onOpenCheatSheet: () => setIsCheatSheetOpen(true),
      onOpenCompanyModal: () => setIsCompanyModalOpen(true),
      onOpenPeriodModal: () => setIsPeriodModalOpen(true),
      onOpenMasterCreateModal: () => setIsQuickMasterModalOpen(true),
      onOpenVoucherModal: (type: VoucherType) => setVoucherModalType(type),
      onOpenAuditTrail: () => setActiveTab('audit-trail'),
      onPrint: () => {
        if (vouchers.length > 0) {
          setPrintVoucherId(vouchers[0].id);
        }
      },
      onEscape: () => {
        // Close open modals in reverse order
        if (printVoucherId) setPrintVoucherId(null);
        else if (voucherModalType) setVoucherModalType(null);
        else if (whatsappState.isOpen) setWhatsappState(prev => ({ ...prev, isOpen: false }));
        else if (isGoToOpen) setIsGoToOpen(false);
        else if (isCheatSheetOpen) setIsCheatSheetOpen(false);
        else if (isCompanyModalOpen) setIsCompanyModalOpen(false);
        else if (isPeriodModalOpen) setIsPeriodModalOpen(false);
        else if (isQuickMasterModalOpen) setIsQuickMasterModalOpen(false);
        else if (isSubscriptionModalOpen) setIsSubscriptionModalOpen(false);
        else if (isDataBackupOpen) setIsDataBackupOpen(false);
        else if (isSupportModalOpen) setIsSupportModalOpen(false);
        else if (isAuthModalOpen) setIsAuthModalOpen(false);
      },
    },
    isAuthenticated && hasActiveSubscription
  );

  // GATE 1: User is not authenticated -> Lock the entire ERP suite behind Mobile OTP AuthModal
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-between relative overflow-hidden select-none transition-colors">
        {/* Minimal Gate Header with Back to Home and Admin access */}
        <header className="relative z-10 p-4 px-6 sm:px-12 flex items-center justify-between border-b border-border bg-sidebar/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <NexoraLogo size={36} />
            <div>
              <span className="font-serif text-lg font-bold tracking-tight text-foreground">Nexora Books</span>
              <span className="hidden sm:inline-block ml-2 text-[11px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-sm border border-primary/20">
                Indian GST ERP
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateLanding}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-sm bg-card hover:bg-muted text-foreground border border-border transition-colors cursor-pointer shadow-2xs"
              title="Return to Main Frontend Website"
            >
              <ArrowLeft size={14} />
              <span>Back to Main Website</span>
            </button>
          </div>
        </header>

        {/* Center Presentation & Mandatory Auth Modal */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 py-8 max-w-4xl mx-auto w-full">
          <div className="text-center mb-6 space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
              <Lock size={12} /> Authentication Required
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Enterprise Cloud Accounting &amp; GST Suite
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
              Please sign in with your verified Indian mobile number and OTP to unlock the full Gateway, vouchers, GST returns, and financial reports.
            </p>
          </div>

          {/* Mandatory Mobile OTP Auth Modal with full return-to-website capability */}
          <AuthModal
            isOpen={true}
            onClose={onNavigateLanding}
            isMandatory={true}
            onNavigateLanding={onNavigateLanding}
          />
        </div>

        {/* Feature Strip Footer */}
        <footer className="relative z-10 p-4 border-t border-border bg-sidebar/80 backdrop-blur-md">
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-around gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-amber-500" />
              <span>Tally Prime Keyboard Speed (F1 - F9, Alt+G)</span>
            </div>
            <div className="flex items-center gap-2">
              <FileCheck size={14} className="text-primary" />
              <span>GSTR-1, 3B, 2B Match &amp; Portal JSON</span>
            </div>
            <div className="flex items-center gap-2">
              <Send size={14} className="text-emerald-600 dark:text-emerald-400" />
              <span>WhatsApp Invoicing with UPI QR Matrix</span>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // GATE 2: User is authenticated, but subscription is expired/inactive -> Lock ERP behind Subscription Paywall
  if (!hasActiveSubscription) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-between relative overflow-hidden select-none transition-colors">
        {/* Gate Header with Session info and Sign Out option */}
        <header className="relative z-10 p-4 px-6 flex items-center justify-between border-b border-border bg-sidebar">
          <div className="flex items-center gap-3">
            <NexoraLogo size={32} />
            <span className="font-serif text-lg font-bold tracking-tight text-foreground">Nexora Books</span>
            <span className="text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-sm border border-rose-500/20 font-bold flex items-center gap-1">
              <Lock size={12} /> Subscription Inactive
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-muted-foreground hidden sm:inline">
              Signed in as: <strong className="text-foreground">{auth.name}</strong> (+91 {auth.mobile})
            </span>
            <button
              onClick={onNavigateLanding}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-sm bg-card hover:bg-muted text-foreground border border-border transition-colors cursor-pointer shadow-2xs"
            >
              <ArrowLeft size={13} />
              <span>Back to Website</span>
            </button>
            <button
              onClick={logout}
              className="px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 rounded-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut size={13} /> Sign Out
            </button>
          </div>
        </header>

        {/* Center Mandatory Subscription Gate with direct navigation & free trial */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 py-8">
          <SubscriptionModal
            isOpen={true}
            onClose={onNavigateLanding}
            isMandatory={true}
            onNavigateLanding={onNavigateLanding}
          />
        </div>

        {/* Footer */}
        <footer className="relative z-10 p-3 text-center text-xs text-muted-foreground border-t border-border bg-sidebar">
          Active subscription required to access ERP day book, vouchers, inventory, and statutory GST returns.
        </footer>
      </div>
    );
  }

  // GATE 3: Authenticated AND Active Subscription -> Full ERP suite unlocked
  return (
    <div className="min-h-screen bg-background text-foreground pb-12 md:pb-8 flex flex-col transition-colors">
      {/* Top Bar with 3-Zone Contract */}
      <TopBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenGoTo={() => setIsGoToOpen(true)}
        onOpenCompanyModal={() => setIsCompanyModalOpen(true)}
        onOpenCheatSheet={() => setIsCheatSheetOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenSubscriptionModal={() => setIsSubscriptionModalOpen(true)}
        onOpenPeriodModal={() => setIsPeriodModalOpen(true)}
        onNavigateLanding={onNavigateLanding}
        onOpenAdmin={onOpenAdmin}
        onOpenSupportModal={() => setIsSupportModalOpen(true)}
      />

      {/* Main Work Area with Desktop Right Vouchers Strip */}
      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 min-w-0 overflow-y-auto">
          {activeTab === 'gateway' && (
            <GatewayOfTally
              onNavigateTab={setActiveTab}
              onOpenVoucher={setVoucherModalType}
              onPrintVoucher={setPrintVoucherId}
              onOpenCompany={() => setIsCompanyModalOpen(true)}
              onOpenDataBackup={() => setIsDataBackupOpen(true)}
              onOpenSubscription={() => setIsSubscriptionModalOpen(true)}
              onOpenSupport={() => setIsSupportModalOpen(true)}
              onOpenWhatsApp={handleOpenWhatsApp}
              onNavigateLanding={onNavigateLanding}
            />
          )}

          {activeTab === 'vouchers' && (
            <DayBookView
              onOpenVoucher={setVoucherModalType}
              onPrintVoucher={setPrintVoucherId}
              onOpenWhatsApp={handleOpenWhatsApp}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersChallansView
              onOpenVoucher={setVoucherModalType}
              onPrintVoucher={setPrintVoucherId}
              onOpenWhatsApp={handleOpenWhatsApp}
            />
          )}

          {activeTab === 'masters' && <LedgerMasterView onOpenWhatsApp={handleOpenWhatsApp} />}

          {activeTab === 'gst' && <GstReturnsView />}

          {activeTab === 'statements' && <FinancialStatementsView onOpenWhatsApp={handleOpenWhatsApp} />}

          {activeTab === 'ca-portal' && <CaFirmPortalView />}
          {activeTab === 'audit-trail' && (
            <AuditTrailView
              onNavigateTab={setActiveTab}
              onOpenVoucher={setVoucherModalType}
            />
          )}
          {activeTab === 'gsp-settings' && (
            <GSPIntegrationSettings onNavigateTab={setActiveTab} />
          )}
          {activeTab === 'backup-restore' && (
            <DataBackupRestoreView onNavigateTab={setActiveTab} />
          )}
          {activeTab === 'my-subscription' && (
            <MySubscriptionView
              onOpenSubscriptionModal={() => setIsSubscriptionModalOpen(true)}
              onOpenSupportModal={() => setIsSupportModalOpen(true)}
              onNavigateTab={setActiveTab}
            />
          )}
        </main>

        {/* Right Vertical Vouchers Action Strip */}
        <RightVouchersStrip
          onOpenVoucher={setVoucherModalType}
          onNavigateTab={setActiveTab}
        />
      </div>

      {/* Sticky Bottom Shortcut Bar */}
      <ShortcutBar
        onOpenVoucher={setVoucherModalType}
        onOpenDate={() => setIsPeriodModalOpen(true)}
        onOpenPeriod={() => setIsPeriodModalOpen(true)}
        onOpenCompany={() => setIsCompanyModalOpen(true)}
        onOpenCheatSheet={() => setIsCheatSheetOpen(true)}
        onOpenGoTo={() => setIsGoToOpen(true)}
      />

      {/* Global Modals (Voluntary User Access) */}
      <GoToModal
        isOpen={isGoToOpen}
        onClose={() => setIsGoToOpen(false)}
        onNavigateTab={setActiveTab}
        onOpenVoucher={setVoucherModalType}
        onOpenCompany={() => setIsCompanyModalOpen(true)}
        onOpenSubscription={() => setIsSubscriptionModalOpen(true)}
        onOpenDataBackup={() => setIsDataBackupOpen(true)}
        onOpenSupport={() => setIsSupportModalOpen(true)}
      />

      <KeyboardCheatSheetModal
        isOpen={isCheatSheetOpen}
        onClose={() => setIsCheatSheetOpen(false)}
      />

      <PeriodModal
        isOpen={isPeriodModalOpen}
        onClose={() => setIsPeriodModalOpen(false)}
      />

      {/* User Session Profile Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        isMandatory={false}
      />

      {/* Subscription & Razorpay Modal */}
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        isMandatory={false}
        onNavigateLanding={onNavigateLanding}
      />

      {/* New Customer Fresh Business Setup Wizard Modal */}
      <CompanySetupWizardModal
        isOpen={isCompanySetupWizardOpen}
        onClose={() => setIsCompanySetupWizardOpen(false)}
      />

      {/* Company Selection / Alter Modal */}
      <CompanyModal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
      />

      {/* Quick Master Creation Modal (Alt+C) */}
      <QuickMasterModal
        isOpen={isQuickMasterModalOpen}
        onClose={() => setIsQuickMasterModalOpen(false)}
      />

      {/* Quick Data Backup Modal */}
      <DataManagementModal
        isOpen={isDataBackupOpen}
        onClose={() => setIsDataBackupOpen(false)}
      />

      {/* Voucher Modal */}
      {voucherModalType && (
        <VoucherModal
          isOpen={true}
          onClose={() => setVoucherModalType(null)}
          voucherType={voucherModalType}
          onPrintVoucher={(id: string) => setPrintVoucherId(id)}
        />
      )}

      {/* Voucher Print Modal */}
      {printVoucherId && (
        <VoucherPrintModal
          voucherId={printVoucherId}
          onClose={() => setPrintVoucherId(null)}
        />
      )}

      {whatsappState.isOpen && (
        <WhatsAppModal
          isOpen={true}
          onClose={() => setWhatsappState(prev => ({ ...prev, isOpen: false }))}
          initialDocType={whatsappState.docType}
          voucher={whatsappState.voucher}
          ledger={whatsappState.ledger}
        />
      )}

      {/* Support Ticket & Helpdesk Modal */}
      <SupportTicketModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />
    </div>
  );
};

type AppView = 'website' | 'erp' | 'admin-login' | 'admin-dashboard';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(() => {
    if (typeof window !== 'undefined') {
      if (window.location.hash === '#admin') return 'admin-login';
      if (window.location.hash === '#erp') return 'erp';
    }
    return 'website';
  });

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const { loginWithMobile } = useErp();

  // Listen for hash changes in URL
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#admin') {
        if (isAdminLoggedIn) setCurrentView('admin-dashboard');
        else setCurrentView('admin-login');
      } else if (hash === '#erp') {
        setCurrentView('erp');
      } else if (hash === '' || hash === '#home') {
        setCurrentView('website');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isAdminLoggedIn]);

  const handleOpenAdminLogin = () => {
    if (isAdminLoggedIn) {
      setCurrentView('admin-dashboard');
      window.location.hash = 'admin';
    } else {
      setCurrentView('admin-login');
      window.location.hash = 'admin';
    }
  };

  const handleAdminAuthSuccess = () => {
    setIsAdminLoggedIn(true);
    setCurrentView('admin-dashboard');
    window.location.hash = 'admin';
  };

  const handleImpersonateClient = (client: TenantClient) => {
    loginWithMobile(client.mobile, client.name, client.businessName, client.role);
    setCurrentView('erp');
    window.location.hash = 'erp';
  };

  const handleNavigateToWebsite = () => {
    setCurrentView('website');
    if (window.location.hash === '#erp' || window.location.hash === '#admin') {
      try {
        window.history.pushState(null, '', window.location.pathname);
      } catch {
        window.location.hash = '';
      }
    }
  };

  const handleLaunchClientErp = () => {
    setCurrentView('erp');
    window.location.hash = 'erp';
  };

  return (
    <>
      {currentView === 'website' && (
        <FrontendLandingPage
          onLaunchClientErp={handleLaunchClientErp}
          onOpenAdminLogin={handleOpenAdminLogin}
        />
      )}

      {currentView === 'erp' && (
        <MainAppContent
          onNavigateLanding={handleNavigateToWebsite}
          onOpenAdmin={handleOpenAdminLogin}
        />
      )}

      {currentView === 'admin-login' && (
        <SuperAdminLoginPage
          onSuccess={handleAdminAuthSuccess}
          onBackToWebsite={handleNavigateToWebsite}
        />
      )}

      {currentView === 'admin-dashboard' && (
        <SuperAdminDashboard
          onBackToLanding={handleNavigateToWebsite}
          onOpenClientErp={handleLaunchClientErp}
          onImpersonateClient={handleImpersonateClient}
          onLogoutAdmin={() => {
            setIsAdminLoggedIn(false);
            handleNavigateToWebsite();
          }}
        />
      )}
    </>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <ErpProvider>
        <AppContent />
      </ErpProvider>
    </ThemeProvider>
  );
}
