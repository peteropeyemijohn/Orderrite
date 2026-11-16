import type { ImageSourcePropType } from 'react-native';

/**
 * Photos that circle the wordmark on the login hero. Add, remove or reorder
 * freely: the orbit spaces however many there are evenly around the oval.
 * One item per category: food, drink, gadget, beauty, pharmacy, parcel. All are
 * cut-outs from Pexels photos (transparent WebP, 256 px square, item centred
 * with a soft shadow baked in; light from above-left). Credits are in the
 * README. Keep new ones light, simple in shape, small, and free of logos,
 * readable text and people. Items move but never rotate.
 */
export const HERO_ORBIT_ITEMS: ImageSourcePropType[] = [
  require('../../assets/images/hero/rice-plate.webp'),
  require('../../assets/images/hero/drink.webp'),
  require('../../assets/images/hero/headphones.webp'),
  require('../../assets/images/hero/perfume.webp'),
  require('../../assets/images/hero/pharmacy.webp'),
  require('../../assets/images/hero/parcel.webp'),
];
