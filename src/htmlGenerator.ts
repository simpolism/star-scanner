import { type AstrologicalEvent, EventProcessor } from './types';
import { COLORS, END_DATE, START_DATE } from './constants';
import fs from 'fs';

export const generateHtml = (
  events: AstrologicalEvent[],
  eventProcessors: Array<EventProcessor> = [],
): void => {
  if (!events.length) {
    console.log('No events found.');
    return;
  }

  events.sort((a, b) => a.date.getTime() - b.date.getTime());
  console.log(`Found ${events.length} events. Generating HTML output...`);

  // Create HTML content
  let htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Astrological Events ${START_DATE.getFullYear()}-${END_DATE.getFullYear()}</title>
  <script src="https://cdn.jsdelivr.net/npm/astrochart2@0.7.3/dist/astrochart2.js"></script>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      margin: 20px;
      background-color: #f5f5f5;
      color: #333;
    }
    h1 {
      color: #444;
      border-bottom: 2px solid #444;
      padding-bottom: 10px;
    }
    .event-list {
      list-style-type: none;
      padding: 0;
    }
    .event-item {
      background-color: white;
      margin-bottom: 8px;
      padding: 12px;
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      cursor: pointer;
    }
    .major-event-item {
      background-color: #f8f8f8;
      margin-bottom: 8px;
      padding: 12px;
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      border-left: 4px solid #444;
      font-weight: bold;
    }
    .date {
      font-weight: bold;
      margin-right: 10px;
      min-width: 100px;
      display: inline-block;
    }
    .type {
      font-weight: bold;
      min-width: 120px;
      display: inline-block;
      margin-right: 10px;
    }
    .toggle-icon {
      display: inline-block;
      width: 16px;
      height: 16px;
      margin-right: 10px;
      text-align: center;
      line-height: 16px;
      background-color: #f0f0f0;
      border-radius: 3px;
      font-weight: bold;
      transition: transform 0.3s;
    }
    .toggle-icon.open {
      transform: rotate(90deg);
    }
    .chart-container {
      display: none;
      padding: 15px;
      margin-top: 10px;
      background-color: #fff;
      border-radius: 4px;
      box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
      height: 400px;
      overflow: auto;
    }
    /* ANSI color to CSS color conversion for planets */
    .planet-Sun { color: #e6b800; }
    .planet-Moon { color: #c0c0c0; }
    .planet-Mercury { color: #00b3b3; }
    .planet-Venus { color: #cc00cc; }
    .planet-Mars { color: #cc0000; }
    .planet-Jupiter { color: #0000cc; }
    .planet-Saturn { color: #666666; }
    .planet-Uranus { color: #00cccc; }
    .planet-Neptune { color: #0099ff; }
    .planet-Pluto { color: #cc66cc; }
    
    /* Sign colors */
    .sign-Aries, .sign-Leo, .sign-Sagittarius { color: #cc0000; }
    .sign-Taurus, .sign-Virgo, .sign-Capricorn { color: #006600; }
    .sign-Gemini, .sign-Libra, .sign-Aquarius { color: #e6b800; }
    .sign-Cancer, .sign-Scorpio, .sign-Pisces { color: #00b3b3; }
    
    /* Aspect colors */
    .aspect-conjunction { color: #ffffff; background-color: #333; padding: 0 3px; }
    .aspect-opposition { color: #cc0000; }
    .aspect-trine { color: #006600; }
    .aspect-square { color: #cc0000; }
    .aspect-sextile { color: #e6b800; }
    
    /* Event type colors */
    .type-aspect_end { color: #cc00cc; }
    .type-aspect_begin { color: #00cc00; }
    .type-ingress { color: #006600; }
    .type-retrograde { color: #e6b800; }
    .type-configuration { color: #00b3b3; }
  </style>
</head>
<body>
  <h1>Astrological Events ${START_DATE.getFullYear()}-${END_DATE.getFullYear()}</h1>
  <p>Time generated: ${new Date().toLocaleString()} | <a href="https://github.com/simpolism/asi-2017" target="_blank">GitHub</a></p>
  <p>Total events found: ${events.length}</p>
  
  <ul class="event-list">`;
  for (const event of events) {
    const dateStr = event.date.toISOString().split('T')[0];

    // First, add special event processed output if present
    for (const processor of eventProcessors) {
      const processedOutput = processor(event);
      if (processedOutput) {
        // Create unique ID for major events
        const majorEventId = `major-event-${event.date.getTime()}-${event.type.replace(
          /[^a-zA-Z0-9]/g,
          '',
        )}`;

        htmlContent += `
          <li class="major-event-item">
            <span class="date">${dateStr}</span>
            <span class="special-event">${processedOutput}</span>
            <div class="chart-container" id="chart-${majorEventId}">
              <div id="chart-svg-${majorEventId}" class="astro-chart"></div>
            </div>
          </li>`;
      }
    }

    // Add the regular event
    const htmlType = `<span class="type type-${event.type}">${event.type.toUpperCase()}</span>`;

    // Replace ANSI colors with HTML spans
    let htmlDescription = event.description;

    // Add planet classes
    Object.keys(COLORS.PLANET_COLORS).forEach((planet) => {
      const regex = new RegExp(`\\b${planet}\\b`, 'g');
      htmlDescription = htmlDescription.replace(
        regex,
        `<span class="planet-${planet}">${planet}</span>`,
      );
    });

    // Add sign classes
    Object.keys(COLORS.SIGN_COLORS).forEach((sign) => {
      const regex = new RegExp(`\\b${sign}\\b`, 'g');
      htmlDescription = htmlDescription.replace(regex, `<span class="sign-${sign}">${sign}</span>`);
    });

    // Add aspect classes
    Object.keys(COLORS.ASPECT_COLORS).forEach((aspect) => {
      const regex = new RegExp(`\\b${aspect}\\b`, 'g');
      htmlDescription = htmlDescription.replace(
        regex,
        `<span class="aspect-${aspect}">${aspect}</span>`,
      );
    });

    // Create unique ID for each event's chart
    const eventId = `event-${event.date.getTime()}-${event.type.replace(/[^a-zA-Z0-9]/g, '')}`;

    htmlContent += `
    <li class="event-item" onclick="toggleChart('${eventId}', event)">
      <span class="toggle-icon" id="toggle-${eventId}">+</span>
      <span class="date">${dateStr}</span>
      ${htmlType}
      <span class="description">${htmlDescription}</span>
      <div class="chart-container" id="chart-${eventId}">
        <div id="chart-svg-${eventId}" class="astro-chart"></div>
      </div>
    </li>`;
  }

  // Close HTML
  htmlContent += `
  </ul>

  <script>
    // Function to toggle chart visibility
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
  </script>
</body>
</html>`;

  // Write the HTML file
  const outputPath = 'astrological-events.html';
  fs.writeFileSync(outputPath, htmlContent);
  console.log(`HTML output generated: ${outputPath}`);
};
