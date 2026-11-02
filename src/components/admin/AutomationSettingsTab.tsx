/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AutomationSettings, TenantClient } from '../../types/admin';
import { saveAutomationSettings } from '../../services/adminService';
import {
  Zap,
  MessageSquare,
  ShieldAlert,
  Clock,
  Save,
  CheckCircle,
  HelpCircle,
  Send,
  Sparkles,
} from 'lucide-react';

interface AutomationSettingsTabProps {
  automation: AutomationSettings;
  sampleClient?: TenantClient;
  onRefresh: () => void;
}

export const AutomationSettingsTab: React.FC<AutomationSettingsTabProps> = ({
  automation,
  sampleClient,
  onRefresh,
}) => {
  const [autoDeactivate, setAutoDeactivate] = useState(automation.autoDeactivateExpiredTrial);
  const [sendAutoReminders, setSendAutoReminders] = useState(automation.sendAutomaticReminders);
  const [template, setTemplate] = useState(automation.whatsappTemplate);
  const [reminderDays, setReminderDays] = useState<string>(
    automation.reminderDaysBeforeDue.join(', ')
  );
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedDays = reminderDays
      .split(',')
      .map(s => parseInt(s.trim(), 10))
      .filter(n => !isNaN(n) && n > 0);

    const updated: AutomationSettings = {
      ...automation,
      autoDeactivateExpiredTrial: autoDeactivate,
      sendAutomaticReminders: sendAutoReminders,
      whatsappTemplate: template,
      reminderDaysBeforeDue: parsedDays.length > 0 ? parsedDays : [7, 3, 1],
    };

    saveAutomationSettings(updated);
    onRefresh();
    setSuccessNotice('Automation rules and WhatsApp reminder templates saved successfully.');
    setTimeout(() => setSuccessNotice(null), 3000);
  };

  // Preview generated text
  const previewClient = sampleClient || {
    name: 'Ramesh Patel',
    businessName: 'Apex Engineering Works',
    planName: 'Business Pro',
    dueDate: '2026-11-15',
    amount: 9999,
  };

  const previewText = template
    .replace('{client_name}', previewClient.name)
    .replace('{business_name}', previewClient.businessName)
    .replace('{plan_name}', previewClient.planName)
    .replace('{due_date}', previewClient.dueDate)
    .replace('{amount}', previewClient.amount.toLocaleString('en-IN'))
    .replace('{payment_link}', 'https://upiqr.in/pay?pa=nexorabooks@okaxis&am=9999');

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
      {successNotice && (
        <div className="flex items-center gap-2 p-3 text-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 rounded-sm animate-in fade-in">
          <CheckCircle size={15} />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Auto Deactivation Card */}
      <div className="bg-card p-5 rounded-md border border-border shadow-2xs space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldAlert size={16} className="text-amber-500" />
              <h3 className="font-serif font-bold text-sm text-foreground">
                Automatic Trial & Overdue Deactivation
              </h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              When enabled, any tenant client whose trial duration expires or whose subscription is overdue beyond the grace threshold will automatically be locked into read-only mode until payment is settled.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={autoDeactivate}
              onChange={e => setAutoDeactivate(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-muted peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
          <span>Last automated background run:</span>
          <span className="font-mono text-foreground font-medium">
            {automation.lastAutoDeactivationRun
              ? new Date(automation.lastAutoDeactivationRun).toLocaleString()
              : 'Never'}
          </span>
        </div>
      </div>

      {/* WhatsApp Automated Reminders Card */}
      <div className="bg-card p-5 rounded-md border border-border shadow-2xs space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <MessageSquare size={16} className="text-emerald-500" />
              <h3 className="font-serif font-bold text-sm text-foreground">
                Automated WhatsApp Reminder Engine
              </h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Dispatch reminders directly to the client's verified mobile number when their subscription expiration or renewal date is approaching.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={sendAutoReminders}
              onChange={e => setSendAutoReminders(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-muted peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {/* Days Before Due Input */}
        <div className="space-y-1.5 pt-2">
          <label className="block text-xs font-semibold text-foreground">
            Trigger Days Before Due Date (Comma-separated)
          </label>
          <input
            type="text"
            value={reminderDays}
            onChange={e => setReminderDays(e.target.value)}
            placeholder="e.g. 7, 3, 1"
            className="w-full max-w-xs px-3 py-1.5 font-mono text-xs bg-background border border-border rounded-sm text-foreground focus:outline-hidden"
          />
          <p className="text-[11px] text-muted-foreground">
            For example: `7, 3, 1` will queue WhatsApp reminders 7 days, 3 days, and 1 day prior to the due date.
          </p>
        </div>

        {/* Template Editor */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-foreground">
              WhatsApp Message Template
            </label>
            <div className="text-[10px] text-muted-foreground font-mono">
              Tags: {'{client_name}'}, {'{business_name}'}, {'{plan_name}'}, {'{due_date}'}, {'{amount}'}, {'{payment_link}'}
            </div>
          </div>
          <textarea
            rows={5}
            value={template}
            onChange={e => setTemplate(e.target.value)}
            className="w-full px-3 py-2 font-mono text-xs bg-background border border-border rounded-sm text-foreground focus:outline-hidden"
          />
        </div>

        {/* Live Preview Box */}
        <div className="pt-2">
          <label className="block text-xs font-semibold text-muted-foreground mb-1">
            Live Preview (How client sees on WhatsApp)
          </label>
          <div className="p-3.5 bg-emerald-950/10 dark:bg-emerald-950/30 border border-emerald-500/20 rounded-sm text-xs font-mono whitespace-pre-wrap text-foreground leading-relaxed">
            {previewText}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          className="px-5 py-2 bg-primary text-primary-foreground font-semibold rounded-sm hover:bg-primary/90 transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5 text-xs"
        >
          <Save size={14} />
          <span>Save Automation Settings</span>
        </button>
      </div>
    </form>
  );
};
