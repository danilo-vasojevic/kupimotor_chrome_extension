# KupiMotor Auto-Fill Chrome Extension

## Overview
A Chrome extension that intelligently auto-fills motorcycle specifications from a comprehensive motorcycle database into listing forms on [kupimotor.rs](https://kupimotor.rs). Features a convenient floating panel that appears directly on the kupimotor.rs posting page for seamless form filling.

## Features
- 🔍 **Floating Panel Search**: Search motorcycle database directly from kupimotor.rs with a floating panel that auto-syncs with form values
- 📝 **Smart Auto-Fill**: Auto-fill 13+ form fields with accurate motorcycle specifications including power, displacement, weight, transmission, cooling type, and more
- ⚡ **Intelligent Form Mapping**: Automatically maps database values to kupimotor.rs form options with type conversion and normalization
- 🔄 **Auto-Syncing**: Panel continuously monitors form changes and updates search fields automatically
- 💾 **Local Database**: Fast searches using a built-in motorcycle database (offline capable)
- 🎯 **Two Search Interfaces**: Use the floating panel on kupimotor.rs OR click the extension icon for a popup search

## Supported Fields
The extension auto-fills the following kupimotor.rs form fields:
- Year (Godište)
- Power (KS) - horsepower
- Power (kW) - kilowatts
- Displacement (Kubikaža)
- Cylinders (Broj cilindara)
- Weight (Težina)
- Seat Height (Visina sedenja)
- Fuel Consumption (Potrošnja)
- Transmission (Menjač)
- Cooling Type (Tip hlađenja)
- Drive Type (Tip prenosa)
- Engine Type (Tip agregata)
- Motorcycle Type (Tip)

## Installation

### For Development (Unpacked Extension)

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top-right corner)
4. Click **Load unpacked**
5. Select the `public` folder from this repository
6. The extension should now appear in your extensions list and toolbar

## Usage

### Method 1: Floating Panel (Recommended)

The extension automatically displays a floating panel when you visit kupimotor.rs:

