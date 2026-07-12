import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  LucideAngularModule,
  icons,
  Unlock,
  FileEdit,
  UploadCloud,
  AlertTriangle,
  Folder,
  FolderOpen,
  Trash2
} from 'lucide-angular';
import { authInterceptor } from './core/interceptors/auth.interceptor';

// ── Import Pipeline — Abstract Services ─────────────────────────────────────
import { DocumentParserService } from './features/interview-canvas/services/abstract/document-parser.service';
import { KeywordExtractorService } from './features/interview-canvas/services/abstract/keyword-extractor.service';
import { PointerGeneratorService } from './features/interview-canvas/services/abstract/pointer-generator.service';
import { GapAnalyzerService } from './features/interview-canvas/services/abstract/gap-analyzer.service';
import { PrepQuestionGeneratorService } from './features/interview-canvas/services/abstract/prep-question-generator.service';

// ── Import Pipeline — Browser Implementations (swap these when backend is ready)
import { BrowserDocumentParserService } from './features/interview-canvas/services/local/browser-document-parser.service';
import { BrowserKeywordExtractorService } from './features/interview-canvas/services/local/browser-keyword-extractor.service';
import { BrowserPointerGeneratorService } from './features/interview-canvas/services/local/browser-pointer-generator.service';
import { BrowserGapAnalyzerService } from './features/interview-canvas/services/local/browser-gap-analyzer.service';
import { BrowserPrepQuestionGeneratorService } from './features/interview-canvas/services/local/browser-prep-question-generator.service';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimationsAsync(),
    importProvidersFrom(LucideAngularModule.pick({
      ...icons,
      Unlock,
      FileEdit,
      UploadCloud,
      AlertTriangle,
      Folder,
      FolderOpen,
      Trash2
    })),

    // ── Import Pipeline Providers ────────────────────────────────────────────
    // To swap to backend: replace useClass on any of these. Zero UI changes needed.
    { provide: DocumentParserService,       useClass: BrowserDocumentParserService },
    { provide: KeywordExtractorService,     useClass: BrowserKeywordExtractorService },
    { provide: PointerGeneratorService,     useClass: BrowserPointerGeneratorService },
    { provide: GapAnalyzerService,          useClass: BrowserGapAnalyzerService },
    { provide: PrepQuestionGeneratorService, useClass: BrowserPrepQuestionGeneratorService },
  ]
};

