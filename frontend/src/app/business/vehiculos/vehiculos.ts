import { Component, OnInit } from '@angular/core';
import { VehiculosService } from '../../services/vehiculos';

@Component({
  selector: 'app-vehiculos',
  standalone: true,
  templateUrl: './vehiculos.html',
  styleUrls: ['./vehiculos.css']
})
export class Vehiculos implements OnInit {
  vehiculos: any[] = [];
  loading = false;

  constructor(private svc: VehiculosService) {}

  ngOnInit(): void {
    this.loading = true;

    this.svc.list().subscribe({
      next: (data: any[]) => {
        this.vehiculos = data;
        this.loading = false;
      },
      error: (_: any) => {
        this.loading = false;
        console.error('Error al obtener los vehículos');
      }
    });
  }
}
