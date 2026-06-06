import { connectToMongo } from '../lib/mongo';
import config from '../config';
import { ObjectId } from 'mongodb';

export class IngestionJobRepository {
  private collectionName = 'ingestion_jobs';

  async create(job: any) {
    const client = await connectToMongo();
    const col = client.db(config.mongodbDbName).collection(this.collectionName);
    const doc = {
      jobType: job.jobType || 'ingest',
      payload: job.payload || {},
      status: 'queued',
      attempts: 0,
      result: null,
      error: null,
      createdAt: new Date(),
      updatedAt: new Date()
    } as any;
    const res = await col.insertOne(doc);
    return res.insertedId.toString();
  }

  async update(id: string, updates: any) {
    const client = await connectToMongo();
    const col = client.db(config.mongodbDbName).collection(this.collectionName);
    const { value } = await col.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    return value;
  }

  async get(id: string) {
    const client = await connectToMongo();
    const col = client.db(config.mongodbDbName).collection(this.collectionName);
    const doc = await col.findOne({ _id: new ObjectId(id) });
    return doc;
  }
}

export default IngestionJobRepository;
