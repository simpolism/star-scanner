import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import useSWR from "swr";
import { fetchEvents } from "../lib/api";
import EventList from "../components/EventList";
import { EventsData } from "@star-scanner/common";

export default function HomePage() {
  const { data, error } = useSWR<EventsData>("events", fetchEvents);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  // Load astrochart2.js script
  useEffect(() => {
    if (typeof window !== "undefined" && !isScriptLoaded) {
      const script = document.createElement("script");
      script.src = "/assets/lib/astrochart2.js";
      script.async = true;
      script.onload = () => setIsScriptLoaded(true);
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, [isScriptLoaded]);

  return (
    <>
      <Head>
        <title>Astrological Events Viewer</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <header>
        <h1 id="main-title">
          <Link href="/">
            <a>Event Log</a>
          </Link>
        </h1>
        <p id="meta-info">
          {data
            ? `Time generated: ${new Date(
                data.metadata.generatedAt
              ).toLocaleString()} | `
            : "Loading data..."}
          <a
            href="https://github.com/simpolism/asi-2027"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </p>
      </header>

      <main>
        {error && (
          <div className="error-message">
            Error loading event data. Please try again later.
          </div>
        )}

        {!data && !error && <div id="loading">Loading events data...</div>}

        {data && <EventList events={data.events} metadata={data.metadata} />}
      </main>

      <footer>
        <p>
          Data generated using Swiss Ephemeris. View{" "}
          <a href="/.netlify/functions/scan" target="_blank" rel="noreferrer">
            Raw JSON Data
          </a>
          .
        </p>
      </footer>
    </>
  );
}
