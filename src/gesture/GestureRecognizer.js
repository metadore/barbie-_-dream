const PINCH_START_RATIO = 0.34;
const PINCH_RELEASE_RATIO = 0.52;
const OPEN_PALM_RESET_MS = 2000;
const OPEN_PALM_STABILITY_RADIUS = 0.045;

const WRIST = 0;
const THUMB_TIP = 4;
const THUMB_MCP = 2;
const INDEX_MCP = 5;
const INDEX_TIP = 8;
const FINGER_JOINTS = [
  { pip: 6, tip: 8 },
  { pip: 10, tip: 12 },
  { pip: 14, tip: 16 },
  { pip: 18, tip: 20 },
];

function distanceBetween(first, second) {
  const x = first.x - second.x;
  const y = first.y - second.y;
  const z = (first.z ?? 0) - (second.z ?? 0);
  return Math.hypot(x, y, z);
}

function isFingerExtended(landmarks, { pip, tip }) {
  return (
    distanceBetween(landmarks[WRIST], landmarks[tip]) >
    distanceBetween(landmarks[WRIST], landmarks[pip]) * 1.13
  );
}

function getPalmCenter(landmarks) {
  return {
    x:
      (landmarks[WRIST].x +
        landmarks[INDEX_MCP].x +
        landmarks[9].x +
        landmarks[17].x) /
      4,
    y:
      (landmarks[WRIST].y +
        landmarks[INDEX_MCP].y +
        landmarks[9].y +
        landmarks[17].y) /
      4,
  };
}

function classifyGesture(landmarks, state) {
  const palmWidth = distanceBetween(landmarks[INDEX_MCP], landmarks[17]) || 1;
  const pinchDistance =
    distanceBetween(landmarks[THUMB_TIP], landmarks[INDEX_TIP]) / palmWidth;
  if (state.pinching ? pinchDistance < PINCH_RELEASE_RATIO : pinchDistance < PINCH_START_RATIO) {
    state.pinching = true;
    return 'pinch';
  }
  state.pinching = false;

  const foldedFingers = FINGER_JOINTS.every(
    ({ pip, tip }) =>
      distanceBetween(landmarks[WRIST], landmarks[tip]) <
      distanceBetween(landmarks[WRIST], landmarks[pip]) * 1.03,
  );
  const thumbIsRaised =
    landmarks[THUMB_TIP].y < landmarks[THUMB_MCP].y - 0.055 &&
    landmarks[THUMB_TIP].y < landmarks[WRIST].y - 0.12;
  if (foldedFingers && thumbIsRaised) return 'thumbs-up';

  const fingersExtended = FINGER_JOINTS.every((finger) =>
    isFingerExtended(landmarks, finger),
  );
  const thumbIsSpread =
    distanceBetween(landmarks[THUMB_TIP], landmarks[INDEX_MCP]) >
    distanceBetween(landmarks[THUMB_MCP], landmarks[INDEX_MCP]) * 1.12;
  if (fingersExtended && thumbIsSpread) return 'open-palm';

  return 'hand detected';
}

export function createGestureRecognizer() {
  const state = {
    pinching: false,
    thumbUp: false,
    openPalmStartedAt: null,
    openPalmStartPosition: null,
    openPalmResetTriggered: false,
  };

  function reset() {
    state.pinching = false;
    state.thumbUp = false;
    state.openPalmStartedAt = null;
    state.openPalmStartPosition = null;
    state.openPalmResetTriggered = false;
  }

  function update(landmarks, timestamp) {
    if (!landmarks || landmarks.length < 21) {
      reset();
      return {
        gesture: 'no hand detected',
        cursor: null,
        pinchStarted: false,
        thumbUpStarted: false,
        resetTriggered: false,
      };
    }

    const previousPinching = state.pinching;
    const gesture = classifyGesture(landmarks, state);
    const pinchStarted = !previousPinching && state.pinching;
    const thumbUp = gesture === 'thumbs-up';
    const thumbUpStarted = thumbUp && !state.thumbUp;
    state.thumbUp = thumbUp;

    const center = getPalmCenter(landmarks);
    let resetTriggered = false;
    if (gesture === 'open-palm') {
      if (state.openPalmStartedAt === null) {
        state.openPalmStartedAt = timestamp;
        state.openPalmStartPosition = center;
        state.openPalmResetTriggered = false;
      } else {
        const distance = Math.hypot(
          center.x - state.openPalmStartPosition.x,
          center.y - state.openPalmStartPosition.y,
        );
        if (distance > OPEN_PALM_STABILITY_RADIUS) {
          state.openPalmStartedAt = timestamp;
          state.openPalmStartPosition = center;
        } else if (
          !state.openPalmResetTriggered &&
          timestamp - state.openPalmStartedAt >= OPEN_PALM_RESET_MS
        ) {
          state.openPalmResetTriggered = true;
          resetTriggered = true;
        }
      }
    } else {
      state.openPalmStartedAt = null;
      state.openPalmStartPosition = null;
      state.openPalmResetTriggered = false;
    }

    const pinchPoint = {
      x: 1 - (landmarks[THUMB_TIP].x + landmarks[INDEX_TIP].x) / 2,
      y: (landmarks[THUMB_TIP].y + landmarks[INDEX_TIP].y) / 2,
    };

    return {
      gesture,
      cursor: { x: 1 - center.x, y: center.y },
      pinchPoint,
      pinchStarted,
      thumbUpStarted,
      resetTriggered,
    };
  }

  return { update, reset };
}
