export function designImage(seed: string, width = 1200, height = 1400) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`;
}

export function productImage(seed: string) {
  return designImage(`wooden-guardian-product-${seed}`, 900, 1200);
}

export const DESIGN_IMAGES = {
  hero: "/design/image.png",
  heroCharacter: designImage("wooden-guardian-hero", 1400, 1600),
  collection1: designImage("wooden-guardian-collection-1", 900, 1200),
  collection2: designImage("wooden-guardian-collection-2", 900, 1200),
  collection3: designImage("wooden-guardian-collection-3", 900, 1200),
  collection4: designImage("wooden-guardian-collection-4", 900, 1200),
  product1: designImage("wooden-guardian-product-1", 900, 1100),
  product2: designImage("wooden-guardian-product-2", 900, 1100),
  product3: designImage("wooden-guardian-product-3", 900, 1100),
  product4: designImage("wooden-guardian-product-4", 900, 1100),
  uploadHero: designImage("wooden-guardian-upload-hero", 1200, 1200),
  uploadModel: designImage("wooden-guardian-upload-model", 1200, 1200),
  adminHero: designImage("wooden-guardian-admin-hero", 1400, 1000)
} as const;

export const PRODUCT_TAGS = [
  "Hand-carved Wood",
  "Premium Resin",
  "Bronze Cast",
  "Aged Wood",
  "Mythic Beast",
  "Classical Resin"
] as const;

export function productTag(index: number) {
  return PRODUCT_TAGS[index % PRODUCT_TAGS.length];
}
