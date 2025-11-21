import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vehiculo } from '../models/vehiculo.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class VehiculosService {
  private apiUrl = `${environment.apiUrl}/vehiculos`;

  constructor(private http: HttpClient) {}

  getVehiculos(): Observable<Vehiculo[]> {
    return this.http.get<Vehiculo[]>(this.apiUrl);
  }

  createVehiculo(vehiculo: Vehiculo): Observable<Vehiculo> {
    return this.http.post<Vehiculo>(this.apiUrl, vehiculo);
  }
}