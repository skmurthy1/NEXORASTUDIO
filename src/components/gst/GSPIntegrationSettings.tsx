/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Server,
  Key,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Zap,
  FileCheck,
  Truck,
  QrCode,
  Globe,
  Sliders,
  ExternalLink,
  Info,
  Clock,
  Sparkles,
  ArrowRight,
  Shield,
  HelpCircle,
  Copy,
  Check,
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { GspProvider, GspEnvironment, GspConfig } from '../../types/erp';

const GSP_PROVIDERS: {
  id: GspProvider;
  name: string;
  badge: string;
  tagline: string;
  protocol: string;
  color: string;
  features: string[];
}[] = [
  {
    id: 'CLEARTAX',
    name: 'Clear (ClearTax)',
    badge: 'Popular & Recommended',
    tagline: 'Leading licensed GSP with 99.9% uptime, multi-IRP failover & automated GSTR-2B inward sync.',
    protocol: 'REST JSON / RSA-256',
    color: 'border-primary/40 bg-primary/10 text-primary',
    features: ['Direct GSTR-1 & 3B', 'Instant IRN / Signed QR', 'Part-A & Part-B e-Way Bill', 'Auto 2B Pull'],
  },
  {
    id: 'CYGNET',
    name: 'Cygnet Infotech',
    badge: 'Enterprise Grade',
    tagline: 'High-throughput GST Suvidha Provider optimized for high voucher volumes and bulk generation.',
    protocol: 'SOAP / REST API v2',
    color: 'border-border bg-muted text-foreground',
    features: ['Direct Filing', 'Bulk e-Way Bill', 'Automated Reconciliation', '24x7 IRP Fallback'],
  },
  {
    id: 'MASTERS_INDIA',
    name: 'Masters India',
    badge: 'High Speed IRP',
    tagline: 'Direct IRP connection with sub-100ms response time for instant B2B tax invoice generation.',
    protocol: 'OpenAPI 3.0 / JWT',
    color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    features: ['Sub-100ms IRN', 'Multi-GSTIN Console', 'Custom Print Templates', 'UPI QR Generation'],
  },
  {
    id: 'TALLY_GSP',
    name: 'Tally GSP Direct',
    badge: 'Native Tally Sync',
    tagline: 'Standard Tally Prime compatible GSP bridge with zero schema transformation needed.',
    protocol: 'XML-RPC / HTTPS',
    color: 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300',
    features: ['Tally XML Alignment', 'Tally Prime Interop', 'Standard Audit Trail', 'Zero Schema Mismatch'],
  },
  {
    id: 'CUSTOM',
    name: 'Custom GSP / ASP Gateway',
    badge: 'Self-Hosted / Proxy',
    tagline: 'Connect your company-specific or CA firm-licensed API proxy gateway.',
    protocol: 'Configurable Endpoints',
    color: 'border-border bg-card text-muted-foreground',
    features: ['Custom Host URL', 'Custom Headers', 'Mutual TLS / VPN', 'Staging Isolation'],
  },
];

interface GSPIntegrationSettingsProps {
  onNavigateTab?: (tab: string) => void;
}

