const TARGET_INFERENCE_INTERVAL_MS = 1000 / 20;
const DISPOSE_TIMEOUT_MS = 500;

export class HandTracker {
  constructor({ onResults, onError, onVisibilityChange }) {
    this.onResults = onResults;
    this.onError = onError;
    this.onVisibilityChange = onVisibilityChange;
    this.worker = null;
    this.video = null;
    this.active = false;
    this.busy = false;
    this.rafId = 0;
    this.lastInferenceAt = 0;
    this.lastVideoTime = -1;
    this.initialized = false;
    this.initialization = null;
    this.disposal = null;
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handleWorkerMessage = this.handleWorkerMessage.bind(this);
    this.handleWorkerError = this.handleWorkerError.bind(this);
    this.tick = this.tick.bind(this);
  }

  async start(video) {
    if (this.active) return;
    this.active = true;
    this.video = video;
    this.worker = new Worker(new URL('./hand-landmarker.worker.js', import.meta.url), {
      name: 'dreamhouse-hand-landmarker',
    });
    this.worker.addEventListener('message', this.handleWorkerMessage);
    this.worker.addEventListener('error', this.handleWorkerError);
    this.initialization = {};
    const ready = new Promise((resolve, reject) => {
      this.initialization.resolve = resolve;
      this.initialization.reject = reject;
    });
    this.worker.postMessage({ type: 'initialize' });
    try {
      const delegate = await ready;
      if (!this.active) throw new DOMException('Hand tracking was stopped.', 'AbortError');
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
      this.schedule();
      return delegate;
    } catch (error) {
      if (this.active) await this.stop();
      throw error;
    }
  }

  handleWorkerMessage(event) {
    const message = event.data;
    if (message.type === 'loading') return;
    if (message.type === 'ready') {
      this.initialized = true;
      this.initialization?.resolve(message.delegate);
      this.initialization = null;
      return;
    }
    if (message.type === 'disposed') {
      this.disposal?.();
      this.disposal = null;
      return;
    }
    if (message.type === 'result') {
      this.busy = false;
      if (this.active && !document.hidden) {
        this.onResults(message.landmarks, message.timestamp);
      }
      return;
    }
    if (message.type === 'error') {
      const error = new Error(message.message);
      if (this.initialization) {
        this.initialization.reject(error);
        this.initialization = null;
      } else {
        this.busy = false;
        this.onError(error);
      }
    }
  }

  handleWorkerError(event) {
    const error = new Error(event.message || 'The hand-tracking worker stopped unexpectedly.');
    if (this.initialization) {
      this.initialization.reject(error);
      this.initialization = null;
    } else {
      this.busy = false;
      this.onError(error);
    }
  }

  handleVisibilityChange() {
    if (document.hidden) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
      this.onVisibilityChange(false);
    } else {
      this.lastVideoTime = -1;
      this.onVisibilityChange(true);
      this.schedule();
    }
  }

  schedule() {
    if (this.active && !document.hidden && !this.rafId) {
      this.rafId = requestAnimationFrame(this.tick);
    }
  }

  async tick(now) {
    this.rafId = 0;
    if (!this.active || document.hidden) return;
    this.schedule();
    if (
      this.busy ||
      !this.video?.videoWidth ||
      this.video.currentTime === this.lastVideoTime ||
      now - this.lastInferenceAt < TARGET_INFERENCE_INTERVAL_MS
    ) {
      return;
    }

    this.busy = true;
    this.lastInferenceAt = now;
    this.lastVideoTime = this.video.currentTime;
    let bitmap;
    try {
      bitmap = await createImageBitmap(this.video);
      if (!this.active || document.hidden) {
        bitmap.close();
        this.busy = false;
        return;
      }
      this.worker.postMessage({ type: 'frame', bitmap, timestamp: now }, [bitmap]);
    } catch (error) {
      bitmap?.close();
      this.busy = false;
      if (this.active) this.onError(error);
    }
  }

  async stop() {
    this.active = false;
    cancelAnimationFrame(this.rafId);
    this.rafId = 0;
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    this.busy = false;
    if (this.initialization) {
      const pending = this.initialization;
      this.initialization = null;
      pending.reject(new DOMException('Hand tracking was stopped.', 'AbortError'));
    }

    const worker = this.worker;
    this.worker = null;
    const initialized = this.initialized;
    this.initialized = false;
    this.video = null;
    if (!worker) return;

    worker.removeEventListener('error', this.handleWorkerError);
    if (initialized) {
      await new Promise((resolve) => {
        const timeout = setTimeout(resolve, DISPOSE_TIMEOUT_MS);
        this.disposal = () => {
          clearTimeout(timeout);
          resolve();
        };
        worker.postMessage({ type: 'dispose' });
      });
    }
    worker.removeEventListener('message', this.handleWorkerMessage);
    worker.terminate();
    this.disposal = null;
  }
}
