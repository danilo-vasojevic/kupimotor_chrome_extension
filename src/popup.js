// Popup script - handles search form and result selection

const form = document.getElementById('searchForm');
const brandInput = document.getElementById('brand');
const modelInput = document.getElementById('model');
const yearInput = document.getElementById('year');
const statusDiv = document.getElementById('status');
const resultsDiv = document.getElementById('results');
const resultsList = document.getElementById('resultsList');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');

// Hide elements by default
function hideAll() {
  statusDiv.classList.add('hidden');
  resultsDiv.classList.add('hidden');
  loadingDiv.classList.add('hidden');
  errorDiv.classList.add('hidden');
}

function showError(message) {
  hideAll();
  errorDiv.textContent = message;
  errorDiv.classList.remove('hidden');
}

function showLoading() {
  hideAll();
  loadingDiv.classList.remove('hidden');
}

function showStatus(message) {
  hideAll();
  statusDiv.textContent = message;
  statusDiv.classList.remove('hidden');
}

function showResults(results) {
  hideAll();
  resultsList.innerHTML = '';
  
  if (results.length === 0) {
    showError('No motorcycles found. Try different search terms.');
    return;
  }

  results.forEach((bike, index) => {
    const item = document.createElement('div');
    item.className = 'result-item';
    item.innerHTML = `
      <div class="result-item-brand">${bike.make} ${bike.model}</div>
      <div class="result-item-details">
        ${bike.year ? `Year: ${bike.year} | ` : ''}
        ${bike.power_hp ? `Power: ${bike.power_hp} HP | ` : ''}
        ${bike.displacement_cc ? `Engine: ${bike.displacement_cc}cc` : ''}
      </div>
    `;
    
    item.addEventListener('click', () => selectMotorcycle(bike));
    resultsList.appendChild(item);
  });

  resultsDiv.classList.remove('hidden');
}

function isKupimotorUrl(url) {
  if (!url) {
    return false;
  }

  try {
    const parsed = new URL(url);
    return parsed.hostname === 'kupimotor.rs' || parsed.hostname === 'www.kupimotor.rs';
  } catch {
    return false;
  }
}

async function sendFillMessage(tabId, bike) {
  return chrome.tabs.sendMessage(tabId, {
    action: 'fillForm',
    data: bike
  });
}

async function ensureContentScript(tabId) {
  await chrome.scripting.executeScript({
    target: { tabId },
    files: ['content.js']
  });
}

async function selectMotorcycle(bike) {
  showLoading();
  
  try {
    // Get active tab
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tabs || tabs.length === 0) {
      showError('No active tab found. Please open kupimotor.rs');
      return;
    }

    const tab = tabs[0];

    if (!isKupimotorUrl(tab.url)) {
      showError('Open the kupimotor.rs listing form in the active tab, then try again.');
      return;
    }

    let response;

    try {
      response = await sendFillMessage(tab.id, bike);
    } catch (error) {
      if (!error.message.includes('Receiving end does not exist')) {
        throw error;
      }

      await ensureContentScript(tab.id);
      response = await sendFillMessage(tab.id, bike);
    }

    if (response && response.success) {
      showStatus(`✓ Form auto-filled with ${bike.make} ${bike.model}!`);
    } else {
      showError(response?.message || 'Failed to fill form. Make sure you are on kupimotor.rs posting page.');
    }
  } catch (error) {
    console.error('Error:', error);
    showError(`Error: ${error.message}`);
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const brand = brandInput.value.trim();
  const model = modelInput.value.trim();
  const year = yearInput.value ? parseInt(yearInput.value) : null;

  if (!brand || !model) {
    showError('Please enter both brand and model');
    return;
  }

  showLoading();

  try {
    // Send search request to background script
    const results = await chrome.runtime.sendMessage({
      action: 'searchMotorcycles',
      brand,
      model,
      year
    });

    showResults(results);
  } catch (error) {
    console.error('Search error:', error);
    showError(`Search failed: ${error.message}`);
  }
});

// Clear errors on input
brandInput.addEventListener('focus', hideAll);
modelInput.addEventListener('focus', hideAll);
yearInput.addEventListener('focus', hideAll);
