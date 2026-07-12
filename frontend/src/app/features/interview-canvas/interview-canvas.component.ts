import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { FormsModule } from '@angular/forms';
import { BadgeComponent } from '../../shared/components/badge/badge.component';

import { JdResumeChecklistComponent } from './components/jd-resume-checklist/jd-resume-checklist.component';
import { PitchStrategyComponent } from './components/pitch-strategy/pitch-strategy.component';
import { QaAccordionComponent } from './components/qa-accordion/qa-accordion.component';
import { KeywordCardComponent } from './components/keyword-card/keyword-card.component';
import { ImportModalComponent } from './components/import-modal/import-modal.component';
import { BulkImportDrawerComponent } from './components/bulk-import-drawer/bulk-import-drawer.component';
import { CanvasStore } from '../../core/state/canvas.store';

@Component({
  selector: 'app-interview-canvas',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    FormsModule,
    BadgeComponent,
    JdResumeChecklistComponent,
    PitchStrategyComponent,
    QaAccordionComponent,
    KeywordCardComponent,
    ImportModalComponent,
    BulkImportDrawerComponent,
  ],
  templateUrl: './interview-canvas.component.html',
  styleUrl: './interview-canvas.component.scss'
})
export class InterviewCanvasComponent {
  private canvasStore = inject(CanvasStore);

  // ── Computed UI state ──────────────────────────────────────────────────────
  readonly title = computed(() => this.canvasStore.title());
  readonly pitchCompletedCount = computed(() => {
    const pitch = this.canvasStore.pitchStrategy();
    return [pitch.introChecked, pitch.aboutChecked, pitch.customChecked].filter(Boolean).length;
  });
  readonly pitchProgressWidth = computed(() => `${(this.pitchCompletedCount() / 3) * 100}%`);
  readonly qaCompletedCount = computed(() => this.canvasStore.qaItems().filter(i => i.checked).length);
  readonly qaTotalCount = computed(() => this.canvasStore.qaItems().length);
  readonly qaProgressWidth = computed(() => {
    const total = this.qaTotalCount();
    return `${total === 0 ? 0 : (this.qaCompletedCount() / total) * 100}%`;
  });
  readonly keywordsCompletedCount = computed(() => this.canvasStore.keywords().filter(k => k.checked).length);
  readonly keywordsTotalCount = computed(() => this.canvasStore.keywords().length);
  readonly keywordsProgressWidth = computed(() => {
    const total = this.keywordsTotalCount();
    return `${total === 0 ? 0 : (this.keywordsCompletedCount() / total) * 100}%`;
  });

  // ── Modal / Drawer state ───────────────────────────────────────────────────
  readonly showImportModal = signal(false);
  readonly showQaBulkDrawer = signal(false);
  readonly showKeywordBulkDrawer = signal(false);
  readonly addingKeyword = signal(false);
  newKeywordText = '';

  constructor() {
    import('@angular/core').then(({ effect }) => {
      effect(() => { document.title = `${this.title()} - Prep Canvas`; });
    });
  }

  onTitleChange(event: Event) {
    const el = event.target as HTMLElement;
    this.canvasStore.updateTitle(el.innerText.trim() || 'Role Title / Company Name');
  }

  resetData() {
    if (confirm('Reset to default mock data? All your edits will be lost.')) {
      this.canvasStore.reset();
    }
  }

  openImportModal() { this.showImportModal.set(true); }

  addQA() { this.canvasStore.addQa(); }

  saveNewKeyword() {
    if (this.newKeywordText.trim()) {
      this.canvasStore.addKeyword(this.newKeywordText.trim());
    }
    this.newKeywordText = '';
    this.addingKeyword.set(false);
  }
}
