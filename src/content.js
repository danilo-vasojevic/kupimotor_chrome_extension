// Content script - injected into kupimotor.rs pages
// Handles form filling and floating search panel

console.warn('[KupiMotor] ===== CONTENT SCRIPT LOADING =====');

// Global state for the panel
let currentBikeData = null;

/**
 * Get current form values from kupimotor.rs
 */
function getFormValues() {
  const brandBtn = Array.from(document.querySelectorAll('button')).find(btn => 
    btn.parentElement?.querySelector('label')?.textContent?.includes('Marka')
  );
  const modelBtn = Array.from(document.querySelectorAll('button')).find(btn => 
    btn.parentElement?.querySelector('label')?.textContent?.includes('Model')
  );
  const yearInput = document.getElementById('year');

  const getMakeFn = () => {
    if (!brandBtn) return '';
    const spans = Array.from(brandBtn.querySelectorAll('span'));
    const span = spans.find(s => s.textContent && s.textContent !== 'Izaberi...' && s.textContent !== 'Izaberite...');
    return span ? span.textContent.trim() : '';
  };

  const getModelFn = () => {
    if (!modelBtn) return '';
    const spans = Array.from(modelBtn.querySelectorAll('span'));
    const span = spans.find(s => s.textContent && s.textContent !== 'Izaberi...' && s.textContent !== 'Izaberite...');
    return span ? span.textContent.trim() : '';
  };

  return {
    make: getMakeFn(),
    model: getModelFn(),
    year: yearInput?.value || ''
  };
}

/**
 * Initialize floating search panel
 */
