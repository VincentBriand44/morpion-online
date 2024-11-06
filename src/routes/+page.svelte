<script lang="ts">
import { wsStore } from '$lib/websocket';
import { onMount } from 'svelte';

onMount(() => {
  wsStore.connect();
  return () => {
    wsStore.disconnect();
  };
});

function handleMove(position: number) {
  wsStore.send({
    type: 'gameMove',
    name: 'gameMove',
    data: { position },
  });
}

function handleReset() {
  wsStore.send({
    type: 'resetGame',
    name: 'resetGame',
    data: null,
  });
}
</script>

<div class="flex flex-col items-center gap-4">
  <!-- Nouveau menu d'actions -->
  <div class="bg-slate-800 p-4 rounded-lg w-80 mb-4">
    <h2 class="text-xl font-bold mb-3">Menu d'actions</h2>
    <div class="flex flex-col gap-2">
      <button 
        class="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
        on:click={handleReset}>
        Nouvelle partie
      </button>
      <!-- Vous pouvez ajouter d'autres boutons d'action ici -->
      <button 
        class="px-4 py-2 bg-slate-600 rounded hover:bg-slate-700 transition-colors"
        on:click={handleReset}>
        Voir les règles
      </button>
      <button 
        class="px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition-colors"
        on:click={handleReset}>
        Quitter la partie
      </button>
    </div>
  </div>

  {#if $wsStore}
    <div class="text-xl mb-4">
      {#if $wsStore.playerSymbol}
        <div class="mb-2">Vous êtes le joueur {$wsStore.playerSymbol}</div>
      {/if}
      {#if $wsStore.isGameOver}
        {#if $wsStore.winner}
          Le joueur {$wsStore.winner} a gagné !
        {:else}
          Match nul !
        {/if}
        <button 
          class="ml-4 px-4 py-2 bg-slate-600 rounded"
          on:click={handleReset}>
          Nouvelle partie
        </button>
      {:else}
        Au tour du joueur {$wsStore.currentPlayer}
      {/if}
    </div>

    <div class="grid grid-cols-3 grid-rows-3 w-80 h-80 gap-1">
      {#each $wsStore.grid as item, index}
        <button
          class={`
            ${index % 2 === 0 ? 'bg-slate-800' : 'bg-slate-700'}
            flex items-center justify-center text-6xl font-bold
            ${item === 'X' ? 'text-blue-500' : 'text-red-500'}
            hover:bg-slate-600
          `}
          disabled={$wsStore.isGameOver || item !== ''}
          on:click={() => handleMove(index)}>
          {item}
        </button>
      {/each}
    </div>
  {/if}
</div>
