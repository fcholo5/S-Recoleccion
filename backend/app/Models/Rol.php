<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rol extends Model
{
    use HasFactory;

    protected $table = 'rol';

    protected $fillable = [
        'nombre',
        'descripcion',
    ];

    // Relación: un rol puede tener muchos usuarios
    public function usuarios()
    {
        return $this->hasMany(User::class, 'rol_id');
    }
}
