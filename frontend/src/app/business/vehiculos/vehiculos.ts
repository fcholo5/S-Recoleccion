// src/app/business/vehiculos/vehiculos.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-vehiculos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vehiculos.html',
  styleUrls: ['./vehiculos.scss']
})
export class VehiculosComponent implements OnInit {
  vehiculos: any[] = [];
  loading = true;
  error: string | null = null;

  private perfil_id = 'dc5fc78f-cd98-4296-94ec-18400859c8e7';
  private apiBase = environment.apiUrl;

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

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.resetFormulario();
    this.cargarVehiculos();
  }

  cargarVehiculos() {
    this.loading = true;
    this.error = null;

    this.http.get<any>(`${this.apiBase}/vehiculos`, {
      params: { perfil_id: this.perfil_id }
    }).subscribe({
      next: (resp) => {
        const data = Array.isArray(resp) ? resp : resp?.data || [];
        this.vehiculos = data;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar vehículos:', err);
        this.error = 'No se pudieron cargar los vehículos.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  // ✅ Getters y setters seguros (evitan escribir en null)
  get placaActual(): string {
    return this.modoEdicion && this.editarVehiculo
      ? this.editarVehiculo.placa
      : this.nuevoVehiculo.placa;
  }

  set placaActual(value: string) {
    if (this.modoEdicion) {
      if (this.editarVehiculo) this.editarVehiculo.placa = value;
    } else {
      this.nuevoVehiculo.placa = value;
    }
  }

  get marcaActual(): string {
    return this.modoEdicion && this.editarVehiculo
      ? this.editarVehiculo.marca
      : this.nuevoVehiculo.marca;
  }

  set marcaActual(value: string) {
    if (this.modoEdicion) {
      if (this.editarVehiculo) this.editarVehiculo.marca = value;
    } else {
      this.nuevoVehiculo.marca = value;
    }
  }

  get modeloActual(): string {
    return this.modoEdicion && this.editarVehiculo
      ? this.editarVehiculo.modelo
      : this.nuevoVehiculo.modelo;
  }

  set modeloActual(value: string) {
    if (this.modoEdicion) {
      if (this.editarVehiculo) this.editarVehiculo.modelo = value;
    } else {
      this.nuevoVehiculo.modelo = value;
    }
  }

  get activoActual(): boolean {
    return this.modoEdicion && this.editarVehiculo
      ? this.editarVehiculo.activo
      : this.nuevoVehiculo.activo;
  }

  set activoActual(value: boolean) {
    if (this.modoEdicion) {
      if (this.editarVehiculo) this.editarVehiculo.activo = value;
    } else {
      this.nuevoVehiculo.activo = value;
    }
  }

  // ------------------ Acciones ------------------

  crearVehiculo() {
  const { placa, marca, modelo, activo } = this.nuevoVehiculo;

  // Validación de campos vacíos
  if (!placa?.trim() || !marca?.trim() || !modelo?.trim()) {
    Swal.fire('Error', 'Todos los campos obligatorios deben estar completos.', 'warning');
    return;
  }

  // ✅ Asegurar que perfil_id esté definido
  if (!this.perfil_id) {
    Swal.fire('Error', 'No se ha configurado el perfil del usuario.', 'error');
    return;
  }

  // Verificar si la placa ya existe localmente (mejora UX)
  const placaExiste = this.vehiculos.some(v =>
    v.placa?.toLowerCase() === placa.trim().toLowerCase()
  );
  if (placaExiste) {
    Swal.fire('Advertencia', 'Esta placa ya está registrada en el sistema.', 'warning');
    return;
  }

  const payload = {
    placa: placa.trim(),
    marca: marca.trim(),
    modelo: modelo.trim(),
    activo,
    perfil_id: this.perfil_id  // ✅ asegurado
  };

  this.http.post(`${this.apiBase}/vehiculos`, payload).subscribe({
    next: () => {
      Swal.fire('✅ Éxito', 'Vehículo creado correctamente.', 'success');
      this.resetFormulario();
      this.cargarVehiculos();
      this.mostrarFormulario = false;
    },
    error: (err) => {
      console.error('Error al crear vehículo:', err);
      let message = 'No se pudo registrar el vehículo.';

      if (err?.error?.message) {
        // Mensajes amigables
        if (err.error.message === 'The placa has already been taken.') {
          message = 'La placa ingresada ya está en uso. Por favor, use una placa diferente.';
        } else {
          message = err.error.message;
        }
      } else if (err?.error?.errors) {
        // Validación de Laravel: primer error de cualquier campo
        const errors = err.error.errors;
        const firstField = Object.keys(errors)[0];
        message = errors[firstField][0];
      }

      Swal.fire('❌ Error', message, 'error');
    }
  });
}

  iniciarEdicion(vehiculo: any) {
    this.editarVehiculo = { ...vehiculo };
    this.modoEdicion = true;
    this.mostrarFormulario = true;
  }

  guardarEdicion() {
    if (!this.editarVehiculo) {
      alert('No hay vehículo para editar.');
      return;
    }

    const { placa, marca, modelo, activo } = this.editarVehiculo;
    if (!placa?.trim() || !marca?.trim() || !modelo?.trim()) {
      alert('Por favor complete todos los campos obligatorios.');
      return;
    }

    const payload = {
      placa,
      marca,
      modelo,
      activo,
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

  cambiarEstado(vehiculo: any) {
    const nuevoEstado = !vehiculo.activo;
    if (!confirm(`¿Desea ${nuevoEstado ? 'activar' : 'desactivar'} el vehículo ${vehiculo.placa}?`)) return;

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

  resetFormulario() {
    this.editarVehiculo = null;
    this.nuevoVehiculo = { placa: '', marca: '', modelo: '', activo: true };
    this.mostrarFormulario = false;
    this.modoEdicion = false;
  }

  trackById(_index: number, item: any): string {
    return item?.id;
  }
}