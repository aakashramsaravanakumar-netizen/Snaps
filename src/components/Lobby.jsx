import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  ArrowLeft,
  Share2,
  ShieldCheck,
  Zap,
  User,
  Mail,
  LogIn
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function Lobby({
  meetingId,
  meetingTitle = 'Assemble Meeting',
  currentUser,
  isMuted,
  isVideoOn,
  onToggleMic,
  onToggleCamera,
  onJoinMeeting,
  onBackToDashboard,
  onOpenShareModal,
}) {
  const [name, setName] = useState(currentUser.name || 'Alex Vance');
  const [email, setEmail] = useState(currentUser.email || 'alex.vance@assemble.edu');
  const [localStream, setLocalStream] = useState(null);
  const videoRef = useRef(null);

  // Setup preview camera stream
  useEffect(() => {
    let streamInstance = null;

    async function startCamera() {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 } },
            audio: false,
          });
          streamInstance = stream;
          setLocalStream(stream);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
          }
        } catch (err) {
          console.warn('Lobby camera preview error:', err);
        }
      }
    }

    if (isVideoOn) {
      startCamera();
    } else {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
        setLocalStream(null);
      }
    }

    return () => {
      if (streamInstance) {
        streamInstance.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isVideoOn]);

  const getInitials = (str) => {
    if (!str.trim()) return 'U';
    const parts = str.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleJoin = (e) => {
    e?.preventDefault();
    if (!name.trim()) return;

    sounds.playAssembleSurge();

    const finalEmail = email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@meet.assemble`;
    const updatedUser = {
      ...currentUser,
      name: name.trim(),
      email: finalEmail,
      avatarText: getInitials(name),
    };

    onJoinMeeting(updatedUser);
  };

  return (
    <div className="relative w-screen h-screen bg-[#0a0b12] text-slate-100 flex flex-col overflow-y-auto font-sans select-none">
      {/* Background ambient neon glow */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-assemble-neon/15 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-600/15 blur-[140px] pointer-events-none rounded-full" />

      {/* Top Header */}
      <header className="w-full h-16 px-6 flex items-center justify-between z-10 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
        <button
          onClick={() => {
            sounds.playClick(false);
            onBackToDashboard();
          }}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 px-3 py-2 rounded-xl border border-slate-800 transition active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-assemble-neon to-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow-neon">
            A
          </div>
          <span className="font-heading font-black text-sm tracking-wider text-white">
            ASSEMBLE MEET
          </span>
        </div>

        <button
          onClick={() => {
            sounds.playClick(true);
            onOpenShareModal();
          }}
          className="flex items-center gap-1.5 text-xs text-assemble-glow hover:text-white bg-assemble-neon/15 hover:bg-assemble-neon/25 border border-assemble-neon/40 px-3 py-2 rounded-xl transition active:scale-95 shadow"
        >
          <Share2 className="w-3.5 h-3.5 text-assemble-neon" />
          <span className="hidden sm:inline font-semibold">Share Invite Link</span>
        </button>
      </header>

      {/* Main Center Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-10 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 z-10">
        {/* Left: Video Preview Box */}
        <div className="w-full lg:w-[480px] flex flex-col items-center">
          <div className="relative w-full aspect-video bg-slate-950 rounded-3xl border border-slate-700/80 overflow-hidden shadow-2xl flex items-center justify-center group">
            {isVideoOn ? (
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className="w-full h-full object-cover transform -scale-x-100"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-6">
                <div
                  className={`w-24 h-24 rounded-full bg-gradient-to-tr ${currentUser.avatarGradient} flex items-center justify-center font-heading font-black text-3xl text-white shadow-neon mb-3 ring-4 ring-slate-800`}
                >
                  {getInitials(name)}
                </div>
                <div className="text-sm font-semibold text-slate-300">Camera is turned off</div>
                <div className="text-xs text-slate-500 mt-1">
                  You can turn it on anytime during the meeting
                </div>
              </div>
            )}

            {/* Mic Live Level Indicator Overlay */}
            <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md border border-slate-800 px-2.5 py-1 rounded-full flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isMuted ? 'bg-red-500' : 'bg-emerald-400 animate-pulse'
                }`}
              />
              <span className="text-[10px] font-semibold text-slate-300">
                {isMuted ? 'Microphone Muted' : 'Microphone Ready'}
              </span>
            </div>

            {/* Bottom Controls Overlay */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-slate-950/80 backdrop-blur-xl border border-slate-800 px-4 py-2 rounded-full shadow-2xl">
              <button
                type="button"
                onClick={onToggleMic}
                title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
                className={`p-3 rounded-full transition active:scale-90 ${
                  isMuted
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={onToggleCamera}
                title={isVideoOn ? 'Turn camera off' : 'Turn camera on'}
                className={`p-3 rounded-full transition active:scale-90 ${
                  !isVideoOn
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="mt-3 text-xs text-slate-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Assemble AI Gesture Exit is ready for this call</span>
          </div>
        </div>

        {/* Right: Meeting Details & Join Form */}
        <div className="w-full lg:w-[420px] bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl assemble-gradient-border">
          {/* Room Title & Status */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-assemble-neon/15 border border-assemble-neon/30 text-assemble-glow text-[11px] font-semibold mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Ready to Join</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black font-heading text-white tracking-tight leading-snug">
              {meetingTitle}
            </h1>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
              <span className="font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                {meetingId}
              </span>
              <span>•</span>
              <span className="text-slate-400">Assemble Secure Room</span>
            </div>
          </div>

          {/* Join with your Name & Email Form */}
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-assemble-neon" />
                <span>Your Name (Display Name)</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name..."
                className="w-full bg-slate-950 border border-slate-700/80 focus:border-assemble-neon text-white text-xs rounded-xl px-3.5 py-2.5 outline-none transition placeholder-slate-500 shadow-inner"
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
                placeholder="Enter your email ID..."
                className="w-full bg-slate-950 border border-slate-700/80 focus:border-assemble-neon text-white text-xs rounded-xl px-3.5 py-2.5 outline-none transition placeholder-slate-500 shadow-inner"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Other participants will see your name & email in the roster.
              </p>
            </div>

            {/* Submit Join */}
            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={!name.trim()}
                className="w-full py-3.5 bg-gradient-to-r from-assemble-neon via-purple-600 to-indigo-600 hover:from-assemble-neonHover hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-neon transition active:scale-98 flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Join Meeting Now</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playClick(true);
                  onOpenShareModal();
                }}
                className="w-full py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700/80 transition flex items-center justify-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5 text-assemble-glow" />
                <span>Copy Link or Invite Others</span>
              </button>
            </div>
          </form>

          {/* Privacy Note */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>End-to-end encrypted • MediaPipe local inference</span>
          </div>
        </div>
      </main>
    </div>
  );
}
