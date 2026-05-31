import fs from 'fs/promises';
import path from 'path';
import { connectToMongo } from '../src/lib/mongo';
import config from '../src/config';

const STAGING_PATH = path.resolve(process.cwd(), 'tmp', 'resume_staging.json');

function chunk<T>(arr: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function push() {
  try {
    const raw = await fs.readFile(STAGING_PATH, 'utf8');
    const docs = JSON.parse(raw) as any[];
    const ready = docs.filter((d) => d.status === 'ready' && !d.pushedAt);
    if (!ready.length) {
      console.log('No ready resumes to push.');
      return;
    }

    const client = await connectToMongo();
    const col = client.db(config.mongodbDbName).collection(config.mongodbCollectionName);

    const batches = chunk(ready, 10);
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const toInsert = batch.map((b) => ({ filename: b.filename, text: b.text, metadata: { sourcePath: b.path, ext: b.ext, processedAt: b.processedAt } }));
      const res = await col.insertMany(toInsert);
      const ids = Object.values(res.insertedIds).map(String);
      // mark pushed
      for (let j = 0; j < batch.length; j++) {
        batch[j].pushedAt = new Date().toISOString();
        batch[j].insertedId = ids[j];
      }
      console.log(`Pushed batch ${i + 1}/${batches.length} (${batch.length} resumes)`);
    }

    // merge back statuses into original docs array and write staging
    const updated = docs.map((d) => {
      const match = ready.find((r) => r.filename === d.filename);
      return match ? { ...d, ...match } : d;
    });
    await fs.writeFile(STAGING_PATH, JSON.stringify(updated, null, 2), 'utf8');
    console.log('All ready resumes pushed and staging file updated with inserted IDs.');
  } catch (err: any) {
    console.error('Failed to push resumes:', err?.message || err);
    process.exit(1);
  }
}

push();
