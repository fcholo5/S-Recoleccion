import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, interval, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PosicionService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  registrarPosicion(recorridoId: string, body: any) {
    return this.http.post(`${this.baseUrl}/recorridos/${recorridoId}/posiciones`, body);
  }

  obtenerPosicionesTiempoReal(): Observable<any> {
    return interval(2000).pipe(
      switchMap(() => this.http.get(`${this.baseUrl}/posiciones/ultima`))
    );
  }
}
