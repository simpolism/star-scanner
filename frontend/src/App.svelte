<script lang="ts">
  import EventList from './components/EventList.svelte';
  import ConfigPanel from './components/ConfigPanel.svelte';
</script>

<main>
  <header class="app-header">
    <h1 id="main-title"><a href="/">Star Scanner</a></h1>
  </header>
  <ConfigPanel />
  <EventList />
</main>

<style>
  .app-header {
    padding: 20px;
    background-color: #444;
    color: white;
    text-align: center;
    margin-bottom: 20px;
    border-radius: 4px;
  }
  
  .app-header a {
    color: #9fe3ff;
    text-decoration: none;
  }
  
  .app-header a:hover {
    text-decoration: underline;
  }
  
  h1 {
    margin: 0;
  }

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
