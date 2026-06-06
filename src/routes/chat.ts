import { Router, Request, Response } from 'express';
import ChatService from '../services/ChatService';

const router = Router();
const chatSvc = new ChatService();

router.post('/message', async (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    const message = body.message as string;
    if (!message) return res.status(400).json({ error: 'message is required' });

    const system: { role: 'system'; content: string } = { role: 'system', content: 'You are a helpful assistant for resume search and hiring.' };
    const user: { role: 'user'; content: string } = { role: 'user', content: message };
    const reply = await chatSvc.generateReply([system, user]);
    res.json({ ok: true, reply });
  } catch (err: any) {
    console.error('/v1/chat/message error:', err);
    res.status(500).json({ error: 'Chat generation failed' });
  }
});

// Simple SSE stream endpoint that returns a single final message as an event
router.get('/stream', async (req: Request, res: Response) => {
  try {
    const message = String(req.query.message || '');
    if (!message) return res.status(400).json({ error: 'message is required' });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    // notify started
    res.write(`event: started\ndata: ${JSON.stringify({ status: 'started' })}\n\n`);

    const system: { role: 'system'; content: string } = { role: 'system', content: 'You are a helpful assistant for resume search and hiring.' };
    const user: { role: 'user'; content: string } = { role: 'user', content: message };
    const reply = await chatSvc.generateReply([system, user]);

    // send final message
    res.write(`event: message\ndata: ${JSON.stringify({ reply })}\n\n`);
    res.write('event: done\ndata: {}\n\n');
    res.end();
  } catch (err: any) {
    console.error('/v1/chat/stream error:', err);
    try {
      res.write(`event: error\ndata: ${JSON.stringify({ error: 'Chat failed' })}\n\n`);
      res.end();
    } catch (e) {
      // ignore
    }
  }
});

export default router;
