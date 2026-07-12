import { Component, OnInit, ElementRef, QueryList, ViewChildren } from '@angular/core';
// ... other imports

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent implements OnInit {
  @ViewChildren('reveal') revealElements!: QueryList<ElementRef>;

  ngOnInit() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.1 });

    // Small delay to ensure ViewChildren are populated
    setTimeout(() => {
      this.revealElements.forEach(el => observer.observe(el.nativeElement));
    }, 100);
  }

  // Counter logic for the "90 day" etc.
  stats = { days: 90, workflows: 3, workspace: 1 };
  
  readonly features = [ /* ... same as before ... */ ];
  readonly workflow = [ /* ... same as before ... */ ];
  readonly quizTopics = ['SQL Joins', 'System Design', 'Angular Signals', 'API Design'];
}
2. Enhanced UI with 3D & Motion (landing.component.html)
code
Html
<main class="landing-page bg-[#F8F9FA] text-[#202124] overflow-x-hidden">
    <!-- HERO SECTION with 3D Perspective -->
    <section class="relative overflow-hidden border-b border-[#E0E0E0] bg-white pb-20 pt-16">
        <!-- Background Decorative Element (Apple-style gradient) -->
        <div class="absolute -top-[20%] -right-[10%] h-[600px] w-[600px] rounded-full bg-[#1A73E8] opacity-[0.03] blur-[120px]"></div>

        <div class="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div class="reveal-slide-in max-w-3xl space-y-7" #reveal>
                <span class="badge badge-primary animate-pulse-subtle">Interview preparation workspace</span>
                <h1 class="text-5xl font-semibold leading-[1.1] tracking-tight text-[#202124] md:text-7xl">
                    Build interview <span class="text-[#1A73E8]">readiness</span> with a clear system.
                </h1>
                <p class="max-w-xl text-lg leading-relaxed text-[#5F6368]">
                    EduDash combines skill mapping and high-probability Q&A into one fluid dashboard. No noise, just progress.
                </p>
                
                <div class="flex flex-wrap gap-4">
                    <a routerLink="/dashboard" class="btn btn-primary group px-8 py-4 text-lg">
                        <span>Open Dashboard</span>
                        <lucide-icon name="arrow-right" class="transition-transform group-hover:translate-x-1" [size]="18"></lucide-icon>
                    </a>
                </div>

                <div class="grid grid-cols-3 gap-8 pt-8">
                    <div class="stat-group">
                        <strong class="counter-up block text-3xl font-bold">90</strong>
                        <span class="text-xs uppercase tracking-widest text-[#5F6368]">Day View</span>
                    </div>
                    <div class="stat-group">
                        <strong class="counter-up block text-3xl font-bold">3</strong>
                        <span class="text-xs uppercase tracking-widest text-[#5F6368]">Workflows</span>
                    </div>
                    <div class="stat-group">
                        <strong class="counter-up block text-3xl font-bold">1</strong>
                        <span class="text-xs uppercase tracking-widest text-[#5F6368]">Workspace</span>
                    </div>
                </div>
            </div>

            <!-- 3D FLOATING DASHBOARD PREVIEW -->
            <div class="perspective-container reveal-fade-in" #reveal>
                <div class="floating-card rounded-2xl border border-[#E0E0E0] bg-white p-2 shadow-2xl transition-transform duration-500 hover:rotate-x-0">
                    <div class="rounded-xl bg-[#F8F9FA] p-6">
                        <div class="mb-6 flex items-center justify-between">
                            <div class="h-2 w-24 rounded bg-[#E0E0E0]"></div>
                            <div class="flex gap-2">
                                <div class="h-6 w-6 rounded-full bg-[#EA4335]/20"></div>
                                <div class="h-6 w-6 rounded-full bg-[#34A853]/20"></div>
                            </div>
                        </div>
                        <div class="space-y-4">
                            <div class="h-32 rounded-lg bg-white p-4 shadow-sm">
                                <!-- Animated Progress Bar -->
                                <div class="mb-2 flex justify-between text-xs font-bold text-[#1A73E8]">
                                    <span>READINESS</span>
                                    <span>72%</span>
                                </div>
                                <div class="h-2 w-full overflow-hidden rounded-full bg-[#E0E0E0]">
                                    <div class="progress-fill h-full bg-[#1A73E8]" style="--target-width: 72%"></div>
                                </div>
                                <!-- Animated Heatmap Grid -->
                                <div class="mt-4 grid grid-cols-10 gap-1">
                                    <div *ngFor="let i of [1,2,3,4,5,6,7,8,9,10]" 
                                         class="h-3 rounded-sm bg-[#1A73E8] opacity-0 stagger-fade" 
                                         [style.animation-delay]="i * 50 + 'ms'"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- FEATURES WITH STAGGERED REVEAL -->
    <section class="mx-auto max-w-7xl px-6 py-24">
        <div class="reveal-fade-in mb-16 text-center" #reveal>
            <h2 class="text-4xl font-semibold">Engineered for focus.</h2>
        </div>
        <div class="grid gap-8 md:grid-cols-3">
            <div *ngFor="let f of features; let i = index" 
                 class="reveal-slide-up edudash-card group hover:border-[#1A73E8]" 
                 #reveal 
                 [style.transition-delay]="i * 100 + 'ms'">
                <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#F8F9FA] text-[#1A73E8] transition-colors group-hover:bg-[#1A73E8] group-hover:text-white">
                    <lucide-icon [name]="f.icon" [size]="24"></lucide-icon>
                </div>
                <h3 class="text-xl font-semibold">{{ f.title }}</h3>
                <p class="mt-3 text-[#5F6368]">{{ f.text }}</p>
            </div>
        </div>
    </section>

    <!-- INTERACTIVE SKILL TREE SECTION -->
    <section class="bg-[#202124] py-24 text-white">
        <div class="mx-auto max-w-7xl px-6 lg:grid lg:grid-cols-2 lg:items-center">
            <div class="reveal-slide-in" #reveal>
                <h2 class="text-4xl font-semibold">Visualizing Knowledge.</h2>
                <p class="mt-6 text-lg text-gray-400">Our dynamic skill tree shows your preparation paths. As you complete topics, branches glow and unlock new concepts.</p>
                
                <div class="mt-10 flex gap-4">
                    <div class="flex items-center gap-2">
                        <span class="h-3 w-3 rounded-full bg-[#1A73E8] shadow-[0_0_10px_#1A73E8]"></span>
                        <span class="text-sm">Mastered</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="h-3 w-3 rounded-full bg-gray-600"></span>
                        <span class="text-sm">Locked</span>
                    </div>
                </div>
            </div>

            <!-- Animated SVG Skill Tree -->
            <div class="relative mt-12 lg:mt-0 reveal-fade-in" #reveal>
                <svg viewBox="0 0 400 300" class="w-full">
                    <!-- Branches that "draw" themselves -->
                    <path d="M200,250 L200,150 M200,150 L100,80 M200,150 L300,80" 
                          fill="none" stroke="#333" stroke-width="3" />
                    <path class="draw-path" d="M200,250 L200,150 M200,150 L100,80" 
                          fill="none" stroke="#1A73E8" stroke-width="3" />
                    <!-- Nodes -->
                    <circle cx="200" cy="250" r="8" fill="#1A73E8" class="animate-pulse" />
                    <circle cx="200" cy="150" r="8" fill="#1A73E8" />
                    <circle cx="100" cy="80" r="8" fill="#1A73E8" />
                    <circle cx="300" cy="80" r="8" fill="#333" />
                </svg>
            </div>
        </div>
    </section>
