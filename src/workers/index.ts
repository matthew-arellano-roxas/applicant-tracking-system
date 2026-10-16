import { createEmailWorker } from './email.worker';

const workers = [createEmailWorker()];

const shutdown = async (): Promise<void> => {
  await Promise.all(workers.map((worker) => worker.close()));
  process.exit(0);
};

process.once('SIGINT', () => void shutdown());
process.once('SIGTERM', () => void shutdown());

console.log('Workers started');
