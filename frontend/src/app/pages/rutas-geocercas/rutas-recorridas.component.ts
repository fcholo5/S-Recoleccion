// src/app/pages/rutas-geocercas/rutas-recorridas.component.ts

import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import * as L from 'leaflet';
import { TrackingService, Recorrido, RoutePoint } from '../../services/tracking.service';
import { Subscription } from 'rxjs';

import { NgIf, NgFor, DecimalPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-rutas-recorridas',
  template: `
    <h2>Rutas Recorridas</h2>

    <div *ngIf="recorridos.length === 0" style="text-align: center; padding: 20px;">
      <p>❌ No hay recorridos guardados.</p>
    </div>

    <div *ngFor="let recorrido of recorridos; let i = index">
      <div style="margin: 15px 0; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
        <h4>{{ i + 1 }}. {{ recorrido.nombre }}</h4>
        <p><strong>Fecha:</strong> {{ recorrido.fecha | date:'short' }}</p>
        <p><strong>Puntos:</strong> {{ recorrido.puntos.length }}</p>

        <div id="map{{ recorrido.id }}" style="width: 100%; height: 200px; margin-top: 10px;"></div>

        <ul style="max-height: 150px; overflow-y: auto; padding-left: 20px; margin-top: 10px;">
          <li *ngFor="let p of recorrido.puntos; let j = index">
            {{ j + 1 }} — Lat: {{ p.lat | number:'1.6-6' }}, Lng: {{ p.lng | number:'1.6-6' }}
          </li>
        </ul>
      </div>
    </div>
  `,
  styles: [],
  imports: [NgIf, NgFor, DecimalPipe, DatePipe]
})
export class RutasRecorridasComponent implements AfterViewInit, OnInit, OnDestroy {

  recorridos: Recorrido[] = [];
  private subscription!: Subscription;

  constructor(private trackingService: TrackingService) {}

  ngOnInit(): void {
    this.subscription = this.trackingService.getRecorridosObservable().subscribe(recorridos => {
      this.recorridos = recorridos;
      this.initMaps();
    });
  }

  ngAfterViewInit(): void {
    this.initMaps();
  }

  initMaps() {
    this.recorridos.forEach(recorrido => {
      const mapId = `map${recorrido.id}`;
      const mapElement = document.getElementById(mapId);

      if (mapElement && !mapElement.hasAttribute('data-initialized')) {
        mapElement.setAttribute('data-initialized', 'true');

        const map = L.map(mapId).setView([3.88, -77.04], 14);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

        if (recorrido.puntos.length > 0) {
          const latlngs = recorrido.puntos.map(p => [p.lat, p.lng] as [number, number]);
          const polyline = L.polyline(latlngs, { color: '#00cc00', weight: 4 }).addTo(map);
          map.fitBounds(latlngs);
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}