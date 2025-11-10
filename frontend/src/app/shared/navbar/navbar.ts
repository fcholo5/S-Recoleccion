// src/app/shared/navbar/navbar.ts
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class Navbar {
  @Input() title = 'Dashboard';
pageTitle: any;
}
