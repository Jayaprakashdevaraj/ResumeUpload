import fs from 'fs/promises';
import path from 'path';
import config from '../src/config';
import { ResumeParserService } from '../src/services/ResumeParserService';

const RESUMES_DIR = path.resolve(process.cwd(), 'Resumes');
const STAGING_PATH = path.resolve(process.cwd(), 'tmp', 'resume_staging.json');

async function prepare() {
  const parser = new ResumeParserService();
  try {
    await fs.mkdir(path.dirname(STAGING_PATH), { recursive: true });
    const files = await fs.readdir(RESUMES_DIR);
    const docs: any[] = [];

    for (const f of files) {
      const full = path.join(RESUMES_DIR, f);
      const stat = await fs.stat(full);
      if (!stat.isFile()) continue;

      const ext = path.extname(f).toLowerCase();
      const item: any = {
        filename: f,
        path: full,
        ext,
        processedAt: new Date().toISOString(),
        status: 'skipped',
        text: '',
        note: ''
      };

      try {
        if (ext === '.pdf') {
          const txt = await parser.extractTextFromPdf(full);
          item.text = txt;
          item.status = 'ready';
        } else {
          item.note = 'unsupported extension - not parsed (only .pdf parsed).';
        }
      } catch (err: any) {
        item.note = `parse error: ${err?.message || String(err)}`;
        item.status = 'skipped';
      }

      docs.push(item);
    }

    await fs.writeFile(STAGING_PATH, JSON.stringify(docs, null, 2), 'utf8');
    console.log(`Prepared ${docs.length} resume entries to ${STAGING_PATH}`);
    console.log('Entries with `status: "ready"` are ready for pushing to MongoDB.');
    console.log('Run `npm run push:resumes` to push them in batches of 10 once you approve.');
  } catch (err) {
    console.error('Failed to prepare resumes:', err);
    process.exit(1);
  }
}

prepare();
