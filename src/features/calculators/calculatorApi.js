import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "@/lib/api-client";

const SIGN_ORDER = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"
];

const getHouseFromSigns = (planetSign, ascSign) => {
  const pIdx = SIGN_ORDER.indexOf(String(planetSign || "").toLowerCase());
  const aIdx = SIGN_ORDER.indexOf(String(ascSign || "").toLowerCase());
  if (pIdx === -1 || aIdx === -1) return 1;
  return ((pIdx - aIdx + 12) % 12) + 1;
};

const PLANET_KEYS = [
  "Ascendant", "Sun", "Moon", "Mars", "Mercury",
  "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"
];

/**
 * Normalizes raw Vedic Horoscope response from Jagannatha Hora engine
 * into standard structure for charts, tables, and dashas.
 */
export function normalizeHoroscopeData(raw = {}, fallbackMeta = {}) {
  // Extract horoscope (handles raw.horoscope, raw.chartData, raw.chart_data, or raw directly)
  let horoscope =
    raw.horoscope || raw.chartData || raw.chart_data || (raw.divisional_charts ? raw : {});
  if (typeof horoscope === "string") {
    try {
      horoscope = JSON.parse(horoscope);
    } catch {
      horoscope = {};
    }
  }

  const divCharts = horoscope.divisional_charts || raw.allDivisionalCharts || {};
  const rawRasi = divCharts["D-1_rasi"] || raw.rasi_chart || raw.rasiChart || {};
  const rawNavamsa = divCharts["D-9_navamsa"] || raw.navamsaChart || {};
  const rawDasamsa = divCharts["D-10_dasamsa"] || raw.dasamsaChart || {};
  const nakshatraPada = horoscope.nakshatra_pada || {};

  const ascSign =
    raw.summary?.ascendantSign ||
    raw.summary?.ascendant_sign ||
    rawRasi.Ascendant?.sign ||
    fallbackMeta.summary?.ascendantSign ||
    "Aries";

  // Build augmented Rasi (D-1) chart with degrees, nakshatras, padas, and houses
  const rasiChart = {};
  PLANET_KEYS.forEach((key) => {
    const pData = rawRasi[key] || rawRasi[key.toLowerCase()];
    const npData = nakshatraPada[key] || nakshatraPada[key.toLowerCase()] || {};
    if (pData) {
      const pSign = pData.sign || pData.rashi || "Aries";
      rasiChart[key] = {
        ...pData,
        ...npData,
        sign: pSign,
        longitude: pData.longitude ?? pData.degree ?? 0,
        degree: pData.degree ?? pData.longitude ?? 0,
        house: pData.house || getHouseFromSigns(pSign, ascSign),
        nakshatra: npData.nakshatra || pData.nakshatra || "—",
        pada: npData.pada ?? pData.pada ?? 1,
        nakshatra_lord: npData.nakshatra_lord || pData.nakshatra_lord || pData.sign_lord || "—",
        retrograde: Boolean(pData.retrograde),
      };
    }
  });

  // Build Navamsha (D-9) chart
  const navamsaChart = {};
  const ascNavSign = rawNavamsa.Ascendant?.sign || "Virgo";
  PLANET_KEYS.forEach((key) => {
    const pData = rawNavamsa[key] || rawNavamsa[key.toLowerCase()];
    if (pData) {
      const pSign = pData.sign || pData.rashi || "Aries";
      navamsaChart[key] = {
        ...pData,
        sign: pSign,
        longitude: pData.longitude ?? pData.degree ?? 0,
        degree: pData.degree ?? pData.longitude ?? 0,
        house: pData.house || getHouseFromSigns(pSign, ascNavSign),
        retrograde: Boolean(pData.retrograde),
      };
    }
  });

  // Build Dashamsha (D-10) chart
  const dasamsaChart = {};
  const ascDasSign = rawDasamsa.Ascendant?.sign || "Aries";
  PLANET_KEYS.forEach((key) => {
    const pData = rawDasamsa[key] || rawDasamsa[key.toLowerCase()];
    if (pData) {
      const pSign = pData.sign || pData.rashi || "Aries";
      dasamsaChart[key] = {
        ...pData,
        sign: pSign,
        longitude: pData.longitude ?? pData.degree ?? 0,
        degree: pData.degree ?? pData.longitude ?? 0,
        house: pData.house || getHouseFromSigns(pSign, ascDasSign),
        retrograde: Boolean(pData.retrograde),
      };
    }
  });

  const ascPlanet = rasiChart.Ascendant || rawRasi.Ascendant || {};
  const moonPlanet = rasiChart.Moon || rawRasi.Moon || {};
  const sunPlanet = rasiChart.Sun || rawRasi.Sun || {};
  const moonNak = nakshatraPada.Moon || {};

  const summary = {
    ascendantSign: ascSign,
    ascendantDegree: ascPlanet.longitude ?? ascPlanet.degree ?? 0,
    moonSign: raw.summary?.moonSign || raw.summary?.moon_sign || moonPlanet.sign || fallbackMeta.summary?.moonSign || "Virgo",
    moonDegree: moonPlanet.longitude ?? moonPlanet.degree ?? 0,
    sunSign: raw.summary?.sunSign || raw.summary?.sun_sign || sunPlanet.sign || fallbackMeta.summary?.sunSign || "Aries",
    sunDegree: sunPlanet.longitude ?? sunPlanet.degree ?? 0,
    nakshatra: raw.summary?.nakshatra || raw.summary?.moon_nakshatra || moonNak.nakshatra || moonPlanet.nakshatra || fallbackMeta.summary?.nakshatra || "—",
    pada: raw.summary?.pada ?? raw.summary?.moon_pada ?? moonNak.pada ?? moonPlanet.pada ?? fallbackMeta.summary?.pada ?? 1,
    nakshatraLord: moonNak.nakshatra_lord || moonPlanet.nakshatra_lord || "—",
  };

  // Vimshottari / Graha Dashas
  const grahaDashas = horoscope.graha_dashas || {};
  const currentObj = grahaDashas.current || {};
  const vimsottariList = Array.isArray(grahaDashas.vimsottari) ? grahaDashas.vimsottari : [];

  let dashaMajor = currentObj.major || grahaDashas.current_mahadasha || raw.dashas?.current_mahadasha;
  let dashaSub = currentObj.sub || grahaDashas.current_antardasha || raw.dashas?.current_antardasha;
  let dashaSubSub = currentObj.sub_sub || grahaDashas.current_pratyantar || raw.dashas?.current_pratyantar;
  let balanceAtBirth = grahaDashas.balance_at_birth;

  // If backend returns vimsottari array of [label, dateStr]
  if ((!dashaMajor || dashaMajor === "—") && vimsottariList.length > 0) {
    const now = new Date();
    for (let i = 0; i < vimsottariList.length; i++) {
      const [label, dateStr] = vimsottariList[i] || [];
      if (dateStr) {
        const dt = new Date(dateStr.replace(" ", "T"));
        if (dt > now) {
          const parts = (label || "").split("-");
          dashaMajor = parts[0]?.replace("Raagu", "Rahu")?.replace("Kethu", "Ketu");
          dashaSub = parts[1]?.replace("Raagu", "Rahu")?.replace("Kethu", "Ketu");
          dashaSubSub = parts[2]?.replace("Raagu", "Rahu")?.replace("Kethu", "Ketu");
          break;
        }
      }
    }
    if (!balanceAtBirth && vimsottariList[0]) {
      const firstLord = (vimsottariList[0][0] || "").split("-")[0]?.replace("Raagu", "Rahu")?.replace("Kethu", "Ketu");
      balanceAtBirth = `${firstLord || summary.nakshatraLord} Dasha`;
    }
  }

  const dashas = {
    current_mahadasha: dashaMajor || summary.nakshatraLord || "—",
    current_antardasha: dashaSub || "—",
    current_pratyantar: dashaSubSub || "—",
    balance_at_birth: balanceAtBirth || (summary.nakshatraLord ? `${summary.nakshatraLord} Dasha` : "—"),
    ...grahaDashas,
    ...(raw.dashas || {}),
  };

  return {
    chartId: raw.chartId || raw.id || fallbackMeta.chartId,
    name: raw.name || fallbackMeta.name || "Seeker",
    gender: raw.gender || fallbackMeta.gender || "male",
    dob: raw.dob || fallbackMeta.dob,
    tob: raw.tob || fallbackMeta.tob,
    city: raw.city || fallbackMeta.city,
    latitude: raw.latitude ?? fallbackMeta.latitude,
    longitude: raw.longitude ?? fallbackMeta.longitude,
    timezone: raw.timezone ?? fallbackMeta.timezone,
    summary,
    rasiChart,
    navamsaChart,
    dasamsaChart,
    allDivisionalCharts: divCharts,
    dashas,
    yogas: horoscope.yogas || raw.yogas || {},
    doshas: horoscope.doshas || raw.doshas || {},
    calendar_info: horoscope.calendar_info || {},
    horoscope,
    raw,
  };
}

