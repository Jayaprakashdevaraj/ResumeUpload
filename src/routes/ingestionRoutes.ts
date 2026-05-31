import { Router, Request, Response, NextFunction } from 'express';
import ingestionController from '../controllers/ingestionController';
import { upload } from '../config/multerConfig';
import { connectToMongo } from '../lib/mongo';
import config from '../config';

const router = Router();

function singleUpload(fieldName: string) {
	return (req: Request, res: Response, next: NextFunction) => {
		// only run multer for multipart/form-data requests; otherwise skip
		const ct = req.headers['content-type'] || '';
		if (typeof ct === 'string' && ct.startsWith('multipart/form-data')) {
			(upload.single(fieldName) as any)(req, res, (err: any) => {
				if (err) {
					const msg = err?.message || 'Upload error';
					const status = err?.code === 'LIMIT_FILE_SIZE' || String(msg).toLowerCase().includes('pdf') ? 400 : 500;
					res.status(status).json({ error: msg });
					return;
				}
				next();
			});
		} else {
			next();
		}
	};
}

router.post('/upload', singleUpload('file'), ingestionController.uploadResume);
router.post('/extract', ingestionController.extractText);
router.post('/clean', ingestionController.cleanText);
router.post('/parse', ingestionController.parseResume);
router.post('/skills', ingestionController.detectSkills);
router.post('/llm-parse', ingestionController.llmParse);
router.post('/embed', ingestionController.embed);
router.post('/store', ingestionController.store);
router.post('/inject', singleUpload('file'), ingestionController.injectResume);

router.get('/all', async (req: Request, res: Response) => {
	try {
		const client = await connectToMongo();
		const col = client.db(config.mongodbDbName).collection(config.mongodbCollectionName);

		const limit = Math.max(1, Math.min(1000, Number(req.query.limit) || 100));
		const page = Math.max(1, Number(req.query.page) || 1);
		const skip = (page - 1) * limit;

		const cursor = col.find({}).skip(skip).limit(limit);
		const results = await cursor.toArray();
		const total = await col.countDocuments();

		res.json({ total, page, limit, count: results.length, results });
	} catch (err: any) {
		console.error('/v1/resume/all error:', err);
		res.status(500).json({ error: 'Failed to fetch records' });
	}
});

export default router;
