import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="shell">
      <section class="panel topbar">
        <div>
          <strong>Admin Workspace</strong>
          <div class="muted">Question imports and maintenance</div>
        </div>

        <div class="grid" style="grid-auto-flow: column;">
          <button class="button button-secondary" type="button" (click)="goToDashboard()">Dashboard</button>
          <button class="button button-primary" type="button" (click)="logout()">Logout</button>
        </div>
      </section>

      <router-outlet />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminLayoutComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  goToDashboard() {
    void this.router.navigate(['/']);
  }

  logout() {
    this.authService.logout();
  }
}
