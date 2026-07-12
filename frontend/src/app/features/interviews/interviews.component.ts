import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { trigger, transition, style, animate } from '@angular/animations';

interface InterviewQuestion {
  id: string;
  topic: string;
  question: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

interface CompanyInterview {
  id: string;
  companyName: string;
  role: string;
  logoColor: string;
  date: string;
  r1Questions: InterviewQuestion[];
}

const MOCK_INTERVIEWS: CompanyInterview[] = [
  {
    id: '1',
    companyName: 'Google',
    role: 'Senior Frontend Engineer',
    logoColor: 'from-red-500 to-yellow-500',
    date: 'Oct 2025',
    r1Questions: [
      { id: 'q1', topic: 'System Design', question: 'Design a scalable web-based document editor (like Google Docs) handling concurrent edits.', difficulty: 'Hard' },
      { id: 'q2', topic: 'JavaScript/DOM', question: 'Implement a debounce function with leading and trailing edge execution options.', difficulty: 'Medium' },
      { id: 'q3', topic: 'Algorithms', question: 'Find the longest substring without repeating characters.', difficulty: 'Medium' }
    ]
  },
  {
    id: '2',
    companyName: 'Meta',
    role: 'Full Stack Developer',
    logoColor: 'from-blue-600 to-blue-400',
    date: 'Nov 2025',
    r1Questions: [
      { id: 'q4', topic: 'React Internals', question: 'Explain how the virtual DOM works and how React decides to re-render components.', difficulty: 'Medium' },
      { id: 'q5', topic: 'Algorithms', question: 'Merge K sorted lists.', difficulty: 'Hard' },
      { id: 'q6', topic: 'Architecture', question: 'How would you structure a large-scale React application to ensure optimal performance and maintainability?', difficulty: 'Medium' }
    ]
  },
  {
    id: '3',
    companyName: 'Amazon',
    role: 'SDE II',
    logoColor: 'from-orange-500 to-amber-600',
    date: 'Dec 2025',
    r1Questions: [
      { id: 'q7', topic: 'Algorithms', question: 'Number of Islands: Given an m x n 2D binary grid grid which represents a map of 1s (land) and 0s (water), return the number of islands.', difficulty: 'Medium' },
      { id: 'q8', topic: 'System Design', question: 'Design a TinyURL or URL shortener service.', difficulty: 'Hard' },
      { id: 'q9', topic: 'Behavioral', question: 'Tell me about a time you had to disagree with a manager.', difficulty: 'Easy' }
    ]
  },
  {
    id: '4',
    companyName: 'Stripe',
    role: 'Frontend Engineer',
    logoColor: 'from-indigo-500 to-purple-500',
    date: 'Jan 2026',
    r1Questions: [
      { id: 'q10', topic: 'UI/UX Implementation', question: 'Build a highly accessible, animated custom dropdown component from scratch.', difficulty: 'Medium' },
      { id: 'q11', topic: 'State Management', question: 'How do you manage complex global state without third-party libraries?', difficulty: 'Medium' },
      { id: 'q12', topic: 'Testing', question: 'Write unit tests for a custom React hook that fetches data asynchronously with caching.', difficulty: 'Medium' }
    ]
  }
];

@Component({
  selector: 'app-interviews',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
  template: `
    <div class="h-full flex flex-col bg-slate-50 overflow-hidden">
      
      <!-- ── Page Header ── -->
      <div class="flex-shrink-0 px-8 py-6 bg-white border-b border-slate-200">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
            <lucide-icon name="briefcase" [size]="20" class="text-white"></lucide-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-slate-800 tracking-tight">Company Interviews</h1>
            <p class="text-sm text-slate-500 mt-0.5">Explore real interview questions asked during Round 1 (R1) interviews.</p>
          </div>
        </div>
      </div>

      <!-- ── Master-Detail Layout ── -->
      <div class="flex-1 flex overflow-hidden">
        
        <!-- ── Left: Master List (Companies) ── -->
        <div class="w-1/3 max-w-sm border-r border-slate-200 bg-white flex flex-col h-full overflow-y-auto scrollbar-premium">
          <div class="p-4 border-b border-slate-100 bg-white sticky top-0 z-10">
            <div class="relative">
              <lucide-icon name="search" [size]="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></lucide-icon>
              <input type="text" placeholder="Search companies..." 
                     class="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all">
            </div>
          </div>

          <div class="p-3 space-y-1.5">
            @for (company of companies(); track company.id) {
              <button 
                (click)="selectCompany(company)"
                class="w-full text-left group relative flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all duration-200 ease-in-out border outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                [class.bg-indigo-50]="selectedCompany()?.id === company.id"
                [class.border-indigo-200]="selectedCompany()?.id === company.id"
                [class.shadow-sm]="selectedCompany()?.id === company.id"
                [class.border-transparent]="selectedCompany()?.id !== company.id"
                [class.hover:bg-slate-50]="selectedCompany()?.id !== company.id"
              >
                <!-- Selection Indicator -->
                @if (selectedCompany()?.id === company.id) {
                  <div class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-600 rounded-r-full shadow-[0_0_8px_rgba(79,70,229,0.5)]"></div>
                }

                <!-- Company Logo Placeholder -->
                <div class="w-12 h-12 rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0 shadow-sm text-white font-bold text-lg"
                     [ngClass]="company.logoColor">
                  {{ company.companyName.charAt(0) }}
                </div>

                <!-- Company Details -->
                <div class="flex-1 min-w-0">
                  <div class="flex justify-between items-center mb-0.5">
                    <h3 class="text-sm font-bold text-slate-800 truncate transition-colors"
                        [class.text-indigo-800]="selectedCompany()?.id === company.id"
                        [class.group-hover:text-indigo-700]="selectedCompany()?.id !== company.id">
                      {{ company.companyName }}
                    </h3>
                    <span class="text-[10px] font-medium text-slate-400 whitespace-nowrap">{{ company.date }}</span>
                  </div>
                  <p class="text-xs text-slate-500 truncate" 
                     [class.text-indigo-600]="selectedCompany()?.id === company.id">{{ company.role }}</p>
                </div>
              </button>
            }
          </div>
        </div>

        <!-- ── Right: Detail View (Questions) ── -->
        <div class="flex-1 bg-slate-50/50 overflow-y-auto scrollbar-premium relative">
          @if (selectedCompany(); as activeCompany) {
            <div class="p-8 max-w-3xl mx-auto">
              
              <!-- Company Detail Header -->
              <div class="mb-8 flex items-center justify-between" @fadeIn>
                <div>
                  <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-3">
                    <lucide-icon name="list-checks" [size]="14"></lucide-icon>
                    R1 Interview
                  </div>
                  <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">{{ activeCompany.companyName }}</h2>
                  <p class="text-slate-500 mt-1 flex items-center gap-2">
                    <lucide-icon name="user-circle" [size]="16" class="text-slate-400"></lucide-icon>
                    {{ activeCompany.role }} &bull; {{ activeCompany.date }}
                  </p>
                </div>
                
                <div class="w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg text-white font-bold text-3xl rotate-3"
                     [ngClass]="activeCompany.logoColor">
                  {{ activeCompany.companyName.charAt(0) }}
                </div>
              </div>

              <!-- Questions List -->
              <div class="space-y-4">
                <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-200 pb-2" @fadeIn>Questions Asked</h3>
                
                @for (q of activeCompany.r1Questions; track q.id; let i = $index) {
                  <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-indigo-300 transition-all duration-300 group"
                       [style.animation-delay]="i * 100 + 'ms'" @fadeIn>
                    <div class="flex items-start gap-5">
                      <div class="w-10 h-10 rounded-full bg-slate-50 text-slate-500 flex items-center justify-center font-bold text-sm flex-shrink-0 border border-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors shadow-sm">
                        {{ i + 1 }}
                      </div>
                      <div class="flex-1">
                        <div class="flex items-center justify-between mb-3">
                          <span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            {{ q.topic }}
                          </span>
                          <span class="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-white border"
                                [class.text-emerald-600]="q.difficulty === 'Easy'"
                                [class.border-emerald-100]="q.difficulty === 'Easy'"
                                [class.text-amber-600]="q.difficulty === 'Medium'"
                                [class.border-amber-100]="q.difficulty === 'Medium'"
                                [class.text-rose-600]="q.difficulty === 'Hard'"
                                [class.border-rose-100]="q.difficulty === 'Hard'">
                            {{ q.difficulty }}
                          </span>
                        </div>
                        <p class="text-slate-800 font-medium text-[15px] leading-relaxed">
                          {{ q.question }}
                        </p>
                      </div>
                    </div>
                  </div>
                }
              </div>
              
            </div>
          } @else {
            <div class="absolute inset-0 flex flex-col items-center justify-center text-center p-8 animate-fade-in">
              <div class="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-5 border-2 border-dashed border-slate-200 shadow-sm">
                <lucide-icon name="briefcase" [size]="40" class="text-slate-300"></lucide-icon>
              </div>
              <h3 class="text-xl font-bold text-slate-800 mb-2">Select a Company</h3>
              <p class="text-slate-500 max-w-md">Choose a company from the list on the left to view the specific questions asked during their Round 1 interviews.</p>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class InterviewsComponent {
  companies = signal<CompanyInterview[]>(MOCK_INTERVIEWS);
  selectedCompany = signal<CompanyInterview | null>(null);

  selectCompany(company: CompanyInterview) {
    this.selectedCompany.set(company);
  }
}
