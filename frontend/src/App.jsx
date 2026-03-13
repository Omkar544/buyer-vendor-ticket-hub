import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Ticket, Activity, ChevronDown, ChevronUp, Mail, LogOut, RefreshCw, 
  History, BarChart3, User, Paperclip, ExternalLink, ShieldCheck, LayoutDashboard, CheckCircle2 
} from 'lucide-react';
import CreateTicket from './components/CreateTicket';
import Auth from "./components/Auth";

// --- TICKET CARD COMPONENT ---
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
      await axios.post(`http://127.0.0.1:8000/api/tickets/${t.id}/resolve_ticket/`, 
        formData,
        { headers: { Authorization: `Token ${token}`, 'Content-Type': 'multipart/form-data' } }
      );
      onTicketUpdated(); 
      setResFile(null);
    } catch (err) { 
      alert("Resolution failed."); 
    } finally { 
      setIsUpdating(false); 
    }
  };

  return (
    <div className={`bg-white rounded-3xl border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-blue-400 shadow-xl' : 'border-slate-200 hover:shadow-md'} ${t.status === 'RESOLVED' ? 'bg-slate-50/50' : ''}`}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-400">
          <span className="flex items-center gap-1"><User size={10}/> {t.buyer_name}</span>
          <span>{new Date(t.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
        </div>

        <div className="flex justify-between items-center mb-3">
          <div className="flex gap-2">
            <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-lg text-[9px] font-black uppercase border border-blue-100">{t.category_display}</span>
            {t.status === 'RESOLVED' && (
              <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-[9px] font-black uppercase flex items-center gap-1">
                <CheckCircle2 size={10}/> Resolved
              </span>
            )}
          </div>
          <span className={`text-[9px] font-black uppercase ${t.priority === 'HIGH' ? 'text-red-500' : 'text-emerald-500'}`}>{t.priority_display}</span>
        </div>
        
        <h3 className="font-bold text-slate-900 mb-1">{t.title}</h3>
        <div className="flex items-center gap-2 text-[10px] text-blue-600 font-bold uppercase mb-4">
          <Mail size={12}/> {t.buyer_email}
        </div>

        {isExpanded && (
          <div className="space-y-4 pt-4 border-t border-slate-50 animate-in fade-in slide-in-from-top-2">
            <p className="text-sm text-slate-600 leading-relaxed">{t.description}</p>
            
            {t.issue_proof && (
              <div className="bg-white p-3 rounded-xl border flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><Paperclip size={12}/> Issue Proof</span>
                <a href={t.issue_proof} target="_blank" rel="noreferrer" className="text-blue-600 text-[10px] font-black flex items-center gap-1 hover:underline">VIEW <ExternalLink size={10}/></a>
              </div>
            )}

            {t.status === 'RESOLVED' && (
              <div className="space-y-3 bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                <h4 className="text-[9px] font-black text-emerald-600 uppercase tracking-wider">Resolution Details</h4>
                <p className="text-sm text-emerald-900 italic">"{t.resolution_notes}"</p>
                {t.resolution_proof && (
                  <a href={t.resolution_proof} target="_blank" rel="noreferrer" className="text-emerald-700 text-[10px] font-black flex items-center gap-1 hover:underline">VIEW RESOLUTION PROOF <ExternalLink size={10}/></a>
                )}
              </div>
            )}

            {role === 'VENDOR' && t.status === 'OPEN' && (
              <div className="space-y-3 mt-4">
                <textarea 
                  placeholder="Resolution notes..."
                  className="w-full p-4 bg-slate-50 border rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setResNotes(e.target.value)}
                />
                <input type="file" onChange={(e) => setResFile(e.target.files[0])} className="text-[10px] text-slate-400" />
                <button onClick={handleResolve} disabled={isUpdating} className="w-full bg-slate-900 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors">
                  {isUpdating ? 'Saving...' : 'Mark as Resolved'}
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
            {isExpanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>} Details
          </button>
        </div>
      </div>
    </div>
  );
}

// --- MAIN APP COMPONENT ---
export default function App() {
  // Initialize from LocalStorage to prevent jumpy UI
  const [role, setRole] = useState(localStorage.getItem('role') || 'BUYER'); 
  const [category, setCategory] = useState(localStorage.getItem('category') || '');
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  
  // Vendors and Admins should default to HISTORY/DASHBOARD view
  const [buyerSubView, setBuyerSubView] = useState(
    (localStorage.getItem('role') === 'VENDOR' || localStorage.getItem('role') === 'ADMIN') ? 'HISTORY' : 'NEW'
  ); 
  const [tickets, setTickets] = useState([]);

  const fetchTickets = () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    axios.get('http://127.0.0.1:8000/api/tickets/', {
      headers: { Authorization: `Token ${token}` }
    }).then(res => setTickets(res.data)).catch(err => console.error(err));
  };

  const handleAuthSuccess = (username, isStaff, userCategory, isSuperuser) => {
    let userRole = 'BUYER';
    if (isSuperuser) userRole = 'ADMIN';
    else if (isStaff) userRole = 'VENDOR';

    // Update Role & Category immediately
    setRole(userRole);
    setCategory(userCategory || (isSuperuser ? 'System Control' : ''));
    
    // Switch View: Vendors/Admins go to History/Dashboard immediately
    if (userRole === 'VENDOR' || userRole === 'ADMIN') {
      setBuyerSubView('HISTORY');
    } else {
      setBuyerSubView('NEW');
    }

    // Persistent storage
    localStorage.setItem('role', userRole);
    localStorage.setItem('category', userCategory || (isSuperuser ? 'System Control' : ''));
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setRole('BUYER');
    setBuyerSubView('NEW');
  };

  useEffect(() => { 
    if (isLoggedIn) fetchTickets(); 
  }, [isLoggedIn, role]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <nav className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Ticket className="text-blue-600" size={28} />
          <span className="font-black text-2xl tracking-tighter">TicketHub {role !== 'BUYER' && 'Pro'}</span>
        </div>
        
        {isLoggedIn && (
          <div className="flex items-center gap-4">
            {role === 'BUYER' && (
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button onClick={() => setBuyerSubView('NEW')} className={`px-4 py-1.5 rounded-lg text-xs font-bold ${buyerSubView === 'NEW' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>New</button>
                <button onClick={() => setBuyerSubView('HISTORY')} className={`px-4 py-1.5 rounded-lg text-xs font-bold ${buyerSubView === 'HISTORY' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>History</button>
              </div>
            )}
            <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest flex items-center gap-2 ${role === 'ADMIN' ? 'bg-red-600 text-white' : 'bg-slate-900 text-white'}`}>
              {role === 'ADMIN' ? <ShieldCheck size={12}/> : null} {role === 'ADMIN' ? 'Full System Admin' : `${category} Vendor`}
            </span>
            <button onClick={handleLogout} className="text-xs font-bold text-red-500 px-4 py-2 hover:bg-red-50 rounded-xl transition-all"><LogOut size={14}/></button>
          </div>
        )}
      </nav>

      <main className="p-8 max-w-7xl mx-auto">
        {!isLoggedIn ? <Auth onAuthSuccess={handleAuthSuccess} /> : (
          <div className="space-y-12">
            {role === 'BUYER' && buyerSubView === 'NEW' ? (
              <div className="text-center py-10">
                <h2 className="text-5xl font-black mb-6 tracking-tighter">How can we help?</h2>
                <CreateTicket onTicketAdded={() => setBuyerSubView('HISTORY')} />
              </div>
            ) : (
              <div className="space-y-10">
                <header className="flex justify-between items-center">
                  <div>
                    <h2 className="text-4xl font-black flex items-center gap-4 tracking-tighter uppercase">
                      {role === 'ADMIN' ? <LayoutDashboard size={40}/> : <History size={40}/>} 
                      {role === 'ADMIN' ? 'Global Command Center' : role === 'VENDOR' ? `${category} Management` : 'My Requests'}
                    </h2>
                    {role === 'ADMIN' && <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Master Oversight: All Tickets & Departments</p>}
                  </div>
                  <button onClick={fetchTickets} className="p-3 bg-white border rounded-full hover:text-blue-600 shadow-sm transition-transform active:rotate-180"><RefreshCw size={20}/></button>
                </header>

                {/* --- ANALYTICS SECTION --- */}
                {(role === 'VENDOR' || role === 'ADMIN') && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-700">
                    <div className="bg-white p-8 rounded-3xl border shadow-sm">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <BarChart3 size={14}/> {role === 'ADMIN' ? 'Total Resolution Volume' : 'Team Workload Status'}
                      </h3>
                      <img 
                        src={`http://127.0.0.1:8000/static/reports/global_analytics.png?cache=${Date.now()}`} 
                        className="w-full rounded-2xl bg-slate-50 border" 
                        alt="Volume Analytics" 
                        onError={(e) => e.target.src = 'https://placehold.co/600x400/e2e8f0/64748b?text=Generating+Global+Stats...'}
                      />
                    </div>
                    <div className="bg-white p-8 rounded-3xl border shadow-sm">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Activity size={14}/> {role === 'ADMIN' ? 'Department Wise Distribution' : 'Priority Load Balance'}
                      </h3>
                      <img 
                        src={`http://127.0.0.1:8000/static/reports/${role === 'ADMIN' ? 'admin_pie' : category.toLowerCase() + '_priority'}.png?cache=${Date.now()}`} 
                        className="w-full rounded-2xl bg-slate-50 border" 
                        alt="Distribution Analytics" 
                        onError={(e) => e.target.src = 'https://placehold.co/600x400/e2e8f0/64748b?text=Generating+Category+Stats...'}
                      />
                    </div>
                  </div>
                )}

                {/* --- TICKET GRID --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tickets.length > 0 ? (
                    tickets.map(t => <TicketCard key={t.id} t={t} onTicketUpdated={fetchTickets} role={role} />)
                  ) : (
                    <div className="col-span-full text-center py-20 text-slate-300 font-black uppercase text-xs tracking-[0.2em]">Queue is clear</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}