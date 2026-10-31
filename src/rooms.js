export const ROOMS = {
  living: {
    id: 'living',
    label: 'Living room',
    shortLabel: 'Living',
    category: 'The heart of the home',
    description:
      'A rosy little lounge made for movie nights, tea parties, and the very best kind of daydreaming.',
    target: [-2.4, 1.5, 0.1],
    camera: [-0.8, 3.2, 10.4],
  },
  kitchen: {
    id: 'kitchen',
    label: 'Kitchen',
    shortLabel: 'Kitchen',
    category: 'Freshly styled',
    description:
      'A sweet chef’s corner with a marble island, pastel cabinetry, and room for one more cupcake.',
    target: [2.4, 1.45, 0.1],
    camera: [0.8, 3.4, 10.7],
  },
  bedroom: {
    id: 'bedroom',
    label: 'Bedroom',
    shortLabel: 'Bedroom',
    category: 'The sweetest retreat',
    description:
      'Soft satin pinks, a cloud-soft bed, and a tiny vanity ready for a little sparkle.',
    target: [-2.45, 4.45, -0.15],
    camera: [-0.9, 6.05, 10.2],
  },
  wardrobe: {
    id: 'wardrobe',
    label: 'Walk-in wardrobe',
    shortLabel: 'Wardrobe',
    category: 'Outfit of the day',
    description:
      'A boutique dressing room with a blush closet, hanging looks, and a full-length mirror.',
    target: [2.45, 4.45, -0.15],
    camera: [0.9, 6.15, 10.4],
  },
  balcony: {
    id: 'balcony',
    label: 'Balcony',
    shortLabel: 'Balcony',
    category: 'A little fresh air',
    description:
      'A sunlit balcony with tiny bistro seats, climbing roses, and the loveliest view of home.',
    target: [0, 4.05, 3.8],
    camera: [0.2, 6.1, 11.6],
  },
  garden: {
    id: 'garden',
    label: 'Garden',
    shortLabel: 'Garden',
    category: 'Blooming outside',
    description:
      'A cheerful flower garden surrounds the house with petal-pink blooms and storybook paths.',
    target: [0, 0.7, 5.2],
    camera: [10.5, 7.7, 18.5],
  },
  pool: {
    id: 'pool',
    label: 'Poolside',
    shortLabel: 'Pool',
    category: 'Poolside, please',
    description:
      'A sparkling little swimming pool with rosy stone trim and a front-row seat to the sunshine.',
    target: [-4.3, 0.45, 5.8],
    camera: [-10.2, 5.1, 14.5],
  },
};

export const DEFAULT_ROOM = 'living';
