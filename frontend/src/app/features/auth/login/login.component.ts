import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-dark-bg p-4 relative overflow-hidden">
      <!-- Background glow effects -->
      <div class="absolute top-0 left-1/4 w-96 h-96 bg-accent-blue/5 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-purple/5 rounded-full blur-3xl"></div>

      <div class="w-full max-w-md relative z-10 animate-scale-in">
        <!-- Brand -->
        <div class="text-center mb-8">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center mx-auto mb-4 shadow-glow-blue">
            <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-white mb-1">Welcome back</h1>
          <p class="text-sm text-slate-500">Sign in to continue your interview prep journey</p>
        </div>

        <!-- Auth Card -->
        <section class="glass-panel p-6 shadow-glass">
          <form class="space-y-4" (ngSubmit)="submit()">
            <div>
              <label class="text-xs font-medium text-slate-400 mb-1.5 block">Email address</label>
              <input
                [(ngModel)]="email"
                name="email"
                type="email"
                required
                placeholder="you&#64;example.com"
                class="input-dark" />
            </div>

            <div>
              <label class="text-xs font-medium text-slate-400 mb-1.5 block">Password</label>
              <input
                [(ngModel)]="password"
                name="password"
                type="password"
                required
                placeholder="Enter your password"
                class="input-dark" />
            </div>

            @if (errorMessage()) {
              <div class="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
                <svg class="w-4 h-4 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span class="text-sm text-red-400">{{ errorMessage() }}</span>
              </div>
            }

            <button class="btn-primary w-full py-3 text-sm" type="submit">
              Sign in
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </form>

          <div class="mt-5 pt-4 border-t border-dark-border-light/50 text-center">
            <p class="text-sm text-slate-500">
              Need an account?
              <a routerLink="/register" class="text-accent-blue hover:text-blue-400 font-medium transition-colors">Create one</a>
            </p>
          </div>
        </section>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  readonly errorMessage = signal('');

  submit() {
    this.errorMessage.set('');
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => void this.router.navigate(['/']),
      error: () => this.errorMessage.set('Login failed. Check your email and password.')
    });
  }
}
