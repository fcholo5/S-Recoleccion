// src/app/business/recorrido/recorrido.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';
import Swal from 'sweetalert2';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-recorrido',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recorridos.html',
  styleUrls: ['./recorridos.scss']
})
export class RecorridosComponent implements OnInit, OnDestroy {

  private perfil_id = 'dc5fc78f-cd98-4296-94ec-18400859c8e7';
  private apiBase = environment.apiUrl;

  rutas: any[] = [];
  vehiculos: any[] = [];
  rutaSeleccionada: string = '';
  vehiculoSeleccionado: string = '';

  recorridos: any[] = [];
  recorridoActivo: any = null;
  posicionActual: { lat: number; lng: number } | null = null;

  map!: L.Map;
  vehiculoMarker: L.Marker | null = null;
  rutaSeleccionadaLayer: L.GeoJSON | null = null;

  watchId: number | null = null;
  loadingRecorridos = true;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.inicializarMapa();
    this.cargarRecorridos();
  }

  ngOnDestroy(): void {
    if (this.map) this.map.remove();
    this.limpiarCapas();
    this.detenerGeolocalizacion();
  }

  limpiarCapas() {
    if (this.rutaSeleccionadaLayer && this.map.hasLayer(this.rutaSeleccionadaLayer)) {
      this.map.removeLayer(this.rutaSeleccionadaLayer);
      this.rutaSeleccionadaLayer = null;
    }
    if (this.vehiculoMarker && this.map.hasLayer(this.vehiculoMarker)) {
      this.map.removeLayer(this.vehiculoMarker);
      this.vehiculoMarker = null;
    }
  }

  inicializarMapa() {
    this.map = L.map('map', {
      center: [3.895, -77.05],
      zoom: 13
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
  }

  cargarRutas() {
    this.http.get<{ data: any[] }>(`${this.apiBase}/rutas`, {
      params: { perfil_id: this.perfil_id }
    }).subscribe({
      next: (resp) => {
        this.rutas = resp.data || [];
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar rutas:', err);
        Swal.fire('Error', 'No se pudieron cargar las rutas.', 'error');
      }
    });
  }

  cargarVehiculos() {
    this.http.get<{ data: any[] }>(`${this.apiBase}/vehiculos`, {
      params: { perfil_id: this.perfil_id }
    }).subscribe({
      next: (resp) => {
        this.vehiculos = resp.data || [];
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar vehículos:', err);
        Swal.fire('Error', 'No se pudieron cargar los vehículos.', 'error');
      }
    });
  }

  cargarRecorridos() {
    this.loadingRecorridos = true;
    this.http.get<{ data: any[] }>(`${this.apiBase}/misrecorridos`, {
      params: { perfil_id: this.perfil_id }
    }).subscribe({
      next: (resp) => {
        this.recorridos = resp.data || [];
        this.verificarRecorridoActivo();
        this.loadingRecorridos = false;
        this.cargarRutas();
        this.cargarVehiculos();
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar recorridos:', err);
        Swal.fire('Error', 'No se pudieron cargar los recorridos.', 'error');
        this.loadingRecorridos = false;
        this.cdr.markForCheck();
      }
    });
  }

  verificarRecorridoActivo() {
    const recorridoActivo = this.recorridos.find(r => r.estado === 'En Curso');
    if (recorridoActivo) {
      this.recorridoActivo = recorridoActivo;
      this.rutaSeleccionada = recorridoActivo.ruta_id;
      this.vehiculoSeleccionado = recorridoActivo.vehiculo_id;
      this.mostrarRuta(this.rutaSeleccionada);
      this.iniciarGeolocalizacion();
    }
  }

  obtenerPuntosDeRuta(rutaId: string): L.LatLng[] {
    const ruta = this.rutas.find(r => r.id === rutaId);
    if (!ruta) return [];

    try {
      const geojson = typeof ruta.shape === 'string' ? JSON.parse(ruta.shape) : ruta.shape;
      let coords: [number, number][] = [];
      if (geojson.type === 'LineString') {
        coords = geojson.coordinates;
      } else if (geojson.type === 'MultiLineString') {
        coords = geojson.coordinates[0] || [];
      }
      return coords.map(([lng, lat]) => L.latLng(lat, lng));
    } catch (e) {
      console.warn('Error al obtener puntos de ruta:', e);
      return [];
    }
  }

  calcularDistancia(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000; // Radio de la Tierra en metros
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // en metros
  }

  estaCercaDeRuta(pos: { lat: number; lng: number }, puntosRuta: L.LatLng[]): boolean {
    const umbral = 100; // 100 metros
    for (const punto of puntosRuta) {
      const dist = this.calcularDistancia(pos.lat, pos.lng, punto.lat, punto.lng);
      if (dist <= umbral) {
        return true;
      }
    }
    return false;
  }

  mostrarRuta(rutaId: string) {
    this.limpiarCapas();
    const ruta = this.rutas.find(r => r.id === rutaId);
    if (!ruta) return;

    try {
      const geojson = typeof ruta.shape === 'string' ? JSON.parse(ruta.shape) : ruta.shape;
      this.rutaSeleccionadaLayer = L.geoJSON(geojson, {
        style: { color: '#2ecc71', weight: 5, opacity: 0.9 },
        onEachFeature: (_, layer) => {
          layer.bindPopup(`<strong>Ruta:</strong> ${ruta.nombre_ruta}`);
        }
      }).addTo(this.map);

      setTimeout(() => {
        const bounds = this.rutaSeleccionadaLayer?.getBounds();
        if (bounds) {
          this.map.fitBounds(bounds, { padding: [50, 50] });
        }
      }, 100);
    } catch (e) {
      console.warn('Error al dibujar la ruta:', e);
    }
  }

  onRutaChange() {
    if (this.rutaSeleccionada) {
      this.mostrarRuta(this.rutaSeleccionada);
    } else {
      this.limpiarCapas();
    }
  }

  // ✅ Lógica principal: iniciar recorrido solo si está cerca de la ruta
  iniciarRecorrido() {
    if (!this.rutaSeleccionada || !this.vehiculoSeleccionado) {
      Swal.fire('Advertencia', 'Seleccione una ruta y un vehículo.', 'warning');
      return;
    }

    if (this.vehiculoTieneRecorridoActivo(this.vehiculoSeleccionado)) {
      const vehiculo = this.vehiculos.find(v => v.id === this.vehiculoSeleccionado);
      Swal.fire('Advertencia', `El vehículo ${vehiculo?.placa} ya está en un recorrido.`, 'warning');
      return;
    }

    // Obtener puntos de la ruta seleccionada
    const puntosRuta = this.obtenerPuntosDeRuta(this.rutaSeleccionada);
    if (puntosRuta.length === 0) {
      Swal.fire('Error', 'La ruta seleccionada no tiene puntos válidos.', 'error');
      return;
    }

    // Obtener ubicación actual
    if (!navigator.geolocation) {
      Swal.fire('Error', 'Geolocalización no soportada en este dispositivo.', 'error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const ubicacion = { lat: pos.coords.latitude, lng: pos.coords.longitude };

        if (!this.estaCercaDeRuta(ubicacion, puntosRuta)) {
          Swal.fire(
            'Ubicación no válida',
            'No estás en un punto válido para iniciar esta ruta. Acércate a la ruta e inténtalo de nuevo.',
            'warning'
          );
          return;
        }

        // ✅ Ubicación válida → iniciar recorrido
        const payload = {
          ruta_id: this.rutaSeleccionada,
          vehiculo_id: this.vehiculoSeleccionado,
          perfil_id: this.perfil_id
        };

        this.http.post(`${this.apiBase}/recorridos/iniciar`, payload).subscribe({
          next: (resp: any) => {
            Swal.fire('✅ Recorrido iniciado', 'El seguimiento ha comenzado.', 'success');
            this.cargarRecorridos();
            this.mostrarRuta(this.rutaSeleccionada);
            this.iniciarGeolocalizacion();
          },
          error: (err) => {
            console.error('Error al iniciar recorrido:', err);
            Swal.fire('❌ Error', 'No se pudo iniciar el recorrido.', 'error');
          }
        });
      },
      (err) => {
        console.error('Error al obtener ubicación:', err);
        Swal.fire('Error', 'No se pudo obtener tu ubicación. Activa el GPS e inténtalo de nuevo.', 'error');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  finalizarRecorrido() {
    if (!this.recorridoActivo) return;

    Swal.fire({
      title: '¿Finalizar recorrido?',
      text: 'Se detendrá el seguimiento GPS y se cerrará el recorrido actual.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, finalizar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        const url = `${this.apiBase}/recorridos/${this.recorridoActivo.id}/finalizar`;
        const payload = { perfil_id: this.perfil_id };

        this.http.post(url, payload).subscribe({
          next: () => {
            Swal.fire('✅ Finalizado', 'El recorrido ha sido finalizado correctamente.', 'success');
            this.recorridoActivo = null;
            this.limpiarCapas();
            this.detenerGeolocalizacion();
            this.cargarRecorridos();
          },
          error: (err) => {
            console.error('Error al finalizar recorrido:', err);
            Swal.fire('❌ Error', 'No se pudo finalizar el recorrido.', 'error');
          }
        });
      }
    });
  }

  iniciarGeolocalizacion() {
    if (!navigator.geolocation || !this.recorridoActivo) return;

    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        this.posicionActual = { lat, lng };

        if (this.vehiculoMarker) {
          this.vehiculoMarker.setLatLng([lat, lng]);
        } else {
          this.vehiculoMarker = L.marker([lat, lng], {
            icon: L.divIcon({
              className: 'vehiculo-marker',
              html: `<div style="background:#2ecc71;color:white;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:20px;">🚚</div>`,
              iconSize: [40, 40]
            }),
            title: 'Vehículo en movimiento'
          }).addTo(this.map);
        }

        this.map.panTo([lat, lng], { animate: true, duration: 0.5 });
        this.map.setZoom(16);

        this.enviarPosicion(lat, lng);
      },
      (err) => {
        console.error('Error en geolocalización:', err);
        Swal.fire('Error', 'No se pudo obtener la ubicación GPS.', 'error');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  enviarPosicion(lat: number, lng: number) {
    if (!this.recorridoActivo) return;
    const payload = { lat, lon: lng, perfil_id: this.perfil_id };
    this.http.post(`${this.apiBase}/recorridos/${this.recorridoActivo.id}/posiciones`, payload).subscribe({
      next: () => console.log('✅ Posición enviada'),
      error: (err) => console.warn('Error al enviar posición:', err)
    });
  }

  detenerGeolocalizacion() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  vehiculoTieneRecorridoActivo(vehiculoId: string): boolean {
    return this.recorridos.some(r =>
      String(r.vehiculo_id) === String(vehiculoId) && r.estado === 'En Curso'
    );
  }

  getNombreRuta(id: string): string {
    const ruta = this.rutas.find(r => r.id === id);
    return ruta ? ruta.nombre_ruta : 'Desconocida';
  }

  getNombreVehiculo(id: string): string {
    const vehiculo = this.vehiculos.find(v => v.id === id);
    return vehiculo ? `${vehiculo.placa} - ${vehiculo.marca}` : 'Desconocido';
  }

  getEstadoRecorrido(estado: string): string {
    switch (estado) {
      case 'En Curso': return '🟢 En curso';
      case 'Finalizado': return '🔴 Finalizado';
      default: return estado;
    }
  }
}