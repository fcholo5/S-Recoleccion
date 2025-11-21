import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Posicion, Recorrido } from '../models/recorrido.model';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class RecorridoService {

  private baseUrl = environment.apiUrl + '/recorridos';

  constructor(private http: HttpClient) {}

  iniciar(body: any) {
    return this.http.post(`${this.baseUrl}/iniciar`, body);
  }

  finalizar(id: string) {
    return this.http.post(`${this.baseUrl}/${id}/finalizar`, {});
  }
}
