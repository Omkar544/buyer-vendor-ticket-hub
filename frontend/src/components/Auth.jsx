import React, { useState } from 'react';
import axios from 'axios';
import { User, Mail, Phone, Lock, UserPlus, LogIn, ShieldCheck, ArrowRight, Loader2, UserCog } from 'lucide-react';

export default function Auth({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isVendorLogin, setIsVendorLogin] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    first_name: '',
    mobile: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Vendors are restricted to the login endpoint
    const endpoint = isLogin ? 'login' : 'register';
    
    const payload = isLogin 
      ? { username: formData.username, password: formData.password }
      : { 
          username: formData.username, 
          password: formData.password, 
          email: formData.email,
          first_name: formData.first_name 
        };

    try {
      const res = await axios.post(`http://127.0.0.1:8000/api/auth/${endpoint}/`, payload);
      
      // Store core identity data in the Client Tier
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('username', res.data.username);
      localStorage.setItem('role', res.data.is_staff ? 'VENDOR' : 'BUYER');
      
      // Store the specific department category (TECHNICAL, BILLING, HARDWARE)
      if (res.data.category) {
        localStorage.setItem('vendorCategory', res.data.category);
      }
      
      // Pass both username and the staff flag to App.jsx for routing
      onAuthSuccess(res.data.username, res.data.is_staff, res.data.category);
      
    } catch (err) {
      const errorMsg = err.response?.data?.error || (isLogin ? "Login Failed. Check credentials." : "Registration failed.");
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in duration-500">
      <div className={`${isVendorLogin ? 'bg-slate-900' : 'bg-blue-600'} p-8 text-center text-white transition-colors duration-300`}>
        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
          {isVendorLogin ? <UserCog size={32} /> : (isLogin ? <LogIn size={32} /> : <UserPlus size={32} />)}
        </div>
        <h2 className="text-2xl font-black tracking-tight uppercase">
          {isVendorLogin ? 'Vendor Portal' : (isLogin ? 'Buyer Login' : 'Buyer Registration')}
        </h2>
        <p className="text-blue-100 text-[10px] font-bold mt-2 uppercase tracking-widest opacity-80">
          {isVendorLogin ? 'Technical • Billing • Hardware' : 'Secured Enterprise Identity'}
        </p>
      </div>

      <div className="flex border-b border-slate-100">
        <button 
          type="button"
          onClick={() => { setIsVendorLogin(false); setIsLogin(true); }}
          className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${!isVendorLogin ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}
        >
          Buyer Access
        </button>
        <button 
          type="button"
          onClick={() => { setIsVendorLogin(true); setIsLogin(true); }}
          className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${isVendorLogin ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-400'}`}
        >
          Vendor Portal
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-4">
        {!isLogin && !isVendorLogin && (
          <>
            <div className="relative">
              <User className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <input
                type="text" placeholder="Full Name" required
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <input
                type="email" placeholder="Email Address" required
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </>
        )}

        <div className="relative">
          <User className="absolute left-4 top-3.5 text-slate-400" size={18} />
          <input
            type="text" placeholder="Username" required
            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            onChange={(e) => setFormData({...formData, username: e.target.value})}
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
          <input
            type="password" placeholder="Password" required
            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
        </div>

        <button 
          type="submit"
          disabled={loading}
          className={`w-full ${isVendorLogin ? 'bg-slate-900' : 'bg-blue-600'} text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:opacity-90 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50`}
        >
          {loading ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <>{isLogin ? 'Secure Sign In' : 'Create Account'} <ArrowRight size={16}/></>
          )}
        </button>

        {!isVendorLogin && (
          <p className="text-center text-[10px] font-bold text-slate-400 uppercase mt-6 tracking-widest">
            {isLogin ? "New buyer?" : "Already a member?"}
            <button 
              type="button" onClick={() => setIsLogin(!isLogin)}
              className="ml-2 text-blue-600 hover:underline"
            >
              {isLogin ? 'Register Now' : 'Login here'}
            </button>
          </p>
        )}
      </form>
      
      <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
        <ShieldCheck size={12}/> PostgreSQL Linked Identity Verification
      </div>
    </div>
  );
}