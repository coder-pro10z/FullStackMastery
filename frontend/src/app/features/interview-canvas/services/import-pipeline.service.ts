import { inject, Injectable } from '@angular/core';
import { forkJoin, Observable, of, switchMap } from 'rxjs';
import { DocumentParserService } from './abstract/document-parser.service';
import { KeywordExtractorService } from './abstract/keyword-extractor.service';
import { PointerGeneratorService } from './abstract/pointer-generator.service';
import { GapAnalyzerService } from './abstract/gap-analyzer.service';
import { PrepQuestionGeneratorService } from './abstract/prep-question-generator.service';
import { ImportPipelineResult, ParsedDocument } from '../models/canvas-import.models';

/**
 * ImportPipelineService — the Facade / Orchestrator.
 *
 * This is the ONLY service that components interact with.
 * It delegates every step to the injected abstract services.
 *
 * Swap the providers (not this service) to change the underlying implementation.
 */
@Injectable({ providedIn: 'root' })
export class ImportPipelineService {

  private readonly parser   = inject(DocumentParserService);
  private readonly extractor = inject(KeywordExtractorService);
  private readonly pointer  = inject(PointerGeneratorService);
  private readonly gap      = inject(GapAnalyzerService);
  private readonly qGen     = inject(PrepQuestionGeneratorService);

  /**
   * Full pipeline: parse → extract keywords → generate pointers → analyze gaps → generate questions.
   * Any step that lacks input is skipped gracefully.
   */
  run(
    jdInput: File | string | null,
    resumeInput: File | string | null
  ): Observable<ImportPipelineResult> {

    const jd$ = jdInput ? this.parser.parse(jdInput, 'jd') : of(null);
    const resume$ = resumeInput ? this.parser.parse(resumeInput, 'resume') : of(null);

    return forkJoin([jd$, resume$]).pipe(
      switchMap(([jdDoc, resumeDoc]) => {
        return this.buildResult(jdDoc, resumeDoc);
      })
    );
  }

  /**
   * Parses only a JD (no resume comparison — populates checklists + keywords).
   */
  runJdOnly(input: File | string): Observable<ImportPipelineResult> {
    return this.run(input, null);
  }

  /**
   * Bulk import helper — parses a raw string into individual keyword strings.
   * Supports: comma-separated, newline-separated, or mixed.
   */
  parseBulkKeywords(raw: string): string[] {
    return raw
      .split(/[\n,]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  /**
   * Bulk import helper — parses a raw string into individual question strings.
   * Each non-empty line becomes one question.
   */
  parseBulkQuestions(raw: string): string[] {
    return raw
      .split(/\n+/)
      .map(s => s.trim())
      .filter(s => s.length > 5);
  }

  // ── Private ──────────────────────────────────────────────────────────────────

  private buildResult(
    jdDoc: ParsedDocument | null,
    resumeDoc: ParsedDocument | null
  ): Observable<ImportPipelineResult> {

    const base: ImportPipelineResult = {
      jdDocument: jdDoc ?? undefined,
      resumeDocument: resumeDoc ?? undefined,
      keywords: [],
      jdPointers: [],
      resumePointers: [],
      suggestedQuestions: []
    };

    if (!jdDoc && !resumeDoc) return of(base);

    const keyword$ = jdDoc
      ? this.extractor.extract(jdDoc, resumeDoc ?? undefined)
      : of([]);

    const jdPointer$ = jdDoc ? this.pointer.generate(jdDoc) : of([]);
    const resumePointer$ = resumeDoc ? this.pointer.generate(resumeDoc) : of([]);

    const gap$ = jdDoc && resumeDoc
      ? this.gap.analyze(jdDoc, resumeDoc)
      : of(undefined);

    return forkJoin([keyword$, jdPointer$, resumePointer$, gap$]).pipe(
      switchMap(([keywords, jdPointers, resumePointers, gapResult]) => {
        const questions$ = gapResult ? this.qGen.generate(gapResult) : of([]);
        return forkJoin([of({ keywords, jdPointers, resumePointers, gapResult }), questions$]);
      }),
      switchMap(([{ keywords, jdPointers, resumePointers, gapResult }, questions]) => {
        return of({
          ...base,
          keywords,
          jdPointers,
          resumePointers,
          gapAnalysis: gapResult ?? undefined,
          suggestedQuestions: questions
        } as ImportPipelineResult);
      })
    );
  }
}
