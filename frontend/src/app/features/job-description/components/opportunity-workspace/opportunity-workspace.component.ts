import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { OpportunityService } from '../../services/opportunity.service';
import { OrganizationService } from '../../services/organization.service';
import { FormsModule } from '@angular/forms';
import { Opportunity } from '../../models/opportunity.models';

@Component({
  selector: 'app-opportunity-workspace',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, LucideAngularModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-full flex flex-col">
      @if (opp()) {
        <!-- ── Header ── -->
        <div class="bg-white border-b border-slate-200 px-8 py-6 flex-shrink-0">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                <lucide-icon name="briefcase" [size]="20" class="text-blue-600" />
              </div>
              <div>
                <h2 class="text-xl font-bold text-slate-800">{{ opp()!.title }}</h2>
                <p class="text-sm text-slate-500 mt-0.5 flex items-center gap-2">
                  <a [routerLink]="['/job-description/org', org()?.id]" class="font-medium text-blue-600 hover:underline flex items-center gap-1">
                    <lucide-icon name="building-2" [size]="14" />
                    {{ org()?.name || 'Unknown Organization' }}
                  </a>
                  @if (opp()!.team) {
                    <span class="text-slate-300">•</span>
                    <span>{{ opp()!.team }}</span>
                  }
                </p>
              </div>
            </div>
            
            <div class="flex items-center gap-2">
              <div class="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg uppercase tracking-wider">
                {{ opp()!.status }}
              </div>
              <button (click)="openEditModal()" class="px-3 py-1.5 border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors">
                Edit
              </button>
            </div>
          </div>
          
          <!-- ── Tabs ── -->
          <div class="flex items-center gap-6 mt-8">
            <a
              [routerLink]="['./']"
              routerLinkActive="text-blue-600 border-blue-600"
              [routerLinkActiveOptions]="{ exact: true }"
              class="pb-3 text-sm font-semibold text-slate-500 border-b-2 border-transparent hover:text-slate-800 transition-colors"
            >
              Overview
            </a>
            <a
              [routerLink]="['contacts']"
              routerLinkActive="text-blue-600 border-blue-600"
              class="pb-3 text-sm font-semibold text-slate-500 border-b-2 border-transparent hover:text-slate-800 transition-colors"
            >
              Contacts
            </a>
            <a
              [routerLink]="['notes']"
              routerLinkActive="text-blue-600 border-blue-600"
              class="pb-3 text-sm font-semibold text-slate-500 border-b-2 border-transparent hover:text-slate-800 transition-colors"
            >
              Notes
            </a>
            <a
              [routerLink]="['questions']"
              routerLinkActive="text-blue-600 border-blue-600"
              class="pb-3 text-sm font-semibold text-slate-500 border-b-2 border-transparent hover:text-slate-800 transition-colors"
            >
              Questions
            </a>
          </div>
        </div>

        <!-- ── Tab Content (Router Outlet) ── -->
        <div class="flex-1 overflow-y-auto p-8 bg-slate-50">
          <router-outlet></router-outlet>
        </div>

        <!-- ── Edit Opportunity Modal ── -->
        @if (isEditing()) {
          <div class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end">
            <div class="h-full w-full max-w-2xl bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
              <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <h3 class="text-sm font-bold text-slate-800">Edit Opportunity</h3>
                <button (click)="cancelEdit()" class="text-slate-400 hover:text-slate-700 p-1">
                  <lucide-icon name="x" [size]="18" />
                </button>
              </div>
              
              <div class="flex-1 overflow-y-auto p-6 space-y-5">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Job Title *</label>
                    <input [(ngModel)]="editData.title" type="text" class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm">
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Team / Dept</label>
                    <input [(ngModel)]="editData.team" type="text" placeholder="e.g. Chrome Security" class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm">
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Status</label>
                    <select [(ngModel)]="editData.status" class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm">
                      <option value="bookmarked">Bookmarked</option>
                      <option value="applied">Applied</option>
                      <option value="screening">Screening</option>
                      <option value="interviewing">Interviewing</option>
                      <option value="offer">Offer</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                      <option value="withdrawn">Withdrawn</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Priority</label>
                    <select [(ngModel)]="editData.priority" class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Job Posting URL</label>
                  <input [(ngModel)]="editData.jdLink" type="url" placeholder="https://..." class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm">
                </div>

                <div class="flex-1 flex flex-col">
                  <label class="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Job Description Text</label>
                  <textarea [(ngModel)]="editData.jdText" placeholder="Paste the job description here..." class="w-full h-64 px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 resize-none font-sans text-sm"></textarea>
                </div>
              </div>
              
              <div class="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                <button (click)="cancelEdit()" class="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
                <button (click)="saveEdit()" [disabled]="!editData.title?.trim()" class="px-6 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors">Save Changes</button>
              </div>
            </div>
          </div>
        }
      } @else {
        <div class="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <lucide-icon name="briefcase" [size]="48" class="text-slate-200 mb-4" />
          <h2 class="text-lg font-bold text-slate-600">Opportunity Not Found</h2>
          <p class="text-sm text-slate-400 mt-1">The opportunity you're looking for doesn't exist or was deleted.</p>
        </div>
      }
    </div>
  `
})
export class OpportunityWorkspaceComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly oppService = inject(OpportunityService);
  private readonly orgService = inject(OrganizationService);
  
  readonly oppId = computed(() => this.route.snapshot.paramMap.get('id') || '');
  readonly opp = computed(() => this.oppService.getById(this.oppId()));
  readonly org = computed(() => {
    const o = this.opp();
    return o ? this.orgService.getById(o.organizationId) : null;
  });

  readonly isEditing = signal(false);
  editData: Partial<Opportunity> = {};

  openEditModal() {
    const currentOpp = this.opp();
    if (currentOpp) {
      this.editData = { ...currentOpp };
      this.isEditing.set(true);
    }
  }

  cancelEdit() {
    this.isEditing.set(false);
    this.editData = {};
  }

  saveEdit() {
    if (!this.editData.title?.trim()) return;
    this.oppService.update(this.oppId(), this.editData);
    this.isEditing.set(false);
  }
}
