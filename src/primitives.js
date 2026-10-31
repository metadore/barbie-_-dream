import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export function roundedBox(parent, options) {
  const {
    width,
    height,
    depth,
    position = [0, 0, 0],
    color = '#ffffff',
    roughness = 0.55,
    metalness = 0,
    radius,
    transparent = false,
    opacity = 1,
    emissive = '#000000',
    emissiveIntensity = 0,
    castShadow = true,
    receiveShadow = true,
    materialOptions = {},
  } = options;
  const smallestSide = Math.min(width, height, depth);
  const edgeRadius = Math.min(radius ?? smallestSide * 0.16, smallestSide * 0.44);
  const geometry = new RoundedBoxGeometry(width, height, depth, 3, edgeRadius);
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness,
    transparent,
    opacity,
    emissive,
    emissiveIntensity,
    ...materialOptions,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.castShadow = castShadow;
  mesh.receiveShadow = receiveShadow;
  parent.add(mesh);
  return mesh;
}

export function box(parent, options) {
  const {
    width,
    height,
    depth,
    position = [0, 0, 0],
    color = '#ffffff',
    roughness = 0.55,
    metalness = 0,
    transparent = false,
    opacity = 1,
    emissive = '#000000',
    emissiveIntensity = 0,
    castShadow = true,
    receiveShadow = true,
    materialOptions = {},
  } = options;
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness,
    transparent,
    opacity,
    emissive,
    emissiveIntensity,
    ...materialOptions,
  });
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
  mesh.position.set(...position);
  mesh.castShadow = castShadow;
  mesh.receiveShadow = receiveShadow;
  parent.add(mesh);
  return mesh;
}

export function cylinder(parent, options) {
  const {
    radiusTop,
    radiusBottom = radiusTop,
    height,
    position = [0, 0, 0],
    color = '#ffffff',
    radialSegments = 20,
    roughness = 0.58,
    metalness = 0,
    rotation = [0, 0, 0],
    castShadow = true,
    receiveShadow = true,
  } = options;
  const geometry = new THREE.CylinderGeometry(
    radiusTop,
    radiusBottom,
    height,
    radialSegments,
    1,
  );
  const material = new THREE.MeshStandardMaterial({ color, roughness, metalness });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  mesh.castShadow = castShadow;
  mesh.receiveShadow = receiveShadow;
  parent.add(mesh);
  return mesh;
}

export function sphere(parent, options) {
  const {
    radius,
    position = [0, 0, 0],
    scale = [1, 1, 1],
    color = '#ffffff',
    roughness = 0.5,
    metalness = 0,
    segments = 20,
    castShadow = true,
  } = options;
  const geometry = new THREE.SphereGeometry(radius, segments, Math.max(10, Math.floor(segments * 0.7)));
  const material = new THREE.MeshStandardMaterial({ color, roughness, metalness });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.scale.set(...scale);
  mesh.castShadow = castShadow;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

export function makeGroup(parent, position = [0, 0, 0]) {
  const group = new THREE.Group();
  group.position.set(...position);
  parent.add(group);
  return group;
}

export function registerInteractive(root, interactiveObjects, roomId, detail) {
  root.traverse((object) => {
    if (!object.isMesh) return;
    object.userData.interaction = { roomId, detail };
    interactiveObjects.push(object);
  });
}
