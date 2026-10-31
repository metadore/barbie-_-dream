import './style.css';
import { createDreamhouse } from './dreamhouse.js';
import { createInteractions } from './interactions.js';
import { createScene } from './scene.js';
import { createUI } from './ui.js';

const mount = document.querySelector('#scene-shell');
const canvas = document.querySelector('#dreamhouse-canvas');

if (!(mount instanceof HTMLElement) || !(canvas instanceof HTMLCanvasElement)) {
  throw new Error('Dreamhouse scene mount or canvas is missing from index.html.');
}

const experience = createScene(canvas, mount);
const dreamhouse = createDreamhouse(experience.scene);
const ui = createUI();
const interactions = createInteractions({
  canvas,
  camera: experience.camera,
  interactiveObjects: dreamhouse.interactiveObjects,
  onSelectRoom: (roomId) => {
    experience.focusRoom(roomId);
    ui.showRoom(roomId);
  },
  onSelectObject: (roomId, detail) => {
    experience.focusRoom(roomId);
    ui.showObject(roomId, detail);
  },
});

ui.onRoomSelect((roomId) => {
  experience.focusRoom(roomId);
  ui.showRoom(roomId);
});
ui.onDayToggle((isNight) => experience.setNight(isNight));
ui.onSparkleToggle((enabled) => experience.setSparkles(enabled));
ui.onReset(() => {
  experience.resetView();
  ui.showRoom('living');
});

function destroyExperience() {
  window.removeEventListener('pagehide', destroyExperience);
  interactions.destroy();
  ui.destroy();
  experience.destroy();
}

window.addEventListener('pagehide', destroyExperience, { once: true });

if (import.meta.hot) {
  import.meta.hot.dispose(destroyExperience);
}
