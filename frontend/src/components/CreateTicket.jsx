import React, { useState } from 'react';
import axios from 'axios';
import { Send, X, PlusCircle, UserCheck, Smartphone, Mail, CheckCircle2 } from 'lucide-react';

export default function CreateTicket({ onTicketAdded }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const savedUsername = localStorage.getItem('username') || 'Guest';

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'TECHNICAL',
    priority: 'LOW',
    company: 'YBL',
    buyer_name: savedUsername,
    buyer_email: '', 
    buyer_phone: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!token) {
      alert("Session expired. Please log in again.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/tickets/', formData, {
        headers: { 
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // CRITICAL SUCCESS CHECK: 201 Created
      if (response.status === 201 || response.status === 200) {
        setIsSuccess(true);
        
        // Brief delay to allow the user to see the "Success" state
        setTimeout(() => {
          setIsOpen(false);
          setIsSuccess(false);
          onTicketAdded(); // Refresh the parent list
        }, 1800);

        // STOP execution here so we don't fall into any further logic or the catch block
        return; 
      }
    } catch (err) {
      // This block now ONLY executes if the server actually returns an error (400, 401, 500, etc.)
      console.error("Submission Error Details:", err.response?.data);
      const errorMsg = err.response?.data?.detail || "Verification failed. Please check your connection.";
      alert(errorMsg);
    } finally {
      // Only disable processing state if it wasn't a success (to keep UI clean)
      if (!isSuccess) {
        setIsSubmitting(false);
      }
    }
  };

  if (!isOpen) return (
    <button onClick={() => setIsOpen(true)} className="fixed bottom-10 right-10 bg-blue-600 text-white p-5 rounded-full shadow-2xl hover:scale-110 transition-all z-40">
      <PlusCircle size={28} />
    </button>
  );

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-300">
        
        <div className="bg-slate-50 px-8 py-6 border-b flex justify-between items-center">
          <div className="flex items-center gap-3">
            <UserCheck className="text-blue-600" />
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">New Service Request</h2>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
        </div>

        {isSuccess ? (
          <div className="p-20 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in">
            <div className="bg-emerald-100 p-4 rounded-full text-emerald-600">
              <CheckCircle2 size={60} />
            </div>
            <h3 className="text-2xl font-black text-slate-900">Success!</h3>
            <p className="text-slate-500 font-medium tracking-tight">Your ticket has been added to the {formData.category.toLowerCase()} queue.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto text-slate-800">
            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex items-center justify-between">
               <div className="text-[10px] font-black uppercase text-blue-600 tracking-widest">Linked Identity</div>
               <div className="text-xs font-bold text-slate-700">{savedUsername}</div>
            </div>

            <div className="space-y-4">
              <input 
                type="text" placeholder="Subject Title (e.g., Database Timeout)" required
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
              <textarea 
                placeholder="Detailed description of the technical issue..." required
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl h-32 outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                 <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 flex items-center gap-1"><Mail size={10}/> Contact Email</label>
                 <input 
                  type="email" placeholder="manish.chavan@example.com" required
                  className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setFormData({...formData, buyer_email: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 flex items-center gap-1"><Smartphone size={10}/> Phone</label>
                 <input 
                  type="text" placeholder="Mobile Number"
                  className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setFormData({...formData, buyer_phone: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Team Assignment</label>
                <select 
                  className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold text-slate-700"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="TECHNICAL">Technical Team</option>
                  <option value="BILLING">Billing Team</option>
                  <option value="HARDWARE">Hardware Team</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Urgency Level</label>
                <select 
                  className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold text-slate-700"
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                >
                  <option value="LOW">Low (SLA: 10 Days)</option>
                  <option value="MEDIUM">Medium (SLA: 5 Days)</option>
                  <option value="HIGH">High (SLA: 2 Days)</option>
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`w-full ${isSubmitting ? 'bg-slate-400' : 'bg-blue-600 hover:bg-slate-900'} text-white font-black py-5 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 uppercase text-xs tracking-widest mt-4`}
            >
              {isSubmitting ? 'Processing Dispatch...' : <><Send size={18} /> Submit Ticket</>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}