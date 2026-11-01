import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScreenShare,
  MessageSquare,
  PenTool,
  PhoneOff,
  Zap,
  Hand,
  LayoutGrid,
  Maximize2,
  Users,
  Copy,
  Check,
  MoreVertical,
  Volume2,
  VolumeX,
  FileText
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function ControlBar({
  isMuted,
  isVideoOn,
  isScreenSharing,
  isSnapActive,
  isHandRaised,
  layoutMode,
  sidePanelOpen,
  activeSideTab,
  meetingId = 'cs-409-quantum',
  onToggleMic,
  onToggleCamera,
  onToggleScreenShare,
  onToggleSnap,
  onToggleHandRaise,
  onToggleLayout,
  onOpenSidePanel,
  onLeaveCall,
  onOpenShareModal,
}) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleCopyLink = () => {
    sounds.playClick(true);
    const meetingUrl = `${window.location.origin}${window.location.pathname}?meeting=${encodeURIComponent(meetingId)}`;
    navigator.clipboard.writeText(meetingUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleToggleSound = () => {
    sounds.muted = !sounds.muted;
    setSoundEnabled(!sounds.muted);
    if (!sounds.muted) sounds.playClick(true);
  };

  return (
    <footer className="w-full h-20 bg-slate-950/95 border-t border-slate-800/90 backdrop-blur-xl px-4 flex items-center justify-between select-none z-40 relative">
      {/* LEFT SECTION: Meeting Info & Live Time */}
      <div className="flex items-center gap-3 w-1/4 min-w-[200px] hidden md:flex">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-sm text-white tracking-wide">
              Assemble Meet
            </span>
            <span className="text-[10px] bg-assemble-neon/20 border border-assemble-neon/40 text-assemble-glow px-2 py-0.5 rounded-full font-semibold">
              Live
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-mono text-slate-300">{meetingId}</span>
            <button
              onClick={handleCopyLink}
              title="Copy meeting link"
              className="hover:text-assemble-glow transition"
            >
              {copiedLink ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
            {onOpenShareModal && (
              <button
                onClick={onOpenShareModal}
                title="Share link & invite others by email ID"
                className="text-[11px] text-assemble-glow hover:underline ml-1"
              >
                Share
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CENTER SECTION: Core Meeting Control Buttons */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 flex-1 max-w-2xl">
        {/* Mic Toggle Button */}
        <button
          onClick={onToggleMic}
          title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          className={`p-3 sm:p-3.5 rounded-full transition-all duration-200 active:scale-90 flex items-center justify-center shadow-lg relative ${
            isMuted
              ? 'bg-red-500/90 hover:bg-red-600 text-white'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-100 hover:text-white border border-slate-700'
          }`}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Camera Toggle Button */}
        <button
          onClick={onToggleCamera}
          title={isVideoOn ? 'Turn Off Camera' : 'Turn On Camera'}
          className={`p-3 sm:p-3.5 rounded-full transition-all duration-200 active:scale-90 flex items-center justify-center shadow-lg ${
            !isVideoOn
              ? 'bg-red-500/90 hover:bg-red-600 text-white'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-100 hover:text-white border border-slate-700'
          }`}
        >
          {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>

        {/* Screen Share Button */}
        <button
          onClick={onToggleScreenShare}
          title={isScreenSharing ? 'Stop Presenting' : 'Share Screen'}
          className={`p-3 sm:p-3.5 rounded-full transition-all duration-200 active:scale-90 flex items-center justify-center shadow-lg ${
            isScreenSharing
              ? 'bg-assemble-cyan text-slate-950 font-bold shadow-cyan-glow'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-100 hover:text-white border border-slate-700'
          }`}
        >
          <ScreenShare className="w-5 h-5" />
        </button>

        {/* Assemble Snap Gesture Exit Toggle Button */}
        <button
          onClick={onToggleSnap}
          title={
            isSnapActive
              ? 'Assemble Snap Active: Finger snap will trigger exit'
              : 'Enable Assemble Snap Exit Gesture'
          }
          className={`relative px-3 sm:px-4 py-2.5 sm:py-3 rounded-full transition-all duration-300 active:scale-95 flex items-center gap-2 shadow-lg border ${
            isSnapActive
              ? 'bg-gradient-to-r from-assemble-neon via-purple-600 to-indigo-600 text-white border-assemble-glow shadow-neon animate-snap-glow'
              : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 border-slate-700 hover:border-assemble-neon/50'
          }`}
        >
          <Zap
            className={`w-4 h-4 sm:w-5 sm:h-5 ${
              isSnapActive ? 'text-amber-300 animate-pulse' : 'text-slate-400'
            }`}
          />
          <span className="text-xs sm:text-sm font-bold tracking-wide hidden sm:inline">
            Snap Exit
          </span>
          {isSnapActive && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute -top-0.5 -right-0.5" />
          )}
        </button>

        {/* Whiteboard Sidepanel Button */}
        <button
          onClick={() => onOpenSidePanel('whiteboard')}
          title="Open Whiteboard Canvas"
          className={`p-3 sm:p-3.5 rounded-full transition-all duration-200 active:scale-90 flex items-center justify-center shadow-lg ${
            sidePanelOpen && activeSideTab === 'whiteboard'
              ? 'bg-assemble-neon text-white shadow-neon'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-100 hover:text-white border border-slate-700'
          }`}
        >
          <PenTool className="w-5 h-5" />
        </button>

        {/* Chat Toggle Button */}
        <button
          onClick={() => onOpenSidePanel('chat')}
          title="Open Chat"
          className={`p-3 sm:p-3.5 rounded-full transition-all duration-200 active:scale-90 flex items-center justify-center shadow-lg relative ${
            sidePanelOpen && activeSideTab === 'chat'
              ? 'bg-assemble-neon text-white shadow-neon'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-100 hover:text-white border border-slate-700'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
        </button>

        {/* Prominent Red Leave Meeting Button */}
        <button
          onClick={onLeaveCall}
          title="Leave Meeting"
          className="p-3 sm:p-3.5 rounded-full bg-red-600 hover:bg-red-500 active:scale-90 text-white shadow-lg shadow-red-600/30 transition-all duration-200 flex items-center justify-center ml-1 sm:ml-2"
        >
          <PhoneOff className="w-5 h-5" />
        </button>
      </div>

      {/* RIGHT SECTION: Secondary Actions (Hand Raise, Layout, Sound) */}
      <div className="flex items-center justify-end gap-2 sm:gap-2.5 w-1/4 min-w-[140px]">
        {/* Hand Raise Toggle */}
        <button
          onClick={onToggleHandRaise}
          title={isHandRaised ? 'Lower Hand' : 'Raise Hand'}
          className={`p-2.5 rounded-xl transition flex items-center gap-1.5 text-xs font-semibold ${
            isHandRaised
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow'
              : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Hand className={`w-4 h-4 ${isHandRaised ? 'fill-current' : ''}`} />
          <span className="hidden xl:inline">{isHandRaised ? 'Raised' : 'Raise'}</span>
        </button>

        {/* Layout Mode Toggle (Grid vs Spotlight) */}
        <button
          onClick={onToggleLayout}
          title={`Switch to ${layoutMode === 'grid' ? 'Spotlight' : 'Grid'} view`}
          className="p-2.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
        >
          <LayoutGrid className="w-4 h-4" />
        </button>

        {/* Audio Effects Toggle */}
        <button
          onClick={handleToggleSound}
          title={soundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
          className="p-2.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition hidden sm:flex"
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-assemble-glow" />
          ) : (
            <VolumeX className="w-4 h-4" />
          )}
        </button>
      </div>
    </footer>
  );
}
