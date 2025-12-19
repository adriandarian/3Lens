/**
 * Content Script
 * 
 * Runs in the context of web pages and acts as a bridge between
 * the injected script (in page context) and the DevTools panel.
 */

const SOURCE_PROBE = '3lens-probe';
const SOURCE_DEVTOOL = '3lens-devtool';

// Port to background script
let port: chrome.runtime.Port | null = null;

// Connect to background when DevTools requests it
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'connect') {
    connectToBackground();
    sendResponse({ connected: true });
  }
});

function connectToBackground(): void {
  if (port) return;

  port = chrome.runtime.connect({ name: 'content' });

  port.onMessage.addListener((message) => {
    // Forward messages from DevTools panel to page
    window.postMessage(
      {
        source: SOURCE_DEVTOOL,
        version: '1.0.0',
        payload: message,
      },
      '*'
    );
  });

  port.onDisconnect.addListener(() => {
    port = null;
  });
}

// Listen for messages from the page (from the probe)
window.addEventListener('message', (event) => {
  // Only accept messages from same window
  if (event.source !== window) return;

  // Validate message structure
  if (!event.data || event.data.source !== SOURCE_PROBE) return;

  // Forward to DevTools via background script
  if (port) {
    port.postMessage(event.data.payload);
  }
});

// Inject script to detect three.js (no-setup mode)
function injectDetectionScript(): void {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('injected.js');
  script.onload = () => script.remove();
  (document.head || document.documentElement).appendChild(script);
}

// Inject immediately
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectDetectionScript);
} else {
  injectDetectionScript();
}

console.log('[3Lens] Content script loaded');

