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
   - Navigate to: `<path_to_repository>/dist`
   - Click **Select Folder**
   - Chrome will validate and load the extension

### 4. Verify Installation
   - You should see "KupiMotor Auto-Fill" appear in your extensions list
   - A new extension icon should appear in your toolbar (top-right of Chrome)
   - The card should show:
     - ✓ Extension ID
     - ✓ Version: 1.0.0
     - ✓ "Permissions: storage, scripting"

## Using the Extension

### To Auto-Fill a Motorcycle Listing:

1. **Go to kupimotor.rs**
   - Navigate to: https://kupimotor.rs
   - Click on "Postavka Oglasa" (Post a Listing)
   - Scroll to the motorcycle form

2. **Click the Extension Icon**
   - Click the KupiMotor Auto-Fill icon in your Chrome toolbar
   - A popup will appear with a search form

3. **Search for Your Motorcycle**
   - Enter **Brand** (e.g., Honda, Yamaha, Kawasaki)
   - Enter **Model** (e.g., CB500F, MT-09)
   - Optionally enter **Year** (e.g., 2024)
   - Click **Search**

4. **Select a Result**
   - Results will appear below the search form
   - Click on the motorcycle you want
   - The extension will auto-fill the form fields

5. **Complete Your Listing**
   - Verify the auto-filled data
   - Add photos, price, description, condition
   - Submit the listing

## Supported Motorcycles (Sample Database)

The extension includes data for these popular models:
- Honda (CB500F, CB650R, etc.)
- Yamaha (MT-09, YZF-R7, etc.)
- Kawasaki (Ninja 400, Versys 650, etc.)
- Suzuki (SV650, etc.)
- KTM (390 Duke, etc.)
- BMW (G310R, etc.)
- Ducati (Monster 937, etc.)
- Triumph (Speed 400, etc.)
- And more...

## Auto-Filled Fields

The extension auto-fills these kupimotor.rs form fields:
- ✓ Year (Godište)
- ✓ Power HP (Snaga KS)
- ✓ Power kW (Snaga kW)
- ✓ Displacement (Kubikaža)
- ✓ Cylinders (Broj cilindara)
- ✓ Weight (Težina)
- ✓ Seat Height (Visina sedenja)
- ✓ Fuel Consumption (Potrošnja)
- ✓ Transmission (Menjač)
- ✓ Cooling Type (Tip hlađenja)
- ✓ Drive Type (Tip prenosa)
- ✓ Engine Type (Tip agregata)
- ✓ Motorcycle Type (Tip)

## Troubleshooting

### Extension doesn't appear in toolbar
- Refresh `chrome://extensions/` page
- Check if extension is enabled (toggle should be blue)
- Try restarting Chrome

### "No motorcycles found" error
- Check spelling of brand/model
- Try searching with partial names (e.g., "Honda" + "500")
- The motorcycle may not be in the database yet

### Fields don't auto-fill
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
