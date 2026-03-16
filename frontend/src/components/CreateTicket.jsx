import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Send, X, UserCheck, Smartphone, Mail, CheckCircle2, 
  Upload, FileText, AlertCircle, Building2, User, ShieldCheck, Loader2, Info, Activity
} from 'lucide-react';

export default function CreateTicket({ onTicketAdded }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [categories, setCategories] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '', 
    priority: 'LOW',
    company: '',
    buyer_name: '',
    buyer_email: '', 
    buyer_phone: ''
  });

  useEffect(() => {
    // 1. Initial Load of Category Data
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/get-categories/');
        setCategories(response.data);
        if (response.data.length > 0) {
          setFormData(prev => ({ ...prev, category: response.data[0].id }));
        }
      } catch (err) {
        console.error("Failed to load pipeline categories:", err);
      }
    };

    // 2. Initial Sync of Profile Data
    setFormData(prev => ({
      ...prev,
      buyer_email: localStorage.getItem('email') || '',
      buyer_phone: localStorage.getItem('phone') || '',
      company: localStorage.getItem('company') || 'YBL',
      buyer_name: localStorage.getItem('name') || localStorage.getItem('username') || 'Guest',
    }));

    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    // CRITICAL SAFETY CHECK: Grab fresh values directly from localStorage to prevent "Blank Field" errors
    const email = formData.buyer_email || localStorage.getItem('email');
    const name = formData.buyer_name || localStorage.getItem('name') || localStorage.getItem('username');
    const company = formData.company || localStorage.getItem('company') || 'YBL';

    if (!email) {
      return alert("Authentication Error: Your email was not found. Please log out and log back in.");
    }

    if (!formData.category) {
      return alert("Validation Error: Please select a target Team.");
    }

    setIsSubmitting(true);
    const uploadData = new FormData();
    
    // Manual append to ensure "Locked" fields are definitely populated
    uploadData.append('title', formData.title);
    uploadData.append('description', formData.description);
    uploadData.append('category', formData.category);
    uploadData.append('priority', formData.priority);
    
    // These fields are required by your Serializer
    uploadData.append('buyer_email', email);
    uploadData.append('buyer_name', name);
    uploadData.append('company', company);
    uploadData.append('buyer_phone', formData.buyer_phone || localStorage.getItem('phone') || '');
    
    if (selectedFile) uploadData.append('issue_proof', selectedFile);

    try {
      await axios.post('http://127.0.0.1:8000/api/tickets/', uploadData, {
        headers: { 
          'Authorization': `Token ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onTicketAdded(); 
      }, 2000);
    } catch (err) {
      console.error("DJANGO REJECTION:", err.response?.data);
      alert(`Submission failed: ${JSON.stringify(err.response?.data)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-4xl bg-white rounded-[4rem] p-40 shadow-2xl border-4 border-emerald-500 text-center space-y-8 animate-in zoom-in">
        <div className="bg-emerald-500 w-32 h-32 rounded-[3rem] flex items-center justify-center mx-auto text-white shadow-2xl">
          <CheckCircle2 size={80} />
        </div>
        <div className="space-y-4">
          <h3 className="text-6xl font-black text-slate-900 tracking-tighter uppercase italic">SYNCED</h3>
          <p className="text-slate-400 font-black uppercase text-sm tracking-[0.5em]">Ticket Dispatched to Master Pipeline</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl bg-white rounded-[4rem] shadow-2xl border-2 border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-10">
      
      <div className="bg-blue-600 p-16 text-white relative">
        <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12"><Activity size={200}/></div>
        <div className="relative z-10 flex items-center gap-8">
          <div className="bg-white/20 p-6 rounded-[2rem] backdrop-blur-xl border border-white/30">
            <ShieldCheck size={48} />
          </div>
          <div>
            <h2 className="text-6xl font-black tracking-tighter uppercase italic">Dispatch Request</h2>
            <p className="text-xs font-black uppercase tracking-[0.6em] opacity-80 mt-2">Enterprise Master Engine v3.0 // Secure Link</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-16 grid grid-cols-1 lg:grid-cols-2 gap-20">
        
        <div className="space-y-12">
          <div className="space-y-4">
            <label className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] ml-4 flex items-center gap-3">
              <FileText size={18} className="text-blue-600"/> Ticket Subject
            </label>
            <input 
              type="text" required
              className="w-full p-8 bg-slate-50 border-4 border-slate-50 rounded-[2.5rem] outline-none focus:ring-8 focus:ring-blue-50 font-black text-2xl text-slate-800 transition-all placeholder:text-slate-300"
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="space-y-4">
            <label className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] ml-4 flex items-center gap-3">
              <Info size={18} className="text-blue-600"/> Documentation
            </label>
            <textarea 
              required
              className="w-full p-8 bg-slate-50 border-4 border-slate-50 rounded-[2.5rem] h-80 outline-none focus:ring-8 focus:ring-blue-50 text-xl font-bold leading-relaxed resize-none"
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-12">
          <div className="bg-slate-900 text-white p-12 rounded-[3.5rem] space-y-8 shadow-2xl border-b-8 border-slate-800">
             <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-400 border-l-4 border-blue-400 pl-4">Locked Identity</h4>
             <div className="space-y-6">
                <div className="flex items-center gap-5 text-2xl font-black"><User size={32} className="text-blue-500"/> {formData.buyer_name}</div>
                <div className="flex items-center gap-5 text-xl font-black text-slate-400 truncate"><Mail size={24} className="text-blue-500"/> {formData.buyer_email}</div>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase ml-4 tracking-widest">SLA Priority</label>
              <select 
                className="w-full p-6 bg-slate-50 border-4 border-slate-50 rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] focus:ring-8 focus:ring-blue-50 outline-none cursor-pointer"
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase ml-4 tracking-widest">Target Team</label>
              <select 
                className="w-full p-6 bg-slate-50 border-4 border-slate-50 rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] focus:ring-8 focus:ring-blue-50 outline-none cursor-pointer"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: parseInt(e.target.value)})}
              >
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
          </div>

          <div className="relative group">
            <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={(e) => setSelectedFile(e.target.files[0])} />
            <div className={`p-10 rounded-[3rem] border-4 border-dashed flex items-center gap-8 transition-all ${selectedFile ? 'bg-blue-50 border-blue-400' : 'bg-slate-50 border-slate-200 group-hover:border-blue-300'}`}>
              <Upload size={40} className={selectedFile ? 'text-blue-600' : 'text-slate-300'}/>
              <span className="text-lg font-black uppercase tracking-widest text-slate-500 truncate">
                {selectedFile ? selectedFile.name : 'Attach Proof'}
              </span>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white font-black py-10 rounded-[3rem] shadow-2xl flex items-center justify-center gap-6 uppercase text-xl tracking-[0.4em] hover:bg-slate-900 transition-all active:scale-95 border-b-8 border-blue-800"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={40} /> : <><Send size={40} /> Deploy Request</>}
          </button>
        </div>
      </form>
    </div>
  );
}