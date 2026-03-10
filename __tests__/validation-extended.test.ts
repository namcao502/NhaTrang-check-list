/**
 * Extended tests for lib/validation.ts
 *
 * Covers type guards not tested in validation.test.ts:
 * - isValidTemplate / isValidTemplates
 * - isValidTripHistory (and internal isValidArchivedTrip)
 * - isValidDismissedSuggestions
 * - isValidDestination
 * - isValidWeatherCache
 * - Item quantity validation in isValidCategories
 */

import {
  isValidCategories,
  isValidTemplate,
  isValidTemplates,
  isValidTripHistory,
  isValidDismissedSuggestions,
  isValidDestination,
  isValidWeatherCache,
} from "@/lib/validation";

// ---------------------------------------------------------------------------
// Item quantity validation (via isValidCategories)
// ---------------------------------------------------------------------------

describe("isValidCategories — item quantity field", () => {
  const baseItem = { id: "i1", label: "Towel", checked: false };
  const wrapInCategory = (item: Record<string, unknown>) => [
    { id: "c1", name: "Cat", items: [item] },
  ];

  it("accepts an item without a quantity field", () => {
    expect(isValidCategories(wrapInCategory(baseItem))).toBe(true);
  });

  it("accepts an item with quantity = 1", () => {
    expect(isValidCategories(wrapInCategory({ ...baseItem, quantity: 1 }))).toBe(true);
  });

  it("accepts an item with quantity = 5", () => {
    expect(isValidCategories(wrapInCategory({ ...baseItem, quantity: 5 }))).toBe(true);
  });

  it("rejects an item with quantity = 0", () => {
    expect(isValidCategories(wrapInCategory({ ...baseItem, quantity: 0 }))).toBe(false);
  });

  it("rejects an item with negative quantity", () => {
    expect(isValidCategories(wrapInCategory({ ...baseItem, quantity: -1 }))).toBe(false);
  });

  it("rejects an item with non-integer quantity", () => {
    expect(isValidCategories(wrapInCategory({ ...baseItem, quantity: 1.5 }))).toBe(false);
  });

  it("rejects an item with string quantity", () => {
    expect(isValidCategories(wrapInCategory({ ...baseItem, quantity: "2" }))).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isValidTemplate
// ---------------------------------------------------------------------------

describe("isValidTemplate", () => {
  const validTemplate = {
    id: "t1",
    name: "Beach Trip",
    createdAt: "2025-06-01T00:00:00Z",
    categories: [{ id: "c1", name: "Essentials", items: [] }],
  };

  it("accepts a valid template", () => {
    expect(isValidTemplate(validTemplate)).toBe(true);
  });

  it("rejects null", () => {
    expect(isValidTemplate(null)).toBe(false);
  });

  it("rejects undefined", () => {
    expect(isValidTemplate(undefined)).toBe(false);
  });

  it("rejects a primitive", () => {
    expect(isValidTemplate("string")).toBe(false);
  });

  it("rejects a template missing id", () => {
    const { id: _, ...rest } = validTemplate;
    expect(isValidTemplate(rest)).toBe(false);
  });

  it("rejects a template missing name", () => {
    const { name: _, ...rest } = validTemplate;
    expect(isValidTemplate(rest)).toBe(false);
  });

  it("rejects a template missing createdAt", () => {
    const { createdAt: _, ...rest } = validTemplate;
    expect(isValidTemplate(rest)).toBe(false);
  });

  it("rejects a template with invalid categories", () => {
    expect(isValidTemplate({ ...validTemplate, categories: "not-array" })).toBe(false);
  });

  it("rejects a template with numeric id", () => {
    expect(isValidTemplate({ ...validTemplate, id: 123 })).toBe(false);
  });

  it("rejects a template with numeric name", () => {
    expect(isValidTemplate({ ...validTemplate, name: 456 })).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isValidTemplates
// ---------------------------------------------------------------------------

describe("isValidTemplates", () => {
  const validTemplate = {
    id: "t1",
    name: "Beach Trip",
    createdAt: "2025-06-01T00:00:00Z",
    categories: [],
  };

  it("accepts an empty array", () => {
    expect(isValidTemplates([])).toBe(true);
  });

  it("accepts an array of valid templates", () => {
    expect(isValidTemplates([validTemplate])).toBe(true);
  });

  it("rejects non-array", () => {
    expect(isValidTemplates("not-array")).toBe(false);
  });

  it("rejects null", () => {
    expect(isValidTemplates(null)).toBe(false);
  });

  it("rejects an array with one invalid template", () => {
    expect(isValidTemplates([validTemplate, { id: 123 }])).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isValidTripHistory (validates ArchivedTrip[])
// ---------------------------------------------------------------------------

describe("isValidTripHistory", () => {
  const validTrip = {
    id: "trip-1",
    name: "Nha Trang 2025",
    date: "2025-06-01",
    checkedCount: 10,
    totalCount: 20,
    categories: [{ id: "c1", name: "Essentials", items: [] }],
  };

  it("accepts an empty array", () => {
    expect(isValidTripHistory([])).toBe(true);
  });

  it("accepts an array with a valid archived trip", () => {
    expect(isValidTripHistory([validTrip])).toBe(true);
  });

  it("rejects non-array", () => {
    expect(isValidTripHistory("not-array")).toBe(false);
  });

  it("rejects null", () => {
    expect(isValidTripHistory(null)).toBe(false);
  });

  it("rejects a trip missing id", () => {
    const { id: _, ...rest } = validTrip;
    expect(isValidTripHistory([rest])).toBe(false);
  });

  it("rejects a trip missing name", () => {
    const { name: _, ...rest } = validTrip;
    expect(isValidTripHistory([rest])).toBe(false);
  });

  it("rejects a trip missing date", () => {
    const { date: _, ...rest } = validTrip;
    expect(isValidTripHistory([rest])).toBe(false);
  });

  it("rejects a trip with non-integer checkedCount", () => {
    expect(isValidTripHistory([{ ...validTrip, checkedCount: 1.5 }])).toBe(false);
  });

  it("rejects a trip with negative checkedCount", () => {
    expect(isValidTripHistory([{ ...validTrip, checkedCount: -1 }])).toBe(false);
  });

  it("rejects a trip with non-integer totalCount", () => {
    expect(isValidTripHistory([{ ...validTrip, totalCount: 2.5 }])).toBe(false);
  });

  it("rejects a trip with negative totalCount", () => {
    expect(isValidTripHistory([{ ...validTrip, totalCount: -1 }])).toBe(false);
  });

  it("rejects a trip with string checkedCount", () => {
    expect(isValidTripHistory([{ ...validTrip, checkedCount: "10" }])).toBe(false);
  });

  it("rejects a trip with invalid categories", () => {
    expect(isValidTripHistory([{ ...validTrip, categories: "bad" }])).toBe(false);
  });

  it("rejects a trip that is null", () => {
    expect(isValidTripHistory([null])).toBe(false);
  });

  it("rejects a trip that is a primitive", () => {
    expect(isValidTripHistory(["string"])).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isValidDismissedSuggestions
// ---------------------------------------------------------------------------

describe("isValidDismissedSuggestions", () => {
  it("accepts an empty array", () => {
    expect(isValidDismissedSuggestions([])).toBe(true);
  });

  it("accepts a valid string array", () => {
    expect(isValidDismissedSuggestions(["suggestion-1", "suggestion-2"])).toBe(true);
  });

  it("rejects non-array", () => {
    expect(isValidDismissedSuggestions("string")).toBe(false);
  });

  it("rejects null", () => {
    expect(isValidDismissedSuggestions(null)).toBe(false);
  });

  it("rejects an array with non-string elements", () => {
    expect(isValidDismissedSuggestions([123])).toBe(false);
    expect(isValidDismissedSuggestions([true])).toBe(false);
    expect(isValidDismissedSuggestions([null])).toBe(false);
  });

  it("rejects a mixed array", () => {
    expect(isValidDismissedSuggestions(["valid", 42])).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isValidDestination
// ---------------------------------------------------------------------------

describe("isValidDestination", () => {
  const validDest = { name: "Nha Trang", lat: 12.238, lon: 109.196 };

  it("accepts a valid destination", () => {
    expect(isValidDestination(validDest)).toBe(true);
  });

  it("rejects null", () => {
    expect(isValidDestination(null)).toBe(false);
  });

  it("rejects undefined", () => {
    expect(isValidDestination(undefined)).toBe(false);
  });

  it("rejects a primitive", () => {
    expect(isValidDestination("string")).toBe(false);
  });

  it("rejects a destination with empty name", () => {
    expect(isValidDestination({ ...validDest, name: "" })).toBe(false);
  });

  it("rejects a destination missing name", () => {
    const { name: _, ...rest } = validDest;
    expect(isValidDestination(rest)).toBe(false);
  });

  it("rejects a destination with non-number lat", () => {
    expect(isValidDestination({ ...validDest, lat: "12" })).toBe(false);
  });

  it("rejects a destination with non-number lon", () => {
    expect(isValidDestination({ ...validDest, lon: "109" })).toBe(false);
  });

  it("rejects latitude below -90", () => {
    expect(isValidDestination({ ...validDest, lat: -91 })).toBe(false);
  });

  it("rejects latitude above 90", () => {
    expect(isValidDestination({ ...validDest, lat: 91 })).toBe(false);
  });

  it("rejects longitude below -180", () => {
    expect(isValidDestination({ ...validDest, lon: -181 })).toBe(false);
  });

  it("rejects longitude above 180", () => {
    expect(isValidDestination({ ...validDest, lon: 181 })).toBe(false);
  });

  it("accepts boundary latitude values (-90 and 90)", () => {
    expect(isValidDestination({ ...validDest, lat: -90 })).toBe(true);
    expect(isValidDestination({ ...validDest, lat: 90 })).toBe(true);
  });

  it("accepts boundary longitude values (-180 and 180)", () => {
    expect(isValidDestination({ ...validDest, lon: -180 })).toBe(true);
    expect(isValidDestination({ ...validDest, lon: 180 })).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// isValidWeatherCache
// ---------------------------------------------------------------------------

describe("isValidWeatherCache", () => {
  const validCache = {
    lat: 12.238,
    lon: 109.196,
    date: "2025-06-01",
    timestamp: 1717200000000,
    data: {
      temperature_max: 33,
      temperature_min: 25,
      weathercode: 1,
      rain_probability: 20,
    },
  };

  it("accepts a valid weather cache", () => {
    expect(isValidWeatherCache(validCache)).toBe(true);
  });

  it("rejects null", () => {
    expect(isValidWeatherCache(null)).toBe(false);
  });

  it("rejects undefined", () => {
    expect(isValidWeatherCache(undefined)).toBe(false);
  });

  it("rejects a primitive", () => {
    expect(isValidWeatherCache("string")).toBe(false);
  });

  it("rejects when lat is missing", () => {
    const { lat: _, ...rest } = validCache;
    expect(isValidWeatherCache(rest)).toBe(false);
  });

  it("rejects when lon is missing", () => {
    const { lon: _, ...rest } = validCache;
    expect(isValidWeatherCache(rest)).toBe(false);
  });

  it("rejects when date is missing", () => {
    const { date: _, ...rest } = validCache;
    expect(isValidWeatherCache(rest)).toBe(false);
  });

  it("rejects when timestamp is missing", () => {
    const { timestamp: _, ...rest } = validCache;
    expect(isValidWeatherCache(rest)).toBe(false);
  });

  it("rejects when data is null", () => {
    expect(isValidWeatherCache({ ...validCache, data: null })).toBe(false);
  });

  it("rejects when data is a string", () => {
    expect(isValidWeatherCache({ ...validCache, data: "bad" })).toBe(false);
  });

  it("rejects when data is missing temperature_max", () => {
    const { temperature_max: _, ...restData } = validCache.data;
    expect(isValidWeatherCache({ ...validCache, data: restData })).toBe(false);
  });

  it("rejects when data is missing temperature_min", () => {
    const { temperature_min: _, ...restData } = validCache.data;
    expect(isValidWeatherCache({ ...validCache, data: restData })).toBe(false);
  });

  it("rejects when data is missing weathercode", () => {
    const { weathercode: _, ...restData } = validCache.data;
    expect(isValidWeatherCache({ ...validCache, data: restData })).toBe(false);
  });

  it("rejects when data is missing rain_probability", () => {
    const { rain_probability: _, ...restData } = validCache.data;
    expect(isValidWeatherCache({ ...validCache, data: restData })).toBe(false);
  });

  it("rejects when data fields are strings instead of numbers", () => {
    expect(
      isValidWeatherCache({
        ...validCache,
        data: { ...validCache.data, temperature_max: "33" },
      })
    ).toBe(false);
  });

  it("rejects when lat is a string", () => {
    expect(isValidWeatherCache({ ...validCache, lat: "12" })).toBe(false);
  });

  it("rejects when timestamp is a string", () => {
    expect(isValidWeatherCache({ ...validCache, timestamp: "12345" })).toBe(false);
  });

  it("rejects when date is a number", () => {
    expect(isValidWeatherCache({ ...validCache, date: 12345 })).toBe(false);
  });
});
