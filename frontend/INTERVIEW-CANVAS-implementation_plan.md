# Interview Canvas Enhancement — JD & Resume Import Pipeline

> **Status:** Approved for implementation  
> **Last Updated:** 2026-05-27

---

## 1. Goal

Build an intelligent, end-to-end import pipeline inside the Interview Canvas that:
- Accepts JD and Resume as PDF, DOCX, TXT, or raw pasted text
- Extracts structured preparation pointers, keywords, and Q&A
- Detects skill gaps between the JD and Resume
- Populates the Interview Canvas automatically
- Supports bulk import (CSV upload or paste) for Q&A and Keywords
- Renders markdown and code blocks in Q&A dynamic fields

All parsing runs **locally in the browser** initially. The entire pipeline is designed with **SOLID principles** so that every parser and analyzer can be swapped for a backend API service by changing a single provider token — **zero UI code changes required.**

---

## 2. SOLID Architecture — The Abstraction Contract

This is the core principle of the entire design. Every processing step is hidden behind an **abstract interface (token)**. The UI always calls the interface. The browser implementation is provided by default. When a backend is ready, only the provider changes.

```
UI Components
    │
    ▼  (inject via token — never the concrete class)
Abstract Service Interface (TypeScript abstract class)
    │
    ├── [LOCAL]   BrowserDocumentParserService
    │             BrowserKeywordExtractorService
    │             BrowserGapAnalyzerService
    │
    └── [FUTURE]  ApiDocumentParserService       (swap when backend is ready)
                  ApiKeywordExtractorService
                  ApiGapAnalyzerService
```

### 2.1 Core Interfaces

```typescript
// ─── Document Parsing ───────────────────────────────────────────
abstract class DocumentParserService {
  abstract parse(file: File | string): Observable<ParsedDocument>;
}

// ─── Keyword Extraction ──────────────────────────────────────────
abstract class KeywordExtractorService {
  abstract extract(doc: ParsedDocument): Observable<ExtractedKeyword[]>;
}

// ─── Pointer/Checklist Generation ───────────────────────────────
abstract class PointerGeneratorService {
  abstract generate(doc: ParsedDocument): Observable<PrepPointer[]>;
}

// ─── Gap Analysis ────────────────────────────────────────────────
abstract class GapAnalyzerService {
  abstract analyze(jd: ParsedDocument, resume: ParsedDocument): Observable<GapAnalysisResult>;
}

// ─── Q&A Generator ──────────────────────────────────────────────
abstract class PrepQuestionGeneratorService {
  abstract generate(gaps: GapAnalysisResult): Observable<PrepQuestion[]>;
}
```

### 2.2 How to Swap (Single Line Change in `app.config.ts`)

```typescript
// Phase 1 — Local (Browser)
{ provide: DocumentParserService, useClass: BrowserDocumentParserService }

// Phase 2 — Backend API (just change this line, nothing else)
{ provide: DocumentParserService, useClass: ApiDocumentParserService }
```

---

## 3. Data Models (Single Source of Truth)

```typescript
interface ParsedDocument {
  rawText: string;
  sections: { [key in SectionType]?: string[] };
  sourceType: 'jd' | 'resume';
}

type SectionType = 
  | 'skills' | 'experience' | 'projects' 
  | 'responsibilities' | 'requirements' | 'tools';

interface ExtractedKeyword {
  term: string;
  normalized: string;        // lowercase, trimmed
  frequency: number;
  source: 'jd' | 'resume' | 'both';
  matchStatus: 'match' | 'missing' | 'nice-to-have';
}

interface PrepPointer {
  text: string;
  category: SectionType;
  source: 'jd' | 'resume';
}

interface GapAnalysisResult {
  matchedKeywords: ExtractedKeyword[];
  missingSkills: string[];
  highPriorityTopics: string[];
  coverageScore: number;   // 0–100
}
```

---

## 4. Processing Pipeline (5 Steps)

### Step 1 — File Ingestion & Text Extraction
**New service:** `BrowserDocumentParserService`

- **TXT** → `FileReader.readAsText()`
- **PDF** → `pdf.js` (cdn via importmap — lightweight, no npm bloat)  
- **DOCX** → `mammoth.js` (cdn via importmap)
- **Paste** → raw string passed directly

