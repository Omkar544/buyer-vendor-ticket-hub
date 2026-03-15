import React, { useState } from 'react';
import axios from 'axios';
import { User, Mail, Lock, LogIn, ShieldCheck, ArrowRight, Loader2, UserCog, Building2, Smartphone, ShieldAlert } from 'lucide-react';

export default function Auth({ onAuthSuccess }) {
  const [mode, setMode] = useState('BUYER_LOGIN'); 
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    name: '',
    phone: '',
    company: 'YBL',
    department_name: '' 
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    let endpoint = '';
    let payload = { username: formData.username, password: formData.password };

    if (mode.includes('LOGIN')) {
      endpoint = 'auth/login';
    } 
    else if (mode === 'BUYER_REGISTER') {
      endpoint = 'auth/register';
      payload = { ...payload, email: formData.email, name: formData.name, phone: formData.phone, company: formData.company };
    } 
    else if (mode === 'VENDOR_REGISTER') {
      endpoint = 'auth/register-vendor';
      payload = { ...payload, email: formData.email, department_name: formData.department_name };
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
      alert(err.response?.data?.error || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const isVendorMode = mode.startsWith('VENDOR');
  const isAdminMode = mode.startsWith('ADMIN');
  const isRegistering = mode.endsWith('REGISTER');

  const getHeaderStyle = () => {
    if (isAdminMode) return 'bg-red-600';
    if (isVendorMode) return 'bg-slate-900';
    return 'bg-blue-600';
  };

  return (
    <div className="w-[95%] sm:w-full max-w-md mx-auto my-8 bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
      
      {/* HEADER SECTION */}
      <div className={`${getHeaderStyle()} p-8 text-center text-white transition-colors duration-500`}>
        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
          {isAdminMode ? <ShieldAlert size={32} /> : isVendorMode ? <UserCog size={32} /> : <LogIn size={32} />}
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tight">
          {isAdminMode ? 'System Admin' : mode.replace('_', ' ')}
        </h2>
        <p className="text-white/70 text-[10px] font-bold mt-2 uppercase tracking-[0.2em]">
          {isAdminMode ? 'Global Command Center' : isVendorMode ? 'Vendor Management Portal' : 'Buyer Support Access'}
        </p>
      </div>

      {/* ROLE SELECTOR TABS */}
      {!isRegistering && (
        <div className="flex border-b bg-slate-50/50">
          <button type="button" onClick={() => setMode('BUYER_LOGIN')}
          className={`flex-1 py-4 text-[10px] font-black uppercase transition-all ${mode.startsWith('BUYER') ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-slate-400 hover:text-slate-600'}`}>
            Buyer
          </button>
          <button type="button" onClick={() => setMode('VENDOR_LOGIN')}
          className={`flex-1 py-4 text-[10px] font-black uppercase transition-all ${mode.startsWith('VENDOR') ? 'text-slate-900 border-b-2 border-slate-900 bg-white' : 'text-slate-400 hover:text-slate-600'}`}>
            Vendor
          </button>
          <button type="button" onClick={() => setMode('ADMIN_LOGIN')}
          className={`flex-1 py-4 text-[10px] font-black uppercase transition-all ${mode.startsWith('ADMIN') ? 'text-red-600 border-b-2 border-red-600 bg-white' : 'text-slate-400 hover:text-slate-600'}`}>
            Admin
          </button>
        </div>
      )}

      {/* FORM SECTION */}
      <form onSubmit={handleSubmit} className="p-8 space-y-4">
        
        {isRegistering && (
          <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
            <div className="relative">
              <User className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <input type="text" placeholder="Full Name" required
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={(e)=>setFormData({...formData,name:e.target.value})}/>
            </div>

            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <input type="email" placeholder="Email Address" required
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={(e)=>setFormData({...formData,email:e.target.value})}/>
            </div>

            {mode === 'BUYER_REGISTER' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <Smartphone className="absolute left-4 top-3.5 text-slate-400" size={18} />
                  <input type="text" placeholder="Phone" required
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                  onChange={(e)=>setFormData({...formData,phone:e.target.value})}/>
                </div>
                <div className="relative">
                  <Building2 className="absolute left-4 top-3.5 text-slate-400" size={18} />
                  <input type="text" placeholder="Company" defaultValue="YBL"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                  onChange={(e)=>setFormData({...formData,company:e.target.value})}/>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="relative">
          <User className="absolute left-4 top-3.5 text-slate-400" size={18} />
          <input type="text" placeholder="Username" required
          className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          onChange={(e)=>setFormData({...formData,username:e.target.value})}/>
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
          <input type="password" placeholder="Password" required
          className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          onChange={(e)=>setFormData({...formData,password:e.target.value})}/>
        </div>

        <button type="submit" disabled={loading}
        className={`w-full ${isAdminMode ? 'bg-red-600' : isVendorMode ? 'bg-slate-900' : 'bg-blue-600'} text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all`}>
          {loading ? <Loader2 className="animate-spin" size={16}/> : <>{isRegistering ? 'Create Account' : 'Secure Sign In'} <ArrowRight size={16}/></>}
        </button>

        {/* REGISTRATION TOGGLE LINKS */}
        <div className="pt-4 text-center">
          {mode === 'BUYER_LOGIN' && (
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              First time here? <button type="button" onClick={() => setMode('BUYER_REGISTER')} className="text-blue-600 hover:underline">Register Now</button>
            </p>
          )}
          {mode === 'VENDOR_LOGIN' && (
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              New Agent? <button type="button" onClick={() => setMode('VENDOR_REGISTER')} className="text-slate-900 hover:underline">Apply Here</button>
            </p>
          )}
          {isRegistering && (
            <button type="button" onClick={() => setMode(isVendorMode ? 'VENDOR_LOGIN' : 'BUYER_LOGIN')} className="text-[10px] font-bold text-slate-400 uppercase hover:text-slate-600 transition-colors">
              Already have an account? Sign In
            </button>
          )}
        </div>
      </form>

      <div className="p-4 bg-slate-50 border-t text-center text-[9px] font-black text-slate-400 uppercase flex items-center justify-center gap-2 tracking-[0.2em]">
        <ShieldCheck size={12}/> Role Based PostgreSQL Authentication
      </div>
    </div>
  );
}