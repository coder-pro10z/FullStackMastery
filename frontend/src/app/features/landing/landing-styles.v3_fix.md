To achieve elite SaaS standards, we must treat the browser as a 3D canvas. I have refactored the architecture to eliminate the `TypeError` by moving logic to `ngAfterViewInit` with safe query checks. I've also swapped the problematic icon strings for verified Lucide aliases.

Below is the complete, production-ready implementation of **EduDash V2**.

### 1. The Logic (`landing.component.ts`)
*Fixes the `forEach` error and prepares the Intersection Observer.*

```typescript
import { Component, OnInit, AfterViewInit, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent implements OnInit, AfterViewInit {
  @ViewChildren('reveal') revealElements!: QueryList<ElementRef>;

  readonly features = [
    { icon: 'layout-dashboard', title: 'Personal Dashboard', text: 'See your streak, topic coverage, and next best action.' },
    { icon: 'file-check', title: 'JD Alignment', text: 'Turn job descriptions into concrete resume talking points.' },
    { icon: 'network', title: 'Skill Tree', text: 'Map technologies into a visible path for structured growth.' }
  ];

  readonly quizTopics = ['SQL Joins', 'System Design', 'Signals', 'APIs'];

  ngOnInit() {}

  ngAfterViewInit() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.15 });

    // Robust check to prevent "undefined" errors
    this.revealElements.changes.subscribe((queryList: QueryList<ElementRef>) => {
      queryList.forEach(el => observer.observe(el.nativeElement));
    });
    
    if (this.revealElements.length > 0) {
      this.revealElements.forEach(el => observer.observe(el.nativeElement));
    }
  }
}
```

### 2. The Template (`landing.component.html`)
*Integrated 3D Hero, Shadow Box Playground, and Floating UI elements.*

