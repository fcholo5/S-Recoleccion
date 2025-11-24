export interface Coordenada {
  type: 'LineString';
  coordinates: [number, number][]; // [lon, lat]
}

export interface Ruta {
  id?: string;
  nombre_ruta: string;
  perfil_id: string;
  shape?: Coordenada;
  calles_ids?: string[];
}