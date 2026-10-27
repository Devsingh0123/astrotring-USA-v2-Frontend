import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "@/lib/api-client";

/**
 * Normalizes raw marriage match response from Jagannatha Hora engine.
 */
export function normalizeMarriageMatchData(raw = {}, inputPayload = {}) {
  const data = raw.data || raw;

  const summary = data.summary || {};
  const north = data.north_indian || data.northIndian || {};
  const ashtakoota = north.ashtakoota || north.kootas || data.ashtakoota || {};
  const south = data.south_indian || data.southIndian || {};

  const boyProfile = data.boy || {};
  const girlProfile = data.girl || {};

  const boyDosha = data.boy_dosha_data || data.boyDosha || {};
  const girlDosha = data.girl_dosha_data || data.girlDosha || {};

  // Extract score
  const totalScore = Number(
    summary.north_score ??
    north.total_score ??
    north.score ??
    data.totalPoints ??
    0
  );
  const maxScore = Number(
    summary.north_max ??
    north.max_score ??
    north.max ??
    data.maxPoints ??
    36
  );
  const percentage = Number(
    summary.north_percentage ??
    north.percentage ??
    ((totalScore / maxScore) * 100).toFixed(1)
  );

  // Derive rating
  let rating = summary.north_rating || north.rating || "";
  if (!rating) {
    if (totalScore >= 28) rating = "Very Auspicious";
    else if (totalScore >= 18) rating = "Favorable / Recommended";
    else rating = "Inauspicious (Remedies Advised)";
  }

  // Normalize all 8 Kootas with descriptions and weights
  const KOOTA_DEFS = [
    { key: "varna", name: "Varna", max: 1, area: "Spiritual Harmony & Ego Compatibility", desc: "Measures mutual respect and intellectual alignment of spiritual natures." },
    { key: "vashya", name: "Vashya", max: 2, area: "Mutual Attraction & Power Balance", desc: "Assesses emotional dominance, magnetic draw, and cooperative instincts." },
    { key: "tara", name: "Tara (Dina)", max: 3, area: "Destiny, Longevity & Well-being", desc: "Calculated from birth stars to foresee mutual health and destiny synergy." },
    { key: "yoni", name: "Yoni", max: 4, area: "Physical & Biological Intimacy", desc: "Reflects natural animal archetypes, physical attraction, and intimate harmony." },
    { key: "graha_maitri", name: "Graha Maitri", altKey: "grahaMaitri", max: 5, area: "Psychological Friendship & Mental Outlook", desc: "Examines planetary friendship between Moon sign lords for mutual understanding." },
    { key: "gana", name: "Gana", max: 6, area: "Temperament & Behavioral Chemistry", desc: "Categorizes nature into Deva, Manushya, or Rakshasa for lifestyle compatibility." },
    { key: "bhakoot", name: "Bhakoot", max: 7, area: "Family Welfare, Love & Wealth", desc: "Examines relative Moon placements (avoiding Shadashtaka 6/8 and Dvidvadasha 2/12)." },
    { key: "nadi", name: "Nadi", max: 8, area: "Genetic Health, Vitality & Offspring", desc: "Analyzes physiological doshas (Vata, Pitta, Kapha) to ensure healthy progeny." }
  ];

  const normalizedKootas = KOOTA_DEFS.map((def) => {
    const rawK = ashtakoota[def.key] || ashtakoota[def.altKey] || {};
    const score = Number(rawK.score ?? rawK.points ?? (typeof rawK === "number" ? rawK : 0));
    const kMax = Number(rawK.max ?? rawK.max_points ?? def.max);
    const quality = rawK.quality || (score === kMax ? "Excellent" : score > 0 ? "Moderate" : "Deficient");

    return {
      key: def.key,
      name: def.name,
      area: def.area,
      description: def.desc,
      score,
      max: kMax,
      quality,
      boyValue: rawK.boy || rawK.boy_name || rawK.boyValue || "—",
      girlValue: rawK.girl || rawK.girl_name || rawK.girlValue || "—",
    };
  });

  // Manglik analysis
  const isBoyManglik = Boolean(
    summary.boy_manglik ??
    boyDosha.is_manglik ??
    (boyDosha.mars_dosha > 0)
  );
  const isGirlManglik = Boolean(
    summary.girl_manglik ??
    girlDosha.is_manglik ??
    (girlDosha.mars_dosha > 0)
  );

  const manglikCancellation =
    (isBoyManglik && isGirlManglik) ||
    Boolean(data.mangalDosha?.cancellation);

  // Critical alerts
  const nadiScore = normalizedKootas.find((k) => k.key === "nadi")?.score ?? 0;
  const bhakootScore = normalizedKootas.find((k) => k.key === "bhakoot")?.score ?? 0;

  return {
    summary: {
      totalScore,
      maxScore,
      percentage,
      rating,
      recommendation: data.recommendation || (totalScore >= 18 ? "Marriage is auspicious and supported by Ashtakoota harmony." : "Marriage requires deeper horoscope review and specific dosha remedies."),
      isBoyManglik,
      isGirlManglik,
      manglikCancellation,
      hasNadiDosha: nadiScore === 0,
      hasBhakootDosha: bhakootScore === 0,
    },
    kootas: normalizedKootas,
    partners: {
      boy: {
        name: inputPayload.boy?.name || "Groom",
        rashi: boyProfile.raasi || boyProfile.rashi || boyProfile.sign || "—",
        nakshatra: boyProfile.nakshatra || "—",
        pada: boyProfile.pada || 1,
        lord: boyProfile.nakshatra_lord || boyProfile.ruler || "—",
        marsDoshaScore: boyDosha.mars_dosha || 0,
        isManglik: isBoyManglik,
      },
      girl: {
        name: inputPayload.girl?.name || "Bride",
        rashi: girlProfile.raasi || girlProfile.rashi || girlProfile.sign || "—",
        nakshatra: girlProfile.nakshatra || "—",
        pada: girlProfile.pada || 1,
        lord: girlProfile.nakshatra_lord || girlProfile.ruler || "—",
        marsDoshaScore: girlDosha.mars_dosha || 0,
        isManglik: isGirlManglik,
      },
    },
    southIndian: {
      matchedCount: south.matched_count ?? summary.south_matched ?? 0,
      totalCount: south.total ?? summary.south_total ?? 10,
      rating: south.rating ?? summary.south_rating ?? "—",
    },
    raw: data,
    computedAt: new Date().toISOString(),
  };
}

