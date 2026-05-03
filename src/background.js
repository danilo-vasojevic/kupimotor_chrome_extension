// Background Service Worker - handles live motorcycle searches only

function normalize(str) {
  return String(str || '').toLowerCase().trim();
}

function normalizeLoose(str) {
  return normalize(str).replace(/[^a-z0-9]/g, '');
}

function tokenizeLoose(str) {
  return normalize(str)
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

const TYPE_MAPPINGS = {
  transmission: {
    manual: 'Manual',
    automatic: 'Automatic',
    cvt: 'Automatic',
    dct: 'Manual',
  },
  coolingType: {
    air: 'Air',
    liquid: 'Liquid',
    water: 'Liquid',
    oil: 'Oil',
  },
  driveType: {
    chain: 'Chain',
    belt: 'Belt',
    cardan: 'Cardan',
    shaft: 'Cardan',
  },
  engineType: {
    single: 'Mono',
    'parallel twin': 'ParallelTwin',
    'v-twin': 'VTwin',
    'v twin': 'VTwin',
    'l-twin': 'LTwin',
    'inline-four': 'InlineFour',
    'inline four': 'InlineFour',
    v4: 'V4',
    boxer: 'Boxer',
    triple: 'Triple',
  },
  motorcycleType: {
    naked: 'Naked',
    sport: 'Sport',
    touring: 'SportTouring',
    adventure: 'AdventureRoad',
    'adventure road': 'AdventureRoad',
    'adventure offroad': 'AdventureOffroad',
    cruiser: 'Cruiser',
    scooter: 'Scooter',
    moped: 'Moped',
    atv: 'ATVQuad',
    enduro: 'Enduro',
    motocross: 'Motocross',
    supermoto: 'Supermoto',
    retro: 'RetroClassic',
    classic: 'RetroClassic',
    cafe: 'CafeRacer',
    custom: 'ChopperCustom',
    chopper: 'ChopperCustom',
    scrambler: 'Scrambler',
  },
};

function mapValue(type, value) {
  if (!value) {
    return null;
  }

  const normalized = normalize(value);
  const mapped = TYPE_MAPPINGS[type]?.[normalized];
  if (mapped) {
    return mapped;
  }

  const directMatch = Object.values(TYPE_MAPPINGS[type] || {}).find((item) => item === value);
  return directMatch || null;
}

function mapMotorcycleToFormData(bike) {
  return {
    make: bike.make,
    model: bike.model,
    year: bike.year,
    powerHp: bike.power_hp,
    powerKw: bike.power_kw,
    displacement: bike.displacement_cc,
    cylinders: bike.cylinders,
    weight: bike.weight_kg,
    seatHeight: bike.seat_height_mm,
    consumption: bike.fuel_consumption_l100km,
    transmission: mapValue('transmission', bike.transmission),
    coolingType: mapValue('coolingType', bike.cooling_type),
    driveType: mapValue('driveType', bike.drive_type),
    engineType: mapValue('engineType', bike.engine_type),
    motorcycleType: mapValue('motorcycleType', bike.type),
  };
}

function stripTags(html) {
  return String(html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function parseSpecRows(html) {
  const rows = [];
  const rowRegex = /<tr[^>]*>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<\/tr>/gi;
  let match;

  while ((match = rowRegex.exec(String(html || '')))) {
    const label = stripTags(match[1]).replace(/\s*:\s*$/, '').trim();
    const value = stripTags(match[2]).trim();
    if (label && value) {
      rows.push({
        label: normalize(label),
        value,
      });
    }
  }

  return rows;
}

function textOf(html, ...labels) {
  const rows = parseSpecRows(html);

  for (const label of labels) {
    const wanted = normalize(label);
    const row = rows.find((item) => item.label === wanted || item.label.includes(wanted));
    if (row) {
      return row.value;
    }
  }

  return null;
}

function extractStructuredValue(html, path) {
  const escapedPath = path
    .split('.')
    .map((segment) => `"${segment}"\\s*:\\s*`)
    .join('[\\s\\S]*?');
  const regex = new RegExp(`${escapedPath}(?:"([^"]+)"|(-?\\d+(?:\\.\\d+)?))`, 'i');
  const match = String(html || '').match(regex);
  return match ? (match[1] ?? match[2]) : null;
}

function extractBikezStructuredData(html) {
  return {
    category: extractStructuredValue(html, 'category') || extractStructuredValue(html, 'bodyType'),
    displacementCc: numberFromText(extractStructuredValue(html, 'vehicleEngine.engineDisplacement.value')),
    powerHp: numberFromText(extractStructuredValue(html, 'vehicleEngine.enginePower.value')),
    weightKg: numberFromText(extractStructuredValue(html, 'weight.value')),
    fuelConsumption: numberFromText(extractStructuredValue(html, 'fuelConsumption.value')),
  };
}

function numberFromText(value) {
  if (!value) {
    return null;
  }

  const match = String(value).replace(',', '.').match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function inferType(rawType) {
  const value = normalize(rawType);
  if (value.includes('adventure') && value.includes('off')) return 'adventure offroad';
  if (value.includes('adventure')) return 'adventure';
  if (value.includes('sport touring')) return 'touring';
  if (value.includes('touring')) return 'touring';
  if (value.includes('naked') || value.includes('roadster')) return 'naked';
  if (value.includes('sport')) return 'sport';
  if (value.includes('scrambler')) return 'scrambler';
  if (value.includes('cruiser')) return 'cruiser';
  if (value.includes('chopper')) return 'chopper';
  if (value.includes('classic') || value.includes('retro')) return 'retro';
  if (value.includes('cafe')) return 'cafe';
  if (value.includes('scooter')) return 'scooter';
  if (value.includes('enduro')) return 'enduro';
  if (value.includes('motocross')) return 'motocross';
  if (value.includes('super motard') || value.includes('supermoto')) return 'supermoto';
  return null;
}

function inferCooling(engineText) {
  const value = normalize(engineText);
  if (value.includes('liquid') || value.includes('water')) return 'liquid';
  if (value.includes('oil')) return 'oil';
  if (value.includes('air')) return 'air';
  return null;
}

function inferDrive(raw) {
  const value = normalize(raw);
  if (value.includes('chain')) return 'chain';
  if (value.includes('belt')) return 'belt';
  if (value.includes('shaft') || value.includes('cardan')) return 'cardan';
  return null;
}

function inferEngineType(engineText, cylinders) {
  const value = normalize(engineText);
  const loose = normalizeLoose(engineText);

  if (value.includes('parallel twin') || value.includes('parallel-twin') || value.includes('inline twin') || value.includes('in-line twin')) return 'parallel twin';
  if (value.includes('v-twin') || value.includes('v twin') || /\bv\s*2\b/.test(value) || loose.includes('vtwin')) return 'v-twin';
  if (value.includes('l-twin') || value.includes('l twin') || /\bl\s*2\b/.test(value) || loose.includes('ltwin')) return 'l-twin';
  if (value.includes('in-line three') || value.includes('inline three') || value.includes('inline-three') || value.includes('three-cylinder in-line') || value.includes('three cylinder in-line')) return 'triple';
  if (value.includes('in-line four') || value.includes('inline four') || value.includes('inline-four') || value.includes('four-cylinder in-line') || value.includes('four cylinder in-line')) return 'inline four';
  if (value.includes('boxer') || value.includes('flat twin') || value.includes('flat-four') || value.includes('flat four')) return 'boxer';
  if (value.includes('triple') || value.includes('three-cylinder') || value.includes('three cylinder')) return 'triple';
  if (value.includes('v4') || /\bv\s*4\b/.test(value)) return 'v4';
  if (cylinders === 1) return 'single';
  return null;
}

function inferCylinderCount(engineText) {
  const value = normalize(engineText);
  const loose = normalizeLoose(engineText);

  if (!value) {
    return null;
  }

  if (value.includes('single') || value.includes('mono') || loose.includes('singlecylinder') || loose.includes('1cylinder')) return 1;
  if (
    value.includes('twin') ||
    value.includes('two-cylinder') ||
    value.includes('two cylinder') ||
    loose.includes('2cylinder') ||
    /\b[vl]\s*2\b/.test(value) ||
    value.includes('boxer twin') ||
    value.includes('flat twin')
  ) return 2;
  if (value.includes('triple') || value.includes('three-cylinder') || value.includes('three cylinder') || loose.includes('3cylinder') || value.includes('inline three') || value.includes('in-line three')) return 3;
  if (
    value.includes('inline four') ||
    value.includes('inline-four') ||
    value.includes('four-cylinder') ||
    value.includes('four cylinder') ||
    loose.includes('4cylinder') ||
    value.includes('flat four') ||
    value.includes('boxer four') ||
    value.includes('v4') ||
    /\bv\s*4\b/.test(value)
  ) return 4;

  return null;
}

async function fetchBikezSearchPage(brand) {
  const normalizedBrand = normalize(brand).replace(/\s+/g, '-');
  const urls = [
    `https://bikez.com/brand/${encodeURIComponent(normalizedBrand)}_motorcycles.php`,
    `https://www.bikez.com/brand/${encodeURIComponent(normalizedBrand)}_motorcycles.php`,
  ];

  let lastError = null;
  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Bikez brand fetch failed: ${response.status}`);
      }

      return await response.text();
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Bikez brand fetch failed');
}

function resolveBikezUrl(href, baseUrl) {
  try {
    return new URL(href, baseUrl).toString();
  } catch (error) {
    return null;
  }
}

function extractYearFromBikezUrl(url) {
  const match = String(url || '').match(/_(19|20)\d{2}\.php$/i);
  return match ? Number(match[0].slice(1, 5)) : null;
}

function formatBikezSlugToken(token) {
  if (!token) {
    return '';
  }

  if (/\d/.test(token) || token.length <= 3) {
    return token.toUpperCase();
  }

  return token.charAt(0).toUpperCase() + token.slice(1);
}

function extractCanonicalNamesFromUrl(sourceUrl, fallbackMake, fallbackModel) {
  const match = String(sourceUrl || '').match(/\/motorcycles\/([^/?#]+)\.php$/i);
  if (!match) {
    return {
      make: fallbackMake,
      model: fallbackModel,
    };
  }

  const makeTokens = tokenizeLoose(fallbackMake);
  const slugTokens = match[1]
    .split('_')
    .filter(Boolean)
    .filter((token) => !/^(19|20)\d{2}$/i.test(token));

  let modelTokens = slugTokens;
  if (makeTokens.length && makeTokens.every((token, index) => slugTokens[index] === token)) {
    modelTokens = slugTokens.slice(makeTokens.length);
  }

  if (!modelTokens.length) {
    return {
      make: fallbackMake,
      model: fallbackModel,
    };
  }

  return {
    make: fallbackMake,
    model: modelTokens.map(formatBikezSlugToken).join(' '),
  };
}

async function fetchBikezYearPage(year) {
  if (!year) {
    return null;
  }

  const urls = [
    `https://bikez.com/year/${year}-motorcycle-models.php`,
    `https://www.bikez.com/year/${year}-motorcycle-models.php`,
  ];

  let lastError = null;
  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Bikez year fetch failed: ${response.status}`);
      }

      return await response.text();
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Bikez year fetch failed');
}

function extractBikezPaginationUrls(searchHtml, pageUrl) {
  const hrefRegex = /href="([^"]+)"/gi;
  const urls = new Set();

  let match;
  while ((match = hrefRegex.exec(searchHtml))) {
    const href = match[1];
    if (!/\?page=\d+/i.test(href) && !/brand\/.*_motorcycles\.php/i.test(href)) {
      continue;
    }

    const absoluteHref = resolveBikezUrl(href, pageUrl);
    if (!absoluteHref || !/brand\/.*_motorcycles\.php/i.test(absoluteHref)) {
      continue;
    }

    urls.add(absoluteHref);
  }

  return Array.from(urls);
}

function extractBikezModelCandidates(searchHtml, pageUrl, brand, model, year) {
  const hrefRegex = /<a[^>]+href="([^"]+\.php)"[^>]*>([\s\S]*?)<\/a>/gi;
  const candidates = [];
  const wantedBrand = normalizeLoose(brand);
  const wantedModel = normalizeLoose(model);
  const wantedBrandTokens = tokenizeLoose(brand);
  const wantedModelTokens = tokenizeLoose(model);
  const wantedYear = year ? String(year) : null;

  let match;
  while ((match = hrefRegex.exec(searchHtml))) {
    const href = match[1];
    const linkText = stripTags(match[2]);
    if (!/\/motorcycles\//i.test(href) && !/^\.\.\/motorcycles\//i.test(href)) {
      continue;
    }

    const textWindow = searchHtml.slice(Math.max(0, match.index - 140), Math.min(searchHtml.length, match.index + 320));
    const plainTextWindow = stripTags(textWindow);
    const normalizedLinkText = normalizeLoose(linkText);
    const linkTokens = tokenizeLoose(linkText);

    const brandMatches =
      normalizedLinkText.includes(wantedBrand) ||
      wantedBrandTokens.every((token) => linkTokens.includes(token));

    const modelMatches =
      normalizedLinkText.includes(wantedModel) ||
      wantedModelTokens.every((token) => linkTokens.includes(token));

    if (!brandMatches || !modelMatches) {
      continue;
    }

    const absoluteHref = resolveBikezUrl(href, pageUrl);
    if (!absoluteHref) {
      continue;
    }

    const urlYear = extractYearFromBikezUrl(absoluteHref);
    const yearMatch = plainTextWindow.match(/\b(19|20)\d{2}\b/);
    const candidateYear = urlYear || (yearMatch ? Number(yearMatch[0]) : null);
    const exactModelMatch = normalizedLinkText === `${wantedBrand}${wantedModel}` || normalizedLinkText.endsWith(wantedModel);
    const score =
      (exactModelMatch ? 100 : 0) +
      wantedModelTokens.filter((token) => linkTokens.includes(token)).length * 10 +
      (candidateYear && wantedYear && String(candidateYear) === wantedYear ? 25 : 0);

    candidates.push({
      url: absoluteHref,
      contextText: `${linkText} ${candidateYear || ''}`.trim(),
      year: candidateYear,
      score,
    });
  }

  if (!candidates.length) {
    return [];
  }

  if (wantedYear) {
    const exactMatches = candidates
      .filter((candidate) => String(candidate.year || '') === wantedYear)
      .sort((left, right) => ((right.score || 0) - (left.score || 0)) || ((right.year || 0) - (left.year || 0)));
    if (exactMatches.length) {
      return exactMatches;
    }
  }

  candidates.sort((left, right) => ((right.score || 0) - (left.score || 0)) || ((right.year || 0) - (left.year || 0)));
  return candidates;
}

function extractCanonicalNames(contextText, fallbackMake, fallbackModel, sourceUrl) {
  const text = String(contextText || '').replace(/\s+/g, ' ').trim();
  const escapedMake = fallbackMake.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const makeRegex = new RegExp(`(${escapedMake})\\s+(.+?)\\s+(19|20)\\d{2}\\b`, 'i');
  const makeMatch = text.match(makeRegex);
  const urlNames = extractCanonicalNamesFromUrl(sourceUrl, fallbackMake, fallbackModel);

  if (makeMatch) {
    const parsedModel = makeMatch[2].trim();
    const urlModelIsMoreSpecific =
      normalizeLoose(urlNames.model).startsWith(normalizeLoose(parsedModel)) &&
      normalizeLoose(urlNames.model) !== normalizeLoose(parsedModel);

    return {
      make: makeMatch[1].trim(),
      model: urlModelIsMoreSpecific ? urlNames.model : parsedModel,
    };
  }

  return urlNames;
}

async function fetchBikezMotorcycles(brand, model, year) {
  const normalizedBrand = normalize(brand).replace(/\s+/g, '_');
  const brandPageUrl = `https://bikez.com/brand/${encodeURIComponent(normalizedBrand)}_motorcycles.php`;
  const brandPage = await fetchBikezSearchPage(brand);
  const pagesToSearch = [{ html: brandPage, url: brandPageUrl }];

  if (year) {
    try {
      const yearPage = await fetchBikezYearPage(year);
      if (yearPage) {
        pagesToSearch.unshift({
          html: yearPage,
          url: `https://bikez.com/year/${year}-motorcycle-models.php`,
        });
      }
    } catch (error) {
      console.warn('Failed to fetch Bikez year page:', error);
    }
  }

  const paginationUrls = extractBikezPaginationUrls(brandPage, brandPageUrl).slice(0, 40);

  for (const url of paginationUrls) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        continue;
      }
      pagesToSearch.push({
        html: await response.text(),
        url,
      });
    } catch (error) {
      console.warn('Failed to fetch Bikez pagination URL:', url, error);
    }
  }

  const matches = [];
  const seenUrls = new Set();

  for (const page of pagesToSearch) {
    const pageMatches = extractBikezModelCandidates(page.html, page.url, brand, model, year);
    for (const match of pageMatches) {
      if (seenUrls.has(match.url)) {
        continue;
      }

      seenUrls.add(match.url);
      matches.push(match);
    }
  }

  if (!matches.length) {
    return [];
  }

  const bikes = await Promise.all(matches.map(async (match) => {
    const response = await fetch(match.url);
    if (!response.ok) {
      throw new Error(`Bikez detail fetch failed: ${response.status}`);
    }

    const html = await response.text();
    const structuredData = extractBikezStructuredData(html);
    const engineText = textOf(html, 'Engine type', 'Type of engine');
    const powerText = textOf(html, 'Power');
    const displacementText = textOf(html, 'Displacement', 'Engine size');
    const weightText = textOf(html, 'Dry weight') || textOf(html, 'Weight incl. oil, gas, etc');
    const seatHeightText = textOf(html, 'Seat height');
    const categoryText = textOf(html, 'Category', 'Type');
    const transmissionText = textOf(html, 'Gearbox');
    const finalDriveText = textOf(html, 'Transmission type, final drive', 'Transmission type');
    const cylindersText = textOf(html, 'Number of cylinders');
    const fuelConsumptionText = textOf(html, 'Fuel consumption');
    const coolingSystemText = textOf(html, 'Cooling system');

    const powerHp = numberFromText(powerText) ?? structuredData.powerHp;
    const powerKw = powerHp ? Number((powerHp * 0.7457).toFixed(1)) : null;
    const displacementCc = numberFromText(displacementText) ?? structuredData.displacementCc;
    const weightKg = numberFromText(weightText) ?? structuredData.weightKg;
    const seatHeightMm = seatHeightText?.toLowerCase().includes('mm')
      ? numberFromText(seatHeightText)
      : (() => {
          const maybeCm = numberFromText(seatHeightText);
          return maybeCm ? Math.round(maybeCm * 10) : null;
        })();
    const cylinders = numberFromText(cylindersText) ?? inferCylinderCount(engineText);
    const fuelConsumption = numberFromText(fuelConsumptionText) ?? structuredData.fuelConsumption;
    const canonicalNames = extractCanonicalNames(match.contextText, brand, model, match.url);

    return {
      make: canonicalNames.make,
      model: canonicalNames.model,
      year: match.year || year || null,
      power_hp: powerHp,
      power_kw: powerKw,
      displacement_cc: displacementCc,
      cylinders,
      weight_kg: weightKg,
      seat_height_mm: seatHeightMm,
      fuel_consumption_l100km: fuelConsumption,
      transmission: transmissionText && normalize(transmissionText).includes('automatic') ? 'automatic' : 'manual',
      cooling_type: inferCooling(`${engineText || ''} ${coolingSystemText || ''}`),
      drive_type: inferDrive(finalDriveText),
      engine_type: inferEngineType(engineText, cylinders),
      type: inferType(categoryText || structuredData.category),
      source: 'bikez',
      source_url: match.url,
    };
  }));

  const dedupedBikes = [];
  const seenBikeKeys = new Set();

  for (const bike of bikes) {
    const bikeKey = [
      normalizeLoose(bike.make),
      normalizeLoose(bike.model),
      bike.year || '',
      bike.power_hp || '',
      bike.displacement_cc || '',
    ].join('|');

    if (seenBikeKeys.has(bikeKey)) {
      continue;
    }

    seenBikeKeys.add(bikeKey);
    dedupedBikes.push(bike);
  }

  dedupedBikes.sort((left, right) => ((right.year || 0) - (left.year || 0)) || left.model.localeCompare(right.model));
  return dedupedBikes;
}

async function searchMotorcycles(brand, model, year = null) {
  const liveBikes = await fetchBikezMotorcycles(brand, model, year);
  if (!liveBikes.length) {
    return [];
  }

  return liveBikes.map((bike) => ({
    ...bike,
    ...mapMotorcycleToFormData(bike),
  }));
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'searchMotorcycles') {
    searchMotorcycles(request.brand, request.model, request.year)
      .then(sendResponse)
      .catch((error) => {
        console.error('Search failed:', error);
        sendResponse([]);
      });

    return true;
  }

  return false;
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  if (tab.url && (tab.url.includes('kupimotor.rs') || tab.url.includes('www.kupimotor.rs'))) {
    chrome.tabs.sendMessage(tab.id, { action: 'togglePanel' }, (response) => {
      if (chrome.runtime.lastError) {
        console.log('Content script not ready:', chrome.runtime.lastError);
      }
    });
  }
});
