import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/layout/layout';
import { roleGuard } from './core/guards/role-guard';

export const appRoutes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { 
    path: 'login',
    loadComponent: () =>
      import('./business/authentication/login/login').then(m => m.Login)
  },

  // Rutas protegidas dentro del Layout
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      {
        path: 'dashboard',
        loadComponent: () =>
          import('./business/dashboard/dashboard').then(m => m.DashboardComponent),
        canMatch: [roleGuard(['Administrador', 'Conductor', 'Cliente'])]
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./business/usuarios/usuarios').then(m => m.Usuarios),
        canMatch: [roleGuard(['Administrador'])]
      },
      {
        path: 'rutas',
        loadComponent: () =>
          import('./business/rutas/rutas').then(m => m.RutasComponent),
        canMatch: [roleGuard(['Administrador'])]
      },
      {
        path: 'vehiculos',
        loadComponent: () =>
          import('./business/vehiculos/vehiculos').then(m => m.VehiculosComponent),
        canMatch: [roleGuard(['Administrador'])]
      },
      {
        path: 'recorridos',
        loadComponent: () =>
          import('./business/recorridos/recorridos').then(m => m.RecorridosComponent),
        canMatch: [roleGuard(['Administrador', 'Conductor'])]
      }
    ]
  },


  { path: '**', redirectTo: 'login' }
];