import { Routes } from '@angular/router';
import { Usuarios } from './business/usuarios/usuarios';
import { Notificaciones } from './services/notificaciones';
import { Vehiculos } from './services/vehiculos';
import { Rutas } from './services/rutas';
import { Dashboard } from './business/dashboard/dashboard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard },
  { path: 'rutas', component: Rutas },
  { path: 'vehiculos', component: Vehiculos},
  { path: 'notificaciones', component: Notificaciones },
  { path: 'usuarios', component: Usuarios},
];
