import React, { useState } from 'react';
import { X, User, Mail, Palette, Check } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

const GRADIENTS = [
  { id: 'violet', label: 'Neon Violet', value: 'from-violet-600 to-indigo-600' },
  { id: 'cyan', label: 'Cyan Ocean', value: 'from-cyan-600 to-blue-600' },
  { id: 'rose', label: 'Crimson Rose', value: 'from-rose-600 to-red-600' },
  { id: 'amber', label: 'Sunset Amber', value: 'from-amber-500 to-orange-600' },
  { id: 'emerald', label: 'Emerald Mint', value: 'from-emerald-600 to-teal-600' },
  { id: 'fuchsia', label: 'Fuchsia Glow', value: 'from-fuchsia-600 to-pink-600' },
];

export default function ProfileModal({ isOpen, onClose, currentUser, onSaveUser }) {
  const [name, setName] = useState(currentUser.name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [gradient, setGradient] = useState(currentUser.avatarGradient || GRADIENTS[0].value);

  if (!isOpen) return null;

  const getInitials = (str) => {
    if (!str.trim()) return 'U';
    const parts = str.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleSave = (e) => {
    e?.preventDefault();
    if (!name.trim()) return;

    sounds.playClick(true);
    onSaveUser({
      ...currentUser,
      name: name.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@meet.assemble`,
      avatarGradient: gradient,
      avatarText: getInitials(name),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-assemble-neon/20 border border-assemble-neon/40 flex items-center justify-center text-assemble-glow">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-heading text-white">Your Profile</h2>
              <p className="text-xs text-slate-400">Manage your meeting identity & mail ID</p>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playClick(false);
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Avatar Preview */}
        <div className="flex flex-col items-center justify-center my-4">
          <div
            className={`w-20 h-20 rounded-full bg-gradient-to-tr ${gradient} flex items-center justify-center font-heading font-black text-2xl text-white shadow-neon mb-2 ring-4 ring-slate-800`}
          >
            {getInitials(name)}
          </div>
          <span className="text-xs text-slate-400 font-medium">{email || 'no email specified'}</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-assemble-neon" />
              <span>Full Name</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Vance"
              className="w-full bg-slate-950 border border-slate-700 focus:border-assemble-neon text-white text-xs rounded-xl px-3.5 py-2.5 outline-none transition placeholder-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-assemble-neon" />
              <span>Your Email ID</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. alex.vance@assemble.edu"
              className="w-full bg-slate-950 border border-slate-700 focus:border-assemble-neon text-white text-xs rounded-xl px-3.5 py-2.5 outline-none transition placeholder-slate-500"
            />
          </div>

          {/* Color theme selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-assemble-neon" />
              <span>Avatar Theme Color</span>
            </label>
            <div className="grid grid-cols-6 gap-2">
              {GRADIENTS.map((g) => (
                <button
                  type="button"
                  key={g.id}
                  onClick={() => setGradient(g.value)}
                  title={g.label}
                  className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${g.value} flex items-center justify-center transition active:scale-95 border-2 ${
                    gradient === g.value ? 'border-white shadow-neon' : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                >
                  {gradient === g.value && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-slate-800 flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => {
                sounds.playClick(false);
                onClose();
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-assemble-neon hover:bg-assemble-neonHover text-white text-xs font-bold rounded-xl transition shadow-neon active:scale-95"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

