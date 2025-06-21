import { OutputOption } from '@/types/order';

export const OUTPUT_OPTIONS: OutputOption[] = [
  {
    id: 'pdf',
    name: 'Digital PDF',
    description: 'Instant download of your complete storybook',
    price: 299,
    deliveryTime: 'Instant',
    features: [
      'High-quality PDF format',
      'All pages with illustrations',
      'Print at home option',
      'Lifetime access'
    ]
  },
  {
    id: 'images',
    name: 'Image Collection',
    description: 'High-resolution images of all illustrations',
    price: 499,
    deliveryTime: 'Instant',
    features: [
      'Individual high-res images',
      'Perfect for wallpapers',
      'Social media ready',
      'ZIP download'
    ]
  },
  {
    id: 'hardcover',
    name: 'Premium Hardcover Book',
    description: 'Beautiful hardbound storybook with premium paper',
    price: 1499,
    deliveryTime: '7-10 days',
    features: [
      'Premium hardcover binding',
      'Glossy finish pages',
      'A4 size format',
      'Gift wrapping available'
    ],
    popular: true
  },
  {
    id: 'softcover',
    name: 'Softcover Book',
    description: 'Affordable paperback version of your storybook',
    price: 899,
    deliveryTime: '5-7 days',
    features: [
      'Quality paperback',
      'Vibrant printing',
      'A4 size format',
      'Lightweight'
    ]
  },
  {
    id: 'photoFrames',
    name: 'Framed Art Collection',
    description: 'Select pages as beautiful framed wall art',
    price: 2999,
    deliveryTime: '10-14 days',
    features: [
      '6 selected illustrations',
      '8x10 inch frames',
      'Ready to hang',
      'Premium glass protection'
    ]
  },
  {
    id: 'poster',
    name: 'Story Poster',
    description: 'All pages combined in one beautiful poster',
    price: 799,
    deliveryTime: '5-7 days',
    features: [
      'A2 size poster',
      'All illustrations in grid',
      'Matte finish',
      'Perfect for kids room'
    ]
  },
  {
    id: 'digitalBundle',
    name: 'Digital Bundle',
    description: 'Complete digital package with extras',
    price: 699,
    deliveryTime: 'Instant',
    features: [
      'PDF storybook',
      'All high-res images',
      'Phone wallpapers',
      'Printable coloring pages'
    ]
  },
  {
    id: 'giftBox',
    name: 'Premium Gift Box',
    description: 'Luxury gift set with book and collectibles',
    price: 3999,
    deliveryTime: '14-21 days',
    features: [
      'Hardcover book',
      '3 framed prints',
      'Character stickers',
      'Premium gift packaging'
    ]
  }
];