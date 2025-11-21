import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.html',
  styleUrls: ['./mapa.scss']
})
export class MapaPage implements AfterViewInit {

  private map!: L.Map;
  private userMarker!: L.Marker;
  private perfil_id: string = 'dc5fc78f-cd98-4296-94ec-18400859c8e7'; // Tu perfil_id
  private apiBase: string = 'https://tu-api.com'; // Cambia a tu URL real de la API

  constructor() {
    this.fixLeafletIcons();
  }

  ngAfterViewInit() {
    this.inicializarMapa();
    this.agregarBotonCentrar();
    this.obtenerUbicacionActual();
    this.cargarRutasDesdeAPI();
  }

  // 🔹 Inicializar mapa
  inicializarMapa() {
    this.map = L.map('map', {
      center: [3.895, -77.05], // Buenaventura
      zoom: 13
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(this.map);
  }

  // 🔹 Botón centrar en ubicación
  agregarBotonCentrar() {
    const control = L.Control.extend({
      options: { position: 'topleft' },
      onAdd: (map: L.Map) => {
        const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        div.style.background = '#fff';
        div.style.padding = '5px';
        div.style.cursor = 'pointer';
        div.innerHTML = '📍 Mi ubicación';
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

  // 🔹 Obtener ubicación GPS y mostrar barrio
  obtenerUbicacionActual() {
    if (!navigator.geolocation) {
      alert("La geolocalización no está soportada en este dispositivo.");
      return;
    }

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

        // Obtener barrio mediante reverse geocoding
        const barrio = await this.obtenerBarrio(lat, lon);
        this.userMarker.bindPopup(`📍 Estás aquí<br>🗺 Barrio: ${barrio}`).openPopup();
      },
      (err) => {
        console.error("Error al obtener ubicación:", err);
        alert("No se pudo obtener la ubicación GPS.");
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  }

  // 🔹 Reverse geocoding para obtener barrio
  async obtenerBarrio(lat: number, lon: number): Promise<string> {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
      const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
      const data = await response.json();
      return data.address?.neighbourhood || data.address?.suburb || data.address?.city_district || "Desconocido";
    } catch (error) {
      console.error("Error al obtener barrio:", error);
      return "Desconocido";
    }
  }

  // 🔹 Cargar rutas desde la API y mostrarlas
  async cargarRutasDesdeAPI() {
    try {
      const res = await fetch(`${this.apiBase}/api/rutas?perfil_id=${this.perfil_id}`);
      const data = await res.json();
      if (!data.data) return;

      data.data.forEach((ruta: any) => {
        if (!ruta.shape) return;
        let geojson;
        try {
          geojson = typeof ruta.shape === 'string' ? JSON.parse(ruta.shape) : ruta.shape;
        } catch {
          console.warn("GeoJSON inválido en ruta:", ruta.nombre_ruta);
          return;
        }

        const color = ruta.color_hex || '#3388ff';
        L.geoJSON(geojson, {
          style: { color, weight: 4, opacity: 0.7 },
          onEachFeature: (feature, layer) => {
            layer.bindPopup(`🛣 Ruta: ${ruta.nombre_ruta}`);
          }
        }).addTo(this.map);
      });
    } catch (error) {
      console.error("Error al cargar rutas desde la API:", error);
    }
  }

  // 🔧 Fix de iconos de Leaflet
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
