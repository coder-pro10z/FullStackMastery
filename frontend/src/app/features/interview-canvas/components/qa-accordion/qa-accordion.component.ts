import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ChevronDown, ChevronUp, CheckCircle, Lightbulb, Play, Volume2 } from 'lucide-angular';
import { PremiumCheckboxComponent } from '../../../../shared/components/premium-checkbox/premium-checkbox.component';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { CanvasStore } from '../../../../core/state/canvas.store';
import { ICanvasQaItem } from '../../../../core/models/canvas.model';

@Component({
  selector: 'app-qa-accordion',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, PremiumCheckboxComponent, BadgeComponent],
  templateUrl: './qa-accordion.component.html',
  styleUrl: './qa-accordion.component.scss'
})
export class QaAccordionComponent {
  private canvasStore = inject(CanvasStore);

  readonly qaList = computed(() => this.canvasStore.qaItems());

  toggleHint(item: ICanvasQaItem) {
    this.canvasStore.toggleQaHint(item.id);
  }

  toggleAnswer(item: ICanvasQaItem) {
    this.canvasStore.toggleQaAnswer(item.id);
  }

  setChecked(item: ICanvasQaItem, checked: boolean) {
    this.canvasStore.setQaChecked(item.id, checked);
  }
}
