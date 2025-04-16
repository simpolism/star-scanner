<script lang="ts">
  import './config/ConfigStyles.svelte';
  import { config, applyConfig } from '../stores/configStore';
  import { onMount } from 'svelte';
  import TimeRangeConfig from './config/TimeRangeConfig.svelte';
  import EventDetectionConfig from './config/EventDetectionConfig.svelte';
  import ChartDisplayConfig from './config/ChartDisplayConfig.svelte';

  // UI state
  let showSignIngress = true;
  let showRetrograde = true;
  let showAspects = true;
  let showVisiblePlanets = true;
  let showAspectSettings = true;
  let isLoading = false;
  
  // UI states for collapsible sections
  let isEventDetectionOpen = true;
  let isChartDisplayOpen = true;

  // Form validation
  let startDateInput: HTMLInputElement;
  let endDateInput: HTMLInputElement;
  let isValidForm = true;
  let validationMessage = '';

  // Convert input date to ISO string
  function formatInputToISO(dateString: string): string {
    return new Date(dateString).toISOString();
  }

  function validateForm(): boolean {
    if (!startDateInput.value || !endDateInput.value) {
      validationMessage = 'Both start and end dates are required';
      return false;
    }

    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      validationMessage = 'Invalid date format';
      return false;
    }

    if (startDate >= endDate) {
      validationMessage = 'End date must be after start date';
      return false;
    }

    const timeDiff = endDate.getTime() - startDate.getTime();
    const daysDiff = timeDiff / (1000 * 3600 * 24);

    if (daysDiff > 3650) {
      // ~10 years
      validationMessage = 'Time span cannot exceed 10 years';
      return false;
    }

    validationMessage = '';
    return true;
  }

  // Update time span in config
  function updateTimeSpan(): void {
    if (!validateForm()) {
      isValidForm = false;
      return;
    }

    isValidForm = true;
    $config.timeSpan.startTime = formatInputToISO(startDateInput.value);
    $config.timeSpan.endTime = formatInputToISO(endDateInput.value);
  }

  // Handle date updates from child component
  function handleUpdateTimeSpan() {
    updateTimeSpan();
  }

  // Handle preset applied from child component
  function handlePresetApplied() {
    if (startDateInput && endDateInput) {
      startDateInput.value = formatDateForInput($config.timeSpan.startTime);
      endDateInput.value = formatDateForInput($config.timeSpan.endTime);
    }
  }

  // Convert ISO string to YYYY-MM-DD for input fields
  function formatDateForInput(isoString: string): string {
    return isoString.split('T')[0];
  }

  // Apply handler for the form
  async function handleApply(): Promise<void> {
    if (!validateForm()) {
      isValidForm = false;
      return;
    }

    isValidForm = true;
    isLoading = true;

    try {
      updateTimeSpan();
      await applyConfig();
    } catch (error) {
      console.error('Error applying configuration:', error);
    } finally {
      isLoading = false;
    }
  }

  onMount(() => {
    // Initialize date inputs with current config values
    if (startDateInput && endDateInput) {
      startDateInput.value = formatDateForInput($config.timeSpan.startTime);
      endDateInput.value = formatDateForInput($config.timeSpan.endTime);
    }
  });
</script>

<div class="config-panel">
  <div class="config-header">
    <h2>Configuration</h2>
  </div>

  <!-- Event Detection Section -->
  <div class="section">
    <div class="section-header" on:click={() => isEventDetectionOpen = !isEventDetectionOpen}>
      <h3>Event Detection</h3>
      <span class="toggle-icon">{isEventDetectionOpen ? '▼' : '▶'}</span>
    </div>
    
    {#if isEventDetectionOpen}
    <div class="section-content">
      <TimeRangeConfig 
        bind:startDateInput 
        bind:endDateInput 
        bind:isValidForm 
        bind:validationMessage
        on:updateTimeSpan={handleUpdateTimeSpan}
        on:presetApplied={handlePresetApplied}
      />
      
      <EventDetectionConfig 
        bind:showSignIngress 
        bind:showRetrograde 
        bind:showAspects 
      />
      
      <div class="actions">
        <button class="apply-button" on:click={handleApply} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Apply Configuration'}
        </button>
      </div>
    </div>
    {/if}
  </div>
  
  <!-- Chart Display Section -->
  <div class="section">
    <div class="section-header" on:click={() => isChartDisplayOpen = !isChartDisplayOpen}>
      <h3>Chart Display</h3>
      <span class="toggle-icon">{isChartDisplayOpen ? '▼' : '▶'}</span>
    </div>
    
    {#if isChartDisplayOpen}
    <div class="section-content">
      <ChartDisplayConfig 
        bind:showVisiblePlanets 
        bind:showAspectSettings 
      />
    </div>
    {/if}
  </div>
</div>

<style>
  .config-panel {
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
    padding: 20px;
  }

  .config-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 10px;
    cursor: pointer;
    user-select: none;
    border-bottom: 1px solid #eee;
  }
  
  h2 {
    margin: 0;
    color: #444;
  }

  .section {
    margin-top: 15px;
    border-bottom: 1px solid #eee;
    padding-bottom: 15px;
  }
  
  .section:last-child {
    border-bottom: none;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    cursor: pointer;
    user-select: none;
  }
  
  .section-header h3 {
    margin: 0;
    color: #444;
    font-weight: bold;
  }
  
  .section-content {
    padding-top: 10px;
  }

  .toggle-icon {
    transition: transform 0.2s;
  }

  .actions {
    margin-top: 20px;
    text-align: right;
  }

  .apply-button {
    background-color: #444;
    color: white;
    border: none;
    border-radius: 3px;
    padding: 10px 20px;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .apply-button:hover {
    background-color: #333;
  }

  .apply-button:disabled {
    background-color: #999;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    .section-header h3 {
      font-size: 16px;
    }
    
    .apply-button {
      width: 100%;
    }
  }
</style>
