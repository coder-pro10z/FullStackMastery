import { Component, AfterViewInit, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  LucideAngularModule,
  LUCIDE_ICONS,
  LucideIconProvider, // <-- We must import the Provider class
  Search, Zap, Menu, Box, HelpCircle,
  CheckCircle2, Check, Activity, Crosshair,
  Mic, Bookmark, GitMerge, ArrowRight
} from 'lucide-angular';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule
  ],
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      // FIX: Wrap the icons in 'new LucideIconProvider()' so Angular can call .hasIcon() on it
      useValue: new LucideIconProvider({
        Search, Zap, Menu, Box, HelpCircle,
        CheckCircle2, Check, Activity, Crosshair,
        Mic, Bookmark, GitMerge, ArrowRight
      })
    }
  ],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements AfterViewInit {

  heroHeatmapItems: string[] = [];
  bentoHeatmapColumns: { rows: string[] }[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.generateHeroHeatmap();
    this.generateBentoHeatmap();
  }

  generateHeroHeatmap() {
    this.heroHeatmapItems = [];
    for (let i = 0; i < 48; i++) {
      let opacity = Math.random() > 0.6 ? 'bg-[#818CF8]' : 'bg-[#E2E8F0]';
      this.heroHeatmapItems.push(opacity);
    }
  }

  generateBentoHeatmap() {
    this.bentoHeatmapColumns = [];
    let cols = 25;
    if (isPlatformBrowser(this.platformId)) {
      cols = window.innerWidth < 768 ? 14 : 25;
    }

    for (let c = 0; c < cols; c++) {
      let rows = [];
      for (let r = 0; r < 5; r++) {
        let active = Math.random() > 0.7 ? 'bg-[#1A73E8]' : (Math.random() > 0.4 ? 'bg-[#C7D2FE]' : 'bg-[#E2E8F0]');
        rows.push(active);
      }
      this.bentoHeatmapColumns.push({ rows });
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.generateBentoHeatmap();
  }

  ngAfterViewInit() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          const heroDash = entry.target.querySelector('#heroDash');
          if (heroDash) setTimeout(() => heroDash.classList.add('expanded'), 300);
        }
      });
    }, { root: null, rootMargin: '0px', threshold: 0.15 });

    document.querySelectorAll('.section-trigger').forEach(s => observer.observe(s));
  }
}