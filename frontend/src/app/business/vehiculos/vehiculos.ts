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
  editarVehiculo: any = null;
  nuevoVehiculo = {
    placa: '',
    marca: '',
    modelo: '',
    activo: true
  };

  mostrarFormulario = false;
  modoEdicion = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
  this.cargarVehiculos();
  this.resetFormulario();
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

  // ✅ Propiedades para evitar expresiones en ngModel
  get placaActual() {
    return this.modoEdicion ? this.editarVehiculo.placa : this.nuevoVehiculo.placa;
  }

  set placaActual(value: string) {
    if (this.modoEdicion) {
      this.editarVehiculo.placa = value;
    } else {
      this.nuevoVehiculo.placa = value;
    }
  }

  get marcaActual() {
    return this.modoEdicion ? this.editarVehiculo.marca : this.nuevoVehiculo.marca;
  }

  set marcaActual(value: string) {
    if (this.modoEdicion) {
      this.editarVehiculo.marca = value;
    } else {
      this.nuevoVehiculo.marca = value;
    }
  }

  get modeloActual() {
    return this.modoEdicion ? this.editarVehiculo.modelo : this.nuevoVehiculo.modelo;
  }

  set modeloActual(value: string) {
    if (this.modoEdicion) {
      this.editarVehiculo.modelo = value;
    } else {
      this.nuevoVehiculo.modelo = value;
    }
  }

  get activoActual() {
    return this.modoEdicion ? this.editarVehiculo.activo : this.nuevoVehiculo.activo;
  }

  set activoActual(value: boolean) {
    if (this.modoEdicion) {
      this.editarVehiculo.activo = value;
    } else {
      this.nuevoVehiculo.activo = value;
    }
  }

  // ✅ Crear nuevo vehículo
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
        this.resetFormulario();
        this.cargarVehiculos();
        this.mostrarFormulario = false;
      },
      error: (err) => {
        console.error('Error al crear vehículo:', err);
        let message = 'Error al crear el vehículo.';
        if (err?.error?.message) {
          message = err.error.message;
        } else if (err?.error?.errors) {
          const firstError = Object.values(err.error.errors)[0] as string[];
          message = firstError[0];
        }
        alert('❌ ' + message);
      }
    });
  }

  // ✅ Editar vehículo
  iniciarEdicion(vehiculo: any) {
    this.editarVehiculo = { ...vehiculo };
    this.modoEdicion = true;
    this.mostrarFormulario = true;
  }

  guardarEdicion() {
    if (!this.editarVehiculo.placa || !this.editarVehiculo.marca || !this.editarVehiculo.modelo) {
      alert('Por favor complete todos los campos obligatorios.');
      return;
    }

    const payload = {
      placa: this.editarVehiculo.placa,
      marca: this.editarVehiculo.marca,
      modelo: this.editarVehiculo.modelo,
      activo: this.editarVehiculo.activo,
      perfil_id: this.perfil_id
    };

    this.http.put(`${this.apiBase}/vehiculos/${this.editarVehiculo.id}`, payload).subscribe({
      next: () => {
        alert('✅ Vehículo actualizado exitosamente');
        this.resetFormulario();
        this.cargarVehiculos();
      },
      error: (err) => {
        console.error('Error al actualizar vehículo:', err);
        let message = 'Error al actualizar el vehículo.';
        if (err?.error?.message) {
          message = err.error.message;
        } else if (err?.error?.errors) {
          const firstError = Object.values(err.error.errors)[0] as string[];
          message = firstError[0];
        }
        alert('❌ ' + message);
      }
    });
  }

  eliminarVehiculo(id: string) {
  if (!confirm('¿Está seguro de eliminar este vehículo?')) return;
  
  // ✅ Eliminar vehículo
      this.http.delete(`${this.apiBase}/vehiculos/${id}`, {
        params: { perfil_id: this.perfil_id }
      }).subscribe({
        next: () => {
          alert('✅ Vehículo eliminado exitosamente');
          this.cargarVehiculos();
        },
        error: (err) => {
          console.error('Error al eliminar vehículo:', err);
          let message = 'Error al eliminar el vehículo.';
          if (err?.error?.message) {
            message = err.error.message;
          } else if (err?.error?.errors?.['perfil_id']) {
            message = err.error.errors['perfil_id'][0];
          }
          alert('❌ ' + message);
        }
      });
    }

  // ✅ Cambiar estado
  cambiarEstado(vehiculo: any) {
    const nuevoEstado = !vehiculo.activo;
    if (confirm(`¿Desea ${nuevoEstado ? 'activar' : 'desactivar'} el vehículo ${vehiculo.placa}?`)) {
      const payload = {
        placa: vehiculo.placa,
        marca: vehiculo.marca,
        modelo: vehiculo.modelo,
        activo: nuevoEstado,
        perfil_id: this.perfil_id
      };

      this.http.put(`${this.apiBase}/vehiculos/${vehiculo.id}`, payload).subscribe({
        next: () => {
          alert(`✅ Vehículo ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`);
          this.cargarVehiculos();
        },
        error: (err) => {
          console.error('Error al cambiar estado:', err);
          alert('❌ Error al cambiar el estado del vehículo.');
        }
      });
    }
  }

  // ✅ Cancelar / resetear formulario
  resetFormulario() {
    this.editarVehiculo = null;
    this.nuevoVehiculo = { placa: '', marca: '', modelo: '', activo: true };
    this.mostrarFormulario = false;
    this.modoEdicion = false;
  }
}