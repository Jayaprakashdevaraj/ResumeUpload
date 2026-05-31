import { Request, Response, NextFunction } from 'express';

export function loggerMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const requestId = String(res.getHeader('X-Request-Id') || '');

  res.on('finish', () => {
    const durationMs = Date.now() - start;
    const log = {
      requestId: (res.locals as any).requestId || requestId,
      method: req.method,
      endpoint: req.originalUrl,
      statusCode: res.statusCode,
      durationMs,
      fileName: (res.locals as any).fileName || null,
      componentTimings: (res.locals as any).componentTimings || {}
    };
    console.log(JSON.stringify(log));
  });

  next();
}
