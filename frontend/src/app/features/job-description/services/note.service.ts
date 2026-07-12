import { inject, Injectable, signal } from '@angular/core';
import { LocalStorageService } from '../../../core/services/local-storage.service';
import { Note } from '../models/opportunity.models';

const STORAGE_KEY = 'edudash_prep_notes_v1';

@Injectable({
  providedIn: 'root'
})
export class NoteService {
  private readonly storage = inject(LocalStorageService);
  
  private readonly notesSignal = signal<Note[]>(this.loadFromStorage());
  readonly notes = this.notesSignal.asReadonly();

  private loadFromStorage(): Note[] {
    return this.storage.getItem<Note[]>(STORAGE_KEY) || [];
  }

  private saveToStorage(notes: Note[]) {
    this.storage.setItem(STORAGE_KEY, notes);
    this.notesSignal.set(notes);
  }

  getByOpportunityId(oppId: string): Note[] {
    return this.notesSignal().filter(n => n.opportunityId === oppId);
  }

  add(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Note {
    const newNote: Note = {
      ...note,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.saveToStorage([...this.notesSignal(), newNote]);
    return newNote;
  }

  update(id: string, updates: Partial<Note>): Note | undefined {
    const notes = this.notesSignal();
    const index = notes.findIndex(n => n.id === id);
    
    if (index === -1) return undefined;

    const updatedNote = {
      ...notes[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    const updatedNotes = [...notes];
    updatedNotes[index] = updatedNote;
    
    this.saveToStorage(updatedNotes);
    return updatedNote;
  }

  delete(id: string): void {
    this.saveToStorage(this.notesSignal().filter(n => n.id !== id));
  }
}
