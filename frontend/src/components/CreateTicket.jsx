import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Send, X, PlusCircle, UserCheck, Smartphone, Mail, CheckCircle2, 
  Upload, FileText, Paperclip, AlertCircle, Building2, User 
} from 'lucide-react';

export default function CreateTicket({ onTicketAdded }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [categories, setCategories] = useState([]);
  
  const savedUsername = localStorage.getItem('username') || 'Guest';

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

  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        buyer_email: localStorage.getItem('email') || prev.buyer_email,
        buyer_phone: localStorage.getItem('phone') || prev.buyer_phone,
        company: localStorage.getItem('company') || prev.company,
        buyer_name: localStorage.getItem('name') || prev.buyer_name,
      }));

      const fetchCategories = async () => {
        try {
          const response = await axios.get('http://127.0.0.1:8000/api/get-categories/');
          setCategories(response.data);
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
    if (!token) return alert("Session expired.");

    setIsSubmitting(true);
    const uploadData = new FormData();
    Object.keys(formData).forEach(key => uploadData.append(key, formData[key]));
    if (selectedFile) uploadData.append('issue_proof', selectedFile);

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
          setFormData(prev => ({...prev, title: '', description: ''}));
          onTicketAdded();
        }, 1800);
      }
    } catch (err) {
      alert("Submission failed.");
    } finally {
      if (!isSuccess) setIsSubmitting(false);
    }
  };

  if (!isOpen) return (
    <button onClick={() => setIsOpen(true)} className="fixed bottom-10 right-10 bg-blue-600 text-white p-6 rounded-[2rem] shadow-2xl hover:scale-110 hover:bg-slate-900 transition-all z-40 group flex items-center gap-3">
      <PlusCircle size={28} strokeWidth={2.5}/>
      <span className="font-black uppercase text-xs tracking-widest hidden group-hover:block transition-all duration-300">New Request</span>
    </button>
  );

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-[3rem] w-full max-w-4xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="bg-white px-10 py-8 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-100">
               <UserCheck size={24} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Dispatch Request</h2>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Enterprise Routing Engine v3.0</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="bg-slate-100 p-3 rounded-2xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all active:scale-90"><X size={20}/></button>
        </div>

        {isSuccess ? (
          <div className="p-32 flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in">
            <div className="bg-emerald-500 p-6 rounded-[2.5rem] text-white shadow-2xl shadow-emerald-100">
              <CheckCircle2 size={80} />
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Synchronized!</h3>
              <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Agent notified via secure pipeline.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-10 grid grid-cols-1 lg:grid-cols-2 gap-10 max-h-[80vh] overflow-y-auto">
            
            {/* LEFT COLUMN: Issue Data */}
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
                <input 
                  type="text" placeholder="Issue title..." required
                  className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-blue-100 font-bold text-slate-800 transition-all"
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Documentation</label>
                <textarea 
                  placeholder="Provide technical context..." required
                  className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] h-48 outline-none focus:ring-4 focus:ring-blue-100 text-sm leading-relaxed transition-all resize-none"
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Attachment</label>
                <div className="relative group">
                  <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={(e) => setSelectedFile(e.target.files[0])} />
                  <div className={`p-5 rounded-[1.5rem] border-2 border-dashed flex items-center gap-4 transition-all ${selectedFile ? 'bg-blue-50 border-blue-400' : 'bg-slate-50 border-slate-200 group-hover:border-blue-300'}`}>
                    <div className={`${selectedFile ? 'bg-blue-600' : 'bg-slate-200'} p-3 rounded-xl text-white transition-colors`}>
                       {selectedFile ? <FileText size={20}/> : <Upload size={20}/>}
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-500 truncate">
                      {selectedFile ? selectedFile.name : 'Upload Proof (PNG/JPG)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Metadata & Config */}
            <div className="space-y-6">
              <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] space-y-4 shadow-xl">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Authenticated Identity</h4>
                 <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm font-bold"><User size={18} className="text-blue-500"/> {formData.buyer_name}</div>
                    <div className="flex items-center gap-3 text-sm font-bold"><Building2 size={18} className="text-blue-500"/> {formData.company}</div>
                 </div>
                 <div className="pt-4 border-t border-white/10 flex items-center gap-2 text-blue-400">
                    <AlertCircle size={14}/>
                    <span className="text-[9px] font-black uppercase tracking-widest">Metadata Locked to account</span>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase ml-1">Priority</label>
                  <select 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest focus:ring-4 focus:ring-blue-100 outline-none"
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase ml-1">Target</label>
                  <select 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest focus:ring-4 focus:ring-blue-100 outline-none"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Mail size={18}/></div>
                    <div className="flex-grow"><p className="text-[9px] font-black text-slate-400 uppercase">Confirmation Email</p><p className="text-sm font-bold">{formData.buyer_email}</p></div>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Smartphone size={18}/></div>
                    <div className="flex-grow"><p className="text-[9px] font-black text-slate-400 uppercase">Emergency Contact</p><p className="text-sm font-bold">{formData.buyer_phone}</p></div>
                 </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white font-black py-6 rounded-[2rem] shadow-2xl shadow-blue-200 flex items-center justify-center gap-3 uppercase text-xs tracking-[0.3em] hover:bg-slate-900 transition-all active:scale-95 mt-4"
              >
                {isSubmitting ? 'Syncing...' : <><Send size={20} /> Deploy Ticket</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}