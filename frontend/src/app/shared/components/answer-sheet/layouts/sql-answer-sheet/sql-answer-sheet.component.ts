import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { SqlAnswerSheet } from '../../../../../core/models/answer-sheet.models';
import { AnswerSheetService } from '../../../../../core/services/answer-sheet.service';
import { StarRatingComponent } from '../../sub-components/star-rating/star-rating.component';
import { SectionHeaderComponent } from '../../sub-components/section-header/section-header.component';
import { SolutionCardComponent } from '../../sub-components/solution-card/solution-card.component';
import { LineByLineBreakdownComponent } from '../../sub-components/line-by-line-breakdown/line-by-line-breakdown.component';
import { RevisionTrackerComponent } from '../../sub-components/revision-tracker/revision-tracker.component';
import { MyNotesEditorComponent } from '../../sub-components/my-notes-editor/my-notes-editor.component';
import { CompetencyProgressService } from '../../../../../core/services/competency-progress.service';
import { InterviewFlowComponent } from '../../sub-components/interview-flow/interview-flow.component';
import { VennDiagramComponent } from '../../../../../features/interactive-lessons/components/venn-diagram/venn-diagram.component';
import { RelatedQuestionsCardComponent } from '../../sub-components/related-questions-card/related-questions-card.component';

