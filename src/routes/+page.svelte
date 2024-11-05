<script lang="ts">
import { cn } from '$lib/utils';

const grid = $state<(Player | undefined)[]>(Array(9))

type Player = 'X' | 'O'

let player = $state<Player>('X')
let playable = $state<boolean>(true)
let winner = $state<Player | undefined>()

const handleClick = (index: number) => {
  if (!playable || winner) return
  if (grid[index]) return

  playable = false
  grid[index] = player
  
  // Single player
  playable = true
  player = player === 'X' ? 'O' : 'X'

  // Check victory
  for(let i = 0; i < 3; i++) {
    const line = i * 3
    
    if (
      (grid[line] === grid[line+1] && grid[line] === grid[line+2])||
      (grid[line] === grid[line+3] && grid[line] === grid[line+6])
    ) {
      winner = grid[line]
    }  
  }
  if (
    (grid[0] === grid[4] && grid[0] === grid[8])||
    (grid[2] === grid[4] && grid[4] === grid[6])
  ) {
    winner = grid[4]
  }

  if (winner) {
    console.info(`${winner} a gagné !`)
  }
}
</script>

<div class="grid grid-cols-3 grid-rows-3 w-80 h-80 relative">
  {#each grid as item, index}
    <button
      class={cn(
        index % 2 === 0 ? 'bg-slate-800' : 'bg-slate-700',
        "flex items-center justify-center text-6xl font-bold text-slate-500"
      )}
      onclick={()=>handleClick(index)}
      >
      {item}
    </button>
  {/each}
  {#if winner}
    <h1 class="absolute self-center place-self-center font-bold text-4xl text-slate-900"> Le gagnant est {winner}</h1>
  {/if}
</div>
