import config from '../config';

export interface Candidate {
  resumeId: string;
  snippet: string;
  metadata?: Record<string, any>;
}

export interface RerankResult {
  resumeId: string;
  score: number; // 0..1
  rationale: string;
}

export interface SummarizeResult {
  summary: string;
  fitScore: number; // 0..1
  highlights: string[];
}

interface GroqMessage {
  role: 'system' | 'user';
  content: string;
}

interface GroqResponse {
  id: string;
  choices: Array<{ message: { content: string } }>;
  usage: { prompt_tokens: number; completion_tokens: number };
}

export class LLMService {
  private apiKey: string;
  private model: string;
  private readonly baseUrl = 'https://api.groq.com/openai/v1';

  constructor(opts?: { apiKey?: string; model?: string }) {
    this.apiKey = opts?.apiKey || config.groqApiKey;
    this.model = opts?.model || config.groqLlmModel;
  }

  private async callGroq(messages: GroqMessage[]): Promise<string> {
    if (!this.apiKey) {
      // Throw error instead of returning fallback, so caller can handle it
      throw new Error('No GROQ API key configured');
    }

    try {
      const { fetch: nodeFetch } = await import('undici');
      const response = await nodeFetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0,
          max_tokens: 2048
        })
      });

      if (!response.ok) {
        throw new Error(`GROQ API error: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as GroqResponse;
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error('Invalid GROQ response: no content');
      return content;
    } catch (err: any) {
      throw new Error(`LLMService.callGroq failed: ${err?.message || String(err)}`);
    }
  }

  async rerankCandidates(query: string, candidates: Candidate[], topK = 10): Promise<RerankResult[]> {
    const systemPrompt = `You are a deterministic JSON-only assistant. 
Given a job search query and candidate resume snippets, rank the candidates by relevance.
Output ONLY valid JSON matching this schema (no markdown, no extra text):
{
  "ranked": [{"resumeId": "string", "score": number (0..1), "rationale": "string"}],
  "warnings": ["string"]
}`;

    const candidateText = candidates
      .map(
        (c) =>
          `ID: ${c.resumeId}\nSnippet: ${(c.snippet || '').slice(0, 500)}\nMetadata: ${JSON.stringify(c.metadata || {})}`
      )
      .join('\n\n');

    const userPrompt = `Query: "${query}"

Candidates:
${candidateText}

Rank them by relevance to the query. Return top ${topK} as JSON only.`;

    try {
      const content = await this.callGroq([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]);

      // Extract JSON from response (handle markdown code blocks)
      let jsonStr = content;
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      } else {
        jsonStr = content.match(/\{[\s\S]*\}/)?.at(0) || content;
      }

      const parsed = JSON.parse(jsonStr);
      if (!Array.isArray(parsed.ranked)) throw new Error('Missing ranked array');

      return parsed.ranked.slice(0, topK).map((r: any) => ({
        resumeId: String(r.resumeId),
        score: Math.min(1, Math.max(0, Number(r.score))),
        rationale: String(r.rationale)
      }));
    } catch (err: any) {
      console.error('LLMService.rerankCandidates failed, falling back to heuristic:', err?.message);
      // Heuristic fallback: ensure we return at least topK candidates or all if fewer available
      const scored = candidates.map((c) => {
        const matchCount = (query || '')
          .toLowerCase()
          .split(/\s+/)
          .filter((w) => w && (c.snippet || '').toLowerCase().includes(w)).length;
        const queryLen = query.split(/\s+/).length || 1;
        const score = matchCount > 0 ? Math.min(1, matchCount / queryLen) : 0.3;
        return { resumeId: c.resumeId, score, rationale: 'heuristic fallback' };
      });
      scored.sort((a, b) => b.score - a.score);
      return scored; // Return all scored candidates (caller will slice if needed)
    }
  }

  async summarizeCandidateFit(
    query: string,
    candidate: Candidate,
    options?: { style?: 'short' | 'detailed'; maxTokens?: number }
  ): Promise<SummarizeResult> {
    const style = options?.style || 'short';
    const maxTokens = options?.maxTokens || 300;

    const systemPrompt = `You are a concise summarizer. 
Given a job query and candidate resume snippet, generate a fit summary.
Output ONLY valid JSON (no markdown):
{"summary": "string", "fitScore": number (0..1), "highlights": ["string"]}`;

    const userPrompt = `Job query: "${query}"

Candidate snippet:
${(candidate.snippet || '').slice(0, 1000)}

Generate a ${style} summary of how well this candidate fits (max ${maxTokens} tokens). Return JSON only.`;

    try {
      const content = await this.callGroq([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]);

      let jsonStr = content;
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      } else {
        jsonStr = content.match(/\{[\s\S]*\}/)?.at(0) || content;
      }

      const parsed = JSON.parse(jsonStr);
      return {
        summary: String(parsed.summary),
        fitScore: Math.min(1, Math.max(0, Number(parsed.fitScore))),
        highlights: Array.isArray(parsed.highlights) ? parsed.highlights.map(String) : []
      };
    } catch (err: any) {
      console.error('LLMService.summarizeCandidateFit failed:', err?.message);
      return { summary: 'Summary unavailable', fitScore: 0, highlights: [] };
    }
  }

  async extractMetadata(rawText: string) {
    if (!rawText) return { skills: [], jobTitles: [], experienceYears: 0, education: [] };

    if (!this.apiKey) {
      // No API key: indicate inability to call LLM
      throw new Error('No GROQ API key configured for metadata extraction');
    }

    const systemPrompt = `You are a JSON-only assistant. Given a resume text, extract the following fields as JSON: { name, email, phone, location, skills (array of strings), company, role, education, totalExperience }. Output ONLY valid JSON.`;

    const userPrompt = `Resume text:\n\n${rawText}\n\nReturn the JSON object.`;

    try {
      const content = await this.callGroq([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]);

      // Extract JSON
      let jsonStr = content;
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/);
      if (jsonMatch) jsonStr = jsonMatch[1];
      else jsonStr = content.match(/\{[\s\S]*\}/)?.at(0) || content;

      const parsed = JSON.parse(jsonStr);
      return parsed;
    } catch (err: any) {
      throw new Error(`LLMService.extractMetadata failed: ${err?.message || String(err)}`);
    }
  }
}
