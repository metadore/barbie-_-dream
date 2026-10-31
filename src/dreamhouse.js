import * as THREE from 'three';
import {
  box,
  cylinder,
  makeGroup,
  registerInteractive,
  roundedBox,
} from './primitives.js';
import { createFurniture } from './furniture.js';

const gardenStemGeometry = new THREE.CylinderGeometry(0.018, 0.026, 0.44, 8);
const gardenPetalGeometry = new THREE.SphereGeometry(0.08, 10, 8);
const gardenCenterGeometry = new THREE.SphereGeometry(0.055, 10, 8);
const gardenStemMaterial = new THREE.MeshStandardMaterial({ color: '#759c65' });
const gardenCenterMaterial = new THREE.MeshStandardMaterial({ color: '#ffe18a' });

function addWindow(parent, x, y) {
  box(parent, {
    width: 1.56,
    height: 1.22,
    depth: 0.055,
    position: [x, y, -2.84],
    color: '#b9edf2',
    roughness: 0.12,
    metalness: 0.22,
    transparent: true,
    opacity: 0.7,
    castShadow: false,
    receiveShadow: false,
  });
  for (const [offset, height] of [[-0.84, 1.35], [0.84, 1.35]]) {
    roundedBox(parent, {
      width: 0.1,
      height,
      depth: 0.12,
      position: [x + offset, y, -2.77],
      color: '#fff5ed',
      roughness: 0.3,
    });
  }
  for (const offset of [-0.66, 0.66]) {
    roundedBox(parent, {
      width: 1.76,
      height: 0.1,
      depth: 0.12,
      position: [x, y + offset, -2.77],
      color: '#fff5ed',
      roughness: 0.3,
    });
  }
  roundedBox(parent, {
    width: 0.08,
    height: 1.2,
    depth: 0.1,
    position: [x, y, -2.73],
    color: '#fff5ed',
    roughness: 0.3,
  });
}

function addHeart(parent, position) {
  const shape = new THREE.Shape();
  shape.moveTo(0, -0.36);
  shape.bezierCurveTo(-0.2, -0.18, -0.68, 0.12, -0.68, 0.48);
  shape.bezierCurveTo(-0.68, 0.9, -0.1, 0.92, 0, 0.54);
  shape.bezierCurveTo(0.1, 0.92, 0.68, 0.9, 0.68, 0.48);
  shape.bezierCurveTo(0.68, 0.12, 0.2, -0.18, 0, -0.36);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.14,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.06,
    bevelThickness: 0.05,
  });
  const material = new THREE.MeshStandardMaterial({
    color: '#ef5f9c',
    roughness: 0.2,
    metalness: 0.08,
  });
  const heart = new THREE.Mesh(geometry, material);
  heart.position.set(...position);
  heart.castShadow = true;
  parent.add(heart);
}

