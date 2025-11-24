// src/app/business/rutas/rutas.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-rutas',
  templateUrl: './rutas.html',
  styleUrls: ['./rutas.scss'],
  imports: [CommonModule]
})
export class RutasComponent implements OnInit, AfterViewInit, OnDestroy {

  rutas: any[] = [];
  loading = true;
  error: string | null = null;
  private perfil_id = 'dc5fc78f-cd98-4296-94ec-18400859c8e7';
  private apiBase = 'http://apirecoleccion.gonzaloandreslucio.com/api';

  // Estado del mapa embebido
  showMapModal = false;
  drawingRoute = false;
  currentRoutePoints: L.LatLng[] = [];
  currentRouteLayer: L.Polyline | null = null;
  map!: L.Map;
JSON: any;

  constructor() {}

  ngOnInit() {
    this.cargarRutas();
  }

  ngAfterViewInit() {
    if (this.showMapModal) {
      this.inicializarMapa();
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  async cargarRutas() {
    this.loading = true;
    this.error = null;
    try {
      const res = await fetch(`${this.apiBase}/rutas?perfil_id=${this.perfil_id}`);
      const data = await res.json();
      this.rutas = data.data || [];
    } catch (err) {
      console.error('Error al cargar rutas:', err);
      this.error = 'No se pudieron cargar las rutas.';
    } finally {
      this.loading = false;
    }
  }

  calcularLongitud(ruta: any): number {
    if (!ruta.shape) return 0;
    try {
      const geojson = typeof ruta.shape === 'string' ? JSON.parse(ruta.shape) : ruta.shape;
      if (geojson.type === 'LineString' && geojson.coordinates?.length >= 2) {
        let total = 0;
        for (let i = 1; i < geojson.coordinates.length; i++) {
          const [lon1, lat1] = geojson.coordinates[i - 1];
          const [lon2, lat2] = geojson.coordinates[i];
          const dx = (lon2 - lon1) * Math.cos((lat1 + lat2) / 2 * Math.PI / 180);
          const dy = lat2 - lat1;
          total += Math.sqrt(dx * dx + dy * dy) * 111;
        }
        return parseFloat(total.toFixed(2));
      }
    } catch (e) {
      console.warn('Error al calcular longitud:', e);
    }
    return 0;
  }

  // 🖊 MODO DIBUJO EMbebido

  abrirModalDibujo() {
    this.showMapModal = true;
    this.drawingRoute = true;
    this.currentRoutePoints = [];
    setTimeout(() => {
      this.inicializarMapa();
    }, 100);
  }

  inicializarMapa() {
    if (this.map) {
      this.map.remove();
    }

    this.map = L.map('embedded-map', {
      center: [3.895, -77.05],
      zoom: 13
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    this.map.on('click', this.onMapClick.bind(this));

    // Opcional: centrar en ubicación actual
    this.obtenerUbicacionActual();
  }

  onMapClick(e: L.LeafletMouseEvent) {
    if (!this.drawingRoute) return;

    const latlng = e.latlng;
    this.currentRoutePoints.push(latlng);

    if (this.currentRouteLayer) {
      this.map.removeLayer(this.currentRouteLayer);
    }

    this.currentRouteLayer = L.polyline(this.currentRoutePoints, {
      color: 'red',
      weight: 4,
      dashArray: '5,5'
    }).addTo(this.map);
  }

  async finalizarRuta() {
    if (this.currentRoutePoints.length < 2) {
      alert('La ruta debe tener al menos 2 puntos.');
      return;
    }

    const coordinates = this.currentRoutePoints.map(p => [p.lng, p.lat] as [number, number]);
    const geojsonLine = {
      type: 'LineString' as const,
      coordinates: coordinates
    };

    const nombre = prompt('Nombre de la ruta:');
    if (!nombre) return;

    const payload = {
      nombre_ruta: nombre,
      perfil_id: this.perfil_id,
      shape: geojsonLine
    };

    try {
      const response = await fetch(`${this.apiBase}/rutas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert('✅ Ruta creada exitosamente');
        this.cerrarModal();
        this.cargarRutas(); // Recargar lista
      } else {
        const error = await response.json();
        console.error('Error API:', error);
        alert('❌ Error al crear la ruta');
      }
    } catch (err) {
      console.error('Error al enviar ruta:', err);
      alert('Error de red al crear la ruta');
    }
  }

  cancelarDibujo() {
    this.cerrarModal();
  }

  cerrarModal() {
    this.showMapModal = false;
    this.drawingRoute = false;
    if (this.map) {
      this.map.remove();
      this.map = undefined!;
    }
    this.currentRoutePoints = [];
    this.currentRouteLayer = null;
  }

  obtenerUbicacionActual() {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const posicion = L.latLng(lat, lon);
        this.map.setView(posicion, 16);
      },
      (err) => {
        console.error("Error al obtener ubicación:", err);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  }
}