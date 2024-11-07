import { usePlayerStore } from '@/store/usePlayerStore';
import { useRoomStore } from '@/store/useRoomStore';

const ParticipantDisplay = () => {
  const players = usePlayerStore((state) => state.players);
  const playerCount = usePlayerStore((state) => state.players.length);
  const maxPlayerCount = useRoomStore((state) => state.maxPlayerCount);

  return (
    <div className="component-default h-[100%]">
      <div className="border-b border-default center h-[2.5rem]">
        참가자 [{playerCount}/{maxPlayerCount}]
      </div>
      <div className="p-3 h-[calc(100%-2.5rem)] overflow-y-scroll">
        {players.map((player, i) => (
          <div
            className="flex justify-between mt-2 pb-2 border-b border-default"
            key={player.playerId}
          >
            <div>{i + 1 + '. ' + player.playerName}</div>
            <button className="bg-main rounded-lg text-white w-8 h-6 text-r">강퇴</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParticipantDisplay;
