const panelElement = document.querySelector('#gesture-panel');
const video = document.querySelector('#gesture-video');
const enableButton = document.querySelector('#gesture-enable');
const disableButton = document.querySelector('#gesture-disable');
const statusElement = document.querySelector('#gesture-status');
const gestureElement = document.querySelector('#gesture-label');
const marker = document.querySelector('#gesture-marker');
const placeholder = document.querySelector('#gesture-placeholder');
const spinner = document.querySelector('#gesture-spinner');

if (
  !panelElement ||
  !(video instanceof HTMLVideoElement) ||
  !enableButton ||
  !disableButton ||
  !statusElement ||
  !gestureElement ||
  !marker ||
  !placeholder ||
  !spinner
) {
  throw new Error('One or more hand-gesture controls are missing from index.html.');
}

export function createGesturePanel() {
  let enableHandler = null;
  let disableHandler = null;

  function onEnableClick() {
    enableHandler?.();
  }
  function onDisableClick() {
    disableHandler?.();
  }
  function onLoadedMetadata() {
    setCameraActive(true);
  }

  function setStatus(state, message) {
    panelElement.dataset.state = state;
    statusElement.textContent = message;
    statusElement.setAttribute('role', state === 'error' ? 'alert' : 'status');
    spinner.hidden = state !== 'requesting' && state !== 'loading';
  }

  function setCameraActive(active) {
    video.hidden = !active;
    placeholder.hidden = active;
  }

  enableButton.addEventListener('click', onEnableClick);
  disableButton.addEventListener('click', onDisableClick);
  video.addEventListener('loadedmetadata', onLoadedMetadata);

  setCameraActive(false);
  setStatus('off', 'Camera is off. Enable to start gesture controls.');

  return {
    video,
    setEnabled(enabled) {
      enableButton.hidden = enabled;
      disableButton.hidden = !enabled;
    },
    setCameraActive,
    setStatus,
    setError(message) {
      setCameraActive(false);
      setStatus('error', message);
    },
    setGesture(gesture) {
      gestureElement.textContent = gesture;
      gestureElement.dataset.active = String(
        gesture.startsWith('Open palm') ||
          gesture.startsWith('Pinch') ||
          gesture.startsWith('Thumbs up'),
      );
    },
    setCursor(point) {
      marker.hidden = !point;
      if (!point) return;
      marker.style.left = `${Math.max(0, Math.min(1, point.x)) * 100}%`;
      marker.style.top = `${Math.max(0, Math.min(1, point.y)) * 100}%`;
    },
    onEnable(handler) {
      enableHandler = handler;
    },
    onDisable(handler) {
      disableHandler = handler;
    },
    destroy() {
      enableButton.removeEventListener('click', onEnableClick);
      disableButton.removeEventListener('click', onDisableClick);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      enableHandler = null;
      disableHandler = null;
    },
  };
}
