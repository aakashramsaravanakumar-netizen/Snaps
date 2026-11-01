import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Sparkles, Eye, EyeOff, Hand, Zap, AlertTriangle, RefreshCw } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

/**
 * MediaPipe Hands detector component for Avengers "Assemble Snap" exit.
 * Tracks thumb (Landmark 4) and middle finger (Landmark 12).
 * Detects pinch (contact) followed by rapid release (snap).
 */
export default function GestureDetector({
  isActive,
  onSnapDetected,
  localStream,
  isCameraOn,
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const internalCameraRef = useRef(null);
  const handsInstanceRef = useRef(null);

  const [handDetected, setHandDetected] = useState(false);
  const [gestureState, setGestureState] = useState('idle'); // idle, primed, snapped
  const [debugOverlay, setDebugOverlay] = useState(true);
  const [hudMessage, setHudMessage] = useState('Standby');
  const [mediaPipeReady, setMediaPipeReady] = useState(false);
  const [detectionError, setDetectionError] = useState(null);

  // State machine refs for accurate high-frequency landmark calculations
  const pinchStartTimeRef = useRef(0);
  const isPinchingRef = useRef(false);
  const lastDistanceRef = useRef(1.0);
  const snapCooldownRef = useRef(0);

  // Calculate Euclidean distance between two 3D landmarks
  const calculateDistance = (lm1, lm2) => {
    const dx = lm1.x - lm2.x;
    const dy = lm1.y - lm2.y;
    const dz = (lm1.z || 0) - (lm2.z || 0);
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  };

  // Trigger Snap Action with sound and callback
  const triggerSnapAction = useCallback(() => {
    const now = Date.now();
    if (now - snapCooldownRef.current < 2500) return; // debounce
    snapCooldownRef.current = now;

    setGestureState('snapped');
    setHudMessage('⚡ SNAP DETECTED! ⚡');
    sounds.playSnap();

    if (onSnapDetected) {
      onSnapDetected();
    }

    setTimeout(() => {
      setGestureState('idle');
      setHudMessage('Hand Ready');
    }, 2000);
  }, [onSnapDetected]);

  // Process hand landmarks on each frame
  const onResults = useCallback(
    (results) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        setHandDetected(true);
        const landmarks = results.multiHandLandmarks[0];

        // Key landmarks for finger snap:
        // 4: Thumb tip
        // 12: Middle finger tip
        // 8: Index finger tip (optional check for posture)
        const thumbTip = landmarks[4];
        const middleTip = landmarks[12];
        const indexTip = landmarks[8];

        const thumbMiddleDistance = calculateDistance(thumbTip, middleTip);
        const now = Date.now();

        // Check for SNAP GESTURE:
        // Phase 1: Primed/Pinch (Thumb tip & Middle finger tip close together)
        const PINCH_THRESHOLD = 0.065; // Normalized screen space
        const RELEASE_THRESHOLD = 0.145; // Separation after snap
        const MAX_SNAP_DURATION_MS = 450; // Rapid release window

        if (thumbMiddleDistance < PINCH_THRESHOLD) {
          if (!isPinchingRef.current) {
            isPinchingRef.current = true;
            pinchStartTimeRef.current = now;
            setGestureState('primed');
            setHudMessage('Primed: Release to Snap');
          }
        } else if (isPinchingRef.current) {
          // Check if released within the rapid snap threshold
          const pinchDuration = now - pinchStartTimeRef.current;
          const deltaDistance = thumbMiddleDistance - (lastDistanceRef.current || 0);

          if (
            thumbMiddleDistance > RELEASE_THRESHOLD &&
            pinchDuration > 40 &&
            pinchDuration < MAX_SNAP_DURATION_MS
          ) {
            isPinchingRef.current = false;
            triggerSnapAction();
          } else if (pinchDuration >= MAX_SNAP_DURATION_MS) {
            // Held too long without snapping, reset
            isPinchingRef.current = false;
            setGestureState('idle');
            setHudMessage('Hand Ready');
          }
        }

        lastDistanceRef.current = thumbMiddleDistance;

        // Render sleek futuristic neon HUD skeleton on the debug canvas
        if (debugOverlay) {
          const w = canvas.width;
          const h = canvas.height;

          // Draw neon landmark connections
          const CONNECTIONS = [
            [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
            [0, 5], [5, 6], [6, 7], [7, 8], // Index
            [0, 9], [9, 10], [10, 11], [11, 12], // Middle
            [0, 13], [13, 14], [14, 15], [15, 16], // Ring
            [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
            [5, 9], [9, 13], [13, 17], // Palm
          ];

          ctx.lineWidth = 2;
          ctx.strokeStyle = isPinchingRef.current
            ? 'rgba(236, 72, 153, 0.85)'
            : 'rgba(168, 85, 247, 0.65)';

          CONNECTIONS.forEach(([start, end]) => {
            const p1 = landmarks[start];
            const p2 = landmarks[end];
            ctx.beginPath();
            ctx.moveTo(p1.x * w, p1.y * h);
            ctx.lineTo(p2.x * w, p2.y * h);
            ctx.stroke();
          });

          // Draw joints with glowing nodes
          landmarks.forEach((lm, idx) => {
            const isSnapFinger = idx === 4 || idx === 12;
            ctx.beginPath();
            ctx.arc(
              lm.x * w,
              lm.y * h,
              isSnapFinger ? (isPinchingRef.current ? 7 : 5) : 3,
              0,
              2 * Math.PI
            );
            ctx.fillStyle = isSnapFinger
              ? isPinchingRef.current
                ? '#ec4899'
                : '#06b6d4'
              : '#c084fc';
            ctx.shadowColor = isSnapFinger ? '#a855f7' : '#818cf8';
            ctx.shadowBlur = isSnapFinger ? 10 : 4;
            ctx.fill();
            ctx.shadowBlur = 0;
          });

          // Highlight the snap pinch distance line
          ctx.beginPath();
          ctx.setLineDash([4, 4]);
          ctx.strokeStyle = isPinchingRef.current ? '#f43f5e' : '#a855f7';
          ctx.lineWidth = 2;
          ctx.moveTo(thumbTip.x * w, thumbTip.y * h);
          ctx.lineTo(middleTip.x * w, middleTip.y * h);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      } else {
        setHandDetected(false);
        if (isPinchingRef.current) {
          isPinchingRef.current = false;
        }
        setGestureState('idle');
        setHudMessage('Looking for hand...');
      }

      ctx.restore();
    },
    [debugOverlay, triggerSnapAction]
  );

  // Initialize MediaPipe Hands
  useEffect(() => {
    let isCancelled = false;

    async function initMediaPipe() {
      if (!isActive) return;

      try {
        // Look for MediaPipe Hands either globally (from CDN) or imported
        let HandsClass = window.Hands;
        if (!HandsClass) {
          try {
            const mp = await import('@mediapipe/hands');
            HandsClass = mp.Hands;
          } catch (e) {
            console.warn('Local @mediapipe/hands import fallback to global:', e);
          }
        }

        if (!HandsClass && window.Hands) {
          HandsClass = window.Hands;
        }

        if (!HandsClass) {
          setDetectionError('MediaPipe Hands library loading...');
          return;
        }

        const hands = new HandsClass({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
          },
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        hands.onResults(onResults);
        handsInstanceRef.current = hands;

        if (!isCancelled) {
          setMediaPipeReady(true);
          setDetectionError(null);
        }
      } catch (err) {
        console.error('Failed to initialize MediaPipe Hands:', err);
        if (!isCancelled) {
          setDetectionError('MediaPipe initialising in fallback mode');
        }
      }
    }

    initMediaPipe();

    return () => {
      isCancelled = true;
      if (handsInstanceRef.current) {
        try {
          handsInstanceRef.current.close();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [isActive, onResults]);

  // Hook up video processing loop
  useEffect(() => {
    if (!isActive || !mediaPipeReady) return;

    let animId;
    let isRunning = true;

    const processFrame = async () => {
      if (!isRunning) return;

      const video = videoRef.current;
      const hands = handsInstanceRef.current;

      if (video && hands && video.readyState >= 2) {
        try {
          await hands.send({ image: video });
        } catch (e) {
          // Ignore frame drop errors
        }
      }

      if (isRunning) {
        animId = requestAnimationFrame(processFrame);
      }
    };

    animId = requestAnimationFrame(processFrame);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animId);
    };
  }, [isActive, mediaPipeReady]);

  // Attach local video stream to hidden detector video element
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (localStream) {
      video.srcObject = localStream;
      video.play().catch(() => {});
    }
  }, [localStream]);

  if (!isActive) return null;

  return (
    <div className="relative group">
      {/* Hidden processing video */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className="hidden"
        width={320}
        height={240}
      />

      {/* Floating Assemble Snap Gesture HUD */}
      <div className="bg-slate-900/90 backdrop-blur-md border border-assemble-neon/40 rounded-xl p-3 shadow-neon-strong transition-all duration-300 w-64 text-xs select-none">
        <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-700/60">
          <div className="flex items-center gap-1.5 font-semibold text-assemble-glow">
            <Zap className="w-3.5 h-3.5 text-assemble-neon animate-pulse" />
            <span className="tracking-wide">Assemble Snap AI</span>
          </div>
          <button
            onClick={() => setDebugOverlay(!debugOverlay)}
            title="Toggle landmark visualizer"
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
          >
            {debugOverlay ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          </button>
        </div>

        {/* Live Canvas Landmark Viewer */}
        <div className="relative aspect-[4/3] bg-black/60 rounded-lg overflow-hidden border border-slate-800 mb-2.5 flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={240}
            height={180}
            className={`w-full h-full object-cover transform -scale-x-100 ${
              !debugOverlay ? 'opacity-20' : 'opacity-100'
            }`}
          />

          {!handDetected && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/70 p-2 text-center">
              <Hand className="w-8 h-8 text-assemble-neon/60 mb-1 animate-pulse" />
              <span className="text-[11px] text-slate-300">
                Raise hand to camera to prime snap
              </span>
            </div>
          )}

          {/* Gesture State Glow Badge */}
          <div className="absolute top-1.5 left-1.5 flex items-center gap-1.5 bg-slate-900/80 px-2 py-0.5 rounded-full border border-slate-700/60 text-[10px]">
            <span
              className={`w-2 h-2 rounded-full ${
                gestureState === 'primed'
                  ? 'bg-amber-400 animate-ping'
                  : gestureState === 'snapped'
                  ? 'bg-assemble-neon animate-pulse'
                  : handDetected
                  ? 'bg-emerald-400'
                  : 'bg-slate-500'
              }`}
            />
            <span className="text-slate-200 capitalize">{hudMessage}</span>
          </div>
        </div>

        {/* Guide / Instruction */}
        <div className="space-y-1 text-slate-300 text-[11px] leading-tight mb-2.5">
          <p className="flex items-center gap-1 text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-assemble-neon inline-block" />
            <span>Pinch thumb & middle finger, then snap open quickly.</span>
          </p>
        </div>

        {/* Direct Test Snap Button (Convenient for test and instant evaluation) */}
        <button
          onClick={triggerSnapAction}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-gradient-to-r from-assemble-neon to-indigo-600 hover:from-assemble-neonHover hover:to-indigo-500 active:scale-95 text-white font-medium rounded-lg shadow-sm transition-all text-xs"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Simulate Snap Gesture</span>
        </button>
      </div>
    </div>
  );
}
