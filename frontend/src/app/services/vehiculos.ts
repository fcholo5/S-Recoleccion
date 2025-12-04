// src/app/services/vehiculos.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Vehiculo {
  id?: number;
  placa: string;
  marca: string;
  modelo: string;
  activo: boolean;
  perfil_id: string;
}

@Injectable({
  providedIn: 'root'
})
export class VehiculosService {
  private apiUrl = `${environment.serverUrl}vehiculos`;

  constructor(private http: HttpClient) {}

  // ✅ Cabeceras con token (si usas autenticación)
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : '',
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    });
  }

  // ✅ Listar vehículos
  getVehiculos(perfilId: string): Observable<Vehiculo[]> {
    return this.http.get<Vehiculo[]>(this.apiUrl, {
      params: { perfil_id: perfilId },
      headers: this.getHeaders()
    });
  }

  // ✅ Crear vehículo
  crearVehiculo(vehiculo: Omit<Vehiculo, 'id'>): Observable<Vehiculo> {
    return this.http.post<Vehiculo>(this.apiUrl, vehiculo, {
      headers: this.getHeaders()
    });
  }

  // ✅ Actualizar vehículo
  actualizarVehiculo(id: number, vehiculo: Partial<Vehiculo>): Observable<Vehiculo> {
    return this.http.put<Vehiculo>(`${this.apiUrl}/${id}`, vehiculo, {
      headers: this.getHeaders()
    });
  }

  // ✅ Eliminar vehículo
  eliminarVehiculo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  // ✅ Cambiar estado (activo/inactivo)
  cambiarEstado(id: number, activo: boolean): Observable<Vehiculo> {
    return this.actualizarVehiculo(id, { activo });
  }
}