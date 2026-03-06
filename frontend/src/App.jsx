import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Ticket, Database, Activity, PlusCircle, ChevronDown, ChevronUp, Mail, Phone, Building2 } from 'lucide-react';
import CreateTicket from './components/CreateTicket';

function TicketCard({ t }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Helper function for Category Tag Colors
  const getCategoryStyle = (cat) => {
    switch (cat) {
      case 'TECHNICAL': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'HARDWARE': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'BILLING': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Helper function for Priority Colors
  const getPriorityStyle = (priority) => {
    if (priority === 'HIGH' || priority === 'CRITICAL') return 'bg-red-100 text-red-700';
    if (priority === 'MEDIUM') return 'bg-amber-100 text-amber-700';
    return 'bg-emerald-100 text-emerald-700';
  };

  return (
    <div 
      className={`bg-white p-6 rounded-2xl shadow-sm border transition-all duration-300 ${isExpanded ? 'border-blue-400 shadow-md ring-1 ring-blue-100' : 'border-slate-200 hover:shadow-md'}`}
    >
      <div className="flex justify-between items-center mb-4">
        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${getCategoryStyle(t.category)}`}>
          {t.category || 'GENERAL'}
        </span>
        <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${getPriorityStyle(t.priority)}`}>
          {t.priority}
        </span>
      </div>

      <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight">{t.title}</h3>
      
      {/* Buyer Header: Always visible */}
      <div className="flex items-center gap-2 mb-4">
        <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">
          {t.buyer_name?.charAt(0) || 'U'}
        </div>
        <p className="text-sm font-semibold text-slate-700">{t.buyer_name}</p>
      </div>

      <p className={`text-slate-600 text-sm leading-relaxed mb-4 ${!isExpanded && 'line-clamp-2'}`}>
        {t.description}
      </p>

      {/* Expanded Details: Vendor View */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-slate-600">
              <Mail size={14} className="text-slate-400" />
              <span className="text-xs font-medium">{t.buyer_email}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Phone size={14} className="text-slate-400" />
              <span className="text-xs font-medium">{t.buyer_phone || 'No Phone'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Building2 size={14} className="text-slate-400" />
            <span className="text-xs font-medium">{t.company} • {t.subcategory}</span>
          </div>
          <button className="w-full bg-blue-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors uppercase tracking-wider">
            Update Status
          </button>
        </div>
      )}

      <div className="pt-4 border-t border-slate-50 flex items-center justify-between mt-2">
        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
          <Activity size={14} className="text-blue-500" /> 
          <span className="text-slate-900 font-bold">{t.status}</span>
        </div>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 text-xs font-bold flex items-center gap-1 hover:text-blue-800"
        >
          {isExpanded ? <><ChevronUp size={14} /> Close</> : <><ChevronDown size={14} /> View Details</>}
        </button>
      </div>
    </div>
  );
}

function App() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = () => {
    setLoading(true);
    axios.get('http://127.0.0.1:8000/api/tickets/')
      .then(res => {
        setTickets(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Connection Error:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      {/* Client Tier Header */}
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold text-slate-900">
            <Ticket size={36} className="text-blue-600" /> 
            TicketHub React 
            <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-semibold border border-emerald-200">
              v1.0 Live
            </span>
          </h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2 text-sm">
            <Database size={14} /> PostgreSQL Data Tier Connected
          </p>
        </div>
        
        <div className="flex gap-3">
          <a href="http://127.0.0.1:8000/admin/" target="_blank" rel="noreferrer"
             className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-lg font-bold transition-all hover:bg-slate-50">
            Management Panel
          </a>
        </div>
      </header>

      {/* Ticket Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : tickets.length > 0 ? (
          tickets.map(t => <TicketCard key={t.id} t={t} />)
        ) : (
          <div className="col-span-full bg-white border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center">
            <Ticket size={48} className="mx-auto text-slate-300 mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">No tickets found in PostgreSQL</h2>
            <p className="text-slate-500 mb-6">Raise your first ticket using the button in the bottom right corner.</p>
          </div>
        )}
      </div>

      {/* Floating Action Button for CreateTicket Component */}
      <CreateTicket onTicketAdded={fetchTickets} />
    </div>
  );
}

export default App;