import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';

@Pipe({
  name: 'markdown',
  standalone: true
})
export class MarkdownPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  transform(value: string | undefined | null): SafeHtml {
    if (!value) return '';

    // Since marked.parse() returns a Promise in newer versions when async is true,
    // and a string otherwise, we ensure we pass synchronous options or await.
    // By default marked is synchronous.
    const html = marked.parse(value, {
      async: false,
      breaks: true, // Convert \n to <br>
      gfm: true     // GitHub Flavored Markdown
    }) as string;

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
