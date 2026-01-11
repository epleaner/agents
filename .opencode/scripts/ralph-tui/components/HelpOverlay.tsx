import React from 'react';
import { Box, Text } from 'ink';

interface HelpOverlayProps {
  width: number;
  height: number;
}

const SHORTCUTS = [
  { key: '↑/k, ↓/j', description: 'Navigate iterations (including current)' },
  { key: 'Home/g', description: 'Jump to first iteration' },
  { key: 'End/G', description: 'Jump to current/latest iteration' },
  { key: 'PgUp/PgDn', description: 'Scroll output' },
  { key: 'p', description: 'Pause execution' },
  { key: 'r', description: 'Resume execution' },
  { key: 'q', description: 'Quit' },
  { key: '?', description: 'Toggle this help' },
];

export function HelpOverlay({ width, height }: HelpOverlayProps) {
  const overlayWidth = Math.min(60, width - 10);
  const overlayHeight = Math.min(16, height - 4);
  const leftPad = Math.floor((width - overlayWidth) / 2);
  const topPad = Math.floor((height - overlayHeight) / 2);

  return (
    <Box
      position="absolute"
      marginLeft={leftPad}
      marginTop={topPad}
      width={overlayWidth}
      height={overlayHeight}
      flexDirection="column"
      borderStyle="double"
      borderColor="yellow"
      paddingX={2}
      paddingY={1}
    >
      <Box justifyContent="center" marginBottom={1}>
        <Text bold color="yellow">
          KEYBOARD SHORTCUTS
        </Text>
      </Box>

      {SHORTCUTS.map(({ key, description }, idx) => (
        <Box key={idx} marginBottom={idx === SHORTCUTS.length - 1 ? 0 : 0}>
          <Box width={16}>
            <Text bold>{key}</Text>
          </Box>
          <Text>{description}</Text>
        </Box>
      ))}

      <Box marginTop={1} justifyContent="center">
        <Text dimColor>Press any key to close...</Text>
      </Box>
    </Box>
  );
}
