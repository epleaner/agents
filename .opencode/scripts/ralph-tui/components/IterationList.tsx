import React from 'react';
import { Box, Text } from 'ink';
import type { Iteration, IterationStatus } from '../types.js';

// Simple spinner frames
const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

interface CurrentIterationPanelProps {
  iteration: number;
  status: IterationStatus;
  duration: number;
  tokens: number;
  isSelected: boolean;
}

function getSpinnerFrame(): string {
  const idx = Math.floor(Date.now() / 100) % SPINNER_FRAMES.length;
  return SPINNER_FRAMES[idx];
}

function formatDuration(seconds: number): string {
  if (seconds >= 60) {
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

function formatTokens(tokens: number): string {
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}k tok`;
  }
  return `${tokens} tok`;
}

function getStatusIcon(status: IterationStatus): { icon: string; color: string } {
  switch (status) {
    case 'running':
      return { icon: getSpinnerFrame(), color: 'yellow' };
    case 'completed':
      return { icon: '✓', color: 'green' };
    case 'failed':
      return { icon: '✗', color: 'red' };
    default:
      return { icon: '○', color: 'gray' };
  }
}

export function CurrentIterationPanel({
  iteration,
  status,
  duration,
  tokens,
  isSelected,
}: CurrentIterationPanelProps) {
  const { icon, color } = getStatusIcon(status);
  const statusText = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <Box flexDirection="column" paddingX={1}>
      <Box marginBottom={1}>
        <Text bold color="white">
          CURRENT ITERATION
        </Text>
      </Box>
      <Box borderStyle="single" borderColor="cyan" flexDirection="column" paddingX={1}>
        {iteration > 0 ? (
          <>
            <Box>
              <Text color={color}>{icon}</Text>
              <Text> </Text>
              <Text inverse={isSelected} bold={isSelected}>
                #{iteration}
              </Text>
              <Text> </Text>
              <Text>{statusText}...</Text>
            </Box>
            <Box>
              <Text dimColor>
                {formatDuration(duration)} | {formatTokens(tokens)}
              </Text>
            </Box>
          </>
        ) : (
          <Text dimColor>Waiting to start...</Text>
        )}
      </Box>
    </Box>
  );
}

interface IterationHistoryPanelProps {
  iterations: Map<number, Iteration>;
  currentIteration: number;
  selectedIteration: number;
  maxVisible: number;
}

export function IterationHistoryPanel({
  iterations,
  currentIteration,
  selectedIteration,
  maxVisible,
}: IterationHistoryPanelProps) {
  // Get completed iterations (all iterations except pending ones)
  const completedIterations: Iteration[] = [];
  for (let i = currentIteration; i >= 1; i--) {
    const iter = iterations.get(i);
    if (iter && iter.status !== 'pending') {
      completedIterations.push(iter);
    }
  }

  // Calculate visible slice
  const visibleIterations = completedIterations.slice(0, maxVisible);

  return (
    <Box flexDirection="column" paddingX={1} flexGrow={1}>
      <Box marginBottom={1}>
        <Text bold color="white">
          ITERATION HISTORY
        </Text>
      </Box>
      <Box borderStyle="single" borderColor="cyan" flexDirection="column" paddingX={1} flexGrow={1}>
        {visibleIterations.length === 0 ? (
          <Text dimColor>No completed iterations</Text>
        ) : (
          visibleIterations.map((iter) => {
            const { icon, color } = getStatusIcon(iter.status);
            const isSelected = iter.id === selectedIteration;
            const durStr = `${iter.duration}s`;
            const tokStr =
              iter.tokens >= 1000 ? `${(iter.tokens / 1000).toFixed(1)}k` : `${iter.tokens}t`;

            return (
              <Box key={iter.id}>
                <Text>{isSelected ? '▸ ' : '  '}</Text>
                <Text inverse={isSelected} bold={isSelected}>
                  #{iter.id}
                </Text>
                <Text> </Text>
                <Text color={color}>{icon}</Text>
                <Text dimColor>
                  {' '}
                  {durStr} {tokStr}
                </Text>
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
}

interface IterationListProps {
  iterations: Map<number, Iteration>;
  currentIteration: number;
  selectedIteration: number;
  height: number;
}

export function IterationList({
  iterations,
  currentIteration,
  selectedIteration,
  height,
}: IterationListProps) {
  const currentIter = iterations.get(currentIteration);
  const currentStatus = currentIter?.status || 'pending';
  const currentDuration = currentIter?.duration || 0;
  const currentTokens = currentIter?.tokens || 0;

  // Reserve space for current iteration panel (about 5 lines) and history header (2 lines)
  const historyHeight = Math.max(1, height - 9);

  return (
    <Box flexDirection="column" height={height}>
      <CurrentIterationPanel
        iteration={currentIteration}
        status={currentStatus}
        duration={currentDuration}
        tokens={currentTokens}
        isSelected={selectedIteration === currentIteration}
      />
      <IterationHistoryPanel
        iterations={iterations}
        currentIteration={currentIteration}
        selectedIteration={selectedIteration}
        maxVisible={historyHeight}
      />
    </Box>
  );
}
