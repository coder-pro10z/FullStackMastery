import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { PointerGeneratorService } from '../abstract/pointer-generator.service';
import { ParsedDocument, PrepPointer, SectionType } from '../../models/canvas-import.models';

/**
 * Browser-local pointer generator.
 * Splits each section's lines into concise preparation pointers.
 */
@Injectable()
export class BrowserPointerGeneratorService extends PointerGeneratorService {

  generate(doc: ParsedDocument): Observable<PrepPointer[]> {
    const pointers: PrepPointer[] = [];

    for (const [sectionKey, lines] of Object.entries(doc.sections)) {
      if (!lines?.length) continue;
      const category = sectionKey as SectionType;

      for (const line of lines) {
        const cleaned = this.cleanLine(line);
        if (!cleaned || cleaned.length < 15) continue;

        // Split on bullet markers, semicolons, or long conjunctions
        const fragments = this.splitIntoPointers(cleaned);
        for (const frag of fragments) {
          if (frag.trim().length >= 15) {
            pointers.push({
              id: crypto.randomUUID(),
              text: this.capitalizeFirst(frag.trim()),
              category,
              source: doc.sourceType
            });
          }
        }
      }
    }

    return of(pointers.slice(0, 40)); // cap at 40 to avoid overwhelming the checklist
  }

  private cleanLine(line: string): string {
    return line
      .replace(/^[-•*>\d.]+\s*/, '')      // strip leading bullet/number
      .replace(/\s+/g, ' ')
      .trim();
  }

  private splitIntoPointers(line: string): string[] {
    // Split on: ' and ', '; ', ' as well as ', bullet-type tokens
    return line
      .split(/;\s*| and | & | as well as /i)
      .map(s => s.trim())
      .filter(Boolean);
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