/**
 * Async Thunk: Calculate Janam Kundli / Horoscope
 * Payload shape expected by backend /api/v1/vedic/horoscope:
 * {
 *   name, gender, dob, tob, isTimeUnknown,
 *   location: { city, lat, lng, timezoneOffset }
 * }
 */
export const calculateKundli = createAsyncThunk(
  "calculators/calculateKundli",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/vedic/horoscope", payload);
      if (response.data && response.data.success) {
        const normalized = normalizeHoroscopeData(response.data.data, payload);
        // Cache last calculation in local storage for quick reload
        try {
          localStorage.setItem(
            "astrotring_last_kundli",
            JSON.stringify({
              input: payload,
              data: normalized,
              computedAt: new Date().toISOString(),
            })
          );
        } catch {
          // Ignore local storage write errors
        }
        return normalized;
      }
      return rejectWithValue(
        response.data?.message || "Failed to calculate birth chart."
      );
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Calculation service currently unavailable. Please verify coordinates and try again.";
      return rejectWithValue(message);
    }
  }
);

/**
 * Async Thunk: Location Autocomplete & Geocoding
 */
export const searchLocations = createAsyncThunk(
  "calculators/searchLocations",
  async (query, { rejectWithValue }) => {
    if (!query || query.trim().length < 2) {
      return [];
    }
    try {
      const response = await apiClient.get("/vedic/location/autocomplete", {
        params: { query: query.trim(), limit: 6 },
      });
      if (response.data && response.data.success) {
        return (
          response.data.results ||
          response.data.data?.results ||
          response.data.data ||
          []
        );
      }
      return [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Location search failed."
      );
    }
  }
);