@Component({
  selector: 'app-sql-answer-sheet',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LucideAngularModule,
    StarRatingComponent,
    SectionHeaderComponent,
    SolutionCardComponent,
    LineByLineBreakdownComponent,
    RevisionTrackerComponent,
    MyNotesEditorComponent,
    InterviewFlowComponent,
    VennDiagramComponent,
    RelatedQuestionsCardComponent
  ],
  template: `
    @if (sheet) {
      <div class="bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-300 p-4 sm:p-6 lg:p-8 max-w-7xl 2xl:max-w-[1450px] w-full mx-auto font-sans">
        
        <!-- ── Compact Top Brand Header ───────────────────────────────────────────── -->
        <div class="bg-[#0A192F] text-white rounded-xl px-3.5 py-2.5 mb-3 flex items-center justify-between gap-3 shadow-md border border-slate-800">
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-7 h-7 rounded-md bg-emerald-400 text-slate-950 flex items-center justify-center font-black flex-shrink-0 shadow-sm">
              <lucide-icon name="database" [size]="15" />
            </div>
            <div class="flex items-center gap-2 truncate">
              <h2 class="text-xs sm:text-sm font-black tracking-wide uppercase leading-none text-slate-100 truncate">.NET 75 CHALLENGE</h2>
              <span class="text-slate-600 text-xs font-mono hidden sm:inline">•</span>
              <span class="text-xs text-amber-400 font-semibold uppercase tracking-wider hidden sm:inline">SQL Coding Sheet</span>
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

        <!-- ── Top Metadata Table ────────────────────────────────────────── -->
        <div class="border border-slate-300 rounded-xl overflow-hidden mb-6 text-xs bg-slate-50">
          <div class="grid grid-cols-2 sm:grid-cols-12 divide-x divide-slate-300 border-b border-slate-300">
            <div class="sm:col-span-2 p-2.5 bg-white text-center">
              <span class="text-[10px] uppercase font-bold text-slate-400 block">Question ID</span>
              <span class="inline-block mt-0.5 px-2 py-0.5 bg-purple-900 text-purple-200 font-mono font-bold rounded text-xs">
                {{ sheet.questionId }}
              </span>
            </div>
            <div class="sm:col-span-3 p-2.5 bg-white">
              <span class="text-[10px] uppercase font-bold text-slate-400 block">Difficulty</span>
              <app-star-rating [rating]="sheet.difficulty" [readonly]="true" size="sm" />
            </div>
            <div class="sm:col-span-3 p-2.5 bg-white">
              <span class="text-[10px] uppercase font-bold text-slate-400 block">Topic</span>
              <span class="font-bold text-slate-900 text-xs">{{ sheet.topic }}</span>
            </div>
            <div class="sm:col-span-2 p-2.5 text-center bg-white">
              <span class="text-[10px] uppercase font-bold text-slate-400 block">Asked In</span>
              <div class="flex gap-1 flex-wrap justify-center mt-0.5">
                @for (company of sheet.askedIn; track company) {
                  <span class="text-[9px] bg-slate-100 border border-slate-200 text-slate-700 font-medium px-1 rounded">{{ company }}</span>
                }
              </div>
            </div>
            <div class="sm:col-span-2 p-2.5 text-center bg-white">
              <span class="text-[10px] uppercase font-bold text-slate-400 block">Date Solved</span>
              <span class="font-mono text-xs text-slate-600">{{ sheet.dateSolved }}</span>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-12 divide-y sm:divide-y-0 sm:divide-x divide-slate-300 p-2 items-center bg-white">
            <div class="sm:col-span-6 px-2">
              <span class="text-[10px] font-bold text-slate-400 uppercase block mb-1">SQL Concepts</span>
              <div class="flex gap-1 flex-wrap">
                @for (concept of sheet.sqlConcepts; track concept) {
                  <span class="text-[10px] font-mono bg-blue-50 text-blue-800 border border-blue-200 px-1.5 py-0.5 rounded font-semibold">{{ concept }}</span>
                }
              </div>
            </div>
            <div class="sm:col-span-4 px-2">
              <span class="text-[10px] font-bold text-slate-400 uppercase block mb-1">Database Engine</span>
              <span class="font-mono text-xs font-semibold text-slate-800">{{ sheet.database }}</span>
            </div>
            <div class="sm:col-span-2 px-2 text-center">
              <span class="text-[10px] font-bold text-slate-400 uppercase block mb-1">Time Taken</span>
              <span class="font-bold text-slate-800 text-xs">{{ sheet.timeTaken }}</span>
            </div>
          </div>
        </div>

        <!-- ── LeetCode Link Card ────────────────────────────────────── -->
        @if (sheet.leetCodeUrl) {
          <div class="my-4 p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-400/60 flex items-center justify-between gap-3 shadow-2xs">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center font-black text-sm shadow-sm flex-shrink-0">
                #{{ sheet.leetCodeNumber || 'SQL' }}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider">LeetCode Problem #{{ sheet.leetCodeNumber }}</h3>
                  @if (sheet.leetCodeDifficulty) {
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-300">
                      {{ sheet.leetCodeDifficulty }}
                    </span>
                  }
                </div>
                <p class="text-[11px] text-slate-600 font-medium mt-0.5">
                  Practice this exact problem on LeetCode online judge.
                </p>
              </div>
            </div>

            <a
              [href]="sheet.leetCodeUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 flex-shrink-0 shadow-sm"
            >
              <span>Solve on LeetCode</span>
              <lucide-icon name="external-link" [size]="12" />
            </a>
          </div>
        }

        <!-- ── Interview Answer Speech Flow ─────────────────────────────── -->
        @if (sheet.interviewSpeechFlow) {
          <app-interview-flow [flow]="sheet.interviewSpeechFlow" />
        }

        <!-- ── Interactive SQL JOIN Venn Visualizer ────────────────── -->
        @if (showVennDiagram) {
          <div class="mb-6">
            <app-answer-section-header title="Interactive SQL JOIN Visualizer" iconName="focus" />
            <app-venn-diagram />
          </div>
        }

        <!-- ── Problem & Structure 2-Column Grid ────────────────────────── -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          
          <!-- 1. Problem Statement -->
          <div>
            <app-answer-section-header sectionNumber="1" title="Problem Statement" iconName="file-text" />
            <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-3">
              <p class="text-slate-700 leading-relaxed font-medium">{{ sheet.problemStatement.description }}</p>
              
              <!-- Example Output Table -->
              <div>
                <span class="font-bold text-blue-900 text-[11px] block mb-1">Example Output:</span>
                <div class="border border-slate-200 rounded-lg overflow-hidden bg-white">
                  <table class="w-full text-left border-collapse text-[11px]">
                    <thead class="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                      <tr>
                        @for (h of sheet.problemStatement.exampleOutput.headers; track h) {
                          <th class="p-1.5 font-mono">{{ h }}</th>
                        }
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                      @for (row of sheet.problemStatement.exampleOutput.rows; track $index) {
                        <tr>
                          @for (cell of row; track $index) {
                            <td class="p-1.5 text-slate-700">{{ cell }}</td>
                          }
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- 2. Table Structure -->
          <div>
            <app-answer-section-header sectionNumber="2" title="Table Structure" iconName="layers" />
            <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
              <span class="font-bold text-indigo-900 font-mono text-[11px] block">{{ sheet.tableStructure.tableName }} Table</span>
              
              <div class="border border-slate-200 rounded-lg overflow-hidden bg-white">
                <table class="w-full text-left border-collapse text-[10px]">
                  <thead class="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                    <tr>
                      <th class="p-1.5">Column Name</th>
                      <th class="p-1.5">Data Type</th>
                      <th class="p-1.5">Constraints</th>
                      <th class="p-1.5">Description</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    @for (col of sheet.tableStructure.columns; track col.name) {
                      <tr>
                        <td class="p-1.5 font-mono font-semibold text-slate-800">{{ col.name }}</td>
                        <td class="p-1.5 font-mono text-purple-700">{{ col.type }}</td>
                        <td class="p-1.5"><span class="px-1 bg-amber-100 text-amber-800 rounded font-bold">{{ col.constraints }}</span></td>
                        <td class="p-1.5 text-slate-600">{{ col.description }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              @if (sheet.tableStructure.relationships) {
                <p class="text-[10px] text-slate-500 font-mono italic">Relationships: {{ sheet.tableStructure.relationships }}</p>
              }
            </div>
          </div>
        </div>

        <!-- ── Sample Data & Approach 2-Column Grid ────────────────────── -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <!-- 3. Sample Input Data -->
          <div>
            <app-answer-section-header sectionNumber="3" title="Sample Input Data" iconName="database" />
            <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <div class="border border-slate-200 rounded-lg overflow-hidden bg-white max-h-48 overflow-y-auto">
                <table class="w-full text-left border-collapse text-[10px]">
                  <thead class="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold sticky top-0">
                    <tr>
                      @for (h of sheet.sampleData.headers; track h) {
                        <th class="p-1.5 font-mono">{{ h }}</th>
                      }
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    @for (row of sheet.sampleData.rows; track $index) {
                      <tr class="hover:bg-slate-50">
                        @for (cell of row; track $index) {
                          <td class="p-1.5 text-slate-700 font-mono">{{ cell }}</td>
                        }
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- 4. Approach / Thought Process -->
          <div>
            <app-answer-section-header sectionNumber="4" title="Approach / Thought Process" iconName="lightbulb" theme="amber" />
            <div class="p-3 bg-amber-50/50 border border-amber-200 rounded-xl text-xs space-y-2">
              <ol class="space-y-1.5 text-slate-700 list-decimal list-inside font-medium">
                @for (pt of sheet.approach.points; track pt) {
                  <li>{{ pt }}</li>
                }
              </ol>
            </div>
          </div>
        </div>

        <!-- ── 3 Solutions Comparison Cards ────────────────────────────── -->
        <div class="mb-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- 5. Brute Force -->
            <app-solution-card
              [sectionNumber]="5"
              [title]="sheet.solutions.bruteForce.title"
              type="brute-force"
              [approachTitle]="sheet.solutions.bruteForce.approachTitle"
              [code]="sheet.solutions.bruteForce.code"
              [pros]="sheet.solutions.bruteForce.pros"
              [cons]="sheet.solutions.bruteForce.cons"
            />

            <!-- 6. Optimal Solution (Recommended) -->
            <app-solution-card
              [sectionNumber]="6"
              [title]="sheet.solutions.optimal.title"
              type="optimal"
              [approachTitle]="sheet.solutions.optimal.approachTitle"
              [code]="sheet.solutions.optimal.code"
              [whyOptimal]="sheet.solutions.optimal.whyOptimal"
            />

            <!-- 7. Alternate Solution -->
            <app-solution-card
              [sectionNumber]="7"
              [title]="sheet.solutions.alternate.title"
              type="alternate"
              [approachTitle]="sheet.solutions.alternate.approachTitle"
              [code]="sheet.solutions.alternate.code"
              [notes]="sheet.solutions.alternate.notes"
            />
          </div>
        </div>

        <!-- ── 8. Explanation (Line by Line) ────────────────────────────── -->
        <div class="mb-6">
          <app-answer-section-header sectionNumber="8" title="Explanation (Line by Line) - Optimal Solution" iconName="code-2" />
          <app-line-by-line-breakdown [explanationList]="sheet.lineByLineExplanation" />
        </div>

        <!-- ── Bottom Multi-Column Summary Grid ──────────────────────────── -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <!-- 9. Time Complexity -->
          <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            <div class="flex items-center gap-1 font-bold text-slate-800 text-[11px] mb-1 uppercase">
              <lucide-icon name="clock" [size]="13" class="text-blue-600" />
              <span>9. Complexity</span>
            </div>
            <p class="font-mono text-[11px] font-bold text-purple-800">Time: {{ sheet.timeComplexity.time }}</p>
            <p class="font-mono text-[11px] font-bold text-purple-800">Space: {{ sheet.timeComplexity.space }}</p>
            <p class="text-[10px] text-slate-500 mt-1">{{ sheet.timeComplexity.description }}</p>
          </div>

          <!-- 10. Follow-up Questions -->
          <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            <div class="flex items-center gap-1 font-bold text-slate-800 text-[11px] mb-1 uppercase">
              <lucide-icon name="help-circle" [size]="13" class="text-amber-600" />
              <span>10. Follow-up</span>
            </div>
            <ol class="list-decimal list-inside text-[10px] text-slate-600 space-y-0.5 font-medium">
              @for (fq of sheet.followUpQuestions.slice(0, 2); track fq) {
                <li class="truncate" [title]="fq">{{ fq }}</li>
              }
            </ol>
          </div>

          <!-- 11. Real World Variation -->
          <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            <div class="flex items-center gap-1 font-bold text-slate-800 text-[11px] mb-1 uppercase">
              <lucide-icon name="sparkles" [size]="13" class="text-emerald-600" />
              <span>11. Real Variation</span>
            </div>
            <p class="text-[10px] text-slate-600 leading-tight">{{ sheet.realWorldVariation.description }}</p>
          </div>

          <!-- 12. Key Takeaways -->
          <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            <div class="flex items-center gap-1 font-bold text-slate-800 text-[11px] mb-1 uppercase">
              <lucide-icon name="target" [size]="13" class="text-rose-600" />
              <span>12. Key Takeaways</span>
            </div>
            <div class="space-y-0.5">
              @for (kt of sheet.keyTakeaways.slice(0, 2); track kt) {
                <div class="flex items-start gap-1 text-[10px] text-slate-700">
                  <lucide-icon name="check" [size]="11" class="text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span class="truncate" [title]="kt">{{ kt }}</span>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- ── 13. Interactive Notes, Confidence & Revision Dates Grid ────── -->
        <div class="grid grid-cols-1 sm:grid-cols-12 gap-4 pt-4 border-t border-slate-200">
          <div class="sm:col-span-6">
            <app-answer-section-header sectionNumber="13" title="My Notes" iconName="pencil" />
            <app-my-notes-editor
              [notes]="sheetService.activeMetadata().userNotes"
              (notesChange)="sheetService.updateNotes($event)"
            />
          </div>

          <div class="sm:col-span-3 p-3 bg-blue-50/60 border border-blue-200 rounded-xl flex flex-col items-center justify-center text-center">
            <span class="text-[10px] uppercase font-bold text-blue-800 mb-2 block">Confidence Level</span>
            <app-star-rating
              [rating]="sheetService.activeMetadata().confidenceRating"
              (ratingChange)="sheetService.updateConfidence($event)"
              size="md"
            />
          </div>

          <div class="sm:col-span-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span class="text-[10px] uppercase font-bold text-slate-700 mb-1.5 block">Revision Date</span>
            <app-revision-tracker
              [reviews]="sheetService.activeMetadata().reviews"
              (reviewToggle)="sheetService.toggleReview($event)"
            />
          </div>
        </div>

        <!-- ── Related Question Bank Reference Card ─────────────────────── -->
        @if (sheet.relatedQuestions && sheet.relatedQuestions.length > 0) {
          <app-related-questions-card [questions]="sheet.relatedQuestions" />
        }

        <!-- ── Quote Footer ──────────────────────────────────────────────── -->
        <div class="mt-6 bg-[#0A192F] text-slate-300 p-3 rounded-xl flex items-center justify-between text-xs shadow-inner">
          <span class="uppercase tracking-widest text-[9px] font-bold text-amber-400">PRACTICE. ANALYZE. IMPROVE. REPEAT.</span>
          <span class="font-serif italic text-slate-300 text-[11px]">{{ sheet.quote }}</span>
        </div>

      </div>
    }
  `
})
export class SqlAnswerSheetComponent {
  @Input({ required: true }) sheet!: SqlAnswerSheet;
  sheetService = inject(AnswerSheetService);
  progressService = inject(CompetencyProgressService);

  get showVennDiagram(): boolean {
    if (!this.sheet || !this.sheet.sqlConcepts) return false;
    return this.sheet.sqlConcepts.some(c => c.toUpperCase().includes('JOIN'));
  }

  get isMastered(): boolean {
    return this.sheet ? this.progressService.isCompleted(this.sheet.questionId) : false;
  }

  toggleMastery(): void {
    if (this.sheet) {
      this.progressService.toggleCompetency(this.sheet.questionId);
    }
  }
}
