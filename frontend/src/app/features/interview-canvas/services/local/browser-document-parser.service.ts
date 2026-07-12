import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DocumentParserService } from '../abstract/document-parser.service';
import { ParsedDocument, SectionType } from '../../models/canvas-import.models';

/**
 * Browser-local implementation of DocumentParserService.
 * Handles: plain text strings, File objects (TXT only for now; PDF/DOCX as text fallback).
 *
 * SWAP: Replace this with ApiDocumentParserService when backend is ready.
 *       Change one line in app.config.ts — no component code changes needed.
 */
@Injectable()
export class BrowserDocumentParserService extends DocumentParserService {

  parse(input: File | string, sourceType: 'jd' | 'resume'): Observable<ParsedDocument> {
    if (typeof input === 'string') {
      return of(this.parseText(input, sourceType));
    }
    return new Observable(observer => {
      this.readFile(input).then(text => {
        observer.next(this.parseText(text, sourceType, input.name, this.detectFileType(input)));
        observer.complete();
      }).catch(err => observer.error(err));
    });
  }

  // ── Private Helpers ─────────────────────────────────────────────────────────

  private async readFile(file: File): Promise<string> {
    if (file.type === 'application/pdf') {
      // PDF: extract text using native FileReader (raw — no layout)
      // When pdf.js is added via importmap, replace this with pdfjsLib.getDocument()
      return this.readAsText(file);
    }
    if (file.name.endsWith('.docx')) {
      // DOCX: mammoth.js can be added here via importmap in the future
      return this.readAsText(file);
    }
    return this.readAsText(file);
  }

  private readAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target?.result as string ?? '');
      reader.onerror = () => reject(new Error('File read failed'));
      reader.readAsText(file);
    });
  }

  private parseText(
    raw: string,
    sourceType: 'jd' | 'resume',
    fileName?: string,
    fileType: 'pdf' | 'docx' | 'txt' | 'paste' = 'paste'
  ): ParsedDocument {
    const cleaned = this.clean(raw);
    const lines = cleaned.split('\n').map(l => l.trim()).filter(Boolean);

    return {
      sourceType,
      rawText: cleaned,
      sections: this.detectSections(lines),
      metadata: { fileName, fileType, parsedAt: new Date().toISOString() }
    };
  }

  /**
   * Normalizes raw text: strips excessive whitespace, bullets, symbols,
   * duplicate blank lines, and common Unicode noise.
   */
  private clean(raw: string): string {
    return raw
      .replace(/[\u2022\u2023\u25E6\u2043\u2219]/g, '-')  // normalize bullet symbols
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+/g, ' ')          // collapse horizontal whitespace
      .replace(/\n{3,}/g, '\n\n')       // max 2 blank lines
      .replace(/[^\x00-\x7F]/g, ' ')   // strip non-ASCII noise
      .trim();
  }

  /**
   * Heuristic section detection: scans lines for common section headers
   * and groups subsequent lines under the detected section type.
   */
  private detectSections(lines: string[]): Partial<Record<SectionType, string[]>> {
    const sections: Partial<Record<SectionType, string[]>> = {};
    let currentSection: SectionType = 'other';

    const SECTION_PATTERNS: [RegExp, SectionType][] = [
      [/^(technical\s*)?skills?|technologies|tech stack/i, 'skills'],
      [/^(work\s*)?experience|employment|career/i, 'experience'],
      [/^projects?/i, 'projects'],
      [/^responsibilit(y|ies)|duties|roles?/i, 'responsibilities'],
      [/^requirements?|qualifications?|must have|preferred/i, 'requirements'],
      [/^tools?|software|platforms?|frameworks?/i, 'tools'],
    ];

    for (const line of lines) {
      const detected = this.matchSection(line, SECTION_PATTERNS);
      if (detected) {
        currentSection = detected;
        if (!sections[currentSection]) sections[currentSection] = [];
        continue;
      }

      if (!sections[currentSection]) sections[currentSection] = [];
      if (line.length > 10) {    // skip very short fragment lines
        sections[currentSection]!.push(line);
      }
    }

    return sections;
  }

  private matchSection(line: string, patterns: [RegExp, SectionType][]): SectionType | null {
    // Only check lines that look like headings (short, no sentence punctuation)
    if (line.length > 60 || line.endsWith('.')) return null;
    for (const [pattern, type] of patterns) {
      if (pattern.test(line)) return type;
    }
    return null;
  }

  private detectFileType(file: File): 'pdf' | 'docx' | 'txt' | 'paste' {
    if (file.type === 'application/pdf') return 'pdf';
    if (file.name.endsWith('.docx')) return 'docx';
    return 'txt';
  }
}
