import React from 'react';
import { Box, Text } from 'ink';

interface StatusBarProps {
  paused: boolean;
  completed: boolean;
  completionReason: string;
  currentIteration: number;
  maxIterations: number;
  elapsedSeconds: number;
  width: number;
}

function formatElapsed(seconds: number): string {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}m ${sec}s`;
}

export function StatusBar({
  paused,
  completed,
  completionReason,
  currentIteration,
  maxIterations,
  elapsedSeconds,
  width,
}: StatusBarProps) {
  let statusText: string;
  let statusColor: string;

  if (paused) {
    statusText = 'PAUSED';
    statusColor = 'yellow';
  } else if (completed) {
    statusText = completionReason === 'marker_detected' ? 'COMPLETE' : completionReason.toUpperCase();
    statusColor = completionReason === 'marker_detected' ? 'green' : 'yellow';
  } else {
    statusText = 'RUNNING';
    statusColor = 'green';
  }

  const shortcuts = '[↑/↓] Navigate  [q] Quit  [p] Pause  [r] Resume  [?] Help';
  const rightInfo = `${currentIteration}/${maxIterations}`;
  const elapsed = formatElapsed(elapsedSeconds);

  return (
    <Box
      borderStyle="single"
      borderColor="cyan"
      paddingX={1}
      justifyContent="space-between"
      width={width}
    >
      <Box>
        <Text dimColor>{shortcuts}</Text>
      </Box>
      <Box>
        <Text color={statusColor} bold>
          {statusText}
        </Text>
        <Text> | </Text>
        <Text>{elapsed}</Text>
        <Text> | </Text>
        <Text>{rightInfo}</Text>
      </Box>
    </Box>
  );
}
