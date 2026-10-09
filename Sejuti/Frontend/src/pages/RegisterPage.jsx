import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Flame, Lock, Mail, User, Sliders, ArrowRight, ShieldAlert } from 'lucide-react';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dailyCapacityHours, setDailyCapacityHours] = useState(4);
  const [peakHours, setPeakHours] = useState('night');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await register(name, email, password, dailyCapacityHours, peakHours);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-abyss flex items-center justify-center p-4 cyber-grid relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-sos-violet/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-sos-crimson/15 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-surface/80 border border-surface-border-bright rounded-3xl p-8 shadow-2xl backdrop-blur-xl z-10">
        
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sos-cyan/20 to-sos-violet/20 border border-sos-cyan/50 flex items-center justify-center text-sos-cyan shadow-glow-cyan mb-2">
            <Flame className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-black font-mono tracking-wider text-white">
            INITIALIZE <span className="text-sos-cyan">PROFILE</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Configure your academic capacity thresholds
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-sos-crimson/15 border border-sos-crimson/40 text-sos-crimson text-xs font-mono flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono uppercase font-bold text-slate-300 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="Alex Vance"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase font-bold text-slate-300 mb-1">
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
                className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase font-bold text-slate-300 mb-1">
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
                className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs font-mono"
              />
            </div>
          </div>

          {/* Daily Capacity & Peak */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[10px] font-mono uppercase font-bold text-slate-400 mb-1">
                Study Cap: {dailyCapacityHours}h/day
              </label>
              <input
                type="range"
                min="1"
                max="12"
                value={dailyCapacityHours}
                onChange={(e) => setDailyCapacityHours(Number(e.target.value))}
                className="w-full accent-sos-cyan cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase font-bold text-slate-400 mb-1">
                Peak Energy
              </label>
              <select
                value={peakHours}
                onChange={(e) => setPeakHours(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg glass-input text-xs font-mono bg-abyss cursor-pointer"
              >
                <option value="morning">Morning (8-12)</option>
                <option value="afternoon">Afternoon (13-17)</option>
                <option value="night">Night Owl (19-23)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-sos-cyan to-sos-violet text-slate-950 font-bold text-xs font-mono uppercase tracking-wider shadow-glow-cyan hover:opacity-95 transition-all cursor-pointer"
          >
            <span>{isLoading ? 'Creating Profile...' : 'Complete Registration'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400 font-mono">
          Already registered?{' '}
          <Link to="/login" className="text-sos-cyan hover:underline font-bold">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
};
