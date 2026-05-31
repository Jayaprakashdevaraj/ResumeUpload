import { connectToMongo } from '../lib/mongo';
import config from '../config';
import { MongoIngestError } from '../errors/ingestionErrors';

export class ResumeingestionRepository {
  async save(doc: any) {
    try {
      const client = await connectToMongo();
      const col = client.db(config.mongodbDbName).collection(config.mongodbCollectionName);
      const res = await col.insertOne(doc);
      return res.insertedId;
    } catch (err: any) {
      throw new MongoIngestError(err?.message || 'Failed to save document');
    }
  }
}