function buildArchitecture(house, interactiveObjects) {
  roundedBox(house, {
    width: 11,
    height: 0.36,
    depth: 7.2,
    position: [0, 0.2, 0],
    color: '#fff2e9',
    roughness: 0.5,
  });

  for (const [x, roomId] of [[-2.48, 'living'], [2.48, 'kitchen']]) {
    const floor = roundedBox(house, {
      width: 4.9,
      height: 0.16,
      depth: 6.0,
      position: [x, 0.46, 0],
      color: x < 0 ? '#f5d8c8' : '#f8e5d8',
      roughness: 0.76,
    });
    registerInteractive(
      floor,
      interactiveObjects,
      roomId,
      {
        title: roomId === 'living' ? 'The living room' : 'The kitchen',
        description:
          roomId === 'living'
            ? 'The coziest spot in the house, dressed in soft pink and warm cream.'
            : 'A petite kitchen with a marble island and room for something sweet.',
      },
    );
  }

  for (const [x, roomId] of [[-2.48, 'bedroom'], [2.48, 'wardrobe']]) {
    const floor = roundedBox(house, {
      width: 4.9,
      height: 0.18,
      depth: 6.0,
      position: [x, 3.34, 0],
      color: x < 0 ? '#f5d6e2' : '#f6e5df',
      roughness: 0.68,
    });
    registerInteractive(
      floor,
      interactiveObjects,
      roomId,
      {
        title: roomId === 'bedroom' ? 'The bedroom' : 'The walk-in wardrobe',
        description:
          roomId === 'bedroom'
            ? 'A dreamy upstairs retreat with a pink bed and tiny vanity.'
            : 'A boutique dressing room with a blush closet and favorite looks.',
      },
    );
  }

  roundedBox(house, {
    width: 0.24,
    height: 5.9,
    depth: 2.5,
    position: [0, 3.28, -1.72],
    color: '#fff2e9',
    roughness: 0.62,
  });
  roundedBox(house, {
    width: 10,
    height: 5.85,
    depth: 0.24,
    position: [0, 3.31, -3.0],
    color: '#f3a8c6',
    roughness: 0.66,
  });
  for (const x of [-5.0, 5.0]) {
    roundedBox(house, {
      width: 0.24,
      height: 5.85,
      depth: 6.0,
      position: [x, 3.31, 0],
      color: '#f2a0c1',
      roughness: 0.6,
    });
  }

  for (const y of [1.72, 4.64]) {
    addWindow(house, -2.5, y);
    addWindow(house, 2.5, y);
  }

  for (const x of [-4.86, 4.86]) {
    roundedBox(house, {
      width: 0.36,
      height: 5.85,
      depth: 0.38,
      position: [x, 3.3, 3.04],
      color: '#ef7eae',
      roughness: 0.32,
      metalness: 0.04,
    });
    for (const y of [0.8, 3.28, 5.9]) {
      roundedBox(house, {
        width: 0.46,
        height: 0.14,
        depth: 0.48,
        position: [x, y, 3.04],
        color: '#fff4ea',
        roughness: 0.27,
      });
    }
  }

  roundedBox(house, {
    width: 10.2,
    height: 0.22,
    depth: 0.36,
    position: [0, 3.31, 3.02],
    color: '#fff3e8',
    roughness: 0.28,
  });

  roundedBox(house, {
    width: 9.9,
    height: 0.14,
    depth: 1.56,
    position: [0, 3.48, 3.72],
    color: '#f6d2df',
    roughness: 0.38,
  });
  roundedBox(house, {
    width: 9.84,
    height: 0.12,
    depth: 0.14,
    position: [0, 4.02, 4.47],
    color: '#fff4ea',
    roughness: 0.28,
  });
  for (let post = 0; post <= 12; post += 1) {
    roundedBox(house, {
      width: 0.09,
      height: 0.54,
      depth: 0.09,
      position: [-4.83 + post * 0.805, 3.76, 4.46],
      color: '#ef8cb3',
      roughness: 0.35,
    });
  }
  for (const x of [-4.7, 4.7]) {
    roundedBox(house, {
      width: 0.12,
      height: 0.55,
      depth: 1.48,
      position: [x, 3.77, 3.73],
      color: '#fff4ea',
      roughness: 0.3,
    });
  }

  for (const [x, rotation] of [[-2.55, 0.31], [2.55, -0.31]]) {
    const roof = roundedBox(house, {
      width: 5.75,
      height: 0.24,
      depth: 7.42,
      position: [x, 6.65, -0.08],
      color: '#e976a8',
      roughness: 0.3,
      metalness: 0.04,
      radius: 0.08,
    });
    roof.rotation.z = rotation;
  }
  const gable = new THREE.Shape();
  gable.moveTo(-5.1, 6.02);
  gable.lineTo(0, 7.48);
  gable.lineTo(5.1, 6.02);
  gable.closePath();
  const gableMesh = new THREE.Mesh(
    new THREE.ShapeGeometry(gable),
    new THREE.MeshStandardMaterial({ color: '#f8c7d9', roughness: 0.68 }),
  );
  gableMesh.position.z = 3.13;
  gableMesh.castShadow = true;
  house.add(gableMesh);

  roundedBox(house, {
    width: 1.92,
    height: 0.18,
    depth: 0.2,
    position: [0, 6.12, 3.18],
    color: '#fff4ed',
    roughness: 0.28,
  });
  roundedBox(house, {
    width: 1.32,
    height: 0.78,
    depth: 0.13,
    position: [0, 6.64, 3.18],
    color: '#b9edf2',
    roughness: 0.18,
    metalness: 0.16,
    transparent: true,
    opacity: 0.78,
  });
  addHeart(house, [-0.88, 6.58, 3.22]);

  for (const [x, z] of [[-4.1, 2.72], [4.12, 2.78], [-0.4, -2.78], [0.42, -2.78]]) {
    cylinder(house, {
      radiusTop: 0.28,
      radiusBottom: 0.28,
      height: 0.12,
      position: [x, 3.58, z],
      color: '#fff4e8',
      roughness: 0.28,
    });
  }
}

