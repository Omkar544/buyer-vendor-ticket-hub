import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Send, X, PlusCircle, UserCheck, Smartphone, Mail, CheckCircle2, Upload, FileText, Paperclip } from 'lucide-react';

export default function CreateTicket({ onTicketAdded }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [categories, setCategories] = useState([]);
  
  const savedUsername = localStorage.getItem('username') || 'Guest';

  // --- Initial state pulls from localStorage for Auto-Fill ---
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '', 
    priority: 'LOW',
    company: localStorage.getItem('company') || 'YBL',
    buyer_name: localStorage.getItem('name') || savedUsername,
    buyer_email: localStorage.getItem('email') || '', 
    buyer_phone: localStorage.getItem('phone') || ''
  });

  // --- Sync state and Fetch Agents (Categories) ---
  useEffect(() => {
    if (isOpen) {
      // Sync personal info from localStorage
      setFormData(prev => ({
        ...prev,
        buyer_email: localStorage.getItem('email') || prev.buyer_email,
        buyer_phone: localStorage.getItem('phone') || prev.buyer_phone,
        company: localStorage.getItem('company') || prev.company,
        buyer_name: localStorage.getItem('name') || prev.buyer_name,
      }));

      // Fetch the Vendor Agents from your new get_categories view
      const fetchCategories = async () => {
        try {
          const response = await axios.get('http://127.0.0.1:8000/api/get-categories/');
          setCategories(response.data);
          // Auto-select the first available agent
          if (response.data.length > 0) {
            setFormData(prev => ({ ...prev, category: response.data[0].id }));
          }
        } catch (err) {
          console.error("Failed to load agents:", err);
        }
      };
      fetchCategories();
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!token) {
      alert("Session expired. Please log in again.");
      return;
    }

    setIsSubmitting(true);

    const uploadData = new FormData();
    uploadData.append('title', formData.title);
    uploadData.append('description', formData.description);
    uploadData.append('category', formData.category);
    uploadData.append('priority', formData.priority);
    uploadData.append('company', formData.company);
    uploadData.append('buyer_name', formData.buyer_name);
    uploadData.append('buyer_email', formData.buyer_email);
    uploadData.append('buyer_phone', formData.buyer_phone);
    
    if (selectedFile) {
      uploadData.append('issue_proof', selectedFile);
    }

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/tickets/', uploadData, {
        headers: { 
          'Authorization': `Token ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.status === 201 || response.status === 200) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsOpen(false);
          setIsSuccess(false);
          setSelectedFile(null);
          setFormData(prev => ({...prev, title: '', description: ''})); // Reset only ticket content
          onTicketAdded();
        }, 1800);
      }
    } catch (err) {
      alert("Submission failed. Check your connection.");
    } finally {
      if (!isSuccess) setIsSubmitting(false);
    }
  };

  if (!isOpen) return (
    <button onClick={() => setIsOpen(true)} className="fixed bottom-10 right-10 bg-blue-600 text-white p-5 rounded-full shadow-2xl hover:scale-110 hover:bg-slate-900 transition-all z-40 group">
      <div className="flex items-center gap-2">
         <PlusCircle size={28} />
         <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 font-black uppercase text-[10px] tracking-widest">New Ticket</span>
      </div>
    </button>
  );

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="bg-slate-50 px-8 py-6 border-b flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white">
               <UserCheck size={20} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Direct Agent Request</h2>
          </div>
          <button onClick={() => setIsOpen(false)} className="bg-slate-200 p-2 rounded-full text-slate-500 hover:bg-red-100 hover:text-red-600 transition-colors"><X size={20}/></button>
        </div>

        {isSuccess ? (
          <div className="p-20 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in">
            <div className="bg-emerald-100 p-4 rounded-full text-emerald-600">
              <CheckCircle2 size={60} />
            </div>
            <h3 className="text-2xl font-black text-slate-900">Ticket Dispatched!</h3>
            <p className="text-slate-500 font-medium tracking-tight">Your selected agent has been notified.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-5 max-h-[75vh] overflow-y-auto text-slate-800">
            
            {/* Identity Banner */}
            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <div className="text-[10px] font-black uppercase text-blue-600 tracking-widest">Logged Identity</div>
               </div>
               <div className="text-xs font-bold text-slate-700">{formData.buyer_name} ({formData.company})</div>
            </div>

            {/* Title & Description */}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Issue Subject</label>
                <input 
                  type="text" placeholder="Briefly describe the problem..." required
                  value={formData.title}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Description</label>
                <textarea 
                  placeholder="Tell us more about what's happening..." required
                  value={formData.description}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl h-28 outline-none focus:ring-2 focus:ring-blue-500 text-sm leading-relaxed"
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </div>

            {/* File Upload */}
            <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1 flex items-center gap-1">
                  <Paperclip size={10}/> Attachment (Proof)
                </label>
                <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-6 flex items-center justify-center bg-slate-50 hover:bg-blue-50 hover:border-blue-200 transition-all group">
                  <input 
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                  />
                  <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-blue-500 transition-colors">
                    {selectedFile ? (
                      <div className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl">
                        <FileText size={18}/> 
                        <span className="text-xs font-bold">{selectedFile.name}</span>
                      </div>
                    ) : (
                      <>
                        <Upload size={24}/> 
                        <span className="text-xs font-bold uppercase tracking-wider">Drag or Click to Upload</span>
                      </>
                    )}
                  </div>
                </div>
            </div>

            {/* Contact Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase ml-1 flex items-center gap-1"><Mail size={10}/> Contact Email</label>
                 <input 
                  type="email" required
                  value={formData.buyer_email}
                  className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setFormData({...formData, buyer_email: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase ml-1 flex items-center gap-1"><Smartphone size={10}/> Mobile Number</label>
                 <input 
                  type="text"
                  value={formData.buyer_phone}
                  className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setFormData({...formData, buyer_phone: e.target.value})}
                />
              </div>
            </div>

            {/* Agent & Urgency Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Target Agent</label>
                <select 
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Priority Level</label>
                <select 
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                >
                  <option value="LOW">Low (Routine)</option>
                  <option value="MEDIUM">Medium (Priority)</option>
                  <option value="HIGH">High (Critical)</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`w-full ${isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-slate-900'} text-white font-black py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 uppercase text-xs tracking-[0.2em] mt-2 transition-all active:scale-95`}
            >
              {isSubmitting ? 'Dispatching...' : <><Send size={18} /> Submit Ticket</>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}