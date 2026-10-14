"use client";
import React, { useState } from "react";
import { Search, Download, Globe, Sparkles, FileSpreadsheet } from "lucide-react";
import { exportAuditToPDF, exportTableToExcel } from "@/lib/exportUtils";

export default function ClientDashboard() {
  const [url, setUrl] = useState("hairline.co.in");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("seo");
  const [report, setReport] = useState(null);
  const [userProfile, setUserProfile] = useState({ credits: 6, can_download: false, plan: "free" });

  const handleRunAudit = async () => {
    if (!url) return;
    setLoading(true);
    try {
      const res = await fetch('/api/intel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ targetUrl: url }) });
      const json = await res.json();
      if (json.success) {
        setReport(json.data);
        setUserProfile(prev => ({ ...prev, credits: Math.max(0, prev.credits - 1) }));
      } else {
        alert(json.error || 'Analysis failed');
      }
    } catch (err) {
      alert('Error compiling live intelligence report.');
    } finally { setLoading(false); }
  };

  const handleDownloadPDF = () => {
    if (!userProfile.can_download) return alert('PDF Exports are locked on the Free Tier.');
    exportAuditToPDF(url, report);
  };

  const handleDownloadExcel = () => {
    if (!userProfile.can_download) return alert('Excel Exports are locked on the Free Tier.');
    exportTableToExcel(report?.keyword_research_table || [], `${url}_keywords`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur px-8 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl text-white font-black text-xl tracking-wider">FLYWHEEL</div>
          <span className="text-xs bg-indigo-950 text-indigo-400 border border-indigo-800 px-2.5 py-1 rounded-full font-semibold">Enterprise Intelligence v3.0</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Available Credits</span>
            <span className="text-sm font-bold text-amber-400">{userProfile.credits} Free Runs Remaining</span>
          </div>
          <button className="bg-gradient-to-r from-indigo-500 to-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-lg">Upgrade Plan</button>
        </div>
      </header>

      <section className="bg-slate-900 border-b border-slate-800 py-8 px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
            <input value={url} onChange={e => setUrl(e.target.value)} placeholder="Enter any domain..." className="w-full bg-slate-950 border border-slate-700 pl-12 pr-4 py-3 rounded-xl text-white focus:outline-none text-sm" />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button onClick={handleRunAudit} disabled={loading} className="flex-1 md:flex-initial bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition disabled:opacity-50">{loading ? 'Compiling Intelligence...' : <><Sparkles size={16} /> Analyze URL</>}</button>
            <button onClick={handleDownloadPDF} className="px-4 py-3 rounded-xl font-semibold text-sm border flex items-center gap-2 bg-slate-900 border-slate-800 text-slate-500"><Download size={16} /> PDF</button>
            <button onClick={handleDownloadExcel} className="px-4 py-3 rounded-xl font-semibold text-sm border flex items-center gap-2 bg-slate-900 border-slate-800 text-slate-500"><FileSpreadsheet size={16} /> Excel</button>
          </div>
        </div>

        {report && (
          <div className="max-w-6xl mx-auto flex gap-6 mt-6 border-t border-slate-800 pt-4 text-sm font-semibold">
            {[{ id: 'seo', label: 'SEO Intelligence & Health' }, { id: 'web', label: 'Traffic & Similarweb Benchmarks' }, { id: 'geo', label: 'AI Search (GEO / AEO) Visibility' }, { id: 'keywords', label: '50-100 High-Intent Keyword Matrix' }].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`pb-2 border-b-2 transition ${activeTab === tab.id ? 'border-indigo-500 text-indigo-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>{tab.label}</button>
            ))}
          </div>
        )}
      </section>

      <main className="max-w-6xl mx-auto w-full p-8 flex-1">
        {!report ? (
          <div className="border border-dashed border-slate-800 rounded-3xl p-16 text-center text-slate-500">
            <Globe className="mx-auto mb-4 text-slate-600" size={48} />
            <h3 className="text-lg font-bold text-slate-300">No Target Active</h3>
            <p className="text-sm mt-1">Enter a website URL above to inspect performance, SEO metrics, and AI citations.</p>
          </div>
        ) : (
          <div>
            {activeTab === 'seo' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-center">
                    <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Total SEO Score</span>
                    <div className="text-5xl font-black text-emerald-400 mt-2">{report.seo_intelligence?.overall_score || 0}/100</div>
                    <span className="text-xs text-slate-500 block mt-1">Algorithmic Grade</span>
                  </div>

                  <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-center">
                    <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">On-Page Health</span>
                    <div className="text-4xl font-bold text-indigo-400 mt-2">{report.seo_intelligence?.on_page_score || 0}/100</div>
                    <span className="text-xs text-slate-500 block mt-1">Title, H1-H2 Tags, Schema</span>
                  </div>

                  <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-center">
                    <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Technical Speed</span>
                    <div className="text-4xl font-bold text-cyan-400 mt-2">{report.seo_intelligence?.technical_score || 0}/100</div>
                    <span className="text-xs text-slate-500 block mt-1">LCP: {report.seo_intelligence?.core_web_vitals?.lcp || 'N/A'}</span>
                  </div>

                  <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-center">
                    <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Content Depth</span>
                    <div className="text-4xl font-bold text-amber-400 mt-2">{report.seo_intelligence?.word_count || 0} w</div>
                    <span className="text-xs text-slate-500 block mt-1">Primary Term: "{report.seo_intelligence?.primary_keyword || ''}"</span>
                  </div>
                </div>

                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Live Google Search Preview</h4>
                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 font-sans max-w-2xl">
                    <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                      <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">G</span>
                      <span>https://www.{report.domain}</span>
                    </div>
                    <div className="text-indigo-400 font-medium text-lg leading-snug hover:underline cursor-pointer">{report.seo_intelligence?.serp_title}</div>
                    <div className="text-slate-400 text-xs mt-1.5 leading-relaxed">{report.seo_intelligence?.serp_snippet}</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'web' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                    <span className="text-xs text-slate-400 block font-semibold">Monthly Visits</span>
                    <div className="text-3xl font-extrabold text-white mt-1">{report.overview?.total_monthly_visits?.toLocaleString?.() || 0}</div>
                    <span className="text-xs text-emerald-400 font-bold block mt-1">Bounce Rate: {report.overview?.bounce_rate || 0}%</span>
                  </div>

                  <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                    <span className="text-xs text-slate-400 block font-semibold">Global Rank</span>
                    <div className="text-3xl font-extrabold text-white mt-1">#{report.overview?.global_rank || 0}</div>
                    <span className="text-xs text-indigo-400 font-bold block mt-1">{report.overview?.country || 'N/A'} Rank: #{report.overview?.country_rank || 0}</span>
                  </div>

                  <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                    <span className="text-xs text-slate-400 block font-semibold">Avg Visit Duration</span>
                    <div className="text-3xl font-extrabold text-white mt-1">{report.overview?.avg_visit_duration || '00:00:00'}</div>
                    <span className="text-xs text-slate-400 block mt-1">Pages per visit: {report.overview?.pages_per_visit || 0}</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'geo' && (
              <div className="space-y-6">
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2"><Sparkles className="text-indigo-400" /> Generative Engine Optimization (GEO) Score</h3>
                    <p className="text-slate-400 text-xs mt-1">How AI engines cite this domain.</p>
                  </div>
                  <div className="text-4xl font-black text-indigo-400">{report.ai_search_intelligence?.ai_visibility_score || 0}/100</div>
                </div>
              </div>
            )}

            {activeTab === 'keywords' && (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-200">Expanded Keyword Opportunities (50 Tracked)</h4>
                  <span className="text-xs text-slate-400">Click side arrow for competitor SERP breakdown</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                      <tr>
                        <th className="p-3">#</th>
                        <th className="p-3">Target Keyword</th>
                        <th className="p-3">Monthly Volume</th>
                        <th className="p-3">Difficulty</th>
                        <th className="p-3">Est. CPC</th>
                        <th className="p-3">Intent</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {(report.keyword_research_table || []).map((kw) => (
                        <tr key={kw.id} className="hover:bg-slate-800/40 transition">
                          <td className="p-3 text-slate-500">{kw.id}</td>
                          <td className="p-3 font-semibold text-white">{kw.keyword}</td>
                          <td className="p-3 text-slate-300">{kw.search_volume?.toLocaleString?.() || kw.search_volume}</td>
                          <td className="p-3"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${kw.difficulty > 50 ? 'bg-red-950 text-red-400' : 'bg-emerald-950 text-emerald-400'}`}>{kw.difficulty}/100</span></td>
                          <td className="p-3 text-slate-300">${kw.cpc_usd}</td>
                          <td className="p-3 text-slate-400">{kw.intent}</td>
                          <td className="p-3 text-right"><button className="text-indigo-400 hover:text-indigo-300 p-1">›</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
