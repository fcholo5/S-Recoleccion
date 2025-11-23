import {inject, Injectable} from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private tokenKey = 'authToken'; // Solo necesitamos la clave para el token de acceso

  private httpClient = inject(HttpClient)
  private router = inject(Router)

  /**
   * Intenta autenticar al usuario con las credenciales proporcionadas.
   * Almacena el token JWT si la autenticación es exitosa.
   * @param email El email del usuario.
   * @param password La contraseña del usuario.
   * @returns Un Observable que emite la respuesta del servidor.
   */
  login(email: string, password: string): Observable<ApiResponse<string>> {
    const route = 'login';
    return this.httpClient.post<ApiResponse<string>>(environment.serverUrl + route, { email, password }).pipe(
      tap(response => {
        if (response.success == 1) { // Respuesta exitosa
          // Guarda el token
          this.setToken(response.data);
        } else {
          console.warn(response.message);
        }
      }),
      // Manejo de errores para la petición de login
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Ocurrió un error desconocido al iniciar sesión.';
        if (error.error instanceof ErrorEvent) {
          errorMessage = `Error: ${error.error.message}`;
        } else {
          if (error.status === 401) {
            errorMessage = 'Credenciales incorrectas. Por favor, verifica tu email y contraseña.';
          } else if (error.status === 400) {
            errorMessage = `Petición inválida: ${error.error?.message || error.statusText}`;
          } else {
            errorMessage = `Error del servidor (${error.status}): ${error.message}`;
          }
        }
        console.error('Error en el login:', errorMessage, error);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Almacena el token de acceso en el almacenamiento local.
   * @param token El token de acceso.
   */
  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  /**
   * Obtiene el token de acceso del almacenamiento local.
   * @returns El token de acceso o null si no se encuentra.
   */
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.tokenKey);
    } else {
      return null;
    }
  }

  // --- MÉTODOS DE REFRESH TOKEN ELIMINADOS ---
  // private setRefreshToken(token: string): void { ... }
  // private getRefreshToken(): string | null { ... }
  // refreshToken(): Observable<any> { ... }
  // private autoRefreshToken(): void { ... }
  // --- FIN DE MÉTODOS ELIMINADOS ---

  /**
   * Verifica si el usuario está autenticado comprobando la existencia de un token de acceso.
   * La validación real de la vigencia del token se hace en el backend.
   * @returns True si existe un token en localStorage, false en caso contrario.
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    // Simplemente verificamos si el token existe.
    // La validez (expiración) se gestiona al hacer peticiones al backend:
    // si el token es inválido/expirado, el backend retornará un 401,
    // y el interceptor se encargará de desloguear al usuario.
    return !!token;
  }

  /**
   * Cierra la sesión del usuario, eliminando el token y redirigiendo a la página de login.
   */
  logout(): void {
    localStorage.removeItem(this.tokenKey); // Solo eliminamos el token de acceso
    console.log('INFO: Sesión cerrada. Redirigiendo a /login.');
    this.router.navigate(['/login']);
  }
}
