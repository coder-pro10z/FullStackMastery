import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PremiumCheckboxComponent } from '../../../../shared/components/premium-checkbox/premium-checkbox.component';
import { CanvasStore } from '../../../../core/state/canvas.store';
import { PitchStrategyCheckField, PitchStrategyTextField } from '../../../../core/models/canvas.model';

@Component({
  selector: 'app-pitch-strategy',
  standalone: true,
  imports: [CommonModule, PremiumCheckboxComponent],
  templateUrl: './pitch-strategy.component.html',
  styleUrl: './pitch-strategy.component.scss'
})
export class PitchStrategyComponent {
  private canvasStore = inject(CanvasStore);

  readonly pitchStrategy = computed(() => this.canvasStore.pitchStrategy());

  setChecked(field: PitchStrategyCheckField, checked: boolean) {
    this.canvasStore.setPitchChecked(field, checked);
  }

  saveText(field: PitchStrategyTextField, event: Event) {
    const el = event.target as HTMLElement;
    this.canvasStore.updatePitchText(field, el.innerText.trim());
  }
}
