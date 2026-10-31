import { createGestureRecognizer } from './GestureRecognizer.js';
import { HandTracker } from './HandTracker.js';
import { WebcamManager } from './WebcamManager.js';

const MOVEMENT_SMOOTHING = 0.28;
const CAMERA_SENSITIVITY = 2.8;
const MAX_ROTATION_STEP = 0.065;

function describeCameraError(error) {
  if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
    return 'Camera permission was denied. Allow camera access in your browser settings, then try again.';
  }
  if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
    return 'No camera was found. Connect a webcam and try again.';
  }
  if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
    return 'The camera is already in use by another app. Close it there and try again.';
  }
  if (error.name === 'OverconstrainedError') {
    return 'The camera cannot meet the requested video settings.';
  }
  if (error.name === 'AbortError') return 'Camera setup was cancelled.';
  return error.message || 'Camera setup failed. Check your camera and browser permissions.';
}

export function createGestureController({
  video,
  panel,
  scene,
  ui,
  interactions,
}) {
  const webcam = new WebcamManager(video);
  const recognizer = createGestureRecognizer();
  let generation = 0;
  let enabled = false;
  let smoothedPalm = null;

  const tracker = new HandTracker({
    onResults(landmarks, timestamp) {
      if (!enabled) return;
      const result = recognizer.update(landmarks, timestamp);
      panel.setGesture(result.gesture);
      panel.setCursor(result.cursor);

      if (result.gesture === 'open-palm' && result.cursor) {
        if (smoothedPalm) {
          const x = smoothedPalm.x + (result.cursor.x - smoothedPalm.x) * MOVEMENT_SMOOTHING;
          const y = smoothedPalm.y + (result.cursor.y - smoothedPalm.y) * MOVEMENT_SMOOTHING;
          const deltaX = Math.max(-MAX_ROTATION_STEP, Math.min(MAX_ROTATION_STEP, (x - smoothedPalm.x) * CAMERA_SENSITIVITY));
          const deltaY = Math.max(-MAX_ROTATION_STEP, Math.min(MAX_ROTATION_STEP, (y - smoothedPalm.y) * CAMERA_SENSITIVITY));
          scene.rotateByGesture(deltaX, deltaY);
          smoothedPalm.x = x;
          smoothedPalm.y = y;
        } else {
          smoothedPalm = { ...result.cursor };
        }
      } else {
        smoothedPalm = null;
      }

      if (result.pinchStarted && result.pinchPoint) {
        const selected = interactions.selectAtNormalizedCoordinates(
          result.pinchPoint.x,
          result.pinchPoint.y,
        );
        if (selected) panel.setGesture('Pinch — object selected');
      }
      if (result.resetTriggered) {
        scene.resetView();
        ui.showRoom('living');
        panel.setGesture('Open palm — view reset');
      }
      if (result.thumbUpStarted) {
        ui.toggleDayNight();
        panel.setGesture('Thumbs up — lighting changed');
      }
    },
    onError(error) {
      void fail(error);
    },
    onVisibilityChange(visible) {
      recognizer.reset();
      smoothedPalm = null;
      if (enabled) {
        panel.setGesture('No hand detected');
        panel.setCursor(null);
        panel.setStatus(
          visible ? 'tracking' : 'paused',
          visible
            ? 'Hand tracking resumed.'
            : 'Tracking paused while this tab is in the background.',
        );
      }
    },
  });

  async function stopResources() {
    const stopResults = await Promise.allSettled([webcam.stop(), tracker.stop()]);
    const failures = stopResults.filter((result) => result.status === 'rejected');
    if (failures.length) {
      throw new AggregateError(
        failures.map((result) => result.reason),
        'One or more gesture-control resources could not be stopped cleanly.',
      );
    }
  }

  async function disable() {
    generation += 1;
    enabled = false;
    recognizer.reset();
    smoothedPalm = null;
    try {
      await stopResources();
      panel.setEnabled(false);
      panel.setCameraActive(false);
      panel.setGesture('No hand detected');
      panel.setCursor(null);
      panel.setStatus('off', 'Camera is off. Enable to start gesture controls.');
    } catch (error) {
      panel.setEnabled(false);
      panel.setError(`Gesture controls stopped with a cleanup error: ${error.message}`);
    }
  }

  async function fail(error) {
    if (!enabled) return;
    generation += 1;
    enabled = false;
    recognizer.reset();
    smoothedPalm = null;
    try {
      await stopResources();
    } catch (cleanupError) {
      panel.setError(
        `${describeCameraError(error)} Cleanup also reported: ${cleanupError.message}`,
      );
      panel.setEnabled(false);
      return;
    }
    panel.setEnabled(false);
    panel.setCameraActive(false);
    panel.setGesture('No hand detected');
    panel.setCursor(null);
    panel.setError(describeCameraError(error));
  }

  async function enable() {
    if (enabled) return;
    const currentGeneration = ++generation;
    enabled = true;
    recognizer.reset();
    panel.setEnabled(true);
    panel.setStatus('requesting', 'Waiting for camera permission…');

    try {
      const activeVideo = await webcam.start();
      if (!enabled || generation !== currentGeneration) return;
      panel.setCameraActive(true);
      panel.setStatus('loading', 'Loading the hand tracker…');
      const delegate = await tracker.start(activeVideo);
      if (!enabled || generation !== currentGeneration) return;
      panel.setStatus(
        'tracking',
        `Camera is on. Hand tracking is live (${delegate}). Video stays on this device.`,
      );
    } catch (error) {
      if (!enabled || generation !== currentGeneration) return;
      await fail(error);
    }
  }

  panel.onEnable(() => {
    void enable();
  });
  panel.onDisable(() => {
    void disable();
  });

  return {
    async destroy() {
      await disable();
      panel.destroy();
    },
  };
}
