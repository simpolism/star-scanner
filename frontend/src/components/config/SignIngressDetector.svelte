<script lang="ts">
  import { config, planetOptions } from '../../stores/configStore';

  export let showSignIngress = true;

  // Update planet selection
  function togglePlanet(planet: string): void {
    const planets = $config.detectors.signIngressDetector.planets;
    const index = planets.indexOf(planet);

    if (index === -1) {
      planets.push(planet);
    } else {
      planets.splice(index, 1);
    }

    $config = $config;
  }
</script>



<!-- Sign Ingress Detector -->
<div class="detector-section">
  <div class="detector-header" on:click={() => (showSignIngress = !showSignIngress)}>
    <label>
      <input type="checkbox" bind:checked={$config.detectors.signIngressDetector.enabled} />
      Sign Ingress Detector
    </label>
    <span class="toggle-icon">{showSignIngress ? '▼' : '▶'}</span>
  </div>

  {#if showSignIngress}
    <div class="detector-content">
      <div class="planet-selector">
        <span>Planets:</span>
        <div class="planet-options">
          {#each planetOptions as planet}
            <label>
              <input
                type="checkbox"
                checked={$config.detectors.signIngressDetector.planets.includes(planet)}
                on:change={() => togglePlanet(planet)}
              />
              {planet}
            </label>
          {/each}
        </div>
      </div>
    </div>
  {/if}
</div>
