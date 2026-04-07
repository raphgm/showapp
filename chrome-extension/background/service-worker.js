// ─── Show Extension – Background Service Worker ────
// Manifest V3 service worker handling capture, recording, and shortcuts

// ─── State ──────────────────────────────────────────
let isRecording = false;
let recordingStartTime = null;
let mediaRecorder = null;
let recordedChunks = [];

// ─── Message Router ─────────────────────────────────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'captureScreenshot':
      handleScreenshot(sendResponse);
      return true; // async

    case 'captureTab':
      // Capture visible tab using Chrome's native API (bypasses CSP)
      handleCaptureTab(sender.tab?.windowId, sendResponse);
      return true;

    case 'startRegionCapture':
      handleRegionCapture(message.tabId, sendResponse);
      return true;

    case 'startRecording':
      handleStartRecording(sendResponse);
      return true;

    case 'stopRecording':
      handleStopRecording(sendResponse);
      return true;

    case 'getRecordingState':
      sendResponse({ isRecording, startTime: recordingStartTime });
      return false;

    case 'regionCaptured':
      handleRegionResult(message, sendResponse);
      return true;

    case 'saveCapture':
      // Direct save from content script
      handleDirectSave(message, sendResponse);
      return true;

    case 'previewCapture':
      handlePreviewCapture(message.index);
      sendResponse({ success: true });
      return false;

    default:
      return false;
  }
});

// ─── Capture Visible Tab (bypasses CSP) ─────────────
async function handleCaptureTab(windowId, sendResponse) {
  try {
    // Use null for current window if windowId is undefined
    const targetWindow = windowId ?? null;
    const dataUrl = await chrome.tabs.captureVisibleTab(targetWindow, {
      format: 'png',
      quality: 100,
    });
    sendResponse({ success: true, dataUrl });
  } catch (err) {
    console.error('captureVisibleTab error:', err);
    sendResponse({ success: false, error: err.message || String(err) });
  }
}

// ─── Direct Save from html2canvas ───────────────────
async function handleDirectSave(message, sendResponse) {
  try {
    const { dataUrl, type, timestamp, autoDownload } = message;
    const capture = {
      dataUrl,
      type: type || 'screenshot',
      timestamp: timestamp || Date.now(),
      source: 'show-pill',
    };
    
    // Save to storage
    const { captures = [] } = await chrome.storage.local.get('captures');
    captures.unshift(capture);
    // Keep only last 50 captures
    await chrome.storage.local.set({ captures: captures.slice(0, 50) });
    
    // Auto-download if requested
    if (autoDownload && dataUrl) {
      const date = new Date(capture.timestamp);
      const filename = `show-capture-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}${String(date.getSeconds()).padStart(2, '0')}.png`;
      
      chrome.downloads.download({
        url: dataUrl,
        filename: filename,
        saveAs: false,
      });
    }
    
    // Show notification
    const notifId = `show-capture-${Date.now()}`;
    chrome.notifications.create(notifId, {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/icon128.png'),
      title: 'Show – Screenshot Captured',
      message: autoDownload ? 'Screenshot saved to downloads.' : 'Screenshot copied to clipboard.',
      priority: 2,
    }, (id) => {
      if (chrome.runtime.lastError) {
        console.warn('Notification failed:', chrome.runtime.lastError.message);
      } else {
        // Auto-clear after 4 seconds
        setTimeout(() => chrome.notifications.clear(id), 4000);
      }
    });
    
    sendResponse({ success: true });
  } catch (err) {
    console.error('Save capture error:', err);
    sendResponse({ success: false, error: err.message });
  }
}

