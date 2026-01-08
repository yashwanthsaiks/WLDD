import { useState, useCallback, useRef, useEffect } from 'react';
import { JoinScreen } from './components/JoinScreen';
import { VideoGrid } from './components/VideoGrid';
import { Controls } from './components/Controls';
import { ChatInput } from './components/ChatInput';
import { useMediaStream } from './hooks/useMediaStream';
import { useSignaling } from './hooks/useSignaling';
import { useWebRTC } from './hooks/useWebRTC';
import { SignalingMessage } from './types';
import './App.css';

function generatePeerId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export default function App() {
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [messages, setMessages] = useState<
    { id: string; from: string; text: string; timestamp: number; isLocal: boolean }[]
  >([]);
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  const peerIdRef = useRef(generatePeerId());
  const peerId = peerIdRef.current;

  const {
    localStream,
    isAudioEnabled,
    isVideoEnabled,
    error: mediaError,
    startMedia,
    stopMedia,
    toggleAudio,
    toggleVideo
  } = useMediaStream();

  // Use a ref to always have access to the latest webrtc functions
  const webrtcRef = useRef<ReturnType<typeof useWebRTC> | null>(null);

  const handleSignalingMessage = useCallback((message: SignalingMessage) => {
    const webrtc = webrtcRef.current;
    if (!webrtc) return;

    switch (message.type) {
      case 'room-peers':
        // Connect to all existing peers in the room
        message.peers?.forEach(remotePeerId => {
          webrtc.createPeerConnection(remotePeerId, true);
        });
        break;

      case 'peer-joined':
        // A new peer joined - they will initiate the connection
        console.log(`Peer ${message.peerId} joined the room`);
        break;

      case 'peer-left':
        if (message.peerId) {
          webrtc.removePeer(message.peerId);
        }
        break;

      case 'offer':
        if (message.from && message.sdp) {
          webrtc.handleOffer(message.from, message.sdp);
        }
        break;

      case 'answer':
        if (message.from && message.sdp) {
          webrtc.handleAnswer(message.from, message.sdp);
        }
        break;

      case 'ice-candidate':
        if (message.from && message.candidate) {
          webrtc.handleIceCandidate(message.from, message.candidate);
        }
        break;

      case 'chat':
        if (message.message && message.from) {
          // Skip adding message if it's from the local user (already added optimistically)
          if (message.from === peerId) {
            break;
          }
          setMessages(prev => [
            ...prev,
            {
              id: `${message.timestamp ?? Date.now()}-${message.from}`,
              from: `Peer ${message.from.slice(0, 6)}`,
              text: message.message,
              timestamp: message.timestamp ?? Date.now(),
              isLocal: false
            }
          ]);
          // Auto-scroll to bottom when new message arrives
          setTimeout(() => {
            if (chatMessagesRef.current) {
              chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
            }
          }, 100);
        }
        break;
    }
  }, [peerId]);

  const signaling = useSignaling({
    onMessage: handleSignalingMessage,
    onConnected: () => console.log('Connected to signaling server'),
    onDisconnected: () => console.log('Disconnected from signaling server')
  });

  const webrtc = useWebRTC({
    localStream,
    peerId,
    sendSignaling: signaling.send
  });

  // Keep the ref updated with the latest webrtc instance
  useEffect(() => {
    webrtcRef.current = webrtc;
  }, [webrtc]);

  const handleJoin = useCallback(async (roomName: string) => {
    setIsLoading(true);
    setJoinError(null);

    try {
      // Start media first
      await startMedia();

      // Initialize ICE servers (fetch TURN credentials)
      await webrtc.initializeIceServers();

      // Connect to signaling server
      signaling.connect();

      // Small delay to ensure WebSocket is connected
      await new Promise(resolve => setTimeout(resolve, 500));

      // Join the room
      signaling.send({
        type: 'join',
        roomId: roomName,
        peerId
      });

      setRoomId(roomName);
      setIsJoined(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to join room';
      setJoinError(message);
    } finally {
      setIsLoading(false);
    }
  }, [startMedia, webrtc, signaling, peerId]);

  const handleLeave = useCallback(() => {
    webrtc.closeAllConnections();
    signaling.disconnect();
    stopMedia();
    setMessages([]);
    setIsJoined(false);
    setRoomId(null);
  }, [webrtc, signaling, stopMedia]);

  const handleSendMessage = useCallback(
    (text: string) => {
      if (!text.trim() || !roomId) return;

      const timestamp = Date.now();

      // Optimistic local update
      setMessages(prev => [
        ...prev,
        {
          id: `${timestamp}-${peerId}-local`,
          from: 'You',
          text,
          timestamp,
          isLocal: true
        }
      ]);
      // Auto-scroll to bottom when sending message
      setTimeout(() => {
        if (chatMessagesRef.current) {
          chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
        }
      }, 100);

      signaling.send({
        type: 'chat',
        roomId,
        peerId,
        message: text,
        timestamp
      });
    },
    [roomId, peerId, signaling]
  );

  if (!isJoined) {
    return (
      <JoinScreen
        onJoin={handleJoin}
        isLoading={isLoading}
        error={joinError || mediaError}
      />
    );
  }

  return (
    <div className="call-screen">
      <div className="header">
        <h2>Room: {roomId}</h2>
        <span className="participant-count">
          {1 + webrtc.remotePeers.length} participant(s)
        </span>
      </div>

      <div className="call-layout">
        <div className="call-main">
          <VideoGrid
            localStream={localStream}
            localPeerId={peerId}
            remotePeers={webrtc.remotePeers}
            isAudioMuted={!isAudioEnabled}
            isVideoEnabled={isVideoEnabled}
          />

          <Controls
            isAudioEnabled={isAudioEnabled}
            isVideoEnabled={isVideoEnabled}
            onToggleAudio={toggleAudio}
            onToggleVideo={toggleVideo}
            onLeave={handleLeave}
          />
        </div>

        <aside className="chat-panel">
          <div className="chat-header">
            <h3>Room chat</h3>
          </div>
          <div className="chat-messages" ref={chatMessagesRef}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--green-muted)' }}>
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map(msg => (
                <div
                  key={msg.id}
                  className={`chat-message ${msg.isLocal ? 'local' : 'remote'}`}
                >
                  <div className="chat-meta">
                    <span className="chat-from">{msg.from}</span>
                  </div>
                  <div className="chat-text">{msg.text}</div>
                </div>
              ))
            )}
          </div>
          <ChatInput onSend={handleSendMessage} />
        </aside>
      </div>
    </div>
  );
}
