import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, ThumbsUp, Flame, Sparkles, Heart } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function ChatTab({ messages, onSendMessage }) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    sounds.playClick(true);
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleQuickReaction = (emoji) => {
    sounds.playNotification();
    onSendMessage(emoji);
  };

  return (
    <div className="flex flex-col h-full bg-assemble-card/50">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 pr-2">
        <div className="text-center my-2">
          <span className="text-[10px] uppercase font-semibold text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700/50">
            Messages are visible to everyone in call
          </span>
        </div>

        {messages.map((msg) => {
          const isMe = msg.senderId === 'local-user';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}
            >
              <div className="flex items-center gap-2 mb-1 px-1">
                <span
                  className={`text-xs font-semibold ${
                    isMe
                      ? 'text-assemble-glow'
                      : msg.isInstructor
                      ? 'text-amber-300'
                      : 'text-slate-200'
                  }`}
                >
                  {msg.senderName}
                </span>

                {msg.role && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                      msg.isInstructor
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : isMe
                        ? 'bg-assemble-neon/20 text-assemble-glow border border-assemble-neon/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {msg.role}
                  </span>
                )}

                <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
              </div>

              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed break-words shadow-sm transition-all ${
                  isMe
                    ? 'bg-gradient-to-r from-assemble-neon/90 to-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-800/90 text-slate-100 border border-slate-700/60 rounded-tl-none group-hover:border-assemble-neon/30'
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Reaction Bar */}
      <div className="px-4 py-2 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between gap-1 text-slate-300">
        <span className="text-[10px] text-slate-400 uppercase font-semibold">Reactions:</span>
        <div className="flex items-center gap-1.5">
          {['⚡', '🔥', '👍', '👏', '💡', '❤️'].map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleQuickReaction(emoji)}
              className="hover:scale-125 hover:bg-slate-800 active:scale-95 p-1 rounded-md transition text-sm"
              title={`React with ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Input Composer */}
      <form
        onSubmit={handleSend}
        className="p-3 border-t border-slate-800 bg-slate-900/90 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Send a message to everyone..."
          className="flex-1 bg-slate-950/80 border border-slate-700/80 focus:border-assemble-neon text-white text-xs rounded-xl px-3.5 py-2.5 outline-none transition placeholder-slate-500 shadow-inner"
        />

        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2.5 bg-assemble-neon hover:bg-assemble-neonHover disabled:opacity-40 disabled:hover:bg-assemble-neon text-white rounded-xl shadow-md transition active:scale-95 flex items-center justify-center"
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
