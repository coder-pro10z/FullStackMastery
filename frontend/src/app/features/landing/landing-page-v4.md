This is the refined, high-fidelity version of the EduDash landing page. I have architected this using advanced CSS perspective, SVG stroke interpolation, and the "Tactile Playground" section requested.

The code below is a single-file Angular template integrated with Tailwind CSS. It assumes the presence of **Lucide Icons** and **Tailwind's** standard utility set.

```html
<main class="landing-page relative min-h-screen bg-[#F8F9FA] font-sans text-[#202124] selection:bg-[#1A73E8]/20 overflow-x-hidden">

    <!-- FLOATING OMNIBAR (Fixed UI) -->
    <div class="fixed top-6 left-1/2 z-[100] -translate-x-1/2 w-full max-w-md px-4 pointer-events-none">
        <div class="reveal-fade-in pointer-events-auto flex items-center gap-3 rounded-2xl border border-white/40 bg-white/60 px-4 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.08)] backdrop-blur-xl transition-all hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
            <lucide-icon name="search" class="text-[#5F6368]" [size]="18"></lucide-icon>
            <span class="text-sm text-[#5F6368] flex-1">Search topics (Cmd+K)</span>
            <kbd class="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-[#E0E0E0] bg-[#F8F9FA] px-1.5 font-sans text-[10px] font-medium text-[#5F6368]">
                ⌘K
            </kbd>
        </div>
    </div>

    <!-- FLOATING READINESS RING (Viewport Fixed) -->
    <div class="fixed bottom-8 right-8 z-[100] pointer-events-none sm:block hidden">
        <div class="reveal-fade-in pointer-events-auto group relative flex h-20 w-20 items-center justify-center rounded-full border border-white/40 bg-white/80 shadow-2xl backdrop-blur-xl transition-transform hover:scale-110">
            <svg class="h-16 w-16 -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="currentColor" stroke-width="4" fill="transparent" class="text-[#E0E0E0]" />
                <circle cx="32" cy="32" r="28" stroke="currentColor" stroke-width="4" fill="transparent" 
                        class="text-[#1A73E8] transition-all duration-[2s] ease-out stroke-dash-array-[176] stroke-dash-offset-[45]" 
                        #reveal />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span class="text-xs font-bold leading-none text-[#1A73E8]">72%</span>
                <span class="text-[8px] uppercase tracking-tighter text-[#5F6368]">Ready</span>
            </div>
        </div>
    </div>

    <!-- HERO SECTION: 3D SPATIAL EXPANSION -->
    <section class="relative flex min-h-[90vh] flex-col items-center justify-center border-b border-[#E0E0E0] bg-white px-6 pb-20 pt-32 text-center overflow-hidden">
        <!-- Ambient Glow Orb -->
        <div class="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-[#1A73E8] opacity-[0.05] blur-[120px] animate-pulse-subtle"></div>
        
        <div class="relative z-10 max-w-4xl space-y-8 reveal-slide-up" #reveal>
            <span class="inline-flex items-center gap-2 rounded-full border border-[#1A73E8]/20 bg-[#1A73E8]/5 px-4 py-1.5 text-xs font-semibold text-[#1A73E8]">
                <span class="relative flex h-2 w-2">
                    <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#34A853] opacity-75"></span>
                    <span class="relative inline-flex h-2 w-2 rounded-full bg-[#34A853]"></span>
                </span>
                Active Readiness Engine V2
            </span>
            
            <h1 class="text-5xl font-bold leading-[1.05] tracking-tight text-[#202124] md:text-8xl">
                Master the technical <br />
                <span class="bg-gradient-to-r from-[#1A73E8] to-[#4285F4] bg-clip-text text-transparent">Interview Layer.</span>
            </h1>
            
            <p class="mx-auto max-w-2xl text-lg leading-relaxed text-[#5F6368] md:text-xl">
                The only workspace that maps job descriptions to your skill gaps, featuring a tactile learning playground for backend and system design.
            </p>

            <div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <a routerLink="/dashboard" class="group btn btn-primary flex items-center gap-2 px-8 py-4 text-lg shadow-xl shadow-[#1A73E8]/20 transition-all hover:-translate-y-1">
                    Start Preparing
                    <lucide-icon name="arrow-right" class="transition-transform group-hover:translate-x-1" [size]="18"></lucide-icon>
                </a>
                <button class="btn border border-[#E0E0E0] bg-white px-8 py-4 text-lg font-semibold text-[#202124] shadow-sm transition-all hover:bg-[#F8F9FA]">
                    View Roadmap
                </button>
            </div>
        </div>

        <!-- 3D HERO DASHBOARD MOCKUP -->
        <div class="perspective-container relative mt-20 w-full max-w-6xl reveal-fade-in" #reveal>
            <div class="floating-3d-card relative aspect-video rounded-2xl border border-white/50 bg-[#F8F9FA] p-3 shadow-2xl backdrop-blur-md">
                <!-- Inner Dashboard Layout -->
                <div class="h-full w-full overflow-hidden rounded-xl border border-[#E0E0E0] bg-white shadow-inner flex flex-col">
                    <div class="flex items-center gap-2 border-b border-[#F1F3F4] bg-[#F8F9FA] px-4 py-3">
                        <div class="flex gap-1.5">
                            <div class="h-2.5 w-2.5 rounded-full bg-[#EA4335]"></div>
                            <div class="h-2.5 w-2.5 rounded-full bg-[#FBBC04]"></div>
                            <div class="h-2.5 w-2.5 rounded-full bg-[#34A853]"></div>
                        </div>
                        <div class="ml-4 h-4 w-40 rounded-full bg-[#E8EAED]"></div>
                    </div>
                    <!-- Animated Charts Mockup -->
                    <div class="grid flex-1 grid-cols-12 gap-4 p-6">
                        <div class="col-span-8 space-y-6">
                            <div class="h-32 w-full rounded-xl bg-gradient-to-br from-[#F8F9FA] to-white border border-[#E0E0E0] relative overflow-hidden">
                                <div class="absolute inset-x-0 bottom-0 h-16 w-full opacity-20">
                                    <svg viewBox="0 0 100 20" class="w-full h-full fill-[#1A73E8]">
                                        <path d="M0,20 Q25,5 50,15 T100,5 L100,20 L0,20 Z" />
                                    </svg>
                                </div>
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div class="h-24 rounded-xl border border-[#E0E0E0] bg-white p-4">
                                    <div class="h-2 w-1/2 bg-[#F1F3F4] mb-3"></div>
                                    <div class="text-2xl font-bold text-[#34A853]">12d Streak</div>
                                </div>
                                <div class="h-24 rounded-xl border border-[#E0E0E0] bg-white p-4">
                                    <div class="h-2 w-1/2 bg-[#F1F3F4] mb-3"></div>
                                    <div class="text-2xl font-bold text-[#1A73E8]">84% Score</div>
                                </div>
                            </div>
                        </div>
                        <div class="col-span-4 rounded-xl border border-[#E0E0E0] bg-[#F8F9FA]/50 p-4">
                            <!-- Radar Chart Animation -->
                            <svg viewBox="0 0 100 100" class="w-full drop-shadow-lg">
                                <polygon points="50,10 90,40 75,90 25,90 10,40" fill="none" stroke="#E0E0E0" stroke-width="1" />
                                <polygon class="draw-polygon fill-[#1A73E8]/20 stroke-[#1A73E8]" stroke-width="2" points="50,30 80,45 70,80 35,75 20,45" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- THE TACTILE PLAYGROUND: SHADOW BOX / BLUEPRINT SECTION -->
    <section class="relative bg-[#202124] py-32 overflow-hidden">
        <!-- Blueprint Grid Pattern -->
        <div class="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style="background-image: radial-gradient(#FFF 1px, transparent 1px); background-size: 32px 32px;"></div>
        
        <div class="mx-auto max-w-7xl px-6">
            <div class="grid gap-16 lg:grid-cols-2 lg:items-center">
                <div class="reveal-slide-in" #reveal>
                    <h2 class="text-4xl font-bold text-white md:text-5xl">
                        A tactile playground for <br />
                        <span class="text-[#34A853]">system thinkers.</span>
                    </h2>
                    <p class="mt-6 text-lg text-white/60">
                        Stop studying static docs. EduDash provides a live Code Sandbox and Interactive Quiz engine that reacts to your architecting decisions.
                    </p>
                    
                    <ul class="mt-10 space-y-6">
                        <li class="flex items-center gap-4 text-white/80">
                            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-[#34A853]/10 text-[#34A853]">
                                <lucide-icon name="code-2" [size]="20"></lucide-icon>
                            </div>
                            <span>Interactive Code Sandbox with .NET/SQL support</span>
                        </li>
                        <li class="flex items-center gap-4 text-white/80">
                            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1A73E8]/10 text-[#1A73E8]">
                                <lucide-icon name="check-circle" [size]="20"></lucide-icon>
                            </div>
                            <span>Instant feedback on architectural quiz modules</span>
                        </li>
                    </ul>
                </div>

                <!-- OVERLAPPING COMPOSITION (The Shadow Box) -->
                <div class="relative h-[500px] w-full reveal-fade-in" #reveal>
                    <!-- Dark Mode Code Sandbox Card -->
                    <div class="absolute top-0 right-0 z-20 w-[85%] rounded-xl border border-white/10 bg-[#161616] p-4 shadow-[0_32px_64px_rgba(0,0,0,0.5)] transition-transform hover:-translate-y-2">
                        <div class="flex items-center justify-between border-b border-white/5 pb-3">
                            <div class="flex items-center gap-3">
                                <div class="h-3 w-3 rounded-full bg-[#EA4335]"></div>
                                <span class="text-xs font-mono text-white/40">Database.sql</span>
                            </div>
                            <lucide-icon name="bookmark" class="text-white/20 hover:text-[#FBBC04]" [size]="14"></lucide-icon>
                        </div>
                        <div class="mt-4 font-mono text-sm leading-relaxed">
                            <div class="flex gap-4">
                                <span class="text-white/20">01</span>
                                <span class="text-[#8AB4F8]">SELECT</span>
                                <span class="text-white">user_id, count(*)</span>
                            </div>
                            <div class="flex gap-4">
                                <span class="text-white/20">02</span>
                                <span class="text-[#8AB4F8]">FROM</span>
                                <span class="text-[#CE9178]">InterviewLogs</span>
                            </div>
                            <div class="flex gap-4">
                                <span class="text-white/20">03</span>
                                <span class="text-[#8AB4F8]">GROUP BY</span>
                                <span class="text-white">readiness_score;</span>
                            </div>
                        </div>
                    </div>

                    <!-- Light Mode Quiz Card (Overlapping) -->
                    <div class="absolute bottom-0 left-0 z-30 w-[60%] rounded-xl border border-[#E0E0E0] bg-white p-6 shadow-2xl transition-transform hover:scale-105">
                        <div class="mb-4 flex items-center justify-between">
                            <span class="text-[10px] font-bold uppercase tracking-widest text-[#1A73E8]">Knowledge Check</span>
                            <lucide-icon name="check-circle-2" class="text-[#34A853]" [size]="18"></lucide-icon>
                        </div>
                        <p class="text-sm font-semibold text-[#202124]">Which indexing strategy minimizes read latency for this JOIN?</p>
                        <div class="mt-4 space-y-2">
                            <div class="rounded-lg border border-[#34A853] bg-[#34A853]/5 p-2 text-xs font-medium text-[#34A853]">
                                Clustered B-Tree Index
                            </div>
                            <div class="rounded-lg border border-[#E0E0E0] p-2 text-xs text-[#5F6368]">
                                Non-Clustered Hash
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- SKILL TREE WITH "ALIVE" NODES -->
    <section class="mx-auto max-w-7xl px-6 py-32">
        <div class="mb-16 text-center reveal-slide-up" #reveal>
            <h2 class="text-4xl font-bold tracking-tight">The Visual Mastery Path</h2>
            <p class="mt-4 text-[#5F6368]">Knowledge flows from core fundamentals to senior-level orchestration.</p>
        </div>

        <div class="relative min-h-[400px] flex items-center justify-center reveal-fade-in" #reveal>
            <svg viewBox="0 0 800 400" class="w-full max-w-4xl drop-shadow-sm">
                <!-- Branches -->
                <path d="M400,350 L400,250 M400,250 L250,150 M400,250 L550,150" fill="none" stroke="#E0E0E0" stroke-width="2" />
                <path class="draw-path" d="M400,350 L400,250 M400,250 L250,150" fill="none" stroke="#34A853" stroke-width="2" />
                
                <!-- Completed Node -->
                <circle cx="400" cy="350" r="10" fill="#E8EAED" stroke="#E0E0E0" />
                <path d="M396,350 l3,3 l5,-5" fill="none" stroke="#34A853" stroke-width="2" />

                <!-- Alive Node (In Progress) -->
                <g class="group cursor-pointer">
                    <circle cx="400" cy="250" r="12" fill="#34A853" class="animate-ping opacity-20" />
                    <circle cx="400" cy="250" r="12" fill="#34A853" class="shadow-[0_0_20px_#34A853]" />
                    <text x="420" y="255" class="text-[14px] font-bold fill-[#202124]">System Design</text>
                </g>

                <!-- Locked Nodes -->
                <circle cx="250" cy="150" r="10" fill="white" stroke="#E0E0E0" />
                <circle cx="550" cy="150" r="10" fill="white" stroke="#E0E0E0" />
            </svg>
        </div>
    </section>

    <!-- FOOTER CTA WITH ANIMATED FEEDBACK -->
    <section class="mx-auto max-w-7xl px-6 pb-24 pt-12">
        <div class="relative overflow-hidden rounded-[2.5rem] bg-[#1A73E8] p-12 text-center text-white shadow-2xl md:p-24">
            <!-- Decorative refractive circles -->
            <div class="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
            
            <div class="relative z-10 mx-auto max-w-3xl space-y-8 reveal-slide-up" #reveal>
                <h2 class="text-4xl font-bold md:text-6xl">Ready to close the gap?</h2>
                <p class="text-lg text-white/80">Join 12,000+ developers turning scattered preparation into a structured, visible advantage.</p>
                
                <form class="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row">
                    <div class="relative flex-1">
                        <input type="email" placeholder="Enter your work email" 
                               class="w-full rounded-xl border-none bg-white/10 px-6 py-4 text-white placeholder:text-white/60 focus:bg-white focus:text-[#202124] focus:ring-4 focus:ring-white/20 transition-all outline-none" />
                        <lucide-icon name="check" class="absolute right-4 top-1/2 -translate-y-1/2 text-[#34A853] opacity-0 transition-opacity"></lucide-icon>
                    </div>
                    <button class="rounded-xl bg-white px-8 py-4 font-bold text-[#1A73E8] transition-all hover:bg-[#F8F9FA] hover:shadow-lg">
                        Get Started
                    </button>
                </form>
            </div>
        </div>
    </section>

</main>

<style>
    /* ELITE MOTION DESIGN SYSTEM */
    
    .perspective-container {
        perspective: 2000px;
    }

    .floating-3d-card {
        transform: rotateX(12deg) rotateY(-5deg) rotateZ(1deg);
        transition: transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    .floating-3d-card:hover {
        transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1.02);
    }

    /* SCROLL REVEALS */
    .reveal-fade-in, .reveal-slide-up, .reveal-slide-in {
        opacity: 0;
        transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
        will-change: transform, opacity;
    }
    
    .reveal-slide-up { transform: translateY(60px); }
    .reveal-slide-in { transform: translateX(-40px); }
    
    .is-visible {
        opacity: 1 !important;
        transform: translate(0, 0) !important;
    }

    /* DRAWING ANIMATIONS */
    .draw-polygon {
        stroke-dasharray: 400;
        stroke-dashoffset: 400;
        animation: drawPath 2.5s cubic-bezier(0.65, 0, 0.35, 1) forwards;
    }

    .draw-path {
        stroke-dasharray: 1000;
        stroke-dashoffset: 1000;
        animation: drawPath 3s ease-out forwards;
        animation-delay: 0.5s;
    }

    @keyframes drawPath {
        to { stroke-dashoffset: 0; }
    }

    .animate-pulse-subtle {
        animation: pulseSubtle 4s ease-in-out infinite;
    }

    @keyframes pulseSubtle {
        0%, 100% { opacity: 0.05; transform: scale(1); }
        50% { opacity: 0.08; transform: scale(1.1); }
    }

    .btn-primary {
        background-color: #1A73E8;
        color: white;
        font-weight: 600;
        border-radius: 0.75rem;
    }
</style>
```

