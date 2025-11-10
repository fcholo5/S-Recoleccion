// src/app/dashboard/dashboard.ts
import { Component } from '@angular/core';

import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Card } from "../../shared/components/card/card";
import { Mapa } from "../mapa/mapa";
import { Sidebar } from '../../shared/sidebar/sidebar';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard {
  // estados / datos demo
  totalRutas = 12;
  proximoPaso = 'Barrio Centro - 07:30';
}
