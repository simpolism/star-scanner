<script lang="ts">
  import { onMount } from 'svelte';
  import type { AstrologicalEvent } from '../types/events';
  import { config } from '../stores/configStore';

  export let event: AstrologicalEvent;
  export let chartId: string;

  let chartContainer: HTMLElement;
  let chartCreated = false;
  let chartError = '';

  onMount(() => {
    if (!chartCreated && chartContainer) {
      generateAstrologyChart();
    }
    
    // Recreate chart when config changes
    const unsubscribe = config.subscribe(() => {
      if (chartContainer && chartCreated) {
        // Clear the previous chart
        while (chartContainer.firstChild) {
          chartContainer.removeChild(chartContainer.firstChild);
        }
        chartCreated = false;
        // Generate a new chart with updated settings
        generateAstrologyChart();
      }
    });
    
    return () => {
      unsubscribe();
    };
  });

  function generateAstrologyChart(): void {
    try {
      chartError = '';
      
      // Default values in case chartDisplay is not defined
      const defaultColors = {
        fire: '#CC0000',
        earth: '#006600',
        air: '#E6B800',
        water: '#00B3B3'
      };
      
      const defaultAspects = [
        { name: 'Conjunction', angle: 0, orb: 5 },
        { name: 'Opposition', angle: 180, orb: 5 },
        { name: 'Trine', angle: 120, orb: 5 },
        { name: 'Square', angle: 90, orb: 5 }
      ];
      
      // Safely access configuration
      const elementColors = $config.chartDisplay?.colors || defaultColors;
      const aspectSettings = $config.chartDisplay?.aspectSettings || [];
      
      // Define chart settings
      const settings = {
        COLOR_ARIES: elementColors.fire,
        COLOR_LEO: elementColors.fire,
        COLOR_SAGITTARIUS: elementColors.fire,
        COLOR_CAPRICORN: elementColors.earth,
        COLOR_TAURUS: elementColors.earth,
        COLOR_VIRGO: elementColors.earth,
        COLOR_GEMINI: elementColors.air,
        COLOR_LIBRA: elementColors.air,
        COLOR_AQUARIUS: elementColors.air,
        COLOR_CANCER: elementColors.water,
        COLOR_SCORPIO: elementColors.water,
        COLOR_PISCES: elementColors.water,
        ASPECT_COLORS: {
          Conjunction: '#333',
          Opposition: '#CC0000',
          Trine: '#006600',
          Square: '#CC0000',
          Sextile: '#E6B800',
        },
        DEFAULT_ASPECTS: aspectSettings.length > 0 
          ? aspectSettings
            .filter(aspect => aspect.enabled)
            .map(aspect => ({
              name: aspect.name,
              angle: aspect.angle,
              orb: aspect.orb,
            }))
          : defaultAspects,
        ASPECTS_FONT_SIZE: 27,
        RADIX_POINTS_FONT_SIZE: 40,
        RADIX_SIGNS_FONT_SIZE: 40,
        CHART_PADDING: 10,
      };

      // Initialize the chart
      // eslint-disable-next-line no-undef
      const universe = new astrology.Universe(chartId, settings);
      const radix = universe.radix();

      // Create chart data from the event
      const chartData = {
        // eslint-disable-next-line no-undef
        points: [] as astrology.ChartPoint[],
        cusps: [] as number[],
      };

      // Add planet positions if available
      if (event.planets && Object.keys(event.planets).length > 0) {
        // Default planet list if visiblePlanets isn't defined
        const defaultPlanets = [
          'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 
          'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'
        ];
        
        // Use the visible planets from config or fall back to default
        const visiblePlanets = $config.chartDisplay?.visiblePlanets || defaultPlanets;
        
        visiblePlanets.forEach((planet) => {
          if (event.planets[planet]) {
            chartData.points.push({
              name: planet,
              angle: event.planets[planet].longitude,
              retrograde: event.planets[planet].retrograde,
            });
          }
        });
      }

      // Set chart data
      radix.setData(chartData);
      chartCreated = true;
    } catch (e) {
      console.error('Error generating chart:', e);
      chartError = `Unable to generate chart: ${e instanceof Error ? e.message : 'Unknown error'}`;
    }
  }

  // Function to download chart as PNG, embedding the required font
  // Helper function to convert ArrayBuffer to Base64
  function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  export async function openChartAsImage(): Promise<void> {
    try {
      const svgElement = document.querySelector(`#${chartId} svg`) as SVGElement;
      if (!svgElement) {
        throw new Error('SVG element not found');
      }

      // --- Fetch and Encode Font ---
      const fontUrl = '/assets/fonts/ttf/AstronomiconFonts_1.1/Astronomicon.ttf';
      let fontDataUrl = '';
      try {
        const response = await fetch(fontUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const fontBuffer = await response.arrayBuffer();
        const fontBase64 = arrayBufferToBase64(fontBuffer);
        fontDataUrl = `data:font/ttf;base64,${fontBase64}`;
      } catch (fontError) {
        console.error('Error fetching or encoding font:', fontError);
        // Optionally: proceed without embedding font or show error to user
        // For now, we'll log the error and continue, the font might fail to render
      }

      // --- Font Embedding ---
      // Clone the SVG element to avoid modifying the live chart
      const clonedSvgElement = svgElement.cloneNode(true) as SVGElement;

      // Define the font-face rule using the Base64 data URL (if available)
      const fontFaceStyle = fontDataUrl
        ? `
        @font-face {
          font-family: 'Astronomicon';
          src: url(${fontDataUrl}) format('truetype');
        }
      `
        : ''; // If font fetch failed, don't include the rule

      // Create or find the <defs> element in the clone
      let defs = clonedSvgElement.querySelector('defs');
      if (!defs) {
        defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        clonedSvgElement.insertBefore(defs, clonedSvgElement.firstChild);
      }

      // Create and append the style element to the defs in the clone
      if (fontFaceStyle) {
        // Only add style if font was loaded
        const styleElement = document.createElementNS('http://www.w3.org/2000/svg', 'style');
        styleElement.textContent = fontFaceStyle.trim();
        defs.appendChild(styleElement);
      }

      // Serialize the SVG element
      const svgData = new XMLSerializer().serializeToString(clonedSvgElement);
      // Encode the SVG data for use in an Image source
      const svgDataBase64 = btoa(unescape(encodeURIComponent(svgData)));
      const svgDataUrl = `data:image/svg+xml;base64,${svgDataBase64}`;

      // Create a canvas element
      const canvas = document.createElement('canvas');
      canvas.width = 1600;
      canvas.height = 1600;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Unable to get canvas context');

      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Create an image element and draw the SVG onto the canvas
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Get the PNG data URL
        const pngDataUrl = canvas.toDataURL('image/png');

        // Open PNG in a new tab
        const newTab = window.open();
        if (newTab) {
          newTab.document.write(`<img src="${pngDataUrl}" alt="Astrological Chart" />`);
          newTab.document.title = `Chart for ${new Date(event.date).toISOString().split('T')[0]}`;
          newTab.document.close();
        }
      };
      img.onerror = (err) => {
        console.error('Error loading SVG into image element:', err);
      };
      img.src = svgDataUrl;
    } catch (error) {
      console.error('Error generating or downloading chart PNG:', error);
    }
  }
</script>

<div class="chart-container">
  <div id={chartId} class="astro-chart" bind:this={chartContainer}></div>
  {#if chartError}
    <div class="chart-error">{chartError}</div>
  {/if}
</div>

<style>
  .chart-container {
    padding: 10px;
    background-color: #fff;
    border-radius: 4px;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
    height: 400px;
    overflow: auto;
  }

  .astro-chart {
    width: 400px;
    height: 400px;
    margin: 0 auto;
  }

  .chart-error {
    color: #cc0000;
    padding: 20px;
    text-align: center;
  }
</style>
