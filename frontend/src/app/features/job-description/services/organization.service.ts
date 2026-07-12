import { inject, Injectable, signal } from '@angular/core';
import { LocalStorageService } from '../../../core/services/local-storage.service';
import { Organization } from '../models/opportunity.models';

const STORAGE_KEY = 'edudash_organizations';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  private readonly storage = inject(LocalStorageService);
  
  // State
  private readonly orgsSignal = signal<Organization[]>(this.loadFromStorage());
  readonly organizations = this.orgsSignal.asReadonly();

  constructor() {}

  private loadFromStorage(): Organization[] {
    return this.storage.getItem<Organization[]>(STORAGE_KEY) || [];
  }

  private saveToStorage(orgs: Organization[]) {
    this.storage.setItem(STORAGE_KEY, orgs);
    this.orgsSignal.set(orgs);
  }

  getById(id: string): Organization | undefined {
    return this.orgsSignal().find(o => o.id === id);
  }

  add(org: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>): Organization {
    const newOrg: Organization = {
      ...org,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.saveToStorage([...this.orgsSignal(), newOrg]);
    return newOrg;
  }

  update(id: string, updates: Partial<Organization>): Organization | undefined {
    const orgs = this.orgsSignal();
    const index = orgs.findIndex(o => o.id === id);
    
    if (index === -1) return undefined;

    const updatedOrg = {
      ...orgs[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    const newOrgs = [...orgs];
    newOrgs[index] = updatedOrg;
    this.saveToStorage(newOrgs);
    
    return updatedOrg;
  }

  delete(id: string): void {
    this.saveToStorage(this.orgsSignal().filter(o => o.id !== id));
  }
}