/**
 * Async Thunk: Fetch saved User Kundli / Birth Chart
 * Reads chart by ID or calculates from primary birth details via backend
 * Endpoints:
 * 1. GET /api/v1/vedic/chart/:chartId
 * 2. POST /api/v1/vedic/horoscope
 */
export const fetchUserChart = createAsyncThunk(
  "calculators/fetchUserChart",
  async ({ chartId, birthDetails } = {}, { rejectWithValue }) => {
    try {
      // 1. If chartId exists, fetch from /vedic/chart/:chartId
      if (chartId) {
        try {
          const response = await apiClient.get(`/vedic/chart/${chartId}`);
          if (response.data && response.data.success && response.data.data) {
            const raw = response.data.data;
            return normalizeHoroscopeData(raw, birthDetails);
          }
        } catch (chartErr) {
          console.warn(
            "Direct chartId lookup failed, attempting horoscope calculation:",
            chartErr?.message
          );
        }
      }

      // 2. If chartId missing or failed, compute via /vedic/horoscope
      if (birthDetails) {
        const lat =
          birthDetails.latitude ??
          birthDetails.lat ??
          birthDetails.location?.lat;
        const lng =
          birthDetails.longitude ??
          birthDetails.lng ??
          birthDetails.location?.lng;
        const city =
          birthDetails.birthCity ||
          birthDetails.city ||
          birthDetails.location?.city;

        if (lat === undefined || lng === undefined) {
          throw new Error(
            "Birth location coordinates missing. Please complete your profile."
          );
        }

        const tzOffset = Number(
          birthDetails.timezone ??
          birthDetails.timezoneOffset ??
          birthDetails.location?.timezoneOffset ??
          5.5
        );

        const payload = {
          name: birthDetails.fullName || birthDetails.name || "User",
          gender: (birthDetails.gender || "female").toLowerCase(),
          dob: birthDetails.dateOfBirth || birthDetails.dob,
          tob: birthDetails.isTimeUnknown
            ? "12:00:00"
            : birthDetails.timeOfBirth || birthDetails.tob || "12:00",
          isTimeUnknown: Boolean(birthDetails.isTimeUnknown),
          location: {
            city: city || "Location",
            lat: Number(lat),
            lng: Number(lng),
            timezoneOffset: tzOffset,
            timezone: tzOffset,
          },
        };

        const response = await apiClient.post("/vedic/horoscope", payload);
        if (response.data && response.data.success) {
          const raw = response.data.data;
          return normalizeHoroscopeData(raw, {
            ...payload,
            chartId: raw.chartId,
          });
        }
      }

      return rejectWithValue("No birth chart details available.");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to load birth chart.";
      return rejectWithValue(message);
    }
  }
);

