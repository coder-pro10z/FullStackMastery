import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { OpportunityService } from '../../services/opportunity.service';
import { OrganizationService } from '../../services/organization.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-opportunity-list',
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
              placeholder="Search opportunities..."
              [(ngModel)]="searchQuery"
              class="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                     transition-all"
            />
          </div>
          <button (click)="isAdding.set(true)" class="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm" title="Add Opportunity">
            <lucide-icon name="plus" [size]="16" />
          </button>
        </div>
      </div>
      
      <div class="flex-1 overflow-y-auto p-2 space-y-1">
        @for (opp of oppService.opportunities(); track opp.id) {
          <a
            [routerLink]="['/job-description', opp.id]"
            routerLinkActive="bg-blue-50 border-blue-200"
            class="block p-3 bg-white border border-slate-100 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                <lucide-icon name="briefcase" [size]="16" class="text-blue-500" />
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-sm font-semibold text-slate-800 truncate">{{ opp.title }}</h3>
                <div class="flex items-center gap-2 mt-1">
                  <span class="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase tracking-wider">
                    {{ opp.status }}
                  </span>
                </div>
              </div>
            </div>
          </a>
        } @empty {
          <div class="p-8 text-center text-slate-400 text-sm">
            No opportunities yet. Add one to get started.
          </div>
        }
      </div>

      <!-- Add Opp Modal -->
      @if (isAdding()) {
        <div class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 class="text-sm font-bold text-slate-800">Add Opportunity</h3>
              <button (click)="cancelAdd()" class="text-slate-400 hover:text-slate-700">
                <lucide-icon name="x" [size]="16" />
              </button>
            </div>
            
            @if (orgService.organizations().length === 0) {
              <div class="p-6 text-center">
                <p class="text-sm text-slate-500">You must create an Organization first.</p>
              </div>
            } @else {
              <div class="p-6 space-y-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Job Title *</label>
                  <input [(ngModel)]="newOppTitle" type="text" placeholder="e.g. Senior Frontend Engineer" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-slate-50">
                </div>
                
                <div>
                  <label class="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Organization *</label>
                  <select [(ngModel)]="newOppOrgId" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-slate-50 text-slate-700">
                    <option value="" disabled selected>Select Organization</option>
                    @for (org of orgService.organizations(); track org.id) {
                      <option [value]="org.id">{{ org.name }}</option>
                    }
                  </select>
                </div>
              </div>
              <div class="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50">
                <button (click)="cancelAdd()" class="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg">Cancel</button>
                <button (click)="saveOpp()" [disabled]="!newOppTitle.trim() || !newOppOrgId" class="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg">Save</button>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class OpportunityListComponent {
  readonly oppService = inject(OpportunityService);
  readonly orgService = inject(OrganizationService);
  
  searchQuery = signal('');
  isAdding = signal(false);
  
  newOppTitle = '';
  newOppOrgId = '';

  cancelAdd() {
    this.isAdding.set(false);
    this.newOppTitle = '';
    this.newOppOrgId = '';
  }

  saveOpp() {
    if (!this.newOppTitle.trim() || !this.newOppOrgId) return;
    
    this.oppService.add({
      title: this.newOppTitle.trim(),
      organizationId: this.newOppOrgId,
      status: 'bookmarked',
      priority: 'medium',
      tags: []
    });
    
    this.cancelAdd();
  }
}
