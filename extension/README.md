# 3Lens TypeScript Extension

This folder contains a minimal browser extension written in TypeScript. It demonstrates how to compile TypeScript files for use in a browser extension.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Build the extension:
   ```bash
   npm run build
   ```
   Compiled files are output to the `dist` directory.
3. Load the extension in your browser (Chrome/Edge/Brave):
   - Open the Extensions page and enable Developer Mode.
   - Click "Load unpacked" and select this `extension` folder.
   - After building, the browser will use the JavaScript files in `dist`.

The background script simply logs a message when the extension is installed, and the content script logs a message on each page load.
