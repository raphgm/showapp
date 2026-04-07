// ═══════════════════════════════════════════════════
// Show Chrome Extension – Popup Logic
// Show Pill design with horizontal action row
// ═══════════════════════════════════════════════════

// ─── DOM References ─────────────────────────────────
const btnRecord     = document.getElementById('btnRecord');
const btnSnap       = document.getElementById('btnSnap');
const btnShare      = document.getElementById('btnShare');
const btnStopRec    = document.getElementById('btnStopRec');
const btnOpenApp    = document.getElementById('btnOpenApp');
const btnSettings   = document.getElementById('btnSettings');
const snapOptions   = document.getElementById('snapOptions');
const recordingBar  = document.getElementById('recordingBar');
const recTimer      = document.getElementById('recTimer');
const recentList    = document.getElementById('recentList');
const recentCount   = document.getElementById('recentCount');
const tabHost       = document.getElementById('tabHost');
const statusDot     = document.getElementById('statusDot');
const pillLabel     = document.getElementById('pillLabel');
const toast         = document.getElementById('toast');

// ─── State ──────────────────────────────────────────
let isRecording = false;
let recordingStartTime = null;
let timerInterval = null;
let snapOptionsOpen = false;

// ─── Init ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  await updateConnectionStatus();
  await loadRecentCaptures();
  await checkRecordingState();
  setupSnapOptions();
});

// ─── Connection Status ──────────────────────────────
async function updateConnectionStatus() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url) {
      const url = new URL(tab.url);
      tabHost.textContent = url.hostname.replace('www.', '');
      statusDot.classList.remove('disconnected');
    } else {
      tabHost.textContent = 'Ready';
      statusDot.classList.add('disconnected');
    }
  } catch (e) {
    tabHost.textContent = 'Ready';
    statusDot.classList.remove('disconnected');
  }
}

// ─── RECORD button → Start / Stop Recording ─────────
btnRecord.addEventListener('click', async () => {
  if (isRecording) {
    stopRecording();
  } else {
    startRecording();
  }
});

async function startRecording() {
  try {
    chrome.runtime.sendMessage({ action: 'startRecording' }, (response) => {
      if (response && response.success) {
        isRecording = true;
        recordingStartTime = Date.now();
        updateRecordingUI();
        showToast('Recording started', 'success');
      } else {
        showToast(response?.error || 'Could not start recording', 'error');
      }
    });
  } catch (err) {
    console.error('Recording error:', err);
    showToast('Recording failed', 'error');
  }
}

function stopRecording() {
  chrome.runtime.sendMessage({ action: 'stopRecording' }, (response) => {
    isRecording = false;
    recordingStartTime = null;
    clearInterval(timerInterval);
    updateRecordingUI();
    if (response && response.success) {
      showToast('Recording saved!', 'success');
      loadRecentCaptures();
    }
  });
}

async function checkRecordingState() {
  chrome.runtime.sendMessage({ action: 'getRecordingState' }, (response) => {
    if (response && response.isRecording) {
      isRecording = true;
      recordingStartTime = response.startTime;
      updateRecordingUI();
    }
  });
}

function updateRecordingUI() {
  const recordText = btnRecord.querySelector('.btn-record-text');
  const labelText = pillLabel.querySelector('.pill-label-text');
  
  if (isRecording) {
    recordingBar.classList.remove('hidden');
    btnRecord.classList.add('recording');
    recordText.textContent = 'STOP';
    pillLabel.classList.add('recording');
    labelText.textContent = 'ON AIR';

    timerInterval = setInterval(() => {
      if (recordingStartTime) {
        const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
        const mins = Math.floor(elapsed / 60);
        const secs = String(elapsed % 60).padStart(2, '0');
        recTimer.textContent = `${mins}:${secs}`;
      }
    }, 1000);
  } else {
    recordingBar.classList.add('hidden');
    btnRecord.classList.remove('recording');
    recordText.textContent = 'RECORD';
    pillLabel.classList.remove('recording');
    labelText.textContent = 'SHOW PILL';
    clearInterval(timerInterval);
    recTimer.textContent = '0:00';
  }
}

btnStopRec.addEventListener('click', () => {
  stopRecording();
});

// ─── SNAP button → Screenshot options ───────────────
function setupSnapOptions() {
  const snapOptionBtns = snapOptions.querySelectorAll('.snap-option');
  snapOptionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      captureScreenshot(mode);
      closeSnapOptions();
    });
  });
}

