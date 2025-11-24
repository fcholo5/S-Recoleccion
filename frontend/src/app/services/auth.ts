import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  register(arg0: { name: string; email: string; password: string; }) {
    throw new Error('Method not implemented.');
  }

  private httpClient = inject(HttpClient);
  private router = inject(Router);

  private tokenKey = 'authToken';

  // ======================================================
  // LOGIN
  // ======================================================
  login(email: string, password: string): Observable<any> {

    const route = 'login';      // ✔ ESTA ES LA RUTA REAL DE TU BACKEND
    const url = environment.serverUrl + route;

    return this.httpClient.post<any>(url, { email, password }).pipe(
      tap(response => {

        console.log('DEBUG LOGIN BACKEND:', response);

        if (response.success === 1 && response.token) {
          this.setToken(response.token);
          console.log('TOKEN GUARDADO:', response.token);
        } else {
          console.warn(response.message,'ADVERTENCIA: No llegó un token en la respuesta.');
        }

      }),
      catchError((error: HttpErrorResponse) => {
        let msg = 'Error desconocido al iniciar sesión.';

        if (error.status === 400) {
          msg = error.error?.message || 'Petición inválida.';
        } else if (error.status === 401) {
          msg = 'Credenciales incorrectas.';
        } else if (error.status >= 500) {
          msg = 'Error interno del servidor.';
        }

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
  // LOGOUT (ANGULAR)
  // ======================================================
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    console.log('Sesión cerrada. Redirigiendo a login...');
    this.router.navigate(['/login']);
  }
}
