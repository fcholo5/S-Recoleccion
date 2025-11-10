import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class Vehiculos {
  private readonly apiUrl = 'https://apirecoleccion.gonzaloandreslucio.com/api/vehiculos';

  constructor(private http: HttpClient) {}

  // 🔹 Listar vehículos por perfil
  list(perfilId: string, page: number = 1): Observable<any> {
    const params = new HttpParams()
      .set('perfil_id', perfilId)
      .set('page', page.toString());

    return this.http.get<any>(this.apiUrl, { params });
  }

  // 🔹 Obtener un vehículo por ID
  getById(id: string, perfilId: string): Observable<any> {
    const params = new HttpParams().set('perfil_id', perfilId);
    return this.http.get<any>(`${this.apiUrl}/${id}`, { params });
  }

  // 🔹 Crear un nuevo vehículo
  create(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  // 🔹 Actualizar un vehículo existente
  update(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  // 🔹 Eliminar un vehículo
  delete(id: string, perfilId: string): Observable<any> {
    const params = new HttpParams().set('perfil_id', perfilId);
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { params });
  }
}
