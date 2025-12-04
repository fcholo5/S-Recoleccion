// src/app/business/mapa/mapa.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import * as L from 'leaflet';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './mapa.html',
  styleUrls: ['./mapa.scss']
})
export class MapaComponent implements OnInit, OnDestroy {

  private perfil_id = 'dc5fc78f-cd98-4296-94ec-18400859c8e7';
  private apiBase = environment.apiUrl;

  // Datos
  rutas: any[] = [];
  calles: any[] = [];
  recorridos: any[] = [];
  vehiculos: any[] = [];

  // Mapa
  map!: L.Map;
  rutaLayer: L.GeoJSON | null = null; // Tipado correcto
  callesLayers: L.GeoJSON[] = [];
  recorridoLayers: L.GeoJSON[] = [];
  vehiculoMarkers: L.Marker[] = [];

  // Dibujo
  drawingRoute = false;
  currentRoutePoints: L.LatLng[] = [];
  currentRouteLayer: L.Polyline | null = null;

  // Intervalo de actualización
  private intervalId: any;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.inicializarMapa();
    this.cargarRutas();
    this.cargarVehiculos();
    this.cargarCalles();
    this.cargarRecorridos();

    // Actualizar cada 5 segundos para seguimiento en vivo
    this.intervalId = setInterval(() => {
      this.cargarRecorridos();
    }, 5000);
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
    this.limpiarCapas();
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  limpiarCapas() {
    this.callesLayers.forEach(layer => {
      if (this.map.hasLayer(layer)) {
        this.map.removeLayer(layer);
      }
    });
    this.recorridoLayers.forEach(layer => {
      if (this.map.hasLayer(layer)) {
        this.map.removeLayer(layer);
      }
    });
    this.vehiculoMarkers.forEach(marker => {
      if (this.map.hasLayer(marker)) {
        this.map.removeLayer(marker);
      }
    });
    // Asegurarse de limpiar la ruta seleccionada manualmente
    if (this.rutaLayer && this.map.hasLayer(this.rutaLayer)) {
      this.map.removeLayer(this.rutaLayer);
    }
  }

