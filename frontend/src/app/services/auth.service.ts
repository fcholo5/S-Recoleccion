import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'authToken'; // Solo necesitamos la clave para el token de acceso

  constructor(private httpClient: HttpClient, private router: Router) { }

  /**
   * Intenta autenticar al usuario con las credenciales proporcionadas.
   * Almacena el token JWT si la autenticación es exitosa.
   * @param email El email del usuario.
   * @param password La contraseña del usuario.
   * @returns Un Observable que emite la respuesta del servidor.
   */
  login(email: string, password: string): Observable<any> {
    const route = 'auth/logear'; // Asegúrate de que esta ruta sea correcta para tu backend
    return this.httpClient.post<any>(environment.serverUrl + route, { email, password }).pipe(
      tap(response => {
        // En tu consola verás la respuesta completa del backend
        console.log('DEBUG: Respuesta completa del login del backend:', response);
        if (response.token) {
          // Si el backend envía un 'token', lo almacenamos.
          // Como ya confirmamos que no envía 'refreshToken', no se espera aquí.
          this.setToken(response.token);
        } else {
          console.warn('ADVERTENCIA: El backend NO envió una propiedad "token" en la respuesta del login.');
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
