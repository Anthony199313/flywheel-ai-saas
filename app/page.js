"use client";
import React, { useState } from "react";
import { Sparkles, ArrowRight, MessageSquare, X, Send } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'Hi! Welcome to Flywheel AI. Enter your website URL to see your live SEO and competitor traffic benchmarks!' }]);
  const [inputMessage, setInputMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const handleSendMessage = async () => {
    if (!inputMessage) return;
    const newHistory = [...messages, { role: 'user', content: inputMessage }];
    setMessages(newHistory);
    setInputMessage('');

    try {
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: newHistory, userContact: userEmail ? { email: userEmail, interest: 'Landing Page Inquirer' } : null }) });
      const data = await res.json();
      if (data.success) setMessages([...newHistory, { role: 'assistant', content: data.reply }]);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      <header className="max-w-5xl mx-auto text-center pt-24 pb-16 px-6">
        <span className="text-xs font-bold uppercase tracking-widest bg-indigo-950 text-indigo-400 border border-indigo-800 px-3 py-1.5 rounded-full">The All-in-One Growth Platform</span>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight mt-6 leading-tight">Outrank Competitors with <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">AI Digital Intelligence</span></h1>
        <p className="text-slate-400 text-lg md:text-xl mt-6 max-w-2xl mx-auto">One unified platform combining Similarweb traffic benchmarks, Planet Flywheel SEO audits, and generative AI search visibility.</p>

        <div className="mt-10 flex justify-center gap-4">
          <Link href="/app" className="bg-indigo-600 hover:bg-indigo-500 font-bold px-8 py-4 rounded-xl flex items-center gap-2 text-base transition shadow-xl">Launch Free Audit <ArrowRight size={18} /></Link>
          <button onClick={() => setChatOpen(true)} className="bg-slate-900 border border-slate-700 hover:bg-slate-800 font-bold px-8 py-4 rounded-xl text-base transition">Talk to AI Strategist</button>
        </div>
      </header>

      <div className="fixed bottom-6 right-6 z-50">
        {!chatOpen ? (
          <button onClick={() => setChatOpen(true)} className="bg-indigo-600 hover:bg-indigo-500 p-4 rounded-full shadow-2xl text-white flex items-center gap-2 transition"><MessageSquare size={24} /><span className="text-xs font-bold pr-1">Get Free Competitor Audit</span></button>
        ) : (
          <div className="bg-slate-900 border border-slate-800 w-80 md:w-96 rounded-2xl shadow-2xl flex flex-col h-[480px] overflow-hidden">
            <div className="bg-indigo-600 p-4 flex justify-between items-center text-white font-bold text-sm"><span className="flex items-center gap-2"><Sparkles size={16} /> Flywheel Growth Strategist</span><button onClick={() => setChatOpen(false)}><X size={18} /></button></div>
            <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">{messages.map((m,i) => (<div key={i} className={`p-3 rounded-xl max-w-[85%] ${m.role === 'assistant' ? 'bg-slate-800 text-slate-200' : 'bg-indigo-600 text-white ml-auto'}`}>{m.content}</div>))}</div>
            <div className="px-4 py-2 bg-slate-950 border-t border-slate-800"><input type="email" placeholder="Enter email to save audit..." value={userEmail} onChange={e => setUserEmail(e.target.value)} className="w-full bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg text-xs text-white focus:outline-none" /></div>
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2"><input type="text" placeholder="Type your message..." value={inputMessage} onChange={e => setInputMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} className="flex-1 bg-slate-900 border border-slate-700 px-3 py-2 rounded-lg text-xs text-white focus:outline-none" /><button onClick={handleSendMessage} className="bg-indigo-600 p-2 rounded-lg text-white"><Send size={16} /></button></div>
          </div>
        )}
      </div>
    </div>
  );
}
