/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calendar, X } from 'lucide-react';
import { useErp } from '../../context/ErpContext';

interface PeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PeriodModal: React.FC<PeriodModalProps> = ({ isOpen, onClose }) => {
  const { reportingPeriod, setReportingPeriod } = useErp();
  const [from, setFrom] = useState(reportingPeriod.from);
  const [to, setTo] = useState(reportingPeriod.to);

  if (!isOpen) return null;

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setReportingPeriod({ from, to });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-card text-card-foreground w-full max-w-sm rounded-md shadow-lg border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-sidebar border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-primary" />
            <span className="font-serif font-bold text-sm text-foreground">Change Financial Period</span>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded-sm hover:bg-muted transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleApply} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-muted-foreground font-semibold mb-1">From Date</label>
            <input
              type="date"
              value={from}
              onChange={e => setFrom(e.target.value)}
              className="w-full px-3 py-2 font-mono border border-border rounded-sm text-sm bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-muted-foreground font-semibold mb-1">To Date</label>
            <input
              type="date"
              value={to}
              onChange={e => setTo(e.target.value)}
              className="w-full px-3 py-2 font-mono border border-border rounded-sm text-sm bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
            />
          </div>

          <div className="flex gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-foreground/80 hover:bg-muted rounded-sm font-medium border border-border cursor-pointer transition-colors"
            >
              Cancel [Esc]
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-sm shadow-2xs cursor-pointer transition-colors"
            >
              Apply Period
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
