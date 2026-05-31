import { MongoClient, ServerApiVersion } from 'mongodb';
import { Resolver } from 'dns/promises';
import config from '../config';

let client: MongoClient | null = null;

export async function connectToMongo(): Promise<MongoClient> {
  if (client) return client;
  if (!config.mongodbUri) {
    throw new Error('MONGODB_URI is not configured');
  }

  const createClient = (uri: string) =>
    new MongoClient(uri, {
      serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
    });

  try {
    client = createClient(config.mongodbUri);
    await client.connect();
    return client;
  } catch (err: any) {
    console.error('MongoDB connect failed using configured URI:', err);
    try {
      if (client) await client.close();
    } catch (closeErr) {
      console.error('Error closing MongoClient after failed connect:', closeErr);
    }
    client = null;

    const msg = err?.message || String(err);
    let hint = '';
    if (msg.includes('querySrv') || msg.includes('ENOTFOUND')) {
      hint = ' DNS SRV lookup failed — will attempt SRV resolve via public DNS servers as a fallback.';
    } else if (msg.includes('ECONNREFUSED')) {
      hint = ' Connection refused — check firewall, outbound network access, and Atlas Network Access IP whitelist (or allow 0.0.0.0/0 for testing).';
    }

    // Attempt SRV manual resolution fallback if original URI used mongodb+srv://
    if (config.mongodbUri.startsWith('mongodb+srv://') && (msg.includes('querySrv') || msg.includes('ENOTFOUND') || msg.includes('ECONNREFUSED'))) {
      try {
        const parsed = new URL(config.mongodbUri);
        const hostname = parsed.hostname;
        const username = parsed.username;
        const password = parsed.password;
        const pathname = parsed.pathname || '/';
        const originalParams = new URLSearchParams(parsed.search);
        if (!originalParams.has('tls') && !originalParams.has('ssl')) originalParams.set('tls', 'true');
        // try multiple public DNS resolvers
        const dnsServers = ['8.8.8.8', '1.1.1.1'];
        for (const server of dnsServers) {
          try {
            const resolver = new Resolver();
            resolver.setServers([server]);
            const srvName = `_mongodb._tcp.${hostname}`;
            const records = await resolver.resolveSrv(srvName);
            if (!records || records.length === 0) continue;
            const hosts = records.map((r) => `${r.name}:${r.port}`).join(',');
            const auth = username ? `${encodeURIComponent(username)}:${encodeURIComponent(password)}@` : '';
            const paramsStr = originalParams.toString();
            const fallbackUri = `mongodb://${auth}${hosts}${pathname}${paramsStr ? '?' + paramsStr : ''}`;
            console.log(`Attempting MongoDB connect using fallback URI (via ${server}): ${fallbackUri}`);
            const altClient = createClient(fallbackUri);
            await altClient.connect();
            client = altClient;
            console.log('MongoDB connected using fallback non-SRV URI.');
            return client;
          } catch (resolveErr) {
            console.error(`SRV resolve/connect attempt via ${server} failed:`, resolveErr);
            // continue to next DNS server
          }
        }
      } catch (fallbackErr) {
        console.error('SRV fallback attempt failed:', fallbackErr);
      }
    }

    // Final diagnostic hint
    if (msg.includes('querySrv') || msg.includes('ENOTFOUND')) {
      hint = hint + ' If you have the Atlas standard (non-SRV) `mongodb://` connection string, set it as `MONGODB_URI` in your .env to avoid SRV lookups.';
    }

    throw new Error(`Failed to connect to MongoDB: ${msg}.${hint}`);
  }
}

export function getMongoClient(): MongoClient {
  if (!client) throw new Error('MongoClient not connected. Call connectToMongo first.');
  return client;
}

export async function closeMongo(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
  }
}
