# Barbie's Dreamhouse

An interactive Three.js dollhouse with optional webcam-based hand gesture controls.

## Run locally

```bash
npm install
npm run dev
```

Gesture camera access is supported on `localhost` and secure HTTPS origins. The webcam starts only after selecting **Enable gesture controls** and granting the browser camera permission. Select **Turn camera off** to stop every camera track and dispose of the hand-tracking worker.

## Hand gesture controls

The app uses Google's official `@mediapipe/tasks-vision` Hand Landmarker in `VIDEO` mode. The version-pinned MediaPipe vision bundle and WASM runtime are loaded lazily from jsDelivr in a classic worker when gesture controls are enabled, so the WASM bootstrap can register the `ModuleFactory` expected by the vision runtime. The worker first requests the GPU delegate and falls back to CPU if GPU setup is unavailable. The official hand-landmarker model is fetched from Google Cloud Storage.

| Gesture | Action |
| --- | --- |
| Open palm, move hand | Rotate the Dreamhouse camera |
| Pinch thumb and index finger | Select the object under the mirrored hand cursor |
| Hold a steady open palm for about two seconds | Reset the camera |
| Thumbs up | Toggle day/night lighting |

Pinches trigger once until released. Camera movement is smoothed and capped, and reduced-motion preferences disable the automatic hand-motion response. Mouse, touch, keyboard, room buttons, and the regular lighting controls remain available while gesture controls are enabled.

## Performance and compatibility

Inference is limited to about 20 frames per second, uses transferable `ImageBitmap` frames in a worker to keep MediaPipe off the rendering thread, and pauses while the tab is hidden. A normal webcam is requested at up to 640×480 and 24 FPS. GPU delegation depends on browser/device support; CPU fallback is provided. Inference speed and camera availability vary by device.

Camera access requires browser permission and HTTPS or `localhost`. If permission is denied, the browser has no available camera, or another application is using it, the panel explains the issue and lets you retry.

## Privacy

Camera access is off by default. After explicit opt-in, video frames are processed locally in your browser by MediaPipe; the app does not upload, record, or store camera frames or hand landmarks. The hand-landmarker model and WASM runtime are downloaded from the listed public hosts when needed. Disabling gesture controls stops all camera tracks and closes the tracking worker.

## Validation notes

Run `npm run build` to validate the production bundle. Gesture geometry can be checked without a camera, but successful live landmark detection and physical gesture behavior require a real webcam and must be tested on the target browser/device. No hardware-camera test is claimed by this project report.
