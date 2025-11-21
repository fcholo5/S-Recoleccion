import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface Ruta {
  id?: string;
  nombre_ruta: string;
  perfil_id: string;
  shape: any;
  color_hex?: string;
}

@Component({
  selector: 'app-rutas',
  templateUrl: './rutas.html',
  styleUrls: ['./rutas.scss']
})
export class RutasPage implements AfterViewInit {
crearRuta(arg0: string,arg1: number[][]) {
throw new Error('Method not implemented.');
}

  private map!: L.Map;
  private userMarker!: L.Marker;
  private perfil_id = 'dc5fc78f-cd98-4296-94ec-18400859c8e7';
  public rutasAPI: Ruta[] = [];
  public rutasCreadas: Ruta[] = [];

  constructor(private http: HttpClient) {
    this.fixLeafletIcons();
  }

  ngAfterViewInit() {
    this.inicializarMapa();
    this.obtenerUbicacionActual();
    this.cargarRutasDesdeAPI();
  }

  // 🔹 Inicializa el mapa
  inicializarMapa() {
    this.map = L.map('map', {
      center: [3.8898, -77.0782],
      zoom: 13
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(this.map);
  }

  // 🔹 Obtener ubicación GPS
  obtenerUbicacionActual() {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        this.map.setView([lat, lon], 16);

        if (!this.userMarker) {
          this.userMarker = L.marker([lat, lon]).addTo(this.map);
          this.userMarker.bindPopup("📍 Estás aquí").openPopup();
        } else {
          this.userMarker.setLatLng([lat, lon]);
        }
      },
      (err) => console.error("Error GPS:", err),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  }

  // 🔹 Cargar rutas desde API
  cargarRutasDesdeAPI() {
    const url = `${environment.apiUrl}/rutas?perfil_id=${this.perfil_id}`;
    this.http.get<{ data: Ruta[] }>(url).subscribe({
      next: res => {
        this.rutasAPI = res.data;
        this.dibujarRutas(this.rutasAPI, '#3388ff'); // azul para API
      },
      error: err => console.error("Error cargando rutas API:", err)
    });
  }

  // 🔹 Crear nueva ruta directa
  crearRutaDirecta() {
    const nuevaRuta: Ruta = {
      nombre_ruta: 'Ruta Directa Nueva',
      perfil_id: this.perfil_id,
      shape: {
        type: 'LineString',
        coordinates: [
          [-77.0782, 3.8898],
          [-77.0605, 3.8828]
        ]
      },
      color_hex: '#FF5733'
    };

    const url = `${environment.apiUrl}/rutas`;
    this.http.post(url, nuevaRuta).subscribe({
      next: (res) => {
        console.log("Ruta creada:", res);
        // Guardar localmente y dibujar en mapa
        this.rutasCreadas.push(nuevaRuta);
        this.dibujarRutas([nuevaRuta], nuevaRuta.color_hex);
      },
      error: err => console.error("Error creando ruta:", err)
    });
  }

  // 🔹 Dibujar rutas en el mapa
  dibujarRutas(rutas: Ruta[], color: string = '#3388ff') {
    rutas.forEach(ruta => {
      try {
        const geojson = typeof ruta.shape === 'string' ? JSON.parse(ruta.shape) : ruta.shape;
        L.geoJSON(geojson, {
          style: { color: color, weight: 4, opacity: 0.7 }
        }).addTo(this.map);
      } catch (e) {
        console.error("Error al dibujar ruta:", e);
      }
    });
  }

  // 🔧 Fix iconos Leaflet
  private fixLeafletIcons() {
    const iconRetinaUrl = 'assets/img/marker-icon-2x.png';
    const iconUrl = 'assets/img/marker-icon.png';
    const shadowUrl = 'assets/img/marker-shadow.png';

    const defaultIcon = L.icon({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41]
    });

    L.Marker.prototype.options.icon = defaultIcon;
  }
}
