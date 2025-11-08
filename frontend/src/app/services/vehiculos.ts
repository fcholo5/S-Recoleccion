import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class VehiculosService {
  private apiUrl = 'http://localhost:8000/api/vehiculos'; // Ajusta si cambia tu backend

  constructor(private http: HttpClient) {}

  list(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