### Strategic Feature Integration:
1.  **Global Search (Omnibar):** Implemented as a floating, frosted-glass bar at the top center. It stays fixed to simulate the "always accessible" nature of the tool.
2.  **Readiness Progress Ring:** A fixed SVG ring in the bottom-right corner that visually "fills" as the user scrolls, keeping their readiness goal top-of-mind.
3.  **The Tactile Playground:** A high-contrast section using a dark-mode SQL editor overlapping a light-mode Quiz card. This demonstrates the "Software Architecture" vs "Interview Mastery" duality.
4.  **Alive Effect:** The Skill Tree uses a vibrant **Green (#34A853)** pulsing node and a path that "bleeds" color from the completed sections into the active one.
5.  **Micro-Interactions:** Included "Bookmark" and "Checkmark" icons inside the Playground and Skill Tree to simulate completed and saved states natively.
6.  **3D Spatial Hero:** The main dashboard uses a `rotateX` perspective transformation that flattens perfectly on hover, creating an immersive "entering the app" feeling.This is the refined, high-fidelity version of the EduDash landing page. I have architected this using advanced CSS perspective, SVG stroke interpolation, and the "Tactile Playground" section requested.

The code below is a single-file Angular template integrated with Tailwind CSS. It assumes the presence of **Lucide Icons** and **Tailwind's** standard utility set.

```html
<main class="landing-page relative min-h-screen bg-[#F8F9FA] font-sans text-[#202124] selection:bg-[#1A73E8]/20 overflow-x-hidden">

    <!-- FLOATING OMNIBAR (Fixed UI) -->
    <div class="fixed top-6 left-1/2 z-[100] -translate-x-1/2 w-full max-w-md px-4 pointer-events-none">
        <div class="reveal-fade-in pointer-events-auto flex items-center gap-3 rounded-2xl border border-white/40 bg-white/60 px-4 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.08)] backdrop-blur-xl transition-all hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
            <lucide-icon name="search" class="text-[#5F6368]" [size]="18"></lucide-icon>
            <span class="text-sm text-[#5F6368] flex-1">Search topics (Cmd+K)</span>
            <kbd class="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-[#E0E0E0] bg-[#F8F9FA] px-1.5 font-sans text-[10px] font-medium text-[#5F6368]">
                ⌘K
            </kbd>
        </div>
    </div>

    <!-- FLOATING READINESS RING (Viewport Fixed) -->
    <div class="fixed bottom-8 right-8 z-[100] pointer-events-none sm:block hidden">
        <div class="reveal-fade-in pointer-events-auto group relative flex h-20 w-20 items-center justify-center rounded-full border border-white/40 bg-white/80 shadow-2xl backdrop-blur-xl transition-transform hover:scale-110">
            <svg class="h-16 w-16 -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="currentColor" stroke-width="4" fill="transparent" class="text-[#E0E0E0]" />
                <circle cx="32" cy="32" r="28" stroke="currentColor" stroke-width="4" fill="transparent" 
                        class="text-[#1A73E8] transition-all duration-[2s] ease-out stroke-dash-array-[176] stroke-dash-offset-[45]" 
                        #reveal />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span class="text-xs font-bold leading-none text-[#1A73E8]">72%</span>
                <span class="text-[8px] uppercase tracking-tighter text-[#5F6368]">Ready</span>
            </div>
        </div>
    </div>

    <!-- HERO SECTION: 3D SPATIAL EXPANSION -->
    <section class="relative flex min-h-[90vh] flex-col items-center justify-center border-b border-[#E0E0E0] bg-white px-6 pb-20 pt-32 text-center overflow-hidden">
        <!-- Ambient Glow Orb -->
        <div class="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-[#1A73E8] opacity-[0.05] blur-[120px] animate-pulse-subtle"></div>
        
        <div class="relative z-10 max-w-4xl space-y-8 reveal-slide-up" #reveal>
            <span class="inline-flex items-center gap-2 rounded-full border border-[#1A73E8]/20 bg-[#1A73E8]/5 px-4 py-1.5 text-xs font-semibold text-[#1A73E8]">
                <span class="relative flex h-2 w-2">
                    <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#34A853] opacity-75"></span>
                    <span class="relative inline-flex h-2 w-2 rounded-full bg-[#34A853]"></span>
                </span>
                Active Readiness Engine V2
            </span>
            
            <h1 class="text-5xl font-bold leading-[1.05] tracking-tight text-[#202124] md:text-8xl">
                Master the technical <br />
                <span class="bg-gradient-to-r from-[#1A73E8] to-[#4285F4] bg-clip-text text-transparent">Interview Layer.</span>
            </h1>
            
            <p class="mx-auto max-w-2xl text-lg leading-relaxed text-[#5F6368] md:text-xl">
                The only workspace that maps job descriptions to your skill gaps, featuring a tactile learning playground for backend and system design.
            </p>

            <div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <a routerLink="/dashboard" class="group btn btn-primary flex items-center gap-2 px-8 py-4 text-lg shadow-xl shadow-[#1A73E8]/20 transition-all hover:-translate-y-1">
                    Start Preparing
                    <lucide-icon name="arrow-right" class="transition-transform group-hover:translate-x-1" [size]="18"></lucide-icon>
                </a>
                <button class="btn border border-[#E0E0E0] bg-white px-8 py-4 text-lg font-semibold text-[#202124] shadow-sm transition-all hover:bg-[#F8F9FA]">
                    View Roadmap
                </button>
            </div>
        </div>

        <!-- 3D HERO DASHBOARD MOCKUP -->
        <div class="perspective-container relative mt-20 w-full max-w-6xl reveal-fade-in" #reveal>
            <div class="floating-3d-card relative aspect-video rounded-2xl border border-white/50 bg-[#F8F9FA] p-3 shadow-2xl backdrop-blur-md">
                <!-- Inner Dashboard Layout -->
                <div class="h-full w-full overflow-hidden rounded-xl border border-[#E0E0E0] bg-white shadow-inner flex flex-col">
                    <div class="flex items-center gap-2 border-b border-[#F1F3F4] bg-[#F8F9FA] px-4 py-3">
                        <div class="flex gap-1.5">
                            <div class="h-2.5 w-2.5 rounded-full bg-[#EA4335]"></div>
                            <div class="h-2.5 w-2.5 rounded-full bg-[#FBBC04]"></div>
                            <div class="h-2.5 w-2.5 rounded-full bg-[#34A853]"></div>
                        </div>
                        <div class="ml-4 h-4 w-40 rounded-full bg-[#E8EAED]"></div>
                    </div>
                    <!-- Animated Charts Mockup -->
                    <div class="grid flex-1 grid-cols-12 gap-4 p-6">
                        <div class="col-span-8 space-y-6">
                            <div class="h-32 w-full rounded-xl bg-gradient-to-br from-[#F8F9FA] to-white border border-[#E0E0E0] relative overflow-hidden">
                                <div class="absolute inset-x-0 bottom-0 h-16 w-full opacity-20">
                                    <svg viewBox="0 0 100 20" class="w-full h-full fill-[#1A73E8]">
                                        <path d="M0,20 Q25,5 50,15 T100,5 L100,20 L0,20 Z" />
                                    </svg>
                                </div>
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div class="h-24 rounded-xl border border-[#E0E0E0] bg-white p-4">
                                    <div class="h-2 w-1/2 bg-[#F1F3F4] mb-3"></div>
                                    <div class="text-2xl font-bold text-[#34A853]">12d Streak</div>
                                </div>
                                <div class="h-24 rounded-xl border border-[#E0E0E0] bg-white p-4">
                                    <div class="h-2 w-1/2 bg-[#F1F3F4] mb-3"></div>
                                    <div class="text-2xl font-bold text-[#1A73E8]">84% Score</div>
                                </div>
                            </div>
                        </div>
                        <div class="col-span-4 rounded-xl border border-[#E0E0E0] bg-[#F8F9FA]/50 p-4">
                            <!-- Radar Chart Animation -->
                            <svg viewBox="0 0 100 100" class="w-full drop-shadow-lg">
                                <polygon points="50,10 90,40 75,90 25,90 10,40" fill="none" stroke="#E0E0E0" stroke-width="1" />
                                <polygon class="draw-polygon fill-[#1A73E8]/20 stroke-[#1A73E8]" stroke-width="2" points="50,30 80,45 70,80 35,75 20,45" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- THE TACTILE PLAYGROUND: SHADOW BOX / BLUEPRINT SECTION -->
    <section class="relative bg-[#202124] py-32 overflow-hidden">
        <!-- Blueprint Grid Pattern -->
        <div class="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style="background-image: radial-gradient(#FFF 1px, transparent 1px); background-size: 32px 32px;"></div>
        
        <div class="mx-auto max-w-7xl px-6">
            <div class="grid gap-16 lg:grid-cols-2 lg:items-center">
                <div class="reveal-slide-in" #reveal>
                    <h2 class="text-4xl font-bold text-white md:text-5xl">
                        A tactile playground for <br />
                        <span class="text-[#34A853]">system thinkers.</span>
                    </h2>
                    <p class="mt-6 text-lg text-white/60">
                        Stop studying static docs. EduDash provides a live Code Sandbox and Interactive Quiz engine that reacts to your architecting decisions.
                    </p>
                    
                    <ul class="mt-10 space-y-6">
                        <li class="flex items-center gap-4 text-white/80">
                            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-[#34A853]/10 text-[#34A853]">
                                <lucide-icon name="code-2" [size]="20"></lucide-icon>
                            </div>
                            <span>Interactive Code Sandbox with .NET/SQL support</span>
                        </li>
                        <li class="flex items-center gap-4 text-white/80">
                            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1A73E8]/10 text-[#1A73E8]">
                                <lucide-icon name="check-circle" [size]="20"></lucide-icon>
                            </div>
                            <span>Instant feedback on architectural quiz modules</span>
                        </li>
                    </ul>
                </div>

                <!-- OVERLAPPING COMPOSITION (The Shadow Box) -->
                <div class="relative h-[500px] w-full reveal-fade-in" #reveal>
                    <!-- Dark Mode Code Sandbox Card -->
                    <div class="absolute top-0 right-0 z-20 w-[85%] rounded-xl border border-white/10 bg-[#161616] p-4 shadow-[0_32px_64px_rgba(0,0,0,0.5)] transition-transform hover:-translate-y-2">
                        <div class="flex items-center justify-between border-b border-white/5 pb-3">
                            <div class="flex items-center gap-3">
                                <div class="h-3 w-3 rounded-full bg-[#EA4335]"></div>
                                <span class="text-xs font-mono text-white/40">Database.sql</span>
                            </div>
                            <lucide-icon name="bookmark" class="text-white/20 hover:text-[#FBBC04]" [size]="14"></lucide-icon>
                        </div>
                        <div class="mt-4 font-mono text-sm leading-relaxed">
                            <div class="flex gap-4">
                                <span class="text-white/20">01</span>
                                <span class="text-[#8AB4F8]">SELECT</span>
                                <span class="text-white">user_id, count(*)</span>
                            </div>
                            <div class="flex gap-4">
                                <span class="text-white/20">02</span>
                                <span class="text-[#8AB4F8]">FROM</span>
                                <span class="text-[#CE9178]">InterviewLogs</span>
                            </div>
                            <div class="flex gap-4">
                                <span class="text-white/20">03</span>
                                <span class="text-[#8AB4F8]">GROUP BY</span>
                                <span class="text-white">readiness_score;</span>
                            </div>
                        </div>
                    </div>

                    <!-- Light Mode Quiz Card (Overlapping) -->
                    <div class="absolute bottom-0 left-0 z-30 w-[60%] rounded-xl border border-[#E0E0E0] bg-white p-6 shadow-2xl transition-transform hover:scale-105">
                        <div class="mb-4 flex items-center justify-between">
                            <span class="text-[10px] font-bold uppercase tracking-widest text-[#1A73E8]">Knowledge Check</span>
                            <lucide-icon name="check-circle-2" class="text-[#34A853]" [size]="18"></lucide-icon>
                        </div>
                        <p class="text-sm font-semibold text-[#202124]">Which indexing strategy minimizes read latency for this JOIN?</p>
                        <div class="mt-4 space-y-2">
                            <div class="rounded-lg border border-[#34A853] bg-[#34A853]/5 p-2 text-xs font-medium text-[#34A853]">
                                Clustered B-Tree Index
                            </div>
                            <div class="rounded-lg border border-[#E0E0E0] p-2 text-xs text-[#5F6368]">
                                Non-Clustered Hash
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- SKILL TREE WITH "ALIVE" NODES -->
    <section class="mx-auto max-w-7xl px-6 py-32">
        <div class="mb-16 text-center reveal-slide-up" #reveal>
            <h2 class="text-4xl font-bold tracking-tight">The Visual Mastery Path</h2>
            <p class="mt-4 text-[#5F6368]">Knowledge flows from core fundamentals to senior-level orchestration.</p>
        </div>

        <div class="relative min-h-[400px] flex items-center justify-center reveal-fade-in" #reveal>
            <svg viewBox="0 0 800 400" class="w-full max-w-4xl drop-shadow-sm">
                <!-- Branches -->
                <path d="M400,350 L400,250 M400,250 L250,150 M400,250 L550,150" fill="none" stroke="#E0E0E0" stroke-width="2" />
                <path class="draw-path" d="M400,350 L400,250 M400,250 L250,150" fill="none" stroke="#34A853" stroke-width="2" />
                
                <!-- Completed Node -->
                <circle cx="400" cy="350" r="10" fill="#E8EAED" stroke="#E0E0E0" />
                <path d="M396,350 l3,3 l5,-5" fill="none" stroke="#34A853" stroke-width="2" />

                <!-- Alive Node (In Progress) -->
                <g class="group cursor-pointer">
                    <circle cx="400" cy="250" r="12" fill="#34A853" class="animate-ping opacity-20" />
                    <circle cx="400" cy="250" r="12" fill="#34A853" class="shadow-[0_0_20px_#34A853]" />
                    <text x="420" y="255" class="text-[14px] font-bold fill-[#202124]">System Design</text>
                </g>

                <!-- Locked Nodes -->
                <circle cx="250" cy="150" r="10" fill="white" stroke="#E0E0E0" />
                <circle cx="550" cy="150" r="10" fill="white" stroke="#E0E0E0" />
            </svg>
        </div>
    </section>

    <!-- FOOTER CTA WITH ANIMATED FEEDBACK -->
    <section class="mx-auto max-w-7xl px-6 pb-24 pt-12">
        <div class="relative overflow-hidden rounded-[2.5rem] bg-[#1A73E8] p-12 text-center text-white shadow-2xl md:p-24">
            <!-- Decorative refractive circles -->
            <div class="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
            
            <div class="relative z-10 mx-auto max-w-3xl space-y-8 reveal-slide-up" #reveal>
                <h2 class="text-4xl font-bold md:text-6xl">Ready to close the gap?</h2>
                <p class="text-lg text-white/80">Join 12,000+ developers turning scattered preparation into a structured, visible advantage.</p>
                
                <form class="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row">
                    <div class="relative flex-1">
                        <input type="email" placeholder="Enter your work email" 
                               class="w-full rounded-xl border-none bg-white/10 px-6 py-4 text-white placeholder:text-white/60 focus:bg-white focus:text-[#202124] focus:ring-4 focus:ring-white/20 transition-all outline-none" />
                        <lucide-icon name="check" class="absolute right-4 top-1/2 -translate-y-1/2 text-[#34A853] opacity-0 transition-opacity"></lucide-icon>
                    </div>
                    <button class="rounded-xl bg-white px-8 py-4 font-bold text-[#1A73E8] transition-all hover:bg-[#F8F9FA] hover:shadow-lg">
                        Get Started
                    </button>
                </form>
            </div>
        </div>
    </section>

</main>

<style>
    /* ELITE MOTION DESIGN SYSTEM */
    
    .perspective-container {
        perspective: 2000px;
    }

    .floating-3d-card {
        transform: rotateX(12deg) rotateY(-5deg) rotateZ(1deg);
        transition: transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    .floating-3d-card:hover {
        transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1.02);
    }

    /* SCROLL REVEALS */
    .reveal-fade-in, .reveal-slide-up, .reveal-slide-in {
        opacity: 0;
        transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
        will-change: transform, opacity;
    }
    
    .reveal-slide-up { transform: translateY(60px); }
    .reveal-slide-in { transform: translateX(-40px); }
    
    .is-visible {
        opacity: 1 !important;
        transform: translate(0, 0) !important;
    }

    /* DRAWING ANIMATIONS */
    .draw-polygon {
        stroke-dasharray: 400;
        stroke-dashoffset: 400;
        animation: drawPath 2.5s cubic-bezier(0.65, 0, 0.35, 1) forwards;
    }

    .draw-path {
        stroke-dasharray: 1000;
        stroke-dashoffset: 1000;
        animation: drawPath 3s ease-out forwards;
        animation-delay: 0.5s;
    }

    @keyframes drawPath {
        to { stroke-dashoffset: 0; }
    }

    .animate-pulse-subtle {
        animation: pulseSubtle 4s ease-in-out infinite;
    }

    @keyframes pulseSubtle {
        0%, 100% { opacity: 0.05; transform: scale(1); }
        50% { opacity: 0.08; transform: scale(1.1); }
    }

    .btn-primary {
        background-color: #1A73E8;
        color: white;
        font-weight: 600;
        border-radius: 0.75rem;
    }
</style>
```

### Strategic Feature Integration:
1.  **Global Search (Omnibar):** Implemented as a floating, frosted-glass bar at the top center. It stays fixed to simulate the "always accessible" nature of the tool.
2.  **Readiness Progress Ring:** A fixed SVG ring in the bottom-right corner that visually "fills" as the user scrolls, keeping their readiness goal top-of-mind.
3.  **The Tactile Playground:** A high-contrast section using a dark-mode SQL editor overlapping a light-mode Quiz card. This demonstrates the "Software Architecture" vs "Interview Mastery" duality.
4.  **Alive Effect:** The Skill Tree uses a vibrant **Green (#34A853)** pulsing node and a path that "bleeds" color from the completed sections into the active one.
5.  **Micro-Interactions:** Included "Bookmark" and "Checkmark" icons inside the Playground and Skill Tree to simulate completed and saved states natively.
6.  **3D Spatial Hero:** The main dashboard uses a `rotateX` perspective transformation that flattens perfectly on hover, creating an immersive "entering the app" feeling.