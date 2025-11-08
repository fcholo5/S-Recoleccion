// src/app/authentication/login/login.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {
  email = '';
  password = '';
  loading = false;
  constructor(private router: Router) {}

  async submit() {
    this.loading = true;
    // Simula login; en tu app llamarás a un AuthService
    setTimeout(() => {
      this.loading = false;
      this.router.navigateByUrl('/dashboard');
    }, 800);
  }
}
