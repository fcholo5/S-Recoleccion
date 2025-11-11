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
    this.auth.login(this.email, this.password).subscribe({
      next: (response: { token: any; role: any; })=> {
        console.log('Entró')
        const token = response.token;
        const role = response.role
        // const payload = JSON.parse(atob(token.split('.')[1]));
        // const role = payload.role;
        localStorage.setItem('token', token);
        if(role === 'Administrador') {
          this.router.navigate(['/dashboard'])
        }else {
          this.router.navigate(['/profile'])
        }
      },
      error: (err: any) => console.error('Login failed', err)
    })
  }
}
