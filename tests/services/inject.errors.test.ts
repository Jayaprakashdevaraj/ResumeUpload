import { InvalidFileError, EmptyResumeError, EmbeddingError, MongoIngestError } from '../../src/errors/ingestionErrors';

describe('injectResume error handling (controller unit)', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  function makeRes() {
    const res: any = {};
    res.locals = {};
    res.status = (s: number) => { res.statusCode = s; return res; };
    res.json = (b: any) => { res.body = b; return res; };
    return res;
  }

  async function callInjectWithMock(mockImpl: any, body: any = { path: 'uploads/test.pdf' }) {
    jest.doMock('../../src/services/ResumeingestionService', () => ({
      ResumeingestionService: jest.fn().mockImplementation(() => ({ injectResume: mockImpl }))
    }));
    const controller = (await import('../../src/controllers/ingestionController')).default;
    const req: any = { body };
    const res = makeRes();
    await controller.injectResume(req, res);
    return res;
  }

  test('returns 400 for InvalidFileError', async () => {
    const mock = async () => { throw new InvalidFileError(); };
    const res = await callInjectWithMock(mock, { path: 'uploads/not-a-pdf.txt' });
    expect(res.statusCode).toBe(400);
    expect(res.body.code).toBe('INVALID_FILE');
  });

  test('returns 422 for EmptyResumeError', async () => {
    const mock = async () => { throw new EmptyResumeError(); };
    const res = await callInjectWithMock(mock, { path: 'uploads/empty.pdf' });
    expect(res.statusCode).toBe(422);
    expect(res.body.code).toBe('EMPTY_RESUME');
  });

  test('returns 502 for EmbeddingError', async () => {
    const mock = async () => { throw new EmbeddingError(); };
    const res = await callInjectWithMock(mock, { path: 'uploads/test.pdf' });
    expect(res.statusCode).toBe(502);
    expect(res.body.code).toBe('EMBEDDING_FAILED');
  });

  test('returns 500 for MongoIngestError', async () => {
    const mock = async () => { throw new MongoIngestError(); };
    const res = await callInjectWithMock(mock, { path: 'uploads/test.pdf' });
    expect(res.statusCode).toBe(500);
    expect(res.body.code).toBe('MONGO_INGEST_FAILED');
  });
});
