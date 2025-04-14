<script lang="ts">
  import { onMount } from 'svelte';
  import { events, metadata, loading, error, loadEvents } from '../stores/eventStore';
  import EventItem from './EventItem.svelte';
  import type { AstrologicalEvent } from '../types/events';
  
  // Load events when component mounts
  onMount(() => {
    loadEvents();
  });
</script>

<div class="events-container">
  <header>
    <h1 id="main-title"><a href="/">Event Log</a></h1>
    {#if $loading}
      <p id="meta-info">Loading data...</p>
    {:else if $error}
      <p id="meta-info" class="error">Error: {$error}</p>
    {:else}
      <p id="meta-info">
        Time generated: {new Date($metadata.generatedAt).toLocaleString()} | 
        <a href="https://github.com/simpolism/asi-2027" target="_blank">GitHub</a>
      </p>
    {/if}
  </header>

  {#if $loading}
    <div id="loading">Loading events data...</div>
  {:else if $error}
    <div class="error-message">Failed to load events: {$error}</div>
  {:else if $events.length === 0}
    <div class="empty-message">No events found.</div>
  {:else}
    <ul class="event-list">
      {#each $events as event (event.date + event.type)}
        <EventItem {event} />
      {/each}
    </ul>
  {/if}

  <footer>
    <p>Data generated using Swiss Ephemeris. View <a href="/scan" target="_blank">Raw JSON Data</a>.</p>
  </footer>
</div>

<style>
  .events-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }

  header, footer {
    padding: 20px;
    background-color: #444;
    color: white;
    text-align: center;
    margin-bottom: 20px;
    border-radius: 4px;
  }

  footer {
    margin-top: 20px;
    margin-bottom: 0;
  }

  header a, footer a {
    color: #9fe3ff;
    text-decoration: none;
  }

  header a:hover, footer a:hover {
    text-decoration: underline;
  }

  h1 {
    margin-top: 0;
  }

  #loading {
    text-align: center;
    padding: 50px;
    font-size: 18px;
    color: #777;
  }

  .error-message {
    color: #cc0000;
    text-align: center;
    padding: 20px;
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }

  .empty-message {
    text-align: center;
    padding: 20px;
    color: #777;
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }

  .event-list {
    list-style-type: none;
    padding: 0;
  }
</style>