```html
<main class="landing-page bg-[#F8F9FA] text-[#202124] overflow-x-hidden selection:bg-[#1A73E8]/10">
    
    <!-- FEATURE 1: FLOATING OMNIBAR (CMD+K) -->
    <nav class="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-lg pointer-events-none">
        <div class="pointer-events-auto flex items-center gap-3 px-4 py-2 bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] reveal-fade-in" #reveal>
            <lucide-icon name="search" class="text-[#5F6368]" [size]="18"></lucide-icon>
            <span class="text-sm text-[#5F6368] flex-1">Search topics...</span>
            <div class="flex gap-1">
                <kbd class="px-1.5 py-0.5 rounded border border-[#E0E0E0] bg-[#F8F9FA] text-[10px] font-medium text-[#5F6368]">⌘</kbd>
                <kbd class="px-1.5 py-0.5 rounded border border-[#E0E0E0] bg-[#F8F9FA] text-[10px] font-medium text-[#5F6368]">K</kbd>
            </div>
        </div>
    </nav>

    <!-- FEATURE 2: FLOATING READINESS RING -->
    <aside class="fixed bottom-8 right-8 z-[100] pointer-events-none hidden md:block">
        <div class="pointer-events-auto p-4 bg-white/80 backdrop-blur-lg border border-white rounded-3xl shadow-2xl reveal-fade-in flex items-center gap-4 group" #reveal>
            <div class="relative h-12 w-12">
                <svg class="h-full w-full -rotate-90">
                    <circle cx="24" cy="24" r="20" stroke="#E0E0E0" stroke-width="4" fill="none" />
                    <circle cx="24" cy="24" r="20" stroke="#1A73E8" stroke-width="4" fill="none" 
                            stroke-dasharray="126" stroke-dashoffset="35" class="transition-all duration-[2s] ease-out" />
                </svg>
                <span class="absolute inset-0 flex items-center justify-center text-[10px] font-bold">72%</span>
            </div>
            <div class="pr-2">
                <p class="text-[10px] uppercase tracking-widest font-bold text-[#1A73E8]">Interview Ready</p>
                <p class="text-xs text-[#5F6368]">3 modules left</p>
            </div>
        </div>
    </aside>

    <!-- HERO SECTION: 3D SPATIAL EXPANSION -->
    <section class="relative min-h-screen flex flex-col items-center justify-center pt-20 px-6 overflow-hidden bg-white border-b border-[#E0E0E0]">
        <div class="absolute -top-[10%] -right-[5%] h-[500px] w-[500px] rounded-full bg-[#1A73E8] opacity-[0.03] blur-[120px]"></div>
        
        <div class="max-w-5xl text-center space-y-8 z-10 reveal-slide-up" #reveal>
            <span class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8F0FE] text-[#1A73E8] text-xs font-semibold border border-[#D2E3FC]">
                <lucide-icon name="sparkles" [size]="14"></lucide-icon>
                Next-gen preparation engine
            </span>
            <h1 class="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9] text-[#202124]">
                Engineering <br /><span class="text-[#1A73E8]">Readiness.</span>
            </h1>
            <p class="max-w-2xl mx-auto text-lg md:text-xl text-[#5F6368] leading-relaxed">
                Build high-probability interview mastery through a tactile dashboard that bridges the gap between job descriptions and technical execution.
            </p>
            <div class="flex flex-col sm:flex-row justify-center gap-4">
                <a routerLink="/dashboard" class="btn-primary-elite group">
                    Get Started Free
                    <lucide-icon name="arrow-right" class="group-hover:translate-x-1 transition-transform" [size]="18"></lucide-icon>
                </a>
            </div>
        </div>

        <!-- HERO 3D MOCKUP -->
        <div class="perspective-container mt-16 w-full max-w-6xl reveal-fade-in" #reveal>
            <div class="hero-3d-card rounded-2xl border border-white/50 bg-[#F8F9FA] p-2 shadow-2xl backdrop-blur-md">
                <div class="rounded-xl overflow-hidden bg-white border border-[#E0E0E0] shadow-inner aspect-[16/9] flex flex-col">
                    <div class="h-8 border-b border-[#F1F3F4] bg-[#F8F9FA] flex items-center px-4 gap-1.5">
                        <div class="h-2.5 w-2.5 rounded-full bg-[#EA4335]"></div>
                        <div class="h-2.5 w-2.5 rounded-full bg-[#FBBC04]"></div>
                        <div class="h-2.5 w-2.5 rounded-full bg-[#34A853]"></div>
                    </div>
                    <div class="flex-1 p-6 grid grid-cols-12 gap-6">
                        <div class="col-span-8 space-y-4">
                            <div class="h-32 rounded-xl bg-gradient-to-br from-[#F8F9FA] to-white border border-[#E0E0E0] p-4 relative">
                                <div class="absolute bottom-0 left-0 w-full h-1/2 flex items-end px-4 gap-1">
                                    <div class="flex-1 bg-[#1A73E8]/10 h-[20%] rounded-t-sm"></div>
                                    <div class="flex-1 bg-[#1A73E8]/20 h-[40%] rounded-t-sm"></div>
                                    <div class="flex-1 bg-[#1A73E8]/40 h-[70%] rounded-t-sm"></div>
                                    <div class="flex-1 bg-[#1A73E8] h-[55%] rounded-t-sm animate-pulse"></div>
                                </div>
                            </div>
                            <div class="grid grid-cols-3 gap-4">
                                <div *ngFor="let i of [1,2,3]" class="h-20 rounded-xl border border-[#E0E0E0] bg-white"></div>
                            </div>
                        </div>
                        <div class="col-span-4 rounded-xl border border-[#E0E0E0] bg-[#F8F9FA] p-4 flex flex-col justify-center items-center">
                            <div class="h-24 w-24 rounded-full border-[6px] border-[#34A853] border-t-transparent animate-spin-slow"></div>
                            <p class="mt-4 text-xs font-bold text-[#34A853] uppercase tracking-widest">Optimizing...</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- NEW SECTION: TACTILE PLAYGROUND (SHADOW BOX) -->
    <section class="relative py-32 bg-[#202124] overflow-hidden">
        <!-- Blueprint Grid -->
        <div class="absolute inset-0 blueprint-grid opacity-[0.05]"></div>
        
        <div class="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
            <div class="reveal-slide-in space-y-6" #reveal>
                <h2 class="text-4xl md:text-5xl font-bold text-white tracking-tight">
                    The Tactile <br /><span class="text-[#34A853]">Playground.</span>
                </h2>
                <p class="text-white/60 text-lg leading-relaxed">
                    Don't just read about architecture—manipulate it. Our playground integrates a real-time Code Sandbox with instant feedback loops.
                </p>
                <div class="grid grid-cols-2 gap-6 pt-6">
                    <div class="p-4 rounded-xl bg-white/5 border border-white/10 group hover:border-[#34A853] transition-colors">
                        <lucide-icon name="code" class="text-[#34A853] mb-3" [size]="20"></lucide-icon>
                        <h4 class="text-white font-bold">Sandbox</h4>
                        <p class="text-xs text-white/40 mt-1">Live .NET & SQL environments</p>
                    </div>
                    <div class="p-4 rounded-xl bg-white/5 border border-white/10 group hover:border-[#1A73E8] transition-colors">
                        <lucide-icon name="check-circle-2" class="text-[#1A73E8] mb-3" [size]="20"></lucide-icon>
                        <h4 class="text-white font-bold">Checkpoint</h4>
                        <p class="text-xs text-white/40 mt-1">Scenario-based logic tests</p>
                    </div>
                </div>
            </div>

            <!-- FEATURE 3 & 4: CODE SANDBOX + QUIZ (SHADOW BOX) -->
            <div class="relative h-[450px] reveal-fade-in" #reveal>
                <!-- Code Sandbox (Dark) -->
                <div class="absolute top-0 right-0 w-[90%] rounded-xl bg-[#161616] border border-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.5)] p-4 font-mono text-sm group transition-transform hover:-translate-y-2">
                    <div class="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
                        <div class="flex gap-2">
                            <div class="h-2.5 w-2.5 rounded-full bg-white/10"></div>
                            <span class="text-[10px] text-white/30 tracking-widest uppercase">system_design.sql</span>
                        </div>
                        <!-- FEATURE 5: BOOKMARK (Contextual) -->
                        <lucide-icon name="bookmark" class="text-white/20 hover:text-[#FBBC04] cursor-pointer transition-colors" [size]="14"></lucide-icon>
                    </div>
                    <p class="text-[#CE9178]"><span class="text-[#C586C0]">CREATE INDEX</span> idx_readiness</p>
                    <p class="text-[#9CDCFE] pl-4"><span class="text-[#C586C0]">ON</span> Interviews (score_pct <span class="text-[#B5CEA8]">DESC</span>);</p>
                    <p class="text-white/20 mt-4">// Indexing optimized for dashboard latency</p>
                </div>

                <!-- Quiz Checkpoint (Light) -->
                <div class="absolute bottom-0 left-0 w-[60%] rounded-xl bg-white border border-[#E0E0E0] shadow-2xl p-6 transition-all hover:scale-105 z-20">
                    <div class="flex items-center justify-between mb-4">
                        <span class="text-[10px] font-bold text-[#1A73E8] uppercase tracking-tighter">Quick Check</span>
                        <!-- FEATURE 6: COMPLETED STATE -->
                        <div class="h-5 w-5 rounded-full bg-[#E6F4EA] flex items-center justify-center">
                            <lucide-icon name="check" class="text-[#34A853]" [size]="12"></lucide-icon>
                        </div>
                    </div>
                    <h4 class="text-sm font-bold text-[#202124] mb-4">Why use a B-Tree for this index?</h4>
                    <div class="space-y-2">
                        <div class="p-2 rounded border border-[#34A853] bg-[#E6F4EA] text-[11px] font-medium text-[#1B5E20]">Efficient range scans for scores</div>
                        <div class="p-2 rounded border border-[#E0E0E0] text-[11px] text-[#5F6368]">O(1) lookup time</div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- SKILL TREE: ALIVE EFFECT -->
    <section class="max-w-7xl mx-auto px-6 py-32">
        <div class="text-center mb-20 reveal-slide-up" #reveal>
            <h2 class="text-4xl font-bold tracking-tight">Structured Growth.</h2>
            <p class="text-[#5F6368] mt-4">Your knowledge path is an evolving ecosystem, not a static list.</p>
        </div>

        <div class="relative flex justify-center reveal-fade-in" #reveal>
            <svg viewBox="0 0 800 400" class="w-full max-w-4xl">
                <!-- FEATURE 7: ALIVE NODES (Green Pulse) -->
                <path d="M400,350 L400,250 M400,250 L250,150 M400,250 L550,150" fill="none" stroke="#E0E0E0" stroke-width="2" />
                <path d="M400,350 L400,250" fill="none" stroke="#34A853" stroke-width="3" class="draw-path" />
                
                <!-- Active Node -->
                <g class="cursor-pointer">
                    <circle cx="400" cy="250" r="15" fill="#34A853" class="animate-ping-slow opacity-20" />
                    <circle cx="400" cy="250" r="10" fill="#34A853" class="shadow-green" />
                    <text x="420" y="255" class="text-sm font-bold fill-[#202124]">System Design</text>
                </g>
                
                <!-- Completed Node -->
                <circle cx="400" cy="350" r="8" fill="#E6F4EA" stroke="#34A853" stroke-width="2" />
                <path d="M397,350 l2,2 l4,-4" fill="none" stroke="#34A853" stroke-width="2" />
                
                <!-- Locked Nodes -->
                <circle cx="250" cy="150" r="8" fill="white" stroke="#E0E0E0" stroke-width="2" />
                <circle cx="550" cy="150" r="8" fill="white" stroke="#E0E0E0" stroke-width="2" />
            </svg>
        </div>
    </section>

    <!-- FOOTER CTA: ANIMATED FEEDBACK -->
    <footer class="max-w-7xl mx-auto px-6 pb-20">
        <div class="relative overflow-hidden rounded-[2.5rem] bg-[#1A73E8] p-12 md:p-24 text-center text-white shadow-2xl reveal-slide-up" #reveal>
            <div class="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
            <div class="relative z-10 space-y-8 max-w-2xl mx-auto">
                <h2 class="text-4xl md:text-6xl font-bold">Close the gap today.</h2>
                <div class="flex flex-col sm:flex-row gap-4">
                    <div class="flex-1 relative group">
                        <input type="email" placeholder="work email" class="w-full bg-white/10 border border-white/20 rounded-2xl px-6 py-4 outline-none focus:bg-white focus:text-[#202124] transition-all placeholder:text-white/50" />
                        <lucide-icon name="check-circle" class="absolute right-4 top-1/2 -translate-y-1/2 text-[#34A853] opacity-0 group-focus-within:opacity-100 transition-opacity" [size]="18"></lucide-icon>
                    </div>
                    <button class="bg-white text-[#1A73E8] font-bold px-8 py-4 rounded-2xl hover:bg-[#F8F9FA] hover:scale-105 transition-all">Start Preparing</button>
                </div>
            </div>
        </div>
    </footer>
</main>
```

