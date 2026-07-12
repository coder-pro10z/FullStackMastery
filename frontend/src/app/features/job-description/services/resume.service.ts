import { inject, Injectable, signal } from '@angular/core';
import { LocalStorageService } from '../../../core/services/local-storage.service';
import { Resume } from '../models/opportunity.models';

const STORAGE_KEY = 'edudash_resumes_v1';

@Injectable({
  providedIn: 'root'
})
export class ResumeService {
  private readonly storage = inject(LocalStorageService);
  
  private readonly resumesSignal = signal<Resume[]>(this.loadFromStorage());
  readonly resumes = this.resumesSignal.asReadonly();

  constructor() {}

  private loadFromStorage(): Resume[] {
    return this.storage.getItem<Resume[]>(STORAGE_KEY) || [];
  }

  private saveToStorage(resumes: Resume[]) {
    this.storage.setItem(STORAGE_KEY, resumes);
    this.resumesSignal.set(resumes);
  }

  getById(id: string): Resume | undefined {
    return this.resumesSignal().find(r => r.id === id);
  }

  add(resume: Omit<Resume, 'id' | 'createdAt' | 'updatedAt'>): Resume {
    const resumes = this.resumesSignal();
    
    // If this is set to default, unset others
    let updatedResumes = resumes;
    if (resume.isDefault) {
      updatedResumes = resumes.map(r => ({ ...r, isDefault: false }));
    } else if (resumes.length === 0) {
      // First resume is always default
      resume.isDefault = true;
    }

    const newResume: Resume = {
      ...resume,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.saveToStorage([...updatedResumes, newResume]);
    return newResume;
  }

  update(id: string, updates: Partial<Resume>): Resume | undefined {
    const resumes = this.resumesSignal();
    const index = resumes.findIndex(r => r.id === id);
    
    if (index === -1) return undefined;

    let updatedResumes = [...resumes];
    
    // Handle default swapping
    if (updates.isDefault) {
      updatedResumes = updatedResumes.map(r => ({ ...r, isDefault: false }));
    }

    const updatedResume = {
      ...resumes[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    updatedResumes[index] = updatedResume;
    this.saveToStorage(updatedResumes);
    
    return updatedResume;
  }

  delete(id: string): void {
    const resumes = this.resumesSignal();
    const toDelete = resumes.find(r => r.id === id);
    
    let updatedResumes = resumes.filter(r => r.id !== id);
    
    // If we deleted the default, make the first remaining one default
    if (toDelete?.isDefault && updatedResumes.length > 0) {
      updatedResumes[0] = { ...updatedResumes[0], isDefault: true };
    }
    
    this.saveToStorage(updatedResumes);
  }
}
