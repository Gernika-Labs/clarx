import type { FooterContext } from '../views.js';
import { Text } from './text.js';

function hint(key: string, label: string): string {
  return `${Text({ children: key, intent: 'brand' })}${Text({ children: label, dim: true })}`;
}

const JOIN = `  ${Text({ children: '·', dim: true })}  `;

export function Footer({
  context,
  multipleIssues = false,
  bodyScrollable = false,
}: {
  context: FooterContext;
  multipleIssues?: boolean;
  bodyScrollable?: boolean;
}): string {
  switch (context) {
    case 'filter':
      return Text({ children: 'type to filter · Enter apply · Esc cancel', dim: true });
    case 'command':
      return [
        hint('Enter', ' run'),
        hint('↑↓', ' history'),
        hint('Esc', ' cancel'),
      ].join(JOIN);
    case 'detail':
      return [
        hint('Esc', ' back'),
        hint('↑↓', ' scroll'),
        hint('c', ' copy fix'),
        ...(multipleIssues ? [hint('Tab', ' next issue')] : []),
      ].join(JOIN);
    case 'main':
    default:
      return [
        hint('↓↑', bodyScrollable ? ' scroll' : ' pillars'),
        ...(bodyScrollable ? [hint('PgUp/Dn', ' page')] : []),
        ...(multipleIssues ? [hint('Tab', ' issue')] : []),
        hint('Enter', ' details'),
        hint('/', ' filter'),
        hint('c', ' copy'),
        hint('r', ' rescan'),
        hint('q', ' quit'),
      ].join(JOIN);
  }
}