import React, { useState, useRef } from 'react';
import {
  Bold,
  Italic,
  Heading,
  List,
  CheckSquare,
  Code,
  Download,
  Copy,
  Check,
  Sparkles,
  FileText
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function NotesTab({ notes, onNotesChange }) {
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef(null);

  // Helper to insert markdown formatting tokens around current selection
  const insertFormatting = (prefix, suffix = '') => {
    sounds.playClick(true);
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const previousText = textarea.value;
    const selectedText = previousText.substring(start, end) || 'text';

    const replacement = `${prefix}${selectedText}${suffix}`;
    const newText =
      previousText.substring(0, start) + replacement + previousText.substring(end);

    onNotesChange(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 0);
  };

  const handleCopy = () => {
    sounds.playClick(true);
    navigator.clipboard.writeText(notes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    sounds.playClick(true);
    const blob = new Blob([notes], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assemble-lecture-notes-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const wordCount = notes.trim() ? notes.trim().split(/\s+/).length : 0;
  const charCount = notes.length;

  return (
    <div className="flex flex-col h-full bg-assemble-card/50">
      {/* Formatting Toolbar */}
      <div className="p-2 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between gap-1 flex-wrap">
        <div className="flex items-center gap-1">
          <button
            onClick={() => insertFormatting('**', '**')}
            title="Bold (**text**)"
            className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded transition"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertFormatting('*', '*')}
            title="Italic (*text*)"
            className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded transition"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertFormatting('### ')}
            title="Heading (### Heading)"
            className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded transition"
          >
            <Heading className="w-3.5 h-3.5" />
          </button>
          <div className="w-[1px] h-4 bg-slate-700 mx-1" />
          <button
            onClick={() => insertFormatting('- ')}
            title="Bullet list (- Item)"
            className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded transition"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertFormatting('- [ ] ')}
            title="Checklist (- [ ] Task)"
            className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded transition"
          >
            <CheckSquare className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertFormatting('`', '`')}
            title="Code snippet (`code`)"
            className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded transition"
          >
            <Code className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            title="Copy notes to clipboard"
            className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-assemble-glow rounded transition flex items-center gap-1 text-[11px]"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            onClick={handleDownload}
            title="Download Notes (.md)"
            className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-assemble-glow rounded transition text-[11px]"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 p-3 flex flex-col relative">
        <textarea
          ref={textareaRef}
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Jot down notes, lecture takeaways, or questions for professor Cho..."
          className="w-full flex-1 bg-slate-950/70 border border-slate-800/80 focus:border-assemble-neon/80 rounded-xl p-3 text-xs leading-relaxed text-slate-100 font-mono resize-none outline-none transition placeholder-slate-500 shadow-inner"
        />
      </div>

      {/* Footer / Word count & status */}
      <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-900/60 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Auto-saving</span>
          </span>
          <span>•</span>
          <span>{wordCount} words</span>
          <span>•</span>
          <span>{charCount} chars</span>
        </div>
        <div className="text-assemble-glow text-[10px] font-medium flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-assemble-neon" />
          <span>Student Sync Active</span>
        </div>
      </div>
    </div>
  );
}
