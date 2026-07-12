import { Observable } from 'rxjs';
import { GapAnalysisResult } from '../../models/canvas-import.models';

/**
 * Abstract contract for generating interview questions from gap analysis results.
 *
 * LOCAL  → BrowserPrepQuestionGeneratorService (template-based question generation)
 * FUTURE → ApiPrepQuestionGeneratorService     (LLM prompt-based generation)
 */
export abstract class PrepQuestionGeneratorService {
  abstract generate(gaps: GapAnalysisResult): Observable<string[]>;
}
