import config from '../config';
import IngestionJobRepository from '../repositories/IngestionJobRepository';
import ResumeingestionService from '../services/ResumeingestionService';

const jobRepo = new IngestionJobRepository();

// in-memory FIFO queue for local/dev use
const inMemoryQueue: string[] = [];
let processing = false;

async function processNext() {
  if (processing) return;
  processing = true;
  try {
    while (inMemoryQueue.length > 0) {
      const jobId = inMemoryQueue.shift() as string;
      const job = await jobRepo.get(jobId);
      if (!job) continue;
      try {
        await jobRepo.update(jobId, { status: 'processing', attempts: (job.attempts || 0) + 1 });
        const svc = new ResumeingestionService();
        const payload = job.payload || {};
        const result = await svc.injectResume(payload);
        await jobRepo.update(jobId, { status: 'succeeded', result, error: null });
      } catch (err: any) {
        await jobRepo.update(jobId, { status: 'failed', error: err?.message || String(err) });
      }
    }
  } finally {
    processing = false;
  }
}

export async function enqueueIngestionJob(payload: any) {
  // create a job record
  const jobId = await jobRepo.create({ jobType: 'ingest', payload });

  // If configured to run in-process (development) then push to in-memory queue and process
  const runInProcess = process.env.USE_IN_PROCESS_QUEUE !== 'false' && config.nodeEnv !== 'production';
  if (runInProcess) {
    inMemoryQueue.push(jobId);
    // kick the processor
    setImmediate(() => processNext());
    // wait for work to finish for a short time and return result if it finishes quickly
    // NOTE: this is best-effort; for long-running jobs the client should poll the job endpoint
    try {
      const start = Date.now();
      // poll job status for up to 5 seconds for quick synchronous behavior
      while (Date.now() - start < 5000) {
        const job = await jobRepo.get(jobId);
        if (job && job.status === 'succeeded') return { jobId, processed: true, result: job.result };
        if (job && job.status === 'failed') return { jobId, processed: true, error: job.error };
        await new Promise((r) => setTimeout(r, 200));
      }
    } catch (err) {
      /* continue to return queued job id */
    }
    return { jobId, processed: false };
  }

  // otherwise, just return the job id and leave it queued for external workers
  return { jobId, processed: false };
}

export async function getJobStatus(jobId: string) {
  const job = await jobRepo.get(jobId);
  return job;
}

export default {
  enqueueIngestionJob,
  getJobStatus
};
