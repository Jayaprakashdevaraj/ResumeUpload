export class IngestionError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status = 500, code?: string) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class InvalidFileError extends IngestionError {
  constructor(message = 'Only PDF allowed') {
    super(message, 400, 'INVALID_FILE');
  }
}

export class EmptyResumeError extends IngestionError {
  constructor(message = 'Resume extraction failed') {
    super(message, 422, 'EMPTY_RESUME');
  }
}

export class EmbeddingError extends IngestionError {
  constructor(message = 'Mistral embedding failed') {
    super(message, 502, 'EMBEDDING_FAILED');
  }
}

export class MongoIngestError extends IngestionError {
  constructor(message = 'ingestion failed') {
    super(message, 500, 'MONGO_INGEST_FAILED');
  }
}
