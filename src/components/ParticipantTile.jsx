import React, { useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  VideoOff,
  Hand,
  Pin,
  Sparkles,
  Wifi,
  MoreVertical,
  Volume2
} from 'lucide-react';

export default function ParticipantTile({
  participant,
  isLocal,
  localStream,
  isSpotlight,
  onTogglePin,
}) {
  const videoRef = useRef(null);

  // Hook real webcam stream to local video element
  useEffect(() => {
    if (isLocal && videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
      videoRef.current.play().catch(() => {});
    }
  }, [isLocal, localStream, participant.isVideoOn]);

  return (
    <div
      className={`relative rounded-2xl overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 border transition-all duration-300 group flex items-center justify-center ${
        participant.isSpeaking
          ? 'border-assemble-neon shadow-speaking ring-2 ring-assemble-neon/70'
          : participant.isPinned
          ? 'border-assemble-glow/60 shadow-neon'
          : 'border-slate-800/80 hover:border-slate-700'
      } ${isSpotlight ? 'w-full h-full' : 'w-full h-full min-h-[160px]'}`}
    >
      {/* Video Content */}
      {isLocal && participant.isVideoOn ? (
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className="w-full h-full object-cover transform -scale-x-100"
        />
      ) : !isLocal && participant.isVideoOn ? (
        // Simulated student webcam feed with subtle cybernetic background & animations
        <div className="relative w-full h-full flex items-center justify-center bg-slate-950 overflow-hidden">
          {/* Animated gradient backdrop */}
          <div
            className={`absolute inset-0 bg-gradient-to-tr ${participant.avatarGradient} opacity-20 filter blur-2xl transform scale-125`}
          />

          {/* Visual Representation */}
          <div className="relative flex flex-col items-center">
            <div
              className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr ${
                participant.avatarGradient
              } flex items-center justify-center font-bold text-2xl sm:text-3xl text-white shadow-xl ${
                participant.isSpeaking ? 'speaking-active scale-105' : ''
              } transition-all duration-300`}
            >
              {participant.avatarText}
            </div>

            {/* Speaking audio bar waves below avatar */}
            {participant.isSpeaking && (
              <div className="flex items-center gap-1 mt-3">
                <span className="w-1 h-3 bg-assemble-neon rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1 h-5 bg-assemble-glow rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1 h-4 bg-assemble-neon rounded-full animate-bounce [animation-delay:-0.4s]" />
                <span className="w-1 h-6 bg-assemble-cyan rounded-full animate-bounce" />
                <span className="w-1 h-3 bg-assemble-neon rounded-full animate-bounce [animation-delay:-0.2s]" />
              </div>
            )}
          </div>
        </div>
      ) : (
        // Camera Turned Off Placeholder
        <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-950/80">
          <div
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr ${participant.avatarGradient} flex items-center justify-center font-bold text-xl sm:text-2xl text-white shadow-lg`}
          >
            {participant.avatarText}
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
            <VideoOff className="w-3.5 h-3.5 text-slate-500" />
            <span>Camera turned off</span>
          </div>
        </div>
      )}

      {/* Floating Action Overlay on Hover (Pin) */}
      <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition duration-200 z-10">
        <button
          onClick={() => onTogglePin(participant.id)}
          className={`p-1.5 rounded-lg backdrop-blur-md transition ${
            participant.isPinned
              ? 'bg-assemble-neon text-white'
              : 'bg-black/60 text-slate-300 hover:text-white hover:bg-black/80'
          }`}
          title={participant.isPinned ? 'Unpin participant' : 'Pin to spotlight'}
        >
          <Pin className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Top Left: Hand Raised Pill */}
      {participant.isHandRaised && (
        <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5 bg-amber-500/90 backdrop-blur-md text-slate-950 px-2.5 py-1 rounded-full text-xs font-bold shadow-lg animate-bounce">
          <Hand className="w-3.5 h-3.5 fill-current" />
          <span>Hand Raised</span>
        </div>
      )}

      {/* Speaking Glow Ring Indicator (Visual border pulse) */}
      {participant.isSpeaking && (
        <div className="absolute inset-0 border-2 border-assemble-neon rounded-2xl pointer-events-none animate-pulse-slow" />
      )}

      {/* Bottom Bar: Name Tag & Mic Badge */}
      <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
        {/* Name Tag Pill */}
        <div className="flex items-center gap-1.5 bg-black/65 backdrop-blur-md border border-slate-700/50 rounded-xl px-2.5 py-1 max-w-[80%] shadow">
          {participant.isSpeaking && (
            <span className="w-2 h-2 rounded-full bg-assemble-neon animate-ping" />
          )}
          <span className="text-xs font-medium text-white truncate">
            {participant.name}
          </span>
          {participant.role && (
            <span className="text-[10px] text-slate-400 hidden sm:inline">
              • {participant.role}
            </span>
          )}
        </div>

        {/* Mic Status Badge */}
        <div
          className={`p-1.5 rounded-xl backdrop-blur-md border shadow flex items-center justify-center ${
            participant.isMuted
              ? 'bg-red-500/80 border-red-400 text-white'
              : 'bg-black/60 border-slate-700/60 text-emerald-400'
          }`}
        >
          {participant.isMuted ? (
            <MicOff className="w-3.5 h-3.5" />
          ) : (
            <Mic className="w-3.5 h-3.5" />
          )}
        </div>
      </div>
    </div>
  );
}
