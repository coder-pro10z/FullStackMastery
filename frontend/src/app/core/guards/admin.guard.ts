import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const currentUser = authService.currentUser();
  
  if (currentUser && currentUser.roles && currentUser.roles.includes('Admin')) {
    return true;
  }

  return router.createUrlTree(['/']);
};
