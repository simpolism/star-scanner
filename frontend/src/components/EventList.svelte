<script lang="ts">
  import { onMount } from 'svelte';
  import { events, metadata, loading, error } from '../stores/eventStore';
  import { config, applyConfig } from '../stores/configStore';
  import EventItem from './EventItem.svelte';

  // Load events when component mounts
  onMount(() => {
    applyConfig();
  });
</script>

<div class="events-container">
  <header class="event-header">
    {#if $loading}
      <p id="meta-info">Loading data...</p>
    {:else if $error}
      <p id="meta-info" class="error">Error: {$error}</p>
    {:else}
      <p id="meta-info">
        Generation range: {$metadata.startDate ||
          new Date($config.timeSpan.startTime).toLocaleDateString()} - {$metadata.endDate ||
          new Date($config.timeSpan.endTime).toLocaleDateString()}
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
    <p>
      <a href="https://github.com/simpolism/star-scanner" target="_blank">GitHub</a> | Data generated
      using Swiss Ephemeris.
    </p>
  </footer>
</div>

<style>
  .events-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }

  .event-header,
  footer {
    padding: 15px;
    background-color: #f0f0f0;
    color: #444;
    text-align: center;
    margin-bottom: 20px;
    border-radius: 4px;
  }

  footer {
    margin-top: 20px;
    margin-bottom: 0;
    background-color: #444;
    color: white;
    padding: 20px;
  }

  footer a {
    color: #9fe3ff;
    text-decoration: none;
  }

  footer a:hover {
    text-decoration: underline;
  }

  #meta-info {
    margin: 0;
    font-weight: bold;
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
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .empty-message {
    text-align: center;
    padding: 20px;
    color: #777;
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .event-list {
    list-style-type: none;
    padding: 0;
  }
</style>
