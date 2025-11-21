export interface Posicion {
  lat: number;
  lon: number;
  perfil_id: string;
}

export interface Recorrido {
  id: string;
  ruta_id: string;
  vehiculo_id: string;
  perfil_id: string;
  activo: boolean;
  ultima_posicion?: Posicion;
}