import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Horario {
  id?: string;
  ruta_id?: string;
  dia_semana: number;       // 1 = Lunes ... 7 = Domingo
  hora_inicio: string;      // formato HH:mm:ss
  hora_fin?: string | null; // opcional
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root',
})
export class HorarioService {
  private readonly apiUrl = 'https://apirecoleccion.gonzaloandreslucio.com/api';

  constructor(private http: HttpClient) {}

  /**
   * 🔹 Obtener todos los horarios de una ruta
   */
  getHorarios(rutaId: string): Observable<Horario[]> {
    return this.http.get<Horario[]>(`${this.apiUrl}/rutas/${rutaId}/horarios`);
  }

  /**
   * 🔹 Crear un nuevo horario en una ruta
   */
  addHorario(rutaId: string, data: Omit<Horario, 'id' | 'created_at' | 'updated_at'>): Observable<Horario> {
    return this.http.post<Horario>(`${this.apiUrl}/rutas/${rutaId}/horarios`, data);
  }

  /**
   * 🔹 Obtener un horario específico
   */
  getHorario(horarioId: string): Observable<Horario> {
    return this.http.get<Horario>(`${this.apiUrl}/horarios/${horarioId}`);
  }

  /**
   * 🔹 Actualizar un horario existente
   */
  updateHorario(horarioId: string, data: Partial<Horario>): Observable<Horario> {
    return this.http.put<Horario>(`${this.apiUrl}/horarios/${horarioId}`, data);
  }

  /**
   * 🔹 Eliminar un horario
   */
  deleteHorario(horarioId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/horarios/${horarioId}`);
  }
}
