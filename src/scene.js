import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { DEFAULT_ROOM, ROOMS } from './rooms.js';

const MAX_PIXEL_RATIO = 2;
const DEFAULT_CAMERA = new THREE.Vector3(8.7, 8.3, 21.5);
const DEFAULT_TARGET = new THREE.Vector3(0, 2.7, 0.55);

function disposeSceneResources(scene) {
  const geometries = new Set();
  const materials = new Set();
  const textures = new Set();

  scene.traverse((object) => {
    if (object.geometry) geometries.add(object.geometry);
    if (!object.material) return;
    const objectMaterials = Array.isArray(object.material)
      ? object.material
      : [object.material];
    for (const material of objectMaterials) {
      materials.add(material);
      for (const value of Object.values(material)) {
        if (value?.isTexture) textures.add(value);
      }
    }
  });

  for (const texture of textures) texture.dispose();
  for (const material of materials) material.dispose();
  for (const geometry of geometries) geometry.dispose();
}

export function createScene(canvas, mount) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.94;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#f6dce8');
  scene.fog = new THREE.Fog('#f6dce8', 27, 62);

  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  camera.position.copy(DEFAULT_CAMERA);
  camera.lookAt(DEFAULT_TARGET);

  const controls = new OrbitControls(camera, canvas);
  controls.target.copy(DEFAULT_TARGET);
  controls.enableDamping = true;
  controls.dampingFactor = 0.075;
  controls.enablePan = true;
  controls.minDistance = 7.5;
  controls.maxDistance = 31;
  controls.minPolarAngle = 0.38;
  controls.maxPolarAngle = 1.48;
  controls.rotateSpeed = 0.65;
  controls.zoomSpeed = 0.78;
  controls.screenSpacePanning = false;
  controls.listenToKeyEvents(window);

  const hemisphere = new THREE.HemisphereLight('#fff8f4', '#d2a7b8', 0.78);
  scene.add(hemisphere);

  const sunlight = new THREE.DirectionalLight('#fff1dd', 2.15);
  sunlight.position.set(-10, 15, 11);
  sunlight.castShadow = true;
  sunlight.shadow.mapSize.set(2048, 2048);
  sunlight.shadow.camera.left = -17;
  sunlight.shadow.camera.right = 17;
  sunlight.shadow.camera.top = 17;
  sunlight.shadow.camera.bottom = -17;
  sunlight.shadow.camera.near = 0.5;
  sunlight.shadow.camera.far = 48;
  sunlight.shadow.bias = -0.00015;
  sunlight.shadow.normalBias = 0.02;
  scene.add(sunlight);

  const fillLight = new THREE.PointLight('#ffd6e9', 14, 27, 2);
  fillLight.position.set(6, 8, 8);
  scene.add(fillLight);

  const environment = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environmentTarget = pmrem.fromScene(environment, 0.035);
  scene.environment = environmentTarget.texture;
  pmrem.dispose();
  environment.traverse((object) => {
    object.geometry?.dispose();
    if (object.material) {
      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];
      materials.forEach((material) => material.dispose());
    }
  });

  const sparkleCount = 46;
  const sparklePositions = new Float32Array(sparkleCount * 3);
  const sparkleBase = new Float32Array(sparkleCount * 3);
  const sparklePhases = new Float32Array(sparkleCount);
  for (let i = 0; i < sparkleCount; i += 1) {
    const index = i * 3;
    sparkleBase[index] = (Math.random() - 0.5) * 16;
    sparkleBase[index + 1] = 0.5 + Math.random() * 8.2;
    sparkleBase[index + 2] = (Math.random() - 0.5) * 13 + 1.2;
    sparklePositions.set(sparkleBase.subarray(index, index + 3), index);
    sparklePhases[i] = Math.random() * Math.PI * 2;
  }
  const sparkleGeometry = new THREE.BufferGeometry();
  sparkleGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(sparklePositions, 3).setUsage(THREE.DynamicDrawUsage),
  );
  const sparkleMaterial = new THREE.PointsMaterial({
    color: '#fff8dd',
    size: 0.095,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });
  const sparkles = new THREE.Points(sparkleGeometry, sparkleMaterial);
  sparkles.name = 'Dreamhouse sparkles';
  sparkles.frustumCulled = false;
  scene.add(sparkles);

  let isNight = false;
  let sparklesEnabled = true;
  let reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let transition = null;
  let destroyed = false;

  function setNight(enabled) {
    isNight = enabled;
    const background = enabled ? '#242642' : '#f6dce8';
    scene.background.set(background);
    scene.fog.color.set(background);
    hemisphere.intensity = enabled ? 0.26 : 0.78;
    hemisphere.color.set(enabled ? '#bbc2ff' : '#fff8f4');
    hemisphere.groundColor.set(enabled ? '#39304f' : '#d2a7b8');
    sunlight.intensity = enabled ? 0.42 : 2.15;
    sunlight.color.set(enabled ? '#aab4ff' : '#fff1dd');
    fillLight.intensity = enabled ? 8 : 14;
  }

  function focusRoom(roomId, options = {}) {
    const room = ROOMS[roomId];
    if (!room) throw new RangeError(`Unknown Dreamhouse room: ${roomId}`);
    const destination = new THREE.Vector3(...room.camera);
    const target = new THREE.Vector3(...room.target);
    if (options.instant || reducedMotion) {
      transition = null;
      camera.position.copy(destination);
      controls.target.copy(target);
      controls.update();
      return;
    }
    transition = {
      startPosition: camera.position.clone(),
      startTarget: controls.target.clone(),
      destination,
      target,
      elapsed: 0,
      duration: 1.15,
    };
  }

  function resetView() {
    transition = {
      startPosition: camera.position.clone(),
      startTarget: controls.target.clone(),
      destination: DEFAULT_CAMERA.clone(),
      target: DEFAULT_TARGET.clone(),
      elapsed: 0,
      duration: 1.1,
    };
    if (reducedMotion) {
      camera.position.copy(DEFAULT_CAMERA);
      controls.target.copy(DEFAULT_TARGET);
      transition = null;
    }
  }

  function onControlStart() {
    transition = null;
  }
  controls.addEventListener('start', onControlStart);

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const onMotionChange = (event) => {
    reducedMotion = event.matches;
    controls.enableDamping = !reducedMotion;
    if (reducedMotion && transition) {
      camera.position.copy(transition.destination);
      controls.target.copy(transition.target);
      transition = null;
    }
  };
  motionQuery.addEventListener('change', onMotionChange);

  const resizeObserver = new ResizeObserver((entries) => {
    const { width, height } = entries[entries.length - 1].contentRect;
    if (!width || !height) return;
    camera.aspect = width / height;
    const portraitFactor = THREE.MathUtils.clamp((0.95 - camera.aspect) / 0.55, 0, 1);
    camera.fov = THREE.MathUtils.lerp(36, 70, portraitFactor);
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO));
    renderer.setSize(width, height, false);
  });
  resizeObserver.observe(mount);

  let lastFrameTime = null;
  renderer.setAnimationLoop((time) => {
    if (destroyed) return;
    const delta = lastFrameTime === null ? 0 : Math.min((time - lastFrameTime) / 1000, 0.05);
    lastFrameTime = time;
    if (transition) {
      transition.elapsed += delta;
      const progress = Math.min(transition.elapsed / transition.duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      camera.position.lerpVectors(
        transition.startPosition,
        transition.destination,
        eased,
      );
      controls.target.lerpVectors(transition.startTarget, transition.target, eased);
      if (progress === 1) transition = null;
    }
    if (sparklesEnabled && !reducedMotion) {
      const positions = sparkleGeometry.attributes.position;
      for (let i = 0; i < sparkleCount; i += 1) {
        const offset = i * 3;
        positions.array[offset + 1] =
          sparkleBase[offset + 1] +
          Math.sin(time * 0.0007 + sparklePhases[i]) * 0.16;
      }
      positions.needsUpdate = true;
    }
    controls.update();
    renderer.render(scene, camera);
  });

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    renderer.setAnimationLoop(null);
    resizeObserver.disconnect();
    controls.removeEventListener('start', onControlStart);
    controls.dispose();
    motionQuery.removeEventListener('change', onMotionChange);
    scene.environment = null;
    environmentTarget.dispose();
    disposeSceneResources(scene);
    renderer.dispose();
  }

  return {
    scene,
    camera,
    focusRoom,
    resetView,
    setNight,
    setSparkles(enabled) {
      sparklesEnabled = enabled;
      sparkles.visible = enabled;
    },
    destroy,
  };
}
