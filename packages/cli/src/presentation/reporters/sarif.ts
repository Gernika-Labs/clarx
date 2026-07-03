import type { AnalysisResult, RuleResult, Severity } from '@clarxai/engine';
import { pathToFileURL } from 'node:url';

type SarifLevel = 'error' | 'warning' | 'note';

interface SarifDocument {
  $schema: string;
  version: '2.1.0';
  runs: Array<{
    tool: {
      driver: {
        name: string;
        version: string;
        informationUri: string;
        rules: Array<{
          id: string;
          shortDescription: { text: string };
          fullDescription?: { text: string };
          defaultConfiguration: { level: SarifLevel };
        }>;
      };
    };
    originalUriBaseIds: Record<string, { uri: string }>;
    results: Array<{
      ruleId: string;
      level: SarifLevel;
      message: { text: string };
      locations: Array<{
        physicalLocation: {
          artifactLocation: { uri: string; uriBaseId: string };
          region?: { startLine: number; endLine?: number };
        };
      }>;
    }>;
  }>;
}

function severityToLevel(severity: Severity): SarifLevel {
  switch (severity) {
    case 'hard_failure':
      return 'error';
    case 'warning':
      return 'warning';
    default:
      return 'note';
  }
}

function failingRules(result: AnalysisResult): RuleResult[] {
  return Object.values(result.rules).filter((rule): rule is RuleResult => Boolean(rule && !rule.passed));
}

function ruleLocations(rule: RuleResult) {
  if (!rule.locations?.length) {
    return [{
      physicalLocation: {
        artifactLocation: { uri: '.', uriBaseId: '%SRCROOT%' },
      },
    }];
  }

  return rule.locations.map(loc => ({
    physicalLocation: {
      artifactLocation: { uri: loc.path, uriBaseId: '%SRCROOT%' },
      region: loc.line
        ? { startLine: loc.line, ...(loc.endLine ? { endLine: loc.endLine } : {}) }
        : undefined,
    },
  }));
}

export function formatSarif(result: AnalysisResult): string {
  const failing = failingRules(result);
  const rulesById = new Map(failing.map(rule => [rule.id, rule]));

  const doc: SarifDocument = {
    $schema: 'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
    version: '2.1.0',
    runs: [{
      tool: {
        driver: {
          name: 'clarx',
          version: result.version,
          informationUri: 'https://clarx.ai',
          rules: [...rulesById.values()].map(rule => ({
            id: rule.id,
            shortDescription: { text: rule.message },
            ...(rule.remediation ? { fullDescription: { text: rule.remediation } } : {}),
            defaultConfiguration: { level: severityToLevel(rule.severity) },
          })),
        },
      },
      originalUriBaseIds: {
        '%SRCROOT%': { uri: pathToFileURL(result.meta.root).href },
      },
      results: failing.map(rule => ({
        ruleId: rule.id,
        level: severityToLevel(rule.severity),
        message: { text: rule.message },
        locations: ruleLocations(rule),
      })),
    }],
  };

  return JSON.stringify(doc, null, 2);
}