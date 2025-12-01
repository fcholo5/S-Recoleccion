// src/app/shared/navbar/navbar.ts

import { Component, inject } from '@angular/core';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class Navbar {
  private auth = inject(Auth);

  get userDisplayName(): string {
    const name = this.auth.getName() || 'Usuario';
    const role = this.auth.getRole() || '';
    return role ? `${name} — ${role}` : name;
  }

  logout() {
    this.auth.logout();
  }
}