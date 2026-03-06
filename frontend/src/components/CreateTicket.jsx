import React, { useState } from 'react';
import axios from 'axios';
import { Send, X, PlusCircle, User, Building2, Phone, Mail, ShieldAlert, Briefcase, Tag } from 'lucide-react';

export default function CreateTicket({ onTicketAdded }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'TECHNICAL', // Initial selection for the dropdown
    subcategory: 'APP',
    priority: 'LOW',
    company: 'YBL',
    classification: 'Service Request',
    buyer_name: '',
    buyer_email: '',
    buyer_phone: '',
    buyer_user: 1 
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:8000/api/tickets/', formData);
      setIsOpen(false);
      onTicketAdded(); // Refresh grid
    } catch (err) {
      console.error("Submission Error:", err.response?.data);
      alert("Please fill all required dropdown fields.");
    }
  };

  if (!isOpen) return (
    <button onClick={() => setIsOpen(true)} className="fixed bottom-10 right-10 bg-blue-600 text-white p-5 rounded-full shadow-2xl hover:scale-110 transition-all z-40">
      <PlusCircle size={28} />
    </button>
  );

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden">
        
        <div className="bg-slate-50 px-8 py-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-black text-slate-900">New Service Ticket</h2>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Section 1: Standard Inputs */}
          <div className="space-y-4">
            <input 
              type="text" placeholder="Ticket Title" required
              className="w-full p-4 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
            <textarea 
              placeholder="Describe the issue..." required
              className="w-full p-4 bg-slate-50 border rounded-xl h-24 outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          {/* Section 2: The Dropdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Company Selection */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Company</label>
              <div className="relative">
                <Building2 size={16} className="absolute left-3 top-3.5 text-slate-400" />
                <select 
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-sm font-semibold text-slate-700 outline-none"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                >
                  <option value="YBL">Yes Bank (YBL)</option>
                  <option value="HDFC">HDFC Bank</option>
                  <option value="ICICI">ICICI Bank</option>
                </select>
              </div>
            </div>

            {/* Classification Selection */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Classification</label>
              <div className="relative">
                <Briefcase size={16} className="absolute left-3 top-3.5 text-slate-400" />
                <select 
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-sm font-semibold text-slate-700 outline-none"
                  value={formData.classification}
                  onChange={(e) => setFormData({...formData, classification: e.target.value})}
                >
                  <option value="Service Request">Service Request</option>
                  <option value="Enhancement">Enhancement</option>
                  <option value="Bug Fix">Bug Fix</option>
                </select>
              </div>
            </div>

            {/* Category Selection */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Team Category</label>
              <div className="relative">
                <Tag size={16} className="absolute left-3 top-3.5 text-slate-400" />
                <select 
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-sm font-semibold text-slate-700 outline-none"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="TECHNICAL">Technical Team</option>
                  <option value="HARDWARE">Hardware Team</option>
                  <option value="BILLING">Billing Team</option>
                </select>
              </div>
            </div>

            {/* Priority Selection */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Priority Level</label>
              <div className="relative">
                <ShieldAlert size={16} className="absolute left-3 top-3.5 text-slate-400" />
                <select 
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-sm font-semibold text-slate-700 outline-none"
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Contact Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <input 
              type="text" placeholder="Your Name" required
              className="w-full p-3 bg-slate-50 border rounded-xl outline-none"
              onChange={(e) => setFormData({...formData, buyer_name: e.target.value})}
            />
            <input 
              type="email" placeholder="Email Address" required
              className="w-full p-3 bg-slate-50 border rounded-xl outline-none"
              onChange={(e) => setFormData({...formData, buyer_email: e.target.value})}
            />
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2">
            <Send size={18} /> Register Ticket
          </button>
        </form>
      </div>
    </div>
  );
}