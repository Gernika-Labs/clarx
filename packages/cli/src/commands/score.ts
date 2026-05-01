import { analyze } from '@clarxai/engine';
import { resolve } from 'node:path';
import { exit } from 'node:process';
import { formatText } from '../reporters/text.js';
import { formatMarkdown } from '../reporters/markdown.js';

export async function scoreCommand(args: string[]) {
  const pathArg = args.find(a => !a.startsWith('--')) ?? '.';
  const root = resolve(pathArg);

  const minScore = getFlag(args, '--min-score');
  const minPillarScore = getFlag(args, '--min-pillar-score');
  const format = getFlagValue(args, '--format') ?? 'text';
  const ignoreFlag = getFlagValue(args, '--ignore');
  const ignore = ignoreFlag ? ignoreFlag.split(',') : [];
  const verbose = args.includes('--verbose');

  const result = await analyze({ root, ignore });

  switch (format) {
    case 'json':
      console.log(JSON.stringify(result, null, 2));
      break;
    case 'markdown':
    case 'md':
      console.log(formatMarkdown(result, { verbose }));
      break;
    case 'text':
    default:
      console.log(formatText(result, { verbose }));
  }

  if (result.hardFailures.length > 0) {
    exit(2);
  }
  if (minScore !== null && result.score < minScore) {
    exit(1);
  }
  if (minPillarScore !== null) {
    const pillarScores = Object.values(result.pillars).map(p => p.score);
    if (pillarScores.some(s => s < minPillarScore)) {
      exit(1);
    }
  }
}

function getFlag(args: string[], flag: string): number | null {
  const i = args.indexOf(flag);
  if (i === -1) return null;
  const val = args[i + 1];
  return val ? Number(val) : null;
}

function getFlagValue(args: string[], flag: string): string | null {
  const i = args.indexOf(flag);
  if (i === -1) return null;
  return args[i + 1] ?? null;
}
