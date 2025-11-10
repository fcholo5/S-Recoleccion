// src/app/dashboard/dashboard.ts
import { Component } from '@angular/core';
import { Navbar } from '../shared/navbar/navbar';
import { Sidebar } from '../shared/sidebar/sidebar';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, Sidebar],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard {
  // estados / datos demo
  totalRutas = 12;
  proximoPaso = 'Barrio Centro - 07:30';
}
