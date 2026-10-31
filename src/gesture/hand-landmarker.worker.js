const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
const MEDIAPIPE_BASE_URL =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.0';
const WASM_URL = `${MEDIAPIPE_BASE_URL}/wasm`;

let handLandmarker = null;
let lastTimestamp = -1;
let visionTasks = null;

async function createLandmarker(delegate, fileset) {
  return visionTasks.HandLandmarker.createFromOptions(fileset, {
    baseOptions: {
      modelAssetPath: MODEL_URL,
      delegate,
    },
    runningMode: 'VIDEO',
    numHands: 1,
    minHandDetectionConfidence: 0.55,
    minHandPresenceConfidence: 0.55,
    minTrackingConfidence: 0.55,
  });
}

async function initialize() {
  try {
    if (!visionTasks) {
      importScripts(`${MEDIAPIPE_BASE_URL}/vision_bundle.js`);
      visionTasks = self.Vision;
      if (
        typeof visionTasks?.FilesetResolver !== 'function' ||
        typeof visionTasks.HandLandmarker !== 'function'
      ) {
        throw new Error('The MediaPipe vision bundle did not expose the expected APIs.');
      }
    }

    const fileset = await visionTasks.FilesetResolver.forVisionTasks(WASM_URL);
    try {
      handLandmarker = await createLandmarker('GPU', fileset);
      self.postMessage({ type: 'ready', delegate: 'GPU' });
    } catch {
      handLandmarker = await createLandmarker('CPU', fileset);
      self.postMessage({
        type: 'ready',
        delegate: 'CPU',
        notice: 'GPU acceleration is unavailable; using CPU inference.',
      });
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    self.postMessage({
      type: 'error',
      message: `Hand tracker could not start. MediaPipe could not load its model or vision runtime. Check your internet connection and try again. Details: ${detail}`,
    });
  }
}

self.onmessage = (event) => {
  const message = event.data;
  if (message.type === 'initialize') {
    void initialize();
    return;
  }
  if (message.type === 'dispose') {
    handLandmarker?.close();
    handLandmarker = null;
    self.postMessage({ type: 'disposed' });
    return;
  }
  if (message.type !== 'frame' || !handLandmarker) {
    message.bitmap?.close();
    return;
  }

  const { bitmap, timestamp } = message;
  try {
    const frameTimestamp = Math.max(timestamp, lastTimestamp + 1);
    lastTimestamp = frameTimestamp;
    const result = handLandmarker.detectForVideo(bitmap, frameTimestamp);
    self.postMessage({
      type: 'result',
      timestamp: frameTimestamp,
      landmarks: result.landmarks[0] ?? null,
    });
  } catch (error) {
    self.postMessage({
      type: 'error',
      message: `Hand tracking failed: ${error.message}`,
    });
  } finally {
    bitmap.close();
  }
};

self.postMessage({ type: 'loading' });
