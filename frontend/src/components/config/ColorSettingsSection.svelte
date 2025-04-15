<script lang="ts">
  import { config } from '../../stores/configStore';

  export let showColorSettings = true;

  // Update color settings
  function updateColor(element: 'fire' | 'earth' | 'air' | 'water', color: string): void {
    $config.chartDisplay.colors[element] = color;
    $config = $config;
  }
</script>



<!-- Color Settings Section -->
<div class="detector-section">
  <div class="detector-header" on:click={() => (showColorSettings = !showColorSettings)}>
    <label>Color Settings</label>
    <span class="toggle-icon">{showColorSettings ? '▼' : '▶'}</span>
  </div>

  {#if showColorSettings}
    <div class="detector-content">
      <div class="color-settings">
        <div class="color-setting-row">
          <label>Fire Signs (Aries, Leo, Sagittarius):</label>
          <input 
            type="color"
            value={$config.chartDisplay.colors.fire}
            on:change={(e) => updateColor('fire', e.target.value)}
          />
        </div>
        <div class="color-setting-row">
          <label>Earth Signs (Taurus, Virgo, Capricorn):</label>
          <input 
            type="color"
            value={$config.chartDisplay.colors.earth}
            on:change={(e) => updateColor('earth', e.target.value)}
          />
        </div>
        <div class="color-setting-row">
          <label>Air Signs (Gemini, Libra, Aquarius):</label>
          <input 
            type="color"
            value={$config.chartDisplay.colors.air}
            on:change={(e) => updateColor('air', e.target.value)}
          />
        </div>
        <div class="color-setting-row">
          <label>Water Signs (Cancer, Scorpio, Pisces):</label>
          <input 
            type="color"
            value={$config.chartDisplay.colors.water}
            on:change={(e) => updateColor('water', e.target.value)}
          />
        </div>
      </div>
    </div>
  {/if}
</div>
