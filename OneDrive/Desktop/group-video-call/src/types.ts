export interface SignalingMessage {
  type:
    | 'join'
    | 'peer-joined'
    | 'peer-left'
    | 'room-peers'
    | 'offer'
    | 'answer'
    | 'ice-candidate'
    | 'chat';
  peerId?: string;
  roomId?: string;
  from?: string;
  to?: string;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  peers?: string[];
  message?: string;
  timestamp?: number;
}

export interface RemotePeer {
  peerId: string;
  stream: MediaStream | null;
}

export interface IceServer {
  urls: string;
  username?: string;
  credential?: string;
}
