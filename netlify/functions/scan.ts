// netlify/functions/scan.ts
import { Handler } from '@netlify/functions';
import { AstrologicalEventScanner } from '../../src/scanner';
import { AspectDetector, RetrogradeDetector, SignIngressDetector } from '../../src/eventDetectors';
import { NeptunePlutoIngressProcessor, PlutoRetrogradeProcessor } from '../../src/eventProcessors';
import { START_DATE, END_DATE } from '../../src/constants';

const handler: Handler = async (event, context) => {
  try {
    console.log('Starting scan function');
    // Create event detectors (same as in original code)
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

    // Create scanner
    const scanner = new AstrologicalEventScanner(START_DATE, END_DATE, detectors);
    
    // Run the scan
    console.log('Starting event scan');
    const events = await scanner.scan();
    console.log(`Scan complete, found ${events.length} events`);
    
    // Process events (instead of saving to file)
    const processedEvents = events.map((event) => {
      const processedOutputs = [
        PlutoRetrogradeProcessor(event),
        NeptunePlutoIngressProcessor(event),
      ].filter((output) => output !== undefined);

      return {
        ...event,
        date: event.date.toISOString(), // Convert Date to string for JSON
        processedOutputs,
      };
    });
    
    // Create JSON response
    const responseData = {
      metadata: {
        startDate: START_DATE.toISOString(),
        endDate: END_DATE.toISOString(),
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
        // Add cache headers to improve performance
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
