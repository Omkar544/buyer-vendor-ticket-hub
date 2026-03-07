import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Ticket, Database, Activity, ChevronDown, ChevronUp, Mail, Phone, Building2, LayoutDashboard, LogOut, ShieldCheck, BarChart3, RefreshCw, CheckCircle2, UserPlus, KeyRound, History, PlusCircle } from 'lucide-react';
import CreateTicket from './components/CreateTicket';

// --- TICKET CARD COMPONENT ---
function TicketCard({ t, onTicketUpdated, showActions = true }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (newStatus) => {
    setIsUpdating(true);
    try {
      await axios.patch(`http://127.0.0.1:8000/api/tickets/${t.id}/`, { status: newStatus });
      onTicketUpdated(); 
    } catch (err) { 
      console.error("Update Failed:", err); 
    } finally { 
      setIsUpdating(false); 
    }
  };

  return (
    <div className={`bg-white p-6 rounded-2xl border transition-all duration-300 ${isExpanded ? 'border-blue-400 shadow-md ring-1 ring-blue-50' : 'border-slate-200 hover:shadow-md'}`}>
      <div className="flex justify-between items-center mb-4 text-[10px] font-bold uppercase tracking-widest">
        <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-100 text-slate-500">{t.category}</span>
        <span className={t.priority === 'HIGH' || t.priority === 'CRITICAL' ? 'text-red-600' : 'text-emerald-600'}>{t.priority}</span>
      </div>
      <h3 className="font-bold text-slate-900 mb-1 tracking-tight">{t.title}</h3>
      <p className="text-xs text-slate-500 mb-4">{t.buyer_name}</p>

      {isExpanded && (
        <div className="space-y-4 pt-4 border-t border-slate-50 animate-in fade-in slide-in-from-top-2">
          <p className="text-sm text-slate-600 leading-relaxed">{t.description}</p>
          <div className="text-[10px] text-slate-400 space-y-1 bg-slate-50 p-3 rounded-lg">
            <p className="flex items-center gap-2"><Mail size={12}/> {t.buyer_email}</p>
            <p className="flex items-center gap-2"><Phone size={12}/> {t.buyer_phone || 'No Phone'}</p>
            <p className="flex items-center gap-2"><Building2 size={12}/> {t.company} • {t.subcategory}</p>
          </div>
          {showActions && (
            <div className="space-y-2">
              <label className="text-[9px] font-bold text-slate-400 uppercase">Update Status</label>
              <select 
                disabled={isUpdating} value={t.status}
                onChange={(e) => handleStatusUpdate(e.target.value)}
                className="w-full p-2.5 bg-blue-50 border border-blue-100 rounded-xl text-xs font-bold text-blue-700 outline-none"
              >
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          )}
        </div>
      )}

      <div className="pt-4 mt-2 border-t border-slate-50 flex justify-between items-center">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter">
          <Activity size={12} className={t.status === 'OPEN' ? 'text-blue-500' : 'text-emerald-500'} /> {t.status}
        </div>
        <button onClick={() => setIsExpanded(!isExpanded)} className="text-blue-600 text-[10px] font-bold uppercase flex items-center gap-1 hover:text-blue-800">
          {isExpanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>} {isExpanded ? 'Close' : 'Details'}
        </button>
      </div>
    </div>
  );
}

