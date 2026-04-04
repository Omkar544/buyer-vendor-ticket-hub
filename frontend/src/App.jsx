import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  Ticket, Activity, ChevronDown, ChevronUp, Mail, LogOut,
  User, Paperclip, ExternalLink, ShieldCheck, CheckCircle2,
  UserCog, Heart, BarChart3, Info, RefreshCw, LayoutDashboard, Loader2, Clock
} from 'lucide-react';

import CreateTicket from './components/CreateTicket';
import Auth from "./components/Auth";

const API_BASE = "http://127.0.0.1:8000";

// -------------------- TICKET CARD COMPONENT (FIXED: Display Resolution for Buyers) --------------------
function TicketCard({ t, onTicketUpdated, role }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [resNotes, setResNotes] = useState('');
  const [resFile, setResFile] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleResolve = async () => {
    if (!resNotes) return alert("Please provide resolution details.");
    setIsUpdating(true);
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('resolution_notes', resNotes);
    if (resFile) formData.append('resolution_proof', resFile);

    try {
      await axios.post(`${API_BASE}/api/tickets/${t.id}/resolve_ticket/`, formData, {
        headers: { Authorization: `Token ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      onTicketUpdated();
      setResFile(null);
      setIsExpanded(false);
    } catch (err) {
      alert("Resolution failed.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={`bg-white rounded-[2.5rem] border-2 transition-all duration-500 overflow-hidden 
    ${isExpanded ? 'border-blue-500 shadow-2xl scale-[1.01]' : 'border-slate-200 hover:border-blue-400 hover:shadow-xl'}
    ${t.status === 'RESOLVED' ? 'bg-slate-50/50' : ''}`}>
      
      <div className="p-6 md:p-10 space-y-6">
        
        {/* User Identity Section */}
        <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-5">
          <div className="space-y-2">
            <span className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.1em] text-slate-500">
              <User size={16} className="text-blue-500"/> {t.buyer_name}
            </span>
            <span className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.1em] text-slate-700">
              <UserCog size={16} className="text-blue-600"/> {t.vendor_name}
            </span>
          </div>
          <span className="text-blue-600 bg-blue-50 px-4 py-1.5 rounded-2xl font-black text-xs tracking-widest shadow-sm">ID: #{t.id}</span>
        </div>

        <div className="flex justify-between items-center">
           <span className="bg-slate-900 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em]">{t.category_display}</span>
           <span className={`text-[10px] font-black uppercase tracking-widest ${t.priority === 'HIGH' ? 'text-red-500' : 'text-emerald-600'}`}>
             {t.priority_display}
           </span>
        </div>

        {/* Title */}
        <h3 className="font-black text-slate-900 text-2xl md:text-3xl leading-tight tracking-tighter uppercase italic line-clamp-2">
          {t.title}
        </h3>
        
        <div className="flex items-center gap-2 text-xs text-blue-600 font-black opacity-80 truncate border-l-4 border-blue-600 pl-3">
          <Mail size={14}/> {t.buyer_email}
        </div>

        {/* Timestamps Section */}
        <div className="space-y-3 bg-slate-50/80 p-5 rounded-[1.5rem] border border-slate-100">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span className="flex items-center gap-2"><Clock size={14}/> Created</span>
                <span className="text-slate-900">{t.created_at_display}</span>
            </div>
            {t.status === 'RESOLVED' && (
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-emerald-600 border-t border-slate-200/50 pt-2">
                  <span className="flex items-center gap-2"><CheckCircle2 size={14}/> Resolved</span>
                  <span className="font-black">{t.resolved_at_display}</span>
              </div>
            )}
        </div>

        <button onClick={() => setIsExpanded(!isExpanded)} className="w-full text-blue-600 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white py-4 rounded-2xl transition-all border-2 border-blue-600 shadow-lg shadow-blue-50">
          {isExpanded ? 'Minimize Record' : 'Full Review'} <ChevronDown size={18} className={isExpanded ? 'rotate-180' : ''}/>
        </button>

        {isExpanded && (
          <div className="space-y-6 pt-6 animate-in fade-in slide-in-from-top-2">
            <div className="bg-white p-6 rounded-2xl border-l-8 border-blue-600 shadow-inner">
               <p className="text-base text-slate-700 leading-relaxed font-bold italic">"{t.description}"</p>
            </div>

            {/* RESOLUTION RECORD (Visible to Buyer and Vendor when Resolved) */}
            {t.status === 'RESOLVED' && (
              <div className="space-y-4 bg-emerald-50 p-6 rounded-[2rem] border-2 border-emerald-100 shadow-inner">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                  <ShieldCheck size={16}/> Official Resolution Record
                </h4>
                <div className="bg-white p-5 rounded-2xl border border-emerald-200">
                  <p className="text-sm text-slate-800 font-bold italic leading-relaxed">
                    "{t.resolution_notes || "No resolution details provided."}"
                  </p>
                </div>
                {t.resolution_proof && (
                  <a href={t.resolution_proof} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all text-xs font-black uppercase group">
                    <span className="flex items-center gap-3"><Paperclip size={18}/> Review Resolution Proof</span>
                    <ExternalLink size={18} className="group-hover:translate-x-1 transition-transform"/>
                  </a>
                )}
              </div>
            )}

            {t.issue_proof && (
              <a href={t.issue_proof} target="_blank" rel="noreferrer" className="flex items-center justify-between p-5 bg-blue-50 border-2 border-blue-100 rounded-2xl hover:bg-blue-600 hover:text-white transition-all text-blue-600 font-black text-xs uppercase group">
                <span className="flex items-center gap-3"><Paperclip size={18}/> Review Buyer Attachment</span>
                <ExternalLink size={18} className="group-hover:translate-x-1 transition-transform"/>
              </a>
            )}

            {role === 'VENDOR' && t.status === 'OPEN' && (
              <div className="space-y-4 mt-6 bg-slate-900 p-8 rounded-[2rem] text-white">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-400">Resolution Console</h4>
                <textarea placeholder="Provide detailed resolution notes..." className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-blue-500/30 text-white placeholder:text-slate-500 resize-none h-32" onChange={(e) => setResNotes(e.target.value)} />
                <input type="file" onChange={(e) => setResFile(e.target.files[0])} className="text-[10px] text-slate-400 w-full cursor-pointer" />
                <button onClick={handleResolve} disabled={isUpdating} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-blue-700 transition-all active:scale-95">
                  {isUpdating ? <Loader2 className="animate-spin mx-auto" size={20}/> : 'Commit Resolution'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// -------------------- MAIN APP COMPONENT --------------------
export default function App() {
  const [role, setRole] = useState(localStorage.getItem('role') || null);
  const [category, setCategory] = useState(localStorage.getItem('category') || '');
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [buyerSubView, setBuyerSubView] = useState('NEW');
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTickets = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setIsLoading(true);
    axios.get(`${API_BASE}/api/tickets/`, { headers: { Authorization: `Token ${token}` } })
      .then(res => setTickets(res.data))
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const currentRole = localStorage.getItem('role');
    if (currentRole === 'VENDOR' || currentRole === 'ADMIN') setBuyerSubView('HISTORY');
    if (isLoggedIn) fetchTickets();
  }, [isLoggedIn, fetchTickets]);

  const handleAuthSuccess = (username, isStaff, userCategory, isSuperuser) => {
    const userRole = isSuperuser ? 'ADMIN' : isStaff ? 'VENDOR' : 'BUYER';
    localStorage.setItem('role', userRole);
    localStorage.setItem('category', userCategory || '');
    setRole(userRole);
    setCategory(userCategory || '');
    setIsLoggedIn(true);
    setBuyerSubView(userRole === 'BUYER' ? 'NEW' : 'HISTORY');
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setRole(null);
    setTickets([]);
  };

  const getSafeFileName = (name) => {
    if (!name) return 'vendor';
    return name.toLowerCase().replace('agent:', '').trim().replace(/\s+/g, '_');
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] font-sans text-slate-900 flex flex-col">
      <nav className="bg-white/80 backdrop-blur-md border-b px-4 md:px-12 py-5 flex flex-col md:flex-row justify-between items-center sticky top-0 z-50 gap-4 md:gap-0 shadow-sm">
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="bg-blue-600 p-2.5 rounded-[1.25rem] text-white shadow-xl group-hover:rotate-12 transition-all duration-500"><Ticket size={28}/></div>
          <span className="font-black text-3xl tracking-tighter uppercase italic">TicketHub <span className="text-blue-600">Pro</span></span>
        </div>
        {isLoggedIn && (
          <div className="flex items-center gap-4 lg:gap-8">
            {role === 'BUYER' && (
              <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                <button onClick={() => setBuyerSubView('NEW')} className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${buyerSubView === 'NEW' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>New</button>
                <button onClick={() => setBuyerSubView('HISTORY')} className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${buyerSubView === 'HISTORY' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>History</button>
              </div>
            )}
            <span className={`text-xs font-black px-6 py-3 rounded-2xl uppercase tracking-[0.2em] border shadow-sm ${role === 'ADMIN' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-900 text-white border-slate-800'}`}>
              {role === 'ADMIN' ? 'Full Oversight' : `${category} Controller`}
            </span>
            <button onClick={handleLogout} className="group p-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all duration-300"><LogOut size={22}/></button>
          </div>
        )}
      </nav>

      <main className="flex-grow flex flex-col w-full max-w-[1850px] mx-auto">
        {!isLoggedIn ? (
          <div className="flex-grow flex items-center justify-center p-6 animate-in zoom-in-95 duration-700"><Auth onAuthSuccess={handleAuthSuccess}/></div>
        ) : (
          <div className="p-6 md:p-12 space-y-16">
            <div className={`p-10 md:p-16 rounded-[4rem] border transition-all duration-700 shadow-2xl ${role === 'ADMIN' ? 'bg-red-600 text-white shadow-red-100' : role === 'VENDOR' ? 'bg-slate-900 text-white shadow-slate-200' : 'bg-white border-slate-200 shadow-slate-100'}`}>
              <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                <div className="space-y-4 text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-4 text-xs font-black uppercase tracking-[0.5em] opacity-60"><ShieldCheck size={20}/> Encrypted Master Feed</div>
                  <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] uppercase italic">{role} DASHBOARD</h1>
                  <p className="text-sm md:text-xl font-bold opacity-70 tracking-tight leading-relaxed max-w-4xl">{role === 'ADMIN' ? "System Master: Monitoring global ticket flow, volume metrics, and high-priority escalations." : role === 'VENDOR' ? `Expert View: Resolving ${category} requests. Maintain SLA metrics via the analytics console.` : "Buyer Pipeline: Securely submit new technical records for agent review."}</p>
                </div>
                <button onClick={fetchTickets} className="p-10 bg-white/10 hover:bg-white/20 backdrop-blur-3xl rounded-full border border-white/10 transition-all active:scale-90"><RefreshCw size={48} className={isLoading ? "animate-spin" : ""}/></button>
              </div>
            </div>

            {role === 'BUYER' && buyerSubView === 'NEW' ? (
              <div className="max-w-4xl mx-auto py-12">
                <CreateTicket onTicketAdded={() => setBuyerSubView('HISTORY')} />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                {(role === 'VENDOR' || role === 'ADMIN') && (
                  <div className="lg:col-span-5 xl:col-span-5 space-y-12">
                    <div className="lg:sticky lg:top-36 space-y-12">
                      <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-2xl shadow-slate-100 transition-all hover:border-blue-400">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-10 flex items-center justify-between">Volume Analytics <BarChart3 size={24} className="text-blue-600"/></h3>
                        <img 
                          src={`${API_BASE}/static/reports/${role === 'ADMIN' ? 'global_analytics' : getSafeFileName(category) + '_priority'}.png?v=${Date.now()}`} 
                          className="w-full rounded-[2.5rem] border-4 border-slate-50 p-2 shadow-inner transition-transform hover:scale-[1.03] duration-500" alt="Master Stats"
                          onError={(e) => e.target.src = 'https://placehold.co/800x600/f1f5f9/94a3b8?text=Syncing+Records...'}
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                <div className={`${(role === 'VENDOR' || role === 'ADMIN') ? 'lg:col-span-7 xl:col-span-7' : 'lg:col-span-12'} space-y-10`}>
                  <div className="flex items-end justify-between border-b-4 border-slate-100 pb-6">
                    <div className="space-y-1"><h2 className="text-4xl font-black tracking-tighter uppercase italic">Active Queue</h2><p className="text-[12px] font-black text-blue-600 uppercase tracking-[0.4em]">Processing {tickets.length} Master Points</p></div>
                    <div className="flex gap-4 items-center"><div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Feed Secure</span></div>
                  </div>
                  <div className={`grid gap-10 ${ (role === 'VENDOR' || role === 'ADMIN') ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'}`}>
                    {tickets.length > 0 ? tickets.map(t => <TicketCard key={t.id} t={t} onTicketUpdated={fetchTickets} role={role} />) : 
                    <div className="col-span-full py-52 text-center border-8 border-dashed rounded-[5rem] border-slate-50 flex flex-col items-center justify-center gap-6 bg-slate-50/30">
                        <CheckCircle2 size={80} className="text-slate-200"/>
                        <p className="text-base font-black text-slate-300 uppercase tracking-[0.5em]">Queue Synchronized</p>
                    </div>}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="bg-white border-t-2 border-slate-100 mt-auto py-20 px-12 w-full">
        <div className="max-w-[1800px] mx-auto flex flex-col lg:flex-row justify-between items-center gap-16">
          <div className="space-y-3 text-center lg:text-left">
            <span className="font-black text-4xl tracking-tighter italic uppercase">TicketHub <span className="text-blue-600">Pro</span></span>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.4em]">Enterprise v3.0 Master Engine • Ichalkaranji, MH</p>
          </div>
          <div className="bg-slate-900 text-white px-12 py-6 rounded-[3rem] shadow-2xl shadow-slate-200 flex items-center gap-5 transition-transform hover:scale-105 duration-500">
            <div className="p-3 bg-blue-600 rounded-2xl"><Heart size={24} fill="white"/></div>
            <div className="text-left"><p className="text-[10px] font-black opacity-50 uppercase tracking-widest mb-1">Architect & Engineer</p><p className="text-lg font-black tracking-widest uppercase">Omkar Amit Gore</p></div>
          </div>
        </div>
      </footer>
    </div>
  );
}