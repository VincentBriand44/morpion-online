<script lang="ts">
import '../app.css';
let { children } = $props();
</script>

<main class="bg-slate-900 h-screen">
  {@render children()}
</main>