function initializePanel() {
  console.warn('[KupiMotor] initializePanel() called');
  
  if (document.getElementById('kupimotorPanel')) {
    console.log('[KupiMotor] Panel already initialized');
    return;
  }

  // Inject styles
  const style = document.createElement('style');
  style.textContent = `
    #kupimotorPanel {
      position: fixed;
      bottom: 20px;
      left: 20px;
      width: 360px;
      max-height: 600px;
      background: white;
      border: 2px solid #667eea;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25);
      z-index: 99999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    #kupimotorPanel.hidden {
      display: none !important;
    }

    .kupimotorHeader {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    }

    .kupimotorTitle {
      font-weight: 600;
      font-size: 14px;
      margin: 0;
    }

    .kupimotorCloseBtn {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      width: 28px;
      height: 28px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 18px;
      transition: background 0.2s;
    }

    .kupimotorCloseBtn:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .kupimotorContent {
      overflow-y: auto;
      padding: 16px;
      flex: 1;
    }

    .kupimotorContent::-webkit-scrollbar {
      width: 6px;
    }

    .kupimotorContent::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 10px;
    }

    .kupimotorContent::-webkit-scrollbar-thumb {
      background: #667eea;
      border-radius: 10px;
    }

    .kupimotorFormGroup {
      margin-bottom: 12px;
      display: flex;
      flex-direction: column;
    }

    .kupimotorLabel {
      font-size: 12px;
      font-weight: 600;
      color: #555;
      margin-bottom: 4px;
    }

    .kupimotorInput {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 13px;
      transition: border-color 0.2s;
    }

    .kupimotorInput:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
    }

    .kupimotorInput:read-only {
      background-color: #f5f5f5;
      color: #666;
      cursor: not-allowed;
      border-color: #ddd;
    }

    .kupimotorInput:read-only:focus {
      border-color: #ddd;
      box-shadow: none;
    }

    .kupimotorSearchBtn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      width: 100%;
    }

    .kupimotorSearchBtn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .kupimotorSearchBtn:active {
      transform: translateY(0);
    }

    .kupimotorResults {
      margin-top: 12px;
    }

    .kupimotorResultItem {
      padding: 10px;
      margin-bottom: 8px;
      background: #f5f5f5;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 12px;
    }

    .kupimotorResultItem:hover {
      background: #efefef;
      border-color: #667eea;
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
    }

    .kupimotorResultBrand {
      font-weight: 600;
      color: #667eea;
    }

    .kupimotorDetailsSection {
      margin-bottom: 12px;
      padding-bottom: 10px;
      border-bottom: 1px solid #f0f0f0;
    }

    .kupimotorDetailsSection:last-child {
      border-bottom: none;
      margin-bottom: 0;
    }

    .kupimotorSectionTitle {
      font-size: 11px;
      font-weight: 700;
      color: #667eea;
      text-transform: uppercase;
      margin-bottom: 8px;
      letter-spacing: 0.5px;
    }

    .kupimotorDetailItem {
      margin-bottom: 6px;
      font-size: 12px;
    }

    .kupimotorDetailLabel {
      font-size: 10px;
      font-weight: 600;
      color: #999;
      text-transform: uppercase;
    }

    .kupimotorDetailValue {
      color: #333;
      font-weight: 500;
      padding: 4px 6px;
      background: #fafafa;
      border-radius: 3px;
      border-left: 2px solid #667eea;
    }

    .kupimotorLoading {
      text-align: center;
      color: #999;
      padding: 20px 10px;
      font-size: 13px;
    }

    .kupimotorEmpty {
      text-align: center;
      color: #999;
      padding: 20px 10px;
      font-size: 13px;
    }

    @media (max-width: 768px) {
      #kupimotorPanel {
        width: 300px;
        bottom: 10px;
        left: 10px;
      }
    }
  `;
  document.head.appendChild(style);
  console.warn('[KupiMotor] Styles injected');

  // Create panel HTML
  const panel = document.createElement('div');
  panel.id = 'kupimotorPanel';
  panel.innerHTML = `
    <div class="kupimotorHeader">
      <h3 class="kupimotorTitle">🏍️ Pretraga motora</h3>
      <button class="kupimotorCloseBtn" id="kupimotorCloseBtn">&times;</button>
    </div>
    <div class="kupimotorContent" id="kupimotorContent">
      <div class="kupimotorFormGroup">
        <label class="kupimotorLabel">Brand *</label>
        <input type="text" id="kupimotorBrand" class="kupimotorInput" placeholder="Synced from form" autocomplete="off" readonly>
      </div>
      <div class="kupimotorFormGroup">
        <label class="kupimotorLabel">Model *</label>
        <input type="text" id="kupimotorModel" class="kupimotorInput" placeholder="Synced from form" autocomplete="off" readonly>
      </div>
      <div class="kupimotorFormGroup">
        <label class="kupimotorLabel">Year (optional)</label>
        <input type="number" id="kupimotorYear" class="kupimotorInput" placeholder="Auto-filled" min="1950" readonly>
      </div>
      <button class="kupimotorSearchBtn" id="kupimotorSearchBtn">Search</button>
      <div id="kupimotorResults"></div>
    </div>
  `;
  document.body.appendChild(panel);
  console.warn('[KupiMotor] Panel DOM element created and appended');

  // Sync form values into panel on load
  const formValues = getFormValues();
  if (formValues.make) document.getElementById('kupimotorBrand').value = formValues.make;
  if (formValues.model) document.getElementById('kupimotorModel').value = formValues.model;
  if (formValues.year) document.getElementById('kupimotorYear').value = formValues.year;

  // Close button
  document.getElementById('kupimotorCloseBtn').addEventListener('click', () => {
    panel.classList.add('hidden');
    console.log('[KupiMotor] Panel closed');
  });

  // Search button
  document.getElementById('kupimotorSearchBtn').addEventListener('click', searchBikes);

  // Enter key in inputs
  document.getElementById('kupimotorBrand').addEventListener('keypress', (e) => { if (e.key === 'Enter') searchBikes(); });
  document.getElementById('kupimotorModel').addEventListener('keypress', (e) => { if (e.key === 'Enter') searchBikes(); });
  document.getElementById('kupimotorYear').addEventListener('keypress', (e) => { if (e.key === 'Enter') searchBikes(); });

  // Start monitoring form changes
  startMonitoringFormChanges();

  console.warn('[KupiMotor] Panel initialized and ready');
}

/**
 * Monitor form changes and sync to panel
 */
