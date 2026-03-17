import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <section class="panel auth-card">
        <h1>Sign in</h1>
        <p>Access your interview question workspace and saved progress.</p>

        <form class="form-grid" (ngSubmit)="submit()">
          <label class="field">
            <span>Email</span>
            <input [(ngModel)]="email" name="email" type="email" required />
          </label>

          <label class="field">
            <span>Password</span>
            <input [(ngModel)]="password" name="password" type="password" required />
          </label>

          @if (errorMessage()) {
            <div class="error-text">{{ errorMessage() }}</div>
          }

          <button class="button button-primary" type="submit">Login</button>
        </form>

        <p>Need an account? <a routerLink="/register">Register</a></p>
      </section>
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
