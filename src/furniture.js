import * as THREE from 'three';
import {
  box,
  cylinder,
  makeGroup,
  registerInteractive,
  roundedBox,
  sphere,
} from './primitives.js';

function addFurniture(parent, interactiveObjects, roomId, detail, build) {
  const group = makeGroup(parent);
  build(group);
  registerInteractive(group, interactiveObjects, roomId, detail);
  return group;
}

function addFlower(parent, x, y, z, petalColor = '#ff8cb8', scale = 1) {
  const group = makeGroup(parent, [x, y, z]);
  cylinder(group, {
    radiusTop: 0.025 * scale,
    radiusBottom: 0.04 * scale,
    height: 0.58 * scale,
    position: [0, 0.29 * scale, 0],
    color: '#78a66d',
    radialSegments: 10,
  });
  for (let petal = 0; petal < 5; petal += 1) {
    const angle = (petal / 5) * Math.PI * 2;
    sphere(group, {
      radius: 0.11 * scale,
      position: [
        Math.cos(angle) * 0.12 * scale,
        0.62 * scale + Math.sin(angle) * 0.07 * scale,
        Math.sin(angle) * 0.12 * scale,
      ],
      scale: [1, 0.75, 1],
      color: petalColor,
      segments: 14,
    });
  }
  sphere(group, {
    radius: 0.075 * scale,
    position: [0, 0.62 * scale, 0],
    color: '#ffd469',
    segments: 14,
  });
  return group;
}

function addPlanter(parent, interactiveObjects, position, roomId, detail, flowers = true) {
  const group = makeGroup(parent, position);
  roundedBox(group, {
    width: 0.55,
    height: 0.46,
    depth: 0.55,
    position: [0, 0.23, 0],
    color: '#f5a1c3',
    roughness: 0.3,
  });
  cylinder(group, {
    radiusTop: 0.29,
    radiusBottom: 0.22,
    height: 0.12,
    position: [0, 0.46, 0],
    color: '#fff3de',
  });
  if (flowers) {
    addFlower(group, -0.13, 0.49, 0, '#ff82b4', 0.74);
    addFlower(group, 0.1, 0.49, 0.08, '#ffe08a', 0.68);
    addFlower(group, 0.02, 0.49, -0.13, '#d6a5ff', 0.72);
  } else {
    for (let leaf = 0; leaf < 5; leaf += 1) {
      sphere(group, {
        radius: 0.18,
        position: [
          Math.cos(leaf * 1.25) * 0.12,
          0.74 + (leaf % 2) * 0.13,
          Math.sin(leaf * 1.25) * 0.12,
        ],
        scale: [0.55, 1.25, 0.7],
        color: '#78a66d',
        segments: 12,
      });
    }
  }
  registerInteractive(group, interactiveObjects, roomId, detail);
  return group;
}

