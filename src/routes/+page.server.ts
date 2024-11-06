import { Pos, Role } from '$lib/schemas';
import { nanoid } from 'nanoid';
import { type InferInput, parse } from 'valibot';
import type { Actions, PageServerLoad } from './$types';

interface Player {
  sessionID: string;
  role: InferInput<typeof Role>;
}

let lastTry: Player | undefined;
let players: Player[] = [];
let grid: (InferInput<typeof Role> | '')[] = Array(9).fill('');

export const load: PageServerLoad = async ({ cookies }) => {
  if (cookies.get('sessionID')) return;

  cookies.set('sessionID', nanoid(), { path: '/' });

  return;
};

export const actions = {
  start: async ({ cookies, request }) => {
    try {
      const data = await request.formData();

      if (players.length >= 2) return { message: 'Partie en cours actuellement !' };

      const role = parse(Role, data.get('role'));
      if (players.find((p) => p.role === role)) return { message: "Rôle déjà pris par l'autre joueur !" };

      const sessionID = cookies.get('sessionID');
      if (!sessionID) return { message: "Vous n'avez pas de sessionID !" };
      if (getPlayer(sessionID)) return { message: 'Tu es déjà inscrit dans cette partie !' };

      players.push({ sessionID, role });

      if (players.length === 2) {
        const randomIndex = Math.floor(Math.random() * 2);
        lastTry = players[randomIndex];

        return { message: `Le joueur ${players[randomIndex === 0 ? 1 : 0].role} commence !`, grid };
      }

      return { message: `Vous avez été ajouté à la partie en tant que ${role} !` };
    } catch (error) {
      console.error(error);
    }
  },

  try: async ({ cookies, request }) => {
    try {
      const data = await request.formData();

      if (players.length < 2) return { message: "Il n'y a pas assez de joueur pour commencer !" };

      const sessionID = cookies.get('sessionID');
      if (!sessionID) return { message: "Vous n'avez pas de sessionID !" };
      if (!players.find((p) => p.sessionID === sessionID))
        return { message: "Tu n'es pas un joueur de cette partie !" };

      if (lastTry?.sessionID === sessionID) return { message: "Ce n'est pas à ton tour de jouer !" };

      const pos = parse(Pos, Number(data.get('pos')));

      if (grid[pos]) return { message: 'Cette case est déjà occupé !' };

      const player = getPlayer(sessionID);
      if (!player?.role) return { message: "Vous n'avez pas de rôle !" };

      grid[pos] = player.role;
      lastTry = player;

      if (checkVictory(grid)) {
        const winner = lastTry.role;

        players = [];
        grid = Array(9).fill('');
        lastTry = undefined;

        return { message: `Le joueur ${winner} a gagné !`, grid };
      }

      if (checkLoose(grid)) return { message: 'Vous avez fait égalité !', grid };

      return { grid };
    } catch (error) {
      console.error(error);
    }
  },
} satisfies Actions;

const getPlayer = (sessionID: Player['sessionID']) => players.find((p) => p.sessionID === sessionID);

const checkLoose = (g: typeof grid) => !g.includes('');

const checkVictory = (g: typeof grid) => {
  for (let i = 0; i < 3; i++) {
    const line = i * 3;
    if (g[line] !== '' && g[line] === g[line + 1] && g[line] === g[line + 2]) {
      return true;
    }
  }

  for (let i = 0; i < 3; i++) {
    if (g[i] !== '' && g[i] === g[i + 3] && g[i] === g[i + 6]) {
      return true;
    }
  }

  if (g[4] !== '' && ((g[0] === g[4] && g[0] === g[8]) || (g[2] === g[4] && g[2] === g[6]))) {
    return true;
  }

  return false;
};
