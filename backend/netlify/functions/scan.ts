// netlify/functions/scan.ts
import { Handler, HandlerResponse } from '@netlify/functions';
import { AstrologicalEventScanner } from '../../src/scanner';
import { AspectDetector, RetrogradeDetector, SignIngressDetector } from '../../src/eventDetectors';
import { NeptunePlutoIngressProcessor, PlutoRetrogradeProcessor } from '../../src/eventProcessors';
import { isoToJulianDay, julianDayToIso } from '../../src/utils';
import { PLANETS } from '../../src/constants';

const handler: Handler = async (event, context) => {
  // Check if method is POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({
        error: 'Method Not Allowed',
        message: 'This endpoint only accepts POST requests'
      }),
      headers: {
        'Allow': 'POST'
      },
    };
  }

  // Check content type
  const contentType = event.headers['content-type'] || '';
  if (!contentType.includes('application/json')) {
    return {
      statusCode: 415,
      body: JSON.stringify({
        error: 'Unsupported Media Type',
        message: 'Content-Type must be application/json'
      }),
    };
  }

  // Parse request body
  let requestBody;
  try {
    requestBody = JSON.parse(event.body || '{}');
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Invalid request body',
        message: 'Request body must be valid JSON'
      }),
    };
  }

  // Extract parameters from request body
  const { startTime, endTime } = requestBody;
  
  // Validate required parameters
  if (!startTime || !endTime) {
    return {
      statusCode: 400,
      body: JSON.stringify({ 
        error: 'Missing required parameters', 
        message: 'Both startTime and endTime parameters are required'
      }),
    };
  }
  
  try {
    // Convert ISO strings to Julian Day Numbers
    const startJd = isoToJulianDay(startTime);
    const endJd = isoToJulianDay(endTime);
    
    // verify request timespan is valid
    const MAX_COMPUTE_ITEMS = 5000; // should ALWAYS be WELL under <10s
    const N_COMPUTE_POINTS = PLANETS.size;
    const MAX_DAYS = MAX_COMPUTE_ITEMS / N_COMPUTE_POINTS;
    const daysRequested = Math.floor(endJd - startJd);
    
    if (daysRequested < 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'Invalid parameters', 
          message: 'Invalid time range: endTime must be after startTime'
        }),
      };
    }
    
    if (daysRequested > MAX_DAYS) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'Invalid parameters', 
          message: `Invalid time range: too long, must be less than ${Math.floor(MAX_DAYS)}`
        }),
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

    // Create scanner and run scan (unchanged)
    const scanner = new AstrologicalEventScanner(startJd, endJd, detectors);
    console.log('Starting event scan');
    const events = await scanner.scan();
    console.log(`Scan complete, found ${events.length} events`);
    
    // Process events (unchanged)
    const processedEvents = events.map((event) => {
      const processedOutputs = [
        PlutoRetrogradeProcessor(event),
        NeptunePlutoIngressProcessor(event),
      ].filter((output) => output !== undefined);

      return {
        ...event,
        dateUTC: julianDayToIso(event.date),
        processedOutputs,
      };
    });
    
    // Create response (unchanged)
    const responseData = {
      metadata: {
        startDate: startTime,
        endDate: endTime,
        generatedAt: new Date().toISOString(),
        totalEvents: events.length,
      },
      events: processedEvents,
    };

    // Return JSON response with CORS headers
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Access-Control-Allow-Origin': '*', // Add CORS headers as needed
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify(responseData),
    } as HandlerResponse;
  } catch (error) {
    console.error('Error generating astrological events:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to generate astrological events', 
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined 
      }),
    } as HandlerResponse;
  }
};

export { handler };