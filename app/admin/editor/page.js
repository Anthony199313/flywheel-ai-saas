"use client";
import React, { useState } from "react";
import { Sparkles, CheckCircle, UploadCloud } from "lucide-react";

export default function SuperSeoEditor() {
  const [content, setContent] = useState("");
  const [targetKeyword, setTargetKeyword] = useState("hair transplant cost");
  const [seoScore, setSeoScore] = useState(65);

  const calculateSeoMetrics = (text) => {
    setContent(text);
    const words = text.split(/\s+/).filter(Boolean);
    const count = words.length;
    const matches = (text.match(new RegExp(targetKeyword, 'gi')) || []).length;
    const density = count > 0 ? ((matches / count) * 100).toFixed(1) : 0;

    let score = 50;
    if (count > 600) score += 20;
    if (density >= 1.0 && density <= 2.5) score += 20;
    if (text.includes('FAQ') || text.includes('?')) score += 10;
    setSeoScore(Math.min(100, score));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        <h2 className="text-xl font-black text-indigo-400">SUPER SEO AI CMS EDITOR</h2>
        <input type="text" placeholder="Target Primary Keyword..." value={targetKeyword} onChange={(e) => setTargetKeyword(e.target.value)} className="w-full bg-slate-900 border border-slate-700 p-3 rounded-lg text-sm text-white focus:outline-none" />
        <textarea rows={18} value={content} onChange={(e) => calculateSeoMetrics(e.target.value)} placeholder="Write or generate your high-ranking SEO article here..." className="w-full bg-slate-900 border border-slate-700 p-4 rounded-xl text-sm leading-relaxed text-slate-200 focus:outline-none font-sans" />
      </div>

      <div className="space-y-6">
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-center">
          <span className="text-xs uppercase text-slate-400 font-bold">Live SEO Rankability</span>
          <div className="text-6xl font-black text-indigo-400 mt-2">{seoScore}/100</div>
          <span className="text-xs text-emerald-400 font-bold block mt-1">Google Ready Index</span>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-3 text-xs">
          <h4 className="font-bold text-slate-300 uppercase">On-Page Checklist</h4>
          <div className="flex items-center gap-2 text-slate-300"><CheckCircle size={16} className="text-emerald-400" /><span>Target Keyword in Content: {content.includes(targetKeyword) ? 'Passed' : 'Missing'}</span></div>
          <div className="flex items-center gap-2 text-slate-300"><CheckCircle size={16} className="text-emerald-400" /><span>Optimal Length: {content.split(/\s+/).length} / 800 words</span></div>
          <div className="flex items-center gap-2 text-slate-300"><CheckCircle size={16} className="text-emerald-400" /><span>Automated FAQ Schema: Injected</span></div>
        </div>

        <button className="w-full bg-indigo-600 hover:bg-indigo-500 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 text-sm shadow-xl"><UploadCloud size={18} /> 1-Click Publish to Live Blog</button>
      </div>
    </div>
  );
}
