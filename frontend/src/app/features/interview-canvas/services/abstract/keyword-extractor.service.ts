import { Observable } from 'rxjs';
import { ExtractedKeyword, ParsedDocument } from '../../models/canvas-import.models';

/**
 * Abstract contract for keyword extraction.
 *
 * LOCAL  → BrowserKeywordExtractorService (taxonomy dictionary matching)
 * FUTURE → ApiKeywordExtractorService     (LLM-powered extraction)
 */
export abstract class KeywordExtractorService {
  abstract extract(jdDoc: ParsedDocument, resumeDoc?: ParsedDocument): Observable<ExtractedKeyword[]>;
}
