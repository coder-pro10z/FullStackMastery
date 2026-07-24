import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { TheoryAnswerSheet } from '../../../../../core/models/answer-sheet.models';
import { AnswerSheetService } from '../../../../../core/services/answer-sheet.service';
import { CompetencyProgressService } from '../../../../../core/services/competency-progress.service';
import { StarRatingComponent } from '../../sub-components/star-rating/star-rating.component';
import { CodeBlockComponent } from '../../sub-components/code-block/code-block.component';
import { SectionHeaderComponent } from '../../sub-components/section-header/section-header.component';
import { MyNotesEditorComponent } from '../../sub-components/my-notes-editor/my-notes-editor.component';
import { InterviewFlowComponent } from '../../sub-components/interview-flow/interview-flow.component';
import { FlowDiagramComponent } from '../../../flow-diagram/flow-diagram.component';
import { RelatedQuestionsCardComponent } from '../../sub-components/related-questions-card/related-questions-card.component';
import { ConceptCardComponent } from '../../sub-components/concept-card/concept-card.component';
import { MemoryModelVisualizerComponent } from '../../sub-components/concept-visualizers/memory-model/memory-model-visualizer.component';
import { CollectionVisualizerComponent } from '../../sub-components/concept-visualizers/collection-visualizer/collection-visualizer.component';
import { AsyncTimelineComponent } from '../../sub-components/concept-visualizers/async-timeline/async-timeline.component';
import { GcVisualizerComponent } from '../../sub-components/concept-visualizers/gc-visualizer/gc-visualizer.component';
import { JwtVisualizerComponent } from '../../sub-components/concept-visualizers/jwt-visualizer/jwt-visualizer.component';
import { VennDiagramComponent } from '../../../../../features/interactive-lessons/components/venn-diagram/venn-diagram.component';

