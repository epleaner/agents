import React, { useMemo } from 'react';
import { Box, Text } from 'ink';

interface OutputPanelProps {
  output: string;
  iteration: number;
  scrollOffset: number;
  height: number;
  width: number;
  totalLines: number;
  isCurrentIteration: boolean;
}

export function OutputPanel({
  output,
  iteration,
  scrollOffset,
  height,
  width,
  totalLines,
  isCurrentIteration,
}: OutputPanelProps) {
  const lines = useMemo(() => {
    if (!output) return [];
    return output.split('\n');
  }, [output]);

  const contentHeight = Math.max(1, height - 4); // Account for header and borders
  const contentWidth = Math.max(10, width - 4); // Account for padding and borders

  // Calculate visible lines based on scroll offset
  const visibleLines = useMemo(() => {
    if (lines.length === 0) return [];

    // Auto-scroll to bottom if viewing current running iteration
    let effectiveOffset = scrollOffset;
    if (isCurrentIteration && lines.length > contentHeight) {
      effectiveOffset = Math.max(0, lines.length - contentHeight);
    }

    const start = Math.max(0, effectiveOffset);
    const end = start + contentHeight;
    return lines.slice(start, end).map((line) => {
      // Truncate lines that are too long
      if (line.length > contentWidth) {
        return line.substring(0, contentWidth - 3) + '...';
      }
      return line;
    });
  }, [lines, scrollOffset, contentHeight, contentWidth, isCurrentIteration]);

  // Calculate scroll percentage
  const scrollPercentage = useMemo(() => {
    if (totalLines <= contentHeight) return 100;
    const maxOffset = totalLines - contentHeight;
    const currentOffset = isCurrentIteration ? maxOffset : scrollOffset;
    return Math.min(100, Math.round(((currentOffset + contentHeight) / totalLines) * 100));
  }, [totalLines, contentHeight, scrollOffset, isCurrentIteration]);

  const headerText = iteration > 0 ? `AGENT OUTPUT - Iteration #${iteration}` : 'AGENT OUTPUT';

  return (
    <Box flexDirection="column" height={height} width={width}>
      <Box paddingX={1} marginBottom={0}>
        <Text bold color="white">
          {headerText}
        </Text>
        {totalLines > contentHeight && (
          <Box marginLeft={2}>
            <Text dimColor>[{scrollPercentage}%]</Text>
          </Box>
        )}
      </Box>
      <Box
        borderStyle="single"
        borderColor="cyan"
        flexDirection="column"
        paddingX={1}
        flexGrow={1}
        overflow="hidden"
      >
        {visibleLines.length === 0 ? (
          <Text dimColor>No output yet...</Text>
        ) : (
          visibleLines.map((line, idx) => (
            <Text key={idx} wrap="truncate">
              {line}
            </Text>
          ))
        )}
      </Box>
    </Box>
  );
}
