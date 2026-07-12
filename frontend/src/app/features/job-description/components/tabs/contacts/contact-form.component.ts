import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { Contact, ContactType, ReachStatus, ReferralStatus, ReferralType } from '../../../models/opportunity.models';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0 bg-slate-50">
        <h3 class="text-sm font-bold text-slate-800 flex items-center gap-2">
          <lucide-icon name="user-plus" [size]="16" class="text-blue-600" />
          {{ initialContact ? 'Edit Contact' : 'Add Contact' }}
        </h3>
        <button (click)="close.emit()" class="p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 rounded-lg transition-colors">
          <lucide-icon name="x" [size]="16" />
        </button>
      </div>

      <!-- Scrollable Form Body -->
      <div class="flex-1 overflow-y-auto p-6 space-y-5">
        
        <!-- Name & Avatar -->
        <div>
          <label class="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Full Name *</label>
          <input [(ngModel)]="name" type="text" placeholder="e.g. Priya Sharma" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50">
        </div>

        <!-- Role & Department -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Role</label>
            <input [(ngModel)]="role" type="text" placeholder="e.g. Recruiter" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-slate-50">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Department</label>
            <input [(ngModel)]="department" type="text" placeholder="e.g. HR" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-slate-50">
          </div>
        </div>

        <!-- Contact Types (Multi-select) -->
        <div>
          <label class="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Contact Types *</label>
          <div class="flex flex-wrap gap-2">
            @for (type of availableTypes; track type.value) {
              <button 
                (click)="toggleType(type.value)"
                class="px-2.5 py-1 rounded-md text-xs font-medium transition-colors border"
                [ngClass]="{
                  'bg-blue-50 border-blue-200 text-blue-700': types().includes(type.value),
                  'bg-white border-slate-200 text-slate-500 hover:bg-slate-50': !types().includes(type.value)
                }"
              >
                {{ type.label }}
              </button>
            }
          </div>
        </div>

        <!-- Referral Section (Conditional) -->
        @if (hasReferralType()) {
          <div class="bg-emerald-50 rounded-xl p-4 border border-emerald-100 space-y-4">
            <h4 class="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <lucide-icon name="git-merge" [size]="14" /> Referral Details
            </h4>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-medium text-emerald-700 mb-1.5">Referral Type</label>
                <select [(ngModel)]="referralType" class="w-full px-2 py-1.5 text-sm border border-emerald-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:border-emerald-500">
                  <option value="internal">Internal (Works there)</option>
                  <option value="external">External (Knows someone)</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-medium text-emerald-700 mb-1.5">Status</label>
                <select [(ngModel)]="referralStatus" class="w-full px-2 py-1.5 text-sm border border-emerald-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:border-emerald-500">
                  <option value="not_asked">Not Asked</option>
                  <option value="asked">Asked</option>
                  <option value="agreed">Agreed</option>
                  <option value="submitted">Submitted</option>
                  <option value="confirmed">Confirmed</option>
                </select>
              </div>
            </div>
          </div>
        }

        <!-- Contact Info -->
        <div class="space-y-3">
          <label class="block text-xs font-semibold text-slate-600 uppercase tracking-wider">Reach Info</label>
          <div class="relative">
            <lucide-icon name="mail" [size]="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input [(ngModel)]="email" type="email" placeholder="Email Address" class="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-blue-500">
          </div>
          <div class="relative">
            <lucide-icon name="share-2" [size]="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input [(ngModel)]="linkedInUrl" type="url" placeholder="LinkedIn URL" class="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-blue-500">
          </div>
          <div class="relative">
            <lucide-icon name="phone" [size]="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input [(ngModel)]="phone" type="tel" placeholder="Phone Number" class="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-blue-500">
          </div>
        </div>

        <!-- Reach Status -->
        <div>
          <label class="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Current Reach Status</label>
          <select [(ngModel)]="reachStatus" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-blue-500 text-slate-700">
            <option value="not_contacted">Not Contacted</option>
            <option value="messaged">Messaged</option>
            <option value="replied">Replied</option>
            <option value="call_scheduled">Call Scheduled</option>
            <option value="met">Met</option>
          </select>
        </div>
        
        <!-- Scoped Opps -->
        @if (opportunityIdContext) {
          <div class="flex items-center gap-2 mt-2">
            <input type="checkbox" id="scope-opp" [(ngModel)]="scopeToCurrentOpp" class="rounded text-blue-600 focus:ring-blue-500">
            <label for="scope-opp" class="text-xs text-slate-600">Only relevant to this specific opportunity (not org-wide)</label>
          </div>
        }

      </div>

      <!-- Footer Actions -->
      <div class="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50 flex-shrink-0">
        <button (click)="close.emit()" class="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
          Cancel
        </button>
        <button (click)="save()" [disabled]="!isValid()" class="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all active:scale-95">
          Save Contact
        </button>
      </div>
    </div>
  `
})
export class ContactFormComponent {
  @Input() initialContact?: Contact;
  @Input() organizationId!: string;
  @Input() opportunityIdContext?: string; // If opened from an opportunity workspace

  @Output() saveContact = new EventEmitter<Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>>();
  @Output() close = new EventEmitter<void>();

  // Form Fields
  name = '';
  role = '';
  department = '';
  types = signal<ContactType[]>([]);
  email = '';
  phone = '';
  linkedInUrl = '';
  reachStatus: ReachStatus = 'not_contacted';
  referralType: ReferralType = 'internal';
  referralStatus: ReferralStatus = 'not_asked';
  scopeToCurrentOpp = false;

  readonly availableTypes: { value: ContactType; label: string }[] = [
    { value: 'talent-acquisition', label: 'Recruiter / TA' },
    { value: 'hr', label: 'HR' },
    { value: 'hiring-manager', label: 'Hiring Manager' },
    { value: 'internal-referral', label: 'Internal Referral' },
    { value: 'external-referral', label: 'External Referral' },
    { value: 'peer', label: 'Peer' },
    { value: 'other', label: 'Other' }
  ];

  ngOnInit() {
    if (this.initialContact) {
      this.name = this.initialContact.name;
      this.role = this.initialContact.role || '';
      this.department = this.initialContact.department || '';
      this.types.set([...this.initialContact.types]);
      this.email = this.initialContact.email || '';
      this.phone = this.initialContact.phone || '';
      this.linkedInUrl = this.initialContact.linkedInUrl || '';
      this.reachStatus = this.initialContact.reachStatus;
      
      if (this.initialContact.referralType) this.referralType = this.initialContact.referralType;
      if (this.initialContact.referralStatus) this.referralStatus = this.initialContact.referralStatus;
      
      if (this.opportunityIdContext && this.initialContact.scopedOpportunityIds.includes(this.opportunityIdContext)) {
        this.scopeToCurrentOpp = true;
      }
    }
  }

  toggleType(type: ContactType) {
    this.types.update(list => {
      if (list.includes(type)) return list.filter(t => t !== type);
      return [...list, type];
    });
  }

  hasReferralType(): boolean {
    return this.types().includes('internal-referral') || this.types().includes('external-referral');
  }

  isValid(): boolean {
    return this.name.trim().length > 0 && this.types().length > 0;
  }

  save() {
    if (!this.isValid()) return;

    const scopedOpps = this.scopeToCurrentOpp && this.opportunityIdContext 
      ? [this.opportunityIdContext] 
      : (this.initialContact?.scopedOpportunityIds || []);

    this.saveContact.emit({
      organizationId: this.organizationId,
      scopedOpportunityIds: scopedOpps,
      name: this.name.trim(),
      avatarInitials: this.getInitials(this.name),
      role: this.role.trim() || undefined,
      department: this.department.trim() || undefined,
      types: this.types(),
      email: this.email.trim() || undefined,
      phone: this.phone.trim() || undefined,
      linkedInUrl: this.linkedInUrl.trim() || undefined,
      reachStatus: this.reachStatus,
      referralType: this.hasReferralType() ? this.referralType : undefined,
      referralStatus: this.hasReferralType() ? this.referralStatus : undefined
    });
  }

  private getInitials(name: string): string {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    if (parts.length === 1 && parts[0].length >= 2) return parts[0].substring(0, 2).toUpperCase();
    return name.charAt(0).toUpperCase();
  }
}
