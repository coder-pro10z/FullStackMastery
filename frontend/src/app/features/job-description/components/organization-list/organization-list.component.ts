import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { OrganizationService } from '../../services/organization.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-organization-list',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col h-full bg-slate-50/50">
      <div class="p-4 border-b border-slate-200">
        <div class="flex items-center gap-2 mb-3">
          <div class="relative flex-1">
            <lucide-icon name="search" [size]="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search organizations..."
              [(ngModel)]="searchQuery"
              class="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                     transition-all"
            />
          </div>
          <button (click)="isAdding.set(true)" class="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm" title="Add Organization">
            <lucide-icon name="plus" [size]="16" />
          </button>
        </div>
      </div>
      
      <div class="flex-1 overflow-y-auto p-2 space-y-1">
        @for (org of orgService.organizations(); track org.id) {
          <a
            [routerLink]="['/job-description/org', org.id]"
            routerLinkActive="bg-blue-50 border-blue-200"
            class="block p-3 bg-white border border-slate-100 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 text-lg font-bold text-slate-400">
                {{ org.name.charAt(0).toUpperCase() }}
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-sm font-semibold text-slate-800 truncate">{{ org.name }}</h3>
                <p class="text-xs text-slate-500 truncate">{{ org.industry || 'Unknown Industry' }}</p>
              </div>
            </div>
          </a>
        } @empty {
          <div class="p-8 text-center text-slate-400 text-sm">
            No organizations yet. Add one to get started.
          </div>
        }
      </div>

      <!-- Add Org Modal -->
      @if (isAdding()) {
        <div class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm border border-slate-200 overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 class="text-sm font-bold text-slate-800">Add Organization</h3>
              <button (click)="cancelAdd()" class="text-slate-400 hover:text-slate-700">
                <lucide-icon name="x" [size]="16" />
              </button>
            </div>
            <div class="p-6 space-y-4">
              <div>
                <label class="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Company Name *</label>
                <input [(ngModel)]="newOrgName" type="text" placeholder="e.g. Google" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-slate-50">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Industry</label>
                <input [(ngModel)]="newOrgIndustry" type="text" placeholder="e.g. Technology" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-slate-50">
              </div>
            </div>
            <div class="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50">
              <button (click)="cancelAdd()" class="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg">Cancel</button>
              <button (click)="saveOrg()" [disabled]="!newOrgName.trim()" class="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg">Save</button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class OrganizationListComponent {
  readonly orgService = inject(OrganizationService);
  
  searchQuery = signal('');
  isAdding = signal(false);
  
  newOrgName = '';
  newOrgIndustry = '';

  cancelAdd() {
    this.isAdding.set(false);
    this.newOrgName = '';
    this.newOrgIndustry = '';
  }

  saveOrg() {
    if (!this.newOrgName.trim()) return;
    
    this.orgService.add({
      name: this.newOrgName.trim(),
      industry: this.newOrgIndustry.trim() || undefined,
      tags: []
    });
    
    this.cancelAdd();
  }
}
