import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ContactService } from '../../../services/contact.service';
import { ContactCardComponent } from './contact-card.component';
import { ContactFormComponent } from './contact-form.component';
import { OpportunityService } from '../../../services/opportunity.service';
import { Contact } from '../../../models/opportunity.models';

@Component({
  selector: 'app-contacts-tab',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ContactCardComponent, ContactFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-full flex flex-col relative">
      <!-- Header Options -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-4">
          <h3 class="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <lucide-icon name="users" [size]="16" class="text-slate-400" />
            Contacts
          </h3>
          
          @if (isOpportunityContext()) {
            <div class="flex items-center bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
              <button 
                (click)="filterMode.set('scoped')"
                class="px-3 py-1 rounded text-xs font-semibold transition-colors"
                [class.bg-slate-100]="filterMode() === 'scoped'"
                [class.text-slate-800]="filterMode() === 'scoped'"
                [class.text-slate-500]="filterMode() !== 'scoped'"
              >
                This Opportunity
              </button>
              <button 
                (click)="filterMode.set('all')"
                class="px-3 py-1 rounded text-xs font-semibold transition-colors"
                [class.bg-slate-100]="filterMode() === 'all'"
                [class.text-slate-800]="filterMode() === 'all'"
                [class.text-slate-500]="filterMode() !== 'all'"
              >
                All at Org
              </button>
            </div>
          }
        </div>
        
        <button 
          (click)="openAddForm()"
          class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
        >
          <lucide-icon name="user-plus" [size]="14" /> Add Contact
        </button>
      </div>

      <!-- Contacts Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        @for (contact of displayedContacts(); track contact.id) {
          <app-contact-card [contact]="contact" />
        } @empty {
          <div class="col-span-full bg-white rounded-2xl border border-dashed border-slate-300 py-16 flex flex-col items-center justify-center text-center">
            <div class="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
              <lucide-icon name="users" [size]="24" class="text-slate-300" />
            </div>
            <h4 class="text-slate-600 font-bold mb-1">No Contacts Yet</h4>
            <p class="text-sm text-slate-400 max-w-sm">
              Keep track of recruiters, hiring managers, and referrals for this {{ isOpportunityContext() ? 'opportunity' : 'organization' }}.
            </p>
            <button (click)="openAddForm()" class="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline">
              Add your first contact
            </button>
          </div>
        }
      </div>

      <!-- Drawer Overlay for Form -->
      @if (showForm()) {
        <div class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end">
          <div class="h-full w-full max-w-md bg-transparent p-4 flex items-center justify-center">
            <app-contact-form 
              [organizationId]="organizationId()!"
              [opportunityIdContext]="isOpportunityContext() ? opportunityId() : undefined"
              (close)="showForm.set(false)"
              (saveContact)="handleSaveContact($event)"
            />
          </div>
        </div>
      }
    </div>
  `
})
export class ContactsTabComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly contactService = inject(ContactService);
  private readonly oppService = inject(OpportunityService);

  readonly showForm = signal(false);
  readonly filterMode = signal<'scoped' | 'all'>('scoped');

  // Determine context from route params
  // If we are at /job-description/org/:orgId/contacts -> parent route has orgId
  // If we are at /job-description/:id/contacts -> parent route has id (opportunityId)
  
  readonly orgIdFromRoute = computed(() => this.route.parent?.snapshot.paramMap.get('orgId'));
  readonly oppIdFromRoute = computed(() => this.route.parent?.snapshot.paramMap.get('id'));

  readonly isOpportunityContext = computed(() => !!this.oppIdFromRoute());

  readonly opportunityId = computed(() => this.oppIdFromRoute() || '');
  
  readonly organizationId = computed(() => {
    const directOrgId = this.orgIdFromRoute();
    if (directOrgId) return directOrgId;
    
    // If in opp context, lookup opp to get orgId
    const oppId = this.opportunityId();
    if (oppId) {
      const opp = this.oppService.getById(oppId);
      return opp?.organizationId || '';
    }
    return '';
  });

  readonly displayedContacts = computed(() => {
    const orgId = this.organizationId();
    if (!orgId) return [];

    if (this.isOpportunityContext() && this.filterMode() === 'scoped') {
      return this.contactService.getByOpportunityId(this.opportunityId());
    }
    
    // Otherwise return all contacts for the org
    return this.contactService.getByOrgId(orgId);
  });

  openAddForm() {
    this.showForm.set(true);
  }

  handleSaveContact(contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) {
    this.contactService.add(contactData);
    this.showForm.set(false);
  }
}
