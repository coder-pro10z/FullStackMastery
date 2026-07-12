import { inject, Injectable, signal, computed } from '@angular/core';
import { LocalStorageService } from '../../../core/services/local-storage.service';
import { Opportunity } from '../models/opportunity.models';

const STORAGE_KEY = 'edudash_opportunities_v2'; // changed from v1

@Injectable({
  providedIn: 'root'
})
export class OpportunityService {
  private readonly storage = inject(LocalStorageService);
  
  // State
  private readonly oppsSignal = signal<Opportunity[]>(this.loadFromStorage());
  readonly opportunities = this.oppsSignal.asReadonly();

  constructor() {}

  private loadFromStorage(): Opportunity[] {
    return this.storage.getItem<Opportunity[]>(STORAGE_KEY) || [];
  }

  private saveToStorage(opps: Opportunity[]) {
    this.storage.setItem(STORAGE_KEY, opps);
    this.oppsSignal.set(opps);
  }

  getById(id: string): Opportunity | undefined {
    return this.oppsSignal().find(o => o.id === id);
  }

  getByOrgId(orgId: string): Opportunity[] {
    return this.oppsSignal().filter(o => o.organizationId === orgId);
  }

  add(opp: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt'>): Opportunity {
    const newOpp: Opportunity = {
      ...opp,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.saveToStorage([...this.oppsSignal(), newOpp]);
    return newOpp;
  }

  update(id: string, updates: Partial<Opportunity>): Opportunity | undefined {
    const opps = this.oppsSignal();
    const index = opps.findIndex(o => o.id === id);
    
    if (index === -1) return undefined;

    const updatedOpp = {
      ...opps[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    const newOpps = [...opps];
    newOpps[index] = updatedOpp;
    this.saveToStorage(newOpps);
    
    return updatedOpp;
  }

  delete(id: string): void {
    this.saveToStorage(this.oppsSignal().filter(o => o.id !== id));
  }
}
