import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AdminInterviewStore } from '../../../core/state/admin-interview.store';
import { Company } from '../../../core/models/admin-interview.models';

@Component({
  selector: 'app-admin-interview-list',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-8 max-w-7xl mx-auto h-full flex flex-col">
      <!-- ── Header ── -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-extrabold text-slate-800 tracking-tight">Interview Manager</h1>
          <p class="text-slate-500 mt-1 text-sm">Manage companies, roles, rounds, and specific interview questions.</p>
        </div>
        <button (click)="navigateToAddCompany()" class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1">
          <lucide-icon name="plus" [size]="16"></lucide-icon>
          Add Company
        </button>
      </div>

      <!-- ── Quick Stats ── -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
          <div class="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center">
            <lucide-icon name="building-2" [size]="24" class="text-indigo-600"></lucide-icon>
          </div>
          <div>
            <p class="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Companies</p>
            <p class="text-2xl font-black text-slate-800">{{ store.companies().length }}</p>
          </div>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
          <div class="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center">
            <lucide-icon name="users" [size]="24" class="text-emerald-600"></lucide-icon>
          </div>
          <div>
            <p class="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Roles</p>
            <p class="text-2xl font-black text-slate-800">12</p>
          </div>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
          <div class="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center">
            <lucide-icon name="file-question" [size]="24" class="text-amber-600"></lucide-icon>
          </div>
          <div>
            <p class="text-sm font-bold text-slate-400 uppercase tracking-wider">Pending Solutions</p>
            <p class="text-2xl font-black text-slate-800">5</p>
          </div>
        </div>
      </div>

      <!-- ── Table ── -->
      <div class="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div class="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h2 class="font-bold text-slate-700">Company Database</h2>
          <div class="relative">
            <lucide-icon name="search" [size]="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></lucide-icon>
            <input type="text" placeholder="Search companies..." 
                   class="w-64 pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-shadow">
          </div>
        </div>
        
        <div class="flex-1 overflow-auto scrollbar-premium relative">
          @if (store.isLoadingCompanies()) {
            <div class="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
              <lucide-icon name="loader-2" [size]="24" class="animate-spin text-indigo-600"></lucide-icon>
            </div>
          }
          
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider font-bold text-slate-500">
                <th class="py-3 px-6">Company</th>
                <th class="py-3 px-6">Industry</th>
                <th class="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (company of store.companies(); track company.id) {
                <tr class="border-b border-slate-100 hover:bg-slate-50/80 transition-colors group">
                  <td class="py-4 px-6">
                    <div class="flex items-center gap-4">
                      <div class="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm text-white font-bold text-lg bg-gradient-to-br"
                           [ngClass]="company.logo">
                        {{ company.name.charAt(0) }}
                      </div>
                      <span class="font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">{{ company.name }}</span>
                    </div>
                  </td>
                  <td class="py-4 px-6">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                      {{ company.industry }}
                    </span>
                  </td>
                  <td class="py-4 px-6 text-right">
                    <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a [routerLink]="['/admin/interviews', company.id]" 
                         class="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                         title="Edit Company Data">
                        <lucide-icon name="pencil" [size]="16"></lucide-icon>
                      </a>
                      <button (click)="openDeleteModal(company)" 
                              class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                              title="Delete Company">
                        <lucide-icon name="trash-2" [size]="16"></lucide-icon>
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                @if (!store.isLoadingCompanies()) {
                  <tr>
                    <td colspan="3" class="py-8 text-center text-slate-500">
                      No companies found. Click "Add Company" to get started.
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- ── Danger Zone Modal ── -->
      @if (showDeleteModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" (click)="closeDeleteModal()"></div>
          
          <!-- Modal Panel -->
          <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
            <div class="p-6 text-center">
              <div class="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-rose-50 shadow-sm">
                <lucide-icon name="alert-triangle" [size]="28" class="text-rose-600"></lucide-icon>
              </div>
              <h3 class="text-xl font-bold text-slate-900 mb-2">Delete {{ companyToDelete()?.name }}?</h3>
              <p class="text-sm text-slate-500 mb-6">
                This action is permanent and cannot be undone. 
                <span class="font-bold text-rose-600 block mt-2">Deleting this company will also delete all associated interviews, rounds, and questions.</span>
              </p>
              
              <div class="flex items-center gap-3 w-full">
                <button (click)="closeDeleteModal()" 
                        class="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200">
                  Cancel
                </button>
                <button (click)="confirmDelete()" 
                        class="flex-1 px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-1">
                  Yes, Delete It
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class AdminInterviewListComponent implements OnInit {
  store = inject(AdminInterviewStore);
  private router = inject(Router);

  showDeleteModal = signal(false);
  companyToDelete = signal<Company | null>(null);

  ngOnInit() {
    this.store.loadCompanies();
  }

  navigateToAddCompany() {
    this.router.navigate(['/admin/interviews', 'new']);
  }

  openDeleteModal(company: Company) {
    this.companyToDelete.set(company);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal() {
    this.showDeleteModal.set(false);
    this.companyToDelete.set(null);
  }

  confirmDelete() {
    const comp = this.companyToDelete();
    if (comp) {
      this.store.deleteCompany(comp.id);
      this.closeDeleteModal();
    }
  }
}