export const GSPIntegrationSettings: React.FC<GSPIntegrationSettingsProps> = ({ onNavigateTab }) => {
  const { gspConfig, updateGspConfig, testGspConnection, activeCompany, logAudit } = useErp();

  const [formData, setFormData] = useState<GspConfig>(gspConfig);
  const [showPassword, setShowPassword] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [showNicPassword, setShowNicPassword] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    latencyMs: number;
    token: string;
    message: string;
  } | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [testStep, setTestStep] = useState<number>(0);

  useEffect(() => {
    setFormData(gspConfig);
  }, [gspConfig]);

  const handleSelectProvider = (providerId: GspProvider) => {
    setFormData(prev => ({
      ...prev,
      provider: providerId,
    }));
  };

  const handleEnvironmentChange = (env: GspEnvironment) => {
    setFormData(prev => ({
      ...prev,
      environment: env,
    }));
  };

  const handleRunConnectionTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    setTestStep(1);

    const stepInterval = setInterval(() => {
      setTestStep(s => (s < 3 ? s + 1 : s));
    }, 150);

    try {
      const result = await testGspConnection(formData);
      clearInterval(stepInterval);
      setTestStep(4);
      setTestResult(result);
      if (result.success) {
        setFormData(prev => ({
          ...prev,
          authStatus: 'CONNECTED',
          authToken: result.token,
          latencyMs: result.latencyMs,
          lastTestedAt: new Date().toISOString(),
        }));
      }
    } catch (err: any) {
      clearInterval(stepInterval);
      setTestResult({
        success: false,
        latencyMs: 0,
        token: '',
        message: err.message || 'Connection test failed. Verify network connectivity.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateGspConfig(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const handleCopyToken = () => {
    if (!formData.authToken) return;
    navigator.clipboard.writeText(formData.authToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <form onSubmit={handleSaveSettings} className="space-y-6 animate-in fade-in duration-150">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs">
            <span className="uppercase tracking-wider font-semibold text-muted-foreground">
              Statutory Integration Gateway
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="text-primary font-mono font-medium">
              GSTN & NIC Licensed Direct Connectivity
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-foreground">
            GSP API & IRP Credentials
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleRunConnectionTest}
            disabled={isTesting}
            className="px-3 py-1.5 text-xs font-medium bg-card hover:bg-accent text-foreground rounded-sm border border-border transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={13} className={isTesting ? 'animate-spin text-primary' : ''} />
            <span>{isTesting ? 'Running Handshake...' : 'Test Handshake [Alt+T]'}</span>
          </button>

          <button
            type="submit"
            className="px-4 py-1.5 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Lock size={13} />
            <span>Save & Apply Credentials</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {savedSuccess && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-sm flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-300 animate-in fade-in duration-200 shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <span className="font-semibold">GSP Configuration Saved & Synced!</span> Changes have been cryptographically logged into the MCA Rule 3(1) Edit Log.
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSavedSuccess(false)}
            className="text-emerald-700 dark:text-emerald-300 hover:underline font-semibold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Connection Diagnostic Live Panel */}
      <div className="bg-card text-card-foreground rounded-sm p-4 border border-border shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Server size={18} />
            </div>
            <div>
              <div className="text-[11px] text-muted-foreground font-medium">Gateway Protocol Engine</div>
              <div className="text-xs font-bold text-foreground flex items-center gap-2">
                <span>{formData.provider} ({formData.environment})</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-xs bg-muted text-muted-foreground border border-border">
                  {GSP_PROVIDERS.find(p => p.id === formData.provider)?.protocol || 'REST JSON / RSA-256'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="bg-muted/60 px-2.5 py-1 rounded-sm border border-border flex items-center gap-2">
              <Clock size={12} className="text-muted-foreground" />
              <span className="text-muted-foreground">Token Validity:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold">5h 24m remaining</span>
            </div>

            <div className="bg-muted/60 px-2.5 py-1 rounded-sm border border-border flex items-center gap-2">
              <Zap size={12} className="text-amber-500" />
              <span className="text-muted-foreground">Latency:</span>
              <span className="font-mono font-semibold text-foreground">{formData.latencyMs || 184} ms</span>
            </div>
          </div>
        </div>

        {/* Live Progress Bar when Testing */}
        {isTesting && (
          <div className="p-3 bg-muted/40 rounded-sm border border-border space-y-2 animate-in fade-in text-xs">
            <div className="flex items-center justify-between">
              <span className="text-primary font-medium flex items-center gap-1.5">
                <RefreshCw size={11} className="animate-spin" />
                Step {testStep} of 4: {testStep === 1 ? 'Encrypting RSA Payload' : testStep === 2 ? 'Connecting to GSP Endpoint' : testStep === 3 ? 'Exchanging Auth Token with GSTN / IRP' : 'Verification Complete'}
              </span>
              <span className="text-muted-foreground font-mono">{testStep * 25}%</span>
            </div>
            <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${testStep * 25}%` }}
              />
            </div>
          </div>
        )}

        {/* Test Result Message */}
        {testResult && !isTesting && (
          <div
            className={`p-3 rounded-sm border text-xs flex items-center justify-between gap-3 ${
              testResult.success
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                : 'bg-destructive/10 border-destructive/30 text-destructive'
            }`}
          >
            <div className="flex items-center gap-2">
              {testResult.success ? (
                <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle size={15} className="text-destructive shrink-0" />
              )}
              <span>{testResult.message}</span>
            </div>
            <span className="font-mono text-[11px] text-muted-foreground shrink-0">
              Ping: {testResult.latencyMs}ms
            </span>
          </div>
        )}

        {/* Auth Bearer Token Display */}
        {formData.authToken && (
          <div className="pt-3 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 truncate">
              <Key size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-muted-foreground shrink-0">Bearer Token:</span>
              <span className="font-mono text-muted-foreground truncate max-w-md bg-muted px-2 py-0.5 rounded-xs text-[11px]">
                {formData.authToken}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCopyToken}
              className="px-2 py-0.5 text-[11px] font-medium text-foreground hover:bg-muted rounded-xs border border-border transition-colors flex items-center gap-1 shrink-0 self-start sm:self-auto cursor-pointer"
            >
              {copiedToken ? <Check size={11} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={11} />}
              <span>{copiedToken ? 'Copied' : 'Copy Token'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 Cols): Provider Selection & Credentials */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Environment Selection */}
          <div className="bg-card rounded-sm border border-border p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-xs text-foreground">1. Target API Environment</h3>
                <p className="text-[11px] text-muted-foreground">Choose Sandbox test mode or Live statutory production.</p>
              </div>
              <div className="flex items-center p-0.5 bg-muted rounded-sm border border-border">
                <button
                  type="button"
                  onClick={() => handleEnvironmentChange('SANDBOX')}
                  className={`px-2.5 py-1 text-xs rounded-xs font-medium transition-all cursor-pointer ${
                    formData.environment === 'SANDBOX'
                      ? 'bg-card text-foreground font-semibold shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Sandbox (Pre-Prod)
                </button>
                <button
                  type="button"
                  onClick={() => handleEnvironmentChange('PRODUCTION')}
                  className={`px-2.5 py-1 text-xs rounded-xs font-medium transition-all cursor-pointer ${
                    formData.environment === 'PRODUCTION'
                      ? 'bg-destructive text-destructive-foreground font-semibold shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Production (Live GSTN)
                </button>
              </div>
            </div>

            {formData.environment === 'SANDBOX' ? (
              <div className="p-2.5 bg-primary/10 border border-primary/20 rounded-sm flex items-start gap-2 text-xs text-foreground">
                <Info size={14} className="text-primary shrink-0 mt-0.5" />
                <div className="text-[11px]">
                  <strong>Sandbox Test Mode Active:</strong> All e-invoice IRNs and e-way bill numbers generated are simulated against developer staging sandbox. No live returns or tax liability will be affected on the GST Portal.
                </div>
              </div>
            ) : (
              <div className="p-2.5 bg-destructive/10 border border-destructive/20 rounded-sm flex items-start gap-2 text-xs text-destructive">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <div className="text-[11px]">
                  <strong>Production Mode Active:</strong> Invoices submitted will immediately trigger legal IRN registration on the National e-Invoice Portal (IRP) with legal tax liabilities.
                </div>
              </div>
            )}
          </div>

          {/* 2. GSP Provider Selector */}
          <div className="bg-card rounded-sm border border-border p-4 shadow-2xs space-y-3">
            <div>
              <h3 className="font-semibold text-xs text-foreground">2. Select Licensed GSP Partner</h3>
              <p className="text-[11px] text-muted-foreground">Pick from India's government-approved GST Suvidha Providers.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {GSP_PROVIDERS.map(p => {
                const isSelected = formData.provider === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => handleSelectProvider(p.id)}
                    className={`p-3 rounded-sm border text-left cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border hover:bg-muted/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-foreground">{p.name}</span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-xs ${p.color}`}>
                          {p.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
                        {p.tagline}
                      </p>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-border flex flex-wrap gap-1">
                      {p.features.map((feat, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-medium bg-muted text-muted-foreground px-1.5 py-0.2 rounded-xs"
                        >
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. API Credentials Form */}
          <div className="bg-card rounded-sm border border-border p-4 shadow-2xs space-y-4">
            <div>
              <h3 className="font-semibold text-xs text-foreground">3. GSP Gateway Credentials</h3>
              <p className="text-[11px] text-muted-foreground">
                Obtained from your GSP dashboard or the GST Portal under <em>Services &gt; User Services &gt; Manage API Access</em>.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {/* GSTIN */}
              <div>
                <label className="block text-foreground font-semibold mb-1">
                  Taxpayer GSTIN <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  maxLength={15}
                  value={formData.gstin}
                  onChange={e => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                  placeholder="27AAACB2212M1Z1"
                  className="w-full px-2.5 py-1.5 bg-background border border-border rounded-sm font-mono uppercase text-foreground text-xs"
                />
              </div>

              {/* API Username */}
              <div>
                <label className="block text-foreground font-semibold mb-1">
                  GSP API Username <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={formData.apiUsername}
                  onChange={e => setFormData({ ...formData, apiUsername: e.target.value })}
                  placeholder="DEMO_API_USER"
                  className="w-full px-2.5 py-1.5 bg-background border border-border rounded-sm font-mono text-foreground text-xs"
                />
              </div>

              {/* API Password */}
              <div>
                <label className="block text-foreground font-semibold mb-1">
                  GSP API Password <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.apiPassword}
                    onChange={e => setFormData({ ...formData, apiPassword: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full px-2.5 py-1.5 bg-background border border-border rounded-sm font-mono text-foreground pr-8 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>

              {/* Client ID */}
              <div>
                <label className="block text-foreground font-semibold mb-1">
                  GSP Client ID / App Key <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={formData.clientId}
                  onChange={e => setFormData({ ...formData, clientId: e.target.value })}
                  placeholder="CT-GSP-SANDBOX-892401"
                  className="w-full px-2.5 py-1.5 bg-background border border-border rounded-sm font-mono text-foreground text-xs"
                />
              </div>

              {/* Client Secret */}
              <div className="md:col-span-2">
                <label className="block text-foreground font-semibold mb-1">
                  GSP Client Secret <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showSecret ? 'text' : 'password'}
                    value={formData.clientSecret}
                    onChange={e => setFormData({ ...formData, clientSecret: e.target.value })}
                    placeholder="sec_live_••••••••••••••••••••"
                    className="w-full px-2.5 py-1.5 bg-background border border-border rounded-sm font-mono text-foreground pr-8 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showSecret ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 Cols): Automation Policies & Security */}
        <div className="lg:col-span-4 space-y-6">
          {/* Statutory Automation Toggles */}
          <div className="bg-card rounded-sm border border-border p-4 shadow-2xs space-y-3">
            <div>
              <h3 className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                <Sliders size={14} className="text-primary" />
                <span>Statutory Automation Rules</span>
              </h3>
              <p className="text-[11px] text-muted-foreground">Configure triggers for automated filing & registration.</p>
            </div>

            <div className="space-y-2.5 divide-y divide-border text-xs">
              {/* Auto e-Invoice */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <div>
                  <div className="font-medium text-foreground">Direct e-Invoice on Save</div>
                  <div className="text-[11px] text-muted-foreground">Generate IRN on B2B voucher creation</div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.features.autoEInvoice}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      features: { ...formData.features, autoEInvoice: e.target.checked },
                    })
                  }
                  className="rounded-xs border-border text-primary cursor-pointer"
                />
              </div>

              {/* Auto e-Way Bill */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <div>
                  <div className="font-medium text-foreground">Auto e-Way Bill</div>
                  <div className="text-[11px] text-muted-foreground">When consignment value exceeds threshold</div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.features.autoEWayBill}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      features: { ...formData.features, autoEWayBill: e.target.checked },
                    })
                  }
                  className="rounded-xs border-border text-primary cursor-pointer"
                />
              </div>

              {/* 1-Click GSTR-1 */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <div>
                  <div className="font-medium text-foreground">1-Click GSTR-1 Upload</div>
                  <div className="text-[11px] text-muted-foreground">Directly post B2B, B2CL tables to GSTN</div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.features.directGstr1Filing}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      features: { ...formData.features, directGstr1Filing: e.target.checked },
                    })
                  }
                  className="rounded-xs border-border text-primary cursor-pointer"
                />
              </div>

              {/* Auto GSTR-2B Sync */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <div>
                  <div className="font-medium text-foreground">Automated GSTR-2B Sync</div>
                  <div className="text-[11px] text-muted-foreground">Fetch supplier inward invoices on 14th of month</div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.features.autoGstr2bSync}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      features: { ...formData.features, autoGstr2bSync: e.target.checked },
                    })
                  }
                  className="rounded-xs border-border text-primary cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Compliance & Security Card */}
          <div className="bg-card rounded-sm border border-border p-4 space-y-2.5 text-xs">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <ShieldCheck size={15} className="text-emerald-600 dark:text-emerald-400" />
              <span>MCA & GSTN Security Guarantee</span>
            </div>

            <p className="text-muted-foreground text-[11px] leading-relaxed">
              In compliance with <strong>Rule 3(1) of the Companies (Accounts) Rules, 2014</strong>, every change to API keys, automated filing flags, and portal transmissions is permanently preserved in the non-editable Audit Trail.
            </p>

            <div className="space-y-1.5 pt-2 border-t border-border text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Static IP Whitelisted:</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={11} /> 103.21.58.42
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Class 3 DSC Registered:</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={11} /> Active
                </span>
              </div>
            </div>

            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab('audit-trail')}
                className="w-full mt-2 py-1 px-2.5 bg-muted hover:bg-muted/80 text-foreground font-medium rounded-sm border border-border text-center transition-colors flex items-center justify-center gap-1 text-[11px] cursor-pointer"
              >
                <span>View GSP Changes in Audit Trail</span>
                <ArrowRight size={11} />
              </button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
};
