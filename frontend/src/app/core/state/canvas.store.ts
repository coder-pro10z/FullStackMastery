import { Injectable, computed, effect, inject, signal } from '@angular/core';
import {
  ICanvasKeywordItem,
  ICanvasQaItem,
  ICanvasState,
  PitchStrategyCheckField,
  PitchStrategyTextField
} from '../models/canvas.model';
import { LocalStorageService } from '../services/local-storage.service';
import { ImportPipelineResult } from '../../features/interview-canvas/models/canvas-import.models';

const CANVAS_STORAGE_KEY = 'eduDash_canvasState';

@Injectable({
  providedIn: 'root'
})
export class CanvasStore {
  private localStorage = inject(LocalStorageService);

  private readonly defaultState: ICanvasState = {
    title: 'Role Title / Company Name',
    checklist: {
      jdItems: [
        {
          id: 'j1',
          text: 'Architect and maintain robust backend systems using .NET Core and C#.',
          checked: false
        },
        {
          id: 'j2',
          text: 'Demonstrable experience in designing, developing, debugging, and implementing .Net applications within AWS environments.',
          checked: false
        }
      ],
      resumeItems: [
        {
          id: 'r1',
          text: 'Improved enterprise module response performance by 30% using ASP.NET Core Web API and C#.',
          checked: false
        },
        {
          id: 'r2',
          text: 'Architected scalable Microservices using Dependency Injection, SOLID principles, and messaging queues.',
          checked: false
        }
      ]
    },
    pitchStrategy: {
      introChecked: false,
      aboutChecked: false,
      customChecked: false,
      introText: 'The following analysis presents an exhaustive interview preparation framework...',
      aboutText: 'Praveen Kashyap is a Full Stack Software Engineer with enterprise experience...',
      customTitle: 'Strategic Gap Analysis',
      customText: 'Identified three critical alignment vectors to bridge during the interview...'
    },
    qaItems: [
      {
        id: 'q1',
        q: 'Explain the different dependency injection lifetimes in .NET Core and when you would use each.',
        motive: 'Tests fundamental ASP.NET Core architectural knowledge and memory management.',
        hint: 'Define lifecycles: Transient (every time), Scoped (per request), Singleton (app lifetime).',
        a: 'For global caching, utilize AddSingleton. For per-request database context, AddScoped is mandatory. Never inject a Scoped service into a Singleton.',
        showHint: false,
        showAnswer: false,
        checked: false
      }
    ],
    keywords: []
  };

  private state = signal<ICanvasState>(this.getInitialState());

  readonly canvasState = computed(() => this.state());
  readonly title = computed(() => this.state().title);
  readonly checklist = computed(() => this.state().checklist);
  readonly jdItems = computed(() => this.state().checklist.jdItems);
  readonly resumeItems = computed(() => this.state().checklist.resumeItems);
  readonly pitchStrategy = computed(() => this.state().pitchStrategy);
  readonly qaItems = computed(() => this.state().qaItems);
  readonly keywords = computed(() => this.state().keywords ?? []);

  constructor() {
    effect(() => {
      this.localStorage.setItem(CANVAS_STORAGE_KEY, this.state());
    });
  }

  toggleJdItem(id: string): void {
    this.state.update((state) => ({
      ...state,
      checklist: {
        ...state.checklist,
        jdItems: this.toggleChecklistItem(state.checklist.jdItems, id)
      }
    }));
  }

  toggleResumeItem(id: string): void {
    this.state.update((state) => ({
      ...state,
      checklist: {
        ...state.checklist,
        resumeItems: this.toggleChecklistItem(state.checklist.resumeItems, id)
      }
    }));
  }

  setPitchChecked(field: PitchStrategyCheckField, checked: boolean): void {
    this.state.update((state) => ({
      ...state,
      pitchStrategy: {
        ...state.pitchStrategy,
        [field]: checked
      }
    }));
  }

  updatePitchText(field: PitchStrategyTextField, text: string): void {
    this.state.update((state) => ({
      ...state,
      pitchStrategy: {
        ...state.pitchStrategy,
        [field]: text
      }
    }));
  }

  updateTitle(title: string): void {
    this.state.update((state) => ({
      ...state,
      title
    }));
  }

  toggleQaHint(id: string): void {
    this.updateQaItem(id, (item) => ({ ...item, showHint: !item.showHint }));
  }

  toggleQaAnswer(id: string): void {
    this.updateQaItem(id, (item) => ({ ...item, showAnswer: !item.showAnswer }));
  }

  setQaChecked(id: string, checked: boolean): void {
    this.updateQaItem(id, (item) => ({ ...item, checked }));
  }

  toggleQaChecked(id: string): void {
    this.updateQaItem(id, (item) => ({ ...item, checked: !item.checked }));
  }

  addQa(item?: Partial<ICanvasQaItem>): void {
    const nextItem: ICanvasQaItem = {
      id: item?.id ?? crypto.randomUUID(),
      q: item?.q ?? 'New interview question',
      motive: item?.motive ?? 'Add why this question is likely to come up.',
      hint: item?.hint ?? 'Add a concise hint for your answer structure.',
      a: item?.a ?? 'Draft your polished answer here.',
      showHint: item?.showHint ?? false,
      showAnswer: item?.showAnswer ?? true,
      checked: item?.checked ?? false
    };

    this.state.update((state) => ({
      ...state,
      qaItems: [...state.qaItems, nextItem]
    }));
  }

