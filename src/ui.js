import { DEFAULT_ROOM, ROOMS } from './rooms.js';

const roomButtons = [...document.querySelectorAll('[data-room-id]')];
const roomCategory = document.querySelector('#room-category');
const roomTitle = document.querySelector('#room-title');
const roomDescription = document.querySelector('#room-description');
const dayToggle = document.querySelector('#day-toggle');
const sparkleToggle = document.querySelector('#sparkle-toggle');
const resetButton = document.querySelector('#reset-view');
const liveRegion = document.querySelector('#scene-status');

if (
  !roomCategory ||
  !roomTitle ||
  !roomDescription ||
  !dayToggle ||
  !sparkleToggle ||
  !resetButton ||
  !liveRegion ||
  roomButtons.length === 0
) {
  throw new Error('One or more Dreamhouse interface controls are missing.');
}

export function createUI() {
  const listeners = [];
  let isNight = false;
  let sparklesEnabled = true;

  function listen(element, eventName, handler) {
    element.addEventListener(eventName, handler);
    listeners.push(() => element.removeEventListener(eventName, handler));
  }

  function showRoom(roomId) {
    const room = ROOMS[roomId];
    if (!room) throw new RangeError(`Unknown Dreamhouse room: ${roomId}`);
    roomCategory.textContent = room.category;
    roomTitle.textContent = room.label;
    roomDescription.textContent = room.description;
    liveRegion.textContent = `${room.label} selected.`;
    for (const button of roomButtons) {
      button.setAttribute('aria-pressed', String(button.dataset.roomId === roomId));
    }
  }

  function showObject(roomId, detail) {
    const room = ROOMS[roomId];
    if (!room) throw new RangeError(`Unknown Dreamhouse room: ${roomId}`);
    roomCategory.textContent = room.label;
    roomTitle.textContent = detail.title;
    roomDescription.textContent = detail.description;
    liveRegion.textContent = `${detail.title}. ${detail.description}`;
    for (const button of roomButtons) {
      button.setAttribute('aria-pressed', String(button.dataset.roomId === roomId));
    }
  }

  function setDayLabel() {
    const label = isNight ? 'Switch to daytime' : 'Switch to moonlight';
    dayToggle.setAttribute('aria-label', label);
    dayToggle.setAttribute('aria-pressed', String(isNight));
    dayToggle.querySelector('.control-label').textContent = isNight ? 'Moonlight' : 'Daylight';
  }

  function setSparkleLabel() {
    sparkleToggle.setAttribute('aria-label', sparklesEnabled ? 'Turn sparkles off' : 'Turn sparkles on');
    sparkleToggle.setAttribute('aria-pressed', String(sparklesEnabled));
    sparkleToggle.querySelector('.control-label').textContent =
      sparklesEnabled ? 'Sparkles on' : 'Sparkles off';
  }

  showRoom(DEFAULT_ROOM);
  setDayLabel();
  setSparkleLabel();

  for (const button of roomButtons) {
    listen(button, 'click', () => {
      const roomId = button.dataset.roomId;
      if (!roomId) throw new Error('A room navigation button is missing its room id.');
      showRoom(roomId);
      roomSelectionHandler?.(roomId);
    });
  }

  let roomSelectionHandler = null;
  let dayToggleHandler = null;
  let sparkleToggleHandler = null;
  let resetHandler = null;

  listen(dayToggle, 'click', () => {
    isNight = !isNight;
    setDayLabel();
    dayToggleHandler?.(isNight);
  });
  listen(sparkleToggle, 'click', () => {
    sparklesEnabled = !sparklesEnabled;
    setSparkleLabel();
    sparkleToggleHandler?.(sparklesEnabled);
  });
  listen(resetButton, 'click', () => resetHandler?.());

  return {
    showRoom,
    showObject,
    onRoomSelect(handler) {
      roomSelectionHandler = handler;
    },
    onDayToggle(handler) {
      dayToggleHandler = handler;
    },
    onSparkleToggle(handler) {
      sparkleToggleHandler = handler;
    },
    onReset(handler) {
      resetHandler = handler;
    },
    destroy() {
      listeners.forEach((removeListener) => removeListener());
      listeners.length = 0;
    },
  };
}
