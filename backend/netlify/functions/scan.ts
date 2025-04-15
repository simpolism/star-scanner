// netlify/functions/scan.ts
import { Handler } from '@netlify/functions';
import { AstrologicalEventScanner } from '../../src/scanner';
import { AspectDetector, RetrogradeDetector, SignIngressDetector } from '../../src/eventDetectors';
import { NeptunePlutoIngressProcessor, PlutoRetrogradeProcessor } from '../../src/eventProcessors';
import { isoToJulianDay, julianDayToIso } from '../../src/utils';
import { PLANETS } from '../../src/constants';

const handler: Handler = async (event, context) => {
  // Parse query parameters for startTime and endTime
  console.log(JSON.stringify(event, null, 2));
  const queryStringParameters = event.queryStringParameters || {};
  const { startTime, endTime } = queryStringParameters;
  
  // Validate required parameters
  if (!startTime || !endTime) {
    return {
      statusCode: 400,
      body: JSON.stringify({ 
        error: 'Missing required parameters', 
        message: 'Both startTime and endTime parameters are required'
      }),
      isBase64Encoded: false,
    };
  }
  
  try {
    // Convert ISO strings to Julian Day Numbers
    const startJd = isoToJulianDay(startTime);
    const endJd = isoToJulianDay(endTime);
    
    // verify request timespan is valid
    const MAX_COMPUTE_ITEMS = 5000; // should ALWAYS be WELL under <10s

    // In the future these compute points will be chosen by the user so may be fewer,
    // but we will assume all planetary computations to be safe.
    const N_COMPUTE_POINTS = Object.keys(PLANETS).length;

    // Later this will be based on provided interval rather than automatically in days.
    const MAX_DAYS = MAX_COMPUTE_ITEMS / N_COMPUTE_POINTS;
    const daysRequested = Math.floor(endJd - startJd);
    if (daysRequested < 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'Invalid parameters', 
          message: 'Invalid time range: endTime must be after startTime'
        }),
        isBase64Encoded: false,
      };
    }
    if (daysRequested > MAX_DAYS) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'Invalid parameters', 
          message: `Invalid time range: too long, must be less than ${Math.floor(MAX_DAYS)}`
        }),
        isBase64Encoded: false,
      };
    }

    console.log(`Starting scan function with startTime: ${startTime} (JD: ${startJd}), endTime: ${endTime} (JD: ${endJd})`);
    
    // Create event detectors
    const detectors = [
      new SignIngressDetector(['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']),
      new RetrogradeDetector(['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']),
      new AspectDetector(
        [
          ['Jupiter', 'Saturn'],
          ['Jupiter', 'Uranus'],
          ['Jupiter', 'Neptune'],
          ['Jupiter', 'Pluto'],
          ['Saturn', 'Uranus'],
          ['Saturn', 'Neptune'],
          ['Saturn', 'Pluto'],
          ['Uranus', 'Neptune'],
          ['Uranus', 'Pluto'],
          ['Neptune', 'Pluto'],
        ],
        ['conjunction', 'opposition', 'square', 'trine'],
      ),
    ];

    // Create scanner with the Julian Day Numbers
    const scanner = new AstrologicalEventScanner(startJd, endJd, detectors);
    
    // Run the scan
    console.log('Starting event scan');
    const events = await scanner.scan();
    console.log(`Scan complete, found ${events.length} events`);
    
    // Process events
    const processedEvents = events.map((event) => {
      const processedOutputs = [
        PlutoRetrogradeProcessor(event),
        NeptunePlutoIngressProcessor(event),
      ].filter((output) => output !== undefined);

      // convert date to UTC for front-end use
      return {
        ...event,
        dateUTC: julianDayToIso(event.date),
        processedOutputs,
      };
    });
    
    // Create JSON response
    const responseData = {
      metadata: {
        startDate: startTime,
        endDate: endTime,
        generatedAt: new Date().toISOString(),
        totalEvents: events.length,
      },
      events: processedEvents,
    };

    // Return JSON response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
      body: JSON.stringify(responseData),
    };
  } catch (error) {
    console.error('Error generating astrological events:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to generate astrological events', 
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined 
      }),
    };
  }
};

export { handler };