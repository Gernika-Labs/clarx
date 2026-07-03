import { Text } from './text.js';

export function Footer({ filterActive }: { filterActive?: boolean }): string {
  if (filterActive) {
    return Text({ children: 'type to filter pillars/issues · Enter clear · Esc cancel', dim: true });
  }
  return [
    Text({ children: '↓↑', intent: 'brand' }),
    Text({ children: ' navigate', dim: true }),
    '  ',
    Text({ children: 'Tab', intent: 'brand' }),
    Text({ children: ' issue', dim: true }),
    '  ',
    Text({ children: 'Enter', intent: 'brand' }),
    Text({ children: ' open', dim: true }),
    '  ',
    Text({ children: '/', intent: 'brand' }),
    Text({ children: ' filter', dim: true }),
    '  ',
    Text({ children: 'c', intent: 'brand' }),
    Text({ children: ' copy', dim: true }),
    '  ',
    Text({ children: 'r', intent: 'brand' }),
    Text({ children: ' rescan', dim: true }),
    '  ',
    Text({ children: 'q', intent: 'brand' }),
    Text({ children: ' quit', dim: true }),
  ].join('');
}