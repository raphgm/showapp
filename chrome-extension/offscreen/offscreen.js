// ─── Show Extension – Offscreen Document ────────────
// Handles canvas operations and MediaRecorder (which need DOM access)

let mediaRecorder = null;
let recordedChunks = [];
let recordingStartTime = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'cropImage':
      handleCropImage(message.dataUrl, message.region, sendResponse);
      return true;

    case 'offscreen-startRecording':
      handleStartRecording(message.streamId, sendResponse);
      return true;

    case 'offscreen-stopRecording':
      handleStopRecording(sendResponse);
      return true;

    default:
      return false;
  }
});

// ─── Image Cropping ─────────────────────────────────
async function handleCropImage(dataUrl, region, sendResponse) {
  try {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Account for device pixel ratio
      const dpr = region.devicePixelRatio || 1;
      canvas.width = region.width * dpr;
      canvas.height = region.height * dpr;

      ctx.drawImage(
        img,
        region.x * dpr,
        region.y * dpr,
        region.width * dpr,
        region.height * dpr,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const croppedDataUrl = canvas.toDataURL('image/png');
      sendResponse({ croppedDataUrl });
    };
    img.onerror = () => {
      sendResponse({ croppedDataUrl: null });
    };
    img.src = dataUrl;
  } catch (err) {
    console.error('Crop error:', err);
    sendResponse({ croppedDataUrl: null });
  }
}

// ─── Screen Recording ───────────────────────────────
async function handleStartRecording(streamId, sendResponse) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: streamId,
        },
      },
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: streamId,
          maxWidth: 1920,
          maxHeight: 1080,
        },
      },
    });

    recordedChunks = [];
    recordingStartTime = Date.now();

    mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 3000000,
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      // Stop all tracks
      stream.getTracks().forEach((track) => track.stop());
    };

    mediaRecorder.start(1000); // Collect data every second

    sendResponse({ success: true });
  } catch (err) {
    console.error('Recording start error:', err);
    sendResponse({ success: false, error: err.message });
  }
}

async function handleStopRecording(sendResponse) {
  try {
    if (!mediaRecorder || mediaRecorder.state === 'inactive') {
      sendResponse({ success: false, error: 'Not recording' });
      return;
    }

    const duration = recordingStartTime ? Date.now() - recordingStartTime : 0;

    mediaRecorder.onstop = async () => {
      // Stop all tracks
      if (mediaRecorder.stream) {
        mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      }

      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      recordedChunks = [];
      recordingStartTime = null;

      // Convert to data URL (note: large recordings may exceed storage limits)
      const reader = new FileReader();
      reader.onload = () => {
        sendResponse({ dataUrl: reader.result, duration });
      };
      reader.onerror = () => {
        sendResponse({ success: false, error: 'Failed to read recording' });
      };
      reader.readAsDataURL(blob);
    };

    mediaRecorder.stop();
    mediaRecorder = null;
  } catch (err) {
    console.error('Recording stop error:', err);
    sendResponse({ success: false, error: err.message });
  }
}