function buildLivingRoom(parent, interactiveObjects) {
  addFurniture(parent, interactiveObjects, 'living', {
    title: 'The blush velvet sofa',
    description:
      'A cloud-soft sofa with little rose cushions, perfectly placed for a cozy night in.',
  }, (group) => {
    roundedBox(group, {
      width: 2.45,
      height: 0.42,
      depth: 0.94,
      position: [-2.55, 0.82, 0.25],
      color: '#e982ae',
      roughness: 0.78,
    });
    roundedBox(group, {
      width: 2.36,
      height: 0.86,
      depth: 0.26,
      position: [-2.55, 1.25, -0.16],
      color: '#f19abf',
      roughness: 0.8,
    });
    for (const x of [-3.72, -1.38]) {
      roundedBox(group, {
        width: 0.22,
        height: 0.66,
        depth: 0.96,
        position: [x, 1.03, 0.22],
        color: '#e982ae',
        roughness: 0.78,
      });
    }
    for (const [x, color] of [[-3.1, '#fff0f5'], [-2.3, '#ffd4e4'], [-1.9, '#fff0f5']]) {
      roundedBox(group, {
        width: 0.46,
        height: 0.42,
        depth: 0.22,
        position: [x, 1.23, 0.16],
        color,
        roughness: 0.86,
      });
    }
  });

  addFurniture(parent, interactiveObjects, 'living', {
    title: 'The heart-shaped coffee table',
    description: 'A petite glossy table for pink lemonade and a favorite fashion magazine.',
  }, (group) => {
    roundedBox(group, {
      width: 1.42,
      height: 0.13,
      depth: 0.82,
      position: [-2.45, 0.91, 1.46],
      color: '#fff2e4',
      roughness: 0.26,
      metalness: 0.08,
    });
    for (const x of [-2.95, -1.95]) {
      cylinder(group, {
        radiusTop: 0.045,
        height: 0.46,
        position: [x, 0.66, 1.46],
        color: '#d58aab',
        radialSegments: 12,
      });
    }
    sphere(group, {
      radius: 0.15,
      position: [-2.43, 1.1, 1.44],
      scale: [1.2, 0.45, 0.8],
      color: '#ed8ab3',
    });
  });

  addFurniture(parent, interactiveObjects, 'living', {
    title: 'The little living-room lamp',
    description: 'A warm rose-gold floor lamp makes every evening feel like a sleepover.',
  }, (group) => {
    cylinder(group, {
      radiusTop: 0.045,
      height: 1.6,
      position: [-4.05, 1.32, -0.1],
      color: '#d39a67',
      radialSegments: 12,
    });
    const shade = new THREE.Mesh(
      new THREE.ConeGeometry(0.36, 0.48, 24),
      new THREE.MeshStandardMaterial({
        color: '#ffe1a8',
        emissive: '#ffcb79',
        emissiveIntensity: 0.16,
        roughness: 0.5,
      }),
    );
    shade.position.set(-4.05, 2.14, -0.1);
    group.add(shade);
  });
}

function buildKitchen(parent, interactiveObjects) {
  addFurniture(parent, interactiveObjects, 'kitchen', {
    title: 'The marble kitchen island',
    description: 'A glossy cream island with rose-gold details, made for baking something lovely.',
  }, (group) => {
    roundedBox(group, {
      width: 2.2,
      height: 0.82,
      depth: 1.08,
      position: [2.1, 0.96, 0.48],
      color: '#ffd6e5',
      roughness: 0.38,
    });
    roundedBox(group, {
      width: 2.38,
      height: 0.15,
      depth: 1.2,
      position: [2.1, 1.43, 0.48],
      color: '#fff8ef',
      roughness: 0.2,
      metalness: 0.04,
    });
    for (const x of [1.35, 2.85]) {
      roundedBox(group, {
        width: 0.44,
        height: 0.62,
        depth: 0.44,
        position: [x, 0.83, 1.45],
        color: '#fff5e9',
        roughness: 0.35,
      });
      cylinder(group, {
        radiusTop: 0.24,
        height: 0.12,
        position: [x, 1.19, 1.45],
        color: '#eaa0bd',
        radialSegments: 20,
      });
    }
    roundedBox(group, {
      width: 0.6,
      height: 0.12,
      depth: 0.42,
      position: [2.12, 1.58, 0.36],
      color: '#ec7fa9',
      roughness: 0.28,
    });
  });

  addFurniture(parent, interactiveObjects, 'kitchen', {
    title: 'The little baking nook',
    description: 'Pastel cabinets, a tiny oven, and everything needed for a dreamhouse tea party.',
  }, (group) => {
    roundedBox(group, {
      width: 1.8,
      height: 1.05,
      depth: 0.48,
      position: [3.85, 1.08, -2.52],
      color: '#f7c3d6',
      roughness: 0.58,
    });
    roundedBox(group, {
      width: 1.9,
      height: 0.14,
      depth: 0.58,
      position: [3.85, 1.66, -2.48],
      color: '#fff7ed',
      roughness: 0.24,
    });
    roundedBox(group, {
      width: 0.72,
      height: 0.64,
      depth: 0.08,
      position: [3.38, 1.08, -2.23],
      color: '#fff0f5',
      roughness: 0.34,
    });
    roundedBox(group, {
      width: 0.72,
      height: 0.64,
      depth: 0.08,
      position: [4.25, 1.08, -2.23],
      color: '#fff0f5',
      roughness: 0.34,
    });
    cylinder(group, {
      radiusTop: 0.12,
      height: 0.08,
      position: [3.38, 1.08, -2.17],
      color: '#cf83a4',
      rotation: [Math.PI / 2, 0, 0],
      radialSegments: 16,
    });
  });
}