### 3. The Styles (`landing.component.scss`)
*Elite motion definitions and 3D transformations.*

```scss
/* 3D Motion System */
.perspective-container {
    perspective: 2000px;
}

.hero-3d-card {
    transform: rotateX(15deg) rotateY(-5deg) translateY(20px);
    transition: transform 1s cubic-bezier(0.16, 1, 0.3, 1);
    
    &:hover {
        transform: rotateX(0deg) rotateY(0deg) translateY(0);
    }
}

/* Scroll Animations */
.reveal-fade-in, .reveal-slide-up, .reveal-slide-in {
    opacity: 0;
    transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
}

.reveal-slide-up { transform: translateY(40px); }
.reveal-slide-in { transform: translateX(-40px); }

.is-visible {
    opacity: 1 !important;
    transform: translate(0, 0) !important;
}

/* Feature Specifics */
.blueprint-grid {
    background-image: 
        linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px);
    background-size: 40px 40px;
}

.btn-primary-elite {
    @apply inline-flex items-center gap-3 px-10 py-5 bg-[#1A73E8] text-white rounded-2xl font-bold text-lg 
           shadow-[0_20px_40px_rgba(26,115,232,0.3)] hover:shadow-[0_10px_20px_rgba(26,115,232,0.2)] 
           hover:-translate-y-1 transition-all active:scale-95;
}

.shadow-green {
    filter: drop-shadow(0 0 10px #34A853);
}

.draw-path {
    stroke-dasharray: 200;
    stroke-dashoffset: 200;
    animation: draw 2s ease-out forwards;
}

@keyframes draw {
    to { stroke-dashoffset: 0; }
}

.animate-ping-slow {
    animation: ping 3s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.animate-spin-slow {
    animation: spin 8s linear infinite;
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
```

### Key Refinements:
1.  **Icon Safety:** I used standard Lucide strings: `search`, `sparkles`, `code`, `check`, `bookmark`.
2.  **3D Logic:** The hero dashboard uses a CSS `rotateX` transform that flattens smoothly on hover, providing an immersive experience without being disorienting.
3.  **The "Alive" Node:** The Skill Tree node for "System Design" now has a custom `animate-ping-slow` and a CSS `drop-shadow` to signify it is the active learning point.
4.  **Shadow Box Depth:** The Playground section uses high-contrast shadows (`shadow-[0_32px_64px_rgba(0,0,0,0.5)]`) and overlapping z-index management to create an physical presence for the Code Sandbox and Quiz.
5.  **Fixed Errors:** Moved all observer logic to `ngAfterViewInit` to ensure the DOM is ready, solving the `forEach` issue.