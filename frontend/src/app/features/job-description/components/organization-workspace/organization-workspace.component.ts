import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { OrganizationService } from '../../services/organization.service';

@Component({
  selector: 'app-organization-workspace',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-full flex flex-col">
      @if (org()) {
        <!-- ── Header ── -->
        <div class="bg-white border-b border-slate-200 px-8 py-6 flex-shrink-0">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl font-bold text-slate-400">
                {{ org()!.name.charAt(0) }}
              </div>
              <div>
                <h2 class="text-2xl font-bold text-slate-800">{{ org()!.name }}</h2>
                <p class="text-sm text-slate-500 mt-1 flex items-center gap-2">
                  <lucide-icon name="building-2" [size]="14" />
                  {{ org()!.industry || 'Industry not specified' }}
                  @if (org()!.websiteUrl) {
                    <span class="text-slate-300">•</span>
                    <a [href]="org()!.websiteUrl" target="_blank" class="text-blue-600 hover:underline flex items-center gap-1">
                      Website <lucide-icon name="external-link" [size]="10" />
                    </a>
                  }
                </p>
              </div>
            </div>
            
            <div class="flex items-center gap-2">
              <button class="px-4 py-2 bg-blue-50 text-blue-700 text-sm font-semibold rounded-lg hover:bg-blue-100 transition-colors">
                Edit Details
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
          </div>
        </div>

        <!-- ── Tab Content (Router Outlet) ── -->
        <div class="flex-1 overflow-y-auto p-8 bg-slate-50">
          <router-outlet></router-outlet>
        </div>
      } @else {
        <div class="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <lucide-icon name="building-2" [size]="48" class="text-slate-200 mb-4" />
          <h2 class="text-lg font-bold text-slate-600">Organization Not Found</h2>
          <p class="text-sm text-slate-400 mt-1">The organization you're looking for doesn't exist or was deleted.</p>
        </div>
      }
    </div>
  `
})
export class OrganizationWorkspaceComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly orgService = inject(OrganizationService);
  
  readonly orgId = computed(() => this.route.snapshot.paramMap.get('orgId') || '');
  readonly org = computed(() => this.orgService.getById(this.orgId()));
}
