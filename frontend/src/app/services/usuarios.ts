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

  private apiUrl = environment.serverUrl + 'usuarios/';

  constructor(private http: HttpClient) {}

  // =============================
  // Cabeceras con token
  // =============================
  private getHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('authToken'); // token guardado por Auth
    return {
      headers: new HttpHeaders({
        'Authorization': token ? `Bearer ${token}` : '',
        'Accept': 'application/json'
      })
    };
  }

  // =============================
  // LISTAR USUARIOS
  // =============================
  getUsuarios(): Observable<User[]> {
    return this.http.get<{ success: number, data: User[] }>(this.apiUrl, this.getHeaders()).pipe(
      map(resp => {
        if (resp.success === 1) return resp.data;
        throw new Error('Error al obtener usuarios');
      }),
      catchError(err => throwError(() => new Error(err.message || 'Error en el servidor')))
    );
  }

  // =============================
  // OBTENER UN USUARIO POR ID
  // =============================
  getUsuario(id: number): Observable<User> {
    return this.http.get<{ success: number, data: User }>(this.apiUrl + id, this.getHeaders()).pipe(
      map(resp => {
        if (resp.success === 1) return resp.data;
        throw new Error('Usuario no encontrado');
      }),
      catchError(err => throwError(() => new Error(err.message || 'Error en el servidor')))
    );
  }

  // =============================
  // CREAR USUARIO
  // =============================
  crearUsuario(user: { name: string; email: string; password: string; role_id: number }): Observable<User> {
    return this.http.post<{ success: number, data: User }>(this.apiUrl, user, this.getHeaders()).pipe(
      map(resp => {
        if (resp.success === 1) return resp.data;
        throw new Error('Error al crear usuario');
      }),
      catchError(err => throwError(() => new Error(err.message || 'Error en el servidor')))
    );
  }

  // =============================
  // ACTUALIZAR USUARIO
  // =============================
  actualizarUsuario(id: number, user: { name: string; email: string; role_id: number }): Observable<User> {
    return this.http.put<{ success: number, data: User }>(this.apiUrl + id, user, this.getHeaders()).pipe(
      map(resp => {
        if (resp.success === 1) return resp.data;
        throw new Error('Error al actualizar usuario');
      }),
      catchError(err => throwError(() => new Error(err.message || 'Error en el servidor')))
    );
  }

  // =============================
  // ELIMINAR USUARIO
  // =============================
  eliminarUsuario(id: number): Observable<void> {
    return this.http.delete<{ success: number }>(this.apiUrl + id, this.getHeaders()).pipe(
      map(resp => {
        if (resp.success === 1) return;
        throw new Error('Error al eliminar usuario');
      }),
      catchError(err => throwError(() => new Error(err.message || 'Error en el servidor')))
    );
  }
}
