import * as THREE from 'three';

export function createInteractions({
  canvas,
  camera,
  interactiveObjects,
  onSelectRoom,
  onSelectObject,
}) {
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let pressed = null;
  let hovered = null;

  function updatePointer(event) {
    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return false;
    pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    return true;
  }

  function hitTest(event) {
    if (!updatePointer(event)) return null;
    const intersections = raycaster.intersectObjects(interactiveObjects, false);
    return intersections[0]?.object ?? null;
  }

  function handlePointerMove(event) {
    const hit = hitTest(event);
    if (hit === hovered) return;
    hovered = hit;
    canvas.style.cursor = hovered ? 'pointer' : 'grab';
  }

  function handlePointerDown(event) {
    if (event.button !== 0) return;
    pressed = { x: event.clientX, y: event.clientY, pointerId: event.pointerId };
  }

  function handlePointerUp(event) {
    if (!pressed || event.pointerId !== pressed.pointerId) return;
    const distance = Math.hypot(event.clientX - pressed.x, event.clientY - pressed.y);
    pressed = null;
    if (distance > 7) return;

    const hit = hitTest(event);
    const interaction = hit?.userData.interaction;
    if (!interaction) return;

    if (interaction.detail) {
      onSelectObject(interaction.roomId, interaction.detail);
    } else {
      onSelectRoom(interaction.roomId);
    }
  }

  function clearPressed() {
    pressed = null;
  }

  function handlePointerLeave() {
    hovered = null;
    canvas.style.cursor = 'grab';
  }

  canvas.addEventListener('pointermove', handlePointerMove, { passive: true });
  canvas.addEventListener('pointerdown', handlePointerDown);
  canvas.addEventListener('pointerup', handlePointerUp);
  canvas.addEventListener('pointercancel', clearPressed);
  canvas.addEventListener('pointerleave', handlePointerLeave);

  return {
    destroy() {
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointercancel', clearPressed);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
      canvas.style.cursor = 'grab';
    },
  };
}
