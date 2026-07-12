import { ChangeDetectionStrategy, Component, EventEmitter, Output, signal } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

import { GlobalSearchComponent } from '../global-search/global-search.component';

@Component({
  selector: 'app-top-nav',
  standalone: true,
  imports: [LucideAngularModule, GlobalSearchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-slate-200 bg-white/50 backdrop-blur-xl z-30 flex-shrink-0 relative">
      
      <div class="flex items-center gap-3 sm:gap-4">
        <!-- Mobile menu hamburger -->
        <button (click)="onMenuClick()" class="lg:hidden p-2 rounded-lg bg-white border border-slate-200 shadow-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 hover:-translate-y-0.5 transition-all duration-300 ease-out cursor-pointer">
          <lucide-icon name="menu" [size]="20"></lucide-icon>
        </button>

        <div class="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-500">
          <span class="hover:text-slate-800 cursor-pointer transition-colors">Dashboard</span>
          <lucide-icon name="chevron-right" class="text-slate-400" [size]="14"></lucide-icon>
          <span class="text-slate-800">Current Page</span>
        </div>
      </div>

      <div class="flex items-center gap-3 sm:gap-4">
        
        <div class="hidden sm:block">
          <app-global-search></app-global-search>
        </div>
        
        <!-- Mobile search toggle -->
        <button
          class="sm:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100
                 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-300 ease-out"
          (click)="toggleSearch()"
          title="Search"
        >
          <lucide-icon name="search" [size]="18" />
        </button>
        
        <button title="Notifications" class="relative p-2 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all duration-300">
          <lucide-icon name="bell" [size]="18"></lucide-icon>
          <span class="absolute top-1.5 right-1.5 w-[6px] h-[6px] rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>
        
        <div class="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>
        
        <button title="Profile" class="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 text-white font-semibold text-sm shadow-sm ring-2 ring-yellow-400/50 hover:ring-yellow-400 hover:scale-105 transition-all duration-300">
          PK
        </button>
      </div>
    </header>

    <!-- Mobile search panel -->
    @if (isSearchOpen()) {
      <div class="sm:hidden px-4 py-3 bg-white border-b border-slate-200 shadow-sm animate-slide-down absolute w-full z-20">
        <div class="relative">
          <lucide-icon
            name="search"
            [size]="16"
            class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search..."
            class="w-full pl-9 pr-4 py-2 text-sm
                   bg-slate-50 border border-slate-200 rounded-lg
                   text-slate-800 placeholder:text-slate-400
                   focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                   transition-all duration-200"
            autofocus
          />
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }
    @keyframes slide-down {
      from { opacity: 0; transform: translateY(-6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .animate-slide-down { animation: slide-down 150ms ease-out both; }
  `]
})
export class TopNavComponent {
  @Output() menuClick = new EventEmitter<void>();
  readonly isSearchOpen = signal(false);

  toggleSearch(): void {
    this.isSearchOpen.update(v => !v);
  }

  onMenuClick(): void {
    this.menuClick.emit();
  }
}
