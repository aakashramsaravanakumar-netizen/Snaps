import React, { useRef, useState, useEffect } from 'react';
import {
  PenTool,
  Eraser,
  RotateCcw,
  Download,
  Trash2,
  Square,
  Circle,
  Minus,
  Sparkles,
  Grid
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

const PALETTE = [
  { name: 'Neon Violet', color: '#a855f7' },
  { name: 'Electric Cyan', color: '#06b6d4' },
  { name: 'Cosmic Gold', color: '#eab308' },
  { name: 'Quantum Emerald', color: '#10b981' },
  { name: 'Pulse Rose', color: '#ec4899' },
  { name: 'Stark White', color: '#f8fafc' },
];

export default function WhiteboardTab() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [activeTool, setActiveTool] = useState('pen'); // 'pen', 'eraser', 'line', 'rect', 'circle'
  const [activeColor, setActiveColor] = useState('#a855f7');
  const [lineWidth, setLineWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showGrid, setShowGrid] = useState(true);

  // Initial draw coords for shapes
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const snapshotRef = useRef(null);

  // Resize canvas to fill container while preserving content
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeObserver = new ResizeObserver(() => {
      const rect = container.getBoundingClientRect();
      const currentWidth = canvas.width;
      const currentHeight = canvas.height;

      // Only resize if significantly changed
      if (Math.abs(currentWidth - rect.width) > 5 || Math.abs(currentHeight - rect.height) > 5) {
        // Save old content
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = currentWidth;
        tempCanvas.height = currentHeight;
        const tempCtx = tempCanvas.getContext('2d');
        if (tempCtx && currentWidth > 0 && currentHeight > 0) {
          tempCtx.drawImage(canvas, 0, 0);
        }

        canvas.width = rect.width;
        canvas.height = rect.height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          if (tempWidthSafe(tempCanvas)) {
            ctx.drawImage(tempCanvas, 0, 0);
          } else {
            // Draw sample student diagram initially if empty
            drawInitialDiagram(ctx, rect.width, rect.height);
          }
          saveState();
        }
      }
    });

    const tempWidthSafe = (tc) => tc.width > 10 && tc.height > 10;

    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  // Helper to draw an initial lecture diagram on the whiteboard so students see immediate value
  const drawInitialDiagram = (ctx, w, h) => {
    ctx.save();
    // Title
    ctx.font = '13px Outfit, sans-serif';
    ctx.fillStyle = '#a855f7';
    ctx.fillText('⚡ Assemble Mesh Topology - Node Sync', 20, 30);

    // Nodes
    const nodes = [
      { x: w * 0.25, y: h * 0.45, label: 'Node Alpha' },
      { x: w * 0.7, y: h * 0.35, label: 'Node Beta' },
      { x: w * 0.5, y: h * 0.75, label: 'Quantum Hub' },
    ];

    // Edges
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);

    ctx.beginPath();
    ctx.moveTo(nodes[0].x, nodes[0].y);
    ctx.lineTo(nodes[1].x, nodes[1].y);
    ctx.lineTo(nodes[2].x, nodes[2].y);
    ctx.lineTo(nodes[0].x, nodes[0].y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Circles
    nodes.forEach((n, idx) => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, 14, 0, 2 * Math.PI);
      ctx.fillStyle = idx === 2 ? '#ec4899' : '#06b6d4';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.font = '11px Inter, sans-serif';
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(n.label, n.x - 24, n.y + 26);
    });

    ctx.restore();
  };

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const dataUrl = canvas.toDataURL();
      setHistory((prev) => {
        const next = [...prev.slice(0, historyIndex + 1), dataUrl];
        if (next.length > 20) next.shift(); // limit memory
        return next;
      });
      setHistoryIndex((prev) => Math.min(prev + 1, 19));
    } catch (e) {
      console.warn('Canvas saveState error:', e);
    }
  };

  const getCanvasPos = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    let clientX = e.clientX;
    let clientY = e.clientY;

    if (e.touches && e.touches[0]) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasPos(e);
    startXRef.current = x;
    startYRef.current = y;
    setIsDrawing(true);

    // Save snapshot for shape previews (rect, circle, line)
    snapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);

    if (activeTool === 'pen' || activeTool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.strokeStyle = activeTool === 'eraser' ? '#0f172a' : activeColor;
      ctx.lineWidth = activeTool === 'eraser' ? lineWidth * 4 : lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasPos(e);

    if (activeTool === 'pen' || activeTool === 'eraser') {
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (snapshotRef.current) {
      // Restore before drawing shape preview
      ctx.putImageData(snapshotRef.current, 0, 0);

      ctx.strokeStyle = activeColor;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (activeTool === 'line') {
        ctx.beginPath();
        ctx.moveTo(startXRef.current, startYRef.current);
        ctx.lineTo(x, y);
        ctx.stroke();
      } else if (activeTool === 'rect') {
        const w = x - startXRef.current;
        const h = y - startYRef.current;
        ctx.strokeRect(startXRef.current, startYRef.current, w, h);
      } else if (activeTool === 'circle') {
        const radius = Math.sqrt(
          Math.pow(x - startXRef.current, 2) + Math.pow(y - startYRef.current, 2)
        );
        ctx.beginPath();
        ctx.arc(startXRef.current, startYRef.current, radius, 0, 2 * Math.PI);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    snapshotRef.current = null;
    saveState();
  };

  const handleClear = () => {
    sounds.playClick(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveState();
  };

  const handleUndo = () => {
    if (historyIndex <= 0) return;
    sounds.playClick(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newIndex = historyIndex - 1;
    const img = new Image();
    img.src = history[newIndex];
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      setHistoryIndex(newIndex);
    };
  };

  const handleDownload = () => {
    sounds.playClick(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `assemble-whiteboard-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex flex-col h-full bg-assemble-card/50">
      {/* Whiteboard Controls Header */}
      <div className="p-2 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between gap-1 flex-wrap">
        {/* Tool Selector */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setActiveTool('pen');
              sounds.playClick(true);
            }}
            title="Pen"
            className={`p-1.5 rounded transition ${
              activeTool === 'pen'
                ? 'bg-assemble-neon text-white shadow-sm'
                : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              setActiveTool('eraser');
              sounds.playClick(true);
            }}
            title="Eraser"
            className={`p-1.5 rounded transition ${
              activeTool === 'eraser'
                ? 'bg-assemble-neon text-white shadow-sm'
                : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Eraser className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-slate-700 mx-1" />

          {/* Shapes */}
          <button
            onClick={() => {
              setActiveTool('line');
              sounds.playClick(true);
            }}
            title="Line"
            className={`p-1.5 rounded transition ${
              activeTool === 'line'
                ? 'bg-assemble-neon text-white shadow-sm'
                : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              setActiveTool('rect');
              sounds.playClick(true);
            }}
            title="Rectangle"
            className={`p-1.5 rounded transition ${
              activeTool === 'rect'
                ? 'bg-assemble-neon text-white shadow-sm'
                : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Square className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              setActiveTool('circle');
              sounds.playClick(true);
            }}
            title="Circle"
            className={`p-1.5 rounded transition ${
              activeTool === 'circle'
                ? 'bg-assemble-neon text-white shadow-sm'
                : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Circle className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Action Buttons: Undo, Clear, Grid, Download */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowGrid(!showGrid)}
            title="Toggle Grid"
            className={`p-1.5 rounded transition ${
              showGrid ? 'text-assemble-glow bg-slate-800' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            title="Undo"
            className="p-1.5 rounded text-slate-300 hover:bg-slate-800 disabled:opacity-30 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleClear}
            title="Clear Board"
            className="p-1.5 rounded text-red-400 hover:bg-red-500/20 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleDownload}
            title="Save Canvas as PNG"
            className="p-1.5 rounded text-assemble-glow hover:bg-slate-800 transition"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Secondary Bar: Color Palette & Stroke Width */}
      <div className="px-3 py-1.5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between gap-2 flex-wrap">
        {/* Colors */}
        <div className="flex items-center gap-1.5">
          {PALETTE.map((item) => (
            <button
              key={item.color}
              onClick={() => {
                setActiveColor(item.color);
                sounds.playClick(true);
              }}
              title={item.name}
              style={{ backgroundColor: item.color }}
              className={`w-4 h-4 rounded-full transition-transform ${
                activeColor === item.color
                  ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900'
                  : 'hover:scale-110 opacity-80'
              }`}
            />
          ))}
          {/* Custom color picker */}
          <input
            type="color"
            value={activeColor}
            onChange={(e) => setActiveColor(e.target.value)}
            className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
            title="Custom Hex Color"
          />
        </div>

        {/* Stroke Width Slider */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="text-[10px]">Width:</span>
          <input
            type="range"
            min="1"
            max="20"
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            className="w-16 accent-assemble-neon cursor-pointer h-1 bg-slate-700 rounded-lg"
          />
          <span className="text-[10px] w-3 font-mono">{lineWidth}</span>
        </div>
      </div>

      {/* Whiteboard Canvas Container */}
      <div
        ref={containerRef}
        className={`flex-1 relative overflow-hidden bg-[#0c0e18] cursor-crosshair ${
          showGrid
            ? 'bg-[linear-gradient(to_right,#1e293b22_1px,transparent_1px),linear-gradient(to_bottom,#1e293b22_1px,transparent_1px)] bg-[size:24px_24px]'
            : ''
        }`}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="absolute inset-0 touch-none w-full h-full"
        />

        {/* Watermark / Assemble student board tag */}
        <div className="absolute bottom-2 right-2 pointer-events-none opacity-40 text-[10px] text-slate-400 font-mono flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5 text-assemble-neon" />
          <span>Assemble Live Canvas</span>
        </div>
      </div>
    </div>
  );
}
