import React, { useState } from 'react';
import {
  Search,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Hand,
  Pin,
  MoreVertical,
  VolumeX,
  ShieldCheck,
  Check,
  UserPlus,
  Mail
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function ParticipantsTab({
  participants,
  onTogglePin,
  onMuteParticipant,
  onOpenShareModal,
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = participants.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    p.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-assemble-card/50">
      {/* Search Header */}
      <div className="p-3 border-b border-slate-800 bg-slate-900/80 space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search students, emails, roles..."
            className="w-full bg-slate-950/70 border border-slate-700/80 focus:border-assemble-neon text-white text-xs rounded-xl pl-9 pr-3 py-2 outline-none transition placeholder-slate-500"
          />
        </div>

        {/* Quick Invite by Email Button */}
        {onOpenShareModal && (
          <button
            onClick={() => {
              sounds.playClick(true);
              onOpenShareModal();
            }}
            className="w-full py-2 px-3 bg-assemble-neon/15 hover:bg-assemble-neon/25 border border-assemble-neon/40 text-assemble-glow text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition active:scale-95 shadow"
          >
            <UserPlus className="w-3.5 h-3.5 text-assemble-neon" />
            <span>Invite Others via Mail ID / Link</span>
          </button>
        )}
      </div>

      {/* Participants List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1 mb-1">
          <span>In Call ({participants.length})</span>
          <button
            onClick={() => {
              sounds.playClick(false);
            }}
            className="text-[11px] text-assemble-glow hover:underline"
          >
            Mute All
          </button>
        </div>

        {filtered.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 hover:border-assemble-neon/30 transition group"
          >
            {/* Left: Avatar & Info */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`relative w-9 h-9 rounded-full bg-gradient-to-tr ${p.avatarGradient} flex items-center justify-center font-bold text-xs text-white shadow-sm flex-shrink-0 ${
                  p.isSpeaking ? 'ring-2 ring-assemble-neon' : ''
                }`}
              >
                {p.avatarText}
                {p.isHandRaised && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 shadow">
                    <Hand className="w-2.5 h-2.5 fill-current" />
                  </div>
                )}
              </div>

              <div className="truncate">
                <div className="text-xs font-semibold text-white flex items-center gap-1.5 truncate">
                  <span className="truncate">{p.name}</span>
                  {p.isLocal && (
                    <span className="text-[10px] text-assemble-glow font-medium">
                      (You)
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1.5 truncate">
                  {p.email && (
                    <span className="truncate text-slate-400">{p.email}</span>
                  )}
                  {p.isSpeaking && (
                    <span className="text-assemble-neon font-medium animate-pulse flex-shrink-0">
                      • Speaking
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Actions & Badges */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* Hand raised badge */}
              {p.isHandRaised && (
                <span className="p-1 rounded-md bg-amber-500/20 text-amber-400" title="Hand raised">
                  <Hand className="w-3.5 h-3.5" />
                </span>
              )}

              {/* Pin button */}
              <button
                onClick={() => onTogglePin(p.id)}
                title={p.isPinned ? 'Unpin participant' : 'Pin participant'}
                className={`p-1.5 rounded-lg transition ${
                  p.isPinned
                    ? 'bg-assemble-neon text-white shadow-neon'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Pin className="w-3.5 h-3.5" />
              </button>

              {/* Audio/Video Indicators */}
              <div className="flex items-center gap-1 text-slate-400">
                <span className="p-1">
                  {p.isMuted ? (
                    <MicOff className="w-3.5 h-3.5 text-red-400" />
                  ) : (
                    <Mic className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                </span>
                <span className="p-1">
                  {p.isVideoOn ? (
                    <Video className="w-3.5 h-3.5 text-slate-300" />
                  ) : (
                    <VideoOff className="w-3.5 h-3.5 text-red-400" />
                  )}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
