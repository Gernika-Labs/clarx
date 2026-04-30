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

export type Intent = (typeof INTENT)[number]
export type AIIntent = (typeof AI_INTENT)[number]
export type Appearance = (typeof APPEARANCE)[number]
export type Size = (typeof SIZE)[number]
