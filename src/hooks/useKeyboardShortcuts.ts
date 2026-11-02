/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { VoucherType } from '../types/erp';

interface ShortcutHandlers {
  onOpenGoTo?: () => void;
  onOpenCompanyModal?: () => void;
  onOpenDateModal?: () => void;
  onOpenPeriodModal?: () => void;
  onOpenVoucherModal?: (type: VoucherType) => void;
  onOpenMasterCreateModal?: () => void;
  onPrint?: () => void;
  onExport?: () => void;
  onSave?: () => void;
  onEscape?: () => void;
  onOpenCheatSheet?: () => void;
  onOpenAuditTrail?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers, enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in standard inputs and pressed a non-functional key
      const activeElement = document.activeElement;
      const isInput =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement instanceof HTMLSelectElement;

      // Global Esc works anywhere to close active modal or blur
      if (e.key === 'Escape') {
        if (handlers.onEscape) {
          e.preventDefault();
          handlers.onEscape();
          return;
        }
      }

      // Alt + G: Go To Global Search (Tally Prime standard)
      if (e.altKey && (e.key === 'g' || e.key === 'G')) {
        e.preventDefault();
        handlers.onOpenGoTo?.();
        return;
      }

      // Alt + C: Inline Master Creation (Ledger / Stock Item)
      if (e.altKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        handlers.onOpenMasterCreateModal?.();
        return;
      }

      // Alt + A: Open Statutory Audit Trail & MCA Edit Log
      if (e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        handlers.onOpenAuditTrail?.();
        return;
      }

      // Ctrl + P / Cmd + P / Alt + P: Print Voucher Preview
      if ((e.ctrlKey || e.metaKey || e.altKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        handlers.onPrint?.();
        return;
      }

      // Alt + E: Export
      if (e.altKey && (e.key === 'e' || e.key === 'E')) {
        e.preventDefault();
        handlers.onExport?.();
        return;
      }

      // Ctrl + A: Instant Save Voucher
      if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A') && !isInput) {
        e.preventDefault();
        handlers.onSave?.();
        return;
      }

      // Function keys (F1 to F9)
      if (e.key === 'F1') {
        // Toggle detailed or help
        e.preventDefault();
        handlers.onOpenCheatSheet?.();
        return;
      }

      if (e.key === 'F2') {
        e.preventDefault();
        if (e.altKey) {
          handlers.onOpenPeriodModal?.();
        } else {
          handlers.onOpenDateModal?.();
        }
        return;
      }

      if (e.key === 'F3') {
        e.preventDefault();
        handlers.onOpenCompanyModal?.();
        return;
      }

      if (e.key === 'F4') {
        e.preventDefault();
        handlers.onOpenVoucherModal?.('CONTRA');
        return;
      }

      if (e.key === 'F5') {
        e.preventDefault();
        handlers.onOpenVoucherModal?.('PAYMENT');
        return;
      }

      if (e.key === 'F6') {
        e.preventDefault();
        handlers.onOpenVoucherModal?.('RECEIPT');
        return;
      }

      if (e.key === 'F7') {
        e.preventDefault();
        handlers.onOpenVoucherModal?.('JOURNAL');
        return;
      }

      if (e.key === 'F8') {
        e.preventDefault();
        if (e.ctrlKey) {
          handlers.onOpenVoucherModal?.('CREDIT_NOTE');
        } else if (e.altKey) {
          handlers.onOpenVoucherModal?.('DELIVERY_CHALLAN');
        } else {
          handlers.onOpenVoucherModal?.('SALES');
        }
        return;
      }

      if (e.key === 'F9') {
        e.preventDefault();
        if (e.ctrlKey) {
          handlers.onOpenVoucherModal?.('DEBIT_NOTE');
        } else if (e.altKey) {
          handlers.onOpenVoucherModal?.('GRN');
        } else {
          handlers.onOpenVoucherModal?.('PURCHASE');
        }
        return;
      }

      // Pressing '?' when not in an input
      if (e.key === '?' && !isInput) {
        e.preventDefault();
        handlers.onOpenCheatSheet?.();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}
