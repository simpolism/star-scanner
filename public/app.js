document.addEventListener('DOMContentLoaded', () => {
  // DOM elements
  const eventList = document.getElementById('event-list');
  const mainTitle = document.getElementById('main-title');
  const metaInfo = document.getElementById('meta-info');
  const loadingElement = document.getElementById('loading');
  const eventTypeFilter = document.getElementById('event-type-filter');
  const planetFilter = document.getElementById('planet-filter');
  const yearFilter = document.getElementById('year-filter');
  
  // State
  let allEvents = [];
  let metadata = {};
  let filteredEvents = [];
  
  // Load the JSON data
  async function loadEvents() {
    try {
      const response = await fetch('data/astrological-events.json');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      metadata = data.metadata;
      allEvents = data.events.map(event => ({
        ...event,
        date: new Date(event.date), // Convert string back to Date
        planets: event.planets || {} // Ensure planets data is preserved
      }));
      
      // Sort events by date
      allEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
      
      // Update UI
      updateMetadata();
      populateYearFilter();
      applyFilters();
      
      // Hide loading indicator
      loadingElement.style.display = 'none';
    } catch (error) {
      console.error('Error loading event data:', error);
      loadingElement.textContent = 'Error loading event data. Please try again later.';
    }
  }
  
  // Update the metadata display
  function updateMetadata() {
    const startYear = new Date(metadata.startDate).getFullYear();
    const endYear = new Date(metadata.endDate).getFullYear();
    
    mainTitle.textContent = `Astrological Events ${startYear}-${endYear}`;
    metaInfo.textContent = `Time generated: ${new Date(metadata.generatedAt).toLocaleString()} | Total events: ${metadata.totalEvents}`;
  }
  
  // Populate the year filter dropdown
  function populateYearFilter() {
    const startYear = new Date(metadata.startDate).getFullYear();
    const endYear = new Date(metadata.endDate).getFullYear();
    
    for (let year = startYear; year <= endYear; year++) {
      const option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      yearFilter.appendChild(option);
    }
  }
  
  // Apply all filters and update the event list
  function applyFilters() {
    const eventType = eventTypeFilter.value;
    const planet = planetFilter.value;
    const year = yearFilter.value;
    
    filteredEvents = allEvents.filter(event => {
      // Filter by event type
      if (eventType !== 'all' && event.type !== eventType) {
        return false;
      }
      
      // Filter by planet (check if the description contains the planet name)
      if (planet !== 'all' && !event.description.includes(planet)) {
        return false;
      }
      
      // Filter by year
      if (year !== 'all' && event.date.getFullYear() !== parseInt(year)) {
        return false;
      }
      
      return true;
    });
    
    renderEvents();
  }
  
  // Render the events to the DOM
  function renderEvents() {
    eventList.innerHTML = '';
    
    if (filteredEvents.length === 0) {
      eventList.innerHTML = '<li class="event-item">No events found with the current filters.</li>';
      return;
    }
    
    filteredEvents.forEach(event => {
      // First, render any processed special events
      if (event.processedOutputs && event.processedOutputs.length > 0) {
        event.processedOutputs.forEach(processedOutput => {
          if (processedOutput) {            
            const majorItem = document.createElement('li');
            majorItem.className = 'major-event-item';
            
            const dateStr = event.date.toISOString().split('T')[0];
            
            majorItem.innerHTML = `
              <span class="date">${dateStr}</span>
              <span class="special-event">${processedOutput}</span>
            `;
            eventList.appendChild(majorItem);
          }
        });
      }
      
      // Then render the regular event
      const dateStr = event.date.toISOString().split('T')[0];
      const eventId = `event-${event.date.getTime()}-${event.type.replace(/[^a-zA-Z0-9]/g, '')}`;
      
      const htmlType = `<span class="type type-${event.type}">${event.type.toUpperCase()}</span>`;
      
      // Apply color formatting to description
      let htmlDescription = event.description;
      
      // Add planet classes
      const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
      planets.forEach(planet => {
        const regex = new RegExp(`\\b${planet}\\b`, 'g');
        htmlDescription = htmlDescription.replace(regex, `<span class="planet-${planet}">${planet}</span>`);
      });
      
      // Add sign classes
      const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
      signs.forEach(sign => {
        const regex = new RegExp(`\\b${sign}\\b`, 'g');
        htmlDescription = htmlDescription.replace(regex, `<span class="sign-${sign}">${sign}</span>`);
      });
      
      // Add aspect classes
      const aspects = ['conjunction', 'opposition', 'trine', 'square', 'sextile'];
      aspects.forEach(aspect => {
        const regex = new RegExp(`\\b${aspect}\\b`, 'g');
        htmlDescription = htmlDescription.replace(regex, `<span class="aspect-${aspect}">${aspect}</span>`);
      });
      
      const item = document.createElement('li');
      item.className = 'event-item';
      item.setAttribute('data-event-id', eventId);
      
      item.innerHTML = `
        <span class="toggle-icon" id="toggle-${eventId}">+</span>
        <span class="date">${dateStr}</span>
        ${htmlType}
        <span class="description">${htmlDescription}</span>
        <div class="chart-container" id="chart-${eventId}">
          <div id="chart-svg-${eventId}" class="astro-chart"></div>
        </div>
      `;
      
      item.addEventListener('click', (e) => {
        toggleChart(eventId, e);
      });
      
      eventList.appendChild(item);
    });
  }
  
  // Toggle chart visibility
  function toggleChart(eventId, event) {
    // Stop event propagation
    if (event) {
      event.stopPropagation();
      
      // Check if the click originated from within the chart container
      const chartContainer = document.getElementById('chart-' + eventId);
      if (event.target.closest('.chart-container') === chartContainer) {
        // Open chart as image in new tab
        openChartAsImage(eventId);
        return;
      }
    }
    
    const chartContainer = document.getElementById('chart-' + eventId);
    const toggleIcon = document.getElementById('toggle-' + eventId);
    
    // Toggle display
    if (chartContainer.style.display === 'block') {
      chartContainer.style.display = 'none';
      toggleIcon.textContent = '+';
      toggleIcon.classList.remove('open');
    } else {
      chartContainer.style.display = 'block';
      toggleIcon.textContent = '›';
      toggleIcon.classList.add('open');
      
      // Generate chart if it hasn't been generated yet
      const chartSvg = document.getElementById('chart-svg-' + eventId);
      if (!chartSvg.hasChildNodes()) {
        generateAstrologyChart(eventId, chartSvg);
      }
    }
  }
  
  // Function to download chart as PNG, embedding the required font
  // Helper function to convert ArrayBuffer to Base64
  function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  // Function to open chart as PNG in a new tab, embedding the required font as Base64 data URL
  async function openChartAsImage(eventId) {
    const chartSvgContainer = document.getElementById('chart-svg-' + eventId);
    if (!chartSvgContainer || !chartSvgContainer.querySelector('svg')) {
      console.error('SVG element not found for chart:', eventId);
      return;
    }

    try {
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
        console.log('Font fetched and encoded as data URL.'); // Debugging
      } catch (fontError) {
        console.error('Error fetching or encoding font:', fontError);
        // Optionally: proceed without embedding font or show error to user
        // For now, we'll log the error and continue, the font might fail to render
      }

      // Get the original SVG element
      const originalSvgElement = chartSvgContainer.querySelector('svg');

      // --- Font Embedding ---
      // Clone the SVG element to avoid modifying the live chart
      const clonedSvgElement = originalSvgElement.cloneNode(true);

      // Define the font-face rule using the Base64 data URL (if available)
      const fontFaceStyle = fontDataUrl ? `
        @font-face {
          font-family: 'Astronomicon';
          src: url(${fontDataUrl}) format('truetype');
        }
      ` : ''; // If font fetch failed, don't include the rule

      // Create or find the <defs> element in the clone
      let defs = clonedSvgElement.querySelector('defs');
      if (!defs) {
        defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        clonedSvgElement.insertBefore(defs, clonedSvgElement.firstChild);
      }

      // Create and append the <style> element to the defs in the clone
      if (fontFaceStyle) { // Only add style if font was loaded
          const styleElement = document.createElementNS('http://www.w3.org/2000/svg', 'style');
          styleElement.textContent = fontFaceStyle.trim();
          defs.appendChild(styleElement);
      }

      // Serialize the *cloned* and modified SVG element
      const svgData = new XMLSerializer().serializeToString(clonedSvgElement);
      // Encode the SVG data for use in an Image source
      const svgDataBase64 = btoa(unescape(encodeURIComponent(svgData)));
      const svgDataUrl = `data:image/svg+xml;base64,${svgDataBase64}`;

      // --- Canvas Rendering --- (No need for document.fonts.load anymore)
      const canvas = document.createElement('canvas');
      // Set canvas to larger size (1600x1600) while keeping SVG display size at 400x400
      canvas.width = 1600;
      canvas.height = 1600;

      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      // Scale factor between display size and output size
      const scale = 4; // 1600/400 = 4

      // Use a Promise to handle image loading cleanly
      await new Promise((resolve, reject) => {
        img.onload = () => {
          // Apply scaling to draw the SVG at larger size
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve();
        };
        img.onerror = (err) => {
          console.error('Error loading SVG into image element:', err);
          reject(err);
        };
        img.src = svgDataUrl;
      });

      // Get the PNG data URL
      const pngDataUrl = canvas.toDataURL('image/png');

      // Open PNG in a new tab
      const newTab = window.open();
      newTab.document.write(`<img src="${pngDataUrl}" alt="Astrological Chart" />`);
      newTab.document.title = `Chart ${eventId}`;
      newTab.document.close();
    } catch (error) {
      console.error('Error generating or downloading chart PNG:', error);
    }
  }
  
  // Function to generate astrological chart using astrochart2
  function generateAstrologyChart(eventId, container) {
    // Find the event data for this specific chart
    const eventItem = filteredEvents.find(event => {
      const id = `event-${event.date.getTime()}-${event.type.replace(/[^a-zA-Z0-9]/g, '')}`;
      return id === eventId;
    });
    
    if (!eventItem) {
      console.error('Event not found:', eventId);
      return;
    }
    
    try {
      // Initialize the chart 
      if (!document.getElementById(container.id + '-svg')) {
        // Create a new SVG element for the chart
        const svgElement = document.createElement('div');
        svgElement.id = container.id + '-svg';
        svgElement.style.width = '400px';
        svgElement.style.height = '400px';
        svgElement.style.margin = '0 auto';
        container.appendChild(svgElement);
        
        // Initialize the universe and chart
        const settings = {
          COLOR_ARIES: "#CC0000",
          COLOR_LEO: "#CC0000",
          COLOR_SAGITTARIUS: "#CC0000",
          COLOR_CAPRICORN: "#006600",
          COLOR_TAURUS: "#006600",
          COLOR_VIRGO: "#006600",
          COLOR_GEMINI: "#E6B800",
          COLOR_LIBRA: "#E6B800",
          COLOR_AQUARIUS: "#E6B800",
          COLOR_CANCER: "#00B3B3",
          COLOR_SCORPIO: "#00B3B3",
          COLOR_PISCES: "#00B3B3",
          ASPECT_COLORS: {
            Conjunction: "#333",
            Opposition: "#CC0000",
            Trine: "#006600",
            Square: "#CC0000",
            Sextile: "#E6B800"
          },
          DEFAULT_ASPECTS: [
              {
                  "name": "Conjunction",
                  "angle": 0,
                  "orb": 5
              },
              {
                  "name": "Opposition",
                  "angle": 180,
                  "orb": 5
              },
              {
                  "name": "Trine",
                  "angle": 120,
                  "orb": 5
              },
              {
                  "name": "Square",
                  "angle": 90,
                  "orb": 5
              }
          ],
          ASPECTS_FONT_SIZE: 27,
          RADIX_POINTS_FONT_SIZE: 40,
          RADIX_SIGNS_FONT_SIZE: 40,
          CHART_PADDING: 10,
        };
        const universe = new astrology.Universe(svgElement.id, settings);
        const radix = universe.radix();
        
        // Use actual planet positions from the data if available
        const chartData = {
          points: [],
          cusps: []
        };
        
        if (eventItem.planets && Object.keys(eventItem.planets).length > 0) {
          // Map planets data to the format required by the library
          const planetNames = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];
          planetNames.forEach(planet => {
            if (eventItem.planets[planet]) {
              chartData.points.push({
                name: planet,
                angle: eventItem.planets[planet].longitude,
                retrograde: eventItem.planets[planet].retrograde,
              });
            }
          });
        }
        
        // Set data and render
        radix.setData(chartData);
      }
    } catch (e) {
      container.innerHTML = '<div class="chart-error">Unable to generate chart: ' + e.message + '</div>';
      console.error("Error generating chart:", e);
    }
  }
  
  // Add event listeners for filters
  eventTypeFilter.addEventListener('change', applyFilters);
  planetFilter.addEventListener('change', applyFilters);
  yearFilter.addEventListener('change', applyFilters);
  
  // Load events when the page loads
  loadEvents();
});
