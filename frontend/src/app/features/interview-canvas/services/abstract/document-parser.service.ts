import { Observable } from 'rxjs';
import { ParsedDocument } from '../../models/canvas-import.models';

/**
 * Abstract contract for document parsing.
 *
 * LOCAL  → BrowserDocumentParserService (TXT, paste, PDF via pdf.js)
 * FUTURE → ApiDocumentParserService     (delegates to backend OCR/parse endpoint)
 *
 * To swap: change the provider in app.config.ts — zero UI changes required.
 */
export abstract class DocumentParserService {
  abstract parse(input: File | string, sourceType: 'jd' | 'resume'): Observable<ParsedDocument>;
}
