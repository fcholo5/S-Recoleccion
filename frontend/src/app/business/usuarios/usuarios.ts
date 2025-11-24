import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User, UserService } from '../../services/usuarios';
@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.scss']
})
export class Usuarios implements OnInit {

  usuarios: User[] = [];
  loading = false;
  errorMessage: string | null = null;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  /**
   * Cargar todos los usuarios desde el API
   */
  cargarUsuarios(): void {
    this.loading = true;
    this.errorMessage = null;

    this.userService.getUsuarios().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.loading = false;
        console.log('Usuarios cargados:', this.usuarios);
      },
      error: (err) => {
        this.errorMessage = err?.message || 'Error inesperado al comunicarse con el servidor.';
        this.loading = false;
        console.error('Error al cargar usuarios:', err);
      }
    });
  }

  /**
   * Eliminar un usuario
   */
  eliminarUsuario(id: number): void {
    const confirmar = window.confirm('¿Seguro que deseas eliminar este usuario?');
    if (!confirmar) return;

    this.userService.eliminarUsuario(id).subscribe({
      next: () => {
        this.usuarios = this.usuarios.filter(u => u.id !== id);
        console.log('Usuario eliminado:', id);
      },
      error: (err) => {
        alert(err.message || 'Error al eliminar usuario');
        console.error('Error al eliminar usuario:', err);
      }
    });
  }

  /**
   * Abrir modal de creación de usuario
   * Placeholder: debes implementar tu modal o componente para crear usuarios
   */
  abrirModalCrear(): void {
    // Aquí deberías abrir tu modal o componente para crear usuario
    alert('Abrir modal para crear usuario (implementación pendiente)');
  }
}
