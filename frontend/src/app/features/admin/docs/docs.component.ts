import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  computed,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface DocEntry {
  id: string;
  title: string;
  file: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-docs',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex h-full gap-0">

      <!-- ── LEFT PANEL: Doc List ── -->
      <aside class="w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col h-full overflow-hidden">

        <!-- Panel header -->
        <div class="px-4 py-4 border-b border-slate-200 flex-shrink-0">
          <div class="flex items-center gap-2 mb-1">
            <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600
                        flex items-center justify-center shadow-sm">
              <lucide-icon name="book-open" [size]="14" class="text-white" />
            </div>
            <h2 class="text-sm font-bold text-slate-800">Documentation</h2>
          </div>
          <p class="text-[11px] text-slate-400 leading-relaxed">Developer reference for this repository</p>
        </div>

        <!-- Doc entries -->
        <nav class="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          <span class="block px-2 mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Repository Docs
          </span>

          @for (doc of docs; track doc.id) {
            <button
              [id]="'doc-item-' + doc.id"
              (click)="selectDoc(doc)"
              class="w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-sm text-left
                     border-l-2 transition-all duration-150 group"
              [class.bg-violet-50]="selectedDoc()?.id === doc.id"
              [class.text-violet-700]="selectedDoc()?.id === doc.id"
              [class.font-semibold]="selectedDoc()?.id === doc.id"
              [class.border-violet-600]="selectedDoc()?.id === doc.id"
              [class.text-slate-600]="selectedDoc()?.id !== doc.id"
              [class.border-transparent]="selectedDoc()?.id !== doc.id"
              [class.hover:bg-slate-100]="selectedDoc()?.id !== doc.id"
              [title]="doc.title"
            >
              <lucide-icon [name]="doc.icon" [size]="15" class="flex-shrink-0 mt-0.5 opacity-70 group-hover:opacity-100" />
              <div class="min-w-0">
                <div class="font-medium truncate">{{ doc.title }}</div>
                <div class="text-[11px] text-slate-400 truncate mt-0.5">{{ doc.description }}</div>
              </div>
            </button>
          }
        </nav>

        <!-- Footer note -->
        <div class="border-t border-slate-200 px-4 py-3 flex-shrink-0">
          <p class="text-[10px] text-slate-400 leading-relaxed">
            Files are read from <code class="bg-slate-100 px-1 rounded text-slate-600">src/assets/docs/</code>
          </p>
        </div>
      </aside>

      <!-- ── RIGHT PANEL: Doc Viewer ── -->
      <main class="flex-1 min-w-0 overflow-y-auto bg-slate-50">

        @if (!selectedDoc()) {
          <!-- Empty state -->
          <div class="flex flex-col items-center justify-center h-full text-center px-8 py-16">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100
                        flex items-center justify-center mb-4">
              <lucide-icon name="book-open" [size]="28" class="text-violet-500" />
            </div>
            <h3 class="text-lg font-semibold text-slate-700 mb-2">Select a document</h3>
            <p class="text-sm text-slate-400 max-w-xs leading-relaxed">
              Choose a doc from the left panel to view the developer reference material.
            </p>
          </div>
        }

        @if (selectedDoc() && isLoading()) {
          <!-- Skeleton loader -->
          <div class="max-w-4xl mx-auto px-8 py-8 animate-pulse">
            <div class="h-8 bg-slate-200 rounded-lg w-2/3 mb-3"></div>
            <div class="h-4 bg-slate-200 rounded w-1/3 mb-8"></div>
            <div class="space-y-3">
              @for (line of skeletonLines; track $index) {
                <div class="h-4 bg-slate-200 rounded" [style.width]="line"></div>
              }
            </div>
          </div>
        }

        @if (selectedDoc() && !isLoading() && loadError()) {
          <!-- Error state -->
          <div class="flex flex-col items-center justify-center h-full text-center px-8 py-16">
            <div class="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
              <lucide-icon name="alert-circle" [size]="24" class="text-red-500" />
            </div>
            <h3 class="text-base font-semibold text-slate-700 mb-2">Could not load document</h3>
            <p class="text-sm text-slate-400 max-w-sm leading-relaxed">{{ loadError() }}</p>
            <button
              class="mt-4 px-4 py-2 text-sm font-medium text-violet-700 bg-violet-50
                     hover:bg-violet-100 rounded-lg transition-colors duration-150"
              (click)="retryLoad()"
            >
              Try again
            </button>
          </div>
        }

        @if (selectedDoc() && !isLoading() && !loadError()) {
          <!-- Content Header -->
          <div class="bg-white border-b border-slate-200 px-8 py-5 flex-shrink-0 sticky top-0 z-10
                      backdrop-blur-xl bg-white/90">
            <div class="max-w-4xl mx-auto flex items-center justify-between gap-4">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600
                            flex items-center justify-center shadow-sm">
                  <lucide-icon [name]="selectedDoc()!.icon" [size]="14" class="text-white" />
                </div>
                <div>
                  <h1 class="text-base font-bold text-slate-800 leading-tight">{{ selectedDoc()!.title }}</h1>
                  <p class="text-[11px] text-slate-400">{{ selectedDoc()!.description }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span class="px-2 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider
                             bg-violet-100 text-violet-700">
                  {{ selectedDoc()!.file }}
                </span>
              </div>
            </div>
          </div>

          <!-- Rendered Markdown -->
          <article class="max-w-4xl mx-auto px-8 py-8 docs-markdown">
            <div [innerHTML]="renderedContent()"></div>
          </article>
        }
      </main>
    </div>
  `,
  styles: [`
    :host { display: flex; height: 100%; overflow: hidden; }

    /* ── Markdown prose styles ── */
    .docs-markdown :is(h1, h2, h3, h4) {
      font-family: 'Outfit', 'Inter', sans-serif;
      font-weight: 700;
      color: #202124;
      letter-spacing: -0.02em;
    }
    .docs-markdown h1 { font-size: 1.75rem; margin: 2rem 0 1rem; padding-bottom: 0.5rem;
      border-bottom: 2px solid #E2E8F0; }
    .docs-markdown h2 { font-size: 1.35rem; margin: 2rem 0 0.75rem; padding-bottom: 0.4rem;
      border-bottom: 1px solid #E2E8F0; }
    .docs-markdown h3 { font-size: 1.1rem; margin: 1.5rem 0 0.5rem; color: #334155; }
    .docs-markdown h4 { font-size: 0.95rem; margin: 1.25rem 0 0.4rem; color: #475569; }

    .docs-markdown p { font-size: 0.875rem; line-height: 1.75; color: #374151; margin: 0.75rem 0; }

    .docs-markdown a { color: #1A73E8; text-decoration: underline; text-underline-offset: 2px; }
    .docs-markdown a:hover { color: #1558b0; }

    .docs-markdown ul, .docs-markdown ol {
      padding-left: 1.5rem; margin: 0.75rem 0; color: #374151; font-size: 0.875rem;
    }
    .docs-markdown li { margin: 0.35rem 0; line-height: 1.7; }
    .docs-markdown ul li { list-style-type: disc; }
    .docs-markdown ol li { list-style-type: decimal; }

    .docs-markdown code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.82em;
      background: #F1F5F9;
      color: #7C3AED;
      padding: 0.15em 0.4em;
      border-radius: 4px;
      border: 1px solid #E2E8F0;
    }
    .docs-markdown pre {
      background: #0F172A;
      border-radius: 10px;
      padding: 1.25rem;
      overflow-x: auto;
      margin: 1.25rem 0;
      border: 1px solid #1E293B;
    }
    .docs-markdown pre code {
      background: none;
      color: #E2E8F0;
      border: none;
      padding: 0;
      font-size: 0.82rem;
      line-height: 1.6;
    }

    .docs-markdown table {
      width: 100%; border-collapse: collapse; margin: 1.25rem 0;
      font-size: 0.85rem; border-radius: 8px; overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.07);
    }
    .docs-markdown th {
      background: #F8FAFC; color: #334155; font-weight: 600;
      padding: 0.65rem 1rem; text-align: left; border-bottom: 2px solid #E2E8F0;
    }
    .docs-markdown td {
      padding: 0.6rem 1rem; border-bottom: 1px solid #F1F5F9; color: #4B5563;
      vertical-align: top;
    }
    .docs-markdown tr:last-child td { border-bottom: none; }
    .docs-markdown tr:hover td { background: #F8FAFC; }

    .docs-markdown blockquote {
      border-left: 3px solid #7C3AED; background: #F5F3FF;
      padding: 0.75rem 1rem; margin: 1rem 0; border-radius: 0 8px 8px 0;
      color: #4B5563; font-size: 0.875rem;
    }

    .docs-markdown hr { border: none; border-top: 2px solid #E2E8F0; margin: 2rem 0; }

    .docs-markdown strong { color: #1E293B; font-weight: 600; }
    .docs-markdown em { color: #475569; }

    /* Badge/pill spans in markdown like the handbook uses */
    .docs-markdown .badge {
      display: inline-block; padding: 0.15em 0.55em;
      background: #DBEAFE; color: #1D4ED8; border-radius: 999px;
      font-size: 0.75em; font-weight: 600;
    }
  `],
})
export class DocsComponent {
  private readonly http = inject(HttpClient);
  private readonly sanitizer = inject(DomSanitizer);

  readonly docs: DocEntry[] = [
    {
      id: 'handbook',
      title: 'Frontend Handbook',
      file: 'Frontend-Handbook.md',
      icon: 'book',
      description: 'Design system, patterns & rules',
    },
    {
      id: 'navigation',
      title: 'Navigation Guide',
      file: 'Navigation.md',
      icon: 'compass',
      description: 'Routes, navbar structure & acceptance',
    },
    {
      id: 'progress',
      title: 'Progress Log',
      file: 'Progress.md',
      icon: 'list-checks',
      description: 'Sprint progress & feature status',
    },
    {
      id: 'migration',
      title: 'Migration Progress',
      file: 'Frontend-Migration-progress.md',
      icon: 'git-pull-request',
      description: 'Component-by-component migration tracker',
    },
    {
      id: 'structural',
      title: 'Structural Changes',
      file: 'frontend-strucutral-changes.md',
      icon: 'folder-tree',
      description: 'Architecture decisions & folder layout',
    },
  ];

  readonly skeletonLines = ['100%', '90%', '85%', '95%', '70%', '100%', '60%', '88%', '92%', '75%'];

  readonly selectedDoc = signal<DocEntry | null>(null);
  readonly isLoading = signal(false);
  readonly loadError = signal<string | null>(null);
  private readonly rawContent = signal<string>('');

  readonly renderedContent = computed<SafeHtml>(() => {
    const raw = this.rawContent();
    if (!raw) return '';
    return this.sanitizer.bypassSecurityTrustHtml(this.parseMarkdown(raw));
  });

  selectDoc(doc: DocEntry): void {
    if (this.selectedDoc()?.id === doc.id) return;
    this.selectedDoc.set(doc);
    this.isLoading.set(true);
    this.loadError.set(null);
    this.rawContent.set('');
    this.fetchDoc(doc);
  }

  retryLoad(): void {
    const doc = this.selectedDoc();
    if (!doc) return;
    this.isLoading.set(true);
    this.loadError.set(null);
    this.fetchDoc(doc);
  }

  private fetchDoc(doc: DocEntry): void {
    this.http.get(`assets/docs/${doc.file}`, { responseType: 'text' }).subscribe({
      next: (text) => {
        this.rawContent.set(text);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.loadError.set(
          `Failed to load "${doc.file}". Make sure it exists in src/assets/docs/. (${err.status ?? 'Network error'})`
        );
        this.isLoading.set(false);
      },
    });
  }

  // ── Lightweight Markdown → HTML parser ──────────────────────────────────
  private parseMarkdown(md: string): string {
    const lines = md.split('\n');
    const result: string[] = [];
    let inCodeBlock = false;
    let codeLang = '';
    let codeLines: string[] = [];
    let inTable = false;
    let tableHeaderParsed = false;
    let tableRows: string[] = [];

    const flushTable = () => {
      if (!inTable || tableRows.length === 0) return;
      const [header, , ...body] = tableRows;
      const ths = (header ?? '').split('|').filter(c => c.trim()).map(c =>
        `<th>${this.inlineMarkdown(c.trim())}</th>`).join('');
      const trs = body.map(row =>
        `<tr>${row.split('|').filter(c => c.trim()).map(c =>
          `<td>${this.inlineMarkdown(c.trim())}</td>`).join('')}</tr>`
      ).join('\n');
      result.push(`<table><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`);
      inTable = false;
      tableHeaderParsed = false;
      tableRows = [];
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code block toggle
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeLang = line.slice(3).trim();
          codeLines = [];
        } else {
          inCodeBlock = false;
          const escaped = codeLines.join('\n')
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          result.push(`<pre><code class="language-${codeLang}">${escaped}</code></pre>`);
          codeLines = [];
        }
        continue;
      }
      if (inCodeBlock) { codeLines.push(line); continue; }

      // Table detection
      if (line.includes('|') && line.trim().startsWith('|')) {
        inTable = true;
        tableRows.push(line);
        continue;
      } else if (inTable) {
        flushTable();
      }

      // Headings
      if (line.startsWith('#### ')) { result.push(`<h4>${this.inlineMarkdown(line.slice(5))}</h4>`); continue; }
      if (line.startsWith('### '))  { result.push(`<h3>${this.inlineMarkdown(line.slice(4))}</h3>`); continue; }
      if (line.startsWith('## '))   { result.push(`<h2>${this.inlineMarkdown(line.slice(3))}</h2>`); continue; }
      if (line.startsWith('# '))    { result.push(`<h1>${this.inlineMarkdown(line.slice(2))}</h1>`); continue; }

      // HR
      if (/^---+$/.test(line.trim())) { result.push('<hr>'); continue; }

      // Blockquote
      if (line.startsWith('> ')) {
        result.push(`<blockquote><p>${this.inlineMarkdown(line.slice(2))}</p></blockquote>`);
        continue;
      }

      // Unordered list
      if (/^(\s*)([-*+]) /.test(line)) {
        const text = line.replace(/^(\s*)([-*+]) /, '');
        result.push(`<ul><li>${this.inlineMarkdown(text)}</li></ul>`);
        continue;
      }

      // Ordered list
      if (/^\d+\. /.test(line)) {
        const text = line.replace(/^\d+\. /, '');
        result.push(`<ol><li>${this.inlineMarkdown(text)}</li></ol>`);
        continue;
      }

      // Blank line / paragraph
      if (line.trim() === '') { result.push('<br>'); continue; }

      result.push(`<p>${this.inlineMarkdown(line)}</p>`);
    }

    flushTable();

    // Merge consecutive list items
    return result.join('\n')
      .replace(/<\/ul>\n<ul>/g, '\n')
      .replace(/<\/ol>\n<ol>/g, '\n');
  }

  private inlineMarkdown(text: string): string {
    return text
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" style="max-width:100%">')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  }
}
