/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Send,
  X,
  PhoneCall,
  CheckCircle2,
  Clock,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  CheckCheck,
  FileText,
  AlertCircle,
  Sparkles,
  RefreshCw,
  History,
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import {
  WhatsAppDocType,
  sendWhatsAppMessage,
  fetchWhatsAppLogs,
  fetchWhatsAppConfig,
  buildWhatsAppTemplate,
  WhatsAppLogItem,
} from '../../services/whatsappService';
import { Voucher, Ledger } from '../../types/erp';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDocType?: WhatsAppDocType;
  voucher?: Voucher | null;
  ledger?: Ledger | null;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  initialDocType = 'INVOICE',
  voucher,
  ledger,
}) => {
  const { activeCompany, logAudit } = useErp();

  const [docType, setDocType] = useState<WhatsAppDocType>(initialDocType);
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<{
    success: boolean;
    messageId?: string;
    provider?: string;
    error?: string;
  } | null>(null);

  const [providerConfig, setProviderConfig] = useState<any>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [logs, setLogs] = useState<WhatsAppLogItem[]>([]);

  // Load configuration and initialize phone & template on open
  useEffect(() => {
    if (isOpen) {
      setSendStatus(null);
      fetchWhatsAppConfig().then(cfg => setProviderConfig(cfg));
      fetchWhatsAppLogs().then(l => setLogs(l));

      const partyName = voucher?.partyName || ledger?.name || 'Valued Client';
      const phone = ledger?.phone || (voucher?.partyGstin ? '+91 98200 45678' : '+91 98200 45678');
      const docNo = voucher?.voucherNumber || 'STATEMENT';
      const date = voucher?.date || new Date().toISOString().split('T')[0];
      const amount = voucher ? voucher.grandTotal : (ledger?.currentBalance || 0);

      const itemsSummary = voucher?.items?.map(it => `${it.itemName} (${it.quantity} ${it.unit})`).join(', ');

      setRecipientName(partyName);
      setRecipientPhone(phone);

      const initialText = buildWhatsAppTemplate({
        type: docType,
        companyName: activeCompany.name,
        tradeName: activeCompany.tradeName,
        recipientName: partyName,
        docNumber: docNo,
        date,
        amount,
        upiId: activeCompany.upiId,
        itemsSummary,
        balance: ledger?.currentBalance,
      });

      setMessageBody(initialText);
    }
  }, [isOpen, voucher, ledger, docType]);

  if (!isOpen) return null;

  const handleDocTypeChange = (type: WhatsAppDocType) => {
    setDocType(type);
    const partyName = voucher?.partyName || ledger?.name || recipientName;
    const docNo = voucher?.voucherNumber || 'STATEMENT';
    const date = voucher?.date || new Date().toISOString().split('T')[0];
    const amount = voucher ? voucher.grandTotal : (ledger?.currentBalance || 0);
    const itemsSummary = voucher?.items?.map(it => `${it.itemName} (${it.quantity} ${it.unit})`).join(', ');

    const newText = buildWhatsAppTemplate({
      type,
      companyName: activeCompany.name,
      tradeName: activeCompany.tradeName,
      recipientName: partyName,
      docNumber: docNo,
      date,
      amount,
      upiId: activeCompany.upiId,
      itemsSummary,
      balance: ledger?.currentBalance,
    });
    setMessageBody(newText);
  };

  const handleDirectApiSend = async () => {
    if (!recipientPhone.trim()) return;
    setIsSending(true);
    setSendStatus(null);

    const docNo = voucher?.voucherNumber || 'STATEMENT';
    const amount = voucher ? voucher.grandTotal : (ledger?.currentBalance || 0);

    const res = await sendWhatsAppMessage({
      recipientPhone,
      recipientName,
      documentType: docType,
      documentNumber: docNo,
      amount,
      messageBody,
      upiId: activeCompany.upiId,
      companyName: activeCompany.tradeName || activeCompany.name,
    });

    setIsSending(false);
    setSendStatus(res);

    if (res.success) {
      logAudit(
        'PRINT',
        'WHATSAPP',
        docNo,
        `Sent ${docType} to ${recipientPhone} via ${res.provider || 'WhatsApp API'}`
      );
      fetchWhatsAppLogs().then(l => setLogs(l));
    }
  };

  const handleOpenWhatsAppWeb = () => {
    const cleanPhone = recipientPhone.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(messageBody);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-70 bg-background/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-card text-card-foreground w-full max-w-2xl rounded-sm shadow-2xl border border-border overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#075E54] text-white p-4 px-6 flex items-center justify-between border-b border-[#064E46]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-sm bg-emerald-500 flex items-center justify-center text-white shadow-xs">
              <MessageSquare size={20} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base leading-tight">WhatsApp Business Dispatch Service</h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                Direct statutory document dispatch with UPI QR settlement
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-1.5 text-emerald-100 hover:text-white hover:bg-[#064E46] rounded-sm transition-colors flex items-center gap-1 text-xs"
              title="View Dispatch History"
            >
              <History size={16} />
              <span className="hidden sm:inline">Outbox</span>
            </button>
            <button onClick={onClose} className="text-emerald-200 hover:text-white p-1 rounded-sm">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Provider Banner */}
        <div className="bg-muted/40 px-6 py-2.5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-foreground">
          <div className="flex items-center gap-2">
            <ShieldCheck size={15} className="text-emerald-600 shrink-0" />
            <div>
              <span className="font-semibold text-foreground">No API Keys or Setup Required:</span>{' '}
              <span className="text-muted-foreground">
                Ready to use out-of-the-box! Test dispatch with the built-in gateway, or use <strong>Open in WhatsApp Web</strong> to send from your own WhatsApp.
              </span>
            </div>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-wider font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-sm shrink-0 self-start sm:self-auto">
            Ready to Send
          </span>
        </div>

        {showHistory ? (
          /* Outbox History View */
          <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-border pb-2">
              <h4 className="font-serif font-bold text-sm text-foreground">Recent WhatsApp Dispatch Logs</h4>
              <button
                onClick={() => setShowHistory(false)}
                className="text-xs font-semibold text-primary hover:underline"
              >
                ← Back to Message Composer
              </button>
            </div>

            <div className="space-y-2">
              {logs.map(log => (
                <div key={log.id} className="p-3 bg-muted/40 rounded-sm border border-border space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-foreground">
                      {log.documentType} #{log.documentNumber} → {log.recipientName} ({log.recipientPhone})
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-sm border border-emerald-500/30">
                      <CheckCheck size={13} className="text-primary" /> {log.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2">{log.messageBody}</p>
                  <div className="text-[10px] text-muted-foreground font-mono flex justify-between">
                    <span>Msg ID: {log.providerMessageId}</span>
                    <span>{log.timestamp.replace('T', ' ').substring(0, 19)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Composer View */
          <div className="p-6 max-h-[72vh] overflow-y-auto space-y-4 text-xs">
            {/* Success Message Banner */}
            {sendStatus?.success && (
              <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-sm flex items-center justify-between text-foreground animate-in fade-in duration-150">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                  <div>
                    <div className="font-bold text-sm">Message Sent Successfully!</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                      Message SID: {sendStatus.messageId} · Provider: {sendStatus.provider}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-primary font-bold">
                  <CheckCheck size={16} /> Delivered
                </div>
              </div>
            )}

            {/* Error Message Banner */}
            {sendStatus && !sendStatus.success && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-sm text-destructive flex items-center gap-2">
                <AlertCircle size={16} className="text-destructive shrink-0" />
                <span>{sendStatus.error}</span>
              </div>
            )}

            {/* Document Type Selector Tabs */}
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Select Dispatch Category:
              </label>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {[
                  { id: 'INVOICE' as const, label: 'Tax Invoice' },
                  { id: 'QUOTATION' as const, label: 'Quotation / Estimate' },
                  { id: 'DELIVERY_CHALLAN' as const, label: 'Delivery Challan' },
                  { id: 'LEDGER_REPORT' as const, label: 'Ledger Statement' },
                  { id: 'PAYMENT_REMINDER' as const, label: 'Due Payment Reminder' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => handleDocTypeChange(tab.id)}
                    className={`px-3 py-1.5 rounded-sm whitespace-nowrap font-medium transition-colors ${
                      docType === tab.id
                        ? 'bg-[#075E54] text-white font-bold shadow-2xs'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Recipient Details: Phone + Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-muted/40 rounded-sm border border-border">
              <div>
                <label className="block text-[11px] font-bold text-foreground mb-1">
                  Recipient Mobile Number *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={recipientPhone}
                    onChange={e => setRecipientPhone(e.target.value)}
                    placeholder="+91 98200 45678"
                    className="w-full px-3 py-2 font-mono text-sm border border-input rounded-sm bg-background text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-foreground mb-1">
                  Party / Recipient Name
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={e => setRecipientName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-input rounded-sm bg-background text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Message Body Preview with Real-time Editing */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                  Message Content (Editable):
                </label>
                <span className="text-[11px] text-muted-foreground">Supports WhatsApp markdown (*bold*, _italic_)</span>
              </div>
              <textarea
                rows={9}
                value={messageBody}
                onChange={e => setMessageBody(e.target.value)}
                className="w-full p-3.5 font-mono text-xs border border-input rounded-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="bg-muted/40 p-4 px-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-muted-foreground">
            Sender: <strong className="text-foreground">{activeCompany.tradeName || activeCompany.name}</strong>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleOpenWhatsAppWeb}
              className="flex-1 sm:flex-none px-3.5 py-2.5 text-xs font-semibold text-secondary-foreground bg-secondary hover:bg-secondary/80 border border-border rounded-sm transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <ExternalLink size={13} /> Open in WhatsApp Web
            </button>

            <button
              type="button"
              onClick={handleDirectApiSend}
              disabled={isSending || !recipientPhone.trim()}
              className="flex-1 sm:flex-none px-5 py-2.5 text-xs font-bold text-white bg-[#075E54] hover:bg-[#064E46] rounded-sm shadow-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending via API...
                </>
              ) : (
                <>
                  <Send size={13} /> Send Directly via API
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
