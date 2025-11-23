// src/app/services/tracking.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface RoutePoint {
  lat: number;
  lng: number;
  timestamp: Date;
}

export interface Recorrido {
  id: string;
  nombre: string;
  puntos: RoutePoint[];
  fecha: Date;
}

@Injectable({
  providedIn: 'root'
})
export class TrackingService {
  private routePoints$ = new BehaviorSubject<RoutePoint[]>([]);
  private recorridos$ = new BehaviorSubject<Recorrido[]>([]);

  constructor() {}

  addPoint(lat: number, lng: number) {
    const current = this.routePoints$.value;
    const newPoint: RoutePoint = { lat, lng, timestamp: new Date() };
    this.routePoints$.next([...current, newPoint]);
  }

  clearRoute() {
    this.routePoints$.next([]);
  }

  getRouteObservable() {
    return this.routePoints$.asObservable();
  }

  getRouteSnapshot() {
    return this.routePoints$.value;
  }

  // 👇 NUEVO: Guardar el recorrido completo como una ruta
  saveRecorrido(nombre: string = 'Recorrido Automático') {
    const puntos = this.getRouteSnapshot();
    if (puntos.length === 0) return;

    const nuevoRecorrido: Recorrido = {
      id: Date.now().toString(),
      nombre,
      puntos,
      fecha: new Date()
    };

    const current = this.recorridos$.value;
    this.recorridos$.next([...current, nuevoRecorrido]);
    this.clearRoute(); // Limpiar para el próximo recorrido
  }

  getRecorridosObservable() {
    return this.recorridos$.asObservable();
  }

  getRecorridosSnapshot() {
    return this.recorridos$.value;
  }
}