Returns a clean `ParsedDocument` with normalized text and auto-detected sections (via keyword header matching: "responsibilities", "requirements", "experience", etc.).

### Step 2 — Structured Pointer Generation
**New service:** `BrowserPointerGeneratorService`

Iterates over each parsed section and breaks bullet points into clean `PrepPointer` objects.

- Strips HTML, removes duplicate lines, normalizes casing
- Maps to `SectionType`
- These populate **JD vs Resume Alignment** checklist items

### Step 3 — Keyword Extraction Engine
**New service:** `BrowserKeywordExtractorService`

Runs a frequency analysis against a curated technical taxonomy (`keywords-taxonomy.ts`):
- Built-in dictionary of ~500 common tech terms (.NET, Docker, LINQ, React, SQL, etc.)
- Matches by substring normalization (case-insensitive, handles plurals)
- Compares JD keywords vs Resume keywords → sets `matchStatus`
- Results auto-populate the **Keyword Cheat Sheet** section

### Step 4 — Gap Analysis
**New service:** `BrowserGapAnalyzerService`

Accepts both parsed documents (JD + Resume) and produces:
- `missingSkills`: In JD requirements, not in resume skills
- `highPriorityTopics`: Appearing ≥ 2x in JD  
- `coverageScore`: Matched keyword count / total JD keyword count × 100

### Step 5 — Preparation Coverage & Q&A Generation
**New service:** `BrowserPrepQuestionGeneratorService`

Generates high-probability interview questions from:
- Missing skills (e.g., "Tell me about your experience with Kubernetes")
- High-frequency keywords (e.g., "Can you explain how you've used Docker in production?")
- JD responsibilities (behavioral mapping)

These are injected directly into the **High-Probability Questions** section of the Canvas.

---

## 5. New Files & Component Architecture

```
interview-canvas/
├── services/
│   ├── tokens/
│   │   └── parser.tokens.ts                     ← [NEW] DI tokens
│   ├── abstract/
│   │   ├── document-parser.service.ts            ← [NEW] Abstract class
│   │   ├── keyword-extractor.service.ts          ← [NEW] Abstract class
│   │   ├── pointer-generator.service.ts          ← [NEW] Abstract class
│   │   ├── gap-analyzer.service.ts               ← [NEW] Abstract class
│   │   └── prep-question-generator.service.ts    ← [NEW] Abstract class
│   ├── local/
│   │   ├── browser-document-parser.service.ts    ← [NEW] Browser impl
│   │   ├── browser-keyword-extractor.service.ts  ← [NEW] Browser impl
│   │   ├── browser-pointer-generator.service.ts  ← [NEW] Browser impl
│   │   ├── browser-gap-analyzer.service.ts       ← [NEW] Browser impl
│   │   └── browser-prep-question-generator.ts    ← [NEW] Browser impl
│   ├── data/
│   │   └── keywords-taxonomy.ts                  ← [NEW] 500-term dictionary
│   └── import-pipeline.service.ts               ← [NEW] Orchestrator (facade)
│
├── components/
│   ├── import-modal/
│   │   └── import-modal.component.ts             ← [NEW] JD + Resume import UI
│   ├── bulk-import-drawer/
│   │   └── bulk-import-drawer.component.ts       ← [NEW] Paste/CSV bulk import
│   ├── gap-report/
│   │   └── gap-report.component.ts               ← [NEW] Gap analysis results
│   ├── qa-accordion/
│   │   └── qa-accordion.component.ts             ← [MODIFY] Add markdown renderer
│   └── keyword-card/
│       └── keyword-card.component.ts             ← [MODIFY] Add matchStatus badges
│
├── pipes/
│   └── markdown.pipe.ts                         ← [NEW] Markdown + code block pipe
```

---

