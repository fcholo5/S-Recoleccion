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
    children: [
      {
        path: 'rutas',
        loadComponent: () =>
          import('./business/rutas/rutas').then(m => m.RutasComponent)
      },
      {
        path: 'vehiculos',
        loadComponent: () =>
          import('./business/vehiculos/vehiculos').then(m => m.Vehiculos)
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./business/usuarios/usuarios').then(m => m.Usuarios)
      },
      {
        path: '',
        redirectTo: 'rutas',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
