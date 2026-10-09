import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Flame, Lock, Mail, ArrowRight, ShieldAlert, Zap } from 'lucide-react';

export const LoginPage = () => {
  const { login, quickDemoLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      await quickDemoLogin();
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to authenticate demo user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-abyss flex items-center justify-center p-4 cyber-grid relative overflow-hidden">
      {/* Glow Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-sos-crimson/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-sos-cyan/15 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl backdrop-blur-xl z-10">
        
        {/* Logo */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sos-crimson/20 to-sos-violet/20 border border-sos-crimson/50 flex items-center justify-center text-sos-crimson shadow-sm mb-3">
            <Flame className="w-8 h-8 animate-pulse" />
          </div>
          <h1 className="text-2xl font-black font-mono tracking-wider text-white">
            DEADLINE<span className="text-sos-crimson">SOS</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Academic Emergency & Priority Platform
          </p>
        </div>

        {/* 1-Click Demo Login Button */}
        <div className="mb-6">
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-mono font-bold uppercase tracking-wider shadow-sm hover:opacity-95 transition-all active:scale-98 cursor-pointer"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>1-Click Demo Access (Alex Vance)</span>
          </button>
          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-surface-border"></div>
            <span className="flex-shrink mx-4 text-[10px] font-mono text-slate-500 uppercase">Or sign in with email</span>
            <div className="flex-grow border-t border-surface-border"></div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-sos-crimson/15 border border-sos-crimson/40 text-sos-crimson text-xs font-mono flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono uppercase font-bold text-slate-300 mb-1.5">
              University Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="alex.dev@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase font-bold text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4 text-sos-cyan" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400 font-mono">
          Don't have an account?{' '}
          <Link to="/register" className="text-sos-cyan hover:underline font-bold">
            Create Profile
          </Link>
        </div>

      </div>
    </div>
  );
};