@Component({
  selector: 'app-theory-answer-sheet',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LucideAngularModule,
    StarRatingComponent,
    CodeBlockComponent,
    SectionHeaderComponent,
    MyNotesEditorComponent,
    InterviewFlowComponent,
    FlowDiagramComponent,
    RelatedQuestionsCardComponent,
    ConceptCardComponent,
    MemoryModelVisualizerComponent,
    CollectionVisualizerComponent,
    AsyncTimelineComponent,
    GcVisualizerComponent,
    JwtVisualizerComponent,
    VennDiagramComponent
  ],
  template: `
    @if (sheet) {
      <div class="bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-300 p-4 sm:p-6 lg:p-8 max-w-7xl 2xl:max-w-[1450px] w-full mx-auto font-sans">
        
        <!-- ── Compact Top Brand Header ───────────────────────────────────────────── -->
        <div class="bg-[#0A192F] text-white rounded-xl px-3.5 py-2.5 mb-3 flex items-center justify-between gap-3 shadow-md border border-slate-800">
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-7 h-7 rounded-md bg-amber-400 text-slate-950 flex items-center justify-center font-black flex-shrink-0 shadow-sm">
              <lucide-icon name="rocket" [size]="15" />
            </div>
            <div class="flex items-center gap-2 truncate">
              <h2 class="text-xs sm:text-sm font-black tracking-wide uppercase leading-none text-slate-100 truncate">.NET 75 CHALLENGE</h2>
              <span class="text-slate-600 text-xs font-mono hidden sm:inline">•</span>
              <span class="text-xs text-amber-400 font-semibold uppercase tracking-wider hidden sm:inline">Answer Sheet</span>
            </div>
          </div>

          <!-- Premium Custom Mastered Toggle Button -->
          <button
            type="button"
            (click)="toggleMastery()"
            class="group relative inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer select-none border flex-shrink-0"
            [class]="isMastered 
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400/50 shadow-md shadow-emerald-950/40 hover:from-emerald-500 hover:to-teal-500' 
              : 'bg-slate-800/90 text-slate-300 border-slate-700 hover:border-slate-500 hover:text-white hover:bg-slate-700/80'"
            [title]="isMastered ? 'Topic is Mastered (Click to undo)' : 'Click to Mark Topic as Mastered'"
          >
            <!-- Custom UI Checkbox Ring -->
            <div
              class="w-4 h-4 rounded-md flex items-center justify-center transition-all duration-200"
              [class]="isMastered ? 'bg-white text-emerald-700 shadow-inner' : 'border border-slate-500 bg-slate-900/60 group-hover:border-amber-400'"
            >
              @if (isMastered) {
                <lucide-icon name="check" [size]="12" strokeWidth="3" />
              }
            </div>
            <span>{{ isMastered ? 'Topic Mastered' : 'Mark as Mastered' }}</span>
          </button>
        </div>

        <!-- ── Metadata Header Table ─────────────────────────────────────── -->
        <div class="border border-slate-300 rounded-xl overflow-hidden mb-6 text-xs bg-slate-50/50">
          <div class="grid grid-cols-1 sm:grid-cols-12 divide-y sm:divide-y-0 sm:divide-x divide-slate-300 border-b border-slate-300">
            <div class="sm:col-span-6 p-2.5 bg-white">
              <span class="text-[10px] uppercase font-bold text-slate-400 block">Topic</span>
              <p class="font-bold text-slate-900 text-sm leading-tight mt-0.5">{{ sheet.topic }}</p>
            </div>
            <div class="sm:col-span-2 p-2.5 text-center bg-slate-50">
              <span class="text-[10px] uppercase font-bold text-slate-400 block">Competency ID</span>
              <span class="inline-block mt-0.5 px-2 py-0.5 bg-slate-900 text-amber-300 font-mono font-bold rounded text-xs">
                {{ sheet.competencyId }}
              </span>
            </div>
            <div class="sm:col-span-2 p-2.5 text-center bg-slate-50">
              <span class="text-[10px] uppercase font-bold text-slate-400 block">Day</span>
              <span class="font-bold text-slate-800 text-xs mt-0.5 block">{{ sheet.dayNumber }}</span>
            </div>
            <div class="sm:col-span-2 p-2.5 text-center bg-slate-50">
              <span class="text-[10px] uppercase font-bold text-slate-400 block">Date</span>
              <span class="font-semibold text-slate-700 text-xs mt-0.5 block">{{ sheet.date }}</span>
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-300 p-2 items-center bg-white">
            <div class="px-2">
              <span class="text-[10px] font-bold text-slate-400 uppercase block mb-1">Difficulty Level</span>
              <app-star-rating [rating]="sheet.difficulty" [readonly]="true" size="sm" />
            </div>
            <div class="px-2">
              <span class="text-[10px] font-bold text-slate-400 uppercase block mb-1">Importance (Interview)</span>
              <app-star-rating [rating]="sheet.importance" [readonly]="true" size="sm" />
            </div>
            <div class="px-2 text-center">
              <span class="text-[10px] font-bold text-slate-400 uppercase block">Time Taken</span>
              <span class="font-bold text-slate-800 text-xs">{{ sheet.timeTaken }}</span>
            </div>
            <div class="px-2 text-center">
              <span class="text-[10px] font-bold text-slate-400 uppercase block">Revision Date</span>
              <span class="font-mono text-xs text-slate-600">{{ sheet.revisionDate }}</span>
            </div>
          </div>
        </div>

        <!-- ── Interview Answer Speech Flow ─────────────────────────────── -->
        @if (sheet.interviewSpeechFlow) {
          <app-interview-flow [flow]="sheet.interviewSpeechFlow" />
        }

        <!-- ── Topic-Specific Interactive Visualizers ─────────────────────── -->
        @if (sheet.competencyId === 'C02') {
          <app-memory-model-visualizer />
        }

        @if (sheet.competencyId === 'C03') {
          <app-gc-visualizer />
        }

        @if (sheet.competencyId === 'C05') {
          <app-async-timeline />
        }

        @if (sheet.competencyId === 'C06') {
          <app-collection-visualizer />
        }

        @if (sheet.competencyId === 'A11' || sheet.competencyId === 'NG08') {
          <app-jwt-visualizer />
        }

        @if (showVennDiagram) {
          <div class="my-4">
            <app-answer-section-header title="Interactive SQL JOIN Visualizer" iconName="focus" />
            <app-venn-diagram />
          </div>
        }

        <!-- ── Main 2-Column Responsive Body ────────────────────────────── -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <!-- Left Column -->
          <div class="space-y-5">
            <!-- 1. Definition -->
            <section>
              <app-answer-section-header sectionNumber="1" title="Definition" iconName="book-open" />
              <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs leading-relaxed text-slate-700 font-medium">
                {{ sheet.definition }}
              </div>
            </section>

            <!-- 3. Key Concepts -->
            <section>
              <app-answer-section-header sectionNumber="3" title="Key Concepts" iconName="link" />
              <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                @for (concept of sheet.keyConcepts; track concept.title) {
                  <div>
                    <span class="font-bold text-slate-900">• {{ concept.title }}:</span>
                    <span class="text-slate-600 ml-1">{{ concept.description }}</span>
                    @if (concept.items?.length) {
                      <ul class="ml-5 mt-1 space-y-1 text-slate-600 list-disc">
                        @for (item of concept.items; track item) {
                          <li>{{ item }}</li>
                        }
                      </ul>
                    }
                  </div>
                }
              </div>
            </section>

            <!-- 5. Example Code -->
            <section>
              <app-answer-section-header sectionNumber="5" title="Example Implementation" iconName="code-2" />
              @for (exampleGroup of sheet.codeExamples; track exampleGroup.sectionTitle) {
                @for (snippet of exampleGroup.snippets; track snippet.code) {
                  <app-code-block [code]="snippet.code" [title]="snippet.title" language="csharp" />
                }
              }
            </section>

            <!-- 9. Real-World Use Case -->
            <section>
              <app-answer-section-header sectionNumber="9" title="Real-World Use Case" iconName="cpu" />
              <div class="p-3 bg-blue-50/60 border border-blue-200 rounded-xl text-xs text-slate-700 leading-relaxed">
                {{ sheet.realWorldUseCase }}
              </div>
            </section>
          </div>

          <!-- Right Column -->
          <div class="space-y-5">
            <!-- 2. Why It Matters -->
            <section>
              <app-answer-section-header sectionNumber="2" title="Why It Matters" iconName="lightbulb" />
              <div class="p-3 bg-amber-50/50 border border-amber-200/70 rounded-xl text-xs space-y-1.5 text-slate-700">
                @for (reason of sheet.whyItMatters; track reason) {
                  <div class="flex items-start gap-1.5">
                    <span class="text-amber-500 font-bold">•</span>
                    <span>{{ reason }}</span>
                  </div>
                }
              </div>
            </section>

            <!-- 4. How It Works (Diagram Flow) -->
            <section>
              <app-answer-section-header sectionNumber="4" title="How It Works (Behind the Scenes)" iconName="layers" />
              @if (sheet.howItWorks.flowNodes && sheet.howItWorks.flowNodes.length > 0) {
                <app-flow-diagram
                  [nodes]="sheet.howItWorks.flowNodes"
                  [direction]="sheet.howItWorks.diagramDirection || 'horizontal'"
                  [theme]="sheet.howItWorks.diagramTheme || 'blue'"
                />
              } @else {
                <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl my-2">
                  <!-- Responsive Flow Cards -->
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] font-sans font-bold">
                    <div class="p-2.5 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-900 text-center">
                      Client<br><span class="text-[9px] font-normal text-emerald-700">(Controller)</span>
                    </div>
                    <div class="p-2.5 rounded-lg bg-amber-100 border border-amber-300 text-amber-900 text-center">
                      DI Container<br><span class="text-[9px] font-normal text-amber-700">(IServiceProvider)</span>
                    </div>
                    <div class="p-2.5 rounded-lg bg-blue-100 border border-blue-300 text-blue-900 text-center">
                      Service<br><span class="text-[9px] font-normal text-blue-700">(Dependency)</span>
                    </div>
                  </div>
                </div>
              }

              <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl mt-3">
                <ol class="space-y-1.5 text-xs text-slate-600 font-sans">
                  @for (step of sheet.howItWorks.steps; track step.number) {
                    <li class="flex items-start gap-2">
                      <span class="font-bold text-slate-900 flex-shrink-0">{{ step.number }}.</span>
                      <span>{{ step.label }} - <span class="text-slate-500 text-[11px]">{{ step.sub }}</span></span>
                    </li>
                  }
                </ol>
              </div>
            </section>

            <!-- 6. Service Lifetimes (Conditional) -->
            @if (sheet.serviceLifetimes && sheet.serviceLifetimes.length > 0) {
              <section>
                <app-answer-section-header sectionNumber="6" title="Service Lifetimes" iconName="clock" />
                <div class="border border-slate-200 rounded-xl overflow-x-auto text-xs bg-white">
                  <table class="w-full text-left border-collapse min-w-[320px]">
                    <thead class="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th class="p-2">Lifetime</th>
                        <th class="p-2">Use When</th>
                        <th class="p-2">Example</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 bg-white">
                      @for (lt of sheet.serviceLifetimes; track lt.lifetime) {
                        <tr>
                          <td class="p-2 font-bold flex items-center gap-1.5 whitespace-nowrap">
                            <lucide-icon [name]="lt.icon" [size]="14" class="text-emerald-600" />
                            {{ lt.lifetime }}
                          </td>
                          <td class="p-2 text-slate-600 text-[11px]">{{ lt.useWhen }}</td>
                          <td class="p-2 font-mono text-[10px] text-slate-700 bg-slate-50 whitespace-nowrap">{{ lt.example }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </section>
            }

            <!-- 7. Best Practices -->
            <section>
              <app-answer-section-header sectionNumber="7" title="Best Practices" iconName="check-circle" theme="emerald" />
              <div class="p-3 bg-emerald-50/40 border border-emerald-200 rounded-xl text-xs space-y-1 text-slate-700">
                @for (bp of sheet.bestPractices; track bp) {
                  <div class="flex items-center gap-2">
                    <lucide-icon name="check" [size]="14" class="text-emerald-600 flex-shrink-0" />
                    <span>{{ bp }}</span>
                  </div>
                }
              </div>
            </section>

            <!-- 8. Common Interview Questions -->
            <section>
              <app-answer-section-header sectionNumber="8" title="Common Interview Questions" iconName="help-circle" />
              <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs text-slate-700 font-medium">
                @for (q of sheet.interviewQuestions; track q; let idx = $index) {
                  <p>{{ idx + 1 }}. {{ q }}</p>
                }
              </div>
            </section>

            <!-- 10. My Notes -->
            <section>
              <app-answer-section-header sectionNumber="10" title="My Notes" iconName="pencil" />
              <app-my-notes-editor
                [notes]="sheetService.activeMetadata().userNotes"
                (notesChange)="sheetService.updateNotes($event)"
              />
            </section>
          </div>
        </div>

        <!-- ── Related Question Bank Reference Card ─────────────────────── -->
        @if (sheet.relatedQuestions && sheet.relatedQuestions.length > 0) {
          <app-related-questions-card [questions]="sheet.relatedQuestions" />
        }

        <!-- ── Bottom Grid Summary ───────────────────────────────────────── -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-4 border-t border-slate-200">
          <!-- Quick Revision -->
          <div class="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs">
            <div class="flex items-center gap-1 text-amber-700 font-bold uppercase text-[10px] mb-1">
              <lucide-icon name="zap" [size]="13" />
              <span>Quick Revision (One-Liner)</span>
            </div>
            <p class="text-slate-700 font-medium leading-tight">{{ sheet.quickRevision }}</p>
          </div>

          <!-- Things to Remember -->
          <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div class="flex items-center gap-1 text-slate-700 font-bold uppercase text-[10px] mb-1">
              <lucide-icon name="target" [size]="13" />
              <span>Things to Remember</span>
            </div>
            <div class="space-y-1">
              @for (item of sheet.thingsToRemember; track item) {
                <div class="flex items-center gap-1.5 text-[11px] text-slate-600">
                  <input type="checkbox" class="rounded text-amber-500 focus:ring-amber-400" />
                  <span>{{ item }}</span>
                </div>
              }
            </div>
          </div>

          <!-- Confidence Level -->
          <div class="p-3 rounded-xl bg-blue-50/60 border border-blue-200 text-xs flex flex-col items-center justify-center text-center">
            <span class="text-[10px] uppercase font-bold text-blue-800 mb-1">Confidence Level (After Learning)</span>
            <app-star-rating
              [rating]="sheetService.activeMetadata().confidenceRating"
              (ratingChange)="sheetService.updateConfidence($event)"
              size="lg"
            />
          </div>
        </div>

        <!-- ── Quote Footer ──────────────────────────────────────────────── -->
        <div class="mt-6 bg-[#0A192F] text-slate-300 p-3 rounded-xl text-center text-xs font-serif italic shadow-inner">
          {{ sheet.quote }}
        </div>

      </div>
    }
  `
})
export class TheoryAnswerSheetComponent {
  @Input({ required: true }) sheet!: TheoryAnswerSheet;
  sheetService = inject(AnswerSheetService);
  progressService = inject(CompetencyProgressService);

  get showVennDiagram(): boolean {
    if (!this.sheet) return false;
    return this.sheet.competencyId === 'S01' || Boolean(this.sheet.topic && this.sheet.topic.toUpperCase().includes('JOIN'));
  }

  get isMastered(): boolean {
    return this.sheet ? this.progressService.isCompleted(this.sheet.competencyId) : false;
  }

  toggleMastery(): void {
    if (this.sheet) {
      this.progressService.toggleCompetency(this.sheet.competencyId);
    }
  }
}
