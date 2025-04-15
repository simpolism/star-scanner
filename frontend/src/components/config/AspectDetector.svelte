<script lang="ts">
  import { config, planetOptions, aspectOptions } from '../../stores/configStore';

  export let showAspects = true;

  // Update aspect selection
  function toggleAspect(aspect: string): void {
    const aspects = $config.detectors.aspectDetector.aspects;
    const index = aspects.indexOf(aspect);

    if (index === -1) {
      aspects.push(aspect);
    } else {
      aspects.splice(index, 1);
    }

    $config = $config;
  }

  // Handle planet pair selection
  function togglePlanetPair(planet1: string, planet2: string): void {
    const pairs = $config.detectors.aspectDetector.planetPairs;
    const pairIndex = pairs.findIndex(
      (pair: [string, string]) =>
        (pair[0] === planet1 && pair[1] === planet2) || (pair[0] === planet2 && pair[1] === planet1)
    );

    if (pairIndex === -1) {
      pairs.push([planet1, planet2]);
    } else {
      pairs.splice(pairIndex, 1);
    }

    $config = $config;
  }

  // Check if planet pair exists
  function hasPlanetPair(planet1: string, planet2: string): boolean {
    return $config.detectors.aspectDetector.planetPairs.some(
      (pair: [string, string]) =>
        (pair[0] === planet1 && pair[1] === planet2) || (pair[0] === planet2 && pair[1] === planet1)
    );
  }
</script>



<!-- Aspect Detector -->
<div class="detector-section">
  <div class="detector-header" on:click={() => (showAspects = !showAspects)}>
    <label>
      <input type="checkbox" bind:checked={$config.detectors.aspectDetector.enabled} />
      Aspect Detector
    </label>
    <span class="toggle-icon">{showAspects ? '▼' : '▶'}</span>
  </div>

  {#if showAspects}
    <div class="detector-content">
      <div class="aspect-selector">
        <span>Aspects:</span>
        <div class="aspect-options">
          {#each aspectOptions as aspect}
            <label>
              <input
                type="checkbox"
                checked={$config.detectors.aspectDetector.aspects.includes(aspect)}
                on:change={() => toggleAspect(aspect)}
              />
              {aspect}
            </label>
          {/each}
        </div>
      </div>

      <div class="planet-pairs">
        <span>Planet Pairs:</span>
        <table class="pairs-table">
          <thead>
            <tr>
              <th></th>
              {#each planetOptions as planet}
                <th>{planet}</th>
              {/each}
            </tr>
          </thead>
          <tbody>
            {#each planetOptions as planet1, i}
              <tr>
                <th>{planet1}</th>
                {#each planetOptions as planet2, j}
                  <td>
                    {#if j > i}
                      <input
                        type="checkbox"
                        checked={hasPlanetPair(planet1, planet2)}
                        on:change={() => togglePlanetPair(planet1, planet2)}
                      />
                    {/if}
                  </td>
                {/each}
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}
</div>
