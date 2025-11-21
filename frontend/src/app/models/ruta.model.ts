export interface Ruta {
  id: string;
  nombre_ruta: string;
  shape?: GeoJSON.LineString;
  calles_ids?: string[];
  perfil_id: string;
}