## 6. Import Modal UX — Screen Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  Import JD & Resume                                    [X]      │
│─────────────────────────────────────────────────────────────────│
│  ┌──────────────────────┐   ┌──────────────────────┐           │
│  │   Job Description    │   │       Resume          │           │
│  │  ┌────────────────┐  │   │  ┌────────────────┐  │           │
│  │  │ Drop PDF/DOCX/ │  │   │  │ Drop PDF/DOCX/ │  │           │
│  │  │ TXT here  📁   │  │   │  │ TXT here  📁   │  │           │
│  │  └────────────────┘  │   │  └────────────────┘  │           │
│  │  or paste text below │   │  or paste text below │           │
│  │  ┌────────────────┐  │   │  ┌────────────────┐  │           │
│  │  │                │  │   │  │                │  │           │
│  │  └────────────────┘  │   │  └────────────────┘  │           │
│  └──────────────────────┘   └──────────────────────┘           │
│                                                                  │
│  [Skeleton while parsing...]                                     │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ ✅ Parsed 4 sections · 12 keywords found · 3 gaps detected │ │
│  └────────────────────────────────────────────────────────────┘ │
│               [Cancel]   [Apply to Canvas →]                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Bulk Import (Both CSV & Paste Formats Supported)

A "Bulk Import" drawer opens from both Q&A and Keywords sections.

```
┌─────────────────────────────────────────────┐
│  Bulk Add Keywords                     [X]  │
│─────────────────────────────────────────────│
│  Paste (one per line or comma-separated):   │
│  ┌─────────────────────────────────────────┐│
│  │ Docker, Kubernetes, Redis               ││
│  │ .NET Core                               ││
│  │ Entity Framework, LINQ                  ││
│  └─────────────────────────────────────────┘│
│  — or —                                     │
│  [Upload CSV File]  (column: term, context) │
│                                             │
│  Preview: 6 items detected                  │
│  ┌────┐ ┌────────────┐ ┌──────┐ ┌──────┐   │
│  │Docker│ │Kubernetes │ │Redis │ │LINQ  │   │
│  └────┘ └────────────┘ └──────┘ └──────┘   │
│               [Cancel]  [Add All →]         │
└─────────────────────────────────────────────┘
```

Same pattern for Q&A: each line becomes a new question card.

---

## 8. Markdown + Code Block Rendering in Q&A Dynamic Fields

The Q&A accordion's answer field will support markdown-style formatting:

| Trigger | Result |
|---------|--------|
| ` ```code here``` ` | Rendered `<code>` block with monospace + dark background |
| `:code` then Enter | Starts a fenced code block |
| `**text**` | **Bold** |
| `_text_` | *Italic* |

**Implementation:**
- A custom Angular `MarkdownPipe` (pure pipe, runs on `SafeHtml`) transforms the raw string before display.
- Edit mode shows raw text; preview mode renders markdown.
- A small **toggle button** (`Edit` / `Preview`) sits at the top-right of each Q&A answer field.
- Code blocks get a **copy to clipboard** button automatically.

---

## 9. Canvas Store Updates

The existing `CanvasStore` will be extended to accept:
- `applyImportResult(result: ImportPipelineResult)` action — atomically updates JD checklist, keywords, and Q&A from the import pipeline
- `bulkAddKeywords(keywords: string[])` action
- `bulkAddQA(questions: string[])` action

---

## 10. Verification Plan

| Test | How |
|------|-----|
| TXT parsing extracts sections correctly | Unit test on `BrowserDocumentParserService` |
| Keyword taxonomy matches known terms | Unit test: pass ".NET Core" → expect `matchStatus: 'match'` |
| Gap analysis returns missing skills | Unit test: JD has "Kubernetes" but resume doesn't → appears in `missingSkills` |
| Bulk paste parses comma + newline | Unit test on the bulk parser utility |
| Markdown pipe renders `code` blocks | Component test with `TestBed` |
| Swapping provider doesn't break UI | Verify by mocking `ApiDocumentParserService` |

---

## 11. Phased Build Order

| Phase | Work |
|-------|------|
| **Phase A** | Abstract classes + tokens + `ImportPipelineService` orchestrator |
| **Phase B** | `BrowserDocumentParserService` (TXT + paste first, PDF/DOCX second) |
| **Phase C** | Keyword taxonomy + `BrowserKeywordExtractorService` |
| **Phase D** | `BrowserGapAnalyzerService` + Gap Report component |
| **Phase E** | Import Modal UI (drag-drop + paste) |
| **Phase F** | Bulk Import Drawer (Q&A + Keywords, both CSV and paste) |
| **Phase G** | Markdown pipe + code block in Q&A accordion |
| **Phase H** | Canvas Store actions + wire everything together |
