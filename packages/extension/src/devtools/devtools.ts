/**
 * DevTools page - creates the 3Lens panel in Chrome DevTools
 */

// Create the DevTools panel
chrome.devtools.panels.create(
  '3Lens', // Panel title
  '/icons/icon32.png', // Panel icon
  '/panel.html', // Panel page
  (panel) => {
    console.log('[3Lens] Panel created');

    // Track panel visibility
    panel.onShown.addListener((window) => {
      console.log('[3Lens] Panel shown');
      // Notify content script that panel is open
      sendToContentScript({ type: 'panel-shown' });
    });

    panel.onHidden.addListener(() => {
      console.log('[3Lens] Panel hidden');
      sendToContentScript({ type: 'panel-hidden' });
    });
  }
);

/**
 * Send a message to the content script via the background service worker
 */
function sendToContentScript(message: unknown): void {
  chrome.runtime.sendMessage({
    target: 'content',
    tabId: chrome.devtools.inspectedWindow.tabId,
    ...message,
  });
}

