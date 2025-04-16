<script lang="ts">
  import type { AstrologicalEvent } from '../types/events';
  import AstroChart from './AstroChart.svelte';

  export let event: AstrologicalEvent;

  const eventId = `event-${new Date(event.date).getTime()}-${event.type.replace(/[^a-zA-Z0-9]/g, '')}`;
  const chartId = `chart-svg-${eventId}`;

  let showChart = false;
  let astroChartComponent: AstroChart;

  function toggleChart(): void {
    showChart = !showChart;
  }

  function formatDescription(description: string): string {
    let htmlDescription = description;

    // Add planet classes
    const planets = [
      'Sun',
      'Moon',
      'Mercury',
      'Venus',
      'Mars',
      'Jupiter',
      'Saturn',
      'Uranus',
      'Neptune',
      'Pluto',
    ];
    planets.forEach((planet) => {
      const regex = new RegExp(`\\b${planet}\\b`, 'g');
      htmlDescription = htmlDescription.replace(
        regex,
        `<span class="planet-${planet}">${planet}</span>`
      );
    });

    // Add sign classes
    const signs = [
      'Aries',
      'Taurus',
      'Gemini',
      'Cancer',
      'Leo',
      'Virgo',
      'Libra',
      'Scorpio',
      'Sagittarius',
      'Capricorn',
      'Aquarius',
      'Pisces',
    ];
    signs.forEach((sign) => {
      const regex = new RegExp(`\\b${sign}\\b`, 'g');
      htmlDescription = htmlDescription.replace(regex, `<span class="sign-${sign}">${sign}</span>`);
    });

    // Add aspect classes
    const aspects = ['conjunction', 'opposition', 'trine', 'square', 'sextile'];
    aspects.forEach((aspect) => {
      const regex = new RegExp(`\\b${aspect}\\b`, 'g');
      htmlDescription = htmlDescription.replace(
        regex,
        `<span class="aspect-${aspect}">${aspect}</span>`
      );
    });

    return htmlDescription;
  }

  function handleChartClick(): void {
    if (astroChartComponent) {
      astroChartComponent.openChartAsImage();
    }
  }
</script>

<li class="event-item">
  <div class="event-header" on:click={toggleChart}>
    <span class="toggle-icon" class:open={showChart}>{showChart ? '›' : '+'}</span>
    <span class="date">{event.dateUTC.split('T')[0]}</span>
    <span class="type type-{event.type}">{event.type.toUpperCase()}</span>
    <span class="description">
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html formatDescription(event.description)}
    </span>
  </div>

  {#if showChart}
    <div class="chart-container" on:click={handleChartClick}>
      <AstroChart {event} {chartId} bind:this={astroChartComponent} />
    </div>
  {/if}

  {#if event.processedOutputs && event.processedOutputs.length > 0}
    {#each event.processedOutputs as output}
      {#if output}
        <div class="special-event">
          <!-- eslint-disable-next-line svelte/no-at-html-tags -->
          {@html output}
        </div>
      {/if}
    {/each}
  {/if}
</li>

<style>
  .event-item {
    background-color: white;
    margin-bottom: 8px;
    padding: 12px;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .event-header {
    cursor: pointer;
    display: flex;
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .toggle-icon {
    display: inline-block;
    width: 16px;
    height: 16px;
    margin-right: 10px;
    text-align: center;
    line-height: 16px;
    background-color: #f0f0f0;
    border-radius: 3px;
    font-weight: bold;
    transition: transform 0.3s;
  }

  .toggle-icon.open {
    transform: rotate(90deg);
  }

  .date {
    font-weight: bold;
    margin-right: 10px;
    min-width: 100px;
    display: inline-block;
  }

  .type {
    font-weight: bold;
    min-width: 120px;
    display: inline-block;
    margin-right: 10px;
  }

  .description {
    flex: 1;
  }

  .chart-container {
    margin-top: 10px;
    cursor: pointer;
  }

  .special-event {
    margin-top: 10px;
    padding: 8px;
    background-color: #f8f8f8;
    border-left: 4px solid #444;
    font-weight: bold;
  }

  /* ANSI color to CSS color conversion for planets */
  :global(.planet-Sun) {
    color: #e6b800;
  }
  :global(.planet-Moon) {
    color: #c0c0c0;
  }
  :global(.planet-Mercury) {
    color: #00b3b3;
  }
  :global(.planet-Venus) {
    color: #cc00cc;
  }
  :global(.planet-Mars) {
    color: #cc0000;
  }
  :global(.planet-Jupiter) {
    color: #0000cc;
  }
  :global(.planet-Saturn) {
    color: #666666;
  }
  :global(.planet-Uranus) {
    color: #00cccc;
  }
  :global(.planet-Neptune) {
    color: #0099ff;
  }
  :global(.planet-Pluto) {
    color: #cc66cc;
  }

  /* Sign colors */
  :global(.sign-Aries),
  :global(.sign-Leo),
  :global(.sign-Sagittarius) {
    color: #cc0000;
  }
  :global(.sign-Taurus),
  :global(.sign-Virgo),
  :global(.sign-Capricorn) {
    color: #006600;
  }
  :global(.sign-Gemini),
  :global(.sign-Libra),
  :global(.sign-Aquarius) {
    color: #e6b800;
  }
  :global(.sign-Cancer),
  :global(.sign-Scorpio),
  :global(.sign-Pisces) {
    color: #00b3b3;
  }

  /* Aspect colors */
  :global(.aspect-conjunction) {
    color: #ffffff;
    background-color: #333;
    padding: 0 3px;
  }
  :global(.aspect-opposition) {
    color: #cc0000;
  }
  :global(.aspect-trine) {
    color: #006600;
  }
  :global(.aspect-square) {
    color: #cc0000;
  }
  :global(.aspect-sextile) {
    color: #e6b800;
  }

  /* Event type colors */
  .type-aspect_end {
    color: #cc00cc;
  }
  .type-aspect_begin {
    color: #00cc00;
  }
  .type-aspect_peak {
    color: #6495ed;
  }
  .type-ingress {
    color: #006600;
  }
  .type-retrograde {
    color: #e6b800;
  }
  .type-configuration {
    color: #00b3b3;
  }

  @media (max-width: 768px) {
    .date,
    .type {
      display: block;
      margin-bottom: 5px;
    }
  }
</style>
