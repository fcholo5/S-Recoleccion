// src/app/services/vehiculos.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Vehiculo } from '../../models/vehiculo.model';

@Injectable({ providedIn: 'root' })
export class VehiculosService {
  private url = `${environment.apiUrl}/api/vehiculos`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Vehiculo[]> {
    return this.http.get<Vehiculo[]>(this.url);
  }

  crear(vehiculo: Omit<Vehiculo, 'id'>): Observable<Vehiculo> {
    return this.http.post<Vehiculo>(this.url, vehiculo);
  }
}