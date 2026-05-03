# KupiMotor Auto-Fill Chrome Extension

## Overview
A Chrome extension that auto-fills motorcycle specifications from a free motorcycle database into motorcycle posting forms on [kupimotor.rs](https://kupimotor.rs).

## Features
- 🔍 Search motorcycle database by brand and model
- 📝 Auto-fill 14+ form fields with motorcycle specifications
- ⚡ Fast local search with intelligent filtering
- 💾 Cached data for offline search capability
- 🔗 Supports multiple data fields: power, displacement, weight, seat height, engine type, transmission, cooling type, and more

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
6. The extension should now appear in your extensions list

### Usage

1. Navigate to [kupimotor.rs](https://kupimotor.rs) and start creating a motorcycle listing
2. Click the **KupiMotor Auto-Fill** extension icon
3. Enter the motorcycle **brand** (e.g., Honda) and **model** (e.g., CB500F)
4. Optionally enter the **year**
5. Click **Search**
6. Click on a result to auto-fill the kupimotor.rs form
7. Review the filled data and make any adjustments
8. Complete the listing (photos, price, description, etc.) and submit

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
├── public/
│   ├── manifest.json          # Extension manifest (Manifest V3)
│   ├── popup.html             # Popup UI
│   ├── styles.css             # Popup styles
│   ├── data/
│   │   └── motorcycles.json   # Motorcycle database
│   └── icons/                 # Extension icons (optional)
├── src/
│   ├── popup.js               # Popup logic
│   ├── background.js          # Service worker
│   ├── content.js             # Content script (form filling)
│   └── data-source.js         # Data source utilities
└── dist/                      # Build output (if using build tools)
```

## Technical Details

### Architecture
- **Manifest V3**: Modern Chrome extension standard
- **Background Service Worker**: Handles search requests and data management
- **Content Script**: Injects form-filling logic into kupimotor.rs pages
- **Popup UI**: User-friendly search interface with results

### Data Flow
1. User searches for motorcycle in popup
2. Popup sends search request to background service worker
3. Background worker searches local database
4. Results returned and displayed in popup
5. User selects result
6. Content script injects data into form fields

### Type Mapping
The extension intelligently maps motorcycle specifications to kupimotor.rs form options:
- **Transmission**: Manual, Automatic
- **Cooling Type**: Air, Liquid, Oil
- **Drive Type**: Chain, Belt, Cardan
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
