import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { GapAnalyzerService } from '../abstract/gap-analyzer.service';
import { ExtractedKeyword, GapAnalysisResult, ParsedDocument } from '../../models/canvas-import.models';
import { KEYWORD_TAXONOMY } from '../data/keywords-taxonomy';

/**
 * Browser-local gap analyzer.
 * Performs keyword set-difference analysis between JD requirements and Resume skills.
 */
@Injectable()
export class BrowserGapAnalyzerService extends GapAnalyzerService {

  analyze(jdDoc: ParsedDocument, resumeDoc: ParsedDocument): Observable<GapAnalysisResult> {
    const jdText = jdDoc.rawText.toLowerCase();
    const resumeText = resumeDoc.rawText.toLowerCase();

    // Extract all JD keywords (terms that appear in JD)
    const jdKeywords: ExtractedKeyword[] = [];
    const jdFrequency = new Map<string, number>();

    for (const entry of KEYWORD_TAXONOMY) {
      const terms = [entry.normalized, ...(entry.aliases ?? []).map(a => a.toLowerCase())];
      const freq = terms.reduce((acc, t) => acc + this.count(jdText, t), 0);
      if (freq === 0) continue;

      jdFrequency.set(entry.normalized, freq);
      const inResume = terms.some(t => resumeText.includes(t));

      jdKeywords.push({
        id: crypto.randomUUID(),
        term: entry.term,
        normalized: entry.normalized,
        frequency: freq,
        source: inResume ? 'both' : 'jd',
        matchStatus: inResume ? 'match' : 'missing',
        category: entry.category
      });
    }

    const matched = jdKeywords.filter(k => k.matchStatus === 'match');
    const missing = jdKeywords.filter(k => k.matchStatus === 'missing');

    // High-priority: appeared ≥ 2 times in JD
    const highPriority = jdKeywords
      .filter(k => k.frequency >= 2)
      .sort((a, b) => b.frequency - a.frequency)
      .map(k => k.term);

    const coverageScore = jdKeywords.length === 0
      ? 0
      : Math.round((matched.length / jdKeywords.length) * 100);

    return of({
      matchedKeywords: matched,
      missingSkills: missing.map(k => k.term),
      highPriorityTopics: highPriority,
      coverageScore
    });
  }

  private count(text: string, term: string): number {
    let count = 0;
    let pos = 0;
    while ((pos = text.indexOf(term, pos)) !== -1) { count++; pos += term.length; }
    return count;
  }
}
