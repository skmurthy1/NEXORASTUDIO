/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  Database,
  Upload,
  Download,
  FileCode,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  ArrowRight,
  RefreshCw,
  Lock,
  ChevronRight,
  Copy,
  Info,
  Server,
  Zap,
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import {
  generateTallyXmlBackup,
  parseTallyXmlBackup,
  generateBusyXmlBackup,
  parseBusyBackup,
  exportFullJsonBackup,
  SAMPLE_TALLY_XML,
  SAMPLE_BUSY_XML,
  SAMPLE_BUSY_DAT,
} from '../../services/storage';

interface DataBackupRestoreViewProps {
  onNavigateTab?: (tab: string) => void;
}

export const DataBackupRestoreView: React.FC<DataBackupRestoreViewProps> = ({ onNavigateTab }) => {
  const {
    activeCompany,
    ledgers,
    stockItems,
    godowns,
    vouchers,
    auditLogs,
    subscription,
    gspConfig,
    restoreData,
    restoreTallyData,
    restoreBusyData,
    updateCompany,
  } = useErp();

  const [activeSubTab, setActiveSubTab] = useState<'TALLY' | 'BUSY' | 'NEXORA_JSON' | 'LOCK_FREEZE'>('TALLY');
  const [restoreMode, setRestoreMode] = useState<'MERGE' | 'REPLACE'>('MERGE');

  // Preview & Status state for Tally
  const [tallyFileContent, setTallyFileContent] = useState<string>('');
  const [tallyParsedPreview, setTallyParsedPreview] = useState<{
    companyName?: string;
    ledgers: any[];
    vouchers: any[];
    message: string;
    success: boolean;
  } | null>(null);

  // Preview & Status state for Busy
  const [busyFileContent, setBusyFileContent] = useState<string>('');
  const [busyParsedPreview, setBusyParsedPreview] = useState<{
    companyName?: string;
    ledgers: any[];
    stockItems: any[];
    vouchers: any[];
    message: string;
    success: boolean;
  } | null>(null);

  // General Notification / Feedback
  const [alertBanner, setAlertBanner] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Lock Date
  const [lockDate, setLockDate] = useState<string>(activeCompany.lockDate || '');
  const [isLockSaved, setIsLockSaved] = useState<boolean>(false);

  const tallyFileInputRef = useRef<HTMLInputElement>(null);
  const busyFileInputRef = useRef<HTMLInputElement>(null);
  const jsonFileInputRef = useRef<HTMLInputElement>(null);

  // --- Tally Actions ---
  const handleTallyFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      const text = evt.target?.result as string;
      setTallyFileContent(text);
      const parsed = parseTallyXmlBackup(text);
      setTallyParsedPreview(parsed);
      if (parsed.success) {
        setAlertBanner({
          type: 'info',
          message: `Parsed Tally backup: Found ${parsed.ledgers.length} ledgers and ${parsed.vouchers.length} vouchers ready to restore.`,
        });
      } else {
        setAlertBanner({ type: 'error', message: parsed.message });
      }
    };
    reader.readAsText(file);
  };

  const handleLoadSampleTallyXml = () => {
    setTallyFileContent(SAMPLE_TALLY_XML);
    const parsed = parseTallyXmlBackup(SAMPLE_TALLY_XML);
    setTallyParsedPreview(parsed);
    setAlertBanner({
      type: 'info',
      message: 'Loaded official Tally Prime XML test backup. Review masters below and click Restore.',
    });
  };

  const handleExecuteTallyRestore = () => {
    if (!tallyParsedPreview || !tallyParsedPreview.success) {
      setAlertBanner({ type: 'error', message: 'No valid Tally backup data loaded.' });
      return;
    }

    const res = restoreTallyData(
      {
        companyName: tallyParsedPreview.companyName,
        ledgers: tallyParsedPreview.ledgers,
        vouchers: tallyParsedPreview.vouchers,
      },
      restoreMode
    );

    if (res.success) {
      setAlertBanner({
        type: 'success',
        message: `Success! Restored ${res.ledgersCount} ledgers and ${res.vouchersCount} vouchers from Tally Prime backup. Logged under MCA Rule 3(1).`,
      });
      setTallyParsedPreview(null);
      setTallyFileContent('');
    } else {
      setAlertBanner({ type: 'error', message: res.message });
    }
  };

  const handleDownloadTallyXml = () => {
    const xml = generateTallyXmlBackup(activeCompany, ledgers, vouchers);
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TallyPrime_Backup_${activeCompany.name.replace(/[^A-Za-z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.xml`;
    a.click();
    URL.revokeObjectURL(url);
    setAlertBanner({
      type: 'success',
      message: 'Downloaded complete Tally Prime standard XML backup (<ENVELOPE> format).',
    });
  };

  // --- Busy Actions ---
  const handleBusyFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      const text = evt.target?.result as string;
      setBusyFileContent(text);
      const parsed = parseBusyBackup(text);
      setBusyParsedPreview(parsed);
      if (parsed.success) {
        setAlertBanner({
          type: 'info',
          message: `Parsed Busy backup: Found ${parsed.ledgers.length} accounts, ${parsed.stockItems.length} items, and ${parsed.vouchers.length} vouchers.`,
        });
      } else {
        setAlertBanner({ type: 'error', message: parsed.message });
      }
    };
    reader.readAsText(file);
  };

  const handleLoadSampleBusyXml = () => {
    setBusyFileContent(SAMPLE_BUSY_XML);
    const parsed = parseBusyBackup(SAMPLE_BUSY_XML);
    setBusyParsedPreview(parsed);
    setAlertBanner({
      type: 'info',
      message: 'Loaded official Busy Accounting Software test backup. Review items & accounts below and click Restore.',
    });
  };

  const handleLoadSampleBusyDat = () => {
    setBusyFileContent(SAMPLE_BUSY_DAT);
    const parsed = parseBusyBackup(SAMPLE_BUSY_DAT);
    setBusyParsedPreview(parsed);
    setAlertBanner({
      type: 'info',
      message: 'Loaded FIXNOW_20261030_MSAll.DAT Busy backup. Review accounts, items & transactions and click Execute Restore.',
    });
  };

  const handleDownloadSampleDatFile = () => {
    const blob = new Blob([SAMPLE_BUSY_DAT], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'FIXNOW_20261030_MSAll.DAT';
    a.click();
    URL.revokeObjectURL(url);
    setAlertBanner({
      type: 'success',
      message: 'Downloaded test file FIXNOW_20261030_MSAll.DAT to your downloads folder.',
    });
  };

  const handleExecuteBusyRestore = () => {
    if (!busyParsedPreview || !busyParsedPreview.success) {
      setAlertBanner({ type: 'error', message: 'No valid Busy Accounting backup data loaded.' });
      return;
    }

    const res = restoreBusyData(
      {
        companyName: busyParsedPreview.companyName,
        ledgers: busyParsedPreview.ledgers,
        stockItems: busyParsedPreview.stockItems,
        vouchers: busyParsedPreview.vouchers,
      },
      restoreMode
    );

    if (res.success) {
      setAlertBanner({
        type: 'success',
        message: `Success! Restored ${res.ledgersCount} accounts, ${res.itemsCount} items, and ${res.vouchersCount} vouchers from Busy Accounting. MCA Audit Trail updated.`,
      });
      setBusyParsedPreview(null);
      setBusyFileContent('');
    } else {
      setAlertBanner({ type: 'error', message: res.message });
    }
  };

  const handleDownloadBusyXml = () => {
    const xml = generateBusyXmlBackup(activeCompany, ledgers, stockItems, vouchers);
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BusyAccounting_Backup_${activeCompany.name.replace(/[^A-Za-z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.xml`;
    a.click();
    URL.revokeObjectURL(url);
    setAlertBanner({
      type: 'success',
      message: 'Downloaded complete Busy Accounting XML backup (<BUSYDATA> format).',
    });
  };

  // --- Nexora JSON Snapshot Actions ---
  const handleDownloadJsonBackup = () => {
    exportFullJsonBackup({
      companies: [activeCompany],
      ledgers,
      stockItems,
      godowns,
      vouchers,
      auditLogs,
      subscription,
    });
    setAlertBanner({
      type: 'success',
      message: 'Encrypted Nexora Books JSON snapshot exported to download folder.',
    });
  };

  const handleJsonFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        const success = restoreData(parsed);
        if (success) {
          setAlertBanner({
            type: 'success',
            message: 'All companies, ledgers, stock items, and vouchers restored successfully from JSON snapshot!',
          });
        } else {
          setAlertBanner({
            type: 'error',
            message: 'Invalid backup structure. File must contain companies, vouchers, and ledgers.',
          });
        }
      } catch (err: any) {
        setAlertBanner({
          type: 'error',
          message: 'Failed to read JSON file: ' + (err?.message || 'Invalid format'),
        });
      }
    };
    reader.readAsText(file);
  };

  // --- Lock Freeze Actions ---
  const handleSaveLockDate = () => {
    updateCompany({
      ...activeCompany,
      lockDate: lockDate || undefined,
    });
    setIsLockSaved(true);
    setAlertBanner({
      type: 'success',
      message: `Books lock date set to ${lockDate || 'Unlocked'}. Backdated alterations prior to this date are restricted.`,
    });
    setTimeout(() => setIsLockSaved(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-sm bg-primary/10 text-primary">
              <Database className="size-4.5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-foreground">
              Backup, Restore & Software Migration
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Two-way data interoperability with <strong>Tally Prime / ERP 9</strong>, <strong>Busy Accounting Software</strong>, and secure cloud snapshots.
          </p>
        </div>

        {/* Live MCA Compliance Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-muted/60 border border-border text-xs">
          <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
          <div>
            <span className="font-semibold text-foreground">MCA Rule 3(1) Edit Log</span>
            <span className="text-[10px] text-muted-foreground block font-mono">
              {auditLogs.length} verified immutable records
            </span>
          </div>
        </div>
      </div>

      {/* Global Alert Banner */}
      {alertBanner && (
        <div
          className={`flex items-start justify-between p-3.5 rounded-sm border text-xs transition-all ${
            alertBanner.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
              : alertBanner.type === 'error'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
              : 'bg-primary/10 border-primary/30 text-primary'
          }`}
        >
          <div className="flex items-center gap-2">
            {alertBanner.type === 'success' && <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />}
            {alertBanner.type === 'error' && <AlertCircle className="size-4 shrink-0 text-rose-600 dark:text-rose-400" />}
            {alertBanner.type === 'info' && <Info className="size-4 shrink-0 text-primary" />}
            <span className="font-medium">{alertBanner.message}</span>
          </div>
          <button
            onClick={() => setAlertBanner(null)}
            className="text-[11px] font-semibold underline hover:opacity-80 ml-4 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Primary Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-1 border-b border-border pb-1">
        <button
          onClick={() => setActiveSubTab('TALLY')}
          className={`px-3 py-2 text-xs font-medium rounded-sm transition-colors cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'TALLY'
              ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <FileCode className="size-3.5" />
          <span>Tally Prime / ERP 9 Migration</span>
        </button>

        <button
          onClick={() => setActiveSubTab('BUSY')}
          className={`px-3 py-2 text-xs font-medium rounded-sm transition-colors cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'BUSY'
              ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <Server className="size-3.5" />
          <span>Busy Accounting Software</span>
        </button>

        <button
          onClick={() => setActiveSubTab('NEXORA_JSON')}
          className={`px-3 py-2 text-xs font-medium rounded-sm transition-colors cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'NEXORA_JSON'
              ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <Database className="size-3.5" />
          <span>Nexora Cloud Snapshot (JSON)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('LOCK_FREEZE')}
          className={`px-3 py-2 text-xs font-medium rounded-sm transition-colors cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'LOCK_FREEZE'
              ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <Lock className="size-3.5" />
          <span>Books Freeze & Lock Date</span>
        </button>
      </div>

      {/* TAB 1: TALLY PRIME / ERP 9 MIGRATION */}
      {activeSubTab === 'TALLY' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Restore / Import from Tally */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-sm border border-border bg-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Upload className="size-4 text-primary" />
                    Restore from Old Tally Backup (.xml / .txt)
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Import ledgers, opening balances, GSTINs, and vouchers directly from standard Tally XML export files.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleLoadSampleTallyXml}
                  className="px-2.5 py-1 text-xs font-medium bg-muted hover:bg-muted/80 text-foreground border border-border rounded-sm transition-colors cursor-pointer flex items-center gap-1.5"
                  title="Test migration instantly with pre-packaged Tally Prime XML"
                >
                  <Zap className="size-3 text-amber-500" />
                  <span>Load Sample Tally XML</span>
                </button>
              </div>

              {/* Drag & Drop Area */}
              <div
                onClick={() => tallyFileInputRef.current?.click()}
                className="border-2 border-dashed border-border hover:border-primary/60 rounded-sm p-6 text-center cursor-pointer transition-colors bg-muted/20 hover:bg-muted/40"
              >
                <input
                  type="file"
                  ref={tallyFileInputRef}
                  onChange={handleTallyFileChange}
                  accept=".xml,.txt"
                  className="hidden"
                />
                <FileCode className="size-8 mx-auto text-primary mb-2" />
                <p className="text-xs font-semibold text-foreground">
                  Click to select or drag & drop Tally Prime backup XML
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Supported formats: Standard Tally Prime / ERP 9 XML (<code className="font-mono text-primary">&lt;ENVELOPE&gt;</code>)
                </p>
              </div>

              {/* Restore Mode Toggle */}
              <div className="flex items-center justify-between p-3 rounded-sm bg-muted/40 border border-border text-xs">
                <div>
                  <span className="font-medium text-foreground block">Merge or Replace Policy</span>
                  <span className="text-[11px] text-muted-foreground">
                    Choose whether to combine with current company or overwrite existing records.
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-card p-0.5 rounded-sm border border-border">
                  <button
                    type="button"
                    onClick={() => setRestoreMode('MERGE')}
                    className={`px-2.5 py-1 text-xs rounded-xs font-medium transition-colors cursor-pointer ${
                      restoreMode === 'MERGE'
                        ? 'bg-primary text-primary-foreground font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Merge (Safe)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRestoreMode('REPLACE')}
                    className={`px-2.5 py-1 text-xs rounded-xs font-medium transition-colors cursor-pointer ${
                      restoreMode === 'REPLACE'
                        ? 'bg-destructive text-destructive-foreground font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Replace All
                  </button>
                </div>
              </div>

              {/* Parsed Preview Section */}
              {tallyParsedPreview && (
                <div className="border border-border rounded-sm p-4 bg-muted/20 space-y-3">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                      Backup Validation Passed
                    </span>
                    {tallyParsedPreview.companyName && (
                      <span className="text-[11px] font-mono font-medium text-primary">
                        Company: {tallyParsedPreview.companyName}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-2.5 bg-card rounded-sm border border-border">
                      <span className="text-[10px] text-muted-foreground uppercase block font-medium">Ledgers</span>
                      <span className="text-sm font-bold font-mono text-foreground">
                        {tallyParsedPreview.ledgers.length}
                      </span>
                    </div>
                    <div className="p-2.5 bg-card rounded-sm border border-border">
                      <span className="text-[10px] text-muted-foreground uppercase block font-medium">Vouchers</span>
                      <span className="text-sm font-bold font-mono text-foreground">
                        {tallyParsedPreview.vouchers.length}
                      </span>
                    </div>
                    <div className="p-2.5 bg-card rounded-sm border border-border col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-muted-foreground uppercase block font-medium">Policy</span>
                      <span className="text-xs font-semibold font-mono text-primary">
                        {restoreMode}
                      </span>
                    </div>
                  </div>

                  {/* Sample items from preview */}
                  <div className="max-h-36 overflow-y-auto space-y-1 pr-1 font-mono text-[11px]">
                    {tallyParsedPreview.ledgers.slice(0, 4).map((l, idx) => (
                      <div key={idx} className="flex justify-between p-1.5 bg-card rounded-xs border border-border/60">
                        <span className="truncate max-w-[200px]">{l.name}</span>
                        <span className="text-muted-foreground">{l.group} ({l.drCr} ₹{l.openingBalance})</span>
                      </div>
                    ))}
                    {tallyParsedPreview.ledgers.length > 4 && (
                      <div className="text-[10px] text-muted-foreground text-center pt-1">
                        + {tallyParsedPreview.ledgers.length - 4} more ledgers detected...
                      </div>
                    )}
                  </div>

                  {/* Execute Button */}
                  <button
                    type="button"
                    onClick={handleExecuteTallyRestore}
                    className="w-full py-2 bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-xs rounded-sm transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
                  >
                    <CheckCircle2 className="size-4" />
                    <span>Execute Restore into Nexora Books</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right: Export to Tally Prime XML */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-sm border border-border bg-card p-5 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Download className="size-4 text-primary" />
                  Export to Tally Prime XML
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Generate standard XML for direct import into Tally Prime / ERP 9 using <em>Import Data &gt; Vouchers</em>.
                </p>
              </div>

              <div className="p-3.5 bg-muted/40 rounded-sm border border-border space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Company:</span>
                  <span className="font-medium text-foreground truncate max-w-[180px]">{activeCompany.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ledgers Count:</span>
                  <span className="font-mono font-medium text-foreground">{ledgers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vouchers Count:</span>
                  <span className="font-mono font-medium text-foreground">{vouchers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Format Specification:</span>
                  <span className="font-mono text-primary font-medium">Tally Prime XML v1.0</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDownloadTallyXml}
                className="w-full py-2 bg-card hover:bg-accent hover:text-accent-foreground text-foreground border border-border font-medium text-xs rounded-sm transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
              >
                <Download className="size-3.5" />
                <span>Download Tally Prime XML (.xml)</span>
              </button>

              <div className="p-3 rounded-sm bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-700 dark:text-blue-300 space-y-1">
                <span className="font-semibold block">Tally Prime Import Instructions:</span>
                <ol className="list-decimal list-inside space-y-0.5 text-muted-foreground">
                  <li>In Tally Prime, press <strong>Alt+O (Import)</strong></li>
                  <li>Select <strong>Masters</strong> or <strong>Transactions</strong></li>
                  <li>Choose the downloaded XML file to synchronize books seamlessly</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BUSY ACCOUNTING SOFTWARE MIGRATION */}
      {activeSubTab === 'BUSY' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Restore / Import from Busy */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-sm border border-border bg-card p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Upload className="size-4 text-primary" />
                    Restore from Old Busy Accounting Backup (.DAT / .XML / .JSON)
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Import accounts, inventory items with HSN codes, opening stock, and vouchers from Busy Accounting.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={handleLoadSampleBusyDat}
                    className="px-2.5 py-1 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    title="Test migration with FIXNOW_20261030_MSAll.DAT file"
                  >
                    <Zap className="size-3 text-amber-300" />
                    <span>Load FIXNOW MSAll.DAT</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleLoadSampleBusyXml}
                    className="px-2.5 py-1 text-xs font-medium bg-muted hover:bg-muted/80 text-foreground border border-border rounded-sm transition-colors cursor-pointer flex items-center gap-1.5"
                    title="Test migration with Busy XML"
                  >
                    <span>Sample XML</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadSampleDatFile}
                    className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground border border-border rounded-sm hover:bg-muted transition-colors cursor-pointer"
                    title="Download FIXNOW_20261030_MSAll.DAT to test file picker"
                  >
                    <Download className="size-3" />
                  </button>
                </div>
              </div>

              {/* Drag & Drop Area */}
              <div
                onClick={() => busyFileInputRef.current?.click()}
                className="border-2 border-dashed border-border hover:border-primary/60 rounded-sm p-6 text-center cursor-pointer transition-colors bg-muted/20 hover:bg-muted/40"
              >
                <input
                  type="file"
                  ref={busyFileInputRef}
                  onChange={handleBusyFileChange}
                  accept=".dat,.DAT,.xml,.XML,.json,.JSON,.bdk,.BDK,.txt,.TXT,.bak,.BAK,*"
                  className="hidden"
                />
                <Server className="size-8 mx-auto text-primary mb-2" />
                <p className="text-xs font-semibold text-foreground">
                  Click to select or drag & drop Busy Accounting backup (.DAT, .XML, or .JSON)
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Supported formats: Busy 17/18/21 Master &amp; All Vouchers <code className="font-mono text-primary font-bold">MSAll.DAT</code>, <code className="font-mono text-primary">&lt;BUSYDATA&gt;</code> XML, or JSON
                </p>
              </div>

              {/* Restore Mode Toggle */}
              <div className="flex items-center justify-between p-3 rounded-sm bg-muted/40 border border-border text-xs">
                <div>
                  <span className="font-medium text-foreground block">Merge or Replace Policy</span>
                  <span className="text-[11px] text-muted-foreground">
                    Safely merge new items/accounts or overwrite current dataset.
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-card p-0.5 rounded-sm border border-border">
                  <button
                    type="button"
                    onClick={() => setRestoreMode('MERGE')}
                    className={`px-2.5 py-1 text-xs rounded-xs font-medium transition-colors cursor-pointer ${
                      restoreMode === 'MERGE'
                        ? 'bg-primary text-primary-foreground font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Merge (Safe)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRestoreMode('REPLACE')}
                    className={`px-2.5 py-1 text-xs rounded-xs font-medium transition-colors cursor-pointer ${
                      restoreMode === 'REPLACE'
                        ? 'bg-destructive text-destructive-foreground font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Replace All
                  </button>
                </div>
              </div>

              {/* Parsed Preview Section */}
              {busyParsedPreview && (
                <div className="border border-border rounded-sm p-4 bg-muted/20 space-y-3">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                      Busy Backup Successfully Parsed
                    </span>
                    {busyParsedPreview.companyName && (
                      <span className="text-[11px] font-mono font-medium text-primary">
                        Company: {busyParsedPreview.companyName}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 bg-card rounded-sm border border-border">
                      <span className="text-[10px] text-muted-foreground uppercase block font-medium">Accounts</span>
                      <span className="text-sm font-bold font-mono text-foreground">
                        {busyParsedPreview.ledgers.length}
                      </span>
                    </div>
                    <div className="p-2.5 bg-card rounded-sm border border-border">
                      <span className="text-[10px] text-muted-foreground uppercase block font-medium">Stock Items</span>
                      <span className="text-sm font-bold font-mono text-foreground">
                        {busyParsedPreview.stockItems.length}
                      </span>
                    </div>
                    <div className="p-2.5 bg-card rounded-sm border border-border">
                      <span className="text-[10px] text-muted-foreground uppercase block font-medium">Vouchers</span>
                      <span className="text-sm font-bold font-mono text-foreground">
                        {busyParsedPreview.vouchers.length}
                      </span>
                    </div>
                    <div className="p-2.5 bg-card rounded-sm border border-border">
                      <span className="text-[10px] text-muted-foreground uppercase block font-medium">Mode</span>
                      <span className="text-xs font-semibold font-mono text-primary">
                        {restoreMode}
                      </span>
                    </div>
                  </div>

                  {/* Sample items from preview */}
                  <div className="max-h-36 overflow-y-auto space-y-1 pr-1 font-mono text-[11px]">
                    {busyParsedPreview.stockItems.slice(0, 3).map((it, idx) => (
                      <div key={idx} className="flex justify-between p-1.5 bg-card rounded-xs border border-border/60">
                        <span className="truncate max-w-[200px]">{it.name}</span>
                        <span className="text-muted-foreground">HSN {it.hsnCode} (Qty: {it.openingStock} @ ₹{it.salePrice})</span>
                      </div>
                    ))}
                    {busyParsedPreview.ledgers.slice(0, 2).map((l, idx) => (
                      <div key={`led-${idx}`} className="flex justify-between p-1.5 bg-card rounded-xs border border-border/60">
                        <span className="truncate max-w-[200px]">{l.name}</span>
                        <span className="text-muted-foreground">{l.group} (₹{l.openingBalance})</span>
                      </div>
                    ))}
                  </div>

                  {/* Execute Button */}
                  <button
                    type="button"
                    onClick={handleExecuteBusyRestore}
                    className="w-full py-2 bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-xs rounded-sm transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
                  >
                    <CheckCircle2 className="size-4" />
                    <span>Execute Restore from Busy Accounting</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right: Export to Busy XML */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-sm border border-border bg-card p-5 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Download className="size-4 text-primary" />
                  Export to Busy Accounting XML
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Export complete chart of accounts, items with HSN codes, and sales/purchase registers in Busy XML standard.
                </p>
              </div>

              <div className="p-3.5 bg-muted/40 rounded-sm border border-border space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Company Name:</span>
                  <span className="font-medium text-foreground truncate max-w-[180px]">{activeCompany.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stock Items:</span>
                  <span className="font-mono font-medium text-foreground">{stockItems.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Accounts / Ledgers:</span>
                  <span className="font-mono font-medium text-foreground">{ledgers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vouchers:</span>
                  <span className="font-mono font-medium text-foreground">{vouchers.length}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDownloadBusyXml}
                className="w-full py-2 bg-card hover:bg-accent hover:text-accent-foreground text-foreground border border-border font-medium text-xs rounded-sm transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
              >
                <Download className="size-3.5" />
                <span>Download Busy Accounting XML (.xml)</span>
              </button>

              <div className="p-3 rounded-sm bg-muted/60 border border-border text-[11px] text-muted-foreground space-y-1">
                <span className="font-semibold text-foreground block">Busy Software Migration Note:</span>
                <p>
                  Compatible with Busy 17, Busy 18, and Busy 21 Enterprise editions. XML files can be imported directly into Busy under <em>Administration &gt; Data Export/Import &gt; Import from XML</em>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: NEXORA BOOKS FULL SNAPSHOT (JSON) */}
      {activeSubTab === 'NEXORA_JSON' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Download Snapshot */}
          <div className="rounded-sm border border-border bg-card p-5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Download className="size-4 text-primary" />
                Full System Backup (Encrypted JSON)
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Download a complete, offline-portable snapshot of your company, master ledgers, inventory, vouchers, GSP credentials, and MCA audit logs.
              </p>
            </div>

            <div className="p-3.5 bg-muted/40 rounded-sm border border-border space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Companies:</span>
                <span className="font-mono font-medium text-foreground">1 active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ledgers & Accounts:</span>
                <span className="font-mono font-medium text-foreground">{ledgers.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Inventory Items:</span>
                <span className="font-mono font-medium text-foreground">{stockItems.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vouchers & Invoices:</span>
                <span className="font-mono font-medium text-foreground">{vouchers.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">MCA Audit Entries:</span>
                <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">{auditLogs.length}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownloadJsonBackup}
              className="w-full py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-xs rounded-sm transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
            >
              <Download className="size-4" />
              <span>Download Complete System Backup (.json)</span>
            </button>
          </div>

          {/* Restore Snapshot */}
          <div className="rounded-sm border border-border bg-card p-5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Upload className="size-4 text-primary" />
                Restore System from Backup File
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Upload a previously saved Nexora Books backup file to restore complete business records and configurations.
              </p>
            </div>

            <div
              onClick={() => jsonFileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-primary/60 rounded-sm p-6 text-center cursor-pointer transition-colors bg-muted/20 hover:bg-muted/40"
            >
              <input
                type="file"
                ref={jsonFileInputRef}
                onChange={handleJsonFileUpload}
                accept=".json"
                className="hidden"
              />
              <Database className="size-8 mx-auto text-primary mb-2" />
              <p className="text-xs font-semibold text-foreground">
                Click to browse or drop Nexora backup (.json)
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Schema verified with SHA-256 integrity stamp
              </p>
            </div>

            <div className="p-3 rounded-sm bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-300">
              <span className="font-semibold block">Audit Warning:</span>
              <span>
                Restoring a system snapshot overwrites existing voucher sequence. Every restore action is recorded in the MCA Rule 3(1) edit log.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BOOKS FREEZE & LOCK DATE */}
      {activeSubTab === 'LOCK_FREEZE' && (
        <div className="max-w-2xl rounded-sm border border-border bg-card p-6 space-y-5">
          <div>
            <h3 className="text-base font-serif font-bold text-foreground flex items-center gap-2">
              <Lock className="size-4.5 text-primary" />
              Statutory Books Freeze & Lock Date
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Prevent backdated entries, modifications, or deletions prior to the specified accounting period closing date (e.g., after statutory audit or GST annual return filing).
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-foreground block">
              Books Freeze Date (Cut-Off)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={lockDate}
                onChange={e => setLockDate(e.target.value)}
                className="px-3 py-2 text-xs font-mono rounded-sm border border-border bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary w-full max-w-xs"
              />
              <button
                type="button"
                onClick={handleSaveLockDate}
                className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-xs rounded-sm transition-colors cursor-pointer shadow-2xs"
              >
                {isLockSaved ? 'Saved!' : 'Save Lock Date'}
              </button>
              {lockDate && (
                <button
                  type="button"
                  onClick={() => {
                    setLockDate('');
                    updateCompany({ ...activeCompany, lockDate: undefined });
                    setAlertBanner({ type: 'info', message: 'Books lockdown removed.' });
                  }}
                  className="px-3 py-2 text-xs text-muted-foreground hover:text-foreground border border-border rounded-sm transition-colors cursor-pointer"
                >
                  Clear Lock
                </button>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {activeCompany.lockDate
                ? `Currently locked prior to ${activeCompany.lockDate}. Vouchers dated on or before this day cannot be edited or deleted.`
                : 'Currently no freeze date set. All fiscal years are open for adjustments.'}
            </p>
          </div>

          <div className="p-3.5 bg-muted/40 rounded-sm border border-border text-xs space-y-2">
            <span className="font-semibold text-foreground block">MCA Statutory Requirement:</span>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Companies Act 2013 and MCA Notification G.S.R. 235(E) require that electronic accounting books cannot permit alterations of audited periods without explicit statutory audit remarks and timestamp logs.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
