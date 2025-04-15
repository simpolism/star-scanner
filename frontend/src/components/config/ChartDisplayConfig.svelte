<script lang="ts">
  import { presets } from '../../stores/configStore';
  import VisiblePlanetsSection from './VisiblePlanetsSection.svelte';
  import AspectSettingsSection from './AspectSettingsSection.svelte';
  import ColorSettingsSection from './ColorSettingsSection.svelte';

  // UI state
  export let showVisiblePlanets = true;
  export let showAspectSettings = true;
  export let showColorSettings = true;

  // Apply preset configuration
  function applyPreset(preset: string): void {
    switch (preset) {
      case 'minimalistChart':
        presets.minimalistChart();
        break;
      case 'detailedChart':
        presets.detailedChart();
        break;
      case 'traditionalChart':
        presets.traditionalChart();
        break;
    }
  }
</script>



<div class="config-section">
  <div class="section-header">
    <h3>Chart Display Settings</h3>
    <div class="presets">
      <span>Presets:</span>
      <button on:click={() => applyPreset('minimalistChart')}>Minimalist</button>
      <button on:click={() => applyPreset('traditionalChart')}>Traditional</button>
      <button on:click={() => applyPreset('detailedChart')}>Detailed</button>
    </div>
  </div>
  
  <VisiblePlanetsSection bind:showVisiblePlanets />
  <AspectSettingsSection bind:showAspectSettings />
  <ColorSettingsSection bind:showColorSettings />
</div>
