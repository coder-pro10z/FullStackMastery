import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class AppComponent implements OnInit {
  title = 'edudash-frontend';
  private router = inject(Router);

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.logPageVisit();
    });
  }

  private logPageVisit() {
    try {
      const localDataStr = localStorage.getItem('user_contributions');
      const data = localDataStr ? JSON.parse(localDataStr) : {};
      
      const d = new Date();
      const today = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
      
      data[today] = (data[today] || 0) + 1;
      localStorage.setItem('user_contributions', JSON.stringify(data));
      
      window.dispatchEvent(new CustomEvent('activity-logged'));
    } catch (e) {
      console.error('Failed to log page visit', e);
    }
  }
}
