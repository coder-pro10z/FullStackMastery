import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { OrganizationService } from '../../../services/organization.service';

@Component({
  selector: 'app-org-overview-tab',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6 max-w-4xl">
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 class="text-sm font-semibold text-slate-800 mb-4">Organization Notes</h3>
        @if (org()?.notes) {
          <p class="text-sm text-slate-600 whitespace-pre-wrap">{{ org()!.notes }}</p>
        } @else {
          <p class="text-sm text-slate-400 italic">No notes added for this organization yet.</p>
        }
      </div>
    </div>
  `
})
export class OrgOverviewTabComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly orgService = inject(OrganizationService);
  
  // Get orgId from parent route param
  readonly orgId = computed(() => this.route.parent?.snapshot.paramMap.get('orgId') || '');
  readonly org = computed(() => this.orgService.getById(this.orgId()));
}
