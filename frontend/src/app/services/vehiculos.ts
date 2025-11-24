// src/app/services/vehiculos.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vehiculo } from '../models/vehiculo.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class VehiculosService {
  private apiUrl = `${environment.apiUrl}/api/vehiculos`;

  constructor(private http: HttpClient) {}

  crearVehiculo(vehiculo: Vehiculo): Observable<Vehiculo> {
    return this.http.post<Vehiculo>(this.apiUrl, vehiculo);
  }

  // Puedes agregar otros métodos como listar, actualizar, etc.
}