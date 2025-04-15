// netlify/functions/scan.ts
import { Handler, HandlerResponse } from '@netlify/functions';
import { AstrologicalEventScanner } from '../../src/scanner';
import {
  AspectDetector,
  RetrogradeDetector,
  SignIngressDetector,
} from '../../src/eventDetectors';
import {
  NeptunePlutoIngressProcessor,
  PlutoRetrogradeProcessor,
} from '../../src/eventProcessors';
import { isoToJulianDay, julianDayToIso } from '../../src/utils';
import { PLANETS } from '../../src/constants';
import { EventDetector } from '../../src/types';
import { z } from 'zod';

// Registry of available detectors - add new detectors here
const detectorRegistry = {
  aspectDetector: AspectDetector,
  retrogradeDetector: RetrogradeDetector,
  signIngressDetector: SignIngressDetector,
};

// Define the validation schema with Zod
const ScanRequestSchema = z.object({
  // Required parameters with validation
  startTime: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(.\d+)?(Z|[+-]\d{2}:\d{2})$/,
      'Must be ISO 8601 format',
    ),
  endTime: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(.\d+)?(Z|[+-]\d{2}:\d{2})$/,
      'Must be ISO 8601 format',
    ),
  // Optional detector configurations - accepts any detector config
  detectors: z.record(z.string(), z.any()).optional(),
});

// Infer TypeScript type from Zod schema
type ScanRequest = z.infer<typeof ScanRequestSchema>;

// Use in handler function
const validateRequest = (body: unknown): ScanRequest => {
  return ScanRequestSchema.parse(body);
};

const handler: Handler = async (event, _context) => {
  // Check if method is POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({
        error: 'Method Not Allowed',
        message: 'This endpoint only accepts POST requests',
      }),
      headers: {
        Allow: 'POST',
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
        message: 'Content-Type must be application/json',
      }),
    };
  }

  // Parse request body
  let validatedRequest: ScanRequest;
  try {
    // Parse JSON body
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const rawBody = JSON.parse(event.body || '{}');

    // Validate with Zod
    validatedRequest = validateRequest(rawBody);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Format validation errors
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Validation Error',
          details: error.errors.map((e) => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        }),
      };
    }
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Invalid request body',
        message: 'Request body must be valid JSON',
      }),
    };
  }

  // Extract parameters from request body
  const { startTime, endTime } = validatedRequest;

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
          message: 'Invalid time range: endTime must be after startTime',
        }),
      };
    }

    if (daysRequested > MAX_DAYS) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Invalid parameters',
          message: `Invalid time range: too long, must be less than ${Math.floor(
            MAX_DAYS,
          )}`,
        }),
      };
    }

    console.log(
      `Starting scan function with startTime: ${startTime} (JD: ${startJd}), endTime: ${endTime} (JD: ${endJd})`,
    );

    // Initialize detectors based on provided configurations
    const detectors: EventDetector[] = [];
    const detectorConfigs = validatedRequest.detectors || {};
    console.log(detectorConfigs);

    // Process each detector from registry that has config in the request
    Object.entries(detectorConfigs).forEach(
      ([detectorName, detectorConfig]) => {
        // Check if this detector exists in our registry
        const DetectorClass =
          detectorRegistry[detectorName as keyof typeof detectorRegistry];

        if (DetectorClass) {
          try {
            // Validate config using detector's schema
            const config = DetectorClass.configSchema.parse(detectorConfig);

            // Only add the detector if it's enabled
            if (config.enabled) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
              detectors.push(new DetectorClass(config as any));
            }
          } catch (error) {
            console.warn(`Invalid configuration for ${detectorName}`, error);
          }
        }
      },
    );

    // If no detectors were provided or enabled, return an error
    if (detectors.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'No detectors enabled',
          message: 'At least one detector must be enabled in the request',
        }),
      };
    }

    // Create scanner and run scan
    const scanner = new AstrologicalEventScanner(startJd, endJd, detectors);
    console.log('Starting event scan');
    const events = await scanner.scan();
    console.log(`Scan complete, found ${events.length} events`);

    // Process events
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

    // Create response
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
        stack: error instanceof Error ? error.stack : undefined,
      }),
    } as HandlerResponse;
  }
};

export { handler };