  inicializarMapa() {
    this.map = L.map('map', {
      center: [3.895, -77.05],
      zoom: 13
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(this.map);
  }

  cargarRutas() {
    this.http.get<{ data: any[] }>(`${this.apiBase}/rutas`, {
      params: { perfil_id: this.perfil_id }
    }).subscribe({
      next: (resp) => {
        this.rutas = resp.data || [];
        // ✅ NO se muestra ninguna ruta automáticamente
      },
      error: (err) => {
        console.error('Error al cargar rutas:', err);
        alert('No se pudieron cargar las rutas.');
      }
    });
  }

  cargarVehiculos() {
    this.http.get<{ data: any[] }>(`${this.apiBase}/vehiculos`, {
      params: { perfil_id: this.perfil_id }
    }).subscribe({
      next: (resp) => {
        this.vehiculos = resp.data || [];
      },
      error: (err) => {
        console.error('Error al cargar vehículos:', err);
        alert('No se pudieron cargar los vehículos.');
      }
    });
  }

  cargarCalles() {
    this.http.get<{ data: any[] }>(`${this.apiBase}/calles`).subscribe({
      next: (resp) => {
        this.calles = resp.data || [];
        this.dibujarCalles();
      },
      error: (err) => {
        console.error('Error al cargar calles:', err);
        alert('No se pudieron cargar las calles.');
      }
    });
  }

  cargarRecorridos() {
    this.http.get<{ data: any[] }>(`${this.apiBase}/misrecorridos`, {
      params: { perfil_id: this.perfil_id }
    }).subscribe({
      next: (resp) => {
        this.recorridos = resp.data || [];
        this.dibujarRecorridosActivos();
      },
      error: (err) => {
        console.error('Error al cargar recorridos:', err);
      }
    });
  }

  dibujarRecorridosActivos() {
    this.recorridoLayers.forEach(layer => {
      if (this.map.hasLayer(layer)) {
        this.map.removeLayer(layer);
      }
    });
    this.recorridoLayers = [];

    this.vehiculoMarkers.forEach(marker => {
      if (this.map.hasLayer(marker)) {
        this.map.removeLayer(marker);
      }
    });
    this.vehiculoMarkers = [];

    const recorridosActivos = this.recorridos.filter(r => r.estado === 'En Curso');
    const colors = ['#2ecc71', '#3498db', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c'];

    recorridosActivos.forEach((reco, index) => {
      try {
        const ruta = this.rutas.find(r => r.id === reco.ruta_id);
        if (!ruta) return;

        const geojson = typeof ruta.shape === 'string' ? JSON.parse(ruta.shape) : ruta.shape;
        const color = colors[index % colors.length];

        const layer = L.geoJSON(geojson, {
          style: {
            color: color,
            weight: 4,
            opacity: 0.8
          },
          onEachFeature: (feature, layer) => {
            layer.bindPopup(`<strong>Ruta:</strong> ${ruta.nombre_ruta}<br><strong>Vehículo:</strong> ${this.getNombreVehiculo(reco.vehiculo_id)}`);
          }
        }).addTo(this.map);

        this.recorridoLayers.push(layer);

        if (reco.posiciones && reco.posiciones.length > 0) {
          const ultimaPos = reco.posiciones[reco.posiciones.length - 1];
          const marker = L.marker([ultimaPos.lat, ultimaPos.lon], {
            icon: L.divIcon({
              className: 'camion-marker',
              html: `<div style="background:${color};color:white;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:20px;">🚚</div>`,
              iconSize: [40, 40]
            }),
            title: `Vehículo: ${this.getNombreVehiculo(reco.vehiculo_id)}`
          }).addTo(this.map);

          this.vehiculoMarkers.push(marker);
        }
      } catch (e) {
        console.warn(`Error al dibujar recorrido ${reco.id}:`, e);
      }
    });

    if (this.recorridoLayers.length > 0) {
      const bounds = L.featureGroup(this.recorridoLayers).getBounds();
      this.map.fitBounds(bounds, { padding: [50, 50] });
    }
  }

  mostrarRuta(ruta: any) {
    // Limpiar ruta previa
    if (this.rutaLayer) {
      this.map.removeLayer(this.rutaLayer);
      this.rutaLayer = null;
    }

    try {
      const geojson = typeof ruta.shape === 'string' ? JSON.parse(ruta.shape) : ruta.shape;
      this.rutaLayer = L.geoJSON(geojson, {
        style: {
          color: '#2ecc71',
          weight: 4,
          opacity: 0.8
        }
      }).addTo(this.map);

      const bounds = this.rutaLayer.getBounds();
      this.map.fitBounds(bounds, { padding: [50, 50] });
    } catch (e) {
      console.warn('Error al dibujar ruta:', e);
    }
  }

  centrarCalle(calle: any) {
    try {
      const geojson = typeof calle.shape === 'string' ? JSON.parse(calle.shape) : calle.shape;
      const layer = L.geoJSON(geojson);
      const bounds = layer.getBounds();
      this.map.fitBounds(bounds, { padding: [50, 50] });
    } catch (e) {
      console.warn('Error al centrar calle:', e);
    }
  }

  onRutaChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const rutaId = selectElement.value;

    if (!rutaId) {
      // Opción "Seleccione una ruta" → limpiar
      if (this.rutaLayer) {
        this.map.removeLayer(this.rutaLayer);
        this.rutaLayer = null;
      }
    } else {
      const ruta = this.rutas.find(r => r.id === rutaId);
      if (ruta) {
        this.mostrarRuta(ruta);
      }
    }
  }

  dibujarCalles() {
    this.callesLayers.forEach(layer => {
      if (this.map.hasLayer(layer)) {
        this.map.removeLayer(layer);
      }
    });
    this.callesLayers = [];

    this.calles.forEach(calle => {
      try {
        const geojson = typeof calle.shape === 'string' ? JSON.parse(calle.shape) : calle.shape;
        const layer = L.geoJSON(geojson, {
          style: {
            color: '#9b59b6',
            weight: 2,
            opacity: 0.6
          },
          onEachFeature: (feature, layer) => {
            layer.bindPopup(`<strong>${calle.nombre}</strong>`);
          }
        }).addTo(this.map);
        this.callesLayers.push(layer);
      } catch (e) {
        console.warn(`Error al dibujar calle ${calle.id}:`, e);
      }
    });
  }

  // Métodos para dibujo
  toggleDrawingMode() {
    if (this.drawingRoute) {
      this.finalizarRuta();
    } else {
      this.iniciarDibujoRuta();
    }
  }

  iniciarDibujoRuta() {
    this.drawingRoute = true;
    this.currentRoutePoints = [];
    this.map.on('click', this.onMapClick, this);
  }

  onMapClick = (e: L.LeafletMouseEvent) => {
    if (!this.drawingRoute) return;
    this.currentRoutePoints.push(e.latlng);
    
    if (this.currentRouteLayer) {
      this.map.removeLayer(this.currentRouteLayer);
    }
    
    this.currentRouteLayer = L.polyline(this.currentRoutePoints, {
      color: 'red',
      weight: 4
    }).addTo(this.map);
  };

  finalizarRuta() {
    if (this.currentRoutePoints.length < 2) {
      alert('La ruta debe tener al menos 2 puntos.');
      this.cancelarDibujo();
      return;
    }
    this.cancelarDibujo();
  }

  cancelarDibujo() {
    this.drawingRoute = false;
    this.map.off('click', this.onMapClick, this);
    if (this.currentRouteLayer) {
      this.map.removeLayer(this.currentRouteLayer);
      this.currentRouteLayer = null;
    }
    this.currentRoutePoints = [];
  }

  getNombreVehiculo(id: string): string {
    const vehiculo = this.vehiculos.find(v => v.id === id);
    return vehiculo ? `${vehiculo.placa} - ${vehiculo.marca}` : 'Desconocido';
  }
}