function startMonitoringFormChanges() {
  console.warn('[KupiMotor] Starting to monitor form changes');
  
  // Poll for brand/model/year changes in form every 500ms
  setInterval(() => {
    const formValues = getFormValues();
    const brandInput = document.getElementById('kupimotorBrand');
    const modelInput = document.getElementById('kupimotorModel');
    const yearInput = document.getElementById('kupimotorYear');

    if (!brandInput || !modelInput || !yearInput) return;

    // Update brand if form has a value and panel is empty or different
    if (formValues.make && formValues.make !== brandInput.value) {
      console.log('[KupiMotor] Form brand changed:', formValues.make);
      brandInput.value = formValues.make;
    }

    // Update model if form has a value and panel is empty or different
    if (formValues.model && formValues.model !== modelInput.value) {
      console.log('[KupiMotor] Form model changed:', formValues.model);
      modelInput.value = formValues.model;
    }

    // Update year if form has a value and panel is empty or different
    if (formValues.year && formValues.year !== yearInput.value) {
      console.log('[KupiMotor] Form year changed:', formValues.year);
      yearInput.value = formValues.year;
    }
  }, 500);
}

/**
 * Search for bikes based on form inputs
 */
function searchBikes() {
  console.warn('[KupiMotor] Search initiated');
  const brand = document.getElementById('kupimotorBrand').value.trim();
  const model = document.getElementById('kupimotorModel').value.trim();
  const year = document.getElementById('kupimotorYear').value.trim();

  if (!brand || !model) {
    alert('Please enter brand and model');
    return;
  }

  const resultsDiv = document.getElementById('kupimotorResults');
  resultsDiv.innerHTML = '<div class="kupimotorLoading">Searching...</div>';

  // Send search request to background script
  chrome.runtime.sendMessage(
    { action: 'searchMotorcycles', brand, model, year },
    (response) => {
      if (!response) {
        resultsDiv.innerHTML = '<div class="kupimotorEmpty">No results found</div>';
        return;
      }

      if (!Array.isArray(response) || response.length === 0) {
        resultsDiv.innerHTML = '<div class="kupimotorEmpty">No motorcycles found</div>';
        return;
      }

      // Display results
      const html = response.map((bike, idx) => `
        <div class="kupimotorResultItem" data-index="${idx}">
          <div class="kupimotorResultBrand">${bike.make} ${bike.model}</div>
          <div style="font-size: 11px; color: #666; margin-top: 3px;">
            ${bike.year ? bike.year + ' • ' : ''}
            ${bike.power_hp ? bike.power_hp + ' HP' : ''}
          </div>
        </div>
      `).join('');

      resultsDiv.innerHTML = `<div class="kupimotorResults">${html}</div>`;

      // Add click handlers
      resultsDiv.querySelectorAll('.kupimotorResultItem').forEach(item => {
        item.addEventListener('click', () => {
          const idx = item.dataset.index;
          selectBike(response[idx]);
        });
      });
    }
  );
}

/**
 * Select a bike and display its details + auto-fill form
 */
function selectBike(bikeData) {
  console.warn('[KupiMotor] Bike selected:', bikeData);
  currentBikeData = bikeData;

  const resultsDiv = document.getElementById('kupimotorResults');
  
  // Format bike data for display
  const formatted = {
    make: bikeData.make,
    model: bikeData.model,
    year: bikeData.year,
    motorcycleType: bikeData.type,
    displacement: bikeData.displacement_cc,
    cylinders: bikeData.cylinders,
    engineType: bikeData.engine_type,
    powerHp: bikeData.power_hp,
    powerKw: bikeData.power_kw,
    weight: bikeData.weight_kg,
    seatHeight: bikeData.seat_height_mm,
    transmission: bikeData.transmission,
    coolingType: bikeData.cooling_type,
    driveType: bikeData.drive_type,
    consumption: bikeData.fuel_consumption_l100km,
  };

  // Auto-fill form immediately
  console.warn('[KupiMotor] Auto-filling form...');
  fillFormFromPanel(formatted);

  // Show bike details in panel
  const sections = {
    'Basic Info': {
      'Make': formatted.make,
      'Model': formatted.model,
      'Year': formatted.year,
      'Type': formatted.motorcycleType,
    },
    'Engine': {
      'Displacement': formatted.displacement ? `${formatted.displacement}cc` : null,
      'Cylinders': formatted.cylinders,
      'Type': formatted.engineType,
      'Power': formatted.powerHp ? `${formatted.powerHp} HP${formatted.powerKw ? ` / ${formatted.powerKw} kW` : ''}` : null,
      'Consumption': formatted.consumption ? `${formatted.consumption} l/100km` : null,
    },
    'Specifications': {
      'Weight': formatted.weight ? `${formatted.weight} kg` : null,
      'Seat Height': formatted.seatHeight ? `${formatted.seatHeight} mm` : null,
      'Transmission': formatted.transmission,
      'Drive': formatted.driveType,
      'Cooling': formatted.coolingType,
    },
  };

  let html = '<div style="text-align: center; color: #4caf50; margin-bottom: 12px; font-weight: 600;">✓ Form filled!</div>';
  for (const [sectionName, items] of Object.entries(sections)) {
    const sectionItems = Object.entries(items)
      .filter(([, value]) => value !== null && value !== undefined && value !== '')
      .map(([label, value]) => `
        <div class="kupimotorDetailItem">
          <div class="kupimotorDetailLabel">${label}</div>
          <div class="kupimotorDetailValue">${value}</div>
        </div>
      `)
      .join('');

    if (sectionItems) {
      html += `
        <div class="kupimotorDetailsSection">
          <div class="kupimotorSectionTitle">${sectionName}</div>
          ${sectionItems}
        </div>
      `;
    }
  }

  resultsDiv.innerHTML = html;
}

