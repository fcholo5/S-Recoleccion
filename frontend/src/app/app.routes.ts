import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const appRoutes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./business/authentication/login/login').then(m => m.Login)
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./business/dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [AuthGuard] // RUTA PROTEGIDA
  },
  {
    path: 'usuarios',
    loadComponent: () =>
      import('./business/usuarios/usuarios').then(m => m.Usuarios),
    canActivate: [AuthGuard] // RUTA PROTEGIDA
  },
  { path: '**', redirectTo: 'login' }
];
