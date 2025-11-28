// src/app/business/vehiculos/vehiculos.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-vehiculos',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './vehiculos.html',
  styleUrls: ['./vehiculos.scss']
})
export class VehiculosComponent implements OnInit {

  vehiculos: any[] = [];
  loading = true;
  error: string | null = null;
  private perfil_id = 'dc5fc78f-cd98-4296-94ec-18400859c8e7';
  private apiBase = '/api';

  // Formulario
  nuevoVehiculo = {
    placa: '',
    marca: '',
    modelo: '',
    activo: true
  };

  mostrarFormulario = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.cargarVehiculos();
  }

  cargarVehiculos() {
    this.loading = true;
    this.error = null;

    this.http.get<{ data: any[] }>(`${this.apiBase}/vehiculos`, {
      params: { perfil_id: this.perfil_id }
    }).subscribe({
      next: (resp) => {
        this.vehiculos = resp.data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar vehículos:', err);
        this.error = 'No se pudieron cargar los vehículos.';
        this.loading = false;
      }
    });
  }

  crearVehiculo() {
    if (!this.nuevoVehiculo.placa || !this.nuevoVehiculo.marca || !this.nuevoVehiculo.modelo) {
      alert('Por favor complete todos los campos obligatorios.');
      return;
    }

    const payload = {
      placa: this.nuevoVehiculo.placa,
      marca: this.nuevoVehiculo.marca,
      modelo: this.nuevoVehiculo.modelo,
      activo: this.nuevoVehiculo.activo,
      perfil_id: this.perfil_id
    };

    this.http.post(`${this.apiBase}/vehiculos`, payload).subscribe({
      next: () => {
        alert('✅ Vehículo creado exitosamente');
        this.nuevoVehiculo = { placa: '', marca: '', modelo: '', activo: true };
        this.mostrarFormulario = false;
        this.cargarVehiculos();
      },
      error: (err) => {
        console.error('Error al crear vehículo:', err);
        let message = 'Error al crear el vehículo.';
        if (err?.error?.message) {
          message = err.error.message;
        } else if (err?.error?.errors) {
          // Mostrar primer error de validación
          const firstError = Object.values(err.error.errors)[0] as string[];
          message = firstError[0];
        }
        alert('❌ ' + message);
      }
    });
  }

  toggleActivo(vehiculo: any) {
    const nuevoEstado = !vehiculo.activo;
    if (confirm(`¿Desea ${nuevoEstado ? 'activar' : 'desactivar'} el vehículo ${vehiculo.placa}?`)) {
      // La API del profesor no tiene PUT, así que simulamos
      alert('⚠️ La actualización no está implementada en la API del profesor.\nSimulando cambio...');
      vehiculo.activo = nuevoEstado;
    }
  }

  eliminarVehiculo(id: string) {
    //implementacio para eliminar vehiculos

  }
}