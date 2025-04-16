<script lang="ts">
  import { config, planetOptions, aspectOptions } from '../../stores/configStore';

  export let showAspects = true;
  
  // Default orb value
  const DEFAULT_ORB = 5;

  // Reactive declarations for aspect states
  $: aspectStates = aspectOptions.map(aspect => {
    const aspectTuple = $config.detectors.aspectDetector.aspects.find(([name]: [string]) => name === aspect);
    return {
      name: aspect,
      selected: !!aspectTuple,
      orb: aspectTuple ? aspectTuple[1] : DEFAULT_ORB
    };
  });

  // Update aspect selection
  function toggleAspect(aspect: string): void {
    const aspects = $config.detectors.aspectDetector.aspects;
    const aspectTuple = aspects.find(([name]: [string]) => name === aspect);
    
    if (!aspectTuple) {
      // Create a new array with the added aspect
      $config.detectors.aspectDetector.aspects = [
        ...$config.detectors.aspectDetector.aspects,
        [aspect, DEFAULT_ORB]
      ];
    } else {
      // Create a new array without the removed aspect
      $config.detectors.aspectDetector.aspects = 
        $config.detectors.aspectDetector.aspects.filter(([name]: [string]) => name !== aspect);
    }
  }
  
  // Update aspect orb value
  function updateAspectOrb(aspect: string, orb: number): void {
    // Create a new array with the updated orb value
    $config.detectors.aspectDetector.aspects = $config.detectors.aspectDetector.aspects.map((tuple: [string, number]) => 
      tuple[0] === aspect ? [aspect, orb] : tuple
    );
  }

  // Handle planet pair selection
  function togglePlanetPair(planet1: string, planet2: string): void {
    const pairs = $config.detectors.aspectDetector.planetPairs;
    const isPairSelected = pairs.some(
      (pair: [string, string]) =>
        (pair[0] === planet1 && pair[1] === planet2) || (pair[0] === planet2 && pair[1] === planet1)
    );

    if (!isPairSelected) {
      // Create a new array with the added pair
      $config.detectors.aspectDetector.planetPairs = [
        ...$config.detectors.aspectDetector.planetPairs,
        [planet1, planet2]
      ];
    } else {
      // Create a new array without the removed pair
      $config.detectors.aspectDetector.planetPairs = 
        $config.detectors.aspectDetector.planetPairs.filter(
          (pair: [string, string]) =>
            !(pair[0] === planet1 && pair[1] === planet2) && 
            !(pair[0] === planet2 && pair[1] === planet1)
        );
    }
  }

  // Check if planet pair exists
  function hasPlanetPair(planet1: string, planet2: string): boolean {
    return $config.detectors.aspectDetector.planetPairs.some(
      (pair: [string, string]) =>
        (pair[0] === planet1 && pair[1] === planet2) || (pair[0] === planet2 && pair[1] === planet1)
    );
  }
</script>

<style>
  .aspect-settings-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 8px;
  }
  
  .aspect-settings-table th, 
  .aspect-settings-table td {
    padding: 6px;
    text-align: left;
    font-size: 0.9em;
  }
  
  .aspect-settings-table input[type="number"] {
    width: 60px;
  }
  
  .disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
</style>

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
      <div class="aspect-settings">
        <span>Aspects:</span>
        <table class="aspect-settings-table">
          <thead>
            <tr>
              <th>Aspect</th>
              <th>Enabled</th>
              <th>Orb (°)</th>
            </tr>
          </thead>
          <tbody>
            {#each aspectStates as aspectState}
              <tr>
                <td>{aspectState.name}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={aspectState.selected}
                    on:change={() => toggleAspect(aspectState.name)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.5"
                    value={aspectState.orb}
                    on:change={(e) => updateAspectOrb(aspectState.name, parseFloat(e.target.value))}
                    disabled={!aspectState.selected}
                    class:disabled={!aspectState.selected}
                  />
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
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