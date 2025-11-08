import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'dashboard',        
        children: [
            {
                path: '',
                loadComponent: () => import('./business/dashboard/dashboard').then(m => m.Dashboard),
                //canActivate: [AuthGuard]
            },
            // Rutas de USUARIOS
            { path: 'usuarios', loadComponent: () => import('./business/usuarios/usuarios').then(m => m.Usuarios)

             },
                ]
            },
       
            {
                path: 'login',
                loadComponent: ()=> import('./business/authentication/login/login').then(m => m.Login),
                //canActivate: [AuthenticatedGuard]
            },
            {
                path: '**',
                redirectTo: 'login'
            }
            
];