// ─── Show Extension – Content Script ────────────────
// Floating dock with html2canvas for global screenshots

(() => {
  // ─── Skip injection on Show app domains ─────────
  const showDomains = [
    'getshowapp.com',
    'showapp-8ead7.web.app',
    'showapp-8ead7.firebaseapp.com',
    'localhost',
    '127.0.0.1',
  ];
  const currentHost = window.location.hostname.toLowerCase();
  if (showDomains.some(d => currentHost === d || currentHost.endsWith('.' + d))) {
    return; // Don't inject the Show pill on the app itself
  }

  // ─── State ──────────────────────────────────────
  let overlay = null;
  let isSelecting = false;
  let startX = 0;
  let startY = 0;
  let selectionBox = null;
  let floatingDock = null;
  let isDragging = false;
  let dragOffset = { x: 0, y: 0 };
  let dockPosition = { x: 40, y: window.innerHeight - 100 };
  let showSnapOptions = false;
  let settings = {
    enableDock: true,
    dockPosition: 'bottom-left',
    dockOpacity: 100,
    copyToClipboard: true,
    autoDownload: false,
    captureFormat: 'png',
    captureQuality: 100,
  };

  // ─── Load settings ──────────────────────────────
  function loadSettings() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['settings'], (result) => {
        if (result.settings) {
          settings = { ...settings, ...result.settings };
        }
        resolve();
      });
    });
  }

  // ─── Get default position based on setting ──────
  function getDefaultPosition() {
    const padding = 40;
    const dockWidth = 280;
    const dockHeight = 60;
    
    switch (settings.dockPosition) {
      case 'top-left':
        return { x: padding, y: padding };
      case 'top-right':
        return { x: window.innerWidth - dockWidth - padding, y: padding };
      case 'bottom-right':
        return { x: window.innerWidth - dockWidth - padding, y: window.innerHeight - dockHeight - padding };
      case 'bottom-left':
      default:
        return { x: padding, y: window.innerHeight - dockHeight - padding };
    }
  }

  // ─── Capture via background script ───────────────
  // Uses chrome.tabs.captureVisibleTab which bypasses CSP
  function captureVisibleTab() {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: 'captureTab' }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (response?.success && response.dataUrl) {
          resolve(response.dataUrl);
        } else {
          reject(new Error(response?.error || 'Capture failed'));
        }
      });
    });
  }

  // ─── Crop image to region ───────────────────────
  function cropImage(dataUrl, x, y, w, h) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const dpr = window.devicePixelRatio || 1;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(
          img,
          x * dpr, y * dpr, w * dpr, h * dpr,
          0, 0, w * dpr, h * dpr
        );
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = dataUrl;
    });
  }

  // ─── Create Floating Dock ───────────────────────
  async function createFloatingDock() {
    if (floatingDock) return;

    // Load settings first
    await loadSettings();
    
    // Check if dock is enabled
    if (!settings.enableDock) {
      return;
    }

    // Load position from storage or use default
    chrome.storage.local.get(['showPillPosition'], (result) => {
      if (result.showPillPosition) {
        dockPosition = result.showPillPosition;
      } else {
        dockPosition = getDefaultPosition();
      }
      renderDock();
    });
  }

  function renderDock() {
    floatingDock = document.createElement('div');
    floatingDock.id = 'show-floating-dock';
    floatingDock.innerHTML = `
      <div class="show-dock-main">
        <div class="show-dock-handle" id="showDockHandle" title="Drag to move">
          <span class="show-dock-brand">Show</span>
        </div>
        <div class="show-dock-divider"></div>
        <button class="show-dock-btn show-dock-snap" id="showDockSnap" title="Take Screenshot">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="6" cy="6" r="3"/><path d="M8.12 8.12 12 12"/><path d="M20 4 8.12 15.88"/>
            <circle cx="6" cy="18" r="3"/><path d="M14.8 14.8 18 18"/>
          </svg>
        </button>
        <button class="show-dock-btn show-dock-fullpage" id="showDockFullPage" title="Full Page">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
        </button>
        <div class="show-dock-divider"></div>
        <button class="show-dock-btn show-dock-open" id="showDockOpen" title="Open Show">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
        </button>
      </div>
    `;

    floatingDock.style.left = `${dockPosition.x}px`;
    floatingDock.style.top = `${dockPosition.y}px`;
    
    // Apply opacity setting
    if (settings.dockOpacity < 100) {
      floatingDock.style.opacity = settings.dockOpacity / 100;
    }
    
    document.body.appendChild(floatingDock);

    // Setup event listeners
    setupDockEvents();
    
    // Restore opacity on hover
    floatingDock.addEventListener('mouseenter', () => {
      floatingDock.style.opacity = '1';
    });
    floatingDock.addEventListener('mouseleave', () => {
      if (settings.dockOpacity < 100 && !isDragging) {
        floatingDock.style.opacity = settings.dockOpacity / 100;
      }
    });
  }

  function setupDockEvents() {
    const handle = document.getElementById('showDockHandle');
    const snapBtn = document.getElementById('showDockSnap');
    const fullPageBtn = document.getElementById('showDockFullPage');
    const openBtn = document.getElementById('showDockOpen');

    // Drag functionality
    handle.addEventListener('mousedown', (e) => {
      isDragging = true;
      const rect = floatingDock.getBoundingClientRect();
      dragOffset = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      floatingDock.classList.add('dragging');
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const x = Math.max(10, Math.min(window.innerWidth - 300, e.clientX - dragOffset.x));
      const y = Math.max(10, Math.min(window.innerHeight - 80, e.clientY - dragOffset.y));
      floatingDock.style.left = `${x}px`;
      floatingDock.style.top = `${y}px`;
      dockPosition = { x, y };
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        floatingDock.classList.remove('dragging');
        // Save position
        chrome.storage.local.set({ showPillPosition: dockPosition });
      }
    });

    // Snap button - region selection
    snapBtn.addEventListener('click', () => {
      floatingDock.style.display = 'none';
      startRegionSelection();
    });

    // Full page capture using Chrome's native API
    fullPageBtn.addEventListener('click', async () => {
      try {
        fullPageBtn.classList.add('loading');
        floatingDock.style.display = 'none';
        
        // Small delay to ensure dock is hidden
        await new Promise(r => setTimeout(r, 100));
        
        // Use Chrome's captureVisibleTab (bypasses CSP)
        const dataUrl = await captureVisibleTab();
        
        // Copy to clipboard if enabled
        if (settings.copyToClipboard) {
          await copyDataUrlToClipboard(dataUrl);
        }
        
        // Send to background for saving
        chrome.runtime.sendMessage({
          action: 'saveCapture',
          dataUrl: dataUrl,
          type: 'screenshot',
          timestamp: Date.now(),
          autoDownload: settings.autoDownload,
        });
        
        floatingDock.style.display = '';
        fullPageBtn.classList.remove('loading');
        showCapturedToast(settings.copyToClipboard ? 'Copied to clipboard!' : 'Captured!');
      } catch (err) {
        console.error('Capture failed:', err);
        floatingDock.style.display = '';
        fullPageBtn.classList.remove('loading');
        showCapturedToast('Capture failed', true);
      }
    });

    // Open Show App
    openBtn.addEventListener('click', () => {
      window.open('https://getshowapp.com', '_blank');
    });
  }

  // ─── Initialize dock on page load ───────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createFloatingDock);
  } else {
    createFloatingDock();
  }

  // ─── Listen for region capture trigger ──────────
  window.addEventListener('show-start-region-select', () => {
    if (floatingDock) floatingDock.style.display = 'none';
    startRegionSelection();
  });

  // Also listen for messages from background
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'startRegionSelect') {
      if (floatingDock) floatingDock.style.display = 'none';
      startRegionSelection();
      sendResponse({ success: true });
    } else if (message.action === 'toggleDock') {
      if (floatingDock) {
        floatingDock.style.display = floatingDock.style.display === 'none' ? '' : 'none';
      }
      sendResponse({ success: true });
    } else if (message.action === 'settingsUpdated') {
      // Update settings and apply changes
      settings = { ...settings, ...message.settings };
      
      if (floatingDock) {
        if (!settings.enableDock) {
          floatingDock.style.display = 'none';
        } else {
          floatingDock.style.display = '';
          floatingDock.style.opacity = settings.dockOpacity / 100;
        }
      } else if (settings.enableDock) {
        // Dock doesn't exist but should be enabled now
        createFloatingDock();
      }
      sendResponse({ success: true });
    } else if (message.action === 'resetDockPosition') {
      // Reset to default position based on setting
      dockPosition = getDefaultPosition();
      if (floatingDock) {
        floatingDock.style.left = `${dockPosition.x}px`;
        floatingDock.style.top = `${dockPosition.y}px`;
      }
      sendResponse({ success: true });
    }
    return false;
  });

  // ─── Region Selection ─────────────────────────────
  function startRegionSelection() {
    if (overlay) removeOverlay();

    // Create full-screen overlay
    overlay = document.createElement('div');
    overlay.id = 'show-capture-overlay';
    overlay.innerHTML = `
      <div class="show-overlay-backdrop"></div>
      <div class="show-selection-box" id="showSelectionBox"></div>
      <div class="show-crosshair" id="showCrosshair">
        <div class="show-crosshair-h"></div>
        <div class="show-crosshair-v"></div>
      </div>
      <div class="show-toolbar" id="showToolbar">
        <div class="show-toolbar-inner">
          <span class="show-toolbar-hint">Click and drag to select a region</span>
          <span class="show-toolbar-size" id="showSize"></span>
          <button class="show-toolbar-btn show-toolbar-cancel" id="showCancel">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Cancel
          </button>
        </div>
      </div>
      <div class="show-dimension-label" id="showDimensionLabel"></div>
    `;
    document.body.appendChild(overlay);

    selectionBox = document.getElementById('showSelectionBox');
    const crosshair = document.getElementById('showCrosshair');
    const toolbar = document.getElementById('showToolbar');
    const sizeLabel = document.getElementById('showSize');
    const dimensionLabel = document.getElementById('showDimensionLabel');
    const cancelBtn = document.getElementById('showCancel');

    // Event handlers
    const onMouseDown = (e) => {
      if (e.target.closest('.show-toolbar')) return;
      isSelecting = true;
      startX = e.clientX;
      startY = e.clientY;
      selectionBox.style.display = 'block';
      selectionBox.style.left = `${startX}px`;
      selectionBox.style.top = `${startY}px`;
      selectionBox.style.width = '0';
      selectionBox.style.height = '0';
      crosshair.style.display = 'none';
    };

    const onMouseMove = (e) => {
      if (!isSelecting) {
        // Show crosshair
        const crosshairH = crosshair.querySelector('.show-crosshair-h');
        const crosshairV = crosshair.querySelector('.show-crosshair-v');
        crosshairH.style.top = `${e.clientY}px`;
        crosshairV.style.left = `${e.clientX}px`;
        return;
      }

      const x = Math.min(e.clientX, startX);
      const y = Math.min(e.clientY, startY);
      const w = Math.abs(e.clientX - startX);
      const h = Math.abs(e.clientY - startY);

      selectionBox.style.left = `${x}px`;
      selectionBox.style.top = `${y}px`;
      selectionBox.style.width = `${w}px`;
      selectionBox.style.height = `${h}px`;

      sizeLabel.textContent = `${w} × ${h}`;
      dimensionLabel.textContent = `${w} × ${h}`;
      dimensionLabel.style.left = `${x + w + 8}px`;
      dimensionLabel.style.top = `${y + h + 8}px`;
      dimensionLabel.style.display = 'block';
    };

    const onMouseUp = (e) => {
      if (!isSelecting) return;
      isSelecting = false;

      const x = Math.min(e.clientX, startX);
      const y = Math.min(e.clientY, startY);
      const w = Math.abs(e.clientX - startX);
      const h = Math.abs(e.clientY - startY);

      if (w < 10 || h < 10) {
        // Too small, cancel
        removeOverlay();
        return;
      }

      // Show confirm toolbar
      showCaptureConfirm(x, y, w, h);
    };

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        removeOverlay();
      }
    };

    cancelBtn.addEventListener('click', () => removeOverlay());
    overlay.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('keydown', onKeyDown);

    // Store cleanup refs
    overlay._cleanup = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('keydown', onKeyDown);
    };
  }

  function showCaptureConfirm(x, y, w, h) {
    // Replace toolbar with capture/annotate/cancel buttons
    const toolbar = document.getElementById('showToolbar');
    if (!toolbar) return;

    toolbar.innerHTML = `
      <div class="show-toolbar-inner">
        <span class="show-toolbar-size">${w} × ${h}</span>
        <div class="show-toolbar-actions">
          <button class="show-toolbar-btn show-toolbar-capture" id="showConfirmCapture">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
              <circle cx="12" cy="13" r="3"/>
            </svg>
            Capture
          </button>
          <button class="show-toolbar-btn show-toolbar-cancel" id="showCancelCapture">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Cancel
          </button>
        </div>
      </div>
    `;

    document.getElementById('showConfirmCapture').addEventListener('click', async () => {
      // Use Chrome's captureVisibleTab then crop to region
      try {
        removeOverlay();
        
        // Wait for overlay to be removed
        await new Promise(r => setTimeout(r, 50));
        
        // Capture the visible tab
        const fullDataUrl = await captureVisibleTab();
        
        // Crop to the selected region
        const dataUrl = await cropImage(fullDataUrl, x, y, w, h);
        
        // Copy to clipboard if enabled
        if (settings.copyToClipboard) {
          await copyDataUrlToClipboard(dataUrl);
        }
        
        // Send to background for saving
        chrome.runtime.sendMessage({
          action: 'saveCapture',
          dataUrl: dataUrl,
          type: 'screenshot',
          timestamp: Date.now(),
          autoDownload: settings.autoDownload,
        });
        
        if (floatingDock) floatingDock.style.display = '';
        showCapturedToast(settings.copyToClipboard ? 'Copied to clipboard!' : 'Region captured!');
      } catch (err) {
        console.error('Region capture failed:', err);
        if (floatingDock) floatingDock.style.display = '';
        showCapturedToast('Capture failed', true);
      }
    });

    document.getElementById('showCancelCapture').addEventListener('click', () => {
      removeOverlay();
      if (floatingDock) floatingDock.style.display = '';
    });
  }

  function removeOverlay() {
    if (overlay) {
      if (overlay._cleanup) overlay._cleanup();
      overlay.remove();
      overlay = null;
      selectionBox = null;
      isSelecting = false;
    }
  }

  function showCapturedToast(message = 'Captured!', isError = false) {
    // Remove any existing toast
    const existing = document.querySelector('.show-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'show-toast' + (isError ? ' error' : '');
    const icon = isError 
      ? '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'
      : '<polyline points="20,6 9,17 4,12"/>';
    toast.innerHTML = `
      <div class="show-toast-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          ${icon}
        </svg>
      </div>
      <span>${message}</span>
    `;
    document.body.appendChild(toast);
    // Double-RAF to ensure the initial state renders before animating
    requestAnimationFrame(() => {
      requestAnimationFrame(() => toast.classList.add('show'));
    });
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  }

  // ─── Copy dataUrl to Clipboard ────────────────────
  async function copyDataUrlToClipboard(dataUrl) {
    try {
      // Convert dataUrl to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      return true;
    } catch (err) {
      console.warn('Clipboard write failed:', err);
    }
    return false;
  }
})();
