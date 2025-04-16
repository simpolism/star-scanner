<script lang="ts">
  import { config, planetOptions } from '../../../stores/configStore';

  export let showVisiblePlanets = true;

  // Toggle planet visibility in chart
  function toggleChartPlanet(planet: string): void {
    const planets = $config.chartDisplay.visiblePlanets;
    const index = planets.indexOf(planet);

    if (index === -1) {
      planets.push(planet);
    } else {
      planets.splice(index, 1);
    }

    $config = $config;
  }
</script>

<!-- Visible Planets Section -->
<div class="detector-section">
  <div class="detector-header" on:click={() => (showVisiblePlanets = !showVisiblePlanets)}>
    <label>Visible Planets</label>
    <span class="toggle-icon">{showVisiblePlanets ? '▼' : '▶'}</span>
  </div>

  {#if showVisiblePlanets}
    <div class="detector-content">
      <div class="planet-selector">
        <div class="planet-options">
          {#each planetOptions as planet}
            <label>
              <input
                type="checkbox"
                checked={$config.chartDisplay.visiblePlanets.includes(planet)}
                on:change={() => toggleChartPlanet(planet)}
              />
              {planet}
            </label>
          {/each}
        </div>
      </div>
    </div>
  {/if}
</div>
