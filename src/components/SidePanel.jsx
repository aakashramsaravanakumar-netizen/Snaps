import React from 'react';
import {
  MessageSquare,
  FileText,
  PenTool,
  Users,
  X,
  Maximize2,
  Sparkles
} from 'lucide-react';
import ChatTab from './ChatTab';
import NotesTab from './NotesTab';
import WhiteboardTab from './WhiteboardTab';
import ParticipantsTab from './ParticipantsTab';
import { sounds } from '../utils/soundEffects';

export default function SidePanel({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  messages,
  onSendMessage,
  notes,
  onNotesChange,
  participants,
  onTogglePin,
  onOpenShareModal,
}) {
  const TABS = [
    { id: 'chat', label: 'Chat', icon: MessageSquare, badge: null },
    { id: 'notes', label: 'Quick Notes', icon: FileText, badge: 'Live' },
    { id: 'whiteboard', label: 'Whiteboard', icon: PenTool, badge: null },
    { id: 'people', label: 'People', icon: Users, badge: participants.length },
  ];

  if (!isOpen) return null;

  return (
    <aside className="w-80 md:w-96 flex flex-col h-full bg-slate-900/95 border-l border-slate-800 backdrop-blur-xl shadow-2xl z-30 transition-all duration-300">
      {/* Drawer Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-assemble-neon animate-pulse" />
          <h3 className="font-heading font-semibold text-sm text-white capitalize">
            {TABS.find((t) => t.id === activeTab)?.label || 'Panel'}
          </h3>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              sounds.playClick(false);
              onClose();
            }}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
            title="Close drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tab Navigation Strip */}
      <div className="flex items-center border-b border-slate-800/90 bg-slate-950/40 px-2 pt-1 gap-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                sounds.playClick(true);
                setActiveTab(tab.id);
              }}
              className={`flex-1 py-2 px-1 text-xs font-medium rounded-t-lg transition flex items-center justify-center gap-1.5 relative ${
                isActive
                  ? 'text-assemble-glow bg-slate-800/80 border-b-2 border-assemble-neon'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>

              {tab.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive
                      ? 'bg-assemble-neon text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Drawer Body */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'chat' && (
          <ChatTab messages={messages} onSendMessage={onSendMessage} />
        )}
        {activeTab === 'notes' && (
          <NotesTab notes={notes} onNotesChange={onNotesChange} />
        )}
        {activeTab === 'whiteboard' && <WhiteboardTab />}
        {activeTab === 'people' && (
          <ParticipantsTab
            participants={participants}
            onTogglePin={onTogglePin}
            onOpenShareModal={onOpenShareModal}
          />
        )}
      </div>
    </aside>
  );
}
