/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Download,
  Upload,
  Database,
  FileCode,
  ShieldCheck,
  Lock,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
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

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFullPage?: () => void;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({
  isOpen,
  onClose,
  onOpenFullPage,
}) => {
  const {
    activeCompany,
    ledgers,
    stockItems,
    godowns,
    vouchers,
    auditLogs,
    subscription,
    restoreData,
    restoreTallyData,
    restoreBusyData,
    updateCompany,
  } = useErp();

  const [activeTab, setActiveTab] = useState<'TALLY' | 'BUSY' | 'JSON' | 'LOCK_BOOKS'>('TALLY');
  const [lockDate, setLockDate] = useState(activeCompany.lockDate || '');
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  if (!isOpen) return null;

  // --- Tally ---
  const handleTallyUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      const text = evt.target?.result as string;
      const parsed = parseTallyXmlBackup(text);
      if (parsed.success) {
        const res = restoreTallyData({
          companyName: parsed.companyName,
          ledgers: parsed.ledgers,
          vouchers: parsed.vouchers,
        });
        setStatusMessage({
          type: 'success',
          text: `Restored ${res.ledgersCount} ledgers & ${res.vouchersCount} vouchers from Tally XML.`,
        });
      } else {
        setStatusMessage({ type: 'error', text: parsed.message });
      }
    };
    reader.readAsText(file);
  };

  const handleTestTallySample = () => {
    const parsed = parseTallyXmlBackup(SAMPLE_TALLY_XML);
    if (parsed.success) {
      const res = restoreTallyData({
        companyName: parsed.companyName,
        ledgers: parsed.ledgers,
        vouchers: parsed.vouchers,
      });
      setStatusMessage({
        type: 'success',
        text: `Restored ${res.ledgersCount} ledgers and ${res.vouchersCount} vouchers from sample Tally Prime XML.`,
      });
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
    setStatusMessage({ type: 'success', text: 'Downloaded standard Tally Prime XML backup.' });
  };

  // --- Busy ---
  const handleBusyUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      const text = evt.target?.result as string;
      const parsed = parseBusyBackup(text);
      if (parsed.success) {
        const res = restoreBusyData({
          companyName: parsed.companyName,
          ledgers: parsed.ledgers,
          stockItems: parsed.stockItems,
          vouchers: parsed.vouchers,
        });
        setStatusMessage({
          type: 'success',
          text: `Restored ${res.ledgersCount} accounts, ${res.itemsCount} items & ${res.vouchersCount} vouchers from Busy Accounting.`,
        });
      } else {
        setStatusMessage({ type: 'error', text: parsed.message });
      }
    };
    reader.readAsText(file);
  };

  const handleTestBusySample = () => {
    const parsed = parseBusyBackup(SAMPLE_BUSY_XML);
    if (parsed.success) {
      const res = restoreBusyData({
        companyName: parsed.companyName,
        ledgers: parsed.ledgers,
        stockItems: parsed.stockItems,
        vouchers: parsed.vouchers,
      });
      setStatusMessage({
        type: 'success',
        text: `Restored ${res.ledgersCount} accounts, ${res.itemsCount} items and ${res.vouchersCount} vouchers from sample Busy XML.`,
      });
    }
  };

  const handleTestBusyDat = () => {
    const parsed = parseBusyBackup(SAMPLE_BUSY_DAT);
    if (parsed.success) {
      const res = restoreBusyData({
        companyName: parsed.companyName,
        ledgers: parsed.ledgers,
        stockItems: parsed.stockItems,
        vouchers: parsed.vouchers,
      });
      setStatusMessage({
        type: 'success',
        text: `Restored ${res.ledgersCount} accounts, ${res.itemsCount} items & ${res.vouchersCount} vouchers from FIXNOW_20261030_MSAll.DAT.`,
      });
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
    setStatusMessage({ type: 'success', text: 'Downloaded standard Busy Accounting XML backup.' });
  };

  // --- JSON ---
  const handleDownloadJson = () => {
    exportFullJsonBackup({
      companies: [activeCompany],
      ledgers,
      stockItems,
      godowns,
      vouchers,
      auditLogs,
      subscription,
    });
    setStatusMessage({ type: 'success', text: 'Downloaded full encrypted JSON backup.' });
  };

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        const ok = restoreData(parsed);
        if (ok) {
          setStatusMessage({ type: 'success', text: 'System restored from JSON snapshot.' });
        } else {
          setStatusMessage({ type: 'error', text: 'Invalid JSON backup format.' });
        }
      } catch (err: any) {
        setStatusMessage({ type: 'error', text: 'Error reading JSON backup.' });
      }
    };
    reader.readAsText(file);
  };

  // --- Lock Date ---
  const handleSaveLock = () => {
    updateCompany({ ...activeCompany, lockDate: lockDate || undefined });
    setStatusMessage({ type: 'success', text: 'Books lock date updated successfully.' });
  };

  return (
    <div className="fixed inset-0 z-60 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card text-card-foreground w-full max-w-3xl rounded-sm shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-sidebar border-b border-border p-4 px-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-sm bg-primary/10 text-primary">
              <Database className="size-4.5" />
            </span>
            <div>
              <h3 className="font-serif font-bold text-sm text-foreground">
                Backup, Restore & Software Migration
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Tally Prime, Busy Accounting Software & Cloud Snapshots
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded-sm hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="size-4.5" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="flex border-b border-border bg-muted/40 px-5 pt-2 gap-1 text-xs">
          <button
            onClick={() => setActiveTab('TALLY')}
            className={`px-3 py-2 font-medium border-b-2 -mb-px transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'TALLY'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileCode className="size-3.5" />
            <span>Tally Prime</span>
          </button>

          <button
            onClick={() => setActiveTab('BUSY')}
            className={`px-3 py-2 font-medium border-b-2 -mb-px transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'BUSY'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Server className="size-3.5" />
            <span>Busy Accounting</span>
          </button>

          <button
            onClick={() => setActiveTab('JSON')}
            className={`px-3 py-2 font-medium border-b-2 -mb-px transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'JSON'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Database className="size-3.5" />
            <span>Nexora JSON</span>
          </button>

          <button
            onClick={() => setActiveTab('LOCK_BOOKS')}
            className={`px-3 py-2 font-medium border-b-2 -mb-px transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'LOCK_BOOKS'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Lock className="size-3.5" />
            <span>Lock Books</span>
          </button>
        </div>

        {/* Status message */}
        {statusMessage && (
          <div
            className={`m-5 mb-0 p-3 rounded-sm border text-xs flex items-center justify-between ${
              statusMessage.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertCircle className="size-4 shrink-0 text-rose-600 dark:text-rose-400" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-[11px] underline font-medium ml-3 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Body Content */}
        <div className="p-5 space-y-4">
          {/* TALLY TAB */}
          {activeTab === 'TALLY' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Restore Card */}
                <div className="border border-border rounded-sm p-4 bg-muted/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Upload className="size-4 text-primary" />
                      Restore Tally XML
                    </span>
                    <button
                      type="button"
                      onClick={handleTestTallySample}
                      className="text-[11px] text-primary hover:underline font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <Zap className="size-3 text-amber-500" />
                      Test Sample
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Upload Tally Prime / ERP 9 XML backup to import all ledgers, parties, and vouchers.
                  </p>
                  <label className="block w-full py-2 px-3 border border-dashed border-border hover:border-primary/60 rounded-sm text-center cursor-pointer text-xs font-medium text-foreground bg-card hover:bg-muted/40 transition-colors">
                    <input
                      type="file"
                      accept=".xml,.txt"
                      onChange={handleTallyUpload}
                      className="hidden"
                    />
                    <span>Choose Tally XML File</span>
                  </label>
                </div>

                {/* Export Card */}
                <div className="border border-border rounded-sm p-4 bg-muted/20 space-y-3">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Download className="size-4 text-primary" />
                    Export Tally Prime XML
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    Download {vouchers.length} vouchers and {ledgers.length} ledgers in native Tally Prime XML format.
                  </p>
                  <button
                    type="button"
                    onClick={handleDownloadTallyXml}
                    className="w-full py-2 px-3 bg-card hover:bg-accent text-foreground border border-border rounded-sm text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <Download className="size-3.5" />
                    <span>Download Tally XML</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* BUSY TAB */}
          {activeTab === 'BUSY' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Restore Busy Card */}
                <div className="border border-border rounded-sm p-4 bg-muted/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Upload className="size-4 text-primary" />
                      Restore Busy Backup
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleTestBusyDat}
                        className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded-sm hover:bg-primary/20 flex items-center gap-1 cursor-pointer"
                        title="Load FIXNOW_20261030_MSAll.DAT"
                      >
                        <Zap className="size-2.5 text-amber-500" />
                        MSAll.DAT
                      </button>
                      <button
                        type="button"
                        onClick={handleTestBusySample}
                        className="text-[10px] text-muted-foreground hover:text-foreground font-medium cursor-pointer"
                      >
                        XML
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Import accounts, items with HSN codes, and vouchers from Busy Accounting (.DAT, .XML, or .JSON).
                  </p>
                  <label className="block w-full py-2 px-3 border border-dashed border-border hover:border-primary/60 rounded-sm text-center cursor-pointer text-xs font-medium text-foreground bg-card hover:bg-muted/40 transition-colors">
                    <input
                      type="file"
                      accept=".dat,.DAT,.xml,.XML,.json,.JSON,.bdk,.BDK,.txt,.TXT,.bak,.BAK,*"
                      onChange={handleBusyUpload}
                      className="hidden"
                    />
                    <span>Choose Busy Backup File (.DAT / .XML)</span>
                  </label>
                </div>

                {/* Export Busy Card */}
                <div className="border border-border rounded-sm p-4 bg-muted/20 space-y-3">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Download className="size-4 text-primary" />
                    Export Busy XML
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    Export {stockItems.length} items and {ledgers.length} accounts in Busy standard XML.
                  </p>
                  <button
                    type="button"
                    onClick={handleDownloadBusyXml}
                    className="w-full py-2 px-3 bg-card hover:bg-accent text-foreground border border-border rounded-sm text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <Download className="size-3.5" />
                    <span>Download Busy XML</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* JSON TAB */}
          {activeTab === 'JSON' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-border rounded-sm p-4 bg-muted/20 space-y-3">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Upload className="size-4 text-primary" />
                    Restore JSON Snapshot
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    Upload full system snapshot to restore all companies, vouchers, and settings.
                  </p>
                  <label className="block w-full py-2 px-3 border border-dashed border-border hover:border-primary/60 rounded-sm text-center cursor-pointer text-xs font-medium text-foreground bg-card hover:bg-muted/40 transition-colors">
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleJsonUpload}
                      className="hidden"
                    />
                    <span>Browse JSON Backup File</span>
                  </label>
                </div>

                <div className="border border-border rounded-sm p-4 bg-muted/20 space-y-3">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Download className="size-4 text-primary" />
                    Full System Snapshot
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    Complete export of current company dataset with SHA-256 integrity verification.
                  </p>
                  <button
                    type="button"
                    onClick={handleDownloadJson}
                    className="w-full py-2 px-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <Download className="size-3.5" />
                    <span>Export JSON Backup</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* LOCK BOOKS TAB */}
          {activeTab === 'LOCK_BOOKS' && (
            <div className="space-y-4 border border-border rounded-sm p-4 bg-muted/20">
              <div>
                <h4 className="text-xs font-semibold text-foreground">Lock Historical Vouchers</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Freeze books on or before this date to prevent accidental alterations.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="date"
                  value={lockDate}
                  onChange={e => setLockDate(e.target.value)}
                  className="px-3 py-1.5 text-xs font-mono rounded-sm border border-border bg-background text-foreground"
                />
                <button
                  type="button"
                  onClick={handleSaveLock}
                  className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm cursor-pointer shadow-2xs"
                >
                  Save Freeze Date
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 px-5 bg-muted/40 border-t border-border flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
            <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>MCA Rule 3(1) Compliant Audit Trail</span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenFullPage && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenFullPage();
                }}
                className="px-3 py-1.5 text-xs font-medium text-primary hover:underline cursor-pointer"
              >
                Open Full Screen Hub &rarr;
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-sm cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
