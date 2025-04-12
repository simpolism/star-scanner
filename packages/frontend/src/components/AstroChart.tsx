import React, { useRef, useEffect } from "react";
import { AstrologicalEvent } from "../lib/types";

interface AstroChartProps {
  event: AstrologicalEvent;
  width?: number;
  height?: number;
}

declare global {
  interface Window {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    astrology: any;
  }
}

export default function AstroChart({
  event,
  width = 400,
  height = 400,
}: AstroChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const chartInstanceRef = useRef<any>(null);

  useEffect(() => {
    // Check if astrology library is loaded
    if (
      typeof window !== "undefined" &&
      window.astrology &&
      chartRef.current &&
      event.planets
    ) {
      // Generate chart ID
      const chartId = `chart-${new Date(
        event.date
      ).getTime()}-${event.type.replace(/[^a-zA-Z0-9]/g, "")}`;

      // Clear previous chart
      if (chartRef.current.hasChildNodes()) {
        chartRef.current.innerHTML = "";
      }

      // Set ID for the chart container
      chartRef.current.id = chartId;

      try {
        // Initialize chart
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
            Sextile: "#E6B800",
          },
          DEFAULT_ASPECTS: [
            { name: "Conjunction", angle: 0, orb: 5 },
            { name: "Opposition", angle: 180, orb: 5 },
            { name: "Trine", angle: 120, orb: 5 },
            { name: "Square", angle: 90, orb: 5 },
          ],
          ASPECTS_FONT_SIZE: 27,
          RADIX_POINTS_FONT_SIZE: 40,
          RADIX_SIGNS_FONT_SIZE: 40,
          CHART_PADDING: 10,
        };

        const universe = new window.astrology.Universe(chartId, settings);
        const radix = universe.radix();

        // Map planets data
        const chartData = {
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
          points: [] as any[],
          cusps: [] as number[],
        };

        if (event.planets && Object.keys(event.planets).length > 0) {
          const planetNames = [
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
          planetNames.forEach((planet) => {
            if (event.planets && event.planets[planet]) {
              chartData.points.push({
                name: planet,
                angle: event.planets[planet].longitude,
                retrograde: event.planets[planet].retrograde,
              });
            }
          });
        }

        // Set data and render
        radix.setData(chartData);
        chartInstanceRef.current = radix;
      } catch (e) {
        console.error("Error generating chart:", e);
        if (chartRef.current) {
          chartRef.current.innerHTML =
            '<div class="chart-error">Unable to generate chart</div>';
        }
      }
    }

    return () => {
      // Cleanup if needed
      chartInstanceRef.current = null;
    };
  }, [event]);

  return (
    <div
      ref={chartRef}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        margin: "0 auto",
      }}
      className="astro-chart"
    />
  );
}
