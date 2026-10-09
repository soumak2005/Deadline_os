import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Flame, 
  LayoutDashboard, 
  CalendarDays, 
  CheckSquare, 
  BarChart3, 
  Plus, 
  LogOut, 
  User, 
  Sliders, 
  Bell, 
  Clock
} from 'lucide-react';
import { format } from 'date-fns';

export const Navbar = ({ onOpenAddTask, onOpenSettings }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Planner', path: '/planner', icon: CalendarDays },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full glass-panel border-b border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-sos-crimson/20 to-sos-violet/20 border border-sos-crimson/40 shadow-glow-crimson group-hover:border-sos-crimson transition-all">
                <Flame className="w-6 h-6 text-sos-crimson animate-pulse" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-sos-crimson animate-ping" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black tracking-wider text-white font-mono">DEADLINE<span className="text-sos-crimson">SOS</span></span>
                  <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-widest uppercase bg-sos-crimson/10 border border-sos-crimson/30 text-sos-crimson rounded">v1.0</span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono tracking-tight">ACADEMIC EMERGENCY ENGINE</p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-1 pl-4 border-l border-surface-border">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-sos-cyan/10 text-sos-cyan border border-sos-cyan/30 shadow-[0_0_15px_-3px_rgba(0,240,255,0.25)]'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-surface-hover/60 border border-transparent'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Area: Clock, Quick Add, User */}
          <div className="flex items-center gap-3">
            
            {/* Live UTC/Local Cyber Clock */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-abyss/80 border border-surface-border text-xs font-mono text-slate-400">
              <Clock className="w-3.5 h-3.5 text-sos-cyan" />
              <span>{format(currentTime, 'EEE dd MMM')}</span>
              <span className="text-sos-cyan font-bold">{format(currentTime, 'HH:mm:ss')}</span>
            </div>

            {/* Ingestion Trigger Button */}
            <button
              onClick={onOpenAddTask}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gradient-to-r from-sos-crimson to-rose-600 hover:from-rose-500 hover:to-sos-crimson text-white text-xs font-bold font-mono tracking-wide uppercase shadow-glow-crimson transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Ingest Deadline</span>
            </button>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-surface/80 hover:bg-surface-hover border border-surface-border text-left transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-sos-violet/20 border border-sos-violet/40 flex items-center justify-center font-bold text-sos-violet text-xs font-mono">
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AG'}
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-semibold text-slate-200 truncate max-w-[100px]">{user?.name || 'Academic'}</div>
                  <div className="text-[10px] text-sos-mint font-mono font-medium">{user?.dailyCapacityHours || 4}h/day cap</div>
                </div>
              </button>

              {/* Dropdown Menu */}
              {showProfileMenu && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowProfileMenu(false)} />
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-surface border border-surface-border shadow-2xl z-30 py-2 divide-y divide-surface-border">
                    <div className="px-4 py-2">
                      <p className="text-xs font-semibold text-slate-200">{user?.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                      <div className="mt-2 flex items-center gap-2 text-[10px] font-mono text-sos-cyan bg-sos-cyan/10 px-2 py-1 rounded">
                        <span>Peak: {user?.peakHours?.toUpperCase() || 'NIGHT'}</span>
                      </div>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          onOpenSettings?.();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-slate-300 hover:bg-surface-hover hover:text-white"
                      >
                        <Sliders className="w-3.5 h-3.5 text-sos-cyan" />
                        <span>Study Capacity Settings</span>
                      </button>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          logout();
                          navigate('/login');
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-sos-crimson hover:bg-sos-crimson/10 font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Emergency Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
