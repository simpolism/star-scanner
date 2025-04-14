declare namespace astrology {
  interface UniverseSettings {
    COLOR_ARIES?: string;
    COLOR_LEO?: string;
    COLOR_SAGITTARIUS?: string;
    COLOR_CAPRICORN?: string;
    COLOR_TAURUS?: string;
    COLOR_VIRGO?: string;
    COLOR_GEMINI?: string;
    COLOR_LIBRA?: string;
    COLOR_AQUARIUS?: string;
    COLOR_CANCER?: string;
    COLOR_SCORPIO?: string;
    COLOR_PISCES?: string;
    ASPECT_COLORS?: {
      Conjunction?: string;
      Opposition?: string;
      Trine?: string;
      Square?: string;
      Sextile?: string;
      [key: string]: string | undefined;
    };
    DEFAULT_ASPECTS?: Array<{
      name: string;
      angle: number;
      orb: number;
    }>;
    ASPECTS_FONT_SIZE?: number;
    RADIX_POINTS_FONT_SIZE?: number;
    RADIX_SIGNS_FONT_SIZE?: number;
    CHART_PADDING?: number;
    [key: string]: any;
  }

  interface ChartPoint {
    name: string;
    angle: number;
    retrograde?: boolean;
  }

  interface ChartData {
    points: ChartPoint[];
    cusps: number[];
  }

  class RadixChart {
    setData(data: ChartData): RadixChart;
  }

  class Universe {
    constructor(elementId: string, settings?: UniverseSettings);

    radix(): RadixChart;
  }
}

declare const astrology: typeof astrology;
