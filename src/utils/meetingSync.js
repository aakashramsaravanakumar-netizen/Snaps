// BroadcastChannel-based real-time room synchronization for multi-tab testing
// Allows sharing the meeting link and opening in another tab to join with a different email!

export class MeetingSync {
  constructor(roomId, onPeerJoin, onPeerLeave, onMessage, onPeerUpdate) {
    this.roomId = roomId;
    this.onPeerJoin = onPeerJoin;
    this.onPeerLeave = onPeerLeave;
    this.onMessage = onMessage;
    this.onPeerUpdate = onPeerUpdate;
    this.channel = null;

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(`assemble_room_${roomId}`);
        this.channel.onmessage = this.handleMessage.bind(this);
      } catch (err) {
        console.warn('BroadcastChannel not supported or failed to initialize:', err);
      }
    }
  }

  handleMessage(event) {
    const data = event.data;
    if (!data || !data.type) return;

    switch (data.type) {
      case 'PEER_ANNOUNCE':
        if (this.onPeerJoin) this.onPeerJoin(data.participant);
        break;
      case 'PEER_LEAVE':
        if (this.onPeerLeave) this.onPeerLeave(data.participantId);
        break;
      case 'CHAT_MESSAGE':
        if (this.onMessage) this.onMessage(data.message);
        break;
      case 'PEER_UPDATE':
        if (this.onPeerUpdate) this.onPeerUpdate(data.participantId, data.updates);
        break;
      case 'REQUEST_PEERS':
        // A newly joined peer is asking who is already here
        if (this.currentUser) {
          this.announce(this.currentUser);
        }
        break;
      default:
        break;
    }
  }

  announce(participant) {
    this.currentUser = participant;
    if (this.channel) {
      this.channel.postMessage({
        type: 'PEER_ANNOUNCE',
        participant,
      });
    }
  }

  requestExistingPeers() {
    if (this.channel) {
      this.channel.postMessage({
        type: 'REQUEST_PEERS',
      });
    }
  }

  sendChatMessage(message) {
    if (this.channel) {
      this.channel.postMessage({
        type: 'CHAT_MESSAGE',
        message,
      });
    }
  }

  updatePeerState(participantId, updates) {
    if (this.channel) {
      this.channel.postMessage({
        type: 'PEER_UPDATE',
        participantId,
        updates,
      });
    }
  }

  leave(participantId) {
    if (this.channel) {
      this.channel.postMessage({
        type: 'PEER_LEAVE',
        participantId,
      });
      this.channel.close();
      this.channel = null;
    }
  }
}

