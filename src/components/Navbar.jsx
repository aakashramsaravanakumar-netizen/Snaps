import React, { useState, useEffect } from 'react';
import {
  Zap,
  Clock,
  Users,
  Wifi,
  UserPlus
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function Navbar({
  isSnapActive,
  participantCount,
  onOpenSidePanel,
  meetingTitle = 'CS-409: Distributed Quantum Computing',
  meetingId = 'cs-409-quantum',
  onOpenShareModal,
  onLeaveToDashboard,
}) {
  const [secondsElapsed, setSecondsElapsed] = useState(2538); // ~42m 18s

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;

    if (hours > 0) {
      return `${hours}:${remainingMins < 10 ? '0' : ''}${remainingMins}:${
        remainingSecs < 10 ? '0' : ''
      }${remainingSecs}`;
    }
    return `${remainingMins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  return (
    <header className="w-full h-14 bg-slate-950/90 border-b border-slate-800/80 px-4 flex items-center justify-between select-none z-30 backdrop-blur-md">
      {/* Left: Brand & Lecture Name */}
      <div className="flex items-center gap-3">
        {/* Assemble Logo */}
        <button
          onClick={onLeaveToDashboard}
          title="Return to Dashboard"
          className="flex items-center gap-2 hover:opacity-80 transition group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-assemble-neon via-purple-600 to-indigo-600 flex items-center justify-center shadow-neon font-black text-white text-base group-hover:scale-105 transition-transform">
            A
          </div>
          <span className="font-heading font-black text-base text-white tracking-wider hidden sm:inline assemble-glow-text">
            ASSEMBLE
          </span>
        </button>

        <div className="w-[1px] h-5 bg-slate-800 hidden md:block" />

        {/* Meeting Info */}
        <div className="hidden md:flex flex-col max-w-xs xl:max-w-md truncate">
          <span className="text-xs font-semibold text-slate-200 truncate">
            {meetingTitle}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            Room ID: {meetingId}
          </span>
        </div>
      </div>

      {/* Center: Assemble Snap Status Pill */}
      <div className="flex items-center gap-2">
        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 border ${
            isSnapActive
              ? 'bg-assemble-neon/15 border-assemble-neon/50 text-assemble-glow shadow-neon'
              : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}
        >
          <Zap
            className={`w-3.5 h-3.5 ${
              isSnapActive ? 'text-amber-400 animate-pulse' : 'text-slate-500'
            }`}
          />
          <span className="font-semibold hidden sm:inline">
            {isSnapActive ? 'Assemble Snap: Armed' : 'Snap Exit: Off'}
          </span>
          {isSnapActive && (
            <span className="text-[10px] text-slate-300 hidden lg:inline">
              (Pinch thumb + middle finger & release to exit)
            </span>
          )}
        </div>
      </div>

      {/* Right: Share, Timer, Participants & Network */}
      <div className="flex items-center gap-2 sm:gap-3 text-xs">
        {/* Share & Invite Button */}
        {onOpenShareModal && (
          <button
            onClick={() => {
              sounds.playClick(true);
              onOpenShareModal();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-assemble-neon/20 hover:bg-assemble-neon/30 text-assemble-glow border border-assemble-neon/40 hover:border-assemble-neon transition active:scale-95 shadow font-semibold"
            title="Share meeting link and invite others by email ID"
          >
            <UserPlus className="w-3.5 h-3.5 text-assemble-neon" />
            <span className="hidden sm:inline">Share / Invite</span>
          </button>
        )}

        {/* Elapsed Timer */}
        <div className="flex items-center gap-1.5 text-slate-300 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-mono font-medium">{formatTime(secondsElapsed)}</span>
        </div>

        {/* Participants count button */}
        <button
          onClick={() => onOpenSidePanel('people')}
          className="flex items-center gap-1.5 text-slate-300 bg-slate-900/80 hover:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-800 hover:border-assemble-neon/40 transition"
          title="View participants roster"
        >
          <Users className="w-3.5 h-3.5 text-assemble-neon" />
          <span className="font-semibold">{participantCount}</span>
        </button>

        {/* Network indicator */}
        <div className="p-1 text-emerald-400 hidden sm:block" title="HD Mesh Connection: Active">
          <Wifi className="w-4 h-4" />
        </div>
      </div>
    </header>
  );
}
