import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultSelectedPillarIndex, findingsForPillar, visiblePillarIndices } from './navigation.js';
import type { PillarRowView } from '../score-report/model.js';

function makePillar(key: PillarRowView['key'], findings: PillarRowView['findings']): PillarRowView {
  return {
    key,
    label: key,
    score: 100,
    bar: { filled: 20, dots: 8, tone: 'ok' },
    note: { text: '✓', tone: 'ok' },
    findings,
  };
}

test('defaultSelectedPillarIndex picks first pillar with findings', () => {
  const pillars = [
    makePillar('discoverability', []),
    makePillar('context_efficiency', [{ id: 'C3', message: 'imports', severity: 'warning', locations: [] }]),
  ];
  assert.equal(defaultSelectedPillarIndex(pillars), 1);
});

test('visiblePillarIndices filters by issue id', () => {
  const pillars = [
    makePillar('discoverability', []),
    makePillar('context_efficiency', [{ id: 'C3', message: 'imports', severity: 'warning', locations: [] }]),
  ];
  assert.deepEqual(visiblePillarIndices(pillars, 'c3'), [1]);
});

test('findingsForPillar filters issue messages', () => {
  const pillar = makePillar('context_efficiency', [
    { id: 'C3', message: 'imports high', severity: 'warning', locations: [] },
    { id: 'C4', message: 'fan in', severity: 'recommendation', locations: [] },
  ]);
  assert.equal(findingsForPillar(pillar, 'fan').length, 1);
});