<script lang="ts">
  import { presets } from '../../../stores/configStore';
  import SignIngressDetector from './SignIngressDetector.svelte';
  import RetrogradeDetector from './RetrogradeDetector.svelte';
  import AspectDetector from './AspectDetector.svelte';

  // UI state
  export let showSignIngress = true;
  export let showRetrograde = true;
  export let showAspects = true;

  // Apply preset configuration
  function applyPreset(preset: string): void {
    switch (preset) {
      case 'outerPlanetsOnly':
        presets.outerPlanetsOnly();
        break;
      case 'allPlanets':
        presets.allPlanets();
        break;
    }
  }
</script>

<div class="config-section">
  <div class="section-header">
    <h3>Detectors</h3>
    <div class="presets">
      <span>Presets:</span>
      <button on:click={() => applyPreset('outerPlanetsOnly')}>Outer Planets</button>
      <button on:click={() => applyPreset('allPlanets')}>All Planets</button>
    </div>
  </div>

  <SignIngressDetector bind:showSignIngress />
  <hr />
  <RetrogradeDetector bind:showRetrograde />
  <hr />
  <AspectDetector bind:showAspects />
</div>
