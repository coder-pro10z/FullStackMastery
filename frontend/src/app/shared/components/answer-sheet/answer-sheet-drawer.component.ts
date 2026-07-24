import { ChangeDetectionStrategy, Component, HostListener, inject } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { AnswerSheetService } from '../../../core/services/answer-sheet.service';
import { TheoryAnswerSheetComponent } from './layouts/theory-answer-sheet/theory-answer-sheet.component';
import { SqlAnswerSheetComponent } from './layouts/sql-answer-sheet/sql-answer-sheet.component';

@Component({
  selector: 'app-answer-sheet-drawer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LucideAngularModule,
    TheoryAnswerSheetComponent,
    SqlAnswerSheetComponent
  ],
  template: `
    @if (sheetService.isOpen()) {
      <!-- Backdrop -->
      <div
        class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[999] transition-opacity animate-fade-in"
        (click)="sheetService.close()"
      ></div>

      <!-- Container Host -->
      <div
        class="fixed z-[9999] transition-all duration-300 ease-out flex flex-col bg-slate-100 shadow-2xl overflow-hidden"
        [class.fixed-drawer]="sheetService.viewMode() === 'drawer'"
        [class.fixed-fullscreen]="sheetService.viewMode() === 'fullscreen'"
      >
        <!-- ── Top Controls Header Bar ──────────────────────────────────────── -->
        <div class="bg-[#0A192F] text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 flex-shrink-0 shadow-md">
          <!-- Left: Title & Badge -->
          <div class="flex items-center gap-3">
            <span class="text-xs uppercase tracking-wider font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
              Interactive Sheet
            </span>

            @if (sheetService.activeSheet(); as sheet) {
              <span class="text-xs font-mono font-semibold text-slate-300 hidden sm:inline">
                ID: {{ sheet.sheetType === 'theory' ? sheet.competencyId : sheet.questionId }}
              </span>
            }
          </div>

          <!-- Right: Controls -->
          <div class="flex items-center gap-2">
            <!-- Nav Prev / Next -->
            <div class="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
              <button
                type="button"
                (click)="sheetService.prevSheet()"
                class="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-700 transition-all active:scale-95"
                title="Previous Sheet"
              >
                <lucide-icon name="chevron-left" [size]="16" />
              </button>
              <span class="px-1 text-[11px] text-slate-400 font-mono select-none">Nav</span>
              <button
                type="button"
                (click)="sheetService.nextSheet()"
                class="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-700 transition-all active:scale-95"
                title="Next Sheet"
              >
                <lucide-icon name="chevron-right" [size]="16" />
              </button>
            </div>

            <!-- Print Action -->
            <button
              type="button"
              (click)="printSheet()"
              class="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all active:scale-95"
            >
              <lucide-icon name="printer" [size]="14" />
              <span>Print</span>
            </button>

            <!-- Fullscreen / Drawer Toggle -->
            <button
              type="button"
              (click)="sheetService.toggleViewMode()"
              class="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all active:scale-95 font-semibold"
            >
              @if (sheetService.viewMode() === 'drawer') {
                <lucide-icon name="maximize-2" [size]="14" />
                <span class="hidden sm:inline">Fullscreen</span>
              } @else {
                <lucide-icon name="minimize-2" [size]="14" />
                <span class="hidden sm:inline">Drawer View</span>
              }
            </button>

            <!-- Close Button -->
            <button
              type="button"
              (click)="sheetService.close()"
              class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-rose-500/20 transition-all active:scale-95"
              title="Close (Esc)"
            >
              <lucide-icon name="x" [size]="18" />
            </button>
          </div>
        </div>

        <!-- ── Scrollable Sheet Body ────────────────────────────────────────── -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-6">
          @if (sheetService.activeSheet(); as sheet) {
            @if (sheet.sheetType === 'theory') {
              <app-theory-answer-sheet [sheet]="sheet" />
            } @else if (sheet.sheetType === 'sql') {
              <app-sql-answer-sheet [sheet]="sheet" />
            }
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .fixed-drawer {
      top: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      max-width: 95vw;
    }
    @media (min-width: 640px) {
      .fixed-drawer {
        max-width: 85vw;
      }
    }
    @media (min-width: 1280px) {
      .fixed-drawer {
        max-width: 1200px;
      }
    }
    @media (min-width: 1536px) {
      .fixed-drawer {
        max-width: 1400px;
      }
    }

    .fixed-fullscreen {
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100vw;
      height: 100vh;
    }
  `]
})
export class AnswerSheetDrawerComponent {
  sheetService = inject(AnswerSheetService);

  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (this.sheetService.isOpen()) {
      this.sheetService.close();
    }
  }

  printSheet(): void {
    window.print();
  }
}
