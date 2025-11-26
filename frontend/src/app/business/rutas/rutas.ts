// src/app/business/rutas/rutas.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import * as L from 'leaflet';

@Component({
  selector: 'app-rutas',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './rutas.html',
  styleUrls: ['./rutas.scss']
})
export class RutasComponent implements OnInit, AfterViewInit, OnDestroy {

  // Propiedades de paginación
  searchTerm: string = '';
  itemsPerPage: number = 10;
  currentPage: number = 1;
  rutasFiltradas: any[] = [];

  rutas: any[] = [];
  loading = true;
  error: string | null = null;
  private perfil_id = 'dc5fc78f-cd98-4296-94ec-18400859c8e7';
  private apiBase = '/api';

  // Estado del mapa embebido
  showMapModal = false;
  drawingRoute = false;
  currentRoutePoints: L.LatLng[] = [];
  currentRouteLayer: L.Polyline | null = null;
  map!: L.Map;

  // Propiedades para edición/visualización
  nombreTemporal: string = '';
  barriosSeleccionados: string[] = [];
  rutaActual: any = null; // Ruta que se está editando o viendo

  constructor(private http: HttpClient) {}

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

 cargarRutas() {
  this.loading = true;
  this.error = null;

  this.http.get<{ data: any[] }>(`${this.apiBase}/rutas`, {
    params: { perfil_id: this.perfil_id }
  }).subscribe({
    next: (resp) => {
      this.rutas = resp.data || [];
      this.filtrarRutas();
      this.loading = false;
    },
    error: (err) => {
      console.error('Error al cargar rutas:', err);
      this.error = 'No se pudieron cargar las rutas.';
      this.loading = false;
    }
  });
}

  // --- PAGINACIÓN Y FILTROS ---
  onSearch() {
    this.currentPage = 1;
    this.filtrarRutas();
  }

  onItemsPerPageChange() {
    this.currentPage = 1;
    this.filtrarRutas();
  }

  private filtrarRutas() {
    if (!this.searchTerm) {
      this.rutasFiltradas = [...this.rutas];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.rutasFiltradas = this.rutas.filter(ruta => 
        ruta.nombre_ruta?.toLowerCase().includes(term)
      );
    }
  }

  get totalPages(): number {
    return Math.ceil(this.rutasFiltradas.length / this.itemsPerPage);
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage;
  }

  get endIndex(): number {
    return Math.min(this.startIndex + this.itemsPerPage, this.rutasFiltradas.length);
  }

