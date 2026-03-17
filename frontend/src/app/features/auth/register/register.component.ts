import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <section class="panel auth-card">
        <h1>Create account</h1>
        <p>Start tracking solved questions and revision lists.</p>

        <form class="form-grid" (ngSubmit)="submit()">
          <label class="field">
            <span>Email</span>
            <input [(ngModel)]="email" name="email" type="email" required />
          </label>

          <label class="field">
            <span>Password</span>
            <input [(ngModel)]="password" name="password" type="password" required minlength="6" />
          </label>

          @if (errorMessage()) {
            <div class="error-text">{{ errorMessage() }}</div>
          }

          <button class="button button-primary" type="submit">Register</button>
        </form>

        <p>Already registered? <a routerLink="/login">Login</a></p>
      </section>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  readonly errorMessage = signal('');

  submit() {
    this.errorMessage.set('');

    this.authService.register({ email: this.email, password: this.password }).subscribe({
      next: () => void this.router.navigate(['/']),
      error: () => this.errorMessage.set('Registration failed. Try a stronger password or different email.')
    });
  }
}
