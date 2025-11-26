import { inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Auth } from '../../services/auth';

export const AuthGuard = (): boolean | UrlTree => {
  const auth = inject(Auth);
  const router = inject(Router);

  // Si está autenticado → permite el acceso
  if (auth.isAuthenticated()) {
    return true;
  }

  // Si NO está autenticado → redirige al login
  return router.parseUrl('/login');
};
