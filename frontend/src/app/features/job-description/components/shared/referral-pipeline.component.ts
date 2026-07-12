import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { Contact, ReferralStatus } from '../../models/opportunity.models';

@Component({
  selector: 'app-referral-pipeline',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center gap-1.5 w-full">
      <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider w-16 flex-shrink-0">
        Referral
      </div>
      
      <div class="flex-1 flex items-center justify-between">
        @for (step of steps; track step.value; let i = $index) {
          <!-- Step node -->
          <div 
            class="relative flex flex-col items-center group cursor-pointer"
            [class.opacity-40]="isFuture(step.value)"
          >
            <div 
              class="w-6 h-6 rounded-full flex items-center justify-center border-2 z-10 bg-white transition-colors"
              [class.border-emerald-500]="isPastOrCurrent(step.value)"
              [class.border-slate-200]="isFuture(step.value)"
              [class.text-emerald-500]="isPastOrCurrent(step.value)"
              [class.text-slate-300]="isFuture(step.value)"
            >
              @if (isPast(step.value)) {
                <lucide-icon name="check" [size]="12" strokeWidth="3" />
              } @else {
                <div class="w-2 h-2 rounded-full" [class.bg-emerald-500]="isCurrent(step.value)" [class.bg-slate-200]="isFuture(step.value)"></div>
              }
            </div>
            
            <!-- Tooltip -->
            <div class="absolute -bottom-7 whitespace-nowrap px-2 py-1 bg-slate-800 text-white text-[10px] font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
              {{ step.label }}
            </div>
          </div>
          
          <!-- Connecting line (except for last item) -->
          @if (i < steps.length - 1) {
            <div class="flex-1 h-0.5" [class.bg-emerald-500]="isPastOrCurrent(steps[i+1].value)" [class.bg-slate-200]="isFuture(steps[i+1].value)"></div>
          }
        }
      </div>
    </div>
  `
})
export class ReferralPipelineComponent {
  @Input({ required: true }) status!: ReferralStatus;

  readonly steps: { value: ReferralStatus; label: string }[] = [
    { value: 'not_asked', label: 'Not Asked' },
    { value: 'asked', label: 'Asked' },
    { value: 'agreed', label: 'Agreed' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'confirmed', label: 'Confirmed' }
  ];

  private getStepIndex(status: ReferralStatus): number {
    return this.steps.findIndex(s => s.value === status);
  }

  isPast(stepValue: ReferralStatus): boolean {
    return this.getStepIndex(this.status) > this.getStepIndex(stepValue);
  }

  isCurrent(stepValue: ReferralStatus): boolean {
    return this.status === stepValue;
  }

  isPastOrCurrent(stepValue: ReferralStatus): boolean {
    return this.getStepIndex(this.status) >= this.getStepIndex(stepValue);
  }

  isFuture(stepValue: ReferralStatus): boolean {
    return this.getStepIndex(this.status) < this.getStepIndex(stepValue);
  }
}