/**
 * Async Thunk: Calculate Marriage Compatibility (Kundli Milan)
 * Endpoint: POST /api/v1/vedic/marriage-match
 */
export const calculateMarriageMatch = createAsyncThunk(
  "compatibility/calculateMarriageMatch",
  async ({ boy, girl }, { rejectWithValue }) => {
    try {
      const formatTime = (time, isUnknown) => {
        if (isUnknown) return "12:00:00";
        if (!time) return "12:00:00";
        const trimmed = String(time).trim();
        return trimmed.length === 5 ? `${trimmed}:00` : trimmed;
      };

      const payload = {
        boy: {
          date: String(boy.dob).trim(),
          time: formatTime(boy.tob, boy.isTimeUnknown),
          latitude: Number(boy.lat),
          longitude: Number(boy.lng),
          timezone: Number(boy.timezone ?? 5.5),
          place: String(boy.city || "New Delhi").trim(),
        },
        girl: {
          date: String(girl.dob).trim(),
          time: formatTime(girl.tob, girl.isTimeUnknown),
          latitude: Number(girl.lat),
          longitude: Number(girl.lng),
          timezone: Number(girl.timezone ?? 5.5),
          place: String(girl.city || "Mumbai").trim(),
        },
      };

      const response = await apiClient.post("/vedic/marriage-match", payload);

      if (response.data && response.data.success) {
        const normalized = normalizeMarriageMatchData(response.data.data, {
          boy,
          girl,
        });

        // Cache last calculation in local storage
        try {
          localStorage.setItem(
            "astrotring_last_compatibility",
            JSON.stringify({
              input: { boy, girl },
              data: normalized,
              timestamp: new Date().toISOString(),
            })
          );
        } catch {
          // Ignore local storage error
        }

        return normalized;
      }

      return rejectWithValue(
        response.data?.message || "Failed to calculate marriage compatibility."
      );
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Marriage matching service temporarily unavailable. Please verify coordinates and try again.";
      return rejectWithValue(message);
    }
  }
);
