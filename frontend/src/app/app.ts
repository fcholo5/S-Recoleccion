import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from "./shared/sidebar/sidebar";
import { Navbar } from "./shared/navbar/navbar";
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Sidebar, Navbar],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  // Signal reactivo para el título de la aplicación
  protected readonly title = signal('BuenaAseo');
}
