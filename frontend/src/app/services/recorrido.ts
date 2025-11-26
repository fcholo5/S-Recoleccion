// src/app/services/recorrido.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Recorrido } from '../models/recorrido.model';
import { Posicion } from '../models/posicion.model';

@Injectable({ providedIn: 'root' })
export class RecorridoService {
  private baseUrl = `${environment.apiUrl}/api/recorridos`;

  constructor(private http: HttpClient) {}

  iniciarRecorrido(recorrido: Omit<Recorrido, 'id' | 'iniciado_en'>): Observable<Recorrido> {
    return this.http.post<Recorrido>(`${this.baseUrl}/iniciar`, recorrido);
  }

  registrarPosicion(recorridoId: string, posicion: Posicion): Observable<any> {
    return this.http.post(`${this.baseUrl}/${recorridoId}/posiciones`, posicion);
  }
}