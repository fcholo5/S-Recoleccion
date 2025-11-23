import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const appRoutes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login').then(m => m.Login)
  },
  {
    path: 'app',
    loadComponent: () =>
      import('./business/business').then(m => m.Business),
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./business/dashboard/dashboard').then(m => m.DashboardComponent),
      },
      {
        path: 'rutas',
        loadComponent: () =>
          import('./business/rutas/rutas').then(m => m.RutasComponent),
      },
      {
        path: 'vehiculos',
        loadComponent: () =>
          import('./business/vehiculos/vehiculos').then(m => m.Vehiculos),
      },
      {
        path: 'notificaciones',
        loadComponent: () =>
          import('./business/notificaciones/notificaciones').then(m => m.Notificaciones),
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./business/usuarios/usuarios').then(m => m.Usuarios),
      },
      { path: '**', redirectTo: 'dashboard' }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
