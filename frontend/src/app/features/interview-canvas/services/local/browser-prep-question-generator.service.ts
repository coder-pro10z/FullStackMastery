import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { PrepQuestionGeneratorService } from '../abstract/prep-question-generator.service';
import { GapAnalysisResult } from '../../models/canvas-import.models';

/**
 * Browser-local Q&A generator.
 * Uses template-based question generation from gap analysis results.
 * Each missing skill and high-priority topic generates one or more question strings.
 *
 * SWAP: Replace with ApiPrepQuestionGeneratorService when LLM endpoint is available.
 */
@Injectable()
export class BrowserPrepQuestionGeneratorService extends PrepQuestionGeneratorService {

  generate(gaps: GapAnalysisResult): Observable<string[]> {
    const questions: string[] = [];

    // From missing skills — highest priority
    for (const skill of gaps.missingSkills.slice(0, 8)) {
      questions.push(...this.fromMissing(skill));
    }

    // From high-priority topics — frequently repeated in JD
    for (const topic of gaps.highPriorityTopics.slice(0, 6)) {
      if (!gaps.missingSkills.includes(topic)) {
        questions.push(...this.fromHighPriority(topic));
      }
    }

    return of([...new Set(questions)].slice(0, 15)); // deduplicate, cap at 15
  }

  // ── Question Templates ───────────────────────────────────────────────────────

  private fromMissing(skill: string): string[] {
    return [
      `Can you walk me through your experience with ${skill}, or how you would approach learning it?`,
      `${skill} is listed as a core requirement. How would you handle working with it from day one?`,
    ];
  }

  private fromHighPriority(topic: string): string[] {
    return [
      `${topic} appears heavily in the job description. Describe a specific situation where you applied it.`,
      `What challenges have you faced while working with ${topic}, and how did you resolve them?`,
    ];
  }
}
