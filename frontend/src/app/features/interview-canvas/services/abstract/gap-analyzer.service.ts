import { Observable } from 'rxjs';
import { GapAnalysisResult, ParsedDocument } from '../../models/canvas-import.models';

/**
 * Abstract contract for comparing JD requirements against Resume skills
 * and producing a gap analysis report.
 *
 * LOCAL  → BrowserGapAnalyzerService (keyword set-difference analysis)
 * FUTURE → ApiGapAnalyzerService     (semantic similarity via embeddings)
 */
export abstract class GapAnalyzerService {
  abstract analyze(jdDoc: ParsedDocument, resumeDoc: ParsedDocument): Observable<GapAnalysisResult>;
}
