// src/app/business/recorrido/recorrido.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import * as L from 'leaflet';

@Component({
  selector: 'app-recorrido',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './recorridos.html',
  styleUrls: ['./recorridos.scss']
})
export class RecorridosComponent implements OnInit, OnDestroy {

  private perfil_id = 'dc5fc78f-cd98-4296-94ec-18400859c8e7';
  private apiBase = '/api';

  // Datos para iniciar recorrido
  rutas: any[] = [];
  vehiculos: any[] = [];
  rutaSeleccionada: string = '';
  vehiculoSeleccionado: string = '';

  // Estado del recorrido
  recorridos: any[] = []; // Todos los recorridos del perfil
  recorridoActivo: any = null; // Recorrido actualmente activo
  posicionActual: { lat: number; lng: number } | null = null;

  // Mapa
  map!: L.Map;
  userMarker!: L.Marker;
  recorridoMarker!: L.Marker;

  // Geolocalización
  watchId: number | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.cargarRutas();
    this.cargarVehiculos();
    this.cargarRecorridos(); // ✅ Cargar recorridos existentes
    this.inicializarMapa();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
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

  // ✅ Cargar recorridos existentes
  cargarRecorridos() {
    this.http.get<{ data: any[] }>(`${this.apiBase}/misrecorridos`, {
      params: { perfil_id: this.perfil_id }
    }).subscribe({
      next: (resp) => {
        this.recorridos = resp.data || [];
        this.verificarRecorridoActivo();
      },
      error: (err) => {
        console.error('Error al cargar recorridos:', err);
        alert('No se pudieron cargar los recorridos.');
      }
    });
  }

  // ✅ Verificar si hay un recorrido activo
  verificarRecorridoActivo() {
    const recorridoActivo = this.recorridos.find(r => r.estado === 'En Curso');
    if (recorridoActivo) {
      this.recorridoActivo = recorridoActivo;
      this.rutaSeleccionada = recorridoActivo.ruta_id;
      this.vehiculoSeleccionado = recorridoActivo.vehiculo_id;
      this.iniciarGeolocalizacion();
    }
  }

  // ✅ Iniciar nuevo recorrido
  iniciarRecorrido() {
    if (!this.rutaSeleccionada || !this.vehiculoSeleccionado) {
      alert('Por favor seleccione una ruta y un vehículo.');
      return;
    }

    const payload = {
      ruta_id: this.rutaSeleccionada,
      vehiculo_id: this.vehiculoSeleccionado,
      perfil_id: this.perfil_id
    };

    this.http.post(`${this.apiBase}/recorridos/iniciar`, payload).subscribe({
      next: (resp: any) => {
        alert('✅ Recorrido iniciado exitosamente');
        this.cargarRecorridos(); // ✅ Recargar la lista de recorridos
      },
      error: (err) => {
        console.error('Error al iniciar recorrido:', err);
        let message = 'Error al iniciar el recorrido.';
        if (err?.error?.message) {
          message = err.error.message;
        }
        alert('❌ ' + message);
      }
    });
  }

  // ✅ Finalizar recorrido
  finalizarRecorrido() {
    if (!this.recorridoActivo) return;

    if (confirm('¿Desea finalizar el recorrido?')) {
      const url = `${this.apiBase}/recorridos/${this.recorridoActivo.id}/finalizar`;
      const payload = {
        perfil_id: this.perfil_id
      };

      this.http.post(url, payload).subscribe({
        next: () => {
          alert('✅ Recorrido finalizado exitosamente');
          this.recorridoActivo = null;
          this.cargarRecorridos(); // ✅ Recargar la lista de recorridos
          
          // Limpiar marcadores
          if (this.userMarker) {
            this.map.removeLayer(this.userMarker);
            this.userMarker = undefined!;
          }
          if (this.recorridoMarker) {
            this.map.removeLayer(this.recorridoMarker);
            this.recorridoMarker = undefined!;
          }
          
          // Detener geolocalización
          if (this.watchId) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
          }
        },
        error: (err) => {
          console.error('Error al finalizar recorrido:', err);
          let message = 'Error al finalizar el recorrido.';
          if (err?.error?.message) {
            message = err.error.message;
          }
          alert('❌ ' + message);
        }
      });
    }
  }

  // ✅ Iniciar geolocalización
  iniciarGeolocalizacion() {
    if (!navigator.geolocation) {
      alert('La geolocalización no está soportada en este dispositivo.');
      return;
    }

    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        this.posicionActual = { lat, lng };

        // Actualizar marcador en el mapa
        if (this.userMarker) {
          this.userMarker.setLatLng([lat, lng]);
        } else {
          this.userMarker = L.marker([lat, lng], {
            title: 'Tu ubicación actual'
          }).addTo(this.map);
        }

        this.map.setView([lat, lng], 16);

        // Enviar posición al servidor
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

  // ✅ Enviar posición
  enviarPosicion(lat: number, lng: number) {
    if (!this.recorridoActivo) return;

    const payload = {
      lat: lat,
      lon: lng,
      perfil_id: this.perfil_id
    };

    this.http.post(`${this.apiBase}/recorridos/${this.recorridoActivo.id}/posiciones`, payload)
      .subscribe({
        next: () => {
          console.log('✅ Posición registrada');
          
          // Mostrar marcador del recorrido
          if (this.recorridoMarker) {
            this.recorridoMarker.setLatLng([lat, lng]);
          } else {
            this.recorridoMarker = L.marker([lat, lng], {
              icon: L.divIcon({
                className: 'recorrido-marker',
                html: '<div style="background:#2ecc71;color:white;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;">R</div>',
                iconSize: [24, 24]
              }),
              title: 'Posición del recorrido'
            }).addTo(this.map);
          }
        },
        error: (err) => {
          console.error('Error al enviar posición:', err);
        }
      });
  }

  // Métodos auxiliares
  getNombreRuta(id: string): string {
    const ruta = this.rutas.find(r => r.id === id);
    return ruta ? ruta.nombre_ruta : 'Desconocida';
  }

  getNombreVehiculo(id: string): string {
    const vehiculo = this.vehiculos.find(v => v.id === id);
    return vehiculo ? `${vehiculo.placa} - ${vehiculo.marca}` : 'Desconocido';
  }

  // ✅ Obtener estado del recorrido
  getEstadoRecorrido(estado: string): string {
    switch (estado) {
      case 'En Curso':
        return '🟢 En curso';
      case 'Finalizado':
        return '🔴 Finalizado';
      default:
        return estado;
    }
  }
}