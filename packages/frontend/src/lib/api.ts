import { EventsData } from "@star-scanner/common";

const NETLIFY_FUNCTION_URL = "/.netlify/functions/scan";

export async function fetchEvents(): Promise<EventsData> {
  const response = await fetch(NETLIFY_FUNCTION_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch events data");
  }

  return response.json();
}
