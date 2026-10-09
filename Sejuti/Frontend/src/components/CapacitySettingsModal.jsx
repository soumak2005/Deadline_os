import React, { useState } from 'react';
import { X, Sliders, Sun, Sunset, Moon, Check, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const CapacitySettingsModal = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  const [dailyCapacity, setDailyCapacity] = useState(user?.dailyCapacityHours || 4);
  const [peakHours, setPeakHours] = useState(user?.peakHours || 'night');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        dailyCapacityHours: Number(dailyCapacity),
        peakHours
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const peakOptions = [
    { id: 'morning', label: 'Morning Peak', time: '08:00 - 12:00', icon: Sun, color: 'text-amber-400' },
    { id: 'afternoon', label: 'Afternoon Peak', time: '13:00 - 17:00', icon: Sunset, color: 'text-orange-400' },
    { id: 'night', label: 'Night Owl Peak', time: '19:00 - 23:00', icon: Moon, color: 'text-sos-cyan' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-surface border border-surface-border-bright rounded-3xl shadow-2xl overflow-hidden z-10">
        
        {/* Header */}
        <div className="p-6 border-b border-surface-border bg-gradient-to-r from-surface-card to-surface flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sos-cyan/20 border border-sos-cyan/40 flex items-center justify-center text-sos-cyan">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-mono text-white uppercase tracking-wider">
                Capacity Engine Configuration
              </h2>
              <p className="text-xs text-slate-400">Controls bin-packing limits & emergency radar thresholds</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-surface-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-6 space-y-6">
          
          {/* Daily Study Capacity Slider */}
          <div className="bg-abyss/80 rounded-2xl p-4 border border-surface-border space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 font-bold uppercase">Daily Max Study Capacity:</span>
              <span className="text-sos-cyan font-bold text-sm bg-sos-cyan/10 px-2.5 py-0.5 rounded border border-sos-cyan/30">
                {dailyCapacity} Hours / Day
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="14"
              step="0.5"
              value={dailyCapacity}
              onChange={(e) => setDailyCapacity(Number(e.target.value))}
              className="w-full accent-sos-cyan cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              The scheduler will never exceed this budget per day before flagging study debt or bottleneck deficits.
            </p>
          </div>

          {/* Peak Hours Preference */}
          <div>
            <label className="block text-xs font-mono uppercase font-bold text-slate-300 mb-2.5">
              Circadian Peak Focus Window
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {peakOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = peakHours === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setPeakHours(opt.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer text-center ${
                      isSelected
                        ? 'bg-sos-cyan/15 border-sos-cyan shadow-glow-cyan'
                        : 'bg-abyss/60 border-surface-border hover:border-surface-border-bright'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mx-auto mb-1.5 ${opt.color}`} />
                    <div className="text-xs font-bold text-white">{opt.label}</div>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">{opt.time}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-surface-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-surface hover:bg-surface-hover text-slate-300 text-xs font-mono transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-sos-cyan hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold uppercase tracking-wider shadow-glow-cyan transition-all active:scale-95 cursor-pointer"
            >
              {isSaving ? 'Updating...' : 'Save Parameters'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
