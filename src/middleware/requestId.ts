import { Request, Response, NextFunction } from 'express';

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers['x-request-id'];
  const rid = header || (typeof (globalThis as any).crypto?.randomUUID === 'function' ? (globalThis as any).crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2,8)}`);
  res.setHeader('X-Request-Id', String(rid));
  // attach to locals for later use
  (res.locals as any).requestId = String(rid);
  next();
}
