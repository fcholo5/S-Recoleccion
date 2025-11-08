import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./business/authentication/login/login').then(m => m.Login)
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./business/dashboard/dashboard').then(m => m.Dashboard),
  },
  {
    path: 'usuarios',
    loadComponent: () =>
      import('./business/usuarios/usuarios').then(m => m.Usuarios),
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