function addGardenGround(scene) {
  const lawn = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 60),
    new THREE.MeshStandardMaterial({ color: '#cde4c8', roughness: 0.96 }),
  );
  lawn.rotation.x = -Math.PI / 2;
  lawn.position.y = -0.015;
  lawn.receiveShadow = true;
  scene.add(lawn);

  for (let tile = 0; tile < 7; tile += 1) {
    roundedBox(scene, {
      width: 1.06,
      height: 0.075,
      depth: 0.78,
      position: [-0.7 + tile * 0.24, 0.04, 5.0 + tile * 0.7],
      color: tile % 2 ? '#f6e8df' : '#fff4ec',
      roughness: 0.88,
      castShadow: false,
    });
  }

  const flowerBeds = [
    [-7.3, 0.0, 3.1, '#ff86b4'],
    [-7.25, 0.0, 7.75, '#f4a1c8'],
    [1.8, 0.0, 6.82, '#d79aff'],
    [3.55, 0.0, 4.9, '#ffc96c'],
    [7.6, 0.0, 3.0, '#ff91bc'],
    [7.75, 0.0, 8.0, '#d79aff'],
  ];
  for (const [x, y, z, color] of flowerBeds) {
    roundedBox(scene, {
      width: 1.3,
      height: 0.12,
      depth: 1.28,
      position: [x, y + 0.1, z],
      color: '#91b77c',
      roughness: 0.92,
    });
    const flowerCount = 5;
    const stems = new THREE.InstancedMesh(
      gardenStemGeometry,
      gardenStemMaterial,
      flowerCount,
    );
    const petals = new THREE.InstancedMesh(
      gardenPetalGeometry,
      new THREE.MeshStandardMaterial({ color }),
      flowerCount * 5,
    );
    const centers = new THREE.InstancedMesh(
      gardenCenterGeometry,
      gardenCenterMaterial,
      flowerCount,
    );
    const transform = new THREE.Object3D();
    let petalIndex = 0;
    for (let flower = 0; flower < 5; flower += 1) {
      const flowerX = x + ((flower % 3) - 1) * 0.36;
      const flowerZ = z + (Math.floor(flower / 3) - 0.5) * 0.52;
      transform.position.set(flowerX, 0.38, flowerZ);
      transform.updateMatrix();
      stems.setMatrixAt(flower, transform.matrix);
      for (let petal = 0; petal < 5; petal += 1) {
        const angle = (petal / 5) * Math.PI * 2;
        transform.position.set(
          flowerX + Math.cos(angle) * 0.085,
          0.64 + Math.sin(angle) * 0.04,
          flowerZ + Math.sin(angle) * 0.085,
        );
        transform.scale.set(1, 0.8, 1);
        transform.updateMatrix();
        petals.setMatrixAt(petalIndex, transform.matrix);
        petalIndex += 1;
      }
      transform.position.set(flowerX, 0.65, flowerZ);
      transform.scale.set(1, 1, 1);
      transform.updateMatrix();
      centers.setMatrixAt(flower, transform.matrix);
    }
    stems.castShadow = true;
    petals.castShadow = true;
    centers.castShadow = true;
    scene.add(stems, petals, centers);
  }
}

export function createDreamhouse(scene) {
  const house = makeGroup(scene);
  const interactiveObjects = [];
  addGardenGround(scene);
  buildArchitecture(house, interactiveObjects);
  createFurniture(house, interactiveObjects);
  return { house, interactiveObjects };
}
