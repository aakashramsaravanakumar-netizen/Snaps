import React, { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from './components/Navbar';
import VideoGrid from './components/VideoGrid';
import ControlBar from './components/ControlBar';
import SidePanel from './components/SidePanel';
import GestureDetector from './components/GestureDetector';
import SnapCountdownOverlay from './components/SnapCountdownOverlay';
import MeetingEndedSplash from './components/MeetingEndedSplash';
import Dashboard from './components/Dashboard';
import Lobby from './components/Lobby';
import ShareMeetingModal from './components/ShareMeetingModal';
import ProfileModal from './components/ProfileModal';
import {
  INITIAL_PARTICIPANTS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_NOTES_CONTENT,
} from './data/mockData';
import { sounds } from './utils/soundEffects';
import { MeetingSync } from './utils/meetingSync';

export default function App() {
  // Navigation / View state: 'dashboard' | 'lobby' | 'in_call' | 'ended'
  const [viewMode, setViewMode] = useState('dashboard');
  const [exitReason, setExitReason] = useState('snap'); // 'snap' | 'manual'

  // Current User Identity (Stored & Customizable)
  const [currentUser, setCurrentUser] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('assemble_user_profile');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          // fallback
        }
      }
    }
    return {
      id: `usr-${Date.now()}`,
      name: 'Alex Vance',
      email: 'alex.vance@assemble.edu',
      avatarGradient: 'from-violet-600 to-indigo-600',
      avatarText: 'AV',
    };
  });

  // Active Meeting Info
  const [activeMeetingId, setActiveMeetingId] = useState('cs-409-quantum');
  const [activeMeetingTitle, setActiveMeetingTitle] = useState('CS-409: Distributed Quantum Computing');
  const [invitedEmails, setInvitedEmails] = useState([]);

  // Modals
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // User Device & Feature States
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isSnapActive, setIsSnapActive] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [layoutMode, setLayoutMode] = useState('grid'); // 'grid' | 'spotlight'

  // Countdown Overlay state
  const [showSnapCountdown, setShowSnapCountdown] = useState(false);

  // Side Panel State
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [activeSideTab, setActiveSideTab] = useState('chat'); // 'chat' | 'notes' | 'whiteboard' | 'people'

  // Data States
  const [participants, setParticipants] = useState(INITIAL_PARTICIPANTS);
  const [messages, setMessages] = useState(INITIAL_CHAT_MESSAGES);
  const [notes, setNotes] = useState(INITIAL_NOTES_CONTENT);

  // Local media stream
  const [localStream, setLocalStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);

  // Real-time multi-tab meeting sync
  const syncRef = useRef(null);

  // Check URL query parameters on initial page load (e.g. ?meeting=asm-hero-123)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const meetingParam = params.get('meeting');
      if (meetingParam) {
        setActiveMeetingId(meetingParam);
        if (meetingParam === 'cs-409-quantum') {
          setActiveMeetingTitle('CS-409: Distributed Quantum Computing');
        } else {
          setActiveMeetingTitle(`Assemble Meeting (${meetingParam})`);
        }
        setViewMode('lobby');
      }
    }
  }, []);

  // Save current user to localStorage whenever modified
  const handleSaveUser = (updatedUser) => {
    setCurrentUser(updatedUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('assemble_user_profile', JSON.stringify(updatedUser));
    }
  };

  // Initialize Real Webcam stream if available when in call
  useEffect(() => {
    let streamInstance = null;

    async function setupCamera() {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 } },
            audio: false, // avoid feedback in local testing
          });
          streamInstance = stream;
          setLocalStream(stream);
        } catch (err) {
          console.warn('Real webcam not accessible or permission denied. Using virtual student avatar:', err);
          setCameraError(err.message);
        }
      }
    }

    if (viewMode === 'in_call' && isVideoOn) {
      setupCamera();
    }

    return () => {
      if (streamInstance) {
        streamInstance.getTracks().forEach((track) => track.stop());
      }
    };
  }, [viewMode, isVideoOn]);

  // Sync local participant status and profile with user controls
  useEffect(() => {
    setParticipants((prev) =>
      prev.map((p) =>
        p.isLocal
          ? {
              ...p,
              name: `${currentUser.name} (You)`,
              email: currentUser.email,
              avatarGradient: currentUser.avatarGradient,
              avatarText: currentUser.avatarText,
              isMuted,
              isVideoOn,
              isHandRaised,
            }
          : p
      )
    );
  }, [currentUser, isMuted, isVideoOn, isHandRaised]);

  // Setup Multi-Tab Broadcast Sync for active meeting room
  useEffect(() => {
    if (viewMode !== 'in_call') {
      if (syncRef.current) {
        syncRef.current.leave(currentUser.id);
        syncRef.current = null;
      }
      return;
    }

    const localPeerData = {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      role: 'Participant',
      isLocal: false,
      isMuted,
      isVideoOn,
      isSpeaking: false,
      isHandRaised,
      isPinned: false,
      avatarGradient: currentUser.avatarGradient,
      avatarText: currentUser.avatarText,
      networkQuality: 'excellent',
    };

    const handlePeerJoin = (peer) => {
      if (!peer || peer.id === currentUser.id) return;

      setParticipants((prev) => {
        const exists = prev.some((p) => p.id === peer.id || (p.email && p.email === peer.email));
        if (exists) {
          return prev.map((p) => (p.id === peer.id ? { ...p, ...peer, isLocal: false } : p));
        }
        sounds.playNotification();
        return [...prev, { ...peer, isLocal: false }];
      });

      // Reply back to announce self to the newly joined peer
      if (syncRef.current) {
        syncRef.current.announce(localPeerData);
      }
    };

    const handlePeerLeave = (peerId) => {
      setParticipants((prev) => prev.filter((p) => p.id !== peerId));
    };

    const handlePeerMessage = (message) => {
      if (!message || message.senderId === currentUser.id) return;
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        sounds.playNotification();
        return [...prev, message];
      });
    };

    const handlePeerUpdate = (peerId, updates) => {
      setParticipants((prev) =>
        prev.map((p) => (p.id === peerId ? { ...p, ...updates } : p))
      );
    };

    const syncInstance = new MeetingSync(
      activeMeetingId,
      handlePeerJoin,
      handlePeerLeave,
      handlePeerMessage,
      handlePeerUpdate
    );
    syncRef.current = syncInstance;

    // Announce presence
    syncInstance.announce(localPeerData);
    syncInstance.requestExistingPeers();

    return () => {
      syncInstance.leave(currentUser.id);
      syncRef.current = null;
    };
  }, [viewMode, activeMeetingId, currentUser.id, currentUser.name, currentUser.email]);

  // Realistic Classroom Audio Activity Simulation (Speaking indicator rotation)
  useEffect(() => {
    if (viewMode !== 'in_call') return;

    const interval = setInterval(() => {
      setParticipants((prev) => {
        const rand = Math.random();
        return prev.map((p) => {
          if (p.id === 'p-helen') {
            return { ...p, isSpeaking: rand > 0.35 };
          }
          if (p.id === 'p-peter') {
            return { ...p, isSpeaking: rand > 0.8 };
          }
          if (p.id === 'p-wanda') {
            return { ...p, isSpeaking: rand > 0.88 };
          }
          return { ...p, isSpeaking: false };
        });
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [viewMode]);

  // Toggle Handlers
  const handleToggleMic = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    sounds.playClick(!nextState);
    if (syncRef.current) {
      syncRef.current.updatePeerState(currentUser.id, { isMuted: nextState });
    }
  };

  const handleToggleCamera = () => {
    const nextState = !isVideoOn;
    setIsVideoOn(nextState);
    sounds.playClick(nextState);

    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = nextState;
      });
    }

    if (syncRef.current) {
      syncRef.current.updatePeerState(currentUser.id, { isVideoOn: nextState });
    }
  };

  const handleToggleScreenShare = () => {
    sounds.playClick(!isScreenSharing);
    setIsScreenSharing(!isScreenSharing);
  };

  const handleToggleSnap = () => {
    const nextState = !isSnapActive;
    setIsSnapActive(nextState);
    sounds.playAssembleSurge();
  };

  const handleToggleHandRaise = () => {
    const nextState = !isHandRaised;
    setIsHandRaised(nextState);
    if (nextState) {
      sounds.playNotification();
    } else {
      sounds.playClick(false);
    }
    if (syncRef.current) {
      syncRef.current.updatePeerState(currentUser.id, { isHandRaised: nextState });
    }
  };

  const handleToggleLayout = () => {
    sounds.playClick(true);
    setLayoutMode((prev) => (prev === 'grid' ? 'spotlight' : 'grid'));
  };

  const handleOpenSidePanel = (tabName) => {
    sounds.playClick(true);
    if (sidePanelOpen && activeSideTab === tabName) {
      setSidePanelOpen(false);
    } else {
      setActiveSideTab(tabName);
      setSidePanelOpen(true);
    }
  };

  const handleTogglePin = (participantId) => {
    sounds.playClick(true);
    setParticipants((prev) =>
      prev.map((p) => ({
        ...p,
        isPinned: p.id === participantId ? !p.isPinned : false,
      }))
    );
    setLayoutMode('spotlight');
  };

  const handleToggleSoundFX = () => {
    sounds.muted = !sounds.muted;
    setSoundEnabled(!sounds.muted);
    if (!sounds.muted) sounds.playClick(true);
  };

  // Chat message sending with multi-tab broadcast + simulated peer replies
  const handleSendMessage = (text) => {
    const newMsg = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      senderName: `${currentUser.name} (You)`,
      senderEmail: currentUser.email,
      role: 'Participant',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isInstructor: false,
    };

    setMessages((prev) => [...prev, newMsg]);

    // Broadcast message to any peers in other browser tabs
    if (syncRef.current) {
      syncRef.current.sendChatMessage(newMsg);
    }

    // Simulated peer replies for CS-409 lecture room
    if (activeMeetingId === 'cs-409-quantum') {
      setTimeout(() => {
        const replies = [
          { senderId: 'p-peter', senderName: 'Peter Parker', role: 'Student', content: 'Good point! We can test this in the sandbox.' },
          { senderId: 'p-shuri', senderName: 'Shuri Udaku', role: 'Teaching Assistant', content: 'Uploaded the reference repository to Assemble docs.' },
          { senderId: 'p-helen', senderName: 'Prof. Helen Cho', role: 'Instructor', content: 'Spot on! Let’s integrate this into the final build.' }
        ];
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        setMessages((prev) => [
          ...prev,
          {
            ...randomReply,
            id: `msg-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        sounds.playNotification();
      }, 2200);
    }
  };

  // Avengers Snap Detected Callback
  const handleSnapDetected = useCallback(() => {
    if (showSnapCountdown || viewMode !== 'in_call') return;
    setShowSnapCountdown(true);
  }, [showSnapCountdown, viewMode]);

  // Cancel Snap Exit
  const handleCancelSnapExit = () => {
    sounds.playClick(false);
    setShowSnapCountdown(false);
  };

  // End Call handler
  const endCall = useCallback((reason = 'snap') => {
    setExitReason(reason);
    setShowSnapCountdown(false);
    setViewMode('ended');

    // Clean up local media tracks
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
  }, [localStream]);

  // Rejoin Call handler
  const handleRejoin = () => {
    setViewMode('in_call');
    setIsMuted(false);
    setIsVideoOn(true);
    setIsScreenSharing(false);
    setIsSnapActive(true);
  };

  // Return to Dashboard from Lobby or Call
  const handleGoToDashboard = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
    // Remove ?meeting= from URL so reloading lands on Dashboard
    if (typeof window !== 'undefined' && window.history.pushState) {
      window.history.pushState({}, '', window.location.pathname);
    }
    setViewMode('dashboard');
  };

  // Start / Join navigation handlers
  const handleStartMeetingFromDashboard = (roomId, title, goToLobby = true) => {
    setActiveMeetingId(roomId);
    setActiveMeetingTitle(title);
    if (typeof window !== 'undefined' && window.history.pushState) {
      window.history.pushState({}, '', `?meeting=${encodeURIComponent(roomId)}`);
    }
    if (goToLobby) {
      setViewMode('lobby');
    } else {
      setViewMode('in_call');
    }
  };

  const handleJoinByCode = (code) => {
    const cleanCode = code.trim();
    if (!cleanCode) return;
    setActiveMeetingId(cleanCode);
    if (cleanCode === 'cs-409-quantum') {
      setActiveMeetingTitle('CS-409: Distributed Quantum Computing');
    } else {
      setActiveMeetingTitle(`Assemble Meeting (${cleanCode})`);
    }
    if (typeof window !== 'undefined' && window.history.pushState) {
      window.history.pushState({}, '', `?meeting=${encodeURIComponent(cleanCode)}`);
    }
    setViewMode('lobby');
  };

  const handleJoinMeetingFromLobby = (updatedUser) => {
    handleSaveUser(updatedUser);
    setViewMode('in_call');
  };

  const handleInviteEmail = (email) => {
    setInvitedEmails((prev) => [
      ...prev,
      {
        email,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'Invite Sent',
      },
    ]);
  };

  const handleOpenShareModalFromAnywhere = (meetingId, title) => {
    if (meetingId) setActiveMeetingId(meetingId);
    if (title) setActiveMeetingTitle(title);
    setShareModalOpen(true);
  };

  return (
    <>
      {/* 1. DASHBOARD VIEW (Normal Google Meet Style Home) */}
      {viewMode === 'dashboard' && (
        <Dashboard
          currentUser={currentUser}
          onStartMeeting={handleStartMeetingFromDashboard}
          onJoinByCode={handleJoinByCode}
          onOpenShareModal={handleOpenShareModalFromAnywhere}
          onOpenProfileModal={() => setProfileModalOpen(true)}
          onToggleSound={handleToggleSoundFX}
          soundEnabled={soundEnabled}
        />
      )}

      {/* 2. PRE-JOIN LOBBY VIEW */}
      {viewMode === 'lobby' && (
        <Lobby
          meetingId={activeMeetingId}
          meetingTitle={activeMeetingTitle}
          currentUser={currentUser}
          isMuted={isMuted}
          isVideoOn={isVideoOn}
          onToggleMic={handleToggleMic}
          onToggleCamera={handleToggleCamera}
          onJoinMeeting={handleJoinMeetingFromLobby}
          onBackToDashboard={handleGoToDashboard}
          onOpenShareModal={() => setShareModalOpen(true)}
        />
      )}

      {/* 3. MEETING ENDED SPLASH VIEW */}
      {viewMode === 'ended' && (
        <MeetingEndedSplash
          onRejoin={handleRejoin}
          onGoToDashboard={handleGoToDashboard}
          exitReason={exitReason}
          callDuration="42m 18s"
          notesContent={notes}
          participantCount={participants.length}
        />
      )}

      {/* 4. ACTIVE IN-CALL MEETING VIEW */}
      {viewMode === 'in_call' && (
        <div className="relative w-screen h-screen flex flex-col bg-[#0a0b12] text-slate-100 overflow-hidden font-sans">
          {/* Top Navigation Bar */}
          <Navbar
            isSnapActive={isSnapActive}
            participantCount={participants.length}
            onOpenSidePanel={handleOpenSidePanel}
            meetingTitle={activeMeetingTitle}
            meetingId={activeMeetingId}
            onOpenShareModal={() => setShareModalOpen(true)}
            onLeaveToDashboard={handleGoToDashboard}
          />

          {/* Main Workspace Area: Video Grid + Optional Side Drawer */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Left/Center Video Stage */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
              <VideoGrid
                participants={participants}
                layoutMode={layoutMode}
                isScreenSharing={isScreenSharing}
                localStream={localStream}
                onTogglePin={handleTogglePin}
              />

              {/* Floating MediaPipe Gesture Detector HUD */}
              {isSnapActive && (
                <div className="absolute top-4 right-4 z-20">
                  <GestureDetector
                    isActive={isSnapActive}
                    onSnapDetected={handleSnapDetected}
                    localStream={localStream}
                    isCameraOn={isVideoOn}
                  />
                </div>
              )}
            </main>

            {/* Right Interactive Drawer (Chat, Notes, Whiteboard, People) */}
            <SidePanel
              isOpen={sidePanelOpen}
              onClose={() => setSidePanelOpen(false)}
              activeTab={activeSideTab}
              setActiveTab={setActiveSideTab}
              messages={messages}
              onSendMessage={handleSendMessage}
              notes={notes}
              onNotesChange={setNotes}
              participants={participants}
              onTogglePin={handleTogglePin}
              onOpenShareModal={() => setShareModalOpen(true)}
            />
          </div>

          {/* Bottom Google Meet Styled Control Bar */}
          <ControlBar
            isMuted={isMuted}
            isVideoOn={isVideoOn}
            isScreenSharing={isScreenSharing}
            isSnapActive={isSnapActive}
            isHandRaised={isHandRaised}
            layoutMode={layoutMode}
            sidePanelOpen={sidePanelOpen}
            activeSideTab={activeSideTab}
            meetingId={activeMeetingId}
            onToggleMic={handleToggleMic}
            onToggleCamera={handleToggleCamera}
            onToggleScreenShare={handleToggleScreenShare}
            onToggleSnap={handleToggleSnap}
            onToggleHandRaise={handleToggleHandRaise}
            onToggleLayout={handleToggleLayout}
            onOpenSidePanel={handleOpenSidePanel}
            onLeaveCall={() => endCall('manual')}
            onOpenShareModal={() => setShareModalOpen(true)}
          />

          {/* Avengers Assemble Snap 2-Second Countdown Overlay */}
          {showSnapCountdown && (
            <SnapCountdownOverlay
              onCancel={handleCancelSnapExit}
              onConfirmExit={() => endCall('snap')}
            />
          )}
        </div>
      )}

      {/* GLOBAL MODALS */}
      {/* Share / Invite Modal */}
      <ShareMeetingModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        meetingId={activeMeetingId}
        meetingTitle={activeMeetingTitle}
        invitedEmails={invitedEmails}
        onInviteEmail={handleInviteEmail}
      />

      {/* User Profile Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        currentUser={currentUser}
        onSaveUser={handleSaveUser}
      />
    </>
  );
}
