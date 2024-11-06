export type MessageType = 'gameMove' | 'gameState' | 'resetGame' | 'playerJoin';
export type GameSymbol = 'X' | 'O';

export interface GameMessage {
  type: MessageType;
  name: string;
  data: PlayerJoinData | GameMoveData | GameState | null;
}

export interface PlayerJoinData {
  id: string;
  name?: string;
}

export interface GameMoveData {
  position: number;
}

export interface Player {
  id: string;
  symbol: GameSymbol;
  name: string;
}

export interface GameState {
  grid: string[];
  currentPlayer: GameSymbol;
  isGameOver: boolean;
  winner: string | null;
  playerSymbol: string | null;
}