  /** Bulk-add keyword strings (from paste or CSV import). Deduplicates by normalized term. */
  bulkAddKeywords(terms: string[]): void {
    const existing = new Set(this.state().keywords.map(k => k.term.toLowerCase()));
    const newItems: ICanvasKeywordItem[] = terms
      .filter(t => t.trim() && !existing.has(t.trim().toLowerCase()))
      .map(t => ({
        id: crypto.randomUUID(),
        term: t.trim(),
        def: '',
        useCase: '',
        impl: '',
        checked: false
      }));
    this.state.update(s => ({ ...s, keywords: [...(s.keywords ?? []), ...newItems] }));
  }

  /** Bulk-add Q&A question strings. Each string becomes a new card. */
  bulkAddQA(questions: string[]): void {
    const newItems: ICanvasQaItem[] = questions
      .filter(q => q.trim().length > 5)
      .map(q => ({
        id: crypto.randomUUID(),
        q: q.trim(),
        motive: 'Auto-generated from import — add context.',
        hint: 'Add a concise hint for your answer structure.',
        a: 'Draft your polished answer here.',
        showHint: false,
        showAnswer: false,
        checked: false
      }));
    this.state.update(s => ({ ...s, qaItems: [...s.qaItems, ...newItems] }));
  }

  /** Apply a full import pipeline result — atomically updates JD checklist, resume checklist, keywords, and Q&A. */
  applyImportResult(result: ImportPipelineResult): void {
    this.state.update(s => {
      const newJdItems = result.jdPointers.map(p => ({
        id: p.id,
        text: p.text,
        checked: false
      }));
      const newResumeItems = result.resumePointers.map(p => ({
        id: p.id,
        text: p.text,
        checked: false
      }));
      const newKeywords: ICanvasKeywordItem[] = result.keywords.map(k => ({
        id: k.id,
        term: k.term,
        def: '',
        useCase: `Appeared ${k.frequency}× in JD. Status: ${k.matchStatus}.`,
        impl: '',
        checked: false,
        matchStatus: k.matchStatus,
        category: k.category
      }));
      const newQa: ICanvasQaItem[] = result.suggestedQuestions.map(q => ({
        id: crypto.randomUUID(),
        q,
        motive: 'Auto-generated from gap analysis.',
        hint: 'Add a concise hint for your answer structure.',
        a: 'Draft your polished answer here.',
        showHint: false,
        showAnswer: false,
        checked: false
      }));
      return {
        ...s,
        checklist: {
          jdItems: newJdItems.length ? newJdItems : s.checklist.jdItems,
          resumeItems: newResumeItems.length ? newResumeItems : s.checklist.resumeItems
        },
        keywords: newKeywords.length ? newKeywords : (s.keywords ?? []),
        qaItems: [...s.qaItems, ...newQa]
      };
    });
  }

  /** Add or update a single keyword (used by manual add button). */
  addKeyword(term: string): void {
    if (!term.trim()) return;
    const exists = this.state().keywords.some(k => k.term.toLowerCase() === term.trim().toLowerCase());
    if (exists) return;
    const item: ICanvasKeywordItem = {
      id: crypto.randomUUID(),
      term: term.trim(),
      def: '',
      useCase: '',
      impl: '',
      checked: false
    };
    this.state.update(s => ({ ...s, keywords: [...(s.keywords ?? []), item] }));
  }

  setKeywordChecked(id: string, checked: boolean): void {
    this.state.update(s => ({
      ...s,
      keywords: (s.keywords ?? []).map(k => k.id === id ? { ...k, checked } : k)
    }));
  }

  updateKeyword(id: string, updates: Partial<ICanvasKeywordItem>): void {
    this.state.update(s => ({
      ...s,
      keywords: (s.keywords ?? []).map(k => k.id === id ? { ...k, ...updates } : k)
    }));
  }

  reset(): void {
    this.state.set(this.cloneState(this.defaultState));
  }

  private getInitialState(): ICanvasState {
    const savedState = this.localStorage.getItem<ICanvasState>(CANVAS_STORAGE_KEY);
    return this.normalizeState(savedState);
  }

  private normalizeState(savedState: ICanvasState | null): ICanvasState {
    if (!savedState) {
      return this.cloneState(this.defaultState);
    }

    return {
      title: savedState.title ?? this.defaultState.title,
      checklist: {
        jdItems: savedState.checklist?.jdItems ?? this.defaultState.checklist.jdItems,
        resumeItems: savedState.checklist?.resumeItems ?? this.defaultState.checklist.resumeItems
      },
      pitchStrategy: {
        ...this.defaultState.pitchStrategy,
        ...savedState.pitchStrategy
      },
      qaItems: savedState.qaItems ?? this.defaultState.qaItems,
      keywords: savedState.keywords ?? this.defaultState.keywords
    };
  }

  private toggleChecklistItem<T extends { id: string; checked: boolean }>(items: T[], id: string): T[] {
    return items.map((item) => item.id === id ? { ...item, checked: !item.checked } : item);
  }

  private updateQaItem(id: string, update: (item: ICanvasQaItem) => ICanvasQaItem): void {
    this.state.update((state) => ({
      ...state,
      qaItems: state.qaItems.map((item) => item.id === id ? update(item) : item)
    }));
  }

  private cloneState(state: ICanvasState): ICanvasState {
    return structuredClone(state);
  }
}
