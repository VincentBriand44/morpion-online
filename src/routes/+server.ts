import type { GameState, GameSymbol, Player } from '$lib/types';
import type { WebSocket } from 'ws';

let lastStartingPlayer: GameSymbol = 'O';

function createGameState(): GameState {
  lastStartingPlayer = lastStartingPlayer === 'X' ? 'O' : 'X';

  return {
    grid: Array(9).fill(''),
    currentPlayer: lastStartingPlayer,
    winner: null,
    isGameOver: false,
    playerSymbol: null,
  };
}

function checkWinner(grid: string[]): string | null {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // horizontales
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // verticales
    [0, 4, 8],
    [2, 4, 6], // diagonales
  ];

  for (const [a, b, c] of lines) {
    if (grid[a] && grid[a] === grid[b] && grid[a] === grid[c]) {
      return grid[a];
    }
  }

  return null;
}

class GameManager {
  #gameState: GameState;
  #players: Map<WebSocket, Player>;

  constructor() {
    this.#gameState = createGameState();
    this.#players = new Map();
  }

  addPlayer(ws: WebSocket, player: Player): void {
    this.#players.set(ws, player);
  }

  removePlayer(ws: WebSocket): void {
    this.#players.delete(ws);
    if (this.#players.size === 0) {
      this.resetGame();
    }
  }

  getPlayers(): Map<WebSocket, Player> {
    return this.#players;
  }

  resetGame(): void {
    this.#gameState = createGameState();
  }

  handleMove(ws: WebSocket, position: number): boolean {
    const player = this.#players.get(ws);
    if (!this.#isValidMove(player, position) || !player) return false;

    this.#executeMove(player, position);
    return true;
  }

  getStateForClient(playerSymbol: string | null): GameState {
    return {
      ...this.#gameState,
      playerSymbol,
    };
  }

  #isValidMove(player: Player | undefined, position: number): boolean {
    return (
      player !== undefined && this.#gameState.currentPlayer === player.symbol && this.#gameState.grid[position] === ''
    );
  }

  #executeMove(player: Player, position: number): void {
    this.#gameState.grid[position] = player.symbol;
    this.#gameState.currentPlayer = player.symbol === 'X' ? 'O' : 'X';

    const winner = checkWinner(this.#gameState.grid);
    if (winner) {
      this.#gameState.winner = winner;
      this.#gameState.isGameOver = true;
    } else if (!this.#gameState.grid.includes('')) {
      this.#gameState.isGameOver = true;
    }
  }
}

new GameManager();
