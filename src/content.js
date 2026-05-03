// Content script - injected into kupimotor.rs pages
// Handles form filling with motorcycle data

console.log('[KupiMotor] Content script loaded');

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

  if (await selectCustomOption('Marka', bikeData.make)) {
    filledCount++;
    await delay(150);
  }

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

  return {
    success: true,
    filledCount,
    message: `Filled ${filledCount} fields`
  };
}

/**
 * Message listener
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[KupiMotor] Received message:', request.action);

  if (request.action === 'fillForm') {
    (async () => {
      try {
        const result = await fillForm(request.data);
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
});

console.log('[KupiMotor] Content script ready');
