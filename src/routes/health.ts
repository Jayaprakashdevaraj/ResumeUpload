import { Router } from 'express';
import config from '../config';
import { connectToMongo } from '../lib/mongo';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    name: config.appName,
    version: config.appVersion,
    uptimeSec: Math.floor(process.uptime()),
    env: config.nodeEnv
  });
});

router.get('/db', async (req, res) => {
  const start = Date.now();
  try {
    const client = await connectToMongo();
    await client.db().command({ ping: 1 });
    const latencyMs = Date.now() - start;
    res.json({ ok: true, latencyMs });
  } catch (err: any) {
    console.error('/v1/health/db error:', err);
    const body: any = { ok: false, error: err?.message || String(err) };
    if (config.nodeEnv !== 'production') body.stack = err?.stack;
    res.status(500).json(body);
  }
});

export default router;