  get rutasPaginadas(): any[] {
    return this.rutasFiltradas.slice(this.startIndex, this.endIndex);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getPageNumbers(): number[] {
    const pages = [];
    const maxPages = Math.min(5, this.totalPages);
    let start = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    let end = Math.min(this.totalPages, start + maxPages - 1);
    if (end - start + 1 < maxPages) {
      start = Math.max(1, end - maxPages + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  trackByRuta(index: number, ruta: any): string {
    return ruta.id || index.toString();
  }

  calcularLongitud(ruta: any): number {
    if (!ruta.shape) return 0;
    try {
      const geojson = typeof ruta.shape === 'string' ? JSON.parse(ruta.shape) : ruta.shape;
      let coordinates: [number, number][] = [];
      if (geojson.type === 'LineString') {
        coordinates = geojson.coordinates;
      } else if (geojson.type === 'MultiLineString') {
        coordinates = geojson.coordinates[0] || [];
      }
      if (coordinates.length < 2) return 0;
      let total = 0;
      for (let i = 1; i < coordinates.length; i++) {
        const [lon1, lat1] = coordinates[i - 1];
        const [lon2, lat2] = coordinates[i];
        const dx = (lon2 - lon1) * Math.cos((lat1 + lat2) / 2 * Math.PI / 180);
        const dy = lat2 - lat1;
        total += Math.sqrt(dx * dx + dy * dy) * 111;
      }
      return parseFloat(total.toFixed(2));
    } catch (e) {
      console.warn('Error al calcular longitud:', e);
      return 0;
    }
  }

  calcularLongitudActual(): number {
    if (this.currentRoutePoints.length < 2) return 0;
    let total = 0;
    for (let i = 1; i < this.currentRoutePoints.length; i++) {
      const [lng1, lat1] = [this.currentRoutePoints[i - 1].lng, this.currentRoutePoints[i - 1].lat];
      const [lng2, lat2] = [this.currentRoutePoints[i].lng, this.currentRoutePoints[i].lat];
      const dx = (lng2 - lng1) * Math.cos((lat1 + lat2) / 2 * Math.PI / 180);
      const dy = lat2 - lat1;
      total += Math.sqrt(dx * dx + dy * dy) * 111;
    }
    return parseFloat(total.toFixed(2));
  }

  contarPuntos(ruta: any): number {
    if (!ruta.shape) return 0;
    try {
      const geojson = typeof ruta.shape === 'string' ? JSON.parse(ruta.shape) : ruta.shape;
      if (geojson.type === 'LineString') {
        return geojson.coordinates?.length || 0;
      } else if (geojson.type === 'MultiLineString') {
        return (geojson.coordinates[0] || []).length || 0;
      }
    } catch (e) {
      console.warn('Error al contar puntos:', e);
    }
    return 0;
  }

  // 🖊 MODO DIBUJO
  abrirModalDibujo() {
    this.rutaActual = null;
    this.showMapModal = true;
    this.drawingRoute = true;
    this.currentRoutePoints = [];
    this.nombreTemporal = '';
    this.barriosSeleccionados = [];
    setTimeout(() => {
      this.inicializarMapa();
    }, 100);
  }

  // 👁️ VER RUTA EN MAPA
  verEnMapa(ruta: any) {
    this.rutaActual = ruta;
    this.showMapModal = true;
    this.drawingRoute = false;
    this.currentRoutePoints = [];
    this.cargarPuntosDeRuta(ruta);
    setTimeout(() => {
      this.inicializarMapa();
    }, 100);
  }

  // ✏️ EDITAR RUTA
  editarRuta(ruta: any) {
    this.rutaActual = ruta;
    this.showMapModal = true;
    this.drawingRoute = false;
    this.currentRoutePoints = [];
    this.cargarPuntosDeRuta(ruta);
    this.nombreTemporal = ruta.nombre_ruta;
    this.barriosSeleccionados = this.obtenerBarrios(ruta);
    setTimeout(() => {
      this.inicializarMapa();
    }, 100);
  }

  cargarPuntosDeRuta(ruta: any) {
    try {
      const geojson = typeof ruta.shape === 'string' ? JSON.parse(ruta.shape) : ruta.shape;
      if (geojson.type === 'LineString') {
        this.currentRoutePoints = geojson.coordinates.map((coord: [number, number]) => 
          L.latLng(coord[1], coord[0])
        );
      } else if (geojson.type === 'MultiLineString' && geojson.coordinates?.[0]) {
        this.currentRoutePoints = geojson.coordinates[0].map((coord: [number, number]) => 
          L.latLng(coord[1], coord[0])
        );
      }
    } catch (e) {
      console.error('Error al cargar puntos de ruta:', e);
    }
  }

  inicializarMapa() {
    if (this.map) {
      this.map.remove();
    }

    this.map = L.map('embedded-map', {
      center: [3.895, -77.05],
      zoom: 13
    });

    // ✅ CORREGIDO: URL sin espacios
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    if (this.drawingRoute) {
      // Modo dibujo
      this.map.on('click', this.onMapClick.bind(this));
    } else {
      // Modo edición/visualización
      this.dibujarRutaEdicion();
    }
    
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

  dibujarRutaEdicion() {
    // Limpiar capas anteriores
    this.map.eachLayer(layer => {
      if (layer instanceof L.Polyline || layer instanceof L.Marker) {
        this.map.removeLayer(layer);
      }
    });

    if (this.currentRoutePoints.length === 0) return;

    // Dibujar línea
    const polyline = L.polyline(this.currentRoutePoints, {
      color: this.drawingRoute ? 'red' : '#2ecc71',
      weight: 4
    }).addTo(this.map);

    // Si es modo edición, añadir marcadores clickeables
    if (this.rutaActual && this.rutaActual.id) {
      this.currentRoutePoints.forEach((latlng, index) => {
        const marker = L.marker(latlng, {
          draggable: true,
          title: `Punto ${index + 1}`
        }).addTo(this.map);

        // Eliminar punto al hacer clic
        marker.on('click', () => {
          if (this.currentRoutePoints.length <= 2) {
            alert('La ruta debe tener al menos 2 puntos');
            return;
          }
          this.currentRoutePoints.splice(index, 1);
          this.dibujarRutaEdicion();
        });

        // Mover punto al arrastrar
        marker.on('dragend', (e) => {
          this.currentRoutePoints[index] = e.target.getLatLng();
        });
      });
    }

    // Centrar en la ruta
    if (this.currentRoutePoints.length > 0) {
      const bounds = L.latLngBounds(this.currentRoutePoints);
      this.map.fitBounds(bounds, { padding: [50, 50] });
    }
  }

  finalizarRuta() {
    if (this.currentRoutePoints.length < 2) {
      alert('La ruta debe tener al menos 2 puntos.');
      return;
    }

    const coordinates = this.currentRoutePoints.map(p => [p.lng, p.lat] as [number, number]);
    const geojsonLine = {
      type: 'MultiLineString' as const,
      coordinates: [coordinates]
    };

    const nombre = this.nombreTemporal || prompt('Nombre de la ruta:');
    if (!nombre) return;

    const payload = {
      nombre_ruta: nombre,
      perfil_id: this.perfil_id,
      shape: geojsonLine,
      barrios: this.barriosSeleccionados
    };

    this.http.post(`${this.apiBase}/rutas`, payload).subscribe({
      next: () => {
        alert('✅ Ruta creada exitosamente');
        this.cerrarModal();
        this.cargarRutas();
      },
      error: (err) => {
        console.error('Error al crear ruta:', err);
        let message = 'Error al crear la ruta.';
        if (err?.error?.message) {
          message = err.error.message;
        } else if (err?.error?.errors?.perfil_id) {
          message = err.error.errors.perfil_id[0];
        }
        alert('❌ ' + message);
      }
    });
  }

  guardarEdicion() {
    // La API del profesor no tiene PUT, así que creamos una nueva ruta
    if (confirm('¿Desea guardar los cambios? Se creará una nueva ruta con los cambios.')) {
      this.finalizarRuta();
    }
  }

  // 🗑️ ELIMINAR RUTA
  eliminarRuta(id: string) {
    if (!confirm('¿Está seguro de eliminar esta ruta?')) return;
    
    // La API del profesor NO tiene endpoint de eliminación
    // Mostramos mensaje y recargamos
    alert('⚠️ La eliminación real no está implementada ...');
    
    // Simular eliminación en el frontend
    this.rutas = this.rutas.filter(r => r.id !== id);
    this.filtrarRutas();
    this.cerrarModal();
  }

  cancelarDibujo() {
    this.cerrarModal();
  }

  cerrarModal() {
    this.showMapModal = false;
    this.drawingRoute = false;
    this.rutaActual = null;
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

  // Métodos auxiliares
  obtenerBarrios(ruta: any): string[] {
    try {
      if (ruta.barrios) {
        return typeof ruta.barrios === 'string' ? JSON.parse(ruta.barrios) : ruta.barrios;
      }
    } catch (e) {}
    return [];
  }

  quitarBarrio(barrio: string) {
    this.barriosSeleccionados = this.barriosSeleccionados.filter(b => b !== barrio);
  }

  agregarBarrioManual() {
    const barrio = prompt('Nombre del barrio:');
    if (barrio && !this.barriosSeleccionados.includes(barrio)) {
      this.barriosSeleccionados.push(barrio);
    }
  }
}