/**
 * Fill the kupimotor.rs form with bike data from panel
 */
async function fillFormFromPanel(bikeData) {
  console.warn('[KupiMotor] Filling form from panel');
  const result = await fillForm(bikeData);
  console.warn('[KupiMotor] Form fill result:', result);
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function buildTextVariants(value) {
  const text = String(value || '').trim();
  if (!text) {
    return [];
  }

  const compactNcVariant = text.replace(/\b([A-Za-z]+)(\d+)([A-Za-z]*)\b/g, '$1 $2$3');
  const spacedLetterDigitVariant = text.replace(/([A-Za-z])(\d)/g, '$1 $2');

  return Array.from(new Set([text, compactNcVariant, spacedLetterDigitVariant].filter(Boolean)));
}

function isVisible(element) {
  if (!element || !(element instanceof HTMLElement)) {
    return false;
  }

  const style = window.getComputedStyle(element);
  const rect = element.getBoundingClientRect();

  return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
}

function findSectionButton(labelText) {
  const label = Array.from(document.querySelectorAll('label')).find((item) =>
    item.textContent.includes(labelText)
  );

  if (!label) {
    return null;
  }

  return label.parentElement?.querySelector('button');
}

function getTriggerDisplayText(trigger) {
  if (!trigger) {
    return '';
  }

  const spans = Array.from(trigger.querySelectorAll('span'));
  const meaningfulSpan = spans.find((span) => {
    const text = String(span.textContent || '').trim();
    return text && text !== 'Izaberi...' && text !== 'Izaberite...';
  });

  if (meaningfulSpan) {
    return meaningfulSpan.textContent.trim();
  }

  return String(trigger.textContent || '')
    .replace(/Izaberi\.\.\.|Izaberite\.\.\./gi, '')
    .trim();
}

function triggerAlreadyHasValue(trigger, value) {
  const currentText = getTriggerDisplayText(trigger);
  if (!currentText) {
    return false;
  }

  const currentNormalized = normalizeText(currentText);
  const valueVariants = buildTextVariants(value).map(normalizeText);
  return valueVariants.some((variant) => variant && variant === currentNormalized);
}

function findVisibleOption(value) {
  const normalizedVariants = buildTextVariants(value).map(normalizeText);
  const selectors = [
    '[role="option"]',
    '[role="menuitem"]',
    '[cmdk-item]',
    '[data-radix-collection-item]',
    '[data-slot="command-item"]',
    '[data-slot="select-item"]',
    'button',
    'div'
  ];

  const candidates = Array.from(document.querySelectorAll(selectors.join(',')));

  return candidates.find((candidate) => {
    if (!isVisible(candidate)) {
      return false;
    }

    const candidateText = normalizeText(candidate.textContent);
    if (!candidateText) {
      return false;
    }

    return normalizedVariants.some((variant) => candidateText === variant);
  });
}

async function selectCustomOption(labelText, value) {
  if (!value) {
    return false;
  }

  const trigger = findSectionButton(labelText);
  if (!trigger || trigger.disabled) {
    console.warn(`[KupiMotor] Trigger not found or disabled for ${labelText}`);
    return false;
  }

  if (triggerAlreadyHasValue(trigger, value)) {
    console.log(`[KupiMotor] ${labelText} already set to ${value}`);
    return true;
  }

  trigger.click();

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const option = findVisibleOption(value);
    if (option) {
      option.click();
      console.log(`[KupiMotor] Selected ${labelText}: ${value}`);
      return true;
    }

    await delay(100);
  }

  const valueSpan = trigger.querySelector('span');
  if (valueSpan) {
    valueSpan.textContent = buildTextVariants(value)[0];
    console.warn(`[KupiMotor] Falling back to visual text update for ${labelText}: ${value}`);
    return true;
  }

  console.warn(`[KupiMotor] Option not found for ${labelText}: ${value}`);
  return false;
}

