import { Observable } from 'rxjs';
import { ParsedDocument, PrepPointer } from '../../models/canvas-import.models';

/**
 * Abstract contract for converting parsed document sections into concise
 * interview preparation pointers (checklist items).
 *
 * LOCAL  → BrowserPointerGeneratorService (regex/heuristic line splitting)
 * FUTURE → ApiPointerGeneratorService     (LLM summarization endpoint)
 */
export abstract class PointerGeneratorService {
  abstract generate(doc: ParsedDocument): Observable<PrepPointer[]>;
}
