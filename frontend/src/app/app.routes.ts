import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './shared/layout/layout';

export const appRoutes: Routes = [
       
    { path: '', redirectTo: 'login', pathMatch: 'full' },

  // LOGIN SIN LAYOUT
  {
    path: 'login',
    loadComponent: () =>
      import('./business/authentication/login/login')
        .then(m => m.Login)
  },

  // TODA LA APP CON LAYOUT
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      {
        path: 'dashboard',
        loadComponent: () =>
          import('./business/dashboard/dashboard')
            .then(m => m.DashboardComponent)
      },

      {
        path: 'usuarios',
        loadComponent: () =>
          import('./business/usuarios/usuarios')
            .then(m => m.Usuarios)
      },
{
  path: 'rutas',
  loadComponent: () =>
    import('./business/rutas/rutas').then(m => m.RutasPage)
}


      // aquí puedes agregar más rutas
    ]
  },

  { path: '**', redirectTo: 'login' }
];