/**
 * Fill form field with value
 */
function fillField(fieldId, value) {
  if (!value && value !== 0) {
    return false;
  }

  const field = document.getElementById(fieldId);
  if (!field) {
    console.warn(`[KupiMotor] Field not found: ${fieldId}`);
    return false;
  }

  try {
    field.value = value;
    
    // Trigger input event to notify React of change
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new Event('change', { bubbles: true }));
    
    console.log(`[KupiMotor] Filled ${fieldId} with value: ${value}`);
    return true;
  } catch (error) {
    console.error(`[KupiMotor] Error filling ${fieldId}:`, error);
    return false;
  }
}

function setElementValue(element, value) {
  const prototype = element instanceof HTMLSelectElement
    ? HTMLSelectElement.prototype
    : HTMLInputElement.prototype;
  const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');

  if (descriptor?.set) {
    descriptor.set.call(element, String(value));
    return;
  }

  element.value = value;
}

function findSelectContainer(labelText) {
  const label = Array.from(document.querySelectorAll('label')).find((item) =>
    item.textContent.includes(labelText)
  );

  if (!label) {
    return null;
  }

  return label.closest('.space-y-2') || label.parentElement || label.closest('div');
}

function setHiddenSelectByLabel(labelText, value) {
  if (!value) {
    return false;
  }

  const container = findSelectContainer(labelText);
  const hiddenSelect = container?.querySelector('select[aria-hidden="true"][tabindex="-1"]');

  if (!hiddenSelect) {
    console.warn(`[KupiMotor] Hidden select not found for ${labelText}`);
    return false;
  }

  const normalizedValue = normalizeText(value);
  const option = Array.from(hiddenSelect.options).find((item) => {
    return normalizeText(item.value) === normalizedValue || normalizeText(item.textContent) === normalizedValue;
  });

  if (!option) {
    console.warn(`[KupiMotor] Option not found for ${labelText}: ${value}`);
    return false;
  }

  try {
    setElementValue(hiddenSelect, option.value);
    hiddenSelect.dispatchEvent(new Event('input', { bubbles: true }));
    hiddenSelect.dispatchEvent(new Event('change', { bubbles: true }));

    if (hiddenSelect.value !== option.value) {
      console.warn(`[KupiMotor] Hidden select did not retain value for ${labelText}: ${option.value}`);
      return false;
    }

    const trigger = container.querySelector('button[role="combobox"]');
    const valueSpan = trigger?.querySelector('span[data-slot="select-value"]') || trigger?.querySelector('span');
    if (valueSpan) {
      valueSpan.textContent = option.textContent.trim();
    }

    console.log(`[KupiMotor] Set ${labelText} to ${option.value}`);
    return true;
  } catch (error) {
    console.error(`[KupiMotor] Error setting ${labelText}:`, error);
    return false;
  }
}

/**
 * Select option from a hidden select element
 * (used for custom React select components)
 */
function selectOptionFromHiddenSelect(selectId, value) {
  if (!value) {
    return false;
  }

  const select = document.querySelector(`select[required][tabindex="-1"][style*="position: absolute"]`);
  if (!select) {
    console.warn(`[KupiMotor] Hidden select not found`);
    return false;
  }

  const option = select.querySelector(`option[value="${value}"]`);
  if (!option) {
    console.warn(`[KupiMotor] Option not found for value: ${value}`);
    return false;
  }

  try {
    select.value = value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    console.log(`[KupiMotor] Selected option: ${value}`);
    return true;
  } catch (error) {
    console.error(`[KupiMotor] Error selecting option:`, error);
    return false;
  }
}

