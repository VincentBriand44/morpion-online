import type { GameMessage, GameState } from '$lib/types';
import { writable } from 'svelte/store';

let wsInstance: WebSocket | null = null;

async function closeConnection() {
  if (!wsInstance) return;

  wsInstance.close();
  wsInstance = null;
  console.info('WebSocket déconnecté');
}

async function startConnection(onMessage: (data: GameState) => void): Promise<WebSocket> {
  if (wsInstance?.readyState === WebSocket.OPEN) {
    console.info('WebSocket déjà connecté');

    return wsInstance;
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/ws`;

  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.info('WebSocket connecté');
      wsInstance = ws;
      resolve(ws);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      reject(error);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'gameState') onMessage(message.data);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    ws.onclose = () => {
      console.info('WebSocket déconnecté, tentative de reconnexion...');
      wsInstance = null;
      setTimeout(() => startConnection(onMessage), 5000);
    };
  });
}

function createWebSocketStore() {
  const { subscribe, set } = writable<GameState>();

  return {
    subscribe,
    connect: async () => {
      try {
        await startConnection((data) => {
          console.info('Mise à jour du state:', data);
          set(data);
        });

        if (wsInstance) {
          const playerId = crypto.randomUUID();
          wsInstance.send(
            JSON.stringify({
              type: 'playerJoin',
              data: { id: playerId },
            }),
          );
        }
      } catch (error) {
        console.error('Erreur de connexion:', error);
      }
    },
    send: (message: GameMessage) => {
      if (wsInstance?.readyState === WebSocket.OPEN) {
        wsInstance.send(JSON.stringify(message));
      }
    },
    disconnect: () => {
      closeConnection();
    },
    resetGame: () => {
      if (wsInstance?.readyState === WebSocket.OPEN) {
        console.info('Envoi de la demande de réinitialisation');
        wsInstance.send(JSON.stringify({ type: 'resetGame', data: null }));
      }
    },
  };
}

export const wsStore = createWebSocketStore();
