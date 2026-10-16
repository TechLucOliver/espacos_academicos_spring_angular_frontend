import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  const expectedRole = route.data?.['role'];
  if (expectedRole && !authService.hasRole(expectedRole)) {
    alert('Acesso negado: seu perfil não tem permissão para acessar esta área.');
    return false;
  }

  return true;
};
