import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Recorrido {
  id?: string;
  ruta_id: string;
  vehiculo_id: string;
  perfil_id: string;
  ts_inicio?: string;
  ts_fin?: string;
  estado?: string;
}

@Injectable({
  providedIn: 'root',
})
export class RecorridoService {
  private readonly apiUrl = 'https://apirecoleccion.gonzaloandreslucio.com/api';

  constructor(private http: HttpClient) {}

  /**
   * Listar recorridos de un perfil
   */
  getRecorridos(perfilId: string): Observable<{ data: Recorrido[] }> {
    const params = new HttpParams().set('perfil_id', perfilId);
    return this.http.get<{ data: Recorrido[] }>(`${this.apiUrl}/misrecorridos`, { params });
  }

  /**
   * Iniciar un nuevo recorrido
   */
  iniciarRecorrido(data: {
    ruta_id: string;
    vehiculo_id: string;
    perfil_id: string;
  }): Observable<Recorrido> {
    return this.http.post<Recorrido>(`${this.apiUrl}/recorridos/iniciar`, data);
  }

  /**
   * Finalizar un recorrido existente
   */
  finalizarRecorrido(recorridoId: string, perfilId: string): Observable<Recorrido> {
    return this.http.post<Recorrido>(`${this.apiUrl}/recorridos/${recorridoId}/finalizar`, {
      perfil_id: perfilId,
    });
  }
}
