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

    // Standard Login for all roles
    if (mode.includes('LOGIN')) {
      endpoint = 'auth/login';
    } else if (mode === 'BUYER_REGISTER') {
      endpoint = 'auth/register';
      payload = { ...payload, email: formData.email, name: formData.name, phone: formData.phone, company: formData.company };
    } else if (mode === 'VENDOR_REGISTER') {
      endpoint = 'auth/register-vendor';
      payload = { ...payload, email: formData.email, department_name: formData.department_name };
    }

    try {
      const res = await axios.post(`http://127.0.0.1:8000/api/${endpoint}/`, payload);
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('username', res.data.username);
      
      // Save metadata for pre-filling tickets
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
      alert(err.response?.data?.error || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const isVendorMode = mode.startsWith('VENDOR');
  const isAdminMode = mode.startsWith('ADMIN');

  const getHeaderStyle = () => {
    if (isAdminMode) return 'bg-red-600';
    if (isVendorMode) return 'bg-slate-900';
    return 'bg-blue-600';
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in duration-500">
      
      {/* Dynamic Header */}
      <div className={`${getHeaderStyle()} p-8 text-center text-white transition-colors duration-500 relative`}>
        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
          {isAdminMode ? <ShieldAlert size={32} /> : isVendorMode ? <UserCog size={32} /> : <LogIn size={32} />}
        </div>
        <h2 className="text-2xl font-black tracking-tight uppercase">
          {isAdminMode ? 'System Admin' : mode.replace('_', ' ')}
        </h2>
        <p className="text-white/80 text-[10px] font-bold mt-2 uppercase tracking-widest opacity-80">
          {isAdminMode ? 'Global Command Center' : isVendorMode ? 'Vendor Management Portal' : 'Buyer Support Access'}
        </p>
      </div>

      {/* THREE-WAY ROLE SELECTION TABS */}
      <div className="flex border-b border-slate-100 bg-slate-50/50">
        <button type="button" onClick={() => setMode('BUYER_LOGIN')} 
          className={`flex-1 py-4 text-[9px] font-black uppercase tracking-widest transition-all ${mode.startsWith('BUYER') ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-slate-400'}`}>
          Buyer
        </button>
        <button type="button" onClick={() => setMode('VENDOR_LOGIN')} 
          className={`flex-1 py-4 text-[9px] font-black uppercase tracking-widest transition-all ${mode.startsWith('VENDOR') ? 'text-slate-900 border-b-2 border-slate-900 bg-white' : 'text-slate-400'}`}>
          Vendor
        </button>
        <button type="button" onClick={() => setMode('ADMIN_LOGIN')} 
          className={`flex-1 py-4 text-[9px] font-black uppercase tracking-widest transition-all ${mode.startsWith('ADMIN') ? 'text-red-600 border-b-2 border-red-600 bg-white' : 'text-slate-400'}`}>
          Admin
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-4">
        
        {/* Registration-Only Fields: Full Name, Phone, Company */}
        {mode === 'BUYER_REGISTER' && (
          <div className="space-y-4 animate-in slide-in-from-top-2">
             <div className="relative">
              <User className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <input type="text" placeholder="Full Name" required className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none" onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <Smartphone className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <input type="text" placeholder="Phone" required className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none" onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="relative">
                <Building2 className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <input type="text" placeholder="Company" defaultValue="YBL" className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none" onChange={(e) => setFormData({...formData, company: e.target.value})} />
              </div>
            </div>
          </div>
        )}

        {/* Vendor-Only Field: Department Name */}
        {mode === 'VENDOR_REGISTER' && (
          <div className="relative animate-in slide-in-from-top-2">
            <Building2 className="absolute left-4 top-3.5 text-blue-500" size={18} />
            <input type="text" placeholder="Department Name (e.g. TECHNICAL)" required className="w-full pl-12 pr-4 py-3.5 bg-blue-50/30 border border-blue-100 rounded-2xl text-sm font-bold outline-none" onChange={(e) => setFormData({...formData, department_name: e.target.value})} />
          </div>
        )}

        {/* Common Email Field for Registration */}
        {(mode.includes('REGISTER')) && (
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
            <input type="email" placeholder="Email Address" required className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none" onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>
        )}

        {/* Always Visible: Username and Password */}
        <div className="relative">
          <User className="absolute left-4 top-3.5 text-slate-400" size={18} />
          <input type="text" placeholder="Username" required className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500" onChange={(e) => setFormData({...formData, username: e.target.value})} />
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
          <input type="password" placeholder="Password" required className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500" onChange={(e) => setFormData({...formData, password: e.target.value})} />
        </div>

        <button type="submit" disabled={loading} 
          className={`w-full ${isAdminMode ? 'bg-red-600' : isVendorMode ? 'bg-slate-900' : 'bg-blue-600'} text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 mt-4 transition-all active:scale-95`}>
          {loading ? <Loader2 className="animate-spin" size={16} /> : (
            <>{mode.includes('LOGIN') ? 'Secure Sign In' : 'Create Account'} <ArrowRight size={16}/></>
          )}
        </button>

        {/* Toggle between Login and Register (Hidden for Admin) */}
        {!isAdminMode && (
          <p className="text-center text-[10px] font-bold text-slate-400 uppercase mt-6 tracking-widest">
            {mode.includes('LOGIN') ? "First time here?" : "Already have an account?"}
            <button type="button" onClick={() => {
                if (isVendorMode) setMode(mode === 'VENDOR_LOGIN' ? 'VENDOR_REGISTER' : 'VENDOR_LOGIN');
                else setMode(mode === 'BUYER_LOGIN' ? 'BUYER_REGISTER' : 'BUYER_LOGIN');
              }} className="ml-2 text-blue-600 hover:underline">
              {mode.includes('LOGIN') ? 'Register Now' : 'Login here'}
            </button>
          </p>
        )}

        {isAdminMode && (
          <p className="text-center text-[10px] font-bold text-slate-400 uppercase mt-6 tracking-widest italic">
            * Restricted to System Administrators
          </p>
        )}
      </form>
      
      <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
        <ShieldCheck size={12}/> Role-Based PostgreSQL Authentication
      </div>
    </div>
  );
}