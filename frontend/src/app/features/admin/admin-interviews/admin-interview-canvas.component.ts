import { Component, ChangeDetectionStrategy, inject, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { AdminInterviewStore } from '../../../core/state/admin-interview.store';
import { Company, Interview, Round, Question } from '../../../core/models/admin-interview.models';

@Component({
  selector: 'app-admin-interview-canvas',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    @keyframes slideInRight {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .animate-slide-in-right {
      animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in { animation: fadeIn 0.25s ease-out forwards; }
  `],
  template: `
    <div class="h-full flex flex-col bg-slate-50 overflow-hidden">
      
      <!-- ── Header ── -->
      <div class="flex-shrink-0 px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <a routerLink="/admin/interviews" class="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">
            <lucide-icon name="arrow-left" [size]="20"></lucide-icon>
          </a>
          <div class="h-6 w-px bg-slate-200"></div>
          <div>
            @if (isNewMode()) {
              <h1 class="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                <lucide-icon name="plus" [size]="18" class="text-emerald-600"></lucide-icon>
                Create New Company
              </h1>
            } @else {
              <h1 class="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                <lucide-icon name="building-2" [size]="18" class="text-indigo-600"></lucide-icon>
                {{ store.activeCompany()?.name || 'Loading Company...' }}
              </h1>
            }
          </div>
        </div>
        @if (!isNewMode()) {
          <div class="flex items-center gap-3">
            <button (click)="handleAddContextAction()"
                    class="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1">
              <lucide-icon name="plus" [size]="16"></lucide-icon>
              {{ addContextLabel() }}
            </button>
          </div>
        }
      </div>

      <!-- ── Content Area ── -->
      @if (isNewMode()) {
        <!-- ═══ CREATE COMPANY FORM ═══ -->
        <div class="flex-1 overflow-y-auto scrollbar-premium p-8">
          <div class="max-w-2xl mx-auto">
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 animate-fade-in">
              <div class="flex items-center gap-3 mb-8">
                <div class="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <lucide-icon name="building-2" [size]="24" class="text-emerald-600"></lucide-icon>
                </div>
                <div>
                  <h2 class="text-2xl font-bold text-slate-800">New Company</h2>
                  <p class="text-sm text-slate-500">Enter the company details to begin tracking interviews.</p>
                </div>
              </div>

              <div class="space-y-5">
                <div>
                  <label for="new-company-name" class="block text-sm font-bold text-slate-700 mb-1.5">Company Name <span class="text-rose-500">*</span></label>
                  <input id="new-company-name" type="text" [(ngModel)]="newCompanyName"
                         placeholder="e.g., Google, Amazon, Stripe"
                         class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm">
                </div>
                <div>
                  <label for="new-company-industry" class="block text-sm font-bold text-slate-700 mb-1.5">Industry <span class="text-rose-500">*</span></label>
                  <input id="new-company-industry" type="text" [(ngModel)]="newCompanyIndustry"
                         placeholder="e.g., Search, E-commerce, Fintech"
                         class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm">
                </div>
                <div>
                  <label class="block text-sm font-bold text-slate-700 mb-2">Theme Color</label>
                  <div class="flex flex-wrap gap-3">
                    @for (gradient of logoGradients; track gradient.value) {
                      <button (click)="newCompanyLogo = gradient.value"
                              class="w-10 h-10 rounded-lg shadow-sm border-2 transition-all"
                              [class]="gradient.value"
                              [class.border-indigo-600]="newCompanyLogo === gradient.value"
                              [class.ring-2]="newCompanyLogo === gradient.value"
                              [class.ring-indigo-300]="newCompanyLogo === gradient.value"
                              [class.border-transparent]="newCompanyLogo !== gradient.value">
                      </button>
                    }
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
                <a routerLink="/admin/interviews"
                   class="px-5 py-2.5 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors text-sm">
                  Cancel
                </a>
                <button (click)="createCompany()"
                        [disabled]="!newCompanyName.trim() || !newCompanyIndustry.trim()"
                        class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-sm transition-colors text-sm flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1">
                  <lucide-icon name="plus" [size]="16"></lucide-icon>
                  Create Company
                </button>
              </div>
            </div>
          </div>
        </div>
      } @else {
        <!-- ═══ SPLIT SCREEN LAYOUT ═══ -->
        <div class="flex-1 flex overflow-hidden">
          
          <!-- ── Left: Tree Navigator (Sidebar) ── -->
          <div class="w-72 border-r border-slate-200 bg-white flex flex-col h-full overflow-y-auto scrollbar-premium">
            <div class="p-4 space-y-1">
              
              <!-- Level 1: Company (Root) -->
              <button (click)="selectNode('company')" 
                      class="w-full text-left flex items-center gap-2 p-2 rounded-lg font-medium text-sm transition-colors"
                      [class.bg-indigo-50]="selectedNodeType() === 'company'"
                      [class.text-indigo-700]="selectedNodeType() === 'company'"
                      [class.hover:bg-slate-50]="selectedNodeType() !== 'company'">
                <lucide-icon name="building" [size]="16" class="text-slate-400" [class.text-indigo-500]="selectedNodeType() === 'company'"></lucide-icon>
                {{ store.activeCompany()?.name }}
              </button>

              <!-- Level 2: Interviews (Roles) -->
              @for (interview of store.companyInterviews(); track interview.id) {
                <div class="ml-4 mt-1">
                  <button (click)="store.selectInterview(interview); selectNode('interview')"
                          class="w-full text-left flex items-center gap-2 p-2 rounded-lg font-medium text-sm transition-colors border-l border-slate-200"
                          [class.bg-indigo-50]="store.activeInterview()?.id === interview.id && selectedNodeType() === 'interview'"
                          [class.text-indigo-700]="store.activeInterview()?.id === interview.id && selectedNodeType() === 'interview'"
                          [class.hover:bg-slate-50]="!(store.activeInterview()?.id === interview.id && selectedNodeType() === 'interview')">
                    <lucide-icon name="circle-user" [size]="14" class="text-slate-400" [class.text-indigo-500]="store.activeInterview()?.id === interview.id"></lucide-icon>
                    <span class="truncate">{{ interview.roleName }}</span>
                  </button>

                  <!-- Level 3: Rounds -->
                  @if (store.activeInterview()?.id === interview.id) {
                    @for (round of store.interviewRounds(); track round.id) {
                      <div class="ml-4 mt-1">
                        <button (click)="store.selectRound(round); selectNode('round')"
                                class="w-full text-left flex items-center gap-2 p-2 rounded-lg font-medium text-sm transition-colors border-l border-slate-200"
                                [class.bg-indigo-50]="store.activeRound()?.id === round.id && selectedNodeType() === 'round'"
                                [class.text-indigo-700]="store.activeRound()?.id === round.id && selectedNodeType() === 'round'"
                                [class.hover:bg-slate-50]="!(store.activeRound()?.id === round.id && selectedNodeType() === 'round')">
                          <lucide-icon name="git-commit" [size]="14" class="text-slate-400" [class.text-indigo-500]="store.activeRound()?.id === round.id"></lucide-icon>
                          <span class="truncate">Round {{ round.roundNumber }}: {{ round.focusArea }}</span>
                        </button>

                        <!-- Level 4: Questions -->
                        @if (store.activeRound()?.id === round.id) {
                          @for (q of store.roundQuestions(); track q.id) {
                            <div class="ml-4 mt-1">
                              <button (click)="store.selectQuestion(q); selectNode('question')"
                                      class="w-full text-left flex items-center gap-2 p-2 rounded-lg text-xs font-medium transition-colors border-l border-slate-200"
                                      [class.bg-indigo-50]="store.activeQuestion()?.id === q.id"
                                      [class.text-indigo-700]="store.activeQuestion()?.id === q.id"
                                      [class.text-slate-500]="store.activeQuestion()?.id !== q.id"
                                      [class.hover:bg-slate-50]="store.activeQuestion()?.id !== q.id">
                                <lucide-icon name="file-question" [size]="12" class="text-slate-300" [class.text-indigo-400]="store.activeQuestion()?.id === q.id"></lucide-icon>
                                <span class="truncate">{{ q.title }}</span>
                              </button>
                            </div>
                          }
                        }
                      </div>
                    }
                  }
                </div>
              }
            </div>
          </div>

          <!-- ── Center Canvas (Work Area) ── -->
          <div class="flex-1 bg-slate-50 overflow-y-auto scrollbar-premium p-8">
            <div class="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              
              <!-- State: Company Selected -->
              @if (selectedNodeType() === 'company') {
                <div class="animate-fade-in">
                  <h2 class="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <lucide-icon name="building" [size]="24" class="text-slate-400"></lucide-icon>
                    Edit Company Details
                  </h2>
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-bold text-slate-700 mb-1">Company Name</label>
                      <input type="text" [value]="store.activeCompany()?.name" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all">
                    </div>
                    <div>
                      <label class="block text-sm font-bold text-slate-700 mb-1">Industry</label>
                      <input type="text" [value]="store.activeCompany()?.industry" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all">
                    </div>
                  </div>
                </div>
              }

              <!-- State: Interview (Role) Selected -->
              @if (selectedNodeType() === 'interview') {
                <div class="animate-fade-in">
                  <h2 class="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <lucide-icon name="circle-user" [size]="24" class="text-slate-400"></lucide-icon>
                    Edit Role Pipeline
                  </h2>
                  <div class="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label class="block text-sm font-bold text-slate-700 mb-1">Role Name</label>
                      <input type="text" [value]="store.activeInterview()?.roleName" class="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none">
                    </div>
                    <div>
                      <label class="block text-sm font-bold text-slate-700 mb-1">Level / Tier</label>
                      <input type="text" [value]="store.activeInterview()?.level" class="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none">
                    </div>
                  </div>
                </div>
              }

              <!-- State: Round Selected -->
              @if (selectedNodeType() === 'round') {
                <div class="animate-fade-in">
                  <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
                      <lucide-icon name="git-commit" [size]="24" class="text-slate-400"></lucide-icon>
                      Round {{ store.activeRound()?.roundNumber }} configuration
                    </h2>
                    <button class="text-sm font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                      Reorder Questions
                    </button>
                  </div>
                  
                  <div>
                      <label class="block text-sm font-bold text-slate-700 mb-1">Focus Area</label>
                      <input type="text" [value]="store.activeRound()?.focusArea" class="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none mb-6">
                  </div>

                  <!-- ── Action Buttons: Add Question + Bulk Import ── -->
                  <div class="flex items-center gap-3 mb-6">
                    <button (click)="openAddQuestionSlideover()"
                            class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1">
                      <lucide-icon name="plus" [size]="16"></lucide-icon>
                      Add Question
                    </button>
                    <button (click)="openBulkImportSlideover()"
                            class="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300">
                      <lucide-icon name="upload-cloud" [size]="16"></lucide-icon>
                      Bulk Import
                    </button>
                  </div>

                  <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4">Questions in this round</h3>
                  
                  <!-- Question List -->
                  <div class="space-y-2">
                    @for (q of store.roundQuestions(); track q.id) {
                      <div class="flex items-center gap-4 bg-white border border-slate-200 p-3 rounded-xl shadow-sm hover:border-indigo-300 transition-colors cursor-move group">
                        <lucide-icon name="grip-vertical" [size]="16" class="text-slate-300 group-hover:text-slate-500"></lucide-icon>
                        <div class="flex-1">
                          <p class="font-bold text-slate-800 text-sm">{{ q.title }}</p>
                          <p class="text-xs text-slate-500">{{ q.category }} &bull; {{ q.difficulty }}</p>
                        </div>
                        <span class="px-2 py-0.5 rounded-full text-xs font-semibold"
                              [class.bg-emerald-50]="q.difficulty === 'Easy'"
                              [class.text-emerald-700]="q.difficulty === 'Easy'"
                              [class.bg-amber-50]="q.difficulty === 'Medium'"
                              [class.text-amber-700]="q.difficulty === 'Medium'"
                              [class.bg-rose-50]="q.difficulty === 'Hard'"
                              [class.text-rose-700]="q.difficulty === 'Hard'">
                          {{ q.difficulty }}
                        </span>
                        <button class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors">
                          <lucide-icon name="trash-2" [size]="16"></lucide-icon>
                        </button>
                      </div>
                    } @empty {
                      <div class="text-center py-8">
                        <div class="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <lucide-icon name="file-question" [size]="24" class="text-slate-400"></lucide-icon>
                        </div>
                        <p class="text-slate-500 text-sm font-medium mb-1">No questions yet</p>
                        <p class="text-slate-400 text-xs">Click "Add Question" or "Bulk Import" to get started.</p>
                      </div>
                    }
                  </div>
                </div>
              }

              <!-- State: Question Selected -->
              @if (selectedNodeType() === 'question') {
                <div class="animate-fade-in text-center py-12">
                  <div class="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <lucide-icon name="pencil-ruler" [size]="28" class="text-indigo-600"></lucide-icon>
                  </div>
                  <h3 class="text-xl font-bold text-slate-800 mb-2">Immersive Solution Editor</h3>
                  <p class="text-slate-500 max-w-sm mx-auto mb-6">
                    Editing a question's solution markdown requires the full-screen immersive editor.
                  </p>
                  <button (click)="openImmersiveEditor()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-sm transition-colors">
                    Open Immersive Editor
                  </button>
                </div>
              }

            </div>
          </div>

        </div>
      }

      <!-- ═══ ADD QUESTION SLIDE-OVER ═══ -->
      @if (showAddSlideover()) {
        <div class="fixed inset-0 z-50 overflow-hidden">
          <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" (click)="closeAddSlideover()"></div>
          
          <div class="absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-level-3 animate-slide-in-right border-l border-slate-200 flex flex-col">
            
            <!-- Slide-over Header -->
            <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 class="text-lg font-bold text-slate-800">Add New Question</h3>
              <button (click)="closeAddSlideover()" class="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors">
                <lucide-icon name="x" [size]="20"></lucide-icon>
              </button>
            </div>

            <!-- Slide-over Body -->
            <div class="flex-1 p-6 overflow-y-auto">
              <div class="space-y-5">
                <div>
                  <label for="q-title" class="block text-sm font-bold text-slate-700 mb-1.5">Question Title <span class="text-rose-500">*</span></label>
                  <input id="q-title" type="text" [(ngModel)]="newQuestionTitle"
                         placeholder="e.g., Explain Virtual DOM"
                         class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm">
                </div>
                
                <div>
                  <label for="q-difficulty" class="block text-sm font-bold text-slate-700 mb-1.5">Difficulty</label>
                  <select id="q-difficulty" [(ngModel)]="newQuestionDifficulty"
                          class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none bg-white text-sm">
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label for="q-category" class="block text-sm font-bold text-slate-700 mb-1.5">Category</label>
                  <input id="q-category" type="text" [(ngModel)]="newQuestionCategory"
                         placeholder="e.g., React, System Design, DSA"
                         class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm">
                </div>
              </div>
            </div>

            <!-- Slide-over Footer -->
            <div class="p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
              <button (click)="closeAddSlideover()" class="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors text-sm">Cancel</button>
              <button (click)="saveQuestion()"
                      [disabled]="!newQuestionTitle.trim()"
                      class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-sm transition-colors text-sm flex items-center gap-2">
                <lucide-icon name="plus" [size]="14"></lucide-icon>
                Save Question
              </button>
            </div>
          </div>
        </div>
      }

      <!-- ═══ BULK IMPORT SLIDE-OVER ═══ -->
      @if (showBulkImport()) {
        <div class="fixed inset-0 z-50 overflow-hidden">
          <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" (click)="closeBulkImport()"></div>
          
          <div class="absolute inset-y-0 right-0 w-full max-w-lg bg-white shadow-level-3 animate-slide-in-right border-l border-slate-200 flex flex-col">

            <!-- Slide-over Header -->
            <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 class="text-lg font-bold text-slate-800">Bulk Import Questions</h3>
                <p class="text-xs text-slate-500 mt-0.5">Upload .xlsx, .csv, or .json to import questions into this round.</p>
              </div>
              <button (click)="closeBulkImport()" class="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors">
                <lucide-icon name="x" [size]="20"></lucide-icon>
              </button>
            </div>

            <!-- Slide-over Body -->
            <div class="flex-1 p-6 overflow-y-auto space-y-5">

              <!-- Drop Zone (DRY: reuses admin-import UX) -->
              <div
                id="bulk-import-drop-zone"
                class="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200"
                [class.border-slate-300]="!bulkDragging() && !bulkFile()"
                [class.bg-slate-50]="!bulkDragging() && !bulkFile()"
                [class.hover:border-indigo-400]="!bulkDragging() && !bulkFile()"
                [class.hover:bg-indigo-50]="!bulkDragging() && !bulkFile()"
                [class.border-indigo-500]="bulkDragging()"
                [class.bg-indigo-50]="bulkDragging()"
                [class.border-emerald-400]="!!bulkFile()"
                [class.bg-emerald-50]="!!bulkFile()"
                (dragover)="onBulkDragOver($event)"
                (dragleave)="bulkDragging.set(false)"
                (drop)="onBulkDrop($event)"
                (click)="bulkFileInput.click()"
                role="button"
                aria-label="Upload file">
                <input
                  #bulkFileInput
                  id="bulk-import-file-input"
                  type="file"
                  accept=".xlsx,.xls,.json,.csv"
                  class="hidden"
                  (change)="onBulkFileChange($event)" />

                @if (bulkFile()) {
                  <div class="flex flex-col items-center gap-3">
                    <div class="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                      <lucide-icon name="file-check" [size]="24" class="text-emerald-600"></lucide-icon>
                    </div>
                    <div>
                      <p class="text-sm font-semibold text-slate-800">{{ bulkFile()!.name }}</p>
                      <p class="text-xs text-slate-500 mt-0.5">{{ formatFileSize(bulkFile()!.size) }} · Click or drag to replace</p>
                    </div>
                  </div>
                } @else if (bulkDragging()) {
                  <div class="flex flex-col items-center gap-3">
                    <lucide-icon name="upload-cloud" [size]="40" class="text-indigo-600"></lucide-icon>
                    <p class="text-sm font-semibold text-indigo-600">Drop it here!</p>
                  </div>
                } @else {
                  <div class="flex flex-col items-center gap-3">
                    <lucide-icon name="upload-cloud" [size]="40" class="text-slate-400"></lucide-icon>
                    <div>
                      <p class="text-sm text-slate-700">
                        <span class="font-semibold text-indigo-600">Click to upload</span> or drag & drop
                      </p>
                      <p class="text-xs text-slate-500 mt-1">.xlsx &nbsp;·&nbsp; .csv &nbsp;·&nbsp; .json</p>
                    </div>
                  </div>
                }
              </div>

              <!-- Import Progress -->
              @if (bulkImporting()) {
                <div class="bg-white border border-slate-200 rounded-xl p-4">
                  <div class="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span class="flex items-center gap-2">
                      <lucide-icon name="loader-2" [size]="14" class="animate-spin text-indigo-600"></lucide-icon>
                      Processing file…
                    </span>
                  </div>
                  <div class="h-2 bg-slate-100 border border-slate-200 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full animate-pulse" style="width:70%"></div>
                  </div>
                </div>
              }

              <!-- Import Result -->
              @if (bulkResult()) {
                <div class="bg-white rounded-xl border p-4"
                     [class.border-emerald-200]="bulkResult()!.errors.length === 0"
                     [class.border-l-4]="true"
                     [class.border-l-emerald-500]="bulkResult()!.errors.length === 0"
                     [class.border-l-rose-500]="bulkResult()!.errors.length > 0">
                  <div class="flex flex-wrap items-center gap-3 mb-2">
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ✓ {{ bulkResult()!.imported }} imported
                    </span>
                    @if (bulkResult()!.skipped) {
                      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        ⚠ {{ bulkResult()!.skipped }} skipped
                      </span>
                    }
                  </div>
                  @if (bulkResult()!.errors.length) {
                    <div class="space-y-1 mt-2">
                      @for (e of bulkResult()!.errors; track $index) {
                        <p class="text-xs text-rose-600">✗ {{ e }}</p>
                      }
                    </div>
                  }
                </div>
              }
            </div>

            <!-- Slide-over Footer -->
            <div class="p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
              <button (click)="closeBulkImport()" class="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors text-sm">Cancel</button>
              <button (click)="executeBulkImport()"
                      [disabled]="!bulkFile() || bulkImporting()"
                      class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-sm transition-colors text-sm flex items-center gap-2">
                <lucide-icon name="upload-cloud" [size]="14"></lucide-icon>
                Import Questions
              </button>
            </div>
          </div>
        </div>
      }

    </div>
  `
})
export class AdminInterviewCanvasComponent implements OnInit, OnDestroy {
  store = inject(AdminInterviewStore);
  route = inject(ActivatedRoute);
  router = inject(Router);
  private paramSub?: Subscription;

  // ── Mode Signals ──
  isNewMode = signal(false);
  selectedNodeType = signal<'company' | 'interview' | 'round' | 'question'>('company');

  // ── Add Question Slide-over ──
  showAddSlideover = signal(false);
  newQuestionTitle = '';
  newQuestionDifficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium';
  newQuestionCategory = '';

  // ── Bulk Import Slide-over ──
  showBulkImport = signal(false);
  bulkFile = signal<File | null>(null);
  bulkDragging = signal(false);
  bulkImporting = signal(false);
  bulkResult = signal<{ imported: number; skipped: number; errors: string[] } | null>(null);

  // ── Create Company Form ──
  newCompanyName = '';
  newCompanyIndustry = '';
  newCompanyLogo = 'from-blue-600 to-blue-400';

  readonly logoGradients = [
    { value: 'from-blue-600 to-blue-400' },
    { value: 'from-red-500 to-yellow-500' },
    { value: 'from-emerald-600 to-teal-400' },
    { value: 'from-violet-600 to-purple-400' },
    { value: 'from-amber-500 to-orange-500' },
    { value: 'from-rose-600 to-pink-400' },
    { value: 'from-slate-700 to-slate-500' },
    { value: 'from-cyan-600 to-sky-400' },
  ];

  addContextLabel = computed(() => {
    switch (this.selectedNodeType()) {
      case 'company': return 'Add Role';
      case 'interview': return 'Add Round';
      case 'round': return 'Add Question';
      case 'question': return 'Add Hint';
      default: return 'Add Item';
    }
  });

  ngOnInit() {
    // Reactively listen to route param changes (fixes component reuse on same route pattern)
    this.paramSub = this.route.paramMap.subscribe(params => {
      const id = params.get('companyId');
      if (id === 'new') {
        this.isNewMode.set(true);
        this.selectedNodeType.set('company');
      } else if (id) {
        this.isNewMode.set(false);
        const existing = this.store.companies().find(c => c.id === id);
        if (existing) {
          this.store.selectCompany(existing);
        } else {
          this.store.loadCompanies();
          this.store.selectCompany({ id, name: 'Loaded Company', logo: 'bg-slate-800', industry: 'Tech' });
        }
      }
    });
  }

  ngOnDestroy() {
    this.paramSub?.unsubscribe();
  }

  selectNode(type: 'company' | 'interview' | 'round' | 'question') {
    this.selectedNodeType.set(type);
  }

  // ── Add Context Actions ──
  handleAddContextAction() {
    switch (this.selectedNodeType()) {
      case 'company':
        if (this.store.activeCompany()) {
          this.store.addInterview(this.store.activeCompany()!.id, { roleName: 'New Role', level: 'Mid-Level' });
        }
        break;
      case 'interview':
        if (this.store.activeInterview()) {
          const nextRound = this.store.interviewRounds().length + 1;
          this.store.addRound(this.store.activeInterview()!.id, { roundNumber: nextRound, focusArea: 'General' });
        }
        break;
      case 'round':
        this.openAddQuestionSlideover();
        break;
    }
  }

  // ── Create Company ──
  createCompany() {
    if (!this.newCompanyName.trim() || !this.newCompanyIndustry.trim()) return;
    this.store.addCompany({
      name: this.newCompanyName.trim(),
      industry: this.newCompanyIndustry.trim(),
      logo: this.newCompanyLogo
    }).subscribe({
      next: (company) => {
        this.router.navigate(['/admin/interviews', company.id]);
      }
    });
  }

  // ── Add Question Slide-over ──
  openAddQuestionSlideover() {
    this.newQuestionTitle = '';
    this.newQuestionDifficulty = 'Medium';
    this.newQuestionCategory = '';
    this.showAddSlideover.set(true);
  }

  closeAddSlideover() {
    this.showAddSlideover.set(false);
  }

  saveQuestion() {
    const roundId = this.store.activeRound()?.id;
    if (!roundId || !this.newQuestionTitle.trim()) return;
    this.store.addQuestion(roundId, {
      title: this.newQuestionTitle.trim(),
      difficulty: this.newQuestionDifficulty,
      category: this.newQuestionCategory.trim() || 'General'
    });
    this.closeAddSlideover();
  }

  // ── Bulk Import Slide-over ──
  openBulkImportSlideover() {
    this.bulkFile.set(null);
    this.bulkResult.set(null);
    this.bulkImporting.set(false);
    this.showBulkImport.set(true);
  }

  closeBulkImport() {
    this.showBulkImport.set(false);
  }

  onBulkDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.bulkDragging.set(true);
  }

  onBulkDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.bulkDragging.set(false);
    const file = event.dataTransfer?.files[0];
    if (file) this.bulkFile.set(file);
  }

  onBulkFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.bulkFile.set(file);
  }

  executeBulkImport() {
    const roundId = this.store.activeRound()?.id;
    const file = this.bulkFile();
    if (!roundId || !file) return;

    this.bulkImporting.set(true);
    this.bulkResult.set(null);
    this.store.bulkImportQuestions(roundId, file).subscribe({
      next: (result) => {
        this.bulkImporting.set(false);
        this.bulkResult.set(result);
      },
      error: () => {
        this.bulkImporting.set(false);
        this.bulkResult.set({ imported: 0, skipped: 0, errors: ['Upload failed. Please try again.'] });
      }
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  openImmersiveEditor() {
    console.log('Opening immersive editor route or overlay...');
  }
}
