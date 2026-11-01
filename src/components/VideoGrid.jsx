import React from 'react';
import ParticipantTile from './ParticipantTile';
import { ScreenShare, Maximize2, Sparkles, Monitor } from 'lucide-react';

export default function VideoGrid({
  participants,
  layoutMode, // 'grid' | 'spotlight'
  isScreenSharing,
  screenShareStream,
  localStream,
  onTogglePin,
}) {
  // Find pinned participant or active speaker
  const pinnedParticipant =
    participants.find((p) => p.isPinned) ||
    participants.find((p) => p.isSpeaking) ||
    participants[1] ||
    participants[0];

  const otherParticipants = participants.filter(
    (p) => p.id !== pinnedParticipant?.id
  );

  // Dynamic grid column class based on participant count in Grid Mode
  const getGridClass = (count) => {
    if (count === 1) return 'grid-cols-1 grid-rows-1';
    if (count === 2) return 'grid-cols-1 md:grid-cols-2 grid-rows-2 md:grid-rows-1';
    if (count <= 4) return 'grid-cols-2 grid-rows-2';
    if (count <= 6) return 'grid-cols-2 lg:grid-cols-3 grid-rows-3 lg:grid-rows-2';
    return 'grid-cols-3 grid-rows-3';
  };

  // Screen Sharing Presentation View
  if (isScreenSharing) {
    return (
      <div className="flex-1 w-full h-full p-2 sm:p-4 flex flex-col lg:flex-row gap-3 overflow-hidden">
        {/* Main Presentation Stage */}
        <div className="flex-1 h-full min-h-[300px] rounded-2xl bg-slate-950 border border-assemble-neon/40 overflow-hidden relative shadow-neon flex flex-col">
          {/* Header Bar */}
          <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5 text-assemble-neon" />
                <span>Alex Vance is presenting • CS-409 Quantum Architecture</span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="bg-assemble-neon/20 text-assemble-glow px-2 py-0.5 rounded-full border border-assemble-neon/30 font-medium">
                1080p 60fps
              </span>
            </div>
          </div>

          {/* Screen Presentation Content / Simulated Slides & Live Code */}
          <div className="flex-1 relative bg-slate-950 flex flex-col justify-center items-center p-6 select-none overflow-hidden font-mono">
            {/* Tech grid background */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-40" />

            <div className="relative max-w-2xl w-full bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 font-mono text-slate-300">quantum_assemble_core.py</span>
                </div>
                <span className="text-assemble-glow">Live Execution</span>
              </div>

              <pre className="text-xs sm:text-sm text-slate-200 overflow-x-auto leading-relaxed">
                <code>
                  <span className="text-purple-400">class</span>{' '}
                  <span className="text-amber-300">AssembleMeshCluster</span>:<br />
                  &nbsp;&nbsp;<span className="text-blue-400">def</span>{' '}
                  <span className="text-emerald-400">synthesize_state</span>(self, nodes):<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-500"># MediaPipe Landmark Tensor Pipeline</span><br />
                  &nbsp;&nbsp;&nbsp;&nbsp;landmarks = self.mediapipe_hands.process()<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">if</span> landmarks.pinch_delta &lt; 0.05:<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-amber-300">return</span> self.prime_snap_exit_protocol()<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">return</span> Status.CONTINUE_SESSION
                </code>
              </pre>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-assemble-cyan" />
                  <span>Student Q&A open in side panel</span>
                </span>
                <span className="text-emerald-400 font-semibold">Compiled Successfully</span>
              </div>
            </div>
          </div>
        </div>

        {/* Thumbnail Filmstrip on right / bottom */}
        <div className="w-full lg:w-64 h-36 lg:h-full flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto">
          {participants.map((p) => (
            <div key={p.id} className="min-w-[140px] lg:min-w-0 h-full lg:h-40 flex-shrink-0">
              <ParticipantTile
                participant={p}
                isLocal={p.isLocal}
                localStream={localStream}
                isSpotlight={false}
                onTogglePin={onTogglePin}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Spotlight / Speaker Mode
  if (layoutMode === 'spotlight' && pinnedParticipant) {
    return (
      <div className="flex-1 w-full h-full p-2 sm:p-4 flex flex-col lg:flex-row gap-3 overflow-hidden">
        {/* Main Spotlight Speaker Stage */}
        <div className="flex-1 h-full min-h-[300px]">
          <ParticipantTile
            participant={pinnedParticipant}
            isLocal={pinnedParticipant.isLocal}
            localStream={localStream}
            isSpotlight={true}
            onTogglePin={onTogglePin}
          />
        </div>

        {/* Strip of other peers */}
        <div className="w-full lg:w-64 h-36 lg:h-full flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto">
          {otherParticipants.map((p) => (
            <div key={p.id} className="min-w-[140px] lg:min-w-0 h-full lg:h-36 flex-shrink-0">
              <ParticipantTile
                participant={p}
                isLocal={p.isLocal}
                localStream={localStream}
                isSpotlight={false}
                onTogglePin={onTogglePin}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Standard Responsive Grid Mode
  return (
    <div className="flex-1 w-full h-full p-2 sm:p-4 overflow-hidden">
      <div
        className={`w-full h-full grid gap-2.5 sm:gap-3.5 ${getGridClass(
          participants.length
        )}`}
      >
        {participants.map((p) => (
          <ParticipantTile
            key={p.id}
            participant={p}
            isLocal={p.isLocal}
            localStream={localStream}
            isSpotlight={false}
            onTogglePin={onTogglePin}
          />
        ))}
      </div>
    </div>
  );
}
