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
irRegistro() {
throw new Error('Method not implemented.');
}

  email: string = '';
  password: string = '';

  private auth = inject(Auth);
  private router = inject(Router);

  loading = false;
  errorMessage: string | null = null;

  onSubmit() {
    this.errorMessage = null;

    if (!this.email.trim() || !this.password.trim()) {
      this.errorMessage = 'Por favor llene todos los campos.';
      return;
    }

    this.loading = true;

    this.auth.login(this.email, this.password).subscribe({
      next: (response) => {
        console.log('LOGIN OK:', response);

        /**
         * IMPORTANTE:
         * Tu backend devuelve:
         * {
         *   success: 1,
         *   role: "...",
         *   data: "TOKEN"
         * }
         *
         * El token VIENE EN "data"
         */
        if (response.success === 1 && response.data) {
          console.log('Redirigiendo al dashboard...');
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = 'Respuesta inesperada del servidor.';
        }

        this.loading = false;
      },

      error: (err) => {
        console.error('ERROR LOGIN:', err);
        this.errorMessage = err.message || 'Error inesperado al iniciar sesión.';
        this.loading = false;
      }
    });
  }
}
