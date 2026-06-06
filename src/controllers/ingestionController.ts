import { Request, Response } from 'express';
import path from 'path';
import { ResumeParserService } from '../services/ResumeParserService';
import { ResumeingestionService } from '../services/ResumeingestionService';
import { enqueueIngestionJob } from '../lib/queue';
import cleanTextUtil from '../utils/textCleaner';
import AlgorithmResumeParser from '../services/AlgorithmResumeParser';
import { LLMResumeParser } from '../services/LLMResumeParser';
import { IngestionError } from '../errors/ingestionErrors';

const parser = new ResumeParserService();

const algoParser = new AlgorithmResumeParser();
const llmParser = new LLMResumeParser();

const notImplemented = (res: Response) => res.status(501).json({ error: 'Not implemented' });

export default {
  async uploadResume(req: Request, res: Response) {
    try {
      const file = (req as any).file;
      if (!file) return res.status(400).json({ error: 'No file uploaded' });

      const info = {
        fileName: file.originalname,
        path: file.path,
        size: file.size,
        mimeType: file.mimetype
      };

      // respond with basic metadata; later phases will process the file
      res.json({ ok: true, file: info });
    } catch (err: any) {
      console.error('/v1/resume/upload error:', err);
      if (err instanceof IngestionError) return res.status(err.status).json({ error: err.message, code: err.code });
      if (err && typeof err.status === 'number' && err.code) return res.status(err.status).json({ error: err?.message || 'Error', code: err.code });
      const body: any = { error: err?.message || 'Upload failed' };
      res.status(500).json(body);
    }
  },
  async extractText(req: Request, res: Response) {
    try {
      const body = req.body || {};
      const providedPath = body.path as string | undefined;
      const fileName = body.fileName as string | undefined;

      const filePath = providedPath || (fileName ? path.resolve(process.cwd(), 'uploads', fileName) : undefined);
      if (!filePath) return res.status(400).json({ error: 'fileName or path is required' });

      const start = Date.now();
      const text = await parser.extractTextFromPdf(filePath);
      const extractMs = Date.now() - start;
      (res.locals as any).componentTimings = { ...(res.locals as any).componentTimings, extractMs };

      res.json({ text });
    } catch (err: any) {
        console.error('/v1/resume/extract error:', err);
        if (err instanceof IngestionError) return res.status(err.status).json({ error: err.message, code: err.code });
        if (err && typeof err.status === 'number' && err.code) return res.status(err.status).json({ error: err?.message || 'Error', code: err.code });
        const body: any = { error: err?.message || 'Extract failed' };
        res.status(500).json(body);
    }
  },
  async cleanText(_req: Request, res: Response) {
    try {
      const body = _req.body || {};
      const text = body.text as string | undefined;
      const options = body.options as any | undefined;
      if (!text) return res.status(400).json({ error: 'text is required in request body' });

      const cleaned = cleanTextUtil(text, options);
      res.json({ cleanText: cleaned });
    } catch (err: any) {
        console.error('/v1/resume/clean error:', err);
        if (err instanceof IngestionError) return res.status(err.status).json({ error: err.message, code: err.code });
        if (err && typeof err.status === 'number' && err.code) return res.status(err.status).json({ error: err?.message || 'Error', code: err.code });
        res.status(500).json({ error: err?.message || 'Clean failed' });
    }
  },
  async parseResume(_req: Request, res: Response) {
    try {
      const body = _req.body || {};
      const text = body.text as string | undefined;
      if (!text) return res.status(400).json({ error: 'text is required in request body' });

      const useLLM = process.env.USE_LLM_PARSER === 'true';
      let parsed: any;
      if (useLLM) {
        parsed = await llmParser.parseResume(text);
      } else {
        parsed = algoParser.parseResume(text);
      }

      res.json({ parsed });
    } catch (err: any) {
        console.error('/v1/resume/parse error:', err);
        if (err instanceof IngestionError) return res.status(err.status).json({ error: err.message, code: err.code });
        if (err && typeof err.status === 'number' && err.code) return res.status(err.status).json({ error: err?.message || 'Error', code: err.code });
        res.status(500).json({ error: err?.message || 'Parse failed' });
    }
  },
  async detectSkills(_req: Request, res: Response) {
    try {
      const body = _req.body || {};
      const text = (body.text as string) || (body.rawText as string) || '';
      if (!text) return res.status(400).json({ error: 'text is required in request body' });

      const { SKILLS } = await import('../config/skills');
      const lowered = text.toLowerCase();
      const matched = SKILLS.filter((s: string) => lowered.includes(s.toLowerCase()));
      res.json({ skills: Array.from(new Set(matched)) });
    } catch (err: any) {
        console.error('/v1/resume/skills error:', err);
        if (err instanceof IngestionError) return res.status(err.status).json({ error: err.message, code: err.code });
        if (err && typeof err.status === 'number' && err.code) return res.status(err.status).json({ error: err?.message || 'Error', code: err.code });
        res.status(500).json({ error: err?.message || 'Skills detection failed' });
    }
  },
  async llmParse(_req: Request, res: Response) {
    try {
      const body = _req.body || {};
      const text = body.text as string | undefined;
      if (!text) return res.status(400).json({ error: 'text is required in request body' });

      const parsed = await llmParser.parseResume(text);
      res.json({ parsed });
    } catch (err: any) {
        console.error('/v1/resume/llm-parse error:', err);
        if (err instanceof IngestionError) return res.status(err.status).json({ error: err.message, code: err.code });
        if (err && typeof err.status === 'number' && err.code) return res.status(err.status).json({ error: err?.message || 'Error', code: err.code });
        res.status(500).json({ error: err?.message || 'LLM parse failed' });
    }
  },
  async embed(_req: Request, res: Response) {
    try {
      const body = _req.body || {};
      const text = body.text as string | undefined;
      if (!text) return res.status(400).json({ error: 'text is required in request body' });

      const { EmbeddingService } = await import('../services/EmbeddingService');
      const svc = new EmbeddingService();
      const embedding = await svc.generateEmbedding(text);
      res.json({ embedding, model: svc['model'], dimension: svc['dimension'] });
    } catch (err: any) {
        console.error('/v1/resume/embed error:', err);
        if (err instanceof IngestionError) return res.status(err.status).json({ error: err.message, code: err.code });
        if (err && typeof err.status === 'number' && err.code) return res.status(err.status).json({ error: err?.message || 'Error', code: err.code });
        res.status(500).json({ error: err?.message || 'Embed failed' });
    }
  },
  async store(_req: Request, res: Response) {
    try {
      const body = _req.body || {};
      const fileName = body.fileName as string | undefined;
      const rawText = body.rawText as string | undefined;
      const parsed = body.parsed as any | undefined;
      const embedding = body.embedding as number[] | undefined;

      if (!rawText || !parsed) return res.status(400).json({ error: 'rawText and parsed fields are required' });

      const { ResumeingestionRepository } = await import('../repositories/ResumeingestionRepository');
      const repo = new ResumeingestionRepository();

      const doc: any = {
        fileName: fileName || parsed.fileName || null,
        rawText,
        ...parsed,
        embedding: embedding || parsed.embedding || [],
        embeddingModel: parsed.embeddingModel || process.env.MISTRAL_EMBED_MODEL || 'mistral-embed',
        embeddingDimension: (embedding || parsed.embedding || []).length || Number(process.env.MISTRAL_EMBED_DIMENSION) || 0,
        createdAt: new Date()
      };

      const id = await repo.save(doc);
      res.json({ ok: true, id });
    } catch (err: any) {
        console.error('/v1/resume/store error:', err);
        if (err instanceof IngestionError) return res.status(err.status).json({ error: err.message, code: err.code });
        if (err && typeof err.status === 'number' && err.code) return res.status(err.status).json({ error: err?.message || 'Error', code: err.code });
        res.status(500).json({ error: err?.message || 'Store failed' });
    }
  },
  async injectResume(_req: Request, res: Response) {
    try {
      const file = (_req as any).file;
      const body = _req.body || {};
      const payload = {} as any;
      if (file) payload.file = file;
      if (body.path) payload.path = body.path;
      if (body.fileName) payload.fileName = body.fileName;
      // Enqueue the ingest job. In development mode this may be processed in-process
      const enq = await enqueueIngestionJob(payload);
      if (enq.processed) {
        const result = enq.result;
        (res.locals as any).componentTimings = result?.timings || {};
        (res.locals as any).fileName = result?.doc?.fileName || payload.file?.originalname || payload.fileName || null;
        res.json({ ok: true, ...result });
        return;
      }

      // job queued for background processing
      res.json({ ok: true, queued: true, jobId: enq.jobId });
    } catch (err: any) {
      console.error('/v1/resume/inject error:', err);
      if (err instanceof IngestionError) return res.status(err.status).json({ error: err.message, code: err.code });
      // fallback for mocked errors that carry status/code but may not be instanceof IngestionError
      if (err && typeof err.status === 'number' && err.code) return res.status(err.status).json({ error: err?.message || 'Error', code: err.code });
      res.status(500).json({ error: err?.message || 'Inject failed' });
    }
  }
};
