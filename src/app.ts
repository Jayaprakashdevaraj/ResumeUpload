import express from 'express';
import config from './config';
import { requestIdMiddleware } from './middleware/requestId';
import { loggerMiddleware } from './middleware/logger';
import healthRouter from './routes/health';
import embeddingsRouter from './routes/embeddings';
import searchRouter from './routes/search';
import ingestionRouter from './routes/ingestionRoutes';

const app = express();

app.use(express.json({ limit: config.requestSizeLimit }));
app.use(requestIdMiddleware);
app.use(loggerMiddleware);

// Simple CORS middleware for development: allow all origins and preflight
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use('/v1/health', healthRouter);
app.use('/v1/embeddings', embeddingsRouter);
app.use('/v1/search', searchRouter);
app.use('/v1/resume', ingestionRouter);

// generic error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err);
  res.status(err?.status || 500).json({ error: err?.message || 'Internal Server Error' });
});

export default app;
