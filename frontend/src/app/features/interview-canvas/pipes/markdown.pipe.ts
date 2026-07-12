import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * MarkdownPipe — lightweight markdown renderer for Q&A answer fields.
 *
 * Supported syntax:
 *   ```code blocks``` (triple backtick fenced)
 *   :code <inline>    (inline shorthand → code element)
 *   **bold**
 *   _italic_
 *   `inline code`
 *   - list items
 *
 * The pipe is PURE — re-renders only when the input string changes.
 */
@Pipe({ name: 'markdown', standalone: true, pure: true })
export class MarkdownPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {}

  transform(raw: string | undefined | null): SafeHtml {
    if (!raw) return '';
    const html = this.toHtml(raw);
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  private toHtml(text: string): string {
    // 1. Fenced code blocks (``` ... ```)
    text = text.replace(/```([\s\S]*?)```/g, (_, code) => {
      const escaped = this.escapeHtml(code.trim());
      return `<div class="relative group my-2">
        <pre class="bg-slate-900 text-emerald-300 text-xs font-mono rounded-lg p-4 overflow-x-auto leading-relaxed">${escaped}</pre>
        <button onclick="navigator.clipboard.writeText(this.parentElement.querySelector('pre').innerText)" 
                class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-[10px] font-bold bg-slate-700 text-slate-200 px-2 py-0.5 rounded transition-opacity">
          Copy
        </button>
      </div>`;
    });

    // 2. :code shorthand → inline code for the rest of the line
    text = text.replace(/:code (.+)/g, (_, code) => {
      return `<code class="bg-slate-900 text-emerald-300 text-xs font-mono px-2 py-0.5 rounded">${this.escapeHtml(code)}</code>`;
    });

    // 3. Inline backtick code
    text = text.replace(/`([^`]+)`/g, (_, code) =>
      `<code class="bg-slate-100 text-rose-600 text-xs font-mono px-1.5 py-0.5 rounded">${this.escapeHtml(code)}</code>`
    );

    // 4. Bold
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>');

    // 5. Italic
    text = text.replace(/_(.+?)_/g, '<em class="italic text-slate-700">$1</em>');

    // 6. Bullet list items
    text = text.replace(/^[-•]\s+(.+)$/gm, '<li class="ml-4 list-disc text-slate-700">$1</li>');
    text = text.replace(/(<li[\s\S]+?<\/li>)/g, '<ul class="my-1 space-y-0.5">$1</ul>');

    // 7. Line breaks
    text = text.replace(/\n/g, '<br>');

    return `<div class="prose-sm leading-relaxed text-slate-700">${text}</div>`;
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
