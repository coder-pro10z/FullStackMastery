import { Component, Input, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Copy, Check } from 'lucide-angular';
import { ICodeBlock } from '../../../core/models/code-block.model';

@Component({
  selector: 'app-code-block',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './code-block.component.html',
  styleUrl: './code-block.component.scss'
})
export class CodeBlockComponent {
  @Input({ required: true }) data!: ICodeBlock;
  
  isCopied = false;

  get codeLines(): string[] {
    return this.data.code.split('\n');
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.data.code).then(() => {
      this.isCopied = true;
      setTimeout(() => this.isCopied = false, 2000);
    });
  }
}
