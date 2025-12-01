import { inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Auth } from '../../services/auth';

export const AuthGuard = (): boolean | UrlTree => {
  const auth = inject(Auth);
  const router = inject(Router);

  // Redirigir si no hay token válido
  if (!auth.getToken()) {
    return router.parseUrl('/login');
  }

  return true;
};
