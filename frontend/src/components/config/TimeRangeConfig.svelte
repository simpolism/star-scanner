<script lang="ts">
  import { config, presets } from '../../stores/configStore';
  import { createEventDispatcher } from 'svelte';

  export let startDateInput;
  export let endDateInput;
  export let isValidForm = true;
  export let validationMessage = '';

  const dispatch = createEventDispatcher();

  // Convert ISO string to YYYY-MM-DD for input fields
  function formatDateForInput(isoString: string): string {
    return isoString.split('T')[0];
  }

  // Update time span in config
  function updateTimeSpan(): void {
    dispatch('updateTimeSpan');
  }

  // Apply preset configuration
  function applyPreset(preset: string): void {
    switch (preset) {
      case 'currentYear':
        presets.currentYear();
        break;
      case 'nextSixMonths':
        presets.nextSixMonths();
        break;
    }
    dispatch('presetApplied');
  }
</script>



<div class="config-section">
  <div class="section-header">
    <h3>Time Range</h3>
    <div class="presets">
      <span>Presets:</span>
      <button on:click={() => applyPreset('currentYear')}>Current Year</button>
      <button on:click={() => applyPreset('nextSixMonths')}>Next 6 Months</button>
    </div>
  </div>

  <div class="date-inputs">
    <div class="input-group">
      <label for="start-date">Start Date:</label>
      <input type="date" id="start-date" bind:this={startDateInput} on:change={updateTimeSpan} />
    </div>

    <div class="input-group">
      <label for="end-date">End Date:</label>
      <input type="date" id="end-date" bind:this={endDateInput} on:change={updateTimeSpan} />
    </div>
  </div>

  {#if !isValidForm}
    <div class="validation-error">{validationMessage}</div>
  {/if}
</div>