1. Navigate to [kupimotor.rs](https://kupimotor.rs) and start creating a motorcycle listing
2. The **KupiMotor Auto-Fill** floating panel appears in the bottom-left corner
3. Fill in the motorcycle form on kupimotor.rs (Brand, Model, Year)
4. The panel will **auto-sync** these values in real-time
5. Click **Search** in the panel
6. Review search results and click on your motorcycle
7. View detailed specifications and click **Fill Form**
8. The form fields will be auto-populated with data
9. Complete your listing (photos, price, description) and submit
10. Close the panel anytime by clicking the **×** button

### Method 2: Popup Search

Alternatively, use the traditional popup interface:

1. Navigate to [kupimotor.rs](https://kupimotor.rs) and start creating a motorcycle listing
2. Click the **KupiMotor Auto-Fill** extension icon in your Chrome toolbar
3. A popup window appears with a search form
4. Enter the motorcycle **brand** (e.g., Honda) and **model** (e.g., CB500F)
5. Optionally enter the **year**
6. Click **Search**
7. Click on a result in the popup to auto-fill the kupimotor.rs form
8. Review the filled data and make any adjustments
9. Complete the listing and submit

## Data Source
The extension uses a local database of motorcycle specifications from the **DDPC Vehicle Specs Database** (CC BY 4.0 licensed). The database includes specs for popular motorcycles like:
- Honda (CB500F, CB650R, etc.)
- Yamaha (MT-09, YZF-R7, etc.)
- Kawasaki (Ninja 400, Versys 650, etc.)
- Suzuki (SV650, etc.)
- KTM (390 Duke, etc.)
- And many more...

Future versions may include integration with additional motorcycle data sources.

## Project Structure
```
kupimotor/
├── public/                    # Extension root (load this folder in Chrome)
│   ├── manifest.json          # Extension manifest (Manifest V3)
│   ├── popup.html             # Popup search interface
│   ├── styles.css             # Shared styles
│   ├── background.js          # Service worker (database search, type mapping)
│   ├── content.js             # Content script (floating panel, form filling)
│   ├── data-source.js         # Data source utilities
│   └── icon.svg               # Extension icon
├── src/                       # Source files (same as public/)
│   ├── popup.js               # Popup UI logic
│   ├── background.js          # Service worker implementation
│   ├── content.js             # Content script (floating panel + form filling)
│   └── data-source.js         # Data utilities
├── build.bat & build.sh       # Build scripts
├── form.html                  # Test form for development
├── package.json               # Project dependencies
├── README.md                  # This file
└── QUICK_START.md             # Quick start guide
```

## Technical Details

### Architecture
- **Manifest V3**: Modern Chrome extension standard with service worker support
- **Content Script**: Automatically injects UI and form-filling logic into kupimotor.rs pages
- **Floating Panel**: User-friendly search interface with real-time form syncing
- **Background Service Worker**: Handles motorcycle database search and data mapping
- **Local Database**: All motorcycle data is stored locally for fast, offline-capable searches

### Data Flow

**Floating Panel Workflow:**
1. Content script initializes floating panel when kupimotor.rs page loads
2. Panel continuously monitors form fields and auto-syncs values (every 500ms)
3. User searches for motorcycle via panel search form
4. Search request sent to background service worker
5. Background worker searches local motorcycle database
6. Results displayed in panel with full specifications
7. User selects a result and clicks "Fill Form"
8. Content script maps motorcycle data to kupimotor.rs form options
9. Form fields auto-populated with selected motorcycle's specifications

**Popup Workflow:**
1. User clicks extension icon to open popup search interface
2. User enters search criteria and clicks Search
3. Search request sent to background service worker
4. Results displayed in popup
5. User clicks result to fill the active kupimotor.rs form
6. Content script injects form-filling logic and populates fields

### Intelligent Type Mapping
The extension automatically converts and maps motorcycle specifications to kupimotor.rs form options:
- **Transmission**: Manual → Manual, Automatic (CVT/Automatic) → Automatic, DCT → Manual
- **Cooling Type**: Air/Water/Liquid → appropriate form values, Oil → Oil cooling
- **Drive Type**: Chain → Chain, Belt → Belt, Cardan/Shaft → Cardan
- **Engine Type**: Single, Parallel Twin, V-Twin, Inline Four, Boxer, Triple, V4, etc.
- **Motorcycle Type**: Naked, Sport, Touring, Adventure, Cruiser, Scooter, Enduro, Motocross, Supermoto, Classic/Retro, Café Racer, Chopper/Custom, Scrambler

### Form Field Syncing
- The floating panel continuously monitors kupimotor.rs form fields
- When you change Brand or Model on kupimotor.rs, the panel updates automatically
- This allows quick re-searching without manual input
- Year field can be edited in the panel if not automatically detected
- **Engine Type**: Single, Parallel Twin, V-Twin, Inline Four, V4, Boxer, Triple
- **Motorcycle Type**: Naked, Sport, Adventure, Cruiser, Scooter, etc.

## Limitations
- Currently only works on kupimotor.rs (Serbia-based site)
- Motorcycle database is limited to popular models included in the sample data
- Custom/rare motorcycles may not be in the database
- Brand and Model selection dropdowns require manual interaction (limitations of custom React components)

## Future Enhancements
- [ ] Add Bikez.com API integration for expanded motorcycle database
- [ ] Support for additional motorcycle marketplaces
- [ ] Ability to save favorite motorcycle searches
- [ ] Image upload assistance
- [ ] Price history tracking
- [ ] Publish to Chrome Web Store

## Privacy & Data
- No data is sent to external servers
- All searches are performed locally
- No user tracking or analytics
- Extension only works on kupimotor.rs domain

## License
This extension uses motorcycle specifications from the **DDPC Vehicle Specs Database** which is licensed under **CC BY 4.0**. See DDPC license for attribution requirements.

## Troubleshooting

### Extension doesn't appear
- Make sure Developer mode is enabled in `chrome://extensions/`
- Reload the extension after making changes

### Search returns no results
- Try searching with different brand/model combinations
- Check spelling (case-insensitive)
- The motorcycle may not be in the current database

### Form doesn't fill
- Make sure you're on a kupimotor.rs posting page
- Refresh the page and try again
- Some fields may require manual entry due to form complexity

## Contributing
To add more motorcycles to the database, modify `public/data/motorcycles.json` following the existing format.

## Support
For issues or suggestions, please check the extension logs in Chrome DevTools (F12 on kupimotor.rs page).

---

**Note**: This extension is a personal tool for efficient motorcycle listings. Always verify auto-filled data before submitting listings to ensure accuracy.
