import { Component, ElementRef, HostListener, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-global-search',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="relative w-64 focus-within:w-80 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]">
      <!-- Search Container -->
      <div 
        (click)="focusInput()"
        [class.ring-2]="isFocused()"
        class="group flex items-center gap-3 bg-slate-100/80 hover:bg-slate-200/50 backdrop-blur-sm border border-transparent focus-within:border-blue-500/30 focus-within:bg-white focus-within:shadow-sm transition-all duration-300 ease-out rounded-full px-4 py-2 cursor-text"
      >
        <!-- Icon -->
        <lucide-icon 
          name="search" 
          class="w-4 h-4 text-slate-500 group-focus-within:text-blue-600 transition-colors flex-shrink-0"
        ></lucide-icon>

        <!-- Input -->
        <input
          #searchInput
          type="text"
          placeholder="Search platform..."
          (focus)="isFocused.set(true)"
          (blur)="isFocused.set(false)"
          class="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder:text-slate-400 font-medium"
        />

        <!-- Shortcut Badge (Apple Style) -->
        <div class="flex items-center justify-center gap-0.5 px-2 pt-1 pb-0.5 bg-white border border-slate-200 rounded-md shadow-sm transition-opacity duration-200 flex-shrink-0"
             [class.opacity-0]="isFocused()">
          <span class="text-[10px] font-sans font-bold text-slate-500">⌘</span>
          <span class="text-[10px] font-sans font-bold text-slate-500">K</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    input::placeholder { transition: opacity 0.2s; }
    input:focus::placeholder { opacity: 0.7; }
  `]
})
export class GlobalSearchComponent {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  
  // Angular 17 Signal for UI state
  isFocused = signal(false);

  // Global Keyboard Shortcut: Cmd+K or Ctrl+K
  @HostListener('window:keydown.meta.k', ['$event'])
  @HostListener('window:keydown.control.k', ['$event'])
  handleShortcut(event: Event) {
    event.preventDefault();
    this.focusInput();
  }

  focusInput() {
    this.searchInput.nativeElement.focus();
  }
}
