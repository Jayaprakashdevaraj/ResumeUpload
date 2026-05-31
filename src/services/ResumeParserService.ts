import fs from 'fs/promises';
import path from 'path';
import { InvalidFileError, EmptyResumeError } from '../errors/ingestionErrors';

export class ResumeParserService {
  async extractTextFromPdf(filePath: string): Promise<string> {
    if (!filePath) throw new InvalidFileError('file path is required');

    const resolved = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), 'uploads', filePath);

    // ensure file exists
    try {
      await fs.access(resolved);
    } catch (e) {
      throw new InvalidFileError(`File not found: ${resolved}`);
    }

    // basic extension check
    const ext = path.extname(resolved || '').toLowerCase();
    if (ext !== '.pdf') {
      throw new InvalidFileError('Only PDF allowed');
    }

    const data = await fs.readFile(resolved);

    try {
      const pdfParseMod = (await import('pdf-parse')) as any;

      let text = '';

      if (typeof pdfParseMod === 'function') {
        const parsed = await pdfParseMod(data);
        text = String(parsed?.text || '').trim();
      } else if (pdfParseMod && typeof pdfParseMod.PDFParse === 'function') {
        const u8 = new Uint8Array(data);
        const pdfInst = new pdfParseMod.PDFParse(u8);
        await pdfInst.load();
        const parsed = await pdfInst.getText();
        text = String(parsed?.text || '').trim();
      } else if (pdfParseMod && typeof pdfParseMod.default === 'function') {
        const parsed = await pdfParseMod.default(data);
        text = String(parsed?.text || '').trim();
      } else {
        throw new Error('Unsupported pdf-parse module shape');
      }

      if (!text) {
        throw new EmptyResumeError();
      }

      return text;
    } catch (err: any) {
      if (err instanceof EmptyResumeError || err instanceof InvalidFileError) throw err;
      throw new Error(`PDF parse failed: ${err?.message || String(err)}`);
    }
  }
}
