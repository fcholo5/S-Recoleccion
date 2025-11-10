import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Posicion {
  getPosiciones(recorridoId: string, perfilId: string): unknown;
  id?: string;
  recorrido_id: string;
  perfil_id: string;
  capturado_ts?: string;
  geom_geojson?: string; // viene del backend como GeoJSON
  lat?: number;
  lon?: number;
}

@Injectable({
  providedIn: 'root',
})
export class PosicionService {
  private readonly apiUrl = 'https://apirecoleccion.gonzaloandreslucio.com/api';

  constructor(private http: HttpClient) {}

  /**
   * 🔹 Obtener las posiciones de un recorrido
   */
  getPosiciones(recorridoId: string, perfilId: string): Observable<{ data: Posicion[] }> {
    const params = new HttpParams().set('perfil_id', perfilId);
    return this.http.get<{ data: Posicion[] }>(
      `${this.apiUrl}/recorridos/${recorridoId}/posiciones`,
      { params }
    );
  }

  /**
   * 🔹 Registrar una nueva posición en un recorrido
   */
  addPosicion(
    recorridoId: string,
    data: { lat: number; lon: number; perfil_id: string }
  ): Observable<Posicion> {
    return this.http.post<Posicion>(
      `${this.apiUrl}/recorridos/${recorridoId}/posiciones`,
      data
    );
  }
}
