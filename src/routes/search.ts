import { Router, Request, Response } from 'express';
import { z } from 'zod';
import config from '../config';
import { SearchService } from '../services/SearchService';
import { LLMService } from '../services/LLMService';

const router = Router();

const bm25Schema = z.object({
  query: z.string().min(1),
  topK: z.number().optional(),
  filters: z.any().optional()
});

const svc = new SearchService();
const llmSvc = new LLMService();
router.post('/bm25', async (req: Request, res: Response) => {
  const start = Date.now();
  try {
    const parsed = bm25Schema.parse(req.body);
    const topK = parsed.topK ?? config.searchBm25TopK;
    const results = await svc.bm25Search(parsed.query, parsed.filters, topK);
    const bm25Ms = Date.now() - start;
    (res.locals as any).componentTimings = { ...(res.locals as any).componentTimings, bm25Ms };
    res.json({ results });
  } catch (err: any) {
    if (err && err.errors) {
      res.status(400).json({ error: 'Invalid request', details: err.errors });
      return;
    }
    console.error('/v1/search/bm25 error:', err);
    const body: any = { error: err?.message || 'Internal Server Error' };
    if (config.nodeEnv !== 'production') body.stack = err?.stack;
    res.status(500).json(body);
  }
});

const vectorSchema = z.object({
  query: z.string().min(1),
  topK: z.number().optional(),
  filters: z.any().optional()
});

router.post('/vector', async (req: Request, res: Response) => {
  const start = Date.now();
  try {
    const parsed = vectorSchema.parse(req.body);
    const topK = parsed.topK ?? config.searchVectorTopK;
    const results = await svc.vectorSearch(parsed.query, parsed.filters, topK);
    const vectorMs = Date.now() - start;
    (res.locals as any).componentTimings = { ...(res.locals as any).componentTimings, vectorMs };
    res.json({ results });
  } catch (err: any) {
    if (err && err.errors) {
      res.status(400).json({ error: 'Invalid request', details: err.errors });
      return;
    }
    console.error('/v1/search/vector error:', err);
    const body: any = { error: err?.message || 'Internal Server Error' };
    if (config.nodeEnv !== 'production') body.stack = err?.stack;
    res.status(500).json(body);
  }
});
 
const hybridSchema = z.object({
  query: z.string().min(1),
  topK: z.number().optional(),
  filters: z.any().optional()
});

router.post('/hybrid', async (req: Request, res: Response) => {
  const start = Date.now();
  try {
    const parsed = hybridSchema.parse(req.body);
    const topK = parsed.topK ?? Math.max(config.searchBm25TopK, config.searchVectorTopK);
    const results = await svc.hybridSearch(parsed.query, parsed.filters, topK);
    const hybridMs = Date.now() - start;
    (res.locals as any).componentTimings = { ...(res.locals as any).componentTimings, hybridMs };
    res.json(results);
  } catch (err: any) {
    if (err && err.errors) {
      res.status(400).json({ error: 'Invalid request', details: err.errors });
      return;
    }
    console.error('/v1/search/hybrid error:', err);
    const body: any = { error: err?.message || 'Internal Server Error' };
    if (config.nodeEnv !== 'production') body.stack = err?.stack;
    res.status(500).json(body);
  }
});
const rerankSchema = z.object({
  query: z.string().min(1),
  candidates: z
    .array(
      z.object({
        resumeId: z.string(),
        snippet: z.string().optional(),
        metadata: z.any().optional()
      })
    )
    .min(1),
  topK: z.number().optional()
});

router.post('/rerank', async (req: Request, res: Response) => {
  const start = Date.now();
  try {
    const parsed = rerankSchema.parse(req.body);
    const topK = parsed.topK ?? config.searchRerankTopK;
    const results = await llmSvc.rerankCandidates(parsed.query, parsed.candidates as any, topK);
    const rerankMs = Date.now() - start;
    (res.locals as any).componentTimings = { ...(res.locals as any).componentTimings, rerankMs };
    res.json({ results });
  } catch (err: any) {
    if (err && err.errors) {
      res.status(400).json({ error: 'Invalid request', details: err.errors });
      return;
    }
    console.error('/v1/search/rerank error:', err);
    const body: any = { error: err?.message || 'Internal Server Error' };
    if (config.nodeEnv !== 'production') body.stack = err?.stack;
    res.status(500).json(body);
  }
});

const summarizeSchema = z.object({
  query: z.string().min(1),
  candidate: z.object({
    resumeId: z.string(),
    snippet: z.string().optional(),
    metadata: z.any().optional()
  }),
  style: z.enum(['short', 'detailed']).optional(),
  maxTokens: z.number().optional()
});

router.post('/summarize', async (req: Request, res: Response) => {
  const start = Date.now();
  try {
    const parsed = summarizeSchema.parse(req.body);
    const options = { style: parsed.style as any, maxTokens: parsed.maxTokens };
    const result = await llmSvc.summarizeCandidateFit(parsed.query, parsed.candidate as any, options);
    const summarizeMs = Date.now() - start;
    (res.locals as any).componentTimings = { ...(res.locals as any).componentTimings, summarizeMs };
    res.json({ result });
  } catch (err: any) {
    if (err && err.errors) {
      res.status(400).json({ error: 'Invalid request', details: err.errors });
      return;
    }
    console.error('/v1/search/summarize error:', err);
    const body: any = { error: err?.message || 'Internal Server Error' };
    if (config.nodeEnv !== 'production') body.stack = err?.stack;
    res.status(500).json(body);
  }
});

const searchSchema = z.object({
  query: z.string().min(1),
  topK: z.number().optional(),
  filters: z.any().optional(),
  summarize: z.boolean().optional(),
  summarizeTopK: z.number().optional(),
  summarizeStyle: z.enum(['short', 'detailed']).optional(),
  summarizeMaxTokens: z.number().optional()
});

router.post('/', async (req: Request, res: Response) => {
  const start = Date.now();
  try {
    const parsed = searchSchema.parse(req.body);
    const topK = parsed.topK ?? Math.max(config.searchBm25TopK, config.searchVectorTopK);
    const resultObj = await svc.endToEndSearch(parsed.query, parsed.filters, { topK });
    let results = Array.isArray(resultObj.results) ? resultObj.results : [];

    if (parsed.summarize && results.length > 0) {
      const summarizeTopK = parsed.summarizeTopK ?? Math.min(results.length, config.topKRerank);
      for (let i = 0; i < summarizeTopK; i++) {
        try {
          const r = results[i];
          const candidate = (resultObj.candidates || []).find((c: any) => c.resumeId === r.resumeId) || { resumeId: r.resumeId, snippet: r.snippet || '', metadata: r.metadata || {} };
          const summary = await llmSvc.summarizeCandidateFit(parsed.query, candidate, { style: parsed.summarizeStyle as any, maxTokens: parsed.summarizeMaxTokens });
          (results[i] as any).summary = summary;
        } catch (e) {
          console.error('summarizeCandidateFit failed for candidate:', e);
        }
      }
    }

    const totalMs = Date.now() - start;
    (res.locals as any).componentTimings = { ...(res.locals as any).componentTimings, totalMs };
    res.json({ results });
  } catch (err: any) {
    if (err && err.errors) {
      res.status(400).json({ error: 'Invalid request', details: err.errors });
      return;
    }
    console.error('/v1/search error:', err);
    const body: any = { error: err?.message || 'Internal Server Error' };
    if (config.nodeEnv !== 'production') body.stack = err?.stack;
    res.status(500).json(body);
  }
});
export default router;
