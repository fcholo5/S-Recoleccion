import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// Interfaz del usuario
export interface User {
  id?: number;
  name: string;
  email: string;
  password?: string;
  rol_id?: number; // 👈 necesario para crear o editar
  status?: number;
  activo?: boolean;
  created_at?: string;
  updated_at?: string;
  rol?: {
    id: number;
    nombre: string;
  };
}


@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = environment.serverUrl + 'usuarios';

  constructor(private http: HttpClient) {}

  /**
   * Manejo de errores de HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error inesperado al comunicarse con el servidor.';

    if (error.status === 0) {
      errorMessage = 'No se pudo conectar con el servidor.';
    } else if (typeof ProgressEvent !== 'undefined' && error.error instanceof ProgressEvent) {
      console.error('DEBUG: JSON inválido o vacío:', error.error);
      errorMessage = `Error de análisis: Respuesta vacía o inválida.`;
    } else if (error.error && typeof error.error === 'object') {
      if ('message' in error.error && typeof error.error.message === 'string') {
        errorMessage = error.error.message;
      } else if ('errors' in error.error && typeof error.error.errors === 'object') {
        const validationErrors = Object.values(error.error.errors).flat().join(' ');
        errorMessage = `Errores de validación: ${validationErrors}`;
      } else {
        errorMessage = `Error del servidor: ${JSON.stringify(error.error)}`;
      }
    } else if (typeof error.error === 'string') {
      errorMessage = error.error;
    } else {
      errorMessage = error.message || 'Error desconocido.';
    }

    console.error('DEBUG: Error procesado:', error);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Obtener todos los usuarios
   */
  getUsers(): Observable<User[]> {
    return this.http.get<{ success: boolean; data: User[] }>(this.apiUrl).pipe(
      map(res => res.data),
      catchError(this.handleError)
    );
  }

  /**
   * Obtener un usuario por ID
   */
  getUser(id: number): Observable<User> {
    return this.http.get<{ success: boolean; data: User }>(`${this.apiUrl}/${id}`).pipe(
      map(res => res.data),
      catchError(this.handleError)
    );
  }

  /**
   * Crear un nuevo usuario
   */
  createUser(user: User): Observable<User> {
    return this.http.post<{ success: boolean; data: User }>(this.apiUrl, user).pipe(
      map(res => res.data),
      catchError(this.handleError)
    );
  }

  /**
   * Actualizar un usuario existente
   */
  updateUser(user: User): Observable<User> {
    if (user.id === undefined) {
      return throwError(() => new Error('Se requiere el ID del usuario.'));
    }

    const updatePayload: Partial<User> = {
      name: user.name,
      email: user.email,
      rol_id: user.rol_id,
      status: user.status,
    };

    if (user.password) {
      updatePayload.password = user.password;
    }

    return this.http.put<{ success: boolean; data: User }>(`${this.apiUrl}/${user.id}`, updatePayload).pipe(
      map(res => res.data),
      catchError(this.handleError)
    );
  }

  /**
   * Cambiar estado del usuario (activo/inactivo)
   * Tu backend usa un GET a /usuarios/cambiar-estado/{id}/{estado}
   */
  updateUserStatus(id: number, status: number): Observable<User> {
    return this.http.get<{ success: boolean; data: User }>(
      `${this.apiUrl}/cambiar-estado/${id}/${status}`
    ).pipe(
      map(res => res.data),
      catchError(this.handleError)
    );
  }

  /**
   * Eliminar un usuario
   */
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }
}
