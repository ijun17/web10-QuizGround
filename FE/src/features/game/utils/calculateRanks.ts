export type Player = {
  playerId: string;
  playerName: string;
  playerPosition: [number, number];
  playerScore: number;
  isAnswer: boolean;
  isAlive: boolean;
  emoji: string;
  isHost: boolean;
};

export const calculateRanks = (players: Player[]) => {
  const sortedPlayers = [...players].sort((a, b) => b.playerScore - a.playerScore);
  const ranks: number[] = [];
  let currentRank = 1;

  sortedPlayers.forEach((player, index) => {
    if (index > 0 && player.playerScore === sortedPlayers[index - 1].playerScore) {
      // 이전 플레이어와 점수가 같으면 같은 순위
      ranks.push(ranks[index - 1]);
    } else {
      // 점수가 다르면 새로운 순위 부여
      ranks.push(currentRank);
    }
    currentRank++;
  });

  return { sortedPlayers, ranks };
};
