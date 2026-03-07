import React, { useState } from 'react';
import axios from 'axios';
import { User, Mail, Phone, Lock, UserPlus, LogIn, ShieldCheck, ArrowRight } from 'lucide-react';

export default function Auth({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    first_name: '',
    mobile: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? 'login' : 'register';
    
    try {
      // Logic for Registering/Logging in via Application Tier
      const res = await axios.post(`http://127.0.0.1:8000/api/auth/${endpoint}/`, formData);
      
      // Store credentials to maintain persistent identity
      localStorage.setItem('token', res.data.token);
      onAuthSuccess();
    } catch (err) {
      alert(isLogin ? "Login Failed. Check credentials." : "Registration failed.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in duration-500">
      <div className="bg-blue-600 p-8 text-center text-white">
        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
          {isLogin ? <LogIn size={32} /> : <UserPlus size={32} />}
        </div>
        <h2 className="text-2xl font-black tracking-tight uppercase">
          {isLogin ? 'Buyer Login' : 'Buyer Registration'}
        </h2>
        <p className="text-blue-100 text-xs font-bold mt-2 uppercase tracking-widest">
          Secured Enterprise Portal
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-4">
        {!isLogin && (
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
            <div className="relative">
              <Phone className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <input
                type="text" placeholder="Mobile Number" required
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                onChange={(e) => setFormData({...formData, mobile: e.target.value})}
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
          className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition-all flex items-center justify-center gap-2 mt-4"
        >
          {isLogin ? 'Enter Portal' : 'Create Account'} <ArrowRight size={16}/>
        </button>

        <p className="text-center text-xs font-bold text-slate-400 uppercase mt-6">
          {isLogin ? "New user?" : "Already have an account?"}
          <button 
            type="button" onClick={() => setIsLogin(!isLogin)}
            className="ml-2 text-blue-600 hover:underline"
          >
            {isLogin ? 'Register Now' : 'Login here'}
          </button>
        </p>
      </form>
      
      <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
        <ShieldCheck size={12}/> PostgreSQL Linked Identity Verification
      </div>
    </div>
  );
}