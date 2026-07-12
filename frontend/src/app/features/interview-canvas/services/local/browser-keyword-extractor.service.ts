import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { KeywordExtractorService } from '../abstract/keyword-extractor.service';
import { ExtractedKeyword, ParsedDocument } from '../../models/canvas-import.models';
import { KEYWORD_TAXONOMY } from '../data/keywords-taxonomy';

/**
 * Browser-local keyword extractor.
 * Uses the bundled KEYWORD_TAXONOMY for fast substring matching.
 * O(lines × taxonomy_size) — suitable for typical JD/resume lengths.
 */
@Injectable()
export class BrowserKeywordExtractorService extends KeywordExtractorService {

  extract(jdDoc: ParsedDocument, resumeDoc?: ParsedDocument): Observable<ExtractedKeyword[]> {
    const jdText = jdDoc.rawText.toLowerCase();
    const resumeText = resumeDoc?.rawText.toLowerCase() ?? '';

    const keywords: ExtractedKeyword[] = [];

    for (const entry of KEYWORD_TAXONOMY) {
      const terms = [entry.normalized, ...(entry.aliases ?? []).map(a => a.toLowerCase())];
      const inJd = terms.some(t => jdText.includes(t));
      const inResume = resumeDoc ? terms.some(t => resumeText.includes(t)) : false;

      if (!inJd && !inResume) continue;

      const freq = this.countOccurrences(jdText, terms);
      const source = inJd && inResume ? 'both' : inJd ? 'jd' : 'resume';
      const matchStatus = !resumeDoc
        ? 'match'
        : inJd && inResume
        ? 'match'
        : inJd && !inResume
        ? 'missing'
        : 'nice-to-have';

      keywords.push({
        id: crypto.randomUUID(),
        term: entry.term,
        normalized: entry.normalized,
        frequency: freq,
        source,
        matchStatus,
        category: entry.category
      });
    }

    // Sort: missing first (highest priority), then by JD frequency descending
    return of(keywords.sort((a, b) => {
      const statusOrder = { missing: 0, match: 1, 'nice-to-have': 2 };
      const statusDiff = statusOrder[a.matchStatus] - statusOrder[b.matchStatus];
      return statusDiff !== 0 ? statusDiff : b.frequency - a.frequency;
    }));
  }

  private countOccurrences(text: string, terms: string[]): number {
    let count = 0;
    for (const term of terms) {
      let pos = 0;
      while ((pos = text.indexOf(term, pos)) !== -1) {
        count++;
        pos += term.length;
      }
    }
    return count;
  }
}