/**
 * Normalizes Saturn Timeline / Sade Sati data
 */
export function normalizeSaturnTimeline(raw = {}, fallbackInput = {}) {
  const data = raw.data || raw;
  const timeline = data.saturn_timeline || data.saturnTimeline || data;
  const sadeSati = timeline.sadeSati || timeline.sade_sati || {};
  const signBased = sadeSati.signBased || sadeSati.sign_based || {};
  const degreeBased = sadeSati.degreeBased || sadeSati.degree_based || {};
  const cyclePhases = sadeSati.cycle?.phases || [];

  const moonSign = timeline.moonSign || timeline.moon_sign || fallbackInput.moonSign || "—";
  const moonDegree = timeline.moonDegree || timeline.moon_degree || 0;

  const today = new Date().toISOString().split("T")[0];
  const p1 = signBased.phase1 || signBased.phase_1 || cyclePhases[0] || {};
  const p2 = signBased.phase2 || signBased.phase_2 || cyclePhases[1] || {};
  const p3 = signBased.phase3 || signBased.phase_3 || cyclePhases[2] || {};

  const phases = [
    {
      phaseNumber: 1,
      name: "Phase 1: Rising Phase (12th from Moon)",
      shortName: "Rising Phase",
      house: p1.house || "12th House",
      sign: p1.sign || "—",
      startDate: typeof p1.startDate === "string" ? p1.startDate : (p1.start_date || p1.from || "—"),
      endDate: typeof p1.endDate === "string" ? p1.endDate : (p1.end_date || p1.to || "—"),
      description: "Saturn crosses the sign immediately preceding your natal Moon. Financial restructuring, foreign travel, and internal contemplation are emphasized.",
      isActive: Boolean(p1.is_active || (p1.startDate && p1.endDate && typeof p1.startDate === "string" && typeof p1.endDate === "string" && today >= p1.startDate && today <= p1.endDate)),
    },
    {
      phaseNumber: 2,
      name: "Phase 2: Peak Phase / Janma Shani (Over Natal Moon)",
      shortName: "Peak Phase (Janma Shani)",
      house: p2.house || "1st House / Natal Moon",
      sign: p2.sign || moonSign,
      startDate: typeof p2.startDate === "string" ? p2.startDate : (p2.start_date || p2.from || "—"),
      endDate: typeof p2.endDate === "string" ? p2.endDate : (p2.end_date || p2.to || "—"),
      description: "Saturn transits directly over your natal Moon sign. Core period of profound karmic maturity, psychological resilience, and major career restructuring.",
      isActive: Boolean(p2.is_active || (p2.startDate && p2.endDate && typeof p2.startDate === "string" && typeof p2.endDate === "string" && today >= p2.startDate && today <= p2.endDate)),
    },
    {
      phaseNumber: 3,
      name: "Phase 3: Setting Phase (2nd from Moon)",
      shortName: "Setting Phase",
      house: p3.house || "2nd House",
      sign: p3.sign || "—",
      startDate: typeof p3.startDate === "string" ? p3.startDate : (p3.start_date || p3.from || "—"),
      endDate: typeof p3.endDate === "string" ? p3.endDate : (p3.end_date || p3.to || "—"),
      description: "Saturn moves into the 2nd sign from Moon. Focus shifts to financial recovery, family speech, and consolidating the wisdom earned during the cycle.",
      isActive: Boolean(p3.is_active || (p3.startDate && p3.endDate && typeof p3.startDate === "string" && typeof p3.endDate === "string" && today >= p3.startDate && today <= p3.endDate)),
    },
  ];

  const activePhase = phases.find((p) => p.isActive);
  const isSadeSatiActive = Boolean(sadeSati.active ?? sadeSati.isActive ?? sadeSati.is_active ?? activePhase);

  // Safely format nextCycle (which may be an object {startDate, endDate})
  let formattedNextCycle = "—";
  if (typeof timeline.nextCycle === "string") {
    formattedNextCycle = timeline.nextCycle;
  } else if (timeline.nextCycle && typeof timeline.nextCycle === "object") {
    if (timeline.nextCycle.startDate && timeline.nextCycle.endDate) {
      formattedNextCycle = `${timeline.nextCycle.startDate} to ${timeline.nextCycle.endDate}`;
    }
  }

  return {
    moonSign,
    moonDegree,
    isSadeSatiActive,
    currentPhase: activePhase ? activePhase.shortName : (isSadeSatiActive ? "Sade Sati Active" : "No Active Sade Sati"),
    phases,
    degreeBased,
    dhaiyya: timeline.dhaiyya || timeline.small_panoti || {},
    nextCycle: formattedNextCycle,
    computedAt: new Date().toISOString(),
  };
}

