import { Component, OnInit } from '@angular/core';
import { Vehiculos as VehiculosService } from '../../services/vehiculos'; // ✅ renombramos aquí para evitar conflicto de nombres
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-vehiculos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vehiculos.html',
  styleUrls: ['./vehiculos.scss']
})
export class Vehiculos implements OnInit {
eliminarVehiculo(arg0: any) {
throw new Error('Method not implemented.');
}
editarVehiculo(_t23: any) {
throw new Error('Method not implemented.');
}
  vehiculos: any[] = [];
  loading = false;

  constructor(private svc: VehiculosService) {}

  ngOnInit(): void {
    this.cargarVehiculos();
  }

  /**
   * 🔹 Carga la lista de vehículos del perfil actual
   */
  cargarVehiculos(): void {
  this.loading = true;

  this.svc.list('', 1).subscribe({
    next: (res: any) => {
      this.vehiculos = res.data ?? res;
      this.loading = false;
      console.log('Vehículos cargados:', this.vehiculos);
    },
    error: (err: any) => {
      this.loading = false;
      console.error('Error al obtener los vehículos', err);
    }
  });
}

}
