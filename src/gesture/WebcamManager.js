function stopTracks(stream) {
  if (!stream) return;
  for (const track of stream.getTracks()) {
    track.stop();
  }
}

export class WebcamManager {
  constructor(video) {
    this.video = video;
    this.stream = null;
    this.requestId = 0;
  }

  async start() {
    const requestId = ++this.requestId;
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error(
        window.isSecureContext
          ? 'Camera access is not available in this browser.'
          : 'Camera access requires HTTPS or localhost.',
      );
    }

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 24, max: 30 },
        },
      });
    } catch (error) {
      throw error;
    }

    if (requestId !== this.requestId) {
      stopTracks(stream);
      throw new DOMException('Camera start was cancelled.', 'AbortError');
    }

    this.stream = stream;
    this.video.srcObject = stream;
    try {
      await this.video.play();
    } catch (error) {
      await this.stop();
      throw error;
    }
    return this.video;
  }

  async stop() {
    this.requestId += 1;
    const stream = this.stream;
    this.stream = null;
    stopTracks(stream);
    this.video.pause();
    this.video.srcObject = null;
  }
}