</main>
3. Professional Motion Styles (landing.component.scss)
code
Scss
// 1. 3D & Perspective Settings
.perspective-container {
    perspective: 1200px;
}

.floating-card {
    transform: rotateY(-15deg) rotateX(10deg);
    transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
    
    &:hover {
        transform: rotateY(0deg) rotateX(0deg) translateY(-10px);
        box-shadow: 0 30px 60px rgba(0,0,0,0.12);
    }
}

// 2. Scroll-Triggered Animation Base
.reveal-fade-in, .reveal-slide-up, .reveal-slide-in {
    opacity: 0;
    transition: all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.reveal-slide-up { transform: translateY(40px); }
.reveal-slide-in { transform: translateX(-40px); }

.is-visible {
    opacity: 1 !important;
    transform: translate(0) !important;
}

// 3. Data Visualisation Animations
.progress-fill {
    width: 0;
    transition: width 1.5s cubic-bezier(0.65, 0, 0.35, 1);
    .is-visible & {
        width: var(--target-width);
    }
}

.draw-path {
    stroke-dasharray: 1000;
    stroke-dashoffset: 1000;
    animation: draw 2s forwards ease-in-out;
    animation-delay: 0.5s;
}

@keyframes draw {
    to { stroke-dashoffset: 0; }
}

// 4. Micro-interactions
.btn-primary {
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
    
    &:after {
        content: '';
        position: absolute;
        top: 50%; left: 50%;
        width: 120%; height: 120%;
        background: rgba(255,255,255,0.1);
        transform: translate(-50%, -50%) scale(0);
        border-radius: 100%;
        transition: transform 0.5s ease;
    }

    &:hover:after {
        transform: translate(-50%, -50%) scale(1);
    }
}

.stagger-fade {
    animation: fadeIn 0.5s forwards;
}

@keyframes fadeIn {
    to { opacity: 1; }
}

.animate-pulse-subtle {
    animation: pulse-subtle 2s infinite;
}

@keyframes pulse-subtle {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(0.98); }
}
Key Changes Explained:
Perspective Tilt: The hero image is no longer a flat box. It’s tilted in 3D space (rotateY(-15deg)), which is a classic Google/Stripe design pattern to imply depth.
The "Sweep" Reveal: Using the IntersectionObserver in the .ts file, elements only animate in when you scroll to them. This prevents the browser from lagging by trying to animate everything at once.
SVG Path Animation: In the Skill Tree section, the lines "draw" themselves. This creates a narrative that the application is actively mapping data.
Apple-style Backgrounds: I added a blurred, low-opacity radial gradient in the background. This creates a "glow" effect that makes the white interface look premium rather than empty.
Micro-Feedback: Buttons now have a scale/ripple effect, and cards lift up slightly on hover with a smooth transition.