import path from 'path';
import { ResumeParserService } from './ResumeParserService';
import cleanTextUtil from '../utils/textCleaner';
import { LLMResumeParser } from './LLMResumeParser';
import AlgorithmResumeParser from './AlgorithmResumeParser';
import EmbeddingService from './EmbeddingService';
import { ResumeingestionRepository } from '../repositories/ResumeingestionRepository';
import config from '../config';
import { IngestionError } from '../errors/ingestionErrors';

export class ResumeingestionService {
  async injectResume(fileLike: { path?: string; fileName?: string; file?: any } | any): Promise<any> {
    const start = Date.now();
    const parserSvc = new ResumeParserService();
    const useLLM = process.env.USE_LLM_PARSER === 'true';
    const llmParser = new LLMResumeParser();
    const algoParser = new AlgorithmResumeParser();
    const embedSvc = new EmbeddingService();
    const repo = new ResumeingestionRepository();

    try {
      const filePath = fileLike.path || (fileLike.file && fileLike.file.path) || fileLike.fileName || undefined;
      if (!filePath) throw new Error('file path is required for inject');

      const extractStart = Date.now();
      const rawText = await parserSvc.extractTextFromPdf(filePath);
      const extractMs = Date.now() - extractStart;

      const cleanStart = Date.now();
      const cleaned = cleanTextUtil(rawText);
      const cleanMs = Date.now() - cleanStart;

      const parseStart = Date.now();
      const parsed = useLLM ? await llmParser.parseResume(cleaned) : algoParser.parseResume(cleaned);
      const parseMs = Date.now() - parseStart;

      const embedStart = Date.now();
      const embeddingText = `${parsed.name || ''}\n${parsed.role || ''}\n${(parsed.skills || []).join(',')}\n${parsed.company || ''}\n${cleaned}`;
      const embedding = await embedSvc.generateEmbedding(embeddingText);
      const embeddingMs = Date.now() - embedStart;

      const doc: any = {
        fileName: fileLike.fileName || (fileLike.file && fileLike.file.originalname) || null,
        rawText: cleaned,
        ...parsed,
        embedding,
        embeddingModel: process.env.MISTRAL_EMBED_MODEL || config.mistralEmbedModel,
        embeddingDimension: Array.isArray(embedding) ? embedding.length : 0,
        createdAt: new Date()
      };

      const mongoStart = Date.now();
      const id = await repo.save(doc);
      const mongoInsertMs = Date.now() - mongoStart;

      const totalMs = Date.now() - start;
      return {
        id,
        timings: { extractMs, cleanMs, parseMs, embeddingMs, mongoInsertMs, totalMs },
        doc
      };
    } catch (err: any) {
      if (err instanceof IngestionError) throw err;
      throw new IngestionError(`injectResume failed: ${err?.message || String(err)}`);
    }
  }
}

export default ResumeingestionService;
