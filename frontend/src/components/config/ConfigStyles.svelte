<!-- svelte-ignore css-unused-selector -->
<style global>
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
  .aspect-options,
  .sign-options {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
  }

  .planet-options label,
  .aspect-options label,
  .sign-options label {
    display: flex;
    align-items: center;
    gap: 5px;
    cursor: pointer;
  }

  .sign-selector {
    margin-top: 15px;
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

  .aspect-settings-table input[type='number'] {
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

  .color-setting-row input[type='color'] {
    width: 40px;
    height: 30px;
    border: 1px solid #ddd;
    padding: 2px;
  }

  @media (max-width: 768px) {
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
