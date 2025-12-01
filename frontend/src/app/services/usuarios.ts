import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Role {
  id: number;
  name: string;
}

export interface User {
  id?: number;
  name: string;
  email: string;
  password?: string; // Solo para crear usuario
  role_id?: number;
  role?: Role;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.serverUrl + 'users/';

  constructor(private http: HttpClient) {}

  // =====================================
  // CABECERAS CON TOKEN
  // =====================================
  private getHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('authToken');
    return {
      headers: new HttpHeaders({
        'Authorization': token ? `Bearer ${token}` : '',
        'Accept': 'application/json'
      })
    };
  }

  // =====================================
  // LISTAR USUARIOS
  // =====================================
  getUsuarios(): Observable<User[]> {
    return this.http.get<{ success: number; data: User[] }>(this.apiUrl, this.getHeaders()).pipe(
      map(resp => {
        if (resp.success === 1) return resp.data;
        throw new Error('Error al obtener usuarios');
      }),
      catchError(err => throwError(() => new Error(err.error?.message || err.message || 'Error en el servidor')))
    );
  }

  // =====================================
  // OBTENER UN USUARIO POR ID
  // =====================================
  getUsuario(id: number): Observable<User> {
    return this.http.get<{ success: number; data: User }>(`${this.apiUrl}${id}`, this.getHeaders()).pipe(
      map(resp => {
        if (resp.success === 1) return resp.data;
        throw new Error('Usuario no encontrado');
      }),
      catchError(err => throwError(() => new Error(err.error?.message || err.message || 'Error en el servidor')))
    );
  }

  // =====================================
  // CREAR USUARIO
  // =====================================
  crearUsuario(user: { name: string; email: string; password: string; role_id: number }): Observable<User> {
    return this.http.post<{ success: number; data: User }>(this.apiUrl, user, this.getHeaders()).pipe(
      map(resp => {
        if (resp.success === 1) return resp.data;
        throw new Error('Error al crear usuario');
      }),
      catchError(err => throwError(() => new Error(err.error?.message || err.message || 'Error en el servidor')))
    );
  }

  // =====================================
  // ACTUALIZAR USUARIO
  // =====================================
  actualizarUsuario(id: number, user: { name: string; email: string; role_id: number }): Observable<User> {
    return this.http.put<{ success: number; data: User }>(`${this.apiUrl}${id}`, user, this.getHeaders()).pipe(
      map(resp => {
        if (resp.success === 1) return resp.data;
        throw new Error('Error al actualizar usuario');
      }),
      catchError(err => throwError(() => new Error(err.error?.message || err.message || 'Error en el servidor')))
    );
  }

  // =====================================
  // ELIMINAR USUARIO
  // =====================================
  eliminarUsuario(id: number): Observable<void> {
    return this.http.delete<{ success: number }>(`${this.apiUrl}${id}`, this.getHeaders()).pipe(
      map(resp => {
        if (resp.success === 1) return;
        throw new Error('Error al eliminar usuario');
      }),
      catchError(err => throwError(() => new Error(err.error?.message || err.message || 'Error en el servidor')))
    );
  }

  // =====================================
  // CAMBIAR CONTRASEÑA
  // =====================================
  cambiarPassword(id: number, current_password: string, new_password: string, confirm_password: string): Observable<any> {
    return this.http.put<{ success: number; message: string }>(
      `${this.apiUrl}${id}/password`,
      { current_password, new_password, confirm_password },
      this.getHeaders()
    ).pipe(
      map(resp => {
        if (resp.success === 1) return resp.message;
        throw new Error('Error al cambiar contraseña');
      }),
      catchError(err => throwError(() => new Error(err.error?.message || err.message || 'Error en el servidor')))
    );
  }
  // =====================================
// LISTAR ROLES
// =====================================
getRolesDisponibles() {
  return [
    { id: 1, name: 'Administrador' },
    { id: 2, name: 'Conductor' },
    { id: 3, name: 'Cliente' }
    ];
  }

}