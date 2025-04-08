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
        date: new Date(event.date) // Convert string back to Date
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
  
  // Function to generate astrological chart using astrochart2
  function generateAstrologyChart(eventId, container) {
    // Extract date from the eventId or from parent element
    const dateStr = container.closest('li').querySelector('.date').textContent;
    const eventDate = new Date(dateStr);
    
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
        
        // Add chart caption
        const caption = document.createElement('div');
        caption.className = 'chart-caption';
        caption.style.textAlign = 'center';
        caption.style.marginBottom = '10px';
        caption.style.fontWeight = 'bold';
        caption.textContent = 'Astrological chart for ' + dateStr;
        container.insertBefore(caption, svgElement);
        
        // Initialize the universe and chart
        const universe = new astrology.Universe(svgElement.id, 400, 400);
        const radix = universe.radix();
        
        // Generate some angles based on the date to make each chart unique
        // This is a simple algorithm to generate pseudo-random but consistent angles
        const day = eventDate.getDate();
        const month = eventDate.getMonth() + 1;
        const year = eventDate.getFullYear();
        
        // The library requires specific data format
        const chartData = {
          points: [
            { name: "Sun", angle: (day * 12) % 360 },
            { name: "Moon", angle: (month * 30) % 360 },
            { name: "Mercury", angle: (day * month) % 360 },
            { name: "Venus", angle: (month * 10 + day) % 360 },
            { name: "Mars", angle: (day * 5 + month * 10) % 360 },
            { name: "Jupiter", angle: (year % 100 * 3.6) % 360 },
            { name: "Saturn", angle: (year % 100 * 1.8 + day) % 360 },
            { name: "Uranus", angle: (month * 40 - day * 2) % 360 },
            { name: "Neptune", angle: (day * 15 + month * 5) % 360 },
            { name: "Pluto", angle: (month * 25 + day * 3) % 360 },
          ],
          cusps: [
            { angle: 0 }, { angle: 30 }, { angle: 60 }, 
            { angle: 90 }, { angle: 120 }, { angle: 150 }, 
            { angle: 180 }, { angle: 210 }, { angle: 240 }, 
            { angle: 270 }, { angle: 300 }, { angle: 330 }
          ]
        };
        
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
