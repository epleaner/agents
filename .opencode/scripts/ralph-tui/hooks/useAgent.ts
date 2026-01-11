import { useState, useEffect, useCallback, useRef } from 'react';
import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import type { Iteration, IterationStatus, AgentConfig, SessionState } from '../types.js';

const COMPLETION_MARKERS = ['- [x] TASK_COMPLETE', 'RALPH_COMPLETE'];

function generateSessionId(): string {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10);
  const timePart = now.toTimeString().slice(0, 8).replace(/:/g, '');
  return `ralph-${datePart}-${timePart}`;
}

function detectCompletion(output: string): boolean {
  return COMPLETION_MARKERS.some((marker) => output.includes(marker));
}

function hashOutput(output: string): string {
  let hash = 0;
  for (let i = 0; i < output.length; i++) {
    const char = output.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

export interface UseAgentResult {
  sessionState: SessionState;
  isRunning: boolean;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  getIterationOutput: (iteration: number) => string;
}

export function useAgent(config: AgentConfig): UseAgentResult {
  const startTimeRef = useRef(Date.now());
  
  const [sessionState, setSessionState] = useState<SessionState>(() => ({
    sessionId: config.resumeSession || generateSessionId(),
    startTime: startTimeRef.current,
    maxIterations: config.maxIterations,
    timeout: config.timeout,
    paused: false,
    completed: false,
    completionReason: '',
    currentIteration: 0,
    selectedIteration: 0,
    iterations: new Map(),
  }));

  const [isRunning, setIsRunning] = useState(true);
  const agentProcess = useRef<ChildProcess | null>(null);
  const outputHashes = useRef<string[]>([]);
  const stateDir = useRef<string>('');
  const pausedRef = useRef(false);
  const runningRef = useRef(true);

  // Initialize state directory
  useEffect(() => {
    const projectRoot = process.cwd();
    stateDir.current = path.join(projectRoot, '.ralph-state', sessionState.sessionId);
    fs.mkdirSync(stateDir.current, { recursive: true });
  }, [sessionState.sessionId]);

  const getIterationOutput = useCallback(
    (iteration: number): string => {
      const iter = sessionState.iterations.get(iteration);
      if (iter?.output) {
        return iter.output;
      }
      // Try to read from file
      const outputFile = path.join(stateDir.current, `${iteration}-output.txt`);
      if (fs.existsSync(outputFile)) {
        return fs.readFileSync(outputFile, 'utf-8');
      }
      return '';
    },
    [sessionState.iterations]
  );

  const updateIteration = useCallback((id: number, updates: Partial<Iteration>) => {
    setSessionState((prev) => {
      const iterations = new Map(prev.iterations);
      const existing = iterations.get(id) || {
        id,
        status: 'pending' as IterationStatus,
        duration: 0,
        tokens: 0,
        output: '',
      };
      iterations.set(id, { ...existing, ...updates });
      return { ...prev, iterations };
    });
  }, []);

  const createEnhancedPrompt = useCallback(
    (iteration: number, originalPrompt: string): string => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const elapsedMin = Math.floor(elapsed / 60);
      const elapsedSec = elapsed % 60;
      const percentage = Math.floor((iteration * 100) / config.maxIterations);

      let eta = 'N/A';
      if (iteration > 1) {
        const avgTime = elapsed / (iteration - 1);
        const remaining = config.maxIterations - iteration;
        const etaSeconds = Math.floor(avgTime * remaining);
        eta = `${Math.floor(etaSeconds / 60)}m`;
      }

      return `<!-- RALPH ORCHESTRATION CONTEXT -->
## Session: ${sessionState.sessionId}
Iteration: ${iteration}/${config.maxIterations} (${percentage}%)
Elapsed: ${elapsedMin}m ${elapsedSec}s
ETA: ${eta} (estimated)

## Current Objective
Complete the task below. When finished, include one of these markers:
- \`- [x] TASK_COMPLETE\` (markdown checkbox)
- \`RALPH_COMPLETE\` (magic string)

<!-- END RALPH CONTEXT -->

${originalPrompt}`;
    },
    [sessionState.sessionId, config.maxIterations]
  );

  const runIteration = useCallback(
    async (iteration: number, prompt: string): Promise<{ output: string; success: boolean }> => {
      return new Promise((resolve) => {
        const startTime = Date.now();
        const outputFile = path.join(stateDir.current, `${iteration}-output.txt`);
        let output = '';

        updateIteration(iteration, {
          status: 'running',
          startTime,
          outputFile,
        });

        if (config.dryRun) {
          // Simulate agent execution
          setTimeout(() => {
            output = `[DRY RUN] Simulated agent output for iteration ${iteration}\nWorking on the task...\nProgress: ${iteration}/${config.maxIterations}`;
            const duration = 2;
            const tokens = Math.floor(Math.random() * 500) + 500;

            fs.writeFileSync(outputFile, output);
            updateIteration(iteration, {
              status: 'completed',
              endTime: Date.now(),
              duration,
              tokens,
              output,
            });
            resolve({ output, success: true });
          }, 2000);
          return;
        }

        // Real agent invocation
        const enhancedPrompt = createEnhancedPrompt(iteration, prompt);
        const child = spawn('opencode', ['run', '--agent', config.agentName, enhancedPrompt], {
          stdio: ['ignore', 'pipe', 'pipe'],
          cwd: process.cwd(),
        });

        agentProcess.current = child;

        child.stdout?.on('data', (data: Buffer) => {
          const chunk = data.toString();
          output += chunk;

          // Update output in real-time
          const now = Date.now();
          const duration = Math.floor((now - startTime) / 1000);
          const tokens = Math.floor(output.length / 4); // rough estimate

          updateIteration(iteration, {
            duration,
            tokens,
            output,
          });
        });

        child.stderr?.on('data', (data: Buffer) => {
          output += data.toString();
        });

        child.on('close', (code) => {
          agentProcess.current = null;
          const endTime = Date.now();
          const duration = Math.floor((endTime - startTime) / 1000);
          const tokens = Math.floor(output.length / 4);
          const status: IterationStatus = code === 0 ? 'completed' : 'failed';

          fs.writeFileSync(outputFile, output);
          updateIteration(iteration, {
            status,
            endTime,
            duration,
            tokens,
            output,
          });

          resolve({ output, success: code === 0 });
        });

        child.on('error', (err) => {
          agentProcess.current = null;
          output += `\nError: ${err.message}`;
          updateIteration(iteration, {
            status: 'failed',
            endTime: Date.now(),
            duration: Math.floor((Date.now() - startTime) / 1000),
            output,
          });
          resolve({ output, success: false });
        });
      });
    },
    [config, createEnhancedPrompt, updateIteration]
  );

  const detectInfiniteLoop = useCallback((output: string): boolean => {
    const hash = hashOutput(output);
    outputHashes.current.push(hash);

    if (outputHashes.current.length > 3) {
      outputHashes.current = outputHashes.current.slice(-3);
    }

    if (outputHashes.current.length >= 3) {
      const [a, b, c] = outputHashes.current;
      if (a === b && b === c) {
        return true;
      }
    }

    return false;
  }, []);

  // Main orchestration loop
  useEffect(() => {
    let mounted = true;
    let loopTimeout: NodeJS.Timeout | null = null;

    const loadPrompt = (): string => {
      if (config.promptText) {
        return config.promptText;
      }
      if (config.promptFile && fs.existsSync(config.promptFile)) {
        return fs.readFileSync(config.promptFile, 'utf-8');
      }
      return 'No prompt provided';
    };

    const runLoop = async () => {
      const originalPrompt = loadPrompt();

      for (let i = 1; i <= config.maxIterations && mounted && runningRef.current; i++) {
        // Check timeout
        const elapsed = Date.now() - startTimeRef.current;
        if (elapsed >= config.timeout * 1000) {
          setSessionState((prev) => ({
            ...prev,
            completed: true,
            completionReason: 'timeout',
          }));
          break;
        }

        // Wait while paused
        while (pausedRef.current && mounted) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        if (!mounted || !runningRef.current) break;

        // Update current iteration
        setSessionState((prev) => ({
          ...prev,
          currentIteration: i,
          selectedIteration: prev.selectedIteration === prev.currentIteration || prev.selectedIteration === 0 ? i : prev.selectedIteration,
        }));

        // Run the iteration
        const { output, success } = await runIteration(i, originalPrompt);

        if (!mounted || !runningRef.current) break;

        // Check for completion markers
        if (detectCompletion(output)) {
          setSessionState((prev) => ({
            ...prev,
            completed: true,
            completionReason: 'marker_detected',
          }));
          break;
        }

        // Check for infinite loop
        if (detectInfiniteLoop(output)) {
          setSessionState((prev) => ({
            ...prev,
            completed: true,
            completionReason: 'infinite_loop',
          }));
          break;
        }

        // Sleep between iterations
        if (i < config.maxIterations) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }

      // Check if we hit max iterations
      if (mounted && runningRef.current) {
        setSessionState((prev) => {
          if (!prev.completed && prev.currentIteration >= config.maxIterations) {
            return {
              ...prev,
              completed: true,
              completionReason: 'max_iterations',
            };
          }
          return prev;
        });
      }

      setIsRunning(false);
    };

    runLoop();

    return () => {
      mounted = false;
      if (loopTimeout) clearTimeout(loopTimeout);
    };
  }, [config.maxIterations, config.timeout, config.promptFile, config.promptText]);

  const pause = useCallback(() => {
    pausedRef.current = true;
    setSessionState((prev) => ({ ...prev, paused: true }));
    if (agentProcess.current) {
      agentProcess.current.kill('SIGSTOP');
    }
  }, []);

  const resume = useCallback(() => {
    pausedRef.current = false;
    setSessionState((prev) => ({ ...prev, paused: false }));
    if (agentProcess.current) {
      agentProcess.current.kill('SIGCONT');
    }
  }, []);

  const stop = useCallback(() => {
    runningRef.current = false;
    setIsRunning(false);
    if (agentProcess.current) {
      agentProcess.current.kill('SIGTERM');
    }
    setSessionState((prev) => ({
      ...prev,
      completed: true,
      completionReason: 'user_quit',
    }));
  }, []);

  return {
    sessionState,
    isRunning,
    pause,
    resume,
    stop,
    getIterationOutput,
  };
}