/**
 * Fill the kupimotor.rs form with motorcycle data
 */
async function fillForm(bikeData) {
  console.warn('[KupiMotor] ===== FILLING FORM =====');
  console.log('[KupiMotor] Filling form with data:', bikeData);

  const fieldMap = {
    year: bikeData.year,
    powerHp: bikeData.powerHp,
    powerKw: bikeData.powerKw,
    displacement: bikeData.displacement,
    mileage: 0, // User should enter this manually
    color: '', // User should enter this manually
    cylinders: bikeData.cylinders,
    weight: bikeData.weight,
    seatHeight: bikeData.seatHeight,
    consumption: bikeData.consumption,
  };

  let filledCount = 0;

  console.warn('[KupiMotor] Attempting to fill make...');
  if (await selectCustomOption('Marka', bikeData.make)) {
    filledCount++;
    await delay(150);
  }

  console.warn('[KupiMotor] Attempting to fill model...');
  if (await selectCustomOption('Model', bikeData.model)) {
    filledCount++;
    await delay(150);
  }

  // Fill text/number inputs
  for (const [fieldId, value] of Object.entries(fieldMap)) {
    if (fillField(fieldId, value)) {
      filledCount++;
    }
  }

  // Fill select dropdowns (type, transmission, cooling, etc.)
  const hiddenSelects = document.querySelectorAll('select[aria-hidden="true"][tabindex="-1"]');
  console.log(`[KupiMotor] Found ${hiddenSelects.length} hidden select elements`);

  // For each type dropdown, find the corresponding hidden select
  const typeSelects = {
    'Menjač': bikeData.transmission,      // Transmission
    'Tip hlađenja': bikeData.coolingType, // Cooling type
    'Tip prenosa': bikeData.driveType,    // Drive type
    'Tip agregata': bikeData.engineType,  // Engine type
  };

  for (const [labelText, value] of Object.entries(typeSelects)) {
    if (setHiddenSelectByLabel(labelText, value)) {
      filledCount++;
    }
  }

  // Try to set motorcycle type (Tip)
  if (setHiddenSelectByLabel('Tip', bikeData.motorcycleType)) {
    filledCount++;
  }

  console.warn('[KupiMotor] ===== FORM FILL COMPLETE =====');
  return {
    success: true,
    filledCount,
    message: `Filled ${filledCount} fields`
  };
}

/**
 * Message listener for background script
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.warn('[KupiMotor] ===== MESSAGE RECEIVED =====');
  console.warn('[KupiMotor] Message action:', request.action);

  if (request.action === 'fillForm') {
    console.warn('[KupiMotor] FillForm action detected');
    (async () => {
      try {
        console.warn('[KupiMotor] Calling fillForm with data:', request.data);
        const result = await fillForm(request.data);
        console.warn('[KupiMotor] fillForm completed, sending response:', result);
        sendResponse(result);
      } catch (error) {
        console.error('[KupiMotor] Error filling form:', error);
        sendResponse({
          success: false,
          message: `Error: ${error.message}`
        });
      }
    })();

    return true;
  }

  if (request.action === 'togglePanel') {
    console.warn('[KupiMotor] TogglePanel action detected');
    const panel = document.getElementById('kupimotorPanel');
    
    if (!panel) {
      console.warn('[KupiMotor] Panel not initialized, initializing now');
      initializePanel();
    } else if (panel.classList.contains('hidden')) {
      console.warn('[KupiMotor] Panel is hidden, showing it');
      panel.classList.remove('hidden');
    }

    // Check if brand and model are filled in form
    const brandInput = document.getElementById('kupimotorBrand');
    const modelInput = document.getElementById('kupimotorModel');
    
    if (brandInput && modelInput && brandInput.value.trim() && modelInput.value.trim()) {
      console.warn('[KupiMotor] Brand and model found, auto-searching');
      setTimeout(() => {
        searchBikes();
      }, 300);
    }

    sendResponse({ success: true });
    return true;
  }
});

// Panel initialization is now triggered only by extension icon click (togglePanel message)
// See chrome.runtime.onMessage listener for 'togglePanel' action above

console.warn('[KupiMotor] ===== CONTENT SCRIPT READY =====');
console.log('[KupiMotor] Content script ready');
