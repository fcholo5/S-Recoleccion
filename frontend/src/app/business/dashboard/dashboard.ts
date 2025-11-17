import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements AfterViewInit {

  private map!: L.Map;

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  initializeMap() {
    this.map = L.map('map', {
      center: [4.60971, -74.08175], // Bogotá (puedes cambiarlo)
      zoom: 13
    });

    // Capa base (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    // Marcador inicial
    L.marker([4.60971, -74.08175])
      .addTo(this.map)
      .bindPopup('Ubicación inicial')
      .openPopup();
  }
}
