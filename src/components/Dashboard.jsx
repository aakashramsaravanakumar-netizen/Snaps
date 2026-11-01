import React, { useState, useEffect } from 'react';
import {
  Video,
  Keyboard,
  Clock,
  Share2,
  Copy,
  Check,
  Sparkles,
  Zap,
  Users,
  Mail,
  ArrowRight,
  Shield,
  Volume2,
  VolumeX,
  Play
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function Dashboard({
  currentUser,
  onStartMeeting,
  onJoinByCode,
  onOpenShareModal,
  onOpenProfileModal,
  onToggleSound,
  soundEnabled = true,
}) {
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [meetingCodeInput, setMeetingCodeInput] = useState('');
  const [showNewMeetingMenu, setShowNewMeetingMenu] = useState(false);
  const [copiedDefault, setCopiedDefault] = useState(false);

  // Live real-time clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatClock = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleJoinSubmit = (e) => {
    e?.preventDefault();
    if (!meetingCodeInput.trim()) return;

    sounds.playClick(true);
    // If user pasted a full URL, parse out the ?meeting= param
    let code = meetingCodeInput.trim();
    if (code.includes('meeting=')) {
      try {
        const url = new URL(code, window.location.origin);
        code = url.searchParams.get('meeting') || code;
      } catch (err) {
        // use raw string
      }
    }
    onJoinByCode(code);
  };

  const handleCreateInstantMeeting = () => {
    setShowNewMeetingMenu(false);
    sounds.playAssembleSurge();
    const randomId = `asm-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`;
    onStartMeeting(randomId, 'Assemble Instant Meeting', true);
  };

  const handleCreateMeetingForLater = () => {
    setShowNewMeetingMenu(false);
    sounds.playClick(true);
    const randomId = `asm-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`;
    onOpenShareModal(randomId, 'Assemble Scheduled Meeting');
  };

  const handleJoinDefaultMeeting = () => {
    sounds.playAssembleSurge();
    onStartMeeting('cs-409-quantum', 'CS-409: Distributed Quantum Computing', true);
  };

  const handleCopyDefaultLink = (e) => {
    e.stopPropagation();
    sounds.playClick(true);
    const url = `${window.location.origin}${window.location.pathname}?meeting=cs-409-quantum`;
    navigator.clipboard.writeText(url);
    setCopiedDefault(true);
    setTimeout(() => setCopiedDefault(false), 2000);
  };

  return (
    <div className="relative w-screen h-screen bg-[#0a0b12] text-slate-100 flex flex-col overflow-y-auto select-none font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-assemble-neon/10 blur-[160px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 blur-[150px] pointer-events-none rounded-full" />

      {/* Top Navbar */}
      <header className="w-full h-16 px-6 md:px-10 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl z-20 sticky top-0">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-assemble-neon via-purple-600 to-indigo-600 flex items-center justify-center font-black text-white text-base shadow-neon">
            A
          </div>
          <div>
            <span className="font-heading font-black text-lg text-white tracking-wider">
              ASSEMBLE
            </span>
            <span className="text-xs font-semibold text-assemble-glow ml-1.5 uppercase tracking-widest hidden sm:inline">
              Meet
            </span>
          </div>
        </div>

        {/* Center: Live Date & Time */}
        <div className="hidden md:flex items-center gap-2 text-slate-300 bg-slate-900/80 border border-slate-800 px-4 py-1.5 rounded-xl shadow-inner font-mono text-xs">
          <Clock className="w-3.5 h-3.5 text-assemble-neon" />
          <span className="font-bold text-white">{formatClock(currentTime)}</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">{formatDate(currentTime)}</span>
        </div>

        {/* Right: Sound FX & User Profile Chip */}
        <div className="flex items-center gap-3">
          {/* Audio toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-assemble-glow" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          {/* User Profile Chip */}
          <button
            onClick={onOpenProfileModal}
            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-assemble-neon/50 transition shadow-sm active:scale-95 group"
            title="Click to edit your display name and mail ID"
          >
            <div
              className={`w-7 h-7 rounded-full bg-gradient-to-tr ${currentUser.avatarGradient} flex items-center justify-center font-bold text-white text-xs shadow-sm`}
            >
              {currentUser.avatarText}
            </div>
            <div className="text-left hidden sm:block max-w-[130px] truncate">
              <div className="text-xs font-bold text-white truncate group-hover:text-assemble-glow transition">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-slate-400 truncate">{currentUser.email}</div>
            </div>
          </button>
        </div>
      </header>

      {/* Main Dashboard Hero */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 md:px-12 py-8 md:py-12 flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16 z-10">
        {/* Left Column: Headline, Actions & Join Box */}
        <div className="flex-1 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-assemble-neon/15 border border-assemble-neon/30 text-assemble-glow text-xs font-semibold mb-4">
            <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Google MediaPipe AI Gestures • Multi-Peer Mesh</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-heading text-white tracking-tight leading-tight mb-4">
            Video calls and meetings for everyone.
          </h1>

          <p className="text-sm md:text-base text-slate-300 leading-relaxed mb-8">
            Connect and collaborate with crystal-clear audio and video. Create an instant room, share
            the meeting link to invite peers with their own email ID, or join with a code.
          </p>

          {/* Action Row: New Meeting button & Join input */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8 relative">
            {/* New Meeting Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  sounds.playClick(true);
                  setShowNewMeetingMenu(!showNewMeetingMenu);
                }}
                className="w-full sm:w-auto px-5 py-3.5 bg-gradient-to-r from-assemble-neon to-indigo-600 hover:from-assemble-neonHover hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-neon transition active:scale-95 flex items-center justify-center gap-2"
              >
                <Video className="w-4 h-4" />
                <span>New Meeting</span>
              </button>

              {/* Dropdown Menu */}
              {showNewMeetingMenu && (
                <div className="absolute left-0 mt-2 w-64 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-2 z-30 animate-fade-in">
                  <button
                    onClick={handleCreateInstantMeeting}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800 transition flex items-center gap-3 text-xs text-white"
                  >
                    <div className="p-2 rounded-lg bg-assemble-neon/20 text-assemble-glow">
                      <Play className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold">Start an instant meeting</div>
                      <div className="text-[11px] text-slate-400">Launch room immediately</div>
                    </div>
                  </button>

                  <button
                    onClick={handleCreateMeetingForLater}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800 transition flex items-center gap-3 text-xs text-white"
                  >
                    <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400">
                      <Share2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold">Create a meeting for later</div>
                      <div className="text-[11px] text-slate-400">Get link and invite by email</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Enter Code / Link Input & Join Button */}
            <form onSubmit={handleJoinSubmit} className="flex-1 flex items-center gap-2">
              <div className="relative flex-1">
                <Keyboard className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={meetingCodeInput}
                  onChange={(e) => setMeetingCodeInput(e.target.value)}
                  placeholder="Enter a code or link..."
                  className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-assemble-neon text-white text-xs rounded-xl pl-10 pr-3 py-3.5 outline-none transition placeholder-slate-500 shadow-inner"
                />
              </div>

              <button
                type="submit"
                disabled={!meetingCodeInput.trim()}
                className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-white font-bold text-xs rounded-xl border border-slate-700 transition active:scale-95"
              >
                Join
              </button>
            </form>
          </div>

          <div className="h-[1px] w-full bg-slate-800/80 mb-6" />

          {/* Quick Info & User Identity Reminder */}
          <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/70">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-assemble-neon" />
              <span>
                Signed in as <strong className="text-white">{currentUser.email}</strong>
              </span>
            </div>
            <button
              onClick={onOpenProfileModal}
              className="text-assemble-glow hover:underline text-[11px] font-semibold"
            >
              Change Email
            </button>
          </div>
        </div>

        {/* Right Column: Default Lecture & Meeting Hub */}
        <div className="w-full lg:w-[480px] space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1 flex items-center justify-between">
            <span>Active & Scheduled Sessions</span>
            <span className="text-assemble-glow text-[11px]">Ready to Join</span>
          </div>

          {/* Featured Default Meeting Card */}
          <div
            onClick={handleJoinDefaultMeeting}
            className="group relative p-5 rounded-2xl bg-gradient-to-br from-slate-900/95 via-slate-900/80 to-slate-950 border border-assemble-neon/40 hover:border-assemble-neon shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden assemble-gradient-border"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Live Default Session</span>
                </span>
                <span className="text-[11px] text-slate-400">ID: cs-409-quantum</span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={handleCopyDefaultLink}
                  title="Copy shareable meeting link"
                  className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
                >
                  {copiedDefault ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  onClick={() =>
                    onOpenShareModal(
                      'cs-409-quantum',
                      'CS-409: Distributed Quantum Computing'
                    )
                  }
                  title="Share meeting & invite participants by mail ID"
                  className="p-2 rounded-lg bg-assemble-neon/20 hover:bg-assemble-neon/30 text-assemble-glow border border-assemble-neon/40 transition"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <h3 className="text-lg font-bold font-heading text-white group-hover:text-assemble-glow transition mb-1">
              CS-409: Distributed Quantum Computing
            </h3>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Dr. Helen Cho, Peter Parker, Shuri Udaku, Wanda Maximoff & Miles Morales with
              MediaPipe snap gesture exit test.
            </p>

            {/* Participants Pill & Join Button */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Users className="w-3.5 h-3.5 text-assemble-neon" />
                <span>5 active simulated peers</span>
              </div>

              <div className="flex items-center gap-1 text-xs font-bold text-assemble-glow group-hover:translate-x-1 transition-transform">
                <span>Enter Call</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Secondary Quick Rooms */}
          <div className="grid grid-cols-2 gap-3">
            <div
              onClick={() => {
                sounds.playAssembleSurge();
                onStartMeeting('ai-lab-sync', 'Avengers AI Research Sync', true);
              }}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-white mb-0.5 truncate">AI Lab Sync</div>
              <div className="text-[11px] text-slate-400">Weekly catchup</div>
            </div>

            <div
              onClick={() => {
                sounds.playAssembleSurge();
                onStartMeeting('team-huddle', 'Team Assemble Huddle', true);
              }}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Zap className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-white mb-0.5 truncate">Team Huddle</div>
              <div className="text-[11px] text-slate-400">Quick sandbox</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="w-full py-4 px-6 md:px-12 border-t border-slate-800/80 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Assemble Secure Video • High Definition WebRTC & MediaPipe AI</span>
        </div>
        <div className="text-[11px] text-slate-400">
          Share links with colleagues to join instantly with their email ID.
        </div>
      </footer>
    </div>
  );
}
