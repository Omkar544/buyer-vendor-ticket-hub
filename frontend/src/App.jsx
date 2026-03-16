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

// -------------------- TICKET CARD COMPONENT --------------------
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
    <div className={`bg-white rounded-[3rem] border-4 transition-all duration-500 overflow-hidden 
    ${isExpanded ? 'border-blue-500 shadow-2xl scale-[1.02]' : 'border-slate-200 hover:border-blue-400 hover:shadow-2xl'}
    ${t.status === 'RESOLVED' ? 'bg-slate-50/50' : ''}`}>
      
      <div className="p-10 md:p-14 space-y-10">
        <div className="flex justify-between items-start mb-6 border-b-4 border-slate-100 pb-8">
          <div className="space-y-4">
            <span className="flex items-center gap-4 text-xl font-black uppercase tracking-widest text-slate-500">
              <User size={24} className="text-blue-500"/> {t.buyer_name}
            </span>
            <span className="flex items-center gap-4 text-2xl font-black uppercase tracking-widest text-slate-800">
              <UserCog size={28} className="text-blue-600"/> 
              {t.vendor_name || t.category_display || "PENDING"}
            </span>
          </div>
          
          <div className="flex flex-col items-end gap-4">
            <span className={`px-8 py-3 rounded-3xl font-black text-lg tracking-[0.2em] border-4 shadow-md ${
              t.status === 'RESOLVED' 
              ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
              : 'bg-blue-50 text-blue-600 border-blue-200 animate-pulse'
            }`}>
              {t.status === 'RESOLVED' ? '✅ CLOSED' : '⏳ OPEN'}
            </span>
            <span className="text-slate-400 font-black text-lg tracking-widest opacity-60">ID: #{t.id}</span>
          </div>
        </div>

        <div className="space-y-6">
           <div className="flex justify-between items-center">
              <span className="bg-slate-900 text-white px-6 py-2 rounded-2xl text-sm font-black uppercase tracking-[0.3em] italic">{t.category_display}</span>
              <span className={`text-sm font-black uppercase tracking-[0.3em] ${t.priority === 'HIGH' ? 'text-red-500 underline decoration-4 underline-offset-8' : 'text-emerald-600'}`}>{t.priority_display}</span>
           </div>
           <h3 className="font-black text-slate-900 text-4xl md:text-6xl leading-[0.95] tracking-tighter uppercase italic break-words">{t.title}</h3>
           <div className="flex items-center gap-4 text-lg text-blue-600 font-black opacity-90 truncate border-l-8 border-blue-600 pl-6 py-2">
             <Mail size={22}/> {t.buyer_email}
           </div>
        </div>

        <div className="space-y-4 bg-slate-100/80 p-8 rounded-[2.5rem] border-2 border-slate-200">
            <div className="flex items-center justify-between text-base font-black uppercase tracking-widest text-slate-500">
                <span className="flex items-center gap-3"><Clock size={20}/> LOGGED ON</span>
                <span className="text-slate-900 font-black">{t.created_at_display}</span>
            </div>
            {t.status === 'RESOLVED' && (
              <div className="flex items-center justify-between text-base font-black uppercase tracking-widest text-emerald-600 border-t-2 border-slate-200 pt-4">
                  <span className="flex items-center gap-3"><CheckCircle2 size={20}/> RESOLVED ON</span>
                  <span className="font-black">{t.resolved_at_display}</span>
              </div>
            )}
        </div>

        <button onClick={() => setIsExpanded(!isExpanded)} className="w-full bg-blue-600 text-white text-lg font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 py-8 rounded-[2.5rem] transition-all hover:bg-slate-900 shadow-xl active:scale-95">
          {isExpanded ? 'Minimize View' : 'Execute Review'} <ChevronDown size={32} className={isExpanded ? 'rotate-180' : ''}/>
        </button>

        {isExpanded && (
          <div className="space-y-8 pt-8 animate-in fade-in slide-in-from-top-4">
            <div className="bg-white p-10 rounded-[3rem] border-l-[16px] border-blue-600 shadow-inner">
               <p className="text-2xl text-slate-700 leading-tight font-bold italic">"{t.description}"</p>
            </div>
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
      {/* NAVBAR: Always Displayed when Logged In */}
      {isLoggedIn && (
        <nav className="bg-white/80 backdrop-blur-md border-b px-6 md:px-12 py-6 flex flex-col md:flex-row justify-between items-center sticky top-0 z-50 gap-4 md:gap-0 shadow-sm">
          <div className="flex items-center gap-6 group cursor-pointer">
            <div className="bg-blue-600 p-3 rounded-[1.5rem] text-white shadow-xl group-hover:rotate-12 transition-all duration-500"><Ticket size={32}/></div>
            <span className="font-black text-4xl tracking-tighter uppercase italic">TicketHub <span className="text-blue-600">Pro</span></span>
          </div>
          <div className="flex items-center gap-6 lg:gap-10">
            {role === 'BUYER' && (
              <div className="flex bg-slate-100 p-2 rounded-[1.5rem] border border-slate-200">
                <button onClick={() => setBuyerSubView('NEW')} className={`px-10 py-3 rounded-2xl text-sm font-black uppercase transition-all ${buyerSubView === 'NEW' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500'}`}>New</button>
                <button onClick={() => setBuyerSubView('HISTORY')} className={`px-10 py-3 rounded-2xl text-sm font-black uppercase transition-all ${buyerSubView === 'HISTORY' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500'}`}>History</button>
              </div>
            )}
            <span className={`text-sm font-black px-8 py-4 rounded-[1.5rem] uppercase tracking-[0.2em] border shadow-md ${role === 'ADMIN' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-900 text-white border-slate-800'}`}>
              {role === 'ADMIN' ? 'Full Oversight' : `${category} Controller`}
            </span>
            <button onClick={handleLogout} className="group p-4 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all duration-300 shadow-sm"><LogOut size={26}/></button>
          </div>
        </nav>
      )}

      <main className="flex-grow flex flex-col w-full max-w-[1850px] mx-auto">
        {!isLoggedIn ? (
          <div className="flex-grow flex items-center justify-center p-6 animate-in zoom-in-95 duration-700"><Auth onAuthSuccess={handleAuthSuccess}/></div>
        ) : (
          <div className="p-8 md:p-14 space-y-12">
            
            {/* Dashboard Header: Only hidden when creating a new ticket */}
            {buyerSubView !== 'NEW' && (
               <div className={`p-12 md:p-20 rounded-[5rem] border transition-all duration-700 shadow-2xl ${role === 'ADMIN' ? 'bg-red-600 text-white shadow-red-100' : role === 'VENDOR' ? 'bg-slate-900 text-white shadow-slate-200' : 'bg-white border-slate-200 shadow-slate-100'}`}>
                <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
                  <div className="space-y-6 text-center lg:text-left">
                    <div className="flex items-center justify-center lg:justify-start gap-4 text-sm font-black uppercase tracking-[0.5em] opacity-60">
                      <ShieldCheck size={24}/> Encrypted Master Feed
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] uppercase italic">{role} DASHBOARD</h1>
                    <p className="text-lg md:text-2xl font-bold opacity-70 tracking-tight leading-relaxed max-w-5xl">
                      {role === 'ADMIN' ? "System Master: Monitoring global ticket flow and metrics." : role === 'VENDOR' ? `Expert View: Resolving ${category} requests.` : "Buyer Pipeline: Securely submit new technical records."}
                    </p>
                  </div>
                  <button onClick={fetchTickets} className="p-12 bg-white/10 hover:bg-white/20 backdrop-blur-3xl rounded-full border border-white/10 transition-all active:scale-90 shadow-2xl">
                    <RefreshCw size={56} className={isLoading ? "animate-spin" : ""}/>
                  </button>
                </div>
               </div>
            )}

            <div className="w-full">
              {role === 'BUYER' && buyerSubView === 'NEW' ? (
                <div className="flex justify-center items-start min-h-[70vh] py-10">
                  <CreateTicket onTicketAdded={() => setBuyerSubView('HISTORY')} />
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
                  {(role === 'VENDOR' || role === 'ADMIN') && (
                    <div className="lg:col-span-5 xl:col-span-5 space-y-16">
                      <div className="lg:sticky lg:top-40 space-y-16">
                        <div className="bg-white p-12 rounded-[4rem] border-4 border-slate-100 shadow-2xl">
                          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-12 flex items-center justify-between">Volume Analytics <BarChart3 size={32} className="text-blue-600"/></h3>
                          <img 
                            src={`${API_BASE}/static/reports/${role === 'ADMIN' ? 'global_analytics' : getSafeFileName(category) + '_priority'}.png?v=${Date.now()}`} 
                            className="w-full rounded-[3rem] border-4 border-slate-50 p-4" alt="Stats"
                            onError={(e) => e.target.src = 'https://placehold.co/800x600/f1f5f9/94a3b8?text=Syncing+Records...'}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className={`${(role === 'VENDOR' || role === 'ADMIN') ? 'lg:col-span-7 xl:col-span-7' : 'lg:col-span-12'} space-y-12`}>
                    <div className="flex items-end justify-between border-b-8 border-slate-100 pb-8">
                      <div className="space-y-2"><h2 className="text-5xl font-black tracking-tighter uppercase italic">Active Queue</h2><p className="text-sm font-black text-blue-600 uppercase tracking-[0.4em]">Processing {tickets.length} Points</p></div>
                    </div>
                    <div className={`grid gap-12 ${ (role === 'VENDOR' || role === 'ADMIN') ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'}`}>
                      {tickets.length > 0 ? tickets.map(t => <TicketCard key={t.id} t={t} onTicketUpdated={fetchTickets} role={role} />) : 
                      <div className="col-span-full py-64 text-center border-8 border-dashed rounded-[6rem] border-slate-50 bg-slate-50/30">
                          <CheckCircle2 size={100} className="text-slate-200 mx-auto mb-6"/>
                          <p className="text-2xl font-black text-slate-300 uppercase tracking-[0.5em]">Queue Synchronized</p>
                      </div>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t-4 border-slate-100 mt-auto py-24 px-12 w-full">
        <div className="max-w-[1800px] mx-auto flex flex-col lg:flex-row justify-between items-center gap-20">
          <div className="space-y-4 text-center lg:text-left">
            <span className="font-black text-5xl tracking-tighter italic uppercase">TicketHub <span className="text-blue-600">Pro</span></span>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.4em]">Enterprise v3.0 Master Engine</p>
          </div>
          <div className="bg-slate-900 text-white px-16 py-8 rounded-[4rem] shadow-2xl flex items-center gap-8 border-b-8 border-slate-800">
            <div className="p-4 bg-blue-600 rounded-3xl shadow-lg"><Heart size={32} fill="white"/></div>
            <div className="text-left"><p className="text-xs font-black opacity-50 uppercase tracking-widest mb-1">Architect & Engineer</p><p className="text-2xl font-black tracking-[0.1em] uppercase">Omkar Amit Gore</p></div>
          </div>
        </div>
      </footer>
    </div>
  );
}