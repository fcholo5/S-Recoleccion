import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class Login {
  email: string = '';
  password: string = '';
  loading: boolean = false;
  errorMessage: string | null = null;

  private auth = inject(Auth);
  private router = inject(Router);

  onSubmit(): void {
    this.errorMessage = null;
    if (!this.email.trim() || !this.password.trim()) {
      this.errorMessage = 'Ingrese correo y contraseña.';
      return;
    }

    this.loading = true;

    this.auth.login(this.email, this.password).subscribe({
      next: (response: any) => {
        // ✅ ASIGNA EL MENSAJE DE ERROR INMEDIATAMENTE, ANTES DE QUITAR EL LOADING
        if (response?.success === 1) {
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = response?.message || 'Correo y/o contraseña incorrectos.';
        }
        // 👇 Solo después, quita el loading (para que el botón vuelva a ser clickeable)
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudo conectar con el servidor.';
        this.loading = false;
      }
    });
  }
}