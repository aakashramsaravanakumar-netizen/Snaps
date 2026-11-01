import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Mail,
  Send,
  ExternalLink,
  Link as LinkIcon,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function ShareMeetingModal({
  isOpen,
  onClose,
  meetingId,
  meetingTitle,
  invitedEmails = [],
  onInviteEmail,
}) {
  const [copied, setCopied] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  if (!isOpen) return null;

  const meetingUrl = `${window.location.origin}${window.location.pathname}?meeting=${encodeURIComponent(meetingId)}`;

  const handleCopyLink = () => {
    sounds.playClick(true);
    navigator.clipboard.writeText(meetingUrl);
    setCopied(true);
    setFeedbackMsg('Meeting link copied to clipboard!');
    setTimeout(() => {
      setCopied(false);
      setFeedbackMsg('');
    }, 3000);
  };

  const handleSendInvite = (e) => {
    e?.preventDefault();
    const email = emailInput.trim();
    if (!email) return;

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFeedbackMsg('Please enter a valid email address.');
      sounds.playClick(false);
      return;
    }

    if (onInviteEmail) {
      onInviteEmail(email);
    }
    sounds.playNotification();
    setFeedbackMsg(`Invitation successfully dispatched to ${email}!`);
    setEmailInput('');

    setTimeout(() => {
      setFeedbackMsg('');
    }, 4000);
  };

  const handleOpenTestWindow = () => {
    sounds.playClick(true);
    window.open(meetingUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in select-none">
      {/* Modal card */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute -top-24 -right-24 w-52 h-52 bg-assemble-neon/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-52 h-52 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-assemble-neon/20 border border-assemble-neon/40 flex items-center justify-center text-assemble-glow">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading text-white">
                Share Meeting & Invite
              </h2>
              <p className="text-xs text-slate-400">
                Send invitation link so participants can join with their own mail ID
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick(false);
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Meeting Info Pill */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 mb-5 flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Meeting Room
            </div>
            <div className="text-xs font-bold text-white truncate">
              {meetingTitle || 'Assemble Meeting'}
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 rounded-lg text-xs font-mono text-assemble-glow border border-slate-700">
            <span>ID:</span>
            <span className="font-bold">{meetingId}</span>
          </div>
        </div>

        {/* Meeting Link Copy Box */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <LinkIcon className="w-3.5 h-3.5 text-assemble-neon" />
            <span>Shareable Meeting Link</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={meetingUrl}
              className="flex-1 bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none font-mono selection:bg-assemble-neon/40 select-all"
            />
            <button
              onClick={handleCopyLink}
              className={`px-3.5 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition active:scale-95 shadow ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-assemble-neon hover:bg-assemble-neonHover text-white shadow-neon'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Invite by Email Field */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-assemble-neon" />
            <span>Invite via Email ID</span>
          </label>
          <form onSubmit={handleSendInvite} className="flex items-center gap-2">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="e.g. colleague@university.edu"
              className="flex-1 bg-slate-950 border border-slate-700 focus:border-assemble-neon text-white text-xs rounded-xl px-3 py-2.5 outline-none transition placeholder-slate-500"
            />
            <button
              type="submit"
              disabled={!emailInput.trim()}
              className="px-4 py-2.5 bg-gradient-to-r from-assemble-neon to-indigo-600 hover:from-assemble-neonHover hover:to-indigo-500 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Invite</span>
            </button>
          </form>

          {/* Feedback message */}
          {feedbackMsg && (
            <div className="mt-2 text-xs flex items-center gap-1.5 text-assemble-glow animate-fade-in">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{feedbackMsg}</span>
            </div>
          )}
        </div>

        {/* Invited Guests List */}
        {invitedEmails.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center justify-between text-[11px] text-slate-400 uppercase font-semibold mb-2">
              <span>Invited Guests ({invitedEmails.length})</span>
              <span className="text-emerald-400 font-medium">Link delivered</span>
            </div>
            <div className="max-h-32 overflow-y-auto space-y-1.5 bg-slate-950/40 p-2 rounded-xl border border-slate-800">
              {invitedEmails.map((item, idx) => {
                const email = typeof item === 'string' ? item : item.email;
                const status = item.status || 'Invite Sent';
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg bg-slate-800/70 border border-slate-700/50"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold text-[10px]">
                        {email[0].toUpperCase()}
                      </div>
                      <span className="text-slate-200 truncate">{email}</span>
                    </div>
                    <span className="text-[10px] bg-assemble-neon/15 text-assemble-glow border border-assemble-neon/30 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      <span>{status}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Actions: Multi-tab Test Shortcut */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleOpenTestWindow}
            title="Open link in another window to test joining with another mail ID"
            className="flex items-center gap-1.5 text-xs text-assemble-glow hover:text-white hover:underline transition"
          >
            <ExternalLink className="w-3.5 h-3.5 text-assemble-neon" />
            <span>Test Join in New Tab with another Mail ID</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick(false);
              onClose();
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
