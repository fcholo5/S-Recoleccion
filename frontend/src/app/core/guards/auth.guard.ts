// src/app/core/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('authToken'); // Debe coincidir con AuthService
    if (token) return true;

    // No autenticado → redirige al login
    this.router.navigate(['/login']);
    return false;
  }
}
