<?php

// database/seeders/RolSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Rol;

class RolSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            [
                'nombre' => 'Administrador',
                'descripcion' => 'Acceso total al sistema',
            ],
            [
                'nombre' => 'Vendedor',
                'descripcion' => 'Acceso limitado a ventas y productos',
            ]
        ];

        foreach ($roles as $rol) {
            Rol::firstOrCreate(['nombre' => $rol['nombre']], $rol);
        }
    }
}
