import React from 'react';
import { RotateCcw, Download, Home, Zap, Award, Star, CheckCircle2, Clock, Users } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function MeetingEndedSplash({
  onRejoin,
  onGoToDashboard,
  exitReason = 'snap', // 'snap' | 'manual'
  callDuration = '42m 18s',
  notesContent = '',
  participantCount = 6,
}) {
  const handleDownloadNotes = () => {
    sounds.playClick(true);
    const blob = new Blob([notesContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `assemble-lecture-notes-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative w-screen h-screen bg-[#0a0b12] text-slate-100 flex items-center justify-center p-6 overflow-hidden select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-assemble-neon/15 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-indigo-600/15 blur-[120px] pointer-events-none rounded-full" />

      {/* Main card */}
      <div className="relative max-w-lg w-full bg-slate-900/90 border border-assemble-neon/30 rounded-3xl p-8 shadow-2xl backdrop-blur-2xl text-center z-10 assemble-gradient-border">
        {/* Assemble A Badge / Exit Indicator */}
        <div className="relative inline-block mb-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-assemble-neon/30 via-indigo-500/20 to-assemble-cyan/30 border border-assemble-neon/50 flex items-center justify-center mx-auto shadow-neon">
            {exitReason === 'snap' ? (
              <Zap className="w-10 h-10 text-assemble-neon animate-pulse" />
            ) : (
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            )}
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-950 border border-assemble-neon/40 text-assemble-glow text-[11px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap flex items-center gap-1 shadow">
            {exitReason === 'snap' ? (
              <>
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Assembled Out with Snap</span>
              </>
            ) : (
              <span>Call Concluded</span>
            )}
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-extrabold text-white font-heading tracking-tight mt-4 mb-2">
          You Left the Meeting
        </h1>
        <p className="text-sm text-slate-300 max-w-sm mx-auto mb-6">
          CS-409: Distributed Quantum Computing & Team Assemble Lecture 04
        </p>

        {/* Meeting Stat Tiles */}
        <div className="grid grid-cols-2 gap-3 mb-6 text-left">
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400">Call Duration</div>
              <div className="text-sm font-bold text-white">{callDuration}</div>
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400">Participants</div>
              <div className="text-sm font-bold text-white">{participantCount} Students</div>
            </div>
          </div>
        </div>

        {/* Student Lecture Notes Quick Action */}
        <div className="bg-assemble-card/90 border border-assemble-border rounded-xl p-4 mb-6 text-left flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-white flex items-center gap-1.5 mb-0.5">
              <span>Lecture Notes Saved</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <div className="text-[11px] text-slate-400">
              Your whiteboard marks and notes are preserved.
            </div>
          </div>
          <button
            onClick={handleDownloadNotes}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-assemble-glow text-xs font-semibold rounded-lg border border-assemble-neon/30 hover:border-assemble-neon transition active:scale-95 shadow"
          >
            <Download className="w-3.5 h-3.5 text-assemble-neon" />
            <span>Export Notes</span>
          </button>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              sounds.playAssembleSurge();
              onRejoin();
            }}
            className="flex-1 py-3 px-5 rounded-xl font-bold text-sm bg-gradient-to-r from-assemble-neon to-indigo-600 hover:from-assemble-neonHover hover:to-indigo-500 text-white shadow-neon transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Rejoin Meeting</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick(true);
              if (onGoToDashboard) onGoToDashboard();
              else onRejoin();
            }}
            className="flex-1 py-3 px-5 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Home className="w-4 h-4 text-slate-400" />
            <span>Return to Dashboard</span>
          </button>
        </div>

        {/* Bottom student tip */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Assemble Student Portal • Powered by Google MediaPipe AI</span>
          </p>
        </div>
      </div>
    </div>
  );
}
