import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-jwt-visualizer',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="my-6 p-4 sm:p-5 rounded-2xl border border-rose-200 bg-gradient-to-br from-slate-900 via-slate-800 to-rose-950 text-white shadow-xl">
      <!-- Header -->
      <div class="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-700/80">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-rose-600 flex items-center justify-center font-bold text-white shadow-sm">
            <lucide-icon name="shield-check" [size]="18" />
          </div>
          <div>
            <h3 class="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-100">
              Interactive JWT Token Anatomy & Claims Inspector
            </h3>
            <p class="text-[11px] text-slate-400 font-medium">
              Explore Base64URL-encoded Header, Payload Claims, and Cryptographic HMAC Signature.
            </p>
          </div>
        </div>

        <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
          Bearer Authentication
        </span>
      </div>

      <!-- Color-coded Raw Token Bar -->
      <div class="p-3 rounded-xl bg-slate-950 border border-slate-800 mb-4 font-mono text-xs break-all leading-relaxed">
        <span class="text-rose-400 font-bold hover:underline cursor-pointer" (click)="activeSection.set('header')">
          eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
        </span>
        <span class="text-slate-500">.</span>
        <span class="text-purple-400 font-bold hover:underline cursor-pointer" (click)="activeSection.set('payload')">
          eyJzdWIiOiJ1c2VyXzEwMSIsIm5hbWUiOiJKb2huIERvZSIsInJvbGUiOiJBZG1pbiIsImV4cCI6MTc1MDAwMDAwMH0
        </span>
        <span class="text-slate-500">.</span>
        <span class="text-cyan-400 font-bold hover:underline cursor-pointer" (click)="activeSection.set('signature')">
          SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
        </span>
      </div>

      <!-- 3-Column Decoded View -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <!-- ── 1. HEADER ────────────────────────────────────────────────── -->
        <div
          class="p-3.5 rounded-xl border transition-all duration-300"
          [class]="activeSection() === 'header' ? 'bg-rose-950/50 border-rose-400 ring-1 ring-rose-400' : 'bg-slate-800/80 border-slate-700'"
        >
          <div class="flex items-center justify-between mb-2 pb-1.5 border-b border-rose-500/30">
            <h4 class="text-xs font-bold uppercase tracking-wider text-rose-300">1. Header (Algorithm)</h4>
            <span class="text-[10px] font-mono text-rose-400">HS256</span>
          </div>

          <pre class="text-[11px] font-mono text-slate-200 bg-slate-900/80 p-2.5 rounded-lg"><code>&#123;
  "alg": "HS256",
  "typ": "JWT"
&#125;</code></pre>
        </div>

        <!-- ── 2. PAYLOAD ───────────────────────────────────────────────── -->
        <div
          class="p-3.5 rounded-xl border transition-all duration-300"
          [class]="activeSection() === 'payload' ? 'bg-purple-950/50 border-purple-400 ring-1 ring-purple-400' : 'bg-slate-800/80 border-slate-700'"
        >
          <div class="flex items-center justify-between mb-2 pb-1.5 border-b border-purple-500/30">
            <h4 class="text-xs font-bold uppercase tracking-wider text-purple-300">2. Payload (Claims)</h4>
            <span class="text-[10px] font-mono text-purple-400">Base64 Decoded</span>
          </div>

          <pre class="text-[11px] font-mono text-slate-200 bg-slate-900/80 p-2.5 rounded-lg"><code>&#123;
  "sub": "user_101",
  "name": "John Doe",
  "role": "Admin",
  "exp": 1750000000
&#125;</code></pre>
        </div>

        <!-- ── 3. SIGNATURE ─────────────────────────────────────────────── -->
        <div
          class="p-3.5 rounded-xl border transition-all duration-300"
          [class]="activeSection() === 'signature' ? 'bg-cyan-950/50 border-cyan-400 ring-1 ring-cyan-400' : 'bg-slate-800/80 border-slate-700'"
        >
          <div class="flex items-center justify-between mb-2 pb-1.5 border-b border-cyan-500/30">
            <h4 class="text-xs font-bold uppercase tracking-wider text-cyan-300">3. Signature</h4>
            <span class="text-[10px] font-mono text-cyan-400">HMACSHA256</span>
          </div>

          <div class="text-[11px] font-mono text-slate-300 bg-slate-900/80 p-2.5 rounded-lg space-y-1">
            <p class="text-cyan-200">HMACSHA256(</p>
            <p class="text-rose-300 pl-2">base64(header) + "." +</p>
            <p class="text-purple-300 pl-2">base64(payload),</p>
            <p class="text-amber-300 pl-2">secret_key</p>
            <p class="text-cyan-200">)</p>
          </div>
        </div>
      </div>

      <!-- Explanatory Footer Banner -->
      <div class="mt-4 p-3 rounded-xl bg-slate-800 border border-rose-500/40 text-xs text-slate-100 flex items-start gap-2.5 shadow-sm">
        <lucide-icon name="info" [size]="18" class="text-rose-400 flex-shrink-0 mt-0.5" />
        <p class="leading-relaxed text-slate-200">
          <strong class="text-rose-300 font-extrabold uppercase tracking-wide mr-1">JWT Security:</strong>
          JWTs are <code class="bg-purple-950/90 text-purple-300 border border-purple-500/50 px-1.5 py-0.5 rounded font-mono font-bold">signed</code>, not encrypted! Anyone can read the payload. The signature verifies that the server issued the token and that claims were not tampered with.
        </p>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }
  `]
})
export class JwtVisualizerComponent {
  readonly activeSection = signal<'header' | 'payload' | 'signature'>('payload');
}
