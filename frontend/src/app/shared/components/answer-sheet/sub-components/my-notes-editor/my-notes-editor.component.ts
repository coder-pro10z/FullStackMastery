import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-my-notes-editor',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, LucideAngularModule],
  template: `
    <div class="relative group">
      <textarea
        [ngModel]="notes"
        (ngModelChange)="onNotesInput($event)"
        [placeholder]="placeholder || 'Add your key observations, edge cases, or memory hooks here...'"
        rows="3"
        class="w-full p-2.5 rounded-xl border border-slate-200 bg-amber-50/40 focus:bg-white text-xs font-sans text-slate-700
               placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400
               transition-all resize-none shadow-inner"
      ></textarea>
      
      <div class="absolute bottom-2 right-2 flex items-center gap-1 text-[10px] text-amber-600/70 font-medium select-none pointer-events-none">
        <lucide-icon name="pencil" [size]="10" />
        <span>Saved locally</span>
      </div>
    </div>
  `
})
export class MyNotesEditorComponent {
  @Input() notes: string = '';
  @Input() placeholder?: string;
  @Output() notesChange = new EventEmitter<string>();

  onNotesInput(newVal: string): void {
    this.notesChange.emit(newVal);
  }
}
