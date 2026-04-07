# Show – Chrome Extension

> Capture, record, annotate and share your screen instantly from any website.

## Features

- 📸 **Full-page screenshot** — One-click capture of any tab
- 🔲 **Region capture** — Click and drag to select a specific area
- 🎥 **Screen recording** — Record any tab, window, or entire screen (WebM)
- ⌨️ **Keyboard shortcuts** — `⌘+Shift+S` (capture), `⌘+Shift+R` (record)
- 📂 **Capture history** — Browse, download, and manage recent captures
- ⚙️ **Configurable** — Format, quality, auto-download, and notification settings

## Installation (Developer Mode)

Since the extension isn't on the Chrome Web Store yet, load it as an unpacked extension:

1. **Generate icons** (first time only):
   - Open `chrome-extension/icons/generate-icons.html` in your browser
   - Click **"Generate & Download All"**
   - Move the 4 downloaded PNG files into `chrome-extension/icons/`
   - Or run `cd chrome-extension/icons && node generate-icons.js` (requires `npm i canvas`)

2. **Load in Chrome**:
   - Open Chrome and go to `chrome://extensions`
   - Enable **"Developer mode"** (toggle in top right)
   - Click **"Load unpacked"**
   - Select the `chrome-extension` folder

3. **Pin the extension**:
   - Click the puzzle piece icon in Chrome's toolbar
   - Find **"Show – Screen Capture & Record"**
   - Click the 📌 pin icon

## Usage

### Quick Capture (Screenshot)
- Click the **Show** icon in toolbar → **Capture** button
- Or press `⌘+Shift+S` (Mac) / `Ctrl+Shift+S` (Windows/Linux)

### Region Capture
- Click the **Show** icon → **Region** button
- Click and drag to select the area you want
- Click **Capture** in the floating toolbar to confirm

### Screen Recording
- Click the **Show** icon → **Record** button
- Select what to record (tab, window, or screen)
- Press the **Stop** button or `⌘+Shift+R` when finished
- Recording is saved as WebM video

### Recent Captures
- All captures appear in the popup under **Recent**
- Hover to reveal **download** and **delete** buttons
- Click a capture to preview it in a new tab

### Settings
- Click the ⚙️ **Settings** link at the bottom of the popup
- Configure format, quality, auto-download, notifications
- Customize keyboard shortcuts at `chrome://extensions/shortcuts`

## File Structure

```
chrome-extension/
├── manifest.json              # Extension manifest (MV3)
├── background/
│   └── service-worker.js      # Background service worker
├── popup/
│   ├── popup.html             # Popup UI
│   ├── popup.css              # Popup styles
│   └── popup.js               # Popup logic
├── content/
│   ├── content.js             # Content script (region selection)
│   └── content.css            # Content script styles
├── offscreen/
│   ├── offscreen.html         # Offscreen document
│   └── offscreen.js           # Canvas & MediaRecorder ops
├── options/
│   └── options.html           # Settings page
├── icons/
│   ├── icon16.png             # 16x16 toolbar icon
│   ├── icon32.png             # 32x32 icon
│   ├── icon48.png             # 48x48 icon
│   ├── icon128.png            # 128x128 store icon
│   ├── generate-icons.js      # Node script to generate icons
│   └── generate-icons.html    # Browser-based icon generator
└── README.md                  # This file
```

## Keyboard Shortcuts

| Action            | Mac              | Windows/Linux      |
|-------------------|------------------|--------------------|
| Quick capture     | `⌘+Shift+S`     | `Ctrl+Shift+S`     |
| Start/stop record | `⌘+Shift+R`     | `Ctrl+Shift+R`     |

## Tech Stack

- **Manifest V3** — Latest Chrome extension architecture
- **chrome.desktopCapture** — For screen/window/tab recording
- **chrome.tabs.captureVisibleTab** — For screenshots
- **Offscreen Document** — Canvas cropping & MediaRecorder
- **chrome.storage.local** — Capture history & settings persistence

## Development

To modify the extension:

1. Edit files in `chrome-extension/`
2. Go to `chrome://extensions`
3. Click the 🔄 refresh icon on the Show extension card
4. Changes take effect immediately (popup may need to be re-opened)

## Notes

- Recordings are stored as base64 data URLs in `chrome.storage.local`. Very long recordings may exceed storage limits — a future version will use IndexedDB or file-based storage.
- The extension connects to `getshowapp.com` for the "Open Show" link only. No data is sent externally.
