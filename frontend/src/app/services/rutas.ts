import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaz opcional para tipar los datos de rutas
export interface Ruta {
  id?: string;
  perfil_id: string;
  nombre_ruta: string;
  color_hex?: string;
  shape?: any;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root',
})
export class Rutas {
  private readonly apiUrl = 'https://apirecoleccion.gonzaloandreslucio.com/api';

  constructor(private http: HttpClient) {}

  /**
   * 🔹 Obtener todas las rutas de un perfil
   * GET /api/rutas?perfil_id=UUID
   */
  getRutas(perfilId: string): Observable<{ data: Ruta[] }> {
    const params = new HttpParams().set('perfil_id', perfilId);
    return this.http.get<{ data: Ruta[] }>(this.apiUrl, { params });
  }

  /**
   * 🔹 Obtener detalles de una ruta
   * GET /api/rutas/{id}?perfil_id=UUID
   */
  getRuta(id: string, perfilId: string): Observable<Ruta> {
    const params = new HttpParams().set('perfil_id', perfilId);
    return this.http.get<Ruta>(`${this.apiUrl}/${id}`, { params });
  }

  /**
   * 🔹 Crear una nueva ruta
   * POST /api/rutas
   * (acepta shape o calles_ids)
   */
  crearRuta(rutaData: any): Observable<any> {
    return this.http.post(this.apiUrl, rutaData);
  }
}
