// src/app/shared/layout/layout.ts

import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Auth } from '../../services/auth';
import { SidebarComponent } from '../sidebar/sidebar';
import { Navbar } from '../navbar/navbar';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, Navbar],
  templateUrl: './layout.html',
  styleUrls: ['./layout.scss']
})
export class LayoutComponent {
  private auth = inject(Auth);

  getDisplayName(): string {
    const name = this.auth.getName() || 'Usuario';
    const role = this.auth.getRole() || 'Sin rol';
    return `${name} — ${role}`;
  }

  logout(): void {
    this.auth.logout();
  }
}