import { CommonModule } from '@angular/common';
import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as L from 'leaflet';

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.html',
  styleUrls: ['./mapa.scss'],
  imports: [CommonModule]
})
export class MapaPage implements AfterViewInit, OnDestroy {

  private map!: L.Map;
  private userMarker!: L.Marker;
  private perfil_id: string = 'dc5fc78f-cd98-4296-94ec-18400859c8e7';
  private apiBase: string = 'http:/api';

  public drawingRoute = false;
  private currentRoutePoints: L.LatLng[] = [];
  private currentRouteLayer: L.Polyline | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.fixLeafletIcons();
  }

  ngAfterViewInit() {
    this.inicializarMapa();
    this.agregarBotonCentrar();
    this.obtenerUbicacionActual();
    this.cargarRutasDesdeAPI();

    // ✅ Activar modo dibujo si viene desde rutas
    this.route.queryParams.subscribe(params => {
      if (params['dibujar'] === '1' && !this.drawingRoute) {
        setTimeout(() => {
          this.toggleDrawingMode();
        }, 600);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  inicializarMapa() {
    this.map = L.map('map', {
      center: [3.895, -77.05],
      zoom: 13
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap - Fabian Panameño'
    }).addTo(this.map);
  }

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

  obtenerUbicacionActual() {
    if (!navigator.geolocation) {
      alert("La geolocalización no está soportada.");
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

  async cargarRutasDesdeAPI() {
    try {
      const res = await fetch(`${this.apiBase}/rutas?perfil_id=${this.perfil_id}`);
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

  // 🖊 DIBUJO DE RUTA
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
    alert('Haga clic en el mapa para agregar puntos. Luego haga clic en "Finalizar Ruta" para guardar.');
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
      this.cancelarDibujo();
      return;
    }

    const coordinates = this.currentRoutePoints.map(p => [p.lng, p.lat] as [number, number]);

    const geojsonLine = {
      type: 'LineString' as const,
      coordinates: coordinates
    };

    const nombre = prompt('Nombre de la ruta:');
    if (!nombre) {
      this.cancelarDibujo();
      return;
    }

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
        L.geoJSON(geojsonLine, {
          style: { color: '#3388ff', weight: 4 },
          onEachFeature: (feature, layer) => {
            layer.bindPopup(`🛣 Ruta: ${nombre}`);
          }
        }).addTo(this.map);

        this.cancelarDibujo();
        // ✅ Redirigir de vuelta a rutas
        this.router.navigate(['/rutas']);
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
    this.drawingRoute = false;
    this.map.off('click', this.onMapClick, this);
    if (this.currentRouteLayer) {
      this.map.removeLayer(this.currentRouteLayer);
      this.currentRouteLayer = null;
    }
    this.currentRoutePoints = [];
  }
}