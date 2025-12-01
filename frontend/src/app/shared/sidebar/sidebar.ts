// src/app/shared/sidebar/sidebar.ts

import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss']
})
export class SidebarComponent {
  private auth = inject(Auth);

  get menuItems() {
    const role = this.auth.getRole();
    const items = [];

    // Todos ven el dashboard
    items.push({
      icon: '📊',
      label: 'Dashboard',
      path: '/dashboard',
      exact: true
    });

    // Solo Administrador ve estas secciones
    if (role === 'Administrador') {
      items.push(
        { icon: '📍', label: 'Gestión de Rutas', path: '/rutas', exact: false },
        { icon: '🚚', label: 'Control Vehicular', path: '/vehiculos', exact: false },
        { icon: '👤', label: 'Usuarios y Roles', path: '/usuarios', exact: false },
        { icon: '⚙️', label: 'Configuración', path: '/configuracion', exact: false }
      );
    }

    // Administrador y Conductor ven recorridos
    if (role === 'Administrador' || role === 'Conductor') {
      items.push({
        icon: '📝',
        label: 'Recorridos',
        path: '/recorridos',
        exact: false
      });
    }

    return items;
  }

  logout() {
    this.auth.logout();
  }
}