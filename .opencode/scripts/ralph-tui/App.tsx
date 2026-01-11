import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Text, useInput, useApp, useStdout } from 'ink';
import { IterationList } from './components/IterationList.js';
import { OutputPanel } from './components/OutputPanel.js';
import { StatusBar } from './components/StatusBar.js';
import { HelpOverlay } from './components/HelpOverlay.js';
import { useAgent } from './hooks/useAgent.js';
import type { AgentConfig } from './types.js';

interface AppProps {
  config: AgentConfig;
}

export function App({ config }: AppProps) {
  const { exit } = useApp();
  const { stdout } = useStdout();

  // Terminal dimensions
  const [dimensions, setDimensions] = useState(() => ({
    width: stdout?.columns || 120,
    height: stdout?.rows || 40,
  }));

  // UI state
  const [showHelp, setShowHelp] = useState(false);
  const [outputScrollOffset, setOutputScrollOffset] = useState(0);
  const [selectedIteration, setSelectedIteration] = useState(0);

  // Agent state
  const { sessionState, isRunning, pause, resume, stop, getIterationOutput } = useAgent(config);

  // Update dimensions on resize
  useEffect(() => {
    const handleResize = () => {
      if (stdout) {
        setDimensions({
          width: stdout.columns || 120,
          height: stdout.rows || 40,
        });
      }
    };

    stdout?.on('resize', handleResize);
    return () => {
      stdout?.off('resize', handleResize);
    };
  }, [stdout]);

  // Track selected iteration, auto-update to current when at current
  useEffect(() => {
    if (selectedIteration === 0 || selectedIteration === sessionState.currentIteration - 1) {
      setSelectedIteration(sessionState.currentIteration);
    }
  }, [sessionState.currentIteration]);

  // Get output for selected iteration - also depend on tick for live updates
  const currentOutput = useMemo(() => {
    const iterToShow = selectedIteration || sessionState.currentIteration;
    if (iterToShow === 0) return '';
    const iter = sessionState.iterations.get(iterToShow);
    return iter?.output || getIterationOutput(iterToShow);
  }, [selectedIteration, sessionState.currentIteration, sessionState.iterations, getIterationOutput]);

  // Calculate output total lines
  const outputTotalLines = useMemo(() => {
    if (!currentOutput) return 0;
    return currentOutput.split('\n').length;
  }, [currentOutput]);

  // Calculate elapsed time
  const elapsedSeconds = useMemo(() => {
    return Math.floor((Date.now() - sessionState.startTime) / 1000);
  }, [sessionState.startTime]);

  // Force re-render for elapsed time and spinner
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 100);
    return () => clearInterval(interval);
  }, []);

  // Calculate layout dimensions
  const leftPanelWidth = Math.floor(dimensions.width / 4);
  const rightPanelWidth = dimensions.width - leftPanelWidth;
  const contentHeight = dimensions.height - 3; // Reserve space for status bar

  // Keyboard input handling
  useInput(
    (input, key) => {
      // If help is showing, any key closes it
      if (showHelp) {
        setShowHelp(false);
        return;
      }

      // Quit
      if (input === 'q' || input === 'Q') {
        stop();
        exit();
        return;
      }

      // Help toggle
      if (input === '?') {
        setShowHelp(true);
        return;
      }

      // Pause/Resume
      if (input === 'p' || input === 'P') {
        pause();
        return;
      }
      if (input === 'r' || input === 'R') {
        resume();
        return;
      }

      // Navigation - UP (move to newer iteration, i.e., higher number)
      // FIX: Allow navigating UP to the CURRENT iteration (<=, not <)
      if (key.upArrow || input === 'k') {
        setSelectedIteration((prev) => {
          // Can navigate up to and including the current iteration
          if (prev < sessionState.currentIteration) {
            const newSelected = prev + 1;
            setOutputScrollOffset(0); // Reset scroll when changing iterations
            return newSelected;
          }
          return prev;
        });
        return;
      }

      // Navigation - DOWN (move to older iteration, i.e., lower number)
      if (key.downArrow || input === 'j') {
        setSelectedIteration((prev) => {
          if (prev > 1) {
            const newSelected = prev - 1;
            setOutputScrollOffset(0);
            return newSelected;
          }
          return prev;
        });
        return;
      }

      // Jump to first
      if (input === 'g' || (key.meta && key.upArrow)) {
        setSelectedIteration(1);
        setOutputScrollOffset(0);
        return;
      }

      // Jump to last (current)
      if (input === 'G' || (key.meta && key.downArrow)) {
        setSelectedIteration(sessionState.currentIteration);
        setOutputScrollOffset(0);
        return;
      }

      // Page Up - scroll output up
      if (key.pageUp) {
        setOutputScrollOffset((prev) => Math.max(0, prev - 10));
        return;
      }

      // Page Down - scroll output down
      if (key.pageDown) {
        const maxOffset = Math.max(0, outputTotalLines - (contentHeight - 4));
        setOutputScrollOffset((prev) => Math.min(maxOffset, prev + 10));
        return;
      }
    },
    { isActive: true }
  );

  // Check if viewing current running iteration (for auto-scroll)
  const isViewingCurrentIteration = selectedIteration === sessionState.currentIteration;
  const currentIterStatus = sessionState.iterations.get(sessionState.currentIteration)?.status;
  const isCurrentRunning = currentIterStatus === 'running';

  return (
    <Box flexDirection="column" width={dimensions.width} height={dimensions.height}>
      {/* Main content area */}
      <Box flexDirection="row" height={contentHeight}>
        {/* Left panel - iteration list */}
        <Box width={leftPanelWidth} flexDirection="column">
          <IterationList
            iterations={sessionState.iterations}
            currentIteration={sessionState.currentIteration}
            selectedIteration={selectedIteration || sessionState.currentIteration}
            height={contentHeight}
          />
        </Box>

        {/* Right panel - output */}
        <Box width={rightPanelWidth} flexDirection="column">
          <OutputPanel
            output={currentOutput}
            iteration={selectedIteration || sessionState.currentIteration}
            scrollOffset={outputScrollOffset}
            height={contentHeight}
            width={rightPanelWidth}
            totalLines={outputTotalLines}
            isCurrentIteration={isViewingCurrentIteration && isCurrentRunning}
          />
        </Box>
      </Box>

      {/* Status bar */}
      <StatusBar
        paused={sessionState.paused}
        completed={sessionState.completed}
        completionReason={sessionState.completionReason}
        currentIteration={sessionState.currentIteration}
        maxIterations={sessionState.maxIterations}
        elapsedSeconds={elapsedSeconds}
        width={dimensions.width}
      />

      {/* Help overlay */}
      {showHelp && <HelpOverlay width={dimensions.width} height={dimensions.height} />}

      {/* Completion message */}
      {sessionState.completed && (
        <Box
          position="absolute"
          marginLeft={Math.floor((dimensions.width - 40) / 2)}
          marginTop={Math.floor(dimensions.height / 2)}
        >
          <Text bold inverse>
            {' '}
            Session complete. Press q to exit...{' '}
          </Text>
        </Box>
      )}
    </Box>
  );
}
