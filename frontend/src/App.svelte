<script lang="ts">
  import EventList from './components/EventList.svelte';
</script>

<main>
  <EventList />
</main>

<style>
  :global(body) {
    font-family: Arial, sans-serif;
    line-height: 1.6;
    margin: 0;
    padding: 0;
    background-color: #f5f5f5;
    color: #333;
  }

  main {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
  }
</style>