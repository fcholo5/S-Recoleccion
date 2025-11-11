// src/app/authentication/login/login.ts

import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {
  email = '';
  password = '';
  errorMessage: string | undefined;
  loading: boolean | undefined;
  auth: any;
  router: any;

   login(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Debes ingresar correo y contraseña';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.auth.login(this.email, this.password).subscribe({
      next: (response: { token: string; role: string; }) => {
        this.loading = false;

        if (response?.token) {
          localStorage.setItem('authToken', response.token);
          const role = response.role || 'Usuario';

          if (role === 'Administrador') {
            this.router.navigate(['/dashboard']);
          } else {
            this.router.navigate(['/profile']);
          }
        } else {
          this.errorMessage = 'No se recibió token del backend';
        }
      },
      error: (err: { message: string; }) => {
        this.loading = false;
        this.errorMessage = err.message || 'Error al iniciar sesión';
        console.error('Login error', err);
      }
    });
  }
}
