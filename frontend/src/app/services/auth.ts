import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  private httpClient = inject(HttpClient);
  private router = inject(Router);

  private tokenKey = 'authToken';
  private roleKey = 'authRole';

  // ======================================================
  // LOGIN
  // ======================================================
  login(email: string, password: string): Observable<any> {

    const url = environment.serverUrl + 'login';

    return this.httpClient.post<any>(url, { email, password }).pipe(
      tap(response => {

        console.log('DEBUG LOGIN BACKEND:', response);

        if (response.success === 1 && response.data) {

          // Guarda token y rol
          this.setToken(response.data);
          this.setRole(response.role);

          console.log('TOKEN GUARDADO:', response.data);
          console.log('ROL GUARDADO:', response.role);

        } else {
          console.warn('ADVERTENCIA: No llegó token en la respuesta.');
        }
      }),
      catchError((error: HttpErrorResponse) => {
        let msg = 'Error desconocido al iniciar sesión.';

        if (error.status === 400) msg = error.error?.message || 'Petición inválida.';
        else if (error.status === 401) msg = 'Credenciales incorrectas.';
        else if (error.status >= 500) msg = 'Error interno del servidor.';

        console.error('ERROR LOGIN ->', msg, error);

        return throwError(() => new Error(msg));
      })
    );
  }

  // ======================================================
  // TOKEN
  // ======================================================
  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // ======================================================
  // ROLE
  // ======================================================
  private setRole(role: string): void {
    localStorage.setItem(this.roleKey, role);
  }

  getRole(): string | null {
    return localStorage.getItem(this.roleKey);
  }

  // ======================================================
  // LOGOUT
  // ======================================================
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.roleKey);
    console.log('Sesión cerrada. Redirigiendo a login...');
    this.router.navigate(['/login']);
  }
}
