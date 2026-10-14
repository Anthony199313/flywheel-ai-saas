"use client";
import React, { useState, useEffect } from "react";
import { MessageSquare, Shield, ToggleLeft, ToggleRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminHub() {
  const [activeTab, setActiveTab] = useState("leads");
  const [leads, setLeads] = useState([]);
  const [services, setServices] = useState([
    { key: "marketplace_intel", name: "Marketplace Listing Optimizer", enabled: true },
    { key: "creative_studio", name: "AI Video & Image Studio", enabled: true },
    { key: "geo_intel", name: "AEO / GEO Search Engine", enabled: true }
  ]);

  useEffect(() => {
    async function loadAdminData() {
      const { data: leadsData } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
      if (leadsData) setLeads(leadsData);
    }
    loadAdminData();
  }, []);

  const toggleService = (key) => setServices(prev => prev.map(s => s.key === key ? { ...s, enabled: !s.enabled } : s));

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <header className="flex justify-between items-center mb-8 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-indigo-400">ADMIN CONTROL HUB</h1>
          <p className="text-xs text-slate-400">Manage clients, captured leads, and system feature flags.</p>
        </div>
        <div className="flex gap-2">
          {['leads','clients','features'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition ${activeTab === t ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400'}`}>{t}</button>
          ))}
        </div>
      </header>

      {activeTab === 'leads' && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><MessageSquare size={16} className="text-indigo-400" /> Chatbot Captured Growth Leads</h3>
          <div className="divide-y divide-slate-800 text-xs">
            {leads.length === 0 ? <p className="text-slate-500 py-4">No leads captured yet.</p> : leads.map(lead => (
              <div key={lead.id} className="py-3 flex justify-between items-center">
                <div>
                  <span className="font-bold text-white text-sm">{lead.name}</span>
                  <span className="text-slate-400 block">{lead.email} | {lead.phone || 'No Phone'}</span>
                </div>
                <span className="bg-indigo-950 text-indigo-400 border border-indigo-800 px-3 py-1 rounded-full font-bold">{lead.interest}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'features' && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 max-w-xl">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><Shield size={16} className="text-indigo-400" /> Live Platform Feature Toggles</h3>
          <div className="space-y-4">
            {services.map(s => (
              <div key={s.key} className="flex justify-between items-center bg-slate-950 p-4 rounded-lg border border-slate-800">
                <span className="text-sm font-semibold">{s.name}</span>
                <button onClick={() => toggleService(s.key)}>
                  {s.enabled ? <ToggleRight size={32} className="text-emerald-400" /> : <ToggleLeft size={32} className="text-slate-600" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
