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

// -------------------- TICKET CARD COMPONENT (Small & Data-Rich) --------------------
function TicketCard({ t, onTicketUpdated, role }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [resNotes, setResNotes] = useState('');
  const [resFile, setResFile] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Helper to format timestamps to a professional readable string
  const formatDateTime = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  };

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
    <div className={`bg-white rounded-2xl border transition-all duration-500 overflow-hidden 
    ${isExpanded ? 'border-blue-500 shadow-xl' : 'border-slate-200 hover:border-blue-300 hover:shadow-md'}
    ${t.status === 'RESOLVED' ? 'bg-slate-50/50' : ''}`}>
      <div className="p-4 md:p-5">
        {/* User Identity Section */}
        <div className="flex justify-between items-start mb-3 border-b border-slate-50 pb-2 text-[8px] font-black uppercase tracking-tighter text-slate-400">
          <div className="flex flex-col gap-0.5">
            <span className="flex items-center gap-1 text-slate-600"><User size={10} className="text-blue-500"/> {t.buyer_username || t.buyer_name}</span>
            <span className="flex items-center gap-1"><UserCog size={10} className="text-slate-400"/> {t.vendor_username || 'Pending Assignment'}</span>
          </div>
          <span className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded italic">ID: #{t.id}</span>
        </div>

        {/* Priority and Status badges */}
        <div className="flex justify-between items-center mb-3">
           <span className="bg-slate-900 text-white px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest">{t.category_display}</span>
           <span className={`text-[8px] font-black uppercase ${t.priority === 'HIGH' ? 'text-red-500' : 'text-emerald-500'}`}>{t.priority_display}</span>
        </div>

        <h3 className="font-black text-slate-900 mb-1 text-sm leading-tight line-clamp-1">{t.title}</h3>
        <div className="flex items-center gap-1.5 text-[9px] text-blue-600 font-bold mb-4 opacity-80 truncate"><Mail size={10}/> {t.buyer_email}</div>

        {/* TIMESTAMPS SECTION */}
        <div className="space-y-1 mb-4 bg-slate-50/80 p-2 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-widest text-slate-500">
                <span className="flex items-center gap-1"><Clock size={10}/> Created</span>
                <span>{formatDateTime(t.created_at)}</span>
            </div>
            {t.status === 'RESOLVED' && (
              <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-widest text-emerald-600 border-t border-slate-200/50 pt-1">
                  <span className="flex items-center gap-1"><CheckCircle2 size={10}/> Resolved</span>
                  <span>{formatDateTime(t.resolved_at)}</span>
              </div>
            )}
        </div>

        <button onClick={() => setIsExpanded(!isExpanded)} className="w-full text-blue-600 text-[10px] font-black uppercase flex items-center justify-center gap-1 hover:bg-blue-50 py-1.5 rounded-lg transition-colors border border-blue-100">
          {isExpanded ? 'Collapse' : 'Review Ticket'} <ChevronDown size={12} className={isExpanded ? 'rotate-180' : ''}/>
        </button>

        {isExpanded && (
          <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-top-1">
            <p className="text-xs text-slate-600 leading-relaxed italic">"{t.description}"</p>
            {t.issue_proof && (
              <a href={t.issue_proof} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:bg-blue-50 transition-colors text-blue-600 font-black text-[9px] uppercase">
                <span className="flex items-center gap-2"><Paperclip size={12}/> View Buyer Attachment</span>
                <ExternalLink size={12}/>
              </a>
            )}
            {role === 'VENDOR' && t.status === 'OPEN' && (
              <div className="space-y-2 mt-4">
                <textarea placeholder="Step-by-step resolution..." className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-400" onChange={(e) => setResNotes(e.target.value)} />
                <input type="file" onChange={(e) => setResFile(e.target.files[0])} className="text-[10px] text-slate-500 w-full" />
                <button onClick={handleResolve} disabled={isUpdating} className="w-full bg-blue-600 text-white py-3 rounded-xl font-black text-[10px] uppercase shadow-md hover:bg-blue-700 transition-all">
                  {isUpdating ? <Loader2 className="animate-spin mx-auto" size={14}/> : 'Submit Resolution'}
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
    return name.toLowerCase().replace('agent:', '').trim().replace(/\s+/g, '_');
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] font-sans text-slate-900 flex flex-col">
      {/* NAVBAR */}
      <nav className="bg-white/80 backdrop-blur-md border-b px-4 md:px-12 py-4 flex flex-col md:flex-row justify-between items-center sticky top-0 z-50 gap-4 md:gap-0 shadow-sm">
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg group-hover:rotate-12 transition-transform duration-500"><Ticket size={24}/></div>
          <span className="font-black text-2xl tracking-tighter uppercase italic">TicketHub <span className="text-blue-600">Pro</span></span>
        </div>
        {isLoggedIn && (
          <div className="flex items-center gap-4 lg:gap-8">
            {role === 'BUYER' && (
              <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                <button onClick={() => setBuyerSubView('NEW')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${buyerSubView === 'NEW' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>New</button>
                <button onClick={() => setBuyerSubView('HISTORY')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${buyerSubView === 'HISTORY' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>History</button>
              </div>
            )}
            <span className={`text-[10px] font-black px-4 py-2 rounded-2xl uppercase tracking-[0.2em] border shadow-sm ${role === 'ADMIN' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-900 text-white border-slate-800'}`}>
              {role === 'ADMIN' ? 'Full Oversight' : `${category} Expert`}
            </span>
            <button onClick={handleLogout} className="group p-2.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all duration-300"><LogOut size={18}/></button>
          </div>
        )}
      </nav>

      <main className="flex-grow flex flex-col w-full max-w-[1800px] mx-auto">
        {!isLoggedIn ? (
          <div className="flex-grow flex items-center justify-center p-6 animate-in zoom-in-95 duration-700"><Auth onAuthSuccess={handleAuthSuccess}/></div>
        ) : (
          <div className="p-6 md:p-12 space-y-12">
            
            {/* ROLE BANNERS */}
            <div className={`p-8 rounded-[3rem] border transition-all duration-700 shadow-2xl ${role === 'ADMIN' ? 'bg-red-600 text-white shadow-red-100' : role === 'VENDOR' ? 'bg-slate-900 text-white shadow-slate-200' : 'bg-white border-slate-200 shadow-slate-100'}`}>
              <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
                <div className="space-y-2 text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-3 text-[11px] font-black uppercase tracking-[0.4em] opacity-60"><ShieldCheck size={16}/> Encrypted Pipeline Access</div>
                  <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-[0.9] uppercase">{role} CONTROL PANEL</h1>
                  <p className="text-xs md:text-base font-bold opacity-70 tracking-tight leading-relaxed">{role === 'ADMIN' ? "Global Master Portal: Monitoring real-time ticket volume and SLA compliance across all departments." : role === 'VENDOR' ? `Queue Management: Currently handling ${category}. Close tickets with resolution proof.` : "Service Pipeline: Submit technical requests and track real-time agent responses."}</p>
                </div>
                <button onClick={fetchTickets} className="p-6 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-full border border-white/10 transition-all active:scale-90"><RefreshCw size={32} className={isLoading ? "animate-spin" : ""}/></button>
              </div>
            </div>

            {role === 'BUYER' && buyerSubView === 'NEW' ? (
              <div className="max-w-3xl mx-auto py-12 animate-in slide-in-from-bottom-10 duration-700">
                <CreateTicket onTicketAdded={() => setBuyerSubView('HISTORY')} />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* 📊 MASSIVE ANALYTICS SIDEBAR (Laptop Optimization) */}
                {(role === 'VENDOR' || role === 'ADMIN') && (
                  <div className="lg:col-span-5 xl:col-span-4 space-y-8">
                    <div className="lg:sticky lg:top-32 space-y-8">
                      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100/50 transition-all hover:border-blue-200">
                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center justify-between">Performance Data <BarChart3 size={20} className="text-blue-600"/></h3>
                        <img 
                          src={`${API_BASE}/static/reports/${role === 'ADMIN' ? 'global_analytics' : getSafeFileName(category) + '_priority'}.png?v=${Date.now()}`} 
                          className="w-full rounded-[2rem] border border-slate-100 p-2 shadow-inner transition-transform hover:scale-[1.02] duration-500" alt="Volume Analytics"
                          onError={(e) => e.target.src = 'https://placehold.co/600x400/f1f5f9/94a3b8?text=Syncing+Real-time+Stats...'}
                        />
                      </div>
                      {role === 'ADMIN' && (
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100/50 transition-all hover:border-red-200">
                          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center justify-between">Workload Share <Activity size={20} className="text-red-500"/></h3>
                          <img src={`${API_BASE}/static/reports/admin_pie.png?v=${Date.now()}`} className="w-full rounded-[2rem] transition-transform hover:scale-[1.02] duration-500" alt="Global Distribution" />
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* 🎫 COMPACT TICKET FEED */}
                <div className={`${(role === 'VENDOR' || role === 'ADMIN') ? 'lg:col-span-7 xl:col-span-8' : 'lg:col-span-12'} space-y-8`}>
                  <div className="flex items-end justify-between border-b border-slate-100 pb-4">
                    <div className="space-y-1"><h2 className="text-3xl font-black tracking-tighter uppercase">Live Queue</h2><p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Processing {tickets.length} Active Points</p></div>
                    <div className="flex gap-2 items-center"><div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Feed Synced</span></div>
                  </div>
                  <div className={`grid gap-6 ${ (role === 'VENDOR' || role === 'ADMIN') ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'}`}>
                    {tickets.length > 0 ? tickets.map(t => <TicketCard key={t.id} t={t} onTicketUpdated={fetchTickets} role={role} />) : 
                    <div className="col-span-full py-40 text-center border-4 border-dashed rounded-[4rem] border-slate-100 flex flex-col items-center justify-center gap-4 bg-slate-50/50 transition-all hover:bg-slate-50">
                        <CheckCircle2 size={60} className="text-slate-200"/>
                        <p className="text-xs font-black text-slate-300 uppercase tracking-[0.4em]">Queue Synchronized • No Pending Tickets</p>
                    </div>}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="bg-white border-t mt-auto py-12 px-10 w-full shadow-[0_-1px_3px_rgba(0,0,0,0.02)]">
        <div className="max-w-[1700px] mx-auto flex flex-col lg:flex-row justify-between items-center gap-8 text-center lg:text-left">
          <div className="space-y-2">
            <span className="font-black text-2xl tracking-tighter italic uppercase">TicketHub <span className="text-blue-600">Pro</span></span>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Enterprise Pipeline v3.0 • PostgreSQL Engine</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Heart size={16} className="text-red-500 fill-red-500 animate-pulse"/>
            <p className="text-sm font-bold text-slate-700 uppercase tracking-widest">Developed by <span className="text-blue-600">Omkar Amit Gore</span></p>
          </div>
          <div className="flex gap-12 text-[10px] font-black uppercase text-slate-400">
            <div className="text-right flex flex-col items-center lg:items-end gap-1"><span>System Access</span><span className="text-emerald-500 flex items-center gap-1 font-black">● Operational</span></div>
            <div className="text-right flex flex-col items-center lg:items-end gap-1 font-black"><span>Region</span><span className="text-blue-600">Maharashtra, IN</span></div>
          </div>
        </div>
      </footer>
    </div>
  );
}