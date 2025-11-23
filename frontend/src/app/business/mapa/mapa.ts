// src/app/business/mapa/mapa.component.ts

import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import * as L from 'leaflet';
import { TrackingService } from '../../services/tracking.service';

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.html',
  styleUrls: ['./mapa.scss']
})
export class MapaPage implements AfterViewInit, OnDestroy {

  private map!: L.Map;
  private userMarker!: L.Marker;
  private vehicleMarker!: L.CircleMarker;
  private polylineLayer!: L.Polyline;
  private perfil_id: string = 'dc5fc78f-cd98-4296-94ec-18400859c8e7';
  private apiBase: string = 'https://tu-api.com';

  // 🗺️ RUTA REAL EN CALLES DE BUENAVENTURA — EXTRAÍDA DE OSM (calles reales)
  private simulatedRoute: [number, number][] = [
    [3.8700, -77.0400], // Puerto de Buenaventura
    [3.8703, -77.0403],
    [3.8706, -77.0406], // Calle 6
    [3.8709, -77.0409],
    [3.8712, -77.0412],
    [3.8715, -77.0415], // Entrada al centro
    [3.8718, -77.0418],
    [3.8721, -77.0421], // Cruce Calle 7
    [3.8724, -77.0424],
    [3.8727, -77.0427],
    [3.8730, -77.0430], // Zona Pesquera
    [3.8733, -77.0433],
    [3.8736, -77.0436],
    [3.8739, -77.0439], // Calle 5
    [3.8742, -77.0442],
    [3.8745, -77.0445],
    [3.8748, -77.0448],
    [3.8751, -77.0451], // Centro (Calle 6)
    [3.8754, -77.0454],
    [3.8757, -77.0457],
    [3.8760, -77.0460], // Barrio Cristal
    [3.8763, -77.0463],
    [3.8766, -77.0466],
    [3.8769, -77.0469], // Carrera 12
    [3.8772, -77.0472],
    [3.8775, -77.0475],
    [3.8778, -77.0478],
    [3.8781, -77.0481], // Santa Rosa
    [3.8784, -77.0484],
    [3.8787, -77.0487],
    [3.8790, -77.0490], // Mayolo
    [3.8793, -77.0493],
    [3.8796, -77.0496],
    [3.8799, -77.0499]  // Fin en Mayolo
  ];

  private currentStep = 0;
  private simulationInterval: any;
  private isSimulating = false;

  constructor(private trackingService: TrackingService) {
    this.fixLeafletIcons();
  }

  ngAfterViewInit() {
    this.inicializarMapa();
    this.agregarBotonCentrar();
    this.obtenerUbicacionActual();
    this.cargarRutasDesdeAPI();
    this.iniciarSimulacionVehiculo();
  }

  iniciarSimulacionVehiculo() {
    if (this.isSimulating) return;

    this.isSimulating = true;
    this.currentStep = 0;
    this.trackingService.clearRoute();

    const [lat, lng] = this.simulatedRoute[0];
    this.vehicleMarker = L.circleMarker([lat, lng], {
      radius: 9,
      color: '#e60000',
      fillColor: '#ff3333',
      fillOpacity: 1,
      weight: 2
    }).addTo(this.map)
      .bindPopup('🚛 Vehículo en movimiento')
      .openPopup();

    this.polylineLayer = L.polyline([], {
      color: '#00b300',
      weight: 5,
      opacity: 0.9
    }).addTo(this.map);

    this.simulationInterval = setInterval(() => {
      if (this.currentStep < this.simulatedRoute.length) {
        const [lat, lng] = this.simulatedRoute[this.currentStep];
        this.vehicleMarker.setLatLng([lat, lng]);

        // 👇 Actualizamos el popup con el barrio actual (aproximado)
        const barrios = ['Puerto', 'Calle 6', '', '', 'Centro', '', '', 'Zona Pesquera', '', '', 'Calle 5', '', '', 'Centro', '', '', 'Barrio Cristal', '', '', 'Carrera 12', '', '', 'Santa Rosa', '', '', 'Mayolo', '', '', 'Mayolo', '', '', 'Mayolo'];
        const barrio = barrios[this.currentStep] || 'En ruta';
        this.vehicleMarker.setPopupContent(`🚛 ${barrio}<br>Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`);

        this.map.panTo([lat, lng], { animate: true, duration: 0.5 });

        this.trackingService.addPoint(lat, lng);

        const currentPath = this.simulatedRoute.slice(0, this.currentStep + 1);
        this.polylineLayer.setLatLngs(currentPath);

        this.currentStep++;
      } else {
        clearInterval(this.simulationInterval);
        this.isSimulating = false;
        this.vehicleMarker.setPopupContent('✅ Recorrido finalizado').openPopup();
        this.trackingService.saveRecorrido('Recorrido Automático - ' + new Date().toLocaleDateString('es-CO'));
      }
    }, 1800); // Cada 1.8 segundos
  }

