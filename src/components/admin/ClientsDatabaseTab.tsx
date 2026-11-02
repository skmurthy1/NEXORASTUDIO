/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  TenantClient,
  ClientStatus,
} from '../../types/admin';
import {
  saveTenantClients,
  exportClientDatabaseJson,
  openWhatsAppReminderWindow,
} from '../../services/adminService';
import {
  Search,
  Filter,
  Eye,
  EyeOff,
  Database,
  ArrowRight,
  Shield,
  Download,
  Send,
  Plus,
  RefreshCw,
  Power,
  Key,
  X,
  CheckCircle,
  Building2,
  Phone,
  FileSpreadsheet,
} from 'lucide-react';

interface ClientsDatabaseTabProps {
  clients: TenantClient[];
  onRefresh: () => void;
  onImpersonateClient?: (client: TenantClient) => void;
}

export const ClientsDatabaseTab: React.FC<ClientsDatabaseTabProps> = ({
  clients,
  onRefresh,
  onImpersonateClient,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ClientStatus>('ALL');
  const [visiblePins, setVisiblePins] = useState<{ [clientId: string]: boolean }>({});
  const [editingClient, setEditingClient] = useState<TenantClient | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Client Form State
  const [newBizName, setNewBizName] = useState('');
  const [newName, setNewName] = useState('');
  const [newMobile, setNewMobile] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newGstin, setNewGstin] = useState('');
  const [newPlan, setNewPlan] = useState('professional');
  const [newPin, setNewPin] = useState('1234');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const togglePinVisibility = (id: string) => {
    setVisiblePins(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleToggleStatus = (client: TenantClient) => {
    const newStatus: ClientStatus = client.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const updated = clients.map(c => (c.id === client.id ? { ...c, status: newStatus } : c));
    saveTenantClients(updated);
    onRefresh();
    showToast(`Status for ${client.businessName} updated to ${newStatus}.`);
  };

  const handleResetPin = (client: TenantClient) => {
    const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
    const updated = clients.map(c => (c.id === client.id ? { ...c, portalPin: randomPin } : c));
    saveTenantClients(updated);
    onRefresh();
    showToast(`Portal PIN for ${client.businessName} reset to: ${randomPin}`);
  };

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBizName.trim() || !newMobile.trim()) return;

    const newClient: TenantClient = {
      id: `cli-${Date.now()}`,
      businessName: newBizName.trim(),
      name: newName.trim() || 'Business Owner',
      mobile: newMobile.trim(),
      email: newEmail.trim() || `${newMobile}@nexorabooks.in`,
      gstin: newGstin.trim().toUpperCase() || undefined,
      portalPin: newPin || '1234',
      role: 'OWNER',
      status: 'ACTIVE',
      planId: newPlan,
      planName: newPlan === 'starter' ? 'Starter Solo' : newPlan === 'enterprise' ? 'Enterprise Cloud' : 'Business Pro',
      amount: newPlan === 'starter' ? 499 : newPlan === 'enterprise' ? 1999 : 999,
      billingCycle: 'MONTHLY',
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      paymentStatus: 'PAID',
      lastLogin: 'Never',
      createdAt: new Date().toISOString().split('T')[0],
      dbStats: {
        ledgersCount: 4,
        vouchersCount: 0,
        stockCount: 0,
        sizeKb: 12,
      },
    };

    saveTenantClients([newClient, ...clients]);
    onRefresh();
    setIsAddModalOpen(false);
    setNewBizName('');
    setNewName('');
    setNewMobile('');
    setNewEmail('');
    setNewGstin('');
    showToast(`Tenant client ${newClient.businessName} created successfully.`);
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch =
      client.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.mobile.includes(searchTerm) ||
      (client.gstin && client.gstin.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || client.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="flex items-center gap-2 p-3 text-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 rounded-sm animate-in fade-in">
          <CheckCircle size={15} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-md border border-border">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-2.5 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by client, business, mobile, or GSTIN..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-background border border-border rounded-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring font-sans"
          />
        </div>

        {/* Status Filter Tabs & Action */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center p-0.5 bg-muted rounded-sm text-xs border border-border">
            {(['ALL', 'ACTIVE', 'TRIAL', 'PENDING', 'INACTIVE'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st as any)}
                className={`px-2.5 py-1 text-xs font-medium rounded-sm transition-colors cursor-pointer ${
                  statusFilter === st
                    ? 'bg-card text-foreground font-semibold shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {st === 'ALL' ? 'All Clients' : st}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-sm hover:bg-primary/90 transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <Plus size={14} /> New Tenant
          </button>
        </div>
      </div>

      {/* Clients Database Table */}
      <div className="bg-card border border-border rounded-md overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-sidebar border-b border-border text-muted-foreground font-semibold">
                <th className="py-2.5 px-3">Business & Owner</th>
                <th className="py-2.5 px-3">Mobile & GSTIN</th>
                <th className="py-2.5 px-3">Portal Credentials</th>
                <th className="py-2.5 px-3">Plan & Due Date</th>
                <th className="py-2.5 px-3 text-right">Database Stats</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    No tenant clients match your search filter.
                  </td>
                </tr>
              ) : (
                filteredClients.map(client => {
                  const isPinVisible = visiblePins[client.id];
                  return (
                    <tr key={client.id} className="hover:bg-muted/40 transition-colors">
                      {/* Business & Owner */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-foreground flex items-center gap-1.5">
                          <Building2 size={13} className="text-primary shrink-0" />
                          <span>{client.businessName}</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          <span>{client.name}</span>
                          <span className="mx-1">·</span>
                          <span className="font-mono text-[10px]">{client.email}</span>
                        </div>
                      </td>

                      {/* Mobile & GSTIN */}
                      <td className="py-3 px-3">
                        <div className="font-mono text-foreground font-medium flex items-center gap-1">
                          <Phone size={12} className="text-muted-foreground" />
                          <span>+91 {client.mobile}</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                          {client.gstin || 'Unregistered'}
                        </div>
                      </td>

                      {/* Portal Credentials */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-muted-foreground">PIN:</span>
                          <span className="font-mono font-bold text-foreground bg-muted px-1.5 py-0.5 rounded-sm border border-border">
                            {isPinVisible ? client.portalPin : '••••'}
                          </span>
                          <button
                            onClick={() => togglePinVisibility(client.id)}
                            className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                            title={isPinVisible ? 'Hide PIN' : 'Reveal PIN'}
                          >
                            {isPinVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                          <button
                            onClick={() => handleResetPin(client)}
                            className="p-1 text-muted-foreground hover:text-primary cursor-pointer"
                            title="Generate New Random PIN"
                          >
                            <RefreshCw size={12} />
                          </button>
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          Role: <span className="font-mono font-semibold">{client.role}</span>
                        </div>
                      </td>

                      {/* Plan & Due Date */}
                      <td className="py-3 px-3">
                        <div className="font-medium text-foreground flex items-center gap-1.5 flex-wrap">
                          <span>{client.planName}</span>
                          {client.recurringMandate?.isRecurring && client.recurringMandate.status === 'ACTIVE' && (
                            <span className="text-[10px] bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30 px-1 py-0.2 rounded-sm font-semibold font-mono">
                              ⚡ AutoPay
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <span>Due:</span>
                          <span className="font-mono">{client.dueDate}</span>
                          <span className="mx-0.5">·</span>
                          <span className={`font-semibold ${client.paymentStatus === 'PAID' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                            {client.paymentStatus}
                          </span>
                        </div>
                      </td>

                      {/* Database Stats */}
                      <td className="py-3 px-3 text-right">
                        <div className="font-mono text-foreground font-medium">
                          {client.dbStats.vouchersCount} vchs · {client.dbStats.ledgersCount} leds
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono">
                          {client.dbStats.sizeKb} KB active
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-sm text-[10px] font-bold border ${
                            client.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                              : client.status === 'TRIAL'
                              ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20'
                              : client.status === 'EXPIRED'
                              ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20'
                              : 'bg-muted text-muted-foreground border-border'
                          }`}
                        >
                          {client.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Impersonate / Access Workspace */}
                          {onImpersonateClient && (
                            <button
                              onClick={() => onImpersonateClient(client)}
                              className="px-2 py-1 bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground font-semibold rounded-sm text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                              title="Directly open and manage client ERP workspace"
                            >
                              <span>Enter</span>
                              <ArrowRight size={12} />
                            </button>
                          )}

                          {/* Toggle Active / Inactive */}
                          <button
                            onClick={() => handleToggleStatus(client)}
                            className={`p-1.5 rounded-sm border cursor-pointer transition-colors ${
                              client.status === 'ACTIVE'
                                ? 'text-rose-600 hover:bg-rose-500/10 border-border'
                                : 'text-emerald-600 hover:bg-emerald-500/10 border-border'
                            }`}
                            title={client.status === 'ACTIVE' ? 'Suspend Client' : 'Activate Client'}
                          >
                            <Power size={13} />
                          </button>

                          {/* Export Client Backup */}
                          <button
                            onClick={() => exportClientDatabaseJson(client)}
                            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted border border-border rounded-sm cursor-pointer transition-colors"
                            title="Download Encrypted Tenant JSON Snapshot"
                          >
                            <Download size={13} />
                          </button>

                          {/* Send WhatsApp Notice */}
                          <button
                            onClick={() => openWhatsAppReminderWindow(client)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-500/10 border border-border rounded-sm cursor-pointer transition-colors"
                            title="Send Direct WhatsApp Message"
                          >
                            <Send size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Client Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none">
          <div className="bg-card text-card-foreground rounded-md border border-border shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Database size={18} className="text-primary" />
                <h3 className="font-serif font-bold text-base text-foreground">Provision New Tenant Client</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-sm hover:bg-muted cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-3 text-xs">
              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Business Name *</label>
                <input
                  type="text"
                  required
                  value={newBizName}
                  onChange={e => setNewBizName(e.target.value)}
                  placeholder="e.g. Apex Engineering & Traders"
                  className="w-full px-3 py-2 bg-background border border-border rounded-sm text-foreground focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Owner Name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="e.g. Ramesh Patel"
                    className="w-full px-3 py-2 bg-background border border-border rounded-sm text-foreground focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Mobile (+91) *</label>
                  <input
                    type="tel"
                    required
                    value={newMobile}
                    onChange={e => setNewMobile(e.target.value)}
                    placeholder="e.g. 9820011223"
                    className="w-full px-3 py-2 font-mono bg-background border border-border rounded-sm text-foreground focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">GSTIN (Optional)</label>
                  <input
                    type="text"
                    value={newGstin}
                    onChange={e => setNewGstin(e.target.value)}
                    placeholder="27ABCDE1234F1Z5"
                    className="w-full px-3 py-2 font-mono uppercase bg-background border border-border rounded-sm text-foreground focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Portal PIN</label>
                  <input
                    type="text"
                    value={newPin}
                    onChange={e => setNewPin(e.target.value)}
                    placeholder="4-digit PIN"
                    className="w-full px-3 py-2 font-mono bg-background border border-border rounded-sm text-foreground focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Initial Plan</label>
                <select
                  value={newPlan}
                  onChange={e => setNewPlan(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-sm text-foreground focus:outline-hidden cursor-pointer"
                >
                  <option value="starter">Starter Solo (₹499/mo)</option>
                  <option value="professional">Business Pro (₹999/mo)</option>
                  <option value="enterprise">Enterprise Cloud (₹1,999/mo)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2 border border-border hover:bg-muted rounded-sm font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-primary text-primary-foreground font-semibold rounded-sm hover:bg-primary/90 shadow-2xs cursor-pointer"
                >
                  Create Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
