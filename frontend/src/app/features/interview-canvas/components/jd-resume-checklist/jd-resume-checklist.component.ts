import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Briefcase, FileText } from 'lucide-angular';
import { PremiumCheckboxComponent } from '../../../../shared/components/premium-checkbox/premium-checkbox.component';
import { CanvasStore } from '../../../../core/state/canvas.store';

@Component({
  selector: 'app-jd-resume-checklist',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, PremiumCheckboxComponent],
  templateUrl: './jd-resume-checklist.component.html',
  styleUrl: './jd-resume-checklist.component.scss'
})
export class JdResumeChecklistComponent {
  private canvasStore = inject(CanvasStore);

  readonly jdItems = computed(() => this.canvasStore.jdItems());
  readonly resumeItems = computed(() => this.canvasStore.resumeItems());

  toggleJd(id: string) {
    this.canvasStore.toggleJdItem(id);
  }

  toggleResume(id: string) {
    this.canvasStore.toggleResumeItem(id);
  }
}
