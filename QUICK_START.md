# Quick Start Guide - Load KupiMotor Extension

## Steps to Load the Extension

### 1. Open Chrome Extensions Page
   - Open Chrome browser
   - Type or paste this URL in the address bar: `chrome://extensions/`
   - Press Enter

### 2. Enable Developer Mode
   - Look for the **Developer mode** toggle switch in the top-right corner
   - Click it to turn it ON (it should turn blue)

### 3. Load Unpacked Extension
   - Click the **Load unpacked** button (should appear after enabling Developer mode)
   - A folder selection dialog will open
   - Navigate to the `public` folder in the kupimotor repository
   - Click **Select Folder**
   - Chrome will validate and load the extension

### 4. Verify Installation
   - You should see "KupiMotor Auto-Fill" appear in your extensions list
   - A new extension icon should appear in your Chrome toolbar (top-right)
   - The extension is now ready to use

## Using the Extension

### Method 1: Floating Panel (Recommended)

The easiest way to use the extension is through the automatic floating panel:

1. **Go to kupimotor.rs**
   - Navigate to: https://www.kupimotor.rs
   - Click on "Postavka Oglasa" (Post a Listing) or navigate to a listing form
   - The floating panel will automatically appear in the bottom-left corner

2. **Fill the Motorcycle Form on kupimotor.rs**
   - Select a motorcycle **Brand** from the dropdown
   - Select a **Model** from the dropdown
   - The floating panel will **automatically sync** these values in real-time
   - Optionally enter or select a **Year**

3. **Search Using the Panel**
   - Click the **Search** button in the floating panel
   - The panel displays matching motorcycles from the database

4. **Select a Result**
   - Click on the motorcycle you want to use
   - The panel expands to show detailed specifications:
     - **Engine**: Displacement, Power (HP/kW), Cylinders
     - **Specs**: Weight, Seat Height, Fuel Consumption
     - **Features**: Transmission, Cooling Type, Drive Type, Engine Type

5. **Auto-Fill the Form**
   - Click the green **Fill Form** button
   - All kupimotor.rs form fields are automatically populated with the selected motorcycle's data

6. **Complete Your Listing**
   - Verify the auto-filled data is correct
   - Add photos, price, description, and condition
   - Submit your listing

7. **Close the Panel** (Optional)
   - Click the **×** button to close the floating panel
   - Click the Search button again to reopen it

### Method 2: Popup Search

Alternative method using the browser extension icon:

1. **Navigate to kupimotor.rs** and open a listing form

2. **Click the Extension Icon**
   - Click the KupiMotor Auto-Fill icon in your Chrome toolbar
   - A popup window appears with a search form

3. **Search for Your Motorcycle**
   - Enter **Brand** (e.g., Honda, Yamaha, Kawasaki)
   - Enter **Model** (e.g., CB500F, MT-09)
   - Optionally enter **Year** (e.g., 2024)
   - Click **Search**

4. **Select a Result**
   - Results appear below the search form
   - Click on the motorcycle you want
   - The extension auto-fills the kupimotor.rs form

5. **Complete Your Listing**
   - Verify the auto-filled data
   - Add photos, price, description, condition
   - Submit the listing

## Supported Motorcycles (Sample Database)

The extension includes data for these popular models:
- **Honda** (CB500F, CB650R, NC750X, etc.)
- **Yamaha** (MT-09, YZF-R7, MT-07, etc.)
- **Kawasaki** (Ninja 400, Versys 650, Z900, etc.)
- **Suzuki** (SV650, GSX-R750, etc.)
- **KTM** (390 Duke, 390 Adventure, etc.)
- **BMW** (G310R, S1000RR, etc.)
- **Ducati** (Monster 937, Panigale V4, etc.)
- **Triumph** (Speed 400, Street Twin, etc.)
- And many more...

## Auto-Filled Fields

The extension auto-fills these kupimotor.rs form fields:

**Basic Info:**
- ✓ Year (Godište)
- ✓ Motorcycle Type (Tip) - Naked, Sport, Touring, Adventure, etc.

**Power & Performance:**
- ✓ Power (KS) - Horsepower
- ✓ Power (kW) - Kilowatts
- ✓ Displacement (Kubikaža) - Engine size in cc
- ✓ Cylinders (Broj cilindara)

**Physical Specs:**
- ✓ Weight (Težina)
- ✓ Seat Height (Visina sedenja)

**Performance:**
- ✓ Fuel Consumption (Potrošnja)

**Technical:**
- ✓ Transmission (Menjač) - Manual/Automatic
- ✓ Cooling Type (Tip hlađenja) - Air/Liquid/Oil
- ✓ Drive Type (Tip prenosa) - Chain/Belt/Cardan
- ✓ Engine Type (Tip agregata) - Single/Twin/Four/Boxer/etc.

## Troubleshooting

### Extension doesn't appear on kupimotor.rs
- Refresh the kupimotor.rs page
- Check if extension is enabled in `chrome://extensions/`
- Verify the extension was loaded from the correct `public` folder

### Floating panel doesn't appear
- Make sure you're on a kupimotor.rs listing form page
- Try refreshing the page
- Check Chrome console for errors (F12 → Console tab)

### "No motorcycles found" error
- Check spelling of brand/model name
- Try searching with partial names (e.g., "Honda" alone)
- The motorcycle may not be in the database yet

### Fields don't auto-fill on form
- Make sure you're on the kupimotor.rs listing form
- Check that the brand/model were correctly selected in the dropdown (not just typed)
- Some fields may not match if they have different names on the form
- Try filling manually after verifying the data is correct

### Form fields appear to be disabled or read-only
- This typically means the form hasn't fully loaded
- Refresh the page and try again
- Make sure you clicked on the correct listing form

## Advanced: Development

### Testing
Run syntax checks on the JavaScript files:
```bash
node --check src/background.js
node --check src/content.js
```

### Understanding the Architecture
- **popup.js**: Handles the popup search interface
- **background.js**: Contains the motorcycle database search logic and type mapping
- **content.js**: Injects the floating panel and handles form filling
- **data-source.js**: Utility functions for data access

The floating panel is the main entry point when users visit kupimotor.rs.
- Make sure you're on the kupimotor.rs posting page
- Refresh the page and try again
- Some custom fields may require manual entry

### Need to unload the extension?
- Go to `chrome://extensions/`
- Find "KupiMotor Auto-Fill"
- Click the **Remove** button (trash icon)

## Next Steps

1. **Load the extension** using the steps above
2. **Test it** by searching for "Honda CB500F"
3. **Report any issues** you encounter
4. **Share feedback** on additional motorcycles to add

---

## File Locations

- **Extension files**: `d:\Documents\SourceCode\kupimotor\dist\`
- **Source code**: `d:\Documents\SourceCode\kupimotor\src\`
- **Motorcycle data**: `d:\Documents\SourceCode\kupimotor\dist\data\motorcycles.json`
- **Configuration**: `d:\Documents\SourceCode\kupimotor\dist\manifest.json`

## Support

Check Chrome DevTools console for detailed logs:
1. Open kupimotor.rs page
2. Press **F12** to open DevTools
3. Click **Console** tab
4. Look for messages starting with `[KupiMotor]`

---

**Happy listing! 🏍️**
