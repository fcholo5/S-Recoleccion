import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User, UserService, Role } from '../../services/usuarios';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.scss']
})
export class Usuarios implements OnInit {

  usuarios: User[] = [];
  roles: Role[] = [];

  loading = false;
  errorMessage: string | null = null;

  mostrarModal = false;
  editando = false;

  usuarioActual: Partial<User> = {
    id: undefined,
    name: '',
    email: '',
    password: '',
    role_id: undefined
  };

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.cargarUsuarios();
    this.cargarRoles();
  }

  // ===================== CARGAR ROLES =====================
  cargarRoles(): void {
    this.roles = this.userService.getRolesDisponibles();
  }

  // ===================== CARGAR USUARIOS =====================
  cargarUsuarios(): void {
    this.loading = true;

    this.userService.getUsuarios().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err?.message || 'Error al cargar usuarios.';
        this.loading = false;
      }
    });
  }

  // ===================== ELIMINAR USUARIO =====================
  eliminarUsuario(id: number): void {
    Swal.fire({
      title: '¿Eliminar usuario?',
      text: 'No podrás revertir esto',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (!result.isConfirmed) return;

      this.userService.eliminarUsuario(id).subscribe({
        next: () => {
          this.usuarios = this.usuarios.filter(u => u.id !== id);
          Swal.fire('Eliminado', 'Usuario eliminado correctamente', 'success');
        },
        error: (err) => Swal.fire('Error', err.message || 'Error al eliminar usuario', 'error')
      });
    });
  }

  // ===================== ABRIR MODAL =====================
  abrirModalCrear(): void {
    this.editando = false;
    this.usuarioActual = {
      id: undefined,
      name: '',
      email: '',
      password: '',
      role_id: undefined
    };
    this.mostrarModal = true;
  }

  abrirModalEditar(usuario: User): void {
    this.editando = true;
    this.usuarioActual = {
      id: usuario.id,
      name: usuario.name,
      email: usuario.email,
      role_id: usuario.role_id,
      password: ''
    };
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  // ===================== GUARDAR USUARIO =====================
  guardarUsuario(): void {
    if (!this.usuarioActual.name || !this.usuarioActual.email || (!this.editando && !this.usuarioActual.password) || !this.usuarioActual.role_id) {
      Swal.fire('Error', 'Todos los campos obligatorios deben ser llenados', 'warning');
      return;
    }

    // ===== EDITAR =====
    if (this.editando) {
      this.userService.actualizarUsuario(this.usuarioActual.id!, {
        name: this.usuarioActual.name!,
        email: this.usuarioActual.email!,
        role_id: this.usuarioActual.role_id!
      }).subscribe({
        next: () => {
          this.cargarUsuarios();
          this.cerrarModal();
          Swal.fire('Actualizado', 'Usuario actualizado correctamente', 'success');
        },
        error: (err) => Swal.fire('Error', err.message || 'Error al actualizar usuario', 'error')
      });

    } else {
      // ===== CREAR =====
      this.userService.crearUsuario({
        name: this.usuarioActual.name!,
        email: this.usuarioActual.email!,
        password: this.usuarioActual.password!,
        role_id: this.usuarioActual.role_id!
      }).subscribe({
        next: () => {
          this.cargarUsuarios();
          this.cerrarModal();
          Swal.fire('Creado', 'Usuario creado correctamente', 'success');
        },
        error: (err) => Swal.fire('Error', err.message || 'Error al crear usuario', 'error')
      });
    }
  }

  // ===================== CAMBIAR CONTRASEÑA =====================
  cambiarContrasena(usuario: User): void {
    Swal.fire({
      title: `Cambiar contraseña: ${usuario.name}`,
      input: 'password',
      inputLabel: 'Nueva contraseña',
      inputPlaceholder: 'Ingresa la nueva contraseña',
      inputAttributes: { minlength: '6' },
      showCancelButton: true,
      confirmButtonText: 'Cambiar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (!result.isConfirmed || !result.value) return;

      this.userService.cambiarPassword(usuario.id!, '', result.value, result.value).subscribe({
        next: () => Swal.fire('Actualizado', 'Contraseña cambiada correctamente', 'success'),
        error: (err) => Swal.fire('Error', err.message || 'Error al cambiar contraseña', 'error')
      });
    });
  }
}
