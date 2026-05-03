#!/bin/bash
# Build script to prepare the Chrome extension

echo "Cleaning dist folder..."
rm -rf dist
mkdir -p dist

echo "Copying files to dist..."
cp -r public/* dist/
cp -r src/* dist/

echo ""
echo "Build complete! Extension ready in dist/ folder."
echo ""
echo "To load the extension:"
echo "1. Open chrome://extensions/"
echo "2. Enable 'Developer mode' (top right toggle)"
echo "3. Click 'Load unpacked'"
echo "4. Select the dist/ folder"
echo ""