// ─── Keyboard Shortcuts ─────────────────────────────
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'quick-capture') {
    handleScreenshot((response) => {
      if (response.success) {
        chrome.notifications.create(`show-shortcut-${Date.now()}`, {
          type: 'basic',
          iconUrl: chrome.runtime.getURL('icons/icon128.png'),
          title: 'Show – Screenshot Captured',
          message: 'Your screenshot has been saved.',
          priority: 2,
        }, (id) => {
          if (chrome.runtime.lastError) {
            console.warn('Notification failed:', chrome.runtime.lastError.message);
          } else {
            setTimeout(() => chrome.notifications.clear(id), 4000);
          }
        });
      }
    });
  } else if (command === 'start-recording') {
    if (isRecording) {
      handleStopRecording(() => {
        chrome.notifications.create(`show-rec-stop-${Date.now()}`, {
          type: 'basic',
          iconUrl: chrome.runtime.getURL('icons/icon128.png'),
          title: 'Show – Recording Saved',
          message: 'Your screen recording has been saved.',
          priority: 2,
        });
      });
    } else {
      handleStartRecording((response) => {
        if (response.success) {
          chrome.notifications.create(`show-rec-start-${Date.now()}`, {
            type: 'basic',
            iconUrl: chrome.runtime.getURL('icons/icon128.png'),
            title: 'Show – Recording Started',
            message: 'Recording your screen. Press ⌘+Shift+R to stop.',
            priority: 2,
          });
        }
      });
    }
  }
});

// ─── Screenshot Capture ─────────────────────────────
async function handleScreenshot(sendResponse) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) {
      sendResponse({ success: false, error: 'No active tab' });
      return;
    }

    const dataUrl = await chrome.tabs.captureVisibleTab(null, {
      format: 'png',
      quality: 100,
    });

    const hostname = tab.url ? new URL(tab.url).hostname : 'unknown';
    const capture = {
      id: generateId(),
      type: 'screenshot',
      title: `${tab.title || hostname} screenshot`,
      filename: `show-capture-${hostname}-${Date.now()}.png`,
      dataUrl,
      url: tab.url,
      hostname,
      timestamp: Date.now(),
      dimensions: null,
    };

    await saveCapture(capture);
    sendResponse({ success: true, capture });
  } catch (err) {
    console.error('Screenshot error:', err);
    sendResponse({ success: false, error: err.message });
  }
}

// ─── Region Capture ─────────────────────────────────
async function handleRegionCapture(tabId, sendResponse) {
  try {
    // Inject region selector into the page
    await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        // Dispatch custom event to trigger region selection in content script
        window.dispatchEvent(new CustomEvent('show-start-region-select'));
      },
    });
    if (sendResponse) sendResponse({ success: true });
  } catch (err) {
    console.error('Region capture error:', err);
    if (sendResponse) sendResponse({ success: false, error: err.message });
  }
}

async function handleRegionResult(message, sendResponse) {
  try {
    const { region, tabId } = message;

    // First capture the full visible tab
    const fullDataUrl = await chrome.tabs.captureVisibleTab(null, {
      format: 'png',
      quality: 100,
    });

    // Create offscreen document to crop the image
    const croppedDataUrl = await cropImage(fullDataUrl, region);

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const hostname = tab?.url ? new URL(tab.url).hostname : 'unknown';

    const capture = {
      id: generateId(),
      type: 'screenshot',
      title: `Region capture – ${hostname}`,
      filename: `show-region-${hostname}-${Date.now()}.png`,
      dataUrl: croppedDataUrl,
      url: tab?.url,
      hostname,
      timestamp: Date.now(),
      dimensions: { width: region.width, height: region.height },
    };

    await saveCapture(capture);
    
    chrome.notifications.create(`show-region-${Date.now()}`, {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/icon128.png'),
      title: 'Show – Region Captured',
      message: `${region.width}×${region.height} region saved.`,
      priority: 2,
    });

    sendResponse({ success: true });
  } catch (err) {
    console.error('Region result error:', err);
    sendResponse({ success: false, error: err.message });
  }
}

// ─── Image Cropping (using OffscreenCanvas in SW) ───
async function cropImage(dataUrl, region) {
  // Use offscreen document for canvas operations
  try {
    const existingContexts = await chrome.runtime.getContexts({
      contextTypes: ['OFFSCREEN_DOCUMENT'],
    });

    if (!existingContexts.length) {
      await chrome.offscreen.createDocument({
        url: 'offscreen/offscreen.html',
        reasons: ['CANVAS_DRAWING'],
        justification: 'Crop screenshot region',
      });
    }

    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { action: 'cropImage', dataUrl, region },
        (response) => {
          if (response?.croppedDataUrl) {
            resolve(response.croppedDataUrl);
          } else {
            reject(new Error('Crop failed'));
          }
        }
      );
    });
  } catch (err) {
    console.error('Offscreen crop error:', err);
    // Fallback: return full image
    return dataUrl;
  }
}

