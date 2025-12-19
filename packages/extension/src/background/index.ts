/**
 * Background Service Worker
 * 
 * Manages communication between content scripts and DevTools panels.
 */

// Store active connections
const connections: Map<number, {
  panel: chrome.runtime.Port | null;
  content: chrome.runtime.Port | null;
}> = new Map();

// Handle new connections
chrome.runtime.onConnect.addListener((port) => {
  console.log('[3Lens Background] New connection:', port.name);

  if (port.name === 'panel') {
    // DevTools panel connected
    handlePanelConnection(port);
  } else if (port.name === 'content') {
    // Content script connected
    handleContentConnection(port);
  }
});

function handlePanelConnection(port: chrome.runtime.Port): void {
  // Get tab ID from sender
  const tabId = port.sender?.tab?.id;
  
  // For DevTools panels, we need to extract tabId differently
  // The panel doesn't have a tab, so we need to track this differently
  let inspectedTabId: number | null = null;

  port.onMessage.addListener((message) => {
    // First message should include the inspected tab ID
    if (message.tabId) {
      inspectedTabId = message.tabId;
      ensureConnection(inspectedTabId);
      const conn = connections.get(inspectedTabId);
      if (conn) {
        conn.panel = port;
      }
    }

    // Forward message to content script
    if (inspectedTabId) {
      const conn = connections.get(inspectedTabId);
      if (conn?.content) {
        conn.content.postMessage(message);
      } else {
        // Try to send via tabs.sendMessage as fallback
        chrome.tabs.sendMessage(inspectedTabId, { type: 'connect' }, () => {
          // Ignore errors - content script might not be ready yet
        });
      }
    }
  });

  port.onDisconnect.addListener(() => {
    if (inspectedTabId) {
      const conn = connections.get(inspectedTabId);
      if (conn) {
        conn.panel = null;
        if (!conn.content) {
          connections.delete(inspectedTabId);
        }
      }
    }
  });
}

function handleContentConnection(port: chrome.runtime.Port): void {
  const tabId = port.sender?.tab?.id;
  if (!tabId) return;

  ensureConnection(tabId);
  const conn = connections.get(tabId)!;
  conn.content = port;

  port.onMessage.addListener((message) => {
    // Forward message to panel
    if (conn.panel) {
      conn.panel.postMessage(message);
    }
  });

  port.onDisconnect.addListener(() => {
    const connection = connections.get(tabId);
    if (connection) {
      connection.content = null;
      if (!connection.panel) {
        connections.delete(tabId);
      }
    }
  });
}

function ensureConnection(tabId: number): void {
  if (!connections.has(tabId)) {
    connections.set(tabId, { panel: null, content: null });
  }
}

// Handle one-time messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.target === 'content' && message.tabId) {
    chrome.tabs.sendMessage(message.tabId, message);
    sendResponse({ sent: true });
  }
  return true;
});

console.log('[3Lens] Background service worker started');