function buildBedroom(parent, interactiveObjects) {
  addFurniture(parent, interactiveObjects, 'bedroom', {
    title: 'The dreamy pink bed',
    description: 'A quilted bed piled with fluffy pillows, tucked under a scalloped canopy.',
  }, (group) => {
    roundedBox(group, {
      width: 2.38,
      height: 0.48,
      depth: 2.24,
      position: [-2.5, 3.93, -0.36],
      color: '#e988b2',
      roughness: 0.62,
    });
    roundedBox(group, {
      width: 2.24,
      height: 0.34,
      depth: 2.12,
      position: [-2.5, 4.31, -0.3],
      color: '#fff0f6',
      roughness: 0.88,
    });
    roundedBox(group, {
      width: 2.48,
      height: 1.24,
      depth: 0.2,
      position: [-2.5, 4.42, -1.58],
      color: '#ed9bbd',
      roughness: 0.52,
    });
    roundedBox(group, {
      width: 1.36,
      height: 0.17,
      depth: 0.56,
      position: [-2.96, 4.58, -1.02],
      color: '#fff9f1',
      roughness: 0.94,
    });
    roundedBox(group, {
      width: 1.36,
      height: 0.17,
      depth: 0.56,
      position: [-2.06, 4.58, -1.02],
      color: '#fff9f1',
      roughness: 0.94,
    });
    roundedBox(group, {
      width: 2.3,
      height: 0.1,
      depth: 0.8,
      position: [-2.5, 4.53, 0.22],
      color: '#ffbad4',
      roughness: 0.78,
    });
  });

  addFurniture(parent, interactiveObjects, 'bedroom', {
    title: 'The petite vanity',
    description: 'A tiny dressing table with a pink seat and a mirror for getting ready.',
  }, (group) => {
    roundedBox(group, {
      width: 1.35,
      height: 0.14,
      depth: 0.5,
      position: [-4.12, 4.49, -1.3],
      color: '#fff1e8',
      roughness: 0.3,
    });
    for (const x of [-4.62, -3.62]) {
      cylinder(group, {
        radiusTop: 0.035,
        height: 0.78,
        position: [x, 4.05, -1.3],
        color: '#d18ca8',
        radialSegments: 10,
      });
    }
    roundedBox(group, {
      width: 0.76,
      height: 0.82,
      depth: 0.08,
      position: [-4.12, 5.0, -1.46],
      color: '#d996bb',
      roughness: 0.24,
      metalness: 0.08,
    });
    sphere(group, {
      radius: 0.27,
      position: [-4.12, 5.04, -1.38],
      scale: [0.85, 1.08, 0.14],
      color: '#d8f3f6',
      roughness: 0.16,
      metalness: 0.25,
    });
    roundedBox(group, {
      width: 0.56,
      height: 0.13,
      depth: 0.46,
      position: [-4.12, 3.85, -0.52],
      color: '#e98ab4',
      roughness: 0.56,
    });
  });
}

