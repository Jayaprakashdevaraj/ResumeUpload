import { LLMService } from './LLMService';
import AlgorithmResumeParser from './AlgorithmResumeParser';

export class LLMResumeParser {
  private llm: LLMService;
  private fallback: AlgorithmResumeParser;

  constructor() {
    this.llm = new LLMService();
    this.fallback = new AlgorithmResumeParser();
  }

  async parseResume(rawText: string): Promise<Record<string, any>> {
    try {
      const meta = await this.llm.extractMetadata(rawText);
      return meta;
    } catch (err: any) {
      // If LLM unavailable or failed, fallback to algorithmic parser
      return this.fallback.parseResume(rawText) as any;
    }
  }
}

export default LLMResumeParser;
