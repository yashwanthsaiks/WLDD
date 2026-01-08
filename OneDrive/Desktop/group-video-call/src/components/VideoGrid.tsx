import { VideoTile } from './VideoTile';
import { RemotePeer } from '../types';

interface VideoGridProps {
  localStream: MediaStream | null;
  localPeerId: string;
  remotePeers: RemotePeer[];
  isAudioMuted: boolean;
  isVideoEnabled: boolean;
}

export function VideoGrid({ localStream, localPeerId, remotePeers, isAudioMuted, isVideoEnabled }: VideoGridProps) {
  const totalParticipants = 1 + remotePeers.length;

  return (
    <div className={`video-grid participants-${Math.min(totalParticipants, 4)}`}>
      <VideoTile
        stream={localStream}
        peerId={localPeerId}
        isLocal={true}
        isMuted={isAudioMuted}
        isVideoEnabled={isVideoEnabled}
      />
      {remotePeers.map((peer) => (
        <VideoTile
          key={peer.peerId}
          stream={peer.stream}
          peerId={peer.peerId}
        />
      ))}
    </div>
  );
}
