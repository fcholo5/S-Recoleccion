import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from "./shared/sidebar/sidebar";
import { Navbar } from "./shared/navbar/navbar";
import { NgModel } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  // Signal reactivo para el título de la aplicación
  protected readonly title = signal('BuenaAseo');
isAuthPage: any;
}
