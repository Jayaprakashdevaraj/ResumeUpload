import dotenv from 'dotenv';
dotenv.config();

const config = {
  // Application
  nodeEnv: process.env.NODE_ENV || 'development',
  appName: process.env.APP_NAME || 'resume-ai-rag',
  appVersion: process.env.APP_VERSION || '0.1.0',
  // Port configuration
  // Previous default: 3000 (kept as a comment for historical reference)
  port: process.env.PORT ? Number(process.env.PORT) : 3001,
  logLevel: process.env.LOG_LEVEL || 'info',

  // Request/Response
  requestSizeLimit: process.env.REQUEST_SIZE_LIMIT || '100kb',
  topKRerank: process.env.TOPK_RERANK ? Number(process.env.TOPK_RERANK) : 10,

  // MongoDB
  mongodbUri: process.env.MONGODB_URI || '',
  mongodbDbName: process.env.MONGODB_DB_NAME || 'resume_ai_rag',
  mongodbCollectionName: process.env.MONGODB_COLLECTION_NAME || 'resumes',
  mongodbBm25Index: process.env.MONGODB_BM25_INDEX || 'bm25_index',
  mongodbVectorIndex: process.env.MONGODB_VECTOR_INDEX || 'vector_index',

  // Mistral Embedding
  mistralApiKey: process.env.MISTRAL_API_KEY || '',
  mistralEmbedModel: process.env.MISTRAL_EMBED_MODEL || 'mistral-embed',
  mistralEmbedDimension: process.env.MISTRAL_EMBED_DIMENSION ? Number(process.env.MISTRAL_EMBED_DIMENSION) : 1024,

  // GROQ LLM
  groqApiKey: process.env.GROQ_API_KEY || '',
  groqLlmModel: process.env.GROQ_LLM_MODEL || 'meta-llama/llama-3.1-70b-versatile',

  // Search Configuration
  searchBm25TopK: process.env.SEARCH_BM25_TOP_K ? Number(process.env.SEARCH_BM25_TOP_K) : 20,
  searchVectorTopK: process.env.SEARCH_VECTOR_TOP_K ? Number(process.env.SEARCH_VECTOR_TOP_K) : 20,
  searchRerankTopK: process.env.SEARCH_RERANK_TOP_K ? Number(process.env.SEARCH_RERANK_TOP_K) : 10
} as const;

export default config;
