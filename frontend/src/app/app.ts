import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from "./business/shared/sidebar/sidebar";
import { Navbar } from "./business/shared/navbar/navbar";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Sidebar],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  // Signal reactivo para el título de la aplicación
  protected readonly title = signal('BuenaAseo');
}
