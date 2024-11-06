<script lang="ts">
import { enhance } from '$app/forms';
import type { Role } from '$lib/schemas';
import { cn } from '$lib/utils';
import type { InferInput } from 'valibot';
import type { ActionData, PageData } from './$types';

let grid = $state<(InferInput<typeof Role> | '')[]>(Array(9));
let selected = $state<number>();
let { form }: { data: PageData; form: ActionData } = $props();

$effect(() => {
  if (!form?.grid) return;

  grid = form.grid;
});
</script>

<form action="?/start" method="POST" use:enhance>
  <select name="role" required>
    <option value="X">X</option>
    <option value="O">O</option>
  </select>
  <button type="submit" class="text-slate-500">
    Commencer
  </button>
</form>

<form class="grid grid-cols-3 grid-rows-3 w-80 h-80 relative" method="POST" action="?/try" use:enhance>
  {#each grid as item, index}
    <button
      class={cn(
        index % 2 === 0 ? 'bg-slate-800' : 'bg-slate-700',
        "flex items-center justify-center text-6xl font-bold text-slate-500"
      )}
      type="submit"
      onclick={(e) => {
        selected = index
      }}>
      {item}
    </button>
    {/each}
    <input type="hidden" name="pos" value={selected}>
  {#if form?.message}
    <p>{form.message}</p>
  {/if}
</form>
