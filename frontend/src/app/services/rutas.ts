// src/app/services/rutas.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ruta } from '../models/ruta.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RutasService {
  private apiUrl = `${environment.apiUrl}/rutas`;

  constructor(private http: HttpClient) {}

  crearRuta(ruta: Ruta): Observable<Ruta> {
    return this.http.post<Ruta>(this.apiUrl, ruta);
  }
}