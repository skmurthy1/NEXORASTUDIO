/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Users,
  Building,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  UserPlus,
  Mail,
  Phone,
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { CAClient, CAStaff } from '../../types/erp';

export const CaFirmPortalView: React.FC = () => {
  const { caClients, caStaff, switchCompany, companies } = useErp();
  const [activeTab, setActiveTab] = useState<'CLIENTS' | 'STAFF'>('CLIENTS');

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs">
            <span className="uppercase tracking-wider font-semibold text-muted-foreground">
              Practitioner Workspace
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="text-primary font-bold font-mono">
              CA Firm Multi-Entity Mode
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-foreground">
            Chartered Accountant Multi-Client Portal
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('STAFF')}
            className="px-3 py-1.5 text-xs font-medium bg-card hover:bg-accent text-foreground rounded-sm border border-border transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <UserPlus size={13} /> Invite Auditor Staff
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-sm w-fit text-xs border border-border">
        <button
          onClick={() => setActiveTab('CLIENTS')}
          className={`px-3 py-1.5 font-medium rounded-sm transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'CLIENTS'
              ? 'bg-card text-foreground font-semibold shadow-2xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Building size={13} /> Client Businesses ({caClients.length})
        </button>
        <button
          onClick={() => setActiveTab('STAFF')}
          className={`px-3 py-1.5 font-medium rounded-sm transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'STAFF'
              ? 'bg-card text-foreground font-semibold shadow-2xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Users size={13} /> Audit Staff & Roles ({caStaff.length})
        </button>
      </div>

      {/* Clients Overview Table */}
      {activeTab === 'CLIENTS' && (
        <div className="bg-card rounded-sm border border-border shadow-2xs overflow-hidden">
          <div className="p-3.5 px-4 border-b border-border bg-muted/40 flex justify-between items-center text-xs">
            <span className="font-semibold text-foreground">Assigned Client Compliance Dashboard</span>
            <span className="text-muted-foreground">Period: June 2026 (Q1)</span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-muted/60 text-muted-foreground font-semibold border-b border-border text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Client Business</th>
                <th className="py-2.5 px-3">GSTIN</th>
                <th className="py-2.5 px-3">Contact Person</th>
                <th className="py-2.5 px-3">Assigned Staff</th>
                <th className="py-2.5 px-2 text-center">GSTR-1 Status</th>
                <th className="py-2.5 px-2 text-center">GSTR-3B Status</th>
                <th className="py-2.5 px-3 text-right">Turnover (FY)</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {caClients.map(client => (
                <tr key={client.id} className="hover:bg-muted/40 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-foreground">{client.companyName}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-primary">{client.gstin}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">
                    <div className="text-foreground">{client.contactPerson}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">{client.phone}</div>
                  </td>
                  <td className="py-2.5 px-3 text-foreground font-medium">{client.assignedStaff}</td>
                  <td className="py-2.5 px-2 text-center">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-xs ${
                        client.gstr1Status === 'FILED'
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                      }`}
                    >
                      {client.gstr1Status}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-xs ${
                        client.gstr3bStatus === 'FILED'
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                      }`}
                    >
                      {client.gstr3bStatus}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">
                    ₹{client.turnoverCurrentYear.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => {
                        const target = companies.find(c => c.gstin === client.gstin);
                        if (target) switchCompany(target.id);
                      }}
                      className="px-2.5 py-1 bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-[11px] rounded-sm transition-colors flex items-center gap-1 ml-auto cursor-pointer shadow-2xs"
                    >
                      <span>Open Books</span>
                      <ArrowRight size={11} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Staff Management Cards */}
      {activeTab === 'STAFF' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {caStaff.map(member => (
            <div key={member.id} className="bg-card p-4 rounded-sm border border-border shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-xs border border-primary/20">
                  {member.role.replace(/_/g, ' ')}
                </span>
                <span className="text-xs font-mono text-muted-foreground">{member.assignedClientCount} Clients</span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground">{member.name}</h3>
                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                  <Mail size={12} /> {member.email}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5 font-mono">
                  <Phone size={12} /> {member.phone}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
