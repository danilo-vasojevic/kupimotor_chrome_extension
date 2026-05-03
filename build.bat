@echo off
REM Build script to prepare the Chrome extension

echo Cleaning dist folder...
if exist dist rmdir /s /q dist
mkdir dist

echo Copying files to dist...
xcopy /E /I /Y public\* dist\
xcopy /E /I /Y src\* dist\

echo.
echo Build complete! Extension ready in dist/ folder.
echo.
echo To load the extension:
echo 1. Open chrome://extensions/
echo 2. Enable "Developer mode" (top right toggle)
echo 3. Click "Load unpacked"
echo 4. Select the dist/ folder
echo.
pause
