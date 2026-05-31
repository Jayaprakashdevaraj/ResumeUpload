import { Router, Request, Response } from 'express';
import { z } from 'zod';
import config from '../config';
import { EmbeddingService } from '../services/EmbeddingService';

const router = Router();

const bodySchema = z.object({
  model: z.string().optional(),
  input: z.string().min(1)
});

const embeddingService = new EmbeddingService();

router.post('/', async (req: Request, res: Response) => {
  const start = Date.now();
  try {
    const parsed = bodySchema.parse(req.body);
    const usedModel = parsed.model || config.mistralEmbedModel;
    const embedding = await embeddingService.embed(parsed.input, parsed.model);
    const embeddingMs = Date.now() - start;

    // expose component timing for global logger middleware
    (res.locals as any).componentTimings = {
      ...(res.locals as any).componentTimings,
      embeddingMs
    };

    res.json({ embedding, model: usedModel });
  } catch (err: any) {
    if (err && err.errors) {
      res.status(400).json({ error: 'Invalid request', details: err.errors });
      return;
    }

    console.error('/v1/embeddings error:', err);
    const body: any = { error: err?.message || 'Internal Server Error' };
    if (config.nodeEnv !== 'production') body.stack = err?.stack;
    res.status(500).json(body);
  }
});

export default router;