// --- MAIN APP COMPONENT ---
export default function App() {
  const [role, setRole] = useState('BUYER'); 
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [buyerSubView, setBuyerSubView] = useState('NEW'); // 'NEW' or 'HISTORY'
  const [vendorTeam, setVendorTeam] = useState('TECHNICAL');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchTickets = () => {
    setLoading(true);
    let url = 'http://127.0.0.1:8000/api/tickets/';
    if (role === 'VENDOR') url += `?category=${vendorTeam}`; 

    axios.get(url).then(res => {
      setTickets(res.data);
      setLoading(false);
      setRefreshKey(prev => prev + 1); 
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    // Only fetch if logged in or a Staff member
    if (isLoggedIn || role !== 'BUYER') fetchTickets();
  }, [role, vendorTeam, isLoggedIn, buyerSubView]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Ticket className="text-blue-600" size={28} />
          <span className="font-black text-2xl tracking-tighter">TicketHub {role !== 'BUYER' && 'Pro'}</span>
        </div>
        <div className="flex items-center gap-4">
          {!isLoggedIn ? (
            <div className="flex items-center gap-3">
              <select 
                className="text-[10px] font-bold border rounded-lg px-2 py-1.5 bg-slate-50 outline-none text-slate-600 uppercase"
                onChange={(e) => setVendorTeam(e.target.value)}
                value={vendorTeam}
              >
                <option value="TECHNICAL">Technical Team</option>
                <option value="BILLING">Billing Team</option>
                <option value="HARDWARE">Hardware Team</option>
              </select>
              <button onClick={() => {setRole('BUYER'); setIsLoggedIn(true)}} className="text-xs font-bold text-blue-600 uppercase tracking-widest px-3 py-1.5 hover:bg-blue-50 rounded-lg transition-all">Buyer Login</button>
              <button onClick={() => {setRole('VENDOR'); setIsLoggedIn(true)}} className="text-xs font-bold text-slate-500 uppercase tracking-widest">Staff Portal</button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              {role === 'BUYER' && (
                <div className="flex bg-slate-100 p-1 rounded-xl mr-2">
                  <button onClick={() => setBuyerSubView('NEW')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${buyerSubView === 'NEW' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>New Ticket</button>
                  <button onClick={() => setBuyerSubView('HISTORY')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${buyerSubView === 'HISTORY' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>My History</button>
                </div>
              )}
              <button onClick={() => setIsLoggedIn(false)} className="flex items-center gap-2 text-xs font-bold text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl transition-all">
                <LogOut size={14}/> Logout
              </button>
            </div>
          )}
          {(role === 'VENDOR' && isLoggedIn) && (
            <button onClick={() => setRole('ADMIN')} className="text-xs font-bold bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-slate-800 shadow-lg shadow-slate-200">Admin Mode</button>
          )}
        </div>
      </nav>

      <main className="p-8 max-w-7xl mx-auto">
        {/* AUTH GATEWAY PLACEHOLDER */}
        {!isLoggedIn ? (
           <div className="max-w-md mx-auto mt-20 p-10 bg-white rounded-3xl border border-slate-200 shadow-sm text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <KeyRound className="text-blue-600" />
              </div>
              <h2 className="text-2xl font-black mb-2 tracking-tight">Access Secure Portal</h2>
              <p className="text-slate-500 text-sm mb-8">Please login to manage service requests or view historical data.</p>
              <button onClick={() => setIsLoggedIn(true)} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">Enter TicketHub</button>
              <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                <ShieldCheck size={12}/> Secured by PostgreSQL Data Tier
              </div>
           </div>
        ) : (
          <>
            {/* BUYER VIEW */}
            {role === 'BUYER' && (
              buyerSubView === 'NEW' ? (
                <div className="text-center py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">How can we help?</h2>
                  <p className="text-slate-500 max-w-xl mx-auto mb-12 text-lg font-medium">Register your name, email, and mobile to link this ticket to your account history.</p>
                  <CreateTicket onTicketAdded={() => setBuyerSubView('HISTORY')} />
                  <div className="mt-20 opacity-20 flex justify-center gap-16 grayscale">
                    <Building2 size={40} /> <Database size={40} /> <ShieldCheck size={40} />
                  </div>
                </div>
              ) : (
                <div className="space-y-10 animate-in fade-in duration-500">
                   <header className="flex justify-between items-center">
                    <div>
                      <h2 className="text-4xl font-black text-slate-900 flex items-center gap-4">
                        <History className="text-blue-600" size={40}/> Previous Tickets
                      </h2>
                      <p className="text-slate-500 font-bold text-sm mt-1 uppercase tracking-widest">Historical Data for Logged-in User</p>
                    </div>
                  </header>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tickets.map(t => <TicketCard key={t.id} t={t} onTicketUpdated={fetchTickets} />)}
                    {tickets.length === 0 && <div className="col-span-full py-24 text-center text-slate-400 uppercase text-xs font-bold tracking-widest">No previous requests found</div>}
                  </div>
                </div>
              )
            )}

            {/* VENDOR & ADMIN DASHBOARDS */}
            {role !== 'BUYER' && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4">
                <header className="flex justify-between items-center">
                  <div>
                    <h2 className="text-4xl font-black text-slate-900 flex items-center gap-4">
                      {role === 'ADMIN' ? <ShieldCheck className="text-blue-600" size={40}/> : <LayoutDashboard className="text-blue-600" size={40}/>}
                      {role === 'ADMIN' ? 'Control Tower' : `${vendorTeam} Queue`}
                    </h2>
                    <p className="text-slate-500 font-bold text-sm mt-1 uppercase tracking-widest flex items-center gap-2">
                      <Database size={14}/> System Monitoring Logic
                    </p>
                  </div>
                  <button onClick={fetchTickets} className="p-3 bg-white border border-slate-200 rounded-full hover:text-blue-600 shadow-sm transition-all active:scale-95">
                    <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                  </button>
                </header>

                {role === 'ADMIN' && (
                  <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                       <h3 className="flex items-center gap-2 font-black text-slate-800 mb-6 uppercase tracking-tighter"><BarChart3 size={20} className="text-blue-600" /> Team Analysis</h3>
                       <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 min-h-[300px] flex items-center justify-center relative">
                          <img src={`/reports/daily_analytics.png?v=${refreshKey}`} alt="Seaborn Report" className="w-full object-contain p-2" />
                       </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="bg-blue-600 p-8 rounded-3xl text-white shadow-xl shadow-blue-100">
                        <p className="text-[10px] font-black uppercase opacity-60 tracking-[0.2em]">Total Tickets</p>
                        <h4 className="text-6xl font-black mt-2 tracking-tighter">{tickets.length}</h4>
                      </div>
                      <div className="bg-white border border-slate-200 p-8 rounded-3xl text-slate-900">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">System Status</p>
                        <h4 className="text-5xl font-black mt-2 tracking-tighter text-emerald-500">Online</h4>
                      </div>
                    </div>
                  </section>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                  {tickets.map(t => <TicketCard key={t.id} t={t} onTicketUpdated={fetchTickets} />)}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}