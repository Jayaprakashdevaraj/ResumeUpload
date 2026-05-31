import app from './app';
import config from './config';
import { connectToMongo } from './lib/mongo';

async function start() {
  try {
    await connectToMongo();
    console.log('MongoDB connected');
  } catch (err: any) {
    console.warn('MongoDB connection failed at startup:', err?.message || err);
  }

  const port = config.port;
  const server = app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });

  server.on('error', (err: any) => {
    if (err && err.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use.`);
      const fallbackPort = process.env.PORT_FALLBACK ? Number(process.env.PORT_FALLBACK) : port + 1;
      console.log(`Attempting to listen on fallback port ${fallbackPort}`);
      const fallbackServer = app.listen(fallbackPort, () => {
        console.log(`Server listening on fallback port ${fallbackPort}`);
      });
      fallbackServer.on('error', (err2: any) => {
        console.error('Failed to listen on fallback port:', err2);
        process.exit(1);
      });
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
