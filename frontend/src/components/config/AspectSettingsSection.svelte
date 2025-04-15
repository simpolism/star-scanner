<script lang="ts">
  import { config } from '../../stores/configStore';

  export let showAspectSettings = true;

  // Toggle aspect setting in chart
  function toggleChartAspect(aspectName: string): void {
    const aspectIndex = $config.chartDisplay.aspectSettings.findIndex(a => a.name === aspectName);
    if (aspectIndex !== -1) {
      $config.chartDisplay.aspectSettings[aspectIndex].enabled = 
        !$config.chartDisplay.aspectSettings[aspectIndex].enabled;
      $config = $config;
    }
  }

  // Update aspect orb setting
  function updateAspectOrb(aspectName: string, orb: number): void {
    const aspectIndex = $config.chartDisplay.aspectSettings.findIndex(a => a.name === aspectName);
    if (aspectIndex !== -1) {
      $config.chartDisplay.aspectSettings[aspectIndex].orb = orb;
      $config = $config;
    }
  }
</script>



<!-- Aspect Settings Section -->
<div class="detector-section">
  <div class="detector-header" on:click={() => (showAspectSettings = !showAspectSettings)}>
    <label>Aspect Settings</label>
    <span class="toggle-icon">{showAspectSettings ? '▼' : '▶'}</span>
  </div>

  {#if showAspectSettings}
    <div class="detector-content">
      <div class="aspect-settings">
        <table class="aspect-settings-table">
          <thead>
            <tr>
              <th>Aspect</th>
              <th>Show</th>
              <th>Orb</th>
            </tr>
          </thead>
          <tbody>
            {#each $config.chartDisplay.aspectSettings as aspect}
              <tr>
                <td>{aspect.name}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={aspect.enabled}
                    on:change={() => toggleChartAspect(aspect.name)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.5"
                    value={aspect.orb}
                    on:change={(e) => updateAspectOrb(aspect.name, parseFloat(e.target.value))}
                  />°
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}
</div>