btnSnap.addEventListener('click', () => {
  if (snapOptionsOpen) {
    closeSnapOptions();
  } else {
    openSnapOptions();
  }
});

function openSnapOptions() {
  snapOptions.classList.remove('hidden');
  btnSnap.classList.add('active');
  snapOptionsOpen = true;
}

function closeSnapOptions() {
  snapOptions.classList.add('hidden');
  btnSnap.classList.remove('active');
  snapOptionsOpen = false;
}

async function captureScreenshot(mode = 'fullscreen') {
  try {
    showToast('Capturing...', 'default');
    chrome.runtime.sendMessage({ action: 'captureScreenshot', mode }, (response) => {
      if (response && response.success) {
        showToast('Screenshot saved!', 'success');
        loadRecentCaptures();
      } else {
        showToast('Capture failed', 'error');
      }
    });
  } catch (err) {
    console.error('Capture error:', err);
    showToast('Capture failed', 'error');
  }
}

// Close snap options when clicking outside
document.addEventListener('click', (e) => {
  if (snapOptionsOpen && !btnSnap.contains(e.target) && !snapOptions.contains(e.target)) {
    closeSnapOptions();
  }
});

// ─── SHARE → Copy link / share latest capture ───────
btnShare.addEventListener('click', async () => {
  try {
    const { captures = [] } = await chrome.storage.local.get('captures');
    if (captures.length === 0) {
      showToast('No captures to share yet', 'default');
      return;
    }
    const latest = captures[0];
    if (latest.dataUrl) {
      await navigator.clipboard.writeText(latest.dataUrl.slice(0, 100) + '…');
      showToast('Latest capture copied!', 'success');
    } else {
      showToast('No shareable content', 'default');
    }
  } catch (err) {
    // Fallback: open the app to share
    chrome.tabs.create({ url: 'https://getshowapp.com' });
    window.close();
  }
});

// ─── Recent Captures ────────────────────────────────
async function loadRecentCaptures() {
  try {
    const { captures = [] } = await chrome.storage.local.get('captures');
    renderRecentCaptures(captures.slice(0, 4));
    recentCount.textContent = captures.length ? `${captures.length}` : '';
  } catch (err) {
    console.error('Load recent error:', err);
  }
}

function renderRecentCaptures(captures) {
  if (!captures.length) {
    recentList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
            <circle cx="12" cy="13" r="3"/>
          </svg>
        </div>
        <span class="empty-title">No captures yet</span>
        <span class="empty-desc">Press ⌘+Shift+S to capture</span>
      </div>`;
    return;
  }

  recentList.innerHTML = captures.map((capture, i) => {
    const isRec = capture.type === 'recording';
    const thumbClass = isRec ? 'recording-thumb' : 'screenshot-thumb';
    const icon = isRec
      ? '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.934a.5.5 0 0 0-.777-.416L16 11"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>'
      : '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>';

    return `
      <div class="recent-item" data-index="${i}">
        <div class="recent-item-thumb ${thumbClass}">${icon}</div>
        <div class="recent-item-info">
          <div class="recent-item-title">${escapeHtml(capture.title)}</div>
          <span class="recent-item-time">${capture.timeAgo || formatTimeAgo(capture.timestamp)}</span>
        </div>
        <div class="recent-item-arrow">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7,7 17,7 17,17"/>
          </svg>
        </div>
      </div>`;
  }).join('');

  // Click to preview
  recentList.querySelectorAll('.recent-item').forEach(item => {
    item.addEventListener('click', () => previewCapture(parseInt(item.dataset.index)));
  });
}

function previewCapture(index) {
  chrome.runtime.sendMessage({ action: 'previewCapture', index });
}

// ─── Navigation ─────────────────────────────────────
btnOpenApp.addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://getshowapp.com' });
  window.close();
});

btnSettings.addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

// ─── Toast ──────────────────────────────────────────
function showToast(message, type = 'default') {
  toast.textContent = message;
  toast.className = 'toast';
  if (type === 'success') toast.classList.add('success');
  if (type === 'error') toast.classList.add('error');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}

// ─── Utilities ──────────────────────────────────────
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatTimeAgo(timestamp) {
  if (!timestamp) return '';
  const diff = Math.floor((Date.now() - timestamp) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
