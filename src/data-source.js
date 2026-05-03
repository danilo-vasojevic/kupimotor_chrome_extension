// Data source module - handles motorcycle data fetching and searching

// Motorcycle type mapping from API types to kupimotor.rs form values
const TYPE_MAPPING = {
  'naked': 'Naked',
  'sport': 'Sport',
  'touring': 'SportTouring',
  'adventure': 'AdventureRoad',
  'cruiser': 'Cruiser',
  'scooter': 'Scooter',
  'moped': 'Moped',
  'atv': 'ATVQuad',
  'enduro': 'Enduro',
  'motocross': 'Motocross',
  'supermoto': 'Supermoto',
  'retro': 'RetroClassic',
  'classic': 'RetroClassic',
  'cafe': 'CafeRacer',
  'custom': 'ChopperCustom',
  'chopper': 'ChopperCustom',
};

// Engine type mapping
const ENGINE_TYPE_MAPPING = {
  'single': 'Mono',
  'parallel twin': 'ParallelTwin',
  'v-twin': 'VTwin',
  'v twin': 'VTwin',
  'l-twin': 'LTwin',
  'inline-four': 'InlineFour',
  'inline four': 'InlineFour',
  'v4': 'V4',
  'boxer': 'Boxer',
  'triple': 'Triple',
};

// Cooling type mapping
const COOLING_TYPE_MAPPING = {
  'air': 'Air',
  'liquid': 'Liquid',
  'water': 'Liquid',
  'oil': 'Oil',
};

// Drive type mapping (transmission)
const DRIVE_TYPE_MAPPING = {
  'chain': 'Chain',
  'belt': 'Belt',
  'cardan': 'Cardan',
  'shaft': 'Cardan',
};

// Transmission mapping
const TRANSMISSION_MAPPING = {
  'manual': 'Manual',
  'automatic': 'Automatic',
  'cvt': 'Automatic',
  'dct': 'Manual',
};

/**
 * Normalize a string for comparison
 */
function normalize(str) {
  return str.toLowerCase().trim();
}

/**
 * Search motorcycles by brand, model, and optional year
 */
function searchMotorcycles(brand, model, year = null) {
  const normalizedBrand = normalize(brand);
  const normalizedModel = normalize(model);

  // This will be populated from the actual data source
  // For now, returning empty array - will be filled with DDPC data
  const motorcycles = window.motorcyclesDatabase || [];

  let results = motorcycles.filter(bike => {
    const bikeBrand = normalize(bike.make || '');
    const bikeModel = normalize(bike.model || '');
    
    // Match brand and model (allow partial matches)
    const brandMatches = bikeBrand.includes(normalizedBrand) || normalizedBrand.includes(bikeBrand);
    const modelMatches = bikeModel.includes(normalizedModel) || normalizedModel.includes(bikeModel);

    if (!brandMatches || !modelMatches) {
      return false;
    }

    // If year is specified, filter by year range (allow +/- 1 year tolerance)
    if (year && bike.year) {
      return Math.abs(bike.year - year) <= 1;
    }

    return true;
  });

  // Sort by relevance (exact matches first)
  results.sort((a, b) => {
    const aExact = normalize(a.make) === normalizedBrand && normalize(a.model) === normalizedModel;
    const bExact = normalize(b.make) === normalizedBrand && normalize(b.model) === normalizedModel;
    
    if (aExact !== bExact) {
      return aExact ? -1 : 1;
    }

    // Then sort by year (newer first)
    if (a.year && b.year) {
      return b.year - a.year;
    }

    return 0;
  });

  return results.slice(0, 10); // Return top 10 results
}

/**
 * Map motorcycle data to kupimotor.rs form fields
 */
function mapMotorcycleToFormData(bike) {
  const formData = {
    year: bike.year,
    powerHp: bike.power_hp,
    powerKw: bike.power_kw,
    displacement: bike.displacement_cc,
    cylinders: bike.cylinders,
    weight: bike.weight_kg,
    seatHeight: bike.seat_height_mm,
    consumption: bike.fuel_consumption_l100km,
    transmission: bike.transmission ? mapTransmission(bike.transmission) : null,
    coolingType: bike.cooling_type ? mapCoolingType(bike.cooling_type) : null,
    driveType: bike.drive_type ? mapDriveType(bike.drive_type) : null,
    engineType: bike.engine_type ? mapEngineType(bike.engine_type) : null,
    motorcycleType: bike.type ? mapMotorcycleType(bike.type) : null,
  };

  return formData;
}

function mapMotorcycleType(type) {
  if (!type) return null;
  const normalized = normalize(type);
  return TYPE_MAPPING[normalized] || null;
}

function mapEngineType(type) {
  if (!type) return null;
  const normalized = normalize(type);
  return ENGINE_TYPE_MAPPING[normalized] || null;
}

function mapCoolingType(type) {
  if (!type) return null;
  const normalized = normalize(type);
  return COOLING_TYPE_MAPPING[normalized] || null;
}

function mapDriveType(type) {
  if (!type) return null;
  const normalized = normalize(type);
  return DRIVE_TYPE_MAPPING[normalized] || null;
}

function mapTransmission(type) {
  if (!type) return null;
  const normalized = normalize(type);
  return TRANSMISSION_MAPPING[normalized] || null;
}

// Export functions for use in background.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    searchMotorcycles,
    mapMotorcycleToFormData,
    mapMotorcycleType,
    mapEngineType,
    mapCoolingType,
    mapDriveType,
    mapTransmission,
  };
}
