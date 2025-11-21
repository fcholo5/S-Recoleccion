import { Component, inject } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Navbar } from '../navbar/navbar';
import { Sidebar } from '../sidebar/sidebar';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    Sidebar,
    Navbar
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class LayoutComponent {
  private router = inject(Router);
  isLoginRoute = false;

  constructor() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isLoginRoute = event.urlAfterRedirects.includes('/login');
      }
    });
  }
}
