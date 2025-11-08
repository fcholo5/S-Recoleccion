<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Rol;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run()
    {
        $rolAdmin = Rol::firstOrCreate(['nombre' => 'Administrador']);

        User::firstOrCreate(
            ['email' => 'panamenofabian@gmail.com'],
            [
                'name' => 'fabian',
                'password' => Hash::make('1824'),
                'activo' => true,
                'rol_id' => $rolAdmin->id,
            ]
        );
    }
}
