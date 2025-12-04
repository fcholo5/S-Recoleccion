// src/app/business/recorrido/recorrido.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import * as L from 'leaflet';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-recorrido',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './recorridos.html',
  styleUrls: ['./recorridos.scss']
})
export class RecorridosComponent implements OnInit, OnDestroy {

  private perfil_id = 'dc5fc78f-cd98-4296-94ec-18400859c8e7';
  private apiBase = environment.apiUrl;

  // Datos
  rutas: any[] = [];
  vehiculos: any[] = [];
  rutaSeleccionada: string = '';
  vehiculoSeleccionado: string = '';

  // Estado del recorrido
  recorridos: any[] = [];
  recorridoActivo: any = null;
  posicionActual: { lat: number; lng: number } | null = null;

  // Mapa
  map!: L.Map;
  vehiculoMarker: L.Marker | null = null;
  rutaSeleccionadaLayer: L.GeoJSON | null = null;

  // Geolocalización
  watchId: number | null = null;

  // Estado de carga
  loadingRecorridos = true;

  constructor(private http: HttpClient) {}

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

    // ✅ URL corregida y conforme a política de uso
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
  }

  cargarRutas() {
    this.http.get<{ data: any[] }>(`${this.apiBase}/rutas`, {
      params: { perfil_id: this.perfil_id }
    }).subscribe({
      next: (resp) => this.rutas = resp.data || [],
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
      next: (resp) => this.vehiculos = resp.data || [],
      error: (err) => {
        console.error('Error al cargar vehículos:', err);
        alert('No se pudieron cargar los vehículos.');
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
      },
      error: (err) => {
        console.error('Error al cargar recorridos:', err);
        alert('No se pudieron cargar los recorridos.');
        this.loadingRecorridos = false;
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

  // === NUEVO: Mostrar ruta en el mapa ===
  mostrarRuta(rutaId: string) {
    this.limpiarCapas(); // Solo limpia la capa de ruta y marcador, no el mapa

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

      const bounds = this.rutaSeleccionadaLayer.getBounds();
      this.map.fitBounds(bounds, { padding: [50, 50] });
    } catch (e) {
      console.warn('Error al dibujar la ruta:', e);
    }
  }

  // === NUEVO: Escuchar cambios en la ruta seleccionada ===
  onRutaChange() {
    if (this.rutaSeleccionada) {
      this.mostrarRuta(this.rutaSeleccionada);
    } else {
      this.limpiarCapas();
    }
  }

  iniciarRecorrido() {
    if (!this.rutaSeleccionada || !this.vehiculoSeleccionado) {
      alert('Por favor seleccione una ruta y un vehículo.');
      return;
    }

    if (this.vehiculoTieneRecorridoActivo(this.vehiculoSeleccionado)) {
      const vehiculo = this.vehiculos.find(v => v.id === this.vehiculoSeleccionado);
      alert(`El vehículo ${vehiculo?.placa} ya tiene un recorrido en curso.`);
      return;
    }

    const payload = {
      ruta_id: this.rutaSeleccionada,
      vehiculo_id: this.vehiculoSeleccionado,
      perfil_id: this.perfil_id
    };

    this.http.post(`${this.apiBase}/recorridos/iniciar`, payload).subscribe({
      next: (resp: any) => {
        alert('✅ Recorrido iniciado');
        this.cargarRecorridos();
      },
      error: (err) => {
        console.error('Error al iniciar recorrido:', err);
        alert('❌ No se pudo iniciar el recorrido.');
      }
    });
  }

  finalizarRecorrido() {
    if (!this.recorridoActivo) return;

    if (confirm('¿Desea finalizar el recorrido?')) {
      const url = `${this.apiBase}/recorridos/${this.recorridoActivo.id}/finalizar`;
      const payload = { perfil_id: this.perfil_id };

      this.http.post(url, payload).subscribe({
        next: () => {
          alert('✅ Recorrido finalizado');
          this.recorridoActivo = null;
          this.limpiarCapas();
          this.detenerGeolocalizacion();
          this.cargarRecorridos();
        },
        error: (err) => {
          console.error('Error al finalizar recorrido:', err);
          alert('❌ Error al finalizar el recorrido.');
        }
      });
    }
  }

  iniciarGeolocalizacion() {
    if (!navigator.geolocation) {
      alert('Geolocalización no soportada.');
      return;
    }

    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        this.posicionActual = { lat, lng };

        // Actualizar o crear marcador
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

        // Centrar suavemente en el vehículo
        this.map.panTo([lat, lng], { animate: true, duration: 0.5 });
        this.map.setZoom(16); // zoom inmediato o también usa flyTo si quieres animarlo

        // Enviar posición
        if (this.recorridoActivo) {
          this.enviarPosicion(lat, lng);
        }
      },
      (err) => {
        console.error('Error en geolocalización:', err);
        alert('No se pudo obtener la ubicación GPS.');
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
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  // === Métodos auxiliares ===
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