function buildWardrobe(parent, interactiveObjects) {
  addFurniture(parent, interactiveObjects, 'wardrobe', {
    title: 'The walk-in closet',
    description: 'A blush boutique wardrobe with little dresses, shelves, and a mirror wall.',
  }, (group) => {
    roundedBox(group, {
      width: 2.5,
      height: 2.16,
      depth: 0.42,
      position: [2.76, 4.61, -2.34],
      color: '#f8d4e2',
      roughness: 0.62,
    });
    for (const x of [1.98, 2.76, 3.54]) {
      roundedBox(group, {
        width: 0.07,
        height: 2.12,
        depth: 0.48,
        position: [x, 4.61, -2.1],
        color: '#d98dad',
        roughness: 0.42,
      });
    }
    for (const y of [3.85, 4.63, 5.38]) {
      roundedBox(group, {
        width: 2.44,
        height: 0.08,
        depth: 0.44,
        position: [2.76, y, -2.08],
        color: '#fff0f5',
        roughness: 0.36,
      });
    }
    for (const [x, color] of [[2.2, '#ec7da9'], [2.75, '#b8a0ed'], [3.32, '#ffc86b']]) {
      cylinder(group, {
        radiusTop: 0.045,
        height: 0.7,
        position: [x, 4.62, -1.88],
        color,
        radialSegments: 12,
      });
      sphere(group, {
        radius: 0.19,
        position: [x, 4.25, -1.88],
        scale: [1.1, 1.25, 0.28],
        color,
        segments: 14,
      });
      roundedBox(group, {
        width: 0.26,
        height: 0.36,
        depth: 0.08,
        position: [x, 4.01, -1.88],
        color,
        roughness: 0.64,
      });
    }
    roundedBox(group, {
      width: 0.58,
      height: 1.5,
      depth: 0.06,
      position: [4.1, 4.65, -2.02],
      color: '#d7f0f3',
      roughness: 0.16,
      metalness: 0.16,
    });
  });
}

function buildBalcony(parent, interactiveObjects) {
  addFurniture(parent, interactiveObjects, 'balcony', {
    title: 'The balcony bistro set',
    description: 'Two little café chairs and a table, made for a breezy afternoon treat.',
  }, (group) => {
    roundedBox(group, {
      width: 0.92,
      height: 0.1,
      depth: 0.72,
      position: [-0.7, 3.86, 3.76],
      color: '#fff4ea',
      roughness: 0.28,
    });
    cylinder(group, {
      radiusTop: 0.045,
      height: 0.66,
      position: [-0.7, 3.5, 3.76],
      color: '#d99bb4',
      radialSegments: 12,
    });
    for (const x of [-2.0, 0.52]) {
      roundedBox(group, {
        width: 0.62,
        height: 0.12,
        depth: 0.58,
        position: [x, 3.71, 3.78],
        color: '#ed8fb6',
        roughness: 0.55,
      });
      roundedBox(group, {
        width: 0.62,
        height: 0.68,
        depth: 0.11,
        position: [x, 4.05, 4.02],
        color: '#f5b1ca',
        roughness: 0.58,
      });
      for (const offset of [-0.2, 0.2]) {
        cylinder(group, {
          radiusTop: 0.025,
          height: 0.42,
          position: [x + offset, 3.49, 3.78],
          color: '#d49ab2',
          radialSegments: 8,
        });
      }
    }
  });

  addPlanter(parent, interactiveObjects, [-4.1, 3.44, 3.86], 'balcony', {
    title: 'The balcony roses',
    description: 'A little pot of pink roses keeps the balcony in bloom.',
  });
  addPlanter(parent, interactiveObjects, [3.82, 3.44, 3.85], 'balcony', {
    title: 'The balcony blooms',
    description: 'A cheerful cluster of tiny flowers frames the view from upstairs.',
  });
}

