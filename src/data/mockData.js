export const INITIAL_PARTICIPANTS = [
  {
    id: 'local-user',
    name: 'You (Alex Vance)',
    email: 'alex.vance@assemble.edu',
    role: 'Student Host',
    isLocal: true,
    isMuted: false,
    isVideoOn: true,
    isSpeaking: false,
    isHandRaised: false,
    isPinned: false,
    avatarGradient: 'from-violet-600 to-indigo-600',
    avatarText: 'AV',
    networkQuality: 'excellent',
  },
  {
    id: 'p-helen',
    name: 'Prof. Helen Cho',
    email: 'helen.cho@mit.edu',
    role: 'Instructor',
    isLocal: false,
    isMuted: false,
    isVideoOn: true,
    isSpeaking: true,
    isHandRaised: false,
    isPinned: true,
    avatarGradient: 'from-fuchsia-600 to-pink-600',
    avatarText: 'HC',
    networkQuality: 'excellent',
    videoType: 'instructor',
  },
  {
    id: 'p-peter',
    name: 'Peter Parker',
    email: 'peter.parker@empire.edu',
    role: 'Student',
    isLocal: false,
    isMuted: true,
    isVideoOn: true,
    isSpeaking: false,
    isHandRaised: false,
    isPinned: false,
    avatarGradient: 'from-blue-600 to-cyan-600',
    avatarText: 'PP',
    networkQuality: 'good',
    videoType: 'student-1',
  },
  {
    id: 'p-wanda',
    name: 'Wanda Maximoff',
    email: 'wanda.m@assemble.edu',
    role: 'Student',
    isLocal: false,
    isMuted: false,
    isVideoOn: true,
    isSpeaking: false,
    isHandRaised: true,
    isPinned: false,
    avatarGradient: 'from-rose-600 to-red-600',
    avatarText: 'WM',
    networkQuality: 'excellent',
    videoType: 'student-2',
  },
  {
    id: 'p-shuri',
    name: 'Shuri Udaku',
    email: 'shuri@wakanda.tech',
    role: 'Teaching Assistant',
    isLocal: false,
    isMuted: true,
    isVideoOn: false,
    isSpeaking: false,
    isHandRaised: false,
    isPinned: false,
    avatarGradient: 'from-amber-500 to-purple-600',
    avatarText: 'SU',
    networkQuality: 'excellent',
    videoType: 'student-3',
  },
  {
    id: 'p-miles',
    name: 'Miles Morales',
    email: 'miles.morales@brooklyn.edu',
    role: 'Student',
    isLocal: false,
    isMuted: true,
    isVideoOn: true,
    isSpeaking: false,
    isHandRaised: false,
    isPinned: false,
    avatarGradient: 'from-purple-600 to-rose-600',
    avatarText: 'MM',
    networkQuality: 'good',
    videoType: 'student-4',
  },
];

export const INITIAL_CHAT_MESSAGES = [
  {
    id: 'msg-1',
    senderId: 'p-helen',
    senderName: 'Prof. Helen Cho',
    role: 'Instructor',
    content: 'Welcome team! Today we are discussing quantum state synthesis and distributed mesh networks.',
    timestamp: '12:15 PM',
    isInstructor: true,
  },
  {
    id: 'msg-2',
    senderId: 'p-peter',
    senderName: 'Peter Parker',
    role: 'Student',
    content: 'Does the whiteboard slide cover the tensor matrix decomposition?',
    timestamp: '12:17 PM',
    isInstructor: false,
  },
  {
    id: 'msg-3',
    senderId: 'p-shuri',
    senderName: 'Shuri Udaku',
    role: 'Teaching Assistant',
    content: 'Yes Peter, check section 4 on the live whiteboard canvas. I pinned the equations.',
    timestamp: '12:19 PM',
    isInstructor: false,
  },
  {
    id: 'msg-4',
    senderId: 'p-wanda',
    senderName: 'Wanda Maximoff',
    role: 'Student',
    content: 'I raised my hand with a question regarding the time complexity of the snap exit protocol ⚡',
    timestamp: '12:21 PM',
    isInstructor: false,
  },
];

export const INITIAL_NOTES_CONTENT = `# Quantum State Synthesis & Team Assemble Protocol
**Course:** CS-409: Distributed Quantum Computing  
**Date:** October 30, 2026 | **Session:** Live Lecture 04  

### Key Takeaways:
- **Mesh Topology:** Redundant nodes prevent single-point node failures.
- **Latency Optimization:** Sub-10ms packet synchronization using neural routing.
- **Gesture Control System (Assemble Snap):**
  - Thumb-to-middle finger pinch tracking with MediaPipe Hands.
  - Rapid pinch-release velocity threshold (> 0.12 units/sec).
  - 2-second fail-safe countdown with instant abort override.

### Action Items for Alex (You):
- [x] Review tensor decomposition notes in whiteboard tab
- [ ] Implement fast Fourier transform matrix on cluster
- [ ] Test gesture exit calibration before project demo

*Notes auto-synced to your Assemble student cloud drive.*
`;
