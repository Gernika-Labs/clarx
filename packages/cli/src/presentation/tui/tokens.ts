export const INTENT = [
  'success',
  'warning',
  'danger',
  'neutral',
  'info',
  'brand',
] as const;

export type Intent = (typeof INTENT)[number];

export const CLARX_NEON_STOPS = [
  [99, 231, 255],
  [47, 167, 255],
  [169, 76, 255],
  [255, 79, 191],
  [255, 209, 102],
] as const;

export const INTENT_RGB: Record<Intent, [number, number, number]> = {
  success: [80, 200, 120],
  warning: [230, 180, 60],
  danger: [220, 90, 90],
  neutral: [180, 180, 190],
  info: [80, 180, 230],
  brand: [99, 231, 255],
};