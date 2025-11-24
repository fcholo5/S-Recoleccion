import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../../services/auth';  // <-- IMPORTANTE

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class Login {
[x: string]: any;

  email: string = '';
  password: string = '';

  // Inyección moderna de Angular 16+
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

        // Laravel devuelve: success, role, token
        if (response.success === 1 && response.token) {
          // Guardado del token ya lo hace el servicio
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
