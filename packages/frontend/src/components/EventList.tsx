import React, { useState, useEffect } from "react";
import { AstrologicalEvent } from "@star-scanner/common";
import AstroChart from "./AstroChart";
import { type FilterState } from "../lib/types";

interface EventListProps {
  events: AstrologicalEvent[];
  metadata: {
    startDate: string;
    endDate: string;
    generatedAt: string;
  };
}

export default function EventList({ events, metadata }: EventListProps) {
  const [filteredEvents, setFilteredEvents] = useState<AstrologicalEvent[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    eventType: "all",
    planet: "all",
    year: "all",
  });
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>(
    {}
  );

  // Generate event ID
  const getEventId = (event: AstrologicalEvent): string => {
    return `event-${new Date(event.date).getTime()}-${event.type.replace(
      /[^a-zA-Z0-9]/g,
      ""
    )}`;
  };

  // Apply filters when events or filter settings change
  useEffect(() => {
    if (!events || events.length === 0) return;

    const filtered = events.filter((event) => {
      // Filter by event type
      if (filters.eventType !== "all" && event.type !== filters.eventType) {
        return false;
      }

      // Filter by planet (check if the description contains the planet name)
      if (
        filters.planet !== "all" &&
        !event.description.includes(filters.planet)
      ) {
        return false;
      }

      // Filter by year
      if (filters.year !== "all") {
        const eventYear = new Date(event.date).getFullYear().toString();
        if (eventYear !== filters.year) {
          return false;
        }
      }

      return true;
    });

    setFilteredEvents(filtered);
  }, [events, filters]);

  // Handle filter change
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Toggle chart visibility
  const toggleChart = (eventId: string) => {
    setExpandedEvents((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }));
  };

  // Format description with colors for planets, signs, and aspects
  const formatDescription = (description: string): JSX.Element => {
    let formattedText = description;

    // Add planet classes
    const planets = [
      "Sun",
      "Moon",
      "Mercury",
      "Venus",
      "Mars",
      "Jupiter",
      "Saturn",
      "Uranus",
      "Neptune",
      "Pluto",
    ];
    planets.forEach((planet) => {
      const regex = new RegExp(`\\b${planet}\\b`, "g");
      formattedText = formattedText.replace(
        regex,
        `<span class="planet-${planet}">${planet}</span>`
      );
    });

    // Add sign classes
    const signs = [
      "Aries",
      "Taurus",
      "Gemini",
      "Cancer",
      "Leo",
      "Virgo",
      "Libra",
      "Scorpio",
      "Sagittarius",
      "Capricorn",
      "Aquarius",
      "Pisces",
    ];
    signs.forEach((sign) => {
      const regex = new RegExp(`\\b${sign}\\b`, "g");
      formattedText = formattedText.replace(
        regex,
        `<span class="sign-${sign}">${sign}</span>`
      );
    });

    // Add aspect classes
    const aspects = ["conjunction", "opposition", "trine", "square", "sextile"];
    aspects.forEach((aspect) => {
      const regex = new RegExp(`\\b${aspect}\\b`, "g");
      formattedText = formattedText.replace(
        regex,
        `<span class="aspect-${aspect}">${aspect}</span>`
      );
    });

    return <span dangerouslySetInnerHTML={{ __html: formattedText }} />;
  };

  // Populate year filter options
  const getYearOptions = () => {
    if (!metadata || !metadata.startDate || !metadata.endDate) return null;

    const startYear = new Date(metadata.startDate).getFullYear();
    const endYear = new Date(metadata.endDate).getFullYear();

    const options = [
      <option key="all" value="all">
        All Years
      </option>,
    ];

    for (let year = startYear; year <= endYear; year++) {
      options.push(
        <option key={year} value={year.toString()}>
          {year}
        </option>
      );
    }

    return options;
  };

  return (
    <div>
      <div className="filters">
        <div className="filter-group">
          <label htmlFor="eventType">Event Type:</label>
          <select
            id="eventType"
            name="eventType"
            value={filters.eventType}
            onChange={handleFilterChange}
          >
            <option value="all">All Events</option>
            <option value="ingress">Ingress</option>
            <option value="retrograde">Retrograde</option>
            <option value="aspect_begin">Aspect Begin</option>
            <option value="aspect_peak">Aspect Peak</option>
            <option value="aspect_end">Aspect End</option>
            <option value="configuration">Configuration</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="planet">Planet:</label>
          <select
            id="planet"
            name="planet"
            value={filters.planet}
            onChange={handleFilterChange}
          >
            <option value="all">All Planets</option>
            <option value="Jupiter">Jupiter</option>
            <option value="Saturn">Saturn</option>
            <option value="Uranus">Uranus</option>
            <option value="Neptune">Neptune</option>
            <option value="Pluto">Pluto</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="year">Year:</label>
          <select
            id="year"
            name="year"
            value={filters.year}
            onChange={handleFilterChange}
          >
            {getYearOptions()}
          </select>
        </div>
      </div>

      <div id="events-container">
        {filteredEvents.length === 0 ? (
          <div className="no-events">
            No events found with the current filters.
          </div>
        ) : (
          <ul className="event-list">
            {filteredEvents.map((event) => {
              const dateStr = new Date(event.date).toISOString().split("T")[0];
              const eventId = getEventId(event);
              const isExpanded = expandedEvents[eventId] || false;

              // First, render any processed special events
              const processedOutputs =
                event.processedOutputs && event.processedOutputs.length > 0
                  ? event.processedOutputs.map((output, idx) =>
                      output ? (
                        <li
                          key={`${eventId}-processed-${idx}`}
                          className="major-event-item"
                        >
                          <span className="date">{dateStr}</span>
                          <span className="special-event">{output}</span>
                        </li>
                      ) : null
                    )
                  : null;

              return (
                <React.Fragment key={eventId}>
                  {processedOutputs}
                  <li className="event-item" data-event-id={eventId}>
                    <span
                      className={`toggle-icon ${isExpanded ? "open" : ""}`}
                      onClick={() => toggleChart(eventId)}
                    >
                      {isExpanded ? "›" : "+"}
                    </span>
                    <span className="date">{dateStr}</span>
                    <span className={`type type-${event.type}`}>
                      {event.type.toUpperCase()}
                    </span>
                    <span className="description">
                      {formatDescription(event.description)}
                    </span>

                    {isExpanded && (
                      <div className="chart-container">
                        <AstroChart event={event} />
                      </div>
                    )}
                  </li>
                </React.Fragment>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
