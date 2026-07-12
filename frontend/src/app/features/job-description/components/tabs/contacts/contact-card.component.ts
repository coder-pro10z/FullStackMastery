import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { Contact } from '../../../models/opportunity.models';
import { ReferralPipelineComponent } from '../../shared/referral-pipeline.component';

@Component({
  selector: 'app-contact-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ReferralPipelineComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div class="flex items-start justify-between mb-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-500">
            {{ contact.avatarInitials || contact.name.charAt(0) }}
          </div>
          <div>
            <h3 class="text-sm font-bold text-slate-800">{{ contact.name }}</h3>
            <p class="text-xs text-slate-500">{{ contact.role || 'Role unknown' }} @if (contact.department) { • {{ contact.department }} }</p>
          </div>
        </div>
        
        <!-- Contact Types Badges -->
        <div class="flex gap-1.5 flex-wrap justify-end max-w-[50%]">
          @for (type of contact.types; track type) {
            <span 
              class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
              [ngClass]="{
                'bg-blue-50 text-blue-700': type === 'hr' || type === 'talent-acquisition',
                'bg-emerald-50 text-emerald-700': type === 'internal-referral' || type === 'external-referral',
                'bg-violet-50 text-violet-700': type === 'hiring-manager',
                'bg-slate-100 text-slate-600': type === 'peer' || type === 'other'
              }"
            >
              {{ formatType(type) }}
            </span>
          }
        </div>
      </div>

      <!-- Links & Reach Status -->
      <div class="flex items-center justify-between mt-4">
        <div class="flex items-center gap-3">
          @if (contact.email) {
            <a [href]="'mailto:' + contact.email" class="text-slate-400 hover:text-blue-600 transition-colors" title="Email">
              <lucide-icon name="mail" [size]="16" />
            </a>
          }
          @if (contact.phone) {
            <a [href]="'tel:' + contact.phone" class="text-slate-400 hover:text-blue-600 transition-colors" title="Phone">
              <lucide-icon name="phone" [size]="16" />
            </a>
          }
          @if (contact.linkedInUrl) {
            <a [href]="contact.linkedInUrl" target="_blank" class="text-slate-400 hover:text-blue-600 transition-colors" title="LinkedIn">
              <lucide-icon name="share-2" [size]="16" />
            </a>
          }
        </div>
        
        <div class="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg text-xs font-medium text-slate-600">
          <span class="w-1.5 h-1.5 rounded-full"
            [ngClass]="{
              'bg-slate-300': contact.reachStatus === 'not_contacted',
              'bg-blue-400': contact.reachStatus === 'messaged',
              'bg-amber-400': contact.reachStatus === 'replied',
              'bg-violet-400': contact.reachStatus === 'call_scheduled',
              'bg-emerald-500': contact.reachStatus === 'met'
            }"
          ></span>
          {{ formatReachStatus(contact.reachStatus) }}
        </div>
      </div>

      <!-- Referral Pipeline (if applicable) -->
      @if (hasReferralType(contact)) {
        <div class="mt-4 pt-4 border-t border-slate-100">
          <app-referral-pipeline [status]="contact.referralStatus || 'not_asked'" />
        </div>
      }
    </div>
  `
})
export class ContactCardComponent {
  @Input({ required: true }) contact!: Contact;

  formatType(type: string): string {
    return type.replace('-', ' ');
  }

  formatReachStatus(status: string): string {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  hasReferralType(contact: Contact): boolean {
    return contact.types.includes('internal-referral') || contact.types.includes('external-referral');
  }
}
