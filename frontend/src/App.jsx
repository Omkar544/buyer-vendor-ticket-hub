import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Ticket, Activity, ChevronDown, ChevronUp, Mail, Phone, Building2, LogOut, RefreshCw, History, ShieldCheck, BarChart3, Clock, CheckCircle2 } from 'lucide-react';
import CreateTicket from './components/CreateTicket';
import Auth from "./components/Auth";

// --- UPDATED TICKET CARD: Displays Resolution Notes & Due Dates ---
function TicketCard({ t, onTicketUpdated, isVendor }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [resNotes, setResNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleResolve = async () => {
    if (!resNotes) return alert("Please provide resolution notes.");
    setIsUpdating(true);
    const token = localStorage.getItem('token');
    try {
      // Calls the new custom action in Django views.py
      await axios.post(`http://127.0.0.1:8000/api/tickets/${t.id}/resolve_ticket/`, 
        { resolution_notes: resNotes },
        { headers: { Authorization: `Token ${token}` } }
      );
      onTicketUpdated(); 
    } catch (err) { 
      alert("Resolution failed."); 
    } finally { 
      setIsUpdating(false); 
    }
  };

  return (
    <div className={`bg-white p-6 rounded-3xl border transition-all duration-300 ${isExpanded ? 'border-blue-400 shadow-xl' : 'border-slate-200 hover:shadow-md'}`}>
      <div className="flex justify-between items-center mb-4 text-[10px] font-black uppercase tracking-widest">
        <span className="bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 text-slate-500">{t.category_display}</span>
        <span className={t.priority === 'HIGH' ? 'text-red-600' : 'text-emerald-600'}>{t.priority_display}</span>
      </div>
      
      <h3 className="font-bold text-slate-900 mb-1 tracking-tight">{t.title}</h3>
      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase mb-4">
        <Clock size={12}/> Due: {new Date(t.due_date).toLocaleDateString()}
      </div>

      {isExpanded && (
        <div className="space-y-4 pt-4 border-t border-slate-50 animate-in fade-in slide-in-from-top-2">
          <p className="text-sm text-slate-600 leading-relaxed">{t.description}</p>
          
          {/* Resolution View for Buyer */}
          {t.status === 'RESOLVED' && (
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
              <label className="text-[10px] font-black text-emerald-700 uppercase block mb-1">Resolution Reason</label>
              <p className="text-sm text-emerald-900 italic">"{t.resolution_notes}"</p>
            </div>
          )}

          {/* Action View for Vendor */}
          {isVendor && t.status === 'OPEN' && (
            <div className="space-y-3">
              <textarea 
                placeholder="Enter resolution details for the buyer..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setResNotes(e.target.value)}
              />
              <button 
                onClick={handleResolve} disabled={isUpdating}
                className="w-full bg-slate-900 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all"
              >
                {isUpdating ? 'Processing...' : 'Mark as Resolved'}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="pt-4 mt-2 border-t border-slate-50 flex justify-between items-center">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter">
          <Activity size={12} className={t.status === 'OPEN' ? 'text-blue-500' : 'text-emerald-500'} /> {t.status}
        </div>
        <button onClick={() => setIsExpanded(!isExpanded)} className="text-blue-600 text-[10px] font-black uppercase flex items-center gap-1">
          {isExpanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>} {isExpanded ? 'Close' : 'Details'}
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [role, setRole] = useState(localStorage.getItem('role') || 'BUYER'); 
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [buyerSubView, setBuyerSubView] = useState('NEW'); 
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTickets = () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    // For Vendors, we pass the category based on their pre-created role
    let url = 'http://127.0.0.1:8000/api/tickets/';
    if (role !== 'BUYER') url += `?category=${role}`; 

    axios.get(url, {
      headers: { Authorization: `Token ${token}` }
    }).then(res => {
      setTickets(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const handleAuthSuccess = (username, isStaff) => {
    const userRole = isStaff ? 'TECHNICAL' : 'BUYER'; // Logic to detect Vendor vs Buyer
    setRole(userRole);
    localStorage.setItem('role', userRole);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setRole('BUYER');
  };

  useEffect(() => {
    if (isLoggedIn) fetchTickets();
  }, [role, isLoggedIn, buyerSubView]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Ticket className="text-blue-600" size={28} />
          <span className="font-black text-2xl tracking-tighter">TicketHub {role !== 'BUYER' && 'Pro'}</span>
        </div>
        
        {isLoggedIn && (
          <div className="flex items-center gap-4">
            {role === 'BUYER' ? (
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button onClick={() => setBuyerSubView('NEW')} className={`px-4 py-1.5 rounded-lg text-xs font-bold ${buyerSubView === 'NEW' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>New Ticket</button>
                <button onClick={() => setBuyerSubView('HISTORY')} className={`px-4 py-1.5 rounded-lg text-xs font-bold ${buyerSubView === 'HISTORY' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>My History</button>
              </div>
            ) : (
              <span className="text-[10px] font-black bg-slate-900 text-white px-3 py-1.5 rounded-lg uppercase tracking-widest">{role} VENDOR</span>
            )}
            <button onClick={handleLogout} className="text-xs font-bold text-red-500 px-4 py-2 hover:bg-red-50 rounded-xl transition-all"><LogOut size={14}/></button>
          </div>
        )}
      </nav>

      <main className="p-8 max-w-7xl mx-auto">
        {!isLoggedIn ? <Auth onAuthSuccess={handleAuthSuccess} /> : (
          <div className="space-y-12">
            {role === 'BUYER' && buyerSubView === 'NEW' ? (
              <div className="text-center py-10 animate-in fade-in slide-in-from-bottom-4">
                <h2 className="text-5xl font-black mb-6">How can we help?</h2>
                <CreateTicket onTicketCreated={() => setBuyerSubView('HISTORY')} />
              </div>
            ) : (
              <div className="space-y-10">
                <header className="flex justify-between items-center">
                  <h2 className="text-4xl font-black flex items-center gap-4">
                    {role === 'BUYER' ? <History size={40}/> : <BarChart3 size={40}/>} 
                    {role === 'BUYER' ? 'Ticket History' : 'Active Management'}
                  </h2>
                  <button onClick={fetchTickets} className="p-3 bg-white border border-slate-200 rounded-full hover:text-blue-600 shadow-sm"><RefreshCw size={20}/></button>
                </header>

                {/* --- SEABORN ANALYTICS VIEW FOR VENDORS --- */}
                {role !== 'BUYER' && (
                  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2"><Activity size={14}/> Live Vendor Performance (PostgreSQL Feed)</h3>
                    <img src={`/reports/daily_analytics.png?cache=${Date.now()}`} className="w-full rounded-2xl border border-slate-100" alt="Vendor Analytics" />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tickets.map(t => <TicketCard key={t.id} t={t} onTicketUpdated={fetchTickets} isVendor={role !== 'BUYER'} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}