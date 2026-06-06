import config from '../config';

export class ChatService {
  private baseUrl = 'https://api.groq.com/openai/v1';

  constructor(private apiKey?: string, private model?: string) {
    this.apiKey = apiKey || config.groqApiKey;
    this.model = model || config.groqLlmModel;
  }

  async generateReply(messages: { role: 'user' | 'system'; content: string }[], maxTokens = 512) {
    if (!this.apiKey) throw new Error('No GROQ API key configured');
    try {
      const { fetch: nodeFetch } = await import('undici');
      const response = await nodeFetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({ model: this.model, messages, max_tokens: maxTokens, temperature: 0.2 })
      });
      if (!response.ok) throw new Error(`LLM error ${response.status}`);
      const data: any = await response.json();
      const content = data.choices?.[0]?.message?.content;
      return content || '';
    } catch (err: any) {
      throw new Error(`ChatService.generateReply failed: ${err?.message || String(err)}`);
    }
  }
}

export default ChatService;
