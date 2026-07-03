export const INTENT = [
  'success',
  'warning',
  'danger',
  'neutral',
  'info',
  'brand',
] as const

export const AI_INTENT = [
  'streaming',
  'thinking',
  'tool-call',
  'uncertain',
] as const

export const APPEARANCE = ['soft', 'solid'] as const

export const SIZE = ['sm', 'md'] as const

export const CLARX_NEON_PALETTE = {
  laserCyan: '#63E7FF',
  arcadeBlue: '#2FA7FF',
  hotMagenta: '#FF4FBF',
  neonViolet: '#A94CFF',
  sunsetCoral: '#FF6B8E',
  retroOrange: '#FF9A3D',
  solarGold: '#FFD166',
  nightIndigo: '#241B59',
  synthNavy: '#121533',
  deepSpace: '#080B17',
} as const

export type Intent = (typeof INTENT)[number]
export type AIIntent = (typeof AI_INTENT)[number]
export type Appearance = (typeof APPEARANCE)[number]
export type Size = (typeof SIZE)[number]
