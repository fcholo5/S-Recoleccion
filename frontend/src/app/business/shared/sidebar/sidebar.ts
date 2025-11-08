// src/app/shared/sidebar/sidebar.ts
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss']
})
export class Sidebar {
  collapsed = false;
  toggle() {
    this.collapsed = !this.collapsed;
  }
}