function buildGarden(parent, interactiveObjects) {
  addFurniture(parent, interactiveObjects, 'pool', {
    title: 'The poolside escape',
    description: 'Clear blue water, scalloped pink stone, and a whole afternoon to splash.',
  }, (group) => {
    roundedBox(group, {
      width: 5.2,
      height: 0.34,
      depth: 2.72,
      position: [-4.18, 0.18, 5.75],
      color: '#f4c2d5',
      roughness: 0.32,
    });
    roundedBox(group, {
      width: 4.72,
      height: 0.16,
      depth: 2.27,
      position: [-4.18, 0.4, 5.75],
      color: '#b3eaf0',
      roughness: 0.12,
      metalness: 0.22,
      transparent: true,
      opacity: 0.94,
    });
    for (let tile = 0; tile < 5; tile += 1) {
      roundedBox(group, {
        width: 0.12,
        height: 0.04,
        depth: 2.25,
        position: [-6.25 + tile * 0.96, 0.49, 5.75],
        color: '#e7fcff',
        roughness: 0.18,
        transparent: true,
        opacity: 0.5,
      });
    }
  });

  addPlanter(parent, interactiveObjects, [-7.3, 0, 3.2], 'garden', {
    title: 'The cottage-garden flowers',
    description: 'Pink and lilac flowers bring a little color to the garden path.',
  });
  addPlanter(parent, interactiveObjects, [-7.2, 0, 7.8], 'garden', {
    title: 'The cottage-garden flowers',
    description: 'A tiny bed of blooms beside the pool, planted just for the butterflies.',
  });
  addPlanter(parent, interactiveObjects, [1.8, 0, 6.8], 'garden', {
    title: 'The garden blooms',
    description: 'A pocket of colorful flowers softens the path around the house.',
  });
  addPlanter(parent, interactiveObjects, [3.5, 0, 4.9], 'garden', {
    title: 'The climbing roses',
    description: 'Little roses make the walk from the garden to the house extra sweet.',
  });

  addFurniture(parent, interactiveObjects, 'garden', {
    title: 'The pink convertible',
    description: 'A glossy bubblegum convertible is parked outside, ready for a sunset drive.',
  }, (group) => {
    roundedBox(group, {
      width: 2.78,
      height: 0.5,
      depth: 1.36,
      position: [5.35, 0.66, 6.05],
      color: '#ed5f9b',
      roughness: 0.24,
      metalness: 0.2,
    });
    roundedBox(group, {
      width: 1.58,
      height: 0.55,
      depth: 1.12,
      position: [5.12, 1.0, 6.05],
      color: '#ff97bd',
      roughness: 0.28,
    });
    roundedBox(group, {
      width: 1.9,
      height: 0.12,
      depth: 1.04,
      position: [5.0, 1.32, 6.05],
      color: '#fff0f5',
      roughness: 0.23,
      metalness: 0.12,
    });
    for (const x of [4.48, 6.2]) {
      for (const z of [5.33, 6.77]) {
        cylinder(group, {
          radiusTop: 0.31,
          radiusBottom: 0.31,
          height: 0.19,
          position: [x, 0.48, z],
          color: '#54364d',
          radialSegments: 24,
          rotation: [Math.PI / 2, 0, 0],
          roughness: 0.86,
        });
        cylinder(group, {
          radiusTop: 0.16,
          radiusBottom: 0.16,
          height: 0.205,
          position: [x, 0.48, z],
          color: '#f5d9e5',
          radialSegments: 20,
          rotation: [Math.PI / 2, 0, 0],
          roughness: 0.3,
          metalness: 0.34,
        });
      }
    }
    for (const x of [4.0, 6.7]) {
      roundedBox(group, {
        width: 0.16,
        height: 0.22,
        depth: 0.3,
        position: [x, 0.78, 6.05],
        color: '#fff1d2',
        roughness: 0.2,
        emissive: '#ffd070',
        emissiveIntensity: 0.08,
      });
    }
    for (const x of [4.9, 5.75]) {
      roundedBox(group, {
        width: 0.56,
        height: 0.38,
        depth: 0.1,
        position: [x, 0.91, 6.05],
        color: '#ad5b81',
        roughness: 0.65,
      });
    }
  });
}

export function createFurniture(parent, interactiveObjects) {
  buildLivingRoom(parent, interactiveObjects);
  buildKitchen(parent, interactiveObjects);
  buildBedroom(parent, interactiveObjects);
  buildWardrobe(parent, interactiveObjects);
  buildBalcony(parent, interactiveObjects);
  buildGarden(parent, interactiveObjects);
}
