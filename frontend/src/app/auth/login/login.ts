import {Component, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {Auth} from '../../services/auth';

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

  constructor(private router: Router) { }
  private auth = inject(Auth)

  onSubmit() {
    console.log('Email:', this.email);
    console.log('Password:', this.password);

    // Validación básica
    if (this.email.trim() === '' || this.password.trim() === '') {
      alert('Por favor llene todos los campos.');
      return;
    }

    this.auth.login(this.email, this.password).subscribe({
      next: (response) => {
        console.log('Login exitoso, respuesta:', response);
        if (response.success == 1)
          this.router.navigate(['/app/dashboard']).then(r => r.valueOf());
        else
          alert(response.message);
      },
      error: (error) => {
        console.error('Error en el login:', error.message);
      }
    });
  }
}
