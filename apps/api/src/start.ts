import { spawn, type ChildProcess } from 'node:child_process';
import { join } from 'node:path';

const processes = [
  { name: 'api', entryPoint: join(__dirname, 'index.js') },
  { name: 'worker', entryPoint: join(__dirname, 'workers', 'index.js') },
] as const;

const children: ChildProcess[] = [];
let shutdownRequested = false;
let exitCode = 0;

function finishWhenStopped() {
  if (
    shutdownRequested &&
    children.length === processes.length &&
    children.every((child) => child.exitCode !== null || child.signalCode !== null)
  ) {
    process.exitCode = exitCode;
  }
}

function stopChildren(signal: NodeJS.Signals) {
  if (shutdownRequested) return;
  shutdownRequested = true;

  for (const child of children) {
    if (child.exitCode === null && child.signalCode === null) child.kill(signal);
  }

  const forceStopTimer = setTimeout(() => {
    for (const child of children) {
      if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL');
    }
  }, 10_000);
  forceStopTimer.unref();
}

process.once('SIGINT', () => stopChildren('SIGINT'));
process.once('SIGTERM', () => stopChildren('SIGTERM'));

for (const processToStart of processes) {
  const child = spawn(process.execPath, [processToStart.entryPoint], {
    stdio: 'inherit',
  });
  children.push(child);

  child.once('error', (error) => {
    console.error(`Could not start ${processToStart.name}:`, error);
    exitCode = 1;
    stopChildren('SIGTERM');
  });

  child.once('close', (code, signal) => {
    if (!shutdownRequested) {
      console.error(
        `${processToStart.name} exited unexpectedly (code: ${code}, signal: ${signal})`,
      );
      exitCode = code && code !== 0 ? code : 1;
      stopChildren('SIGTERM');
    }
    finishWhenStopped();
  });
}

console.log('API and worker processes started');
