<script lang="ts">
  import {
    config,
    planetOptions,
    aspectOptions,
    presets,
    applyConfig,
  } from '../stores/configStore';
  import { onMount } from 'svelte';

  // UI state
  let showSignIngress = true;
  let showRetrograde = true;
  let showAspects = true;
  let showChartDisplay = true;
  let showVisiblePlanets = true;
  let showAspectSettings = true;
  let showColorSettings = true;
  let isLoading = false;
  
  // Tab state
  let activeTab = 'eventDetection'; // 'eventDetection' or 'chartDisplay'

  // Form validation
  let startDateInput: HTMLInputElement;
  let endDateInput: HTMLInputElement;
  let isValidForm = true;
  let validationMessage = '';

  // Convert ISO string to YYYY-MM-DD for input fields
  function formatDateForInput(isoString: string): string {
    return isoString.split('T')[0];
  }

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

  // Update planet selection
  function togglePlanet(
    detector: 'signIngressDetector' | 'retrogradeDetector',
    planet: string
  ): void {
    const planets = $config.detectors[detector].planets;
    const index = planets.indexOf(planet);

    if (index === -1) {
      planets.push(planet);
    } else {
      planets.splice(index, 1);
    }

    $config = $config;
  }

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

  // Update color settings
  function updateColor(element: 'fire' | 'earth' | 'air' | 'water', color: string): void {
    $config.chartDisplay.colors[element] = color;
    $config = $config;
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
      case 'outerPlanetsOnly':
        presets.outerPlanetsOnly();
        break;
      case 'allPlanets':
        presets.allPlanets();
        break;
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

  onMount(() => {
    // Initialize date inputs with current config values
    if (startDateInput && endDateInput) {
      startDateInput.value = formatDateForInput($config.timeSpan.startTime);
      endDateInput.value = formatDateForInput($config.timeSpan.endTime);
    }
  });
</script>

<div class="config-panel">
  <h2>Configuration</h2>
  
  <!-- Tabs Navigation -->
  <div class="tab-navigation">
    <button 
      class="tab-button {activeTab === 'eventDetection' ? 'active' : ''}" 
      on:click={() => activeTab = 'eventDetection'}>
      Event Detection
    </button>
    <button 
      class="tab-button {activeTab === 'chartDisplay' ? 'active' : ''}" 
      on:click={() => activeTab = 'chartDisplay'}>
      Chart Display
    </button>
  </div>
  
  <!-- Event Detection Tab -->
  <div class="tab-content" style="display: {activeTab === 'eventDetection' ? 'block' : 'none'}">
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

    <div class="config-section">
      <div class="section-header">
        <h3>Detectors</h3>
        <div class="presets">
          <span>Presets:</span>
          <button on:click={() => applyPreset('outerPlanetsOnly')}>Outer Planets</button>
          <button on:click={() => applyPreset('allPlanets')}>All Planets</button>
        </div>
      </div>

      <!-- Sign Ingress Detector -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div class="detector-section">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
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
                      on:change={() => togglePlanet('signIngressDetector', planet)}
                    />
                    {planet}
                  </label>
                {/each}
              </div>
            </div>
          </div>
        {/if}
      </div>

      <!-- Retrograde Detector -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div class="detector-section">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div class="detector-header" on:click={() => (showRetrograde = !showRetrograde)}>
          <label>
            <input type="checkbox" bind:checked={$config.detectors.retrogradeDetector.enabled} />
            Retrograde Detector
          </label>
          <span class="toggle-icon">{showRetrograde ? '▼' : '▶'}</span>
        </div>

        {#if showRetrograde}
          <div class="detector-content">
            <div class="planet-selector">
              <span>Planets:</span>
              <div class="planet-options">
                {#each planetOptions as planet}
                  <label>
                    <input
                      type="checkbox"
                      checked={$config.detectors.retrogradeDetector.planets.includes(planet)}
                      on:change={() => togglePlanet('retrogradeDetector', planet)}
                    />
                    {planet}
                  </label>
                {/each}
              </div>
            </div>

            <div class="check-sign-option">
              <label>
                <input
                  type="checkbox"
                  bind:checked={$config.detectors.retrogradeDetector.checkSign}
                />
                Check Sign
              </label>
            </div>
          </div>
        {/if}
      </div>

      <!-- Aspect Detector -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div class="detector-section">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
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
    </div>
  </div>
  
  <!-- Chart Display Tab -->
  <div class="tab-content" style="display: {activeTab === 'chartDisplay' ? 'block' : 'none'}">
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
      
      <!-- Visible Planets Section -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div class="detector-section">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
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
      
      <!-- Aspect Settings Section -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div class="detector-section">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
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
      
      <!-- Color Settings Section -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div class="detector-section">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
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
    </div>
  </div>

  <div class="actions">
    <button class="apply-button" on:click={handleApply} disabled={isLoading}>
      {isLoading ? 'Loading...' : 'Apply Configuration'}
    </button>
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

  h2 {
    margin-top: 0;
    color: #444;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
  }

  .config-section {
    margin-bottom: 20px;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
  }

  .section-header h3 {
    margin: 0;
    color: #444;
  }

  .presets {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 10px;
  }

  .presets span {
    font-size: 0.9em;
    color: #777;
  }

  .presets button {
    background-color: #f0f0f0;
    border: 1px solid #ddd;
    border-radius: 3px;
    padding: 5px 10px;
    font-size: 0.9em;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .presets button:hover {
    background-color: #e0e0e0;
  }

  .date-inputs {
    display: flex;
    gap: 20px;
    margin-top: 15px;
    flex-wrap: wrap;
  }

  .input-group {
    flex: 1;
    min-width: 200px;
  }

  .input-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
    color: #555;
  }

  .input-group input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 3px;
  }

  .validation-error {
    color: #cc0000;
    margin-top: 10px;
    font-size: 0.9em;
  }

  .detector-section {
    border: 1px solid #eee;
    border-radius: 4px;
    margin-top: 15px;
    overflow: hidden;
  }

  .detector-header {
    background-color: #f8f8f8;
    padding: 10px 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    user-select: none;
  }

  .detector-header label {
    font-weight: bold;
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
  }

  .toggle-icon {
    font-size: 12px;
    transition: transform 0.3s;
  }

  .detector-content {
    padding: 15px;
    border-top: 1px solid #eee;
  }

  .planet-selector,
  .aspect-selector {
    margin-bottom: 15px;
  }

  .planet-selector span,
  .aspect-selector span,
  .planet-pairs span {
    font-weight: bold;
    color: #555;
    display: block;
    margin-bottom: 8px;
  }

  .planet-options,
  .aspect-options {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
  }

  .planet-options label,
  .aspect-options label {
    display: flex;
    align-items: center;
    gap: 5px;
    cursor: pointer;
  }

  .check-sign-option {
    margin-top: 15px;
  }

  .pairs-table, 
  .aspect-settings-table {
    border-collapse: collapse;
    margin-top: 10px;
    width: 100%;
    max-width: 600px;
    overflow-x: auto;
    display: block;
  }

  .pairs-table th,
  .pairs-table td,
  .aspect-settings-table th,
  .aspect-settings-table td {
    border: 1px solid #eee;
    padding: 6px;
    text-align: center;
  }

  .pairs-table th,
  .aspect-settings-table th {
    background-color: #f8f8f8;
    font-weight: normal;
    color: #555;
  }
  
  .aspect-settings-table input[type="number"] {
    width: 50px;
    padding: 4px;
    text-align: center;
  }

  .color-settings {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  
  .color-setting-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .color-setting-row label {
    flex: 1;
  }
  
  .color-setting-row input[type="color"] {
    width: 40px;
    height: 30px;
    border: 1px solid #ddd;
    padding: 2px;
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
    .tab-navigation {
      flex-direction: row;
      overflow-x: auto;
    }
    
    .tab-button {
      flex: 1;
      white-space: nowrap;
    }
    
    .section-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .presets {
      margin-top: 10px;
    }

    .planet-options,
    .aspect-options {
      flex-direction: column;
      gap: 8px;
    }

    .pairs-table,
    .aspect-settings-table {
      max-width: 100%;
    }
  }
</style>
