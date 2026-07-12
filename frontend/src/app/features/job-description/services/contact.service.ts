import { inject, Injectable, signal } from '@angular/core';
import { LocalStorageService } from '../../../core/services/local-storage.service';
import { Contact } from '../models/opportunity.models';

const STORAGE_KEY = 'edudash_contacts_v2';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private readonly storage = inject(LocalStorageService);
  
  // State
  private readonly contactsSignal = signal<Contact[]>(this.loadFromStorage());
  readonly contacts = this.contactsSignal.asReadonly();

  constructor() {}

  private loadFromStorage(): Contact[] {
    return this.storage.getItem<Contact[]>(STORAGE_KEY) || [];
  }

  private saveToStorage(contacts: Contact[]) {
    this.storage.setItem(STORAGE_KEY, contacts);
    this.contactsSignal.set(contacts);
  }

  getByOrgId(orgId: string): Contact[] {
    return this.contactsSignal().filter(c => c.organizationId === orgId);
  }

  getByOpportunityId(oppId: string): Contact[] {
    // Return contacts that either don't have scopes (all opps) or explicitly scope this opp
    return this.contactsSignal().filter(c => 
      c.scopedOpportunityIds.length === 0 || c.scopedOpportunityIds.includes(oppId)
    );
  }

  add(contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Contact {
    const newContact: Contact = {
      ...contact,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.saveToStorage([...this.contactsSignal(), newContact]);
    return newContact;
  }

  update(id: string, updates: Partial<Contact>): Contact | undefined {
    const contacts = this.contactsSignal();
    const index = contacts.findIndex(c => c.id === id);
    
    if (index === -1) return undefined;

    const updatedContact = {
      ...contacts[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    const newContacts = [...contacts];
    newContacts[index] = updatedContact;
    this.saveToStorage(newContacts);
    
    return updatedContact;
  }

  delete(id: string): void {
    this.saveToStorage(this.contactsSignal().filter(c => c.id !== id));
  }
}
