import React, { useEffect, useState, useRef } from 'react';
import { X, Zap, ShieldAlert, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/soundEffects';

/**
 * 2-Second Countdown Overlay for Avengers "Assemble Snap" gesture exit.
 * Features a circular countdown timer, cosmic violet particles, and cancel button.
 */
export default function SnapCountdownOverlay({ onCancel, onConfirmExit }) {
  const [timeLeft, setTimeLeft] = useState(2.0);
  const totalDuration = 2.0;
  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  // Launch cosmic disintegrating particle burst
  useEffect(() => {
    // Sound: surge
    sounds.playAssembleSurge();
    sounds.playCountdownBeep(false);

    try {
      confetti({
        particleCount: 75,
        spread: 90,
        origin: { y: 0.5, x: 0.5 },
        colors: ['#a855f7', '#6366f1', '#c084fc', '#eab308', '#06b6d4'],
        ticks: 180,
        gravity: 0.6,
        scalar: 1.2,
      });
    } catch (e) {
      console.warn('Confetti error:', e);
    }
  }, []);

  // Precise high-frequency timer loop for smooth circle countdown
  useEffect(() => {
    startTimeRef.current = Date.now();
    let secondBeepPlayed = false;

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const remaining = Math.max(0, totalDuration - elapsed);

      setTimeLeft(remaining);

      if (remaining <= 1.0 && !secondBeepPlayed) {
        secondBeepPlayed = true;
        sounds.playCountdownBeep(true);
      }

      if (remaining <= 0.05) {
        clearInterval(interval);
        sounds.playSnap();
        onConfirmExit();
      }
    }, 40);

    timerRef.current = interval;

    return () => clearInterval(interval);
  }, [onConfirmExit]);

  // Support ESC key to quickly cancel
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  // SVG circle calculations
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (timeLeft / totalDuration) * circumference;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl animate-fade-in select-none">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.25)_0%,transparent_70%)] pointer-events-none" />

      {/* Main card */}
      <div className="relative bg-gradient-to-b from-slate-900/95 to-slate-950/95 border-2 border-assemble-neon/60 rounded-3xl p-8 max-w-md w-full mx-4 shadow-neon-strong text-center overflow-hidden">
        {/* Glowing border top bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-assemble-neon via-assemble-cyan to-indigo-500 animate-pulse" />

        {/* Header Icon */}
        <div className="relative inline-block mb-4">
          <div className="w-16 h-16 rounded-2xl bg-assemble-neon/20 border border-assemble-neon/40 flex items-center justify-center mx-auto shadow-neon animate-bounce">
            <Zap className="w-9 h-9 text-assemble-neon" />
          </div>
          <Sparkles className="w-5 h-5 text-amber-400 absolute -top-1 -right-1 animate-spin" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-black tracking-wider uppercase text-white font-heading mb-1 assemble-glow-text">
          Assemble Snap Triggered!
        </h2>
        <p className="text-sm text-slate-300 mb-6">
          Gesture exit sequence initiated. Assembling out of the lecture...
        </p>

        {/* Circular Countdown Timer */}
        <div className="relative w-36 h-36 mx-auto mb-6 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background ring */}
            <circle
              cx="72"
              cy="72"
              r={radius}
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Animated neon progress ring */}
            <circle
              cx="72"
              cy="72"
              r={radius}
              stroke="url(#snapGradient)"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-75 ease-linear"
            />
            <defs>
              <linearGradient id="snapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>

          {/* Centered seconds counter */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-extrabold font-heading text-white tracking-tighter">
              {timeLeft.toFixed(1)}s
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-assemble-glow">
              Auto Exiting
            </span>
          </div>
        </div>

        {/* Disintegrate hint */}
        <div className="text-xs text-slate-400 mb-6 flex items-center justify-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>Accidental snap? Abort immediately below or press ESC</span>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-5 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 transition-all flex items-center justify-center gap-2 shadow hover:shadow-lg active:scale-95"
          >
            <X className="w-4 h-4 text-red-400" />
            <span>Cancel Exit</span>
          </button>

          <button
            onClick={() => {
              sounds.playSnap();
              onConfirmExit();
            }}
            className="flex-1 py-3 px-5 rounded-xl font-bold text-sm bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>Leave Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}
