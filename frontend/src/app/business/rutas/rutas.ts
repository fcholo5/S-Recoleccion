import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Rutas, Ruta } from '../../services/rutas';

@Component({
  selector: 'app-rutas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rutas.html',
  styleUrls: ['./rutas.scss'],
})
export class RutasComponent implements OnInit {
  rutas: Ruta[] = [];
  loading = true;
  error = '';
  perfilId = 'UUID_DE_PERFIL_DEMO';
  nuevaRuta: Partial<Ruta> = {
    perfil_id: this.perfilId,
    nombre_ruta: '',
    color_hex: '#22c55e'
  };
  creando = false;

  constructor(private rutasService: Rutas) {}

  ngOnInit() {
    this.obtenerRutas();
  }

  obtenerRutas() {
    this.loading = true;
    this.rutasService.getRutas(this.perfilId).subscribe({
      next: (res) => {
        this.rutas = res.data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al obtener rutas:', err);
        this.error = 'No se pudieron cargar las rutas.';
        this.loading = false;
      },
    });
  }

  crearRuta() {
    if (!this.nuevaRuta.nombre_ruta) return;
    this.creando = true;

    this.rutasService.crearRuta(this.nuevaRuta).subscribe({
      next: () => {
        this.creando = false;
        this.nuevaRuta.nombre_ruta = '';
        this.obtenerRutas();
      },
      error: (err) => {
        console.error('Error al crear ruta:', err);
        this.creando = false;
      },
    });
  }
}
