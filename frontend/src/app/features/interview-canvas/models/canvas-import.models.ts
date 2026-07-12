// ─── Section Types ────────────────────────────────────────────────────────────
export type SectionType =
  | 'skills'
  | 'experience'
  | 'projects'
  | 'responsibilities'
  | 'requirements'
  | 'tools'
  | 'other';

// ─── Source Document ──────────────────────────────────────────────────────────
export type DocumentSourceType = 'jd' | 'resume';

export interface ParsedDocument {
  sourceType: DocumentSourceType;
  rawText: string;
  sections: Partial<Record<SectionType, string[]>>;
  metadata?: {
    fileName?: string;
    fileType?: 'pdf' | 'docx' | 'txt' | 'paste';
    parsedAt: string;
  };
}

// ─── Keywords ─────────────────────────────────────────────────────────────────
export type KeywordMatchStatus = 'match' | 'missing' | 'nice-to-have';

export interface ExtractedKeyword {
  id: string;
  term: string;
  normalized: string;          // lowercase, trimmed, for comparison
  frequency: number;           // how many times it appeared
  source: DocumentSourceType | 'both';
  matchStatus: KeywordMatchStatus;
  category?: string;           // e.g. 'Cloud', 'Backend', 'Database'
}

// ─── Preparation Pointers ─────────────────────────────────────────────────────
export interface PrepPointer {
  id: string;
  text: string;
  category: SectionType;
  source: DocumentSourceType;
}

// ─── Gap Analysis ─────────────────────────────────────────────────────────────
export interface GapAnalysisResult {
  matchedKeywords: ExtractedKeyword[];
  missingSkills: string[];
  highPriorityTopics: string[];   // appeared ≥ 2× in JD
  coverageScore: number;          // 0–100, matched/total × 100
}

// ─── Full Import Pipeline Result ─────────────────────────────────────────────
export interface ImportPipelineResult {
  jdDocument?: ParsedDocument;
  resumeDocument?: ParsedDocument;
  keywords: ExtractedKeyword[];
  jdPointers: PrepPointer[];
  resumePointers: PrepPointer[];
  gapAnalysis?: GapAnalysisResult;
  suggestedQuestions: string[];
}

// ─── Bulk Import ──────────────────────────────────────────────────────────────
export interface BulkImportPayload {
  type: 'keyword' | 'qa';
  items: string[];    // raw strings, one per keyword or question
}
