import {
  ChangeDetectionStrategy, Component, ElementRef,
  inject, input, OnChanges, SimpleChanges, ViewChild, signal, AfterViewInit
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { LucideAngularModule } from 'lucide-angular';
import mermaid from 'mermaid';

let nextId = 0;

@Component({
  selector: 'app-mermaid-viewer',
  standalone: true,
  imports: [LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host { display: block; }
    ::ng-deep .mermaid-svg-container svg {
      max-width: 100% !important;
      height: auto !important;
      margin: 0 auto;
    }
  `],
  template: `
    <div class="edudash-card !p-0 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden my-4 shadow-xl">
      <!-- Header Bar -->
      <div class="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800">
        <div class="flex items-center gap-2">
          <div class="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
          <div class="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
          <div class="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
          <span class="text-xs font-semibold text-slate-300 ml-2 font-mono uppercase tracking-wider">
            {{ title() || 'Architecture Diagram' }}
          </span>
        </div>

        <div class="flex items-center gap-2">
          <!-- Toggle Raw Syntax button -->
          <button
            (click)="showRaw.set(!showRaw())"
            class="px-2 py-1 rounded text-[11px] font-mono text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            [title]="showRaw() ? 'Show Diagram' : 'Show Source Code'"
          >
            {{ showRaw() ? 'Diagram' : 'Code' }}
          </button>
          <!-- Copy Raw Code button -->
          <button
            (click)="copyCode()"
            class="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Copy Diagram Source"
          >
            <lucide-icon [name]="copied() ? 'check' : 'copy'" [size]="14" [class.text-emerald-400]="copied()" />
          </button>
        </div>
      </div>

      <!-- Diagram Body -->
      <div class="p-5 overflow-x-auto min-h-[120px] flex items-center justify-center">
        @if (showRaw()) {
          <pre class="w-full text-xs font-mono text-cyan-400 whitespace-pre p-2 selection:bg-slate-800"><code>{{ graph() }}</code></pre>
        } @else if (error()) {
          <div class="text-center p-4">
            <p class="text-xs text-rose-400 font-mono mb-2">Diagram Parsing Error</p>
            <pre class="text-[11px] font-mono text-slate-400 whitespace-pre bg-slate-900 p-3 rounded border border-slate-800 text-left"><code>{{ graph() }}</code></pre>
          </div>
        } @else {
          <div
            #diagramContainer
            class="mermaid-svg-container w-full flex justify-center text-slate-100"
            [innerHTML]="svgContent()"
          ></div>
        }
      </div>
    </div>
  `
})
export class MermaidViewerComponent implements OnChanges, AfterViewInit {
  private readonly sanitizer = inject(DomSanitizer);

  readonly graph = input.required<string>();
  readonly title = input<string>();

  readonly svgContent = signal<SafeHtml | null>(null);
  readonly error = signal<boolean>(false);
  readonly showRaw = signal<boolean>(false);
  readonly copied = signal<boolean>(false);

  private readonly elementId = `mermaid-graph-${++nextId}`;
  private isInitialized = false;

  constructor() {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      securityLevel: 'loose',
      fontFamily: 'Inter, system-ui, sans-serif',
      themeVariables: {
        darkMode: true,
        background: '#020617',
        primaryColor: '#1A73E8',
        primaryTextColor: '#F8FAFC',
        primaryBorderColor: '#3B82F6',
        lineColor: '#64748B',
        secondaryColor: '#10B981',
        tertiaryColor: '#F59E0B'
      }
    });
  }

  ngAfterViewInit(): void {
    this.isInitialized = true;
    this.renderDiagram();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['graph'] && this.isInitialized) {
      this.renderDiagram();
    }
  }

  private async renderDiagram(): Promise<void> {
    const raw = this.graph()?.trim();
    if (!raw) {
      this.svgContent.set(null);
      return;
    }

    try {
      this.error.set(false);
      const uniqueId = `${this.elementId}-${Date.now()}`;
      const { svg } = await mermaid.render(uniqueId, raw);
      this.svgContent.set(this.sanitizer.bypassSecurityTrustHtml(svg));
    } catch (err) {
      console.warn('[MermaidViewer] Failed to render diagram:', err);
      this.error.set(true);
    }
  }

  copyCode(): void {
    if (!this.graph()) return;
    navigator.clipboard.writeText(this.graph()).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }
}
