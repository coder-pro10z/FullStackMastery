import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div class="bg-white rounded-[24px] p-8 w-full max-w-sm mx-4 animate-slide-up relative shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-white flex flex-col items-center text-center">
        
        <div 
          class="w-16 h-16 rounded-full flex items-center justify-center mb-5 shadow-inner"
          [ngClass]="iconBgClass">
          <lucide-icon [name]="iconName" [size]="32" class="animate-bounce" [ngClass]="iconColorClass" />
        </div>
        
        <h3 class="text-xl font-extrabold text-slate-800 tracking-tight mb-3">{{ title }}</h3>
        
        <div class="text-[15px] text-slate-500 mb-8 leading-relaxed w-full">
          <ng-content></ng-content>
        </div>

        <div class="flex items-center justify-center gap-3 w-full">
          <button 
            class="flex-1 py-3 px-4 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            (click)="canceled.emit()">
            {{ cancelText }}
          </button>
          <button 
            class="flex-1 py-3 px-4 rounded-xl text-sm font-bold text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
            [ngClass]="confirmBtnClass"
            (click)="confirmed.emit()">
            <lucide-icon [name]="confirmIconName" [size]="18" />
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class ConfirmationDialogComponent {
  @Input() title = 'Confirm Action';
  @Input() cancelText = 'Cancel';
  @Input() confirmText = 'Confirm';
  
  // Icon styling
  @Input() iconName = 'alert-triangle';
  @Input() iconBgClass = 'bg-amber-50';
  @Input() iconColorClass = 'text-amber-500';
  
  // Confirm button styling
  @Input() confirmIconName = 'check-circle';
  @Input() confirmBtnClass = 'bg-[#1A73E8] hover:bg-[#174EA6] shadow-blue-500/30 hover:shadow-blue-500/50';

  @Output() confirmed = new EventEmitter<void>();
  @Output() canceled = new EventEmitter<void>();
}