/**
 * Async Thunk: Calculate Shani Sade Sati & Saturn Timeline
 * Endpoint: POST /api/v1/vedic/saturn-timeline
 */
export const calculateSaturnTimeline = createAsyncThunk(
  "calculators/calculateSaturnTimeline",
  async (payload, { rejectWithValue }) => {
    try {
      const formatTime = (time, isUnknown) => {
        if (isUnknown) return "12:00:00";
        if (!time) return "12:00:00";
        const trimmed = String(time).trim();
        return trimmed.length === 5 ? `${trimmed}:00` : trimmed;
      };

      const requestBody = {
        date: String(payload.dob || payload.date).trim(),
        time: formatTime(payload.tob || payload.time, payload.isTimeUnknown),
        latitude: Number(payload.lat ?? payload.latitude ?? payload.location?.lat),
        longitude: Number(payload.lng ?? payload.longitude ?? payload.location?.lng),
        timezone: Number(payload.timezoneOffset ?? payload.timezone ?? 5.5),
        place: String(payload.city || payload.place || payload.location?.city || "New Delhi").trim(),
      };

      const response = await apiClient.post("/vedic/saturn-timeline", requestBody);
      if (response.data && response.data.success) {
        return normalizeSaturnTimeline(response.data.data, payload);
      }
      return rejectWithValue(response.data?.message || "Failed to calculate Saturn timeline.");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Saturn timeline service temporarily unavailable.";
      return rejectWithValue(message);
    }
  }
);