// ─── Screen Recording ───────────────────────────────
async function handleStartRecording(sendResponse) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) {
      sendResponse({ success: false, error: 'No active tab' });
      return;
    }

    // Use desktopCapture to get a stream ID
    chrome.desktopCapture.chooseDesktopMedia(
      ['screen', 'window', 'tab'],
      tab,
      (streamId) => {
        if (!streamId) {
          sendResponse({ success: false, error: 'User cancelled' });
          return;
        }

        // Store the stream ID and start recording via offscreen document
        startRecordingWithStream(streamId, tab, sendResponse);
      }
    );
  } catch (err) {
    console.error('Start recording error:', err);
    sendResponse({ success: false, error: err.message });
  }
}

async function startRecordingWithStream(streamId, tab, sendResponse) {
  try {
    // Ensure offscreen document exists
    const existingContexts = await chrome.runtime.getContexts({
      contextTypes: ['OFFSCREEN_DOCUMENT'],
    });

    if (!existingContexts.length) {
      await chrome.offscreen.createDocument({
        url: 'offscreen/offscreen.html',
        reasons: ['USER_MEDIA'],
        justification: 'Record screen capture',
      });
    }

    chrome.runtime.sendMessage(
      { action: 'offscreen-startRecording', streamId },
      (response) => {
        if (response?.success) {
          isRecording = true;
          recordingStartTime = Date.now();
          
          // Update badge to show recording
          chrome.action.setBadgeText({ text: 'REC' });
          chrome.action.setBadgeBackgroundColor({ color: '#ef4444' });

          sendResponse({ success: true });
        } else {
          sendResponse({ success: false, error: response?.error || 'Failed to start' });
        }
      }
    );
  } catch (err) {
    console.error('Stream recording error:', err);
    sendResponse({ success: false, error: err.message });
  }
}

async function handleStopRecording(sendResponse) {
  try {
    chrome.runtime.sendMessage({ action: 'offscreen-stopRecording' }, async (response) => {
      isRecording = false;
      recordingStartTime = null;
      
      // Clear badge
      chrome.action.setBadgeText({ text: '' });

      if (response?.dataUrl) {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const hostname = tab?.url ? new URL(tab.url).hostname : 'unknown';
        const duration = response.duration || 0;

        const capture = {
          id: generateId(),
          type: 'recording',
          title: `Recording – ${hostname}`,
          filename: `show-recording-${hostname}-${Date.now()}.webm`,
          dataUrl: response.dataUrl,
          url: tab?.url,
          hostname,
          timestamp: Date.now(),
          duration,
        };

        await saveCapture(capture);
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'No recording data' });
      }
    });
  } catch (err) {
    console.error('Stop recording error:', err);
    sendResponse({ success: false, error: err.message });
  }
}

// ─── Preview ────────────────────────────────────────
async function handlePreviewCapture(index) {
  const { captures = [] } = await chrome.storage.local.get('captures');
  const capture = captures[index];
  if (!capture) return;

  if (capture.type === 'recording') {
    // Open recording in new tab using blob URL
    chrome.tabs.create({
      url: capture.dataUrl,
    });
  } else {
    // Open image in new tab
    chrome.tabs.create({
      url: capture.dataUrl,
    });
  }
}

// ─── Storage ────────────────────────────────────────
async function saveCapture(capture) {
  const { captures = [] } = await chrome.storage.local.get('captures');
  
  // Keep only last 50 captures to manage storage
  captures.unshift(capture);
  if (captures.length > 50) {
    captures.length = 50;
  }

  await chrome.storage.local.set({ captures });
}

// ─── Utilities ──────────────────────────────────────
function generateId() {
  return `show_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

// ─── Extension Install / Update ─────────────────────
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Open welcome/onboarding tab
    chrome.tabs.create({
      url: 'https://getshowapp.com?ref=extension-install',
    });
  }

  // Set default settings
  chrome.storage.local.get('settings', ({ settings }) => {
    if (!settings) {
      chrome.storage.local.set({
        settings: {
          captureFormat: 'png',
          captureQuality: 100,
          recordingFormat: 'webm',
          showNotifications: true,
          autoDownload: false,
          defaultAction: 'capture',
        },
      });
    }
  });
});
