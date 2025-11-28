import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/layout/layout';
import { AuthGuard } from './core/guards/auth.guard';

export const appRoutes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { 
    path: 'login',
    loadComponent: () =>
      import('./business/authentication/login/login').then(m => m.Login)
  },

  {
    path: '',
    component: LayoutComponent,
    canMatch: [AuthGuard], // ✅ usa canMatch aquí
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./business/dashboard/dashboard').then(m => m.DashboardComponent)
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./business/usuarios/usuarios').then(m => m.Usuarios)
      },
      {
        path: 'rutas',
        loadComponent: () =>
          import('./business/rutas/rutas').then(m => m.RutasComponent)
      },
      {
        path: 'vehiculos',
        loadComponent: () =>
          import('./business/vehiculos/vehiculos').then(m => m.VehiculosComponent)
      },
      {
        path: 'recorridos',
        loadComponent: () =>
          import('./business/recorridos/recorridos').then(m => m.RecorridosComponent)
      }
    ]
  },

  { path: '**', redirectTo: 'login' }
];
