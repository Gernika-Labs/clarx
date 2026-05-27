import type { AnalysisResult } from '@clarxai/engine';
import type { ScoreOptions } from '../../app/score/types.js';
import { bucketFindings } from '../../app/score/findings.js';
import { buildCopyAllText } from '../../app/score/copy-text.js';
import { runScan } from '../../app/score/run-scan.js';
import { createRecursiveWatcher } from '../../platform/watcher.js';
import { executeInkCommand } from './command-loop.js';
import { createCommandHistoryState, historyDown, historyUp, pushCommandHistory } from './history.js';
import { formatExplanation, getRuleCopyText } from '../../commands/explain.js';
import { copyToClipboard } from '../../utils/clipboard.js';
import { track } from '../../utils/telemetry.js';

interface TranscriptEntry {
  command: string;
  lines: string[];
  tone: 'neutral' | 'success' | 'warning';
}

export async function runInkScoreApp(input: {
  opts: ScoreOptions;
  result: AnalysisResult;
  code: number;
  watchMode?: boolean;
}): Promise<number> {
  const React = await import('react');
  const ink = await import('ink');
  const { render, Box, Text, useApp, useInput } = ink;
  const { useEffect, useMemo, useState } = React;
  let latestCode = input.code;

  function App() {
    const { exit } = useApp();
    const [result, setResult] = useState(input.result);
    const [status, setStatus] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastChangedFile, setLastChangedFile] = useState<string | null>(null);
    const [watchError, setWatchError] = useState<string | null>(null);
    const [copied, setCopied] = useState<string | null>(null);
    const [commandBuffer, setCommandBuffer] = useState('');
    const [history, setHistory] = useState(createCommandHistoryState);
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);

    const buckets = useMemo(() => bucketFindings(result), [result]);
    const topRule = buckets.hardFailures[0] ?? buckets.warnings[0] ?? buckets.recommendations[0] ?? null;

    const appendTranscript = (entry: TranscriptEntry) => {
      setTranscript(current => [...current.slice(-7), entry]);
    };

    const refresh = async (source?: string) => {
      setIsRefreshing(true);
      setCopied(null);
      setStatus(source ? `Refreshing after change in ${source}...` : 'Refreshing...');
      if (source) setLastChangedFile(source);
      try {
        const next = await runScan(input.opts);
        latestCode = next.code;
        setResult(next.result);
        setStatus(source ? `Updated from ${source}` : 'Refreshed.');
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        setStatus(`Refresh failed: ${message}`);
        appendTranscript({
          command: 'refresh',
          lines: [`Refresh failed: ${message}`],
          tone: 'warning',
        });
      } finally {
        setIsRefreshing(false);
      }
    };

    useEffect(() => {
      if (!input.watchMode) return;

      let debounce: ReturnType<typeof setTimeout> | null = null;
      let watcher: ReturnType<typeof createRecursiveWatcher> | null = null;

      try {
        watcher = createRecursiveWatcher(input.opts.root, filename => {
          if (debounce) clearTimeout(debounce);
          debounce = setTimeout(() => {
            void refresh(filename);
          }, 400);
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        setWatchError(`Watch mode unavailable: ${message}`);
      }

      return () => {
        if (debounce) clearTimeout(debounce);
        watcher?.close();
      };
    }, []);

    const runCommand = (rawInput: string) => {
      const trimmed = rawInput.trim();
      const handled = executeInkCommand(result, rawInput, {
        formatExplanation,
        getRuleCopyText,
        copyToClipboard,
        track,
      });

      if (handled.refreshRequested) {
        void refresh();
        return;
      }

      if (handled.copiedMessage !== undefined) setCopied(handled.copiedMessage);
      if (handled.statusMessage !== undefined) setStatus(handled.statusMessage);
      if (handled.transcriptEntry) {
        appendTranscript({
          command: trimmed,
          lines: handled.transcriptEntry.split('\n').slice(1),
          tone: handled.copiedMessage ? 'success' : handled.transcriptEntry.includes('Unknown') ? 'warning' : 'neutral',
        });
      }
    };

    useInput((value, key) => {
      if (key.escape) {
        exit();
        return;
      }

      if (key.return) {
        if (commandBuffer.trim().length === 0) {
          exit();
          return;
        }
        runCommand(commandBuffer);
        setHistory(current => pushCommandHistory(current, commandBuffer));
        setCommandBuffer('');
        return;
      }

      if (key.backspace || key.delete) {
        setCommandBuffer(current => current.slice(0, -1));
        return;
      }

      if (key.upArrow) {
        const next = historyUp(history, commandBuffer);
        setHistory(next.state);
        setCommandBuffer(next.buffer);
        return;
      }

      if (key.downArrow) {
        const next = historyDown(history);
        setHistory(next.state);
        setCommandBuffer(next.buffer);
        return;
      }

      if (key.ctrl && value === 'c') {
        exit();
        return;
      }

      if (value === 'q' && commandBuffer.length === 0) {
        exit();
        return;
      }

      if (value && !key.ctrl && !key.meta) {
        if (history.index !== null) {
          setHistory(current => ({ ...current, index: null }));
        }
        setCommandBuffer(current => current + value);
      }
    });

    const pillarRows = Object.entries(result.pillars).map(([name, pillar]) =>
      React.createElement(
        Box,
        { key: name, justifyContent: 'space-between' },
        React.createElement(Text, { color: pillar.score < 70 ? 'yellow' : 'white' }, name),
        React.createElement(Text, { bold: true }, `${pillar.score}`),
      ),
    );

    const summaryRows = [
      React.createElement(Text, { key: 'hard', color: buckets.hardFailures.length ? 'red' : undefined }, `Hard failures: ${buckets.hardFailures.length}`),
      React.createElement(Text, { key: 'warn', color: buckets.warnings.length ? 'yellow' : undefined }, `Warnings: ${buckets.warnings.length}`),
      React.createElement(Text, { key: 'rec', color: buckets.recommendations.length ? 'blue' : undefined }, `Recommendations: ${buckets.recommendations.length}`),
    ];

    return React.createElement(
      Box,
      { flexDirection: 'column', paddingX: 1 },
      React.createElement(Text, { bold: true, color: 'cyan' }, `Clarx score · ${result.score} / 100`),
      React.createElement(Text, { dimColor: true }, `Confidence ${result.confidence} · Engine v${result.version} · ${result.meta.filesScanned} files${input.watchMode ? ' · watch mode' : ''}`),
      isRefreshing
        ? React.createElement(Text, { color: 'yellow' }, 'Refreshing...')
        : null,
      status
        ? React.createElement(Text, { color: status.startsWith('Refresh failed') ? 'red' : 'green' }, status)
        : null,
      watchError
        ? React.createElement(Text, { color: 'yellow' }, watchError)
        : null,
      lastChangedFile
        ? React.createElement(Text, { dimColor: true }, `Last changed: ${lastChangedFile}`)
        : null,
      result.confidenceCaveat
        ? React.createElement(Text, { color: 'yellow' }, result.confidenceCaveat)
        : null,
      result.tip
        ? React.createElement(Text, { color: 'cyan' }, result.tip)
        : null,
      React.createElement(Box, { marginTop: 1, flexDirection: 'column' }, summaryRows),
      React.createElement(
        Box,
        { marginTop: 1 },
        React.createElement(Text, { bold: true }, 'Pillars'),
      ),
      React.createElement(Box, { flexDirection: 'column' }, pillarRows),
      topRule
        ? React.createElement(
            Box,
            { flexDirection: 'column', marginTop: 1 },
            React.createElement(Text, { bold: true }, 'Top issue'),
            React.createElement(Text, { color: topRule.severity === 'hard_failure' ? 'red' : topRule.severity === 'warning' ? 'yellow' : 'blue' }, `${topRule.id} · ${topRule.message}`),
          )
        : React.createElement(
            Box,
            { marginTop: 1 },
            React.createElement(Text, { color: 'green' }, 'No issues found.'),
          ),
      copied
        ? React.createElement(
            Box,
            { marginTop: 1 },
            React.createElement(Text, { color: copied.startsWith('Copied') ? 'green' : 'yellow' }, copied),
          )
        : null,
      React.createElement(
        Box,
        { marginTop: 1 },
        React.createElement(Text, { dimColor: true }, `Command prompt: C1 · C · show all · copy all · copy E2${input.watchMode ? ' · r via command' : ' · --watch for live mode'}`),
      ),
      transcript.length > 0
        ? React.createElement(
            Box,
            { marginTop: 1, flexDirection: 'column' },
            React.createElement(Text, { bold: true }, 'Output'),
            ...transcript.map((entry, index) => React.createElement(
                Box,
                { key: `${index}-${entry.command.slice(0, 8)}`, flexDirection: 'column', marginBottom: 1 },
                React.createElement(Text, { dimColor: true }, `> ${entry.command}`),
                ...entry.lines.map((line, lineIndex) =>
                  React.createElement(
                    Text,
                    {
                      key: `${index}-${lineIndex}`,
                      color: entry.tone === 'success' ? 'green' : entry.tone === 'warning' ? 'yellow' : undefined,
                    },
                    line,
                  ),
                ),
              )),
          )
        : null,
      React.createElement(
        Box,
        { marginTop: 1 },
        React.createElement(Text, { color: 'cyan' }, '› '),
        React.createElement(Text, null, commandBuffer.length > 0 ? commandBuffer : ''),
        React.createElement(Text, { dimColor: true }, commandBuffer.length === 0 ? 'Type a command and press Enter' : ''),
      ),
      React.createElement(
        Box,
        null,
        React.createElement(Text, { dimColor: true }, 'History: ↑ older · ↓ newer'),
      ),
    );
  }

  const instance = render(React.createElement(App));
  await instance.waitUntilExit();
  return input.code;
}
