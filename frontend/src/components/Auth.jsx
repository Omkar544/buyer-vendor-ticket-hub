import React, { useState } from 'react';
import axios from 'axios';
import { 
  User, Mail, Lock, LogIn, ShieldCheck, ArrowRight, 
  Loader2, UserCog, Building2, Smartphone, ShieldAlert, KeyRound, Eye, EyeOff 
} from 'lucide-react';

export default function Auth({ onAuthSuccess }) {
  const [mode, setMode] = useState('BUYER_LOGIN'); 
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    name: '',    // Used for First Name
    surname: '', // ADDED: For Surname UI
    phone: '',
    company: 'YBL',
    department_name: '' 
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    let endpoint = '';
    
    // COMBINE NAME AND SURNAME FOR BACKEND COMPATIBILITY
    const combinedFullName = `${formData.name} ${formData.surname}`.trim();
    
    let payload = { username: formData.username, password: formData.password };

    if (mode.includes('LOGIN')) {
      endpoint = 'auth/login';
    } 
    else if (mode === 'BUYER_REGISTER') {
      endpoint = 'auth/register';
      payload = { 
        ...payload, 
        email: formData.email, 
        name: combinedFullName, // Sends combined string to your existing 'name' field
        phone: formData.phone, 
        company: formData.company 
      };
    } 
    else if (mode === 'VENDOR_REGISTER') {
      endpoint = 'auth/register-vendor';
      payload = { 
        ...payload, 
        email: formData.email, 
        name: combinedFullName, // Sends combined string to your existing 'name' field
        department_name: formData.department_name 
      };
    }

    try {
      const res = await axios.post(`http://127.0.0.1:8000/api/${endpoint}/`, payload);

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('username', res.data.username);
      localStorage.setItem('role', res.data.is_superuser ? 'ADMIN' : res.data.is_staff ? 'VENDOR' : 'BUYER');

      if (res.data.phone) localStorage.setItem('phone', res.data.phone);
      if (res.data.company) localStorage.setItem('company', res.data.company);
      if (res.data.email) localStorage.setItem('email', res.data.email);
      if (res.data.name) localStorage.setItem('name', res.data.name);

      onAuthSuccess(
        res.data.username,
        res.data.is_staff,
        res.data.category,
        res.data.is_superuser
      );

    } catch (err) {
      alert(err.response?.data?.error || "Authentication failed. Secure pipeline blocked.");
    } finally {
      setLoading(false);
    }
  };

  const isVendorMode = mode.startsWith('VENDOR');
  const isAdminMode = mode.startsWith('ADMIN');
  const isRegistering = mode.endsWith('REGISTER');

  const theme = isAdminMode ? 'red' : isVendorMode ? 'slate' : 'blue';

  return (
    <div className="w-full max-w-xl mx-auto my-12 animate-in fade-in zoom-in duration-700">
      <div className="bg-white rounded-[4rem] border-2 border-slate-100 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden">
        
        {/* HEADER SECTION */}
        <div className={`relative p-12 text-center text-white overflow-hidden transition-all duration-500 ${
          theme === 'red' ? 'bg-red-600' : theme === 'slate' ? 'bg-slate-900' : 'bg-blue-600'
        }`}>
          <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
            <ShieldCheck size={180} />
          </div>
          
          <div className="relative z-10">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl border border-white/30 transition-transform hover:scale-110">
              {isAdminMode ? <ShieldAlert size={48} /> : isVendorMode ? <UserCog size={48} /> : <KeyRound size={48} />}
            </div>
            <h2 className="text-4xl font-black uppercase tracking-tighter italic">
              {isAdminMode ? 'System Admin' : mode.replace('_', ' ')}
            </h2>
            <p className="text-white/80 text-xs font-black mt-3 uppercase tracking-[0.4em]">
              {isAdminMode ? 'Master Access' : isVendorMode ? 'Expert Interface' : 'Secure Entry'}
            </p>
          </div>
        </div>

        {/* ROLE SELECTOR TABS */}
        {!isRegistering && (
          <div className="flex bg-slate-50/80 p-2 m-6 rounded-[2rem] border border-slate-100 shadow-inner">
            <button type="button" onClick={() => setMode('BUYER_LOGIN')}
              className={`flex-1 py-5 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all ${mode.startsWith('BUYER') ? 'bg-white text-blue-600 shadow-xl scale-[1.02]' : 'text-slate-400 hover:text-slate-600'}`}>
              Buyer
            </button>
            <button type="button" onClick={() => setMode('VENDOR_LOGIN')}
              className={`flex-1 py-5 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all ${mode.startsWith('VENDOR') ? 'bg-white text-slate-900 shadow-xl scale-[1.02]' : 'text-slate-400 hover:text-slate-600'}`}>
              Vendor
            </button>
            <button type="button" onClick={() => setMode('ADMIN_LOGIN')}
              className={`flex-1 py-5 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all ${mode.startsWith('ADMIN') ? 'bg-white text-red-600 shadow-xl scale-[1.02]' : 'text-slate-400 hover:text-slate-600'}`}>
              Admin
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-12 pt-4 space-y-6">
          
          {isRegistering && (
            <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
              {/* UPDATED: NAME & SURNAME ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="relative">
                  <User className="absolute left-6 top-6 text-slate-400" size={24} />
                  <input type="text" placeholder="First Name" required
                    className="w-full pl-16 pr-6 py-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] text-lg font-bold focus:ring-8 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                    onChange={(e)=>setFormData({...formData, name:e.target.value})}/>
                </div>
                <div className="relative">
                  <User className="absolute left-6 top-6 text-slate-400" size={24} />
                  <input type="text" placeholder="Surname" required
                    className="w-full pl-16 pr-6 py-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] text-lg font-bold focus:ring-8 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                    onChange={(e)=>setFormData({...formData, surname:e.target.value})}/>
                </div>
              </div>

              <div className="relative">
                <Mail className="absolute left-6 top-6 text-slate-400" size={24} />
                <input type="email" placeholder="Email" required
                  className="w-full pl-16 pr-6 py-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] text-lg font-bold focus:ring-8 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                  onChange={(e)=>setFormData({...formData, email:e.target.value})}/>
              </div>

              {mode === 'BUYER_REGISTER' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="relative">
                    <Smartphone className="absolute left-6 top-6 text-slate-400" size={24} />
                    <input type="text" placeholder="Phone" required
                      className="w-full pl-16 pr-6 py-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] text-lg font-bold focus:ring-8 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder:text-slate-300"
                      onChange={(e)=>setFormData({...formData, phone:e.target.value})}/>
                  </div>
                  <div className="relative">
                    <Building2 className="absolute left-6 top-6 text-slate-400" size={24} />
                    <input type="text" placeholder="Company" defaultValue="YBL"
                      className="w-full pl-16 pr-6 py-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] text-lg font-bold focus:ring-8 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder:text-slate-300"
                      onChange={(e)=>setFormData({...formData, company:e.target.value})}/>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-6">
            <div className="relative">
              <User className="absolute left-6 top-6 text-slate-400" size={24} />
              <input type="text" placeholder="Username" required
                className="w-full pl-16 pr-6 py-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] text-lg font-bold focus:ring-8 focus:ring-slate-100 outline-none transition-all placeholder:text-slate-300"
                onChange={(e)=>setFormData({...formData, username:e.target.value})}/>
            </div>

            <div className="relative group">
              <Lock className="absolute left-6 top-6 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={24} />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                required
                className="w-full pl-16 pr-16 py-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] text-lg font-bold focus:ring-8 focus:ring-slate-100 outline-none transition-all placeholder:text-slate-300"
                onChange={(e)=>setFormData({...formData, password:e.target.value})}/>
              
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-6 top-6 p-1 text-slate-400 hover:text-slate-600 transition-all active:scale-90"
              >
                {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className={`w-full py-8 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.4em] flex items-center justify-center gap-4 shadow-2xl active:scale-95 transition-all text-white border-b-8 ${
              theme === 'red' ? 'bg-red-600 border-red-800' : theme === 'slate' ? 'bg-slate-900 border-slate-700' : 'bg-blue-600 border-blue-800'
            }`}>
            {loading ? <Loader2 className="animate-spin" size={28}/> : <>{isRegistering ? 'Initialize Account' : 'Authenticate Access'} <ArrowRight size={24}/></>}
          </button>

          <div className="pt-6 text-center space-y-4">
            {mode === 'BUYER_LOGIN' && (
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                New User? <button type="button" onClick={() => setMode('BUYER_REGISTER')} className="text-blue-600 hover:underline">Register Pipeline</button>
              </p>
            )}
            {mode === 'VENDOR_LOGIN' && (
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                New Agent? <button type="button" onClick={() => setMode('VENDOR_REGISTER')} className="text-slate-900 hover:underline">Apply Deployment</button>
              </p>
            )}
            {isRegistering && (
              <button type="button" onClick={() => setMode(isVendorMode ? 'VENDOR_LOGIN' : 'BUYER_LOGIN')} className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">
                Existing Profile? Return to Authentication
              </button>
            )}
          </div>
        </form>

        <div className="p-8 bg-slate-50 border-t-2 border-slate-100 text-center text-[10px] font-black text-slate-400 uppercase flex items-center justify-center gap-4 tracking-[0.3em]">
          <ShieldCheck size={16} className="text-emerald-500" /> PostgreSQL Role-Based Authorization Active
        </div>
      </div>
    </div>
  );
}