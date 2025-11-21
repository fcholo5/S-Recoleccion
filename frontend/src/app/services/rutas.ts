import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface Ruta {
  id?: string;
  nombre_ruta: string;
  perfil_id: string;
  shape: any; // GeoJSON
  color_hex?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RutasService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // 🔹 Obtener todas las rutas de un perfil
  obtenerRutas(perfil_id: string): Observable<{data: Ruta[]}> {
    return this.http.get<{data: Ruta[]}>(`${this.apiUrl}/rutas?perfil_id=${perfil_id}`);
  }

  // 🔹 Crear nueva ruta con geometría directa (GeoJSON)
  crearRuta(ruta: Ruta): Observable<Ruta> {
    const payload = {
      nombre_ruta: ruta.nombre_ruta,
      perfil_id: ruta.perfil_id,
      shape: ruta.shape // GeoJSON como objeto
    };

    return this.http.post<Ruta>(`${this.apiUrl}/rutas`, payload, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    });
  }
}