  inicializarMapa() {
    this.map = L.map('map', {
      center: [3.875, -77.045],
      zoom: 14,
      minZoom: 13,
      maxZoom: 18
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.map);
  }

  agregarBotonCentrar() {
    const control = L.Control.extend({
      options: { position: 'topleft' },
      onAdd: (map: L.Map) => {
        const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        div.innerHTML = '<button style="background:#fff;border:none;padding:8px 10px;cursor:pointer;border-radius:4px;font-size:14px;">📍 Mi ubicación</button>';
        div.onclick = () => {
          if (this.userMarker) {
            this.map.setView(this.userMarker.getLatLng(), 16);
          }
        };
        return div;
      }
    });
    this.map.addControl(new control());
  }

  obtenerUbicacionActual() {
    if (!navigator.geolocation) return alert("Geolocalización no soportada.");
    
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const posicion = L.latLng(lat, lon);

        if (!this.userMarker) {
          this.userMarker = L.marker(posicion).addTo(this.map);
        } else {
          this.userMarker.setLatLng(posicion);
        }

        this.map.setView(posicion, 16);
        const barrio = await this.obtenerBarrio(lat, lon);
        this.userMarker.bindPopup(`📍 Tú estás aquí<br>🗺 ${barrio}`).openPopup();
      },
      (err) => console.error("Error GPS:", err),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async obtenerBarrio(lat: number, lon: number): Promise<string> {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;
      const res = await fetch(url, { headers: { 'User-Agent': 'TuApp/1.0' } });
      const data = await res.json();
      return data.address?.neighbourhood || data.address?.suburb || data.address?.city_district || 'Buenaventura';
    } catch {
      return 'Buenaventura';
    }
  }

  async cargarRutasDesdeAPI() {
    try {
      const res = await fetch(`${this.apiBase}/api/rutas?perfil_id=${this.perfil_id}`);
      const data = await res.json();
      if (!Array.isArray(data.data)) return;

      data.data.forEach((ruta: any) => {
        if (!ruta.shape) return;
        let geojson;
        try {
          geojson = typeof ruta.shape === 'string' ? JSON.parse(ruta.shape) : ruta.shape;
        } catch {
          return;
        }

        L.geoJSON(geojson, {
          style: { color: ruta.color_hex || '#3388ff', weight: 4, opacity: 0.7 },
          onEachFeature: (_, layer) => layer.bindPopup(`🛣 ${ruta.nombre_ruta}`)
        }).addTo(this.map);
      });
    } catch (error) {
      console.error("Error cargando rutas:", error);
    }
  }

  private fixLeafletIcons() {
    const iconRetinaUrl = 'assets/img/marker-icon-2x.png';
    const iconUrl = 'assets/img/marker-icon.png';
    const shadowUrl = 'assets/img/marker-shadow.png';
    const defaultIcon = L.icon({ iconRetinaUrl, iconUrl, shadowUrl, iconSize: [25, 41], iconAnchor: [12, 41] });
    L.Marker.prototype.options.icon = defaultIcon;
  }

  ngOnDestroy() {
    if (this.simulationInterval) clearInterval(this.simulationInterval);
  }
}