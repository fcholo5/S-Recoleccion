<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\usuarios;
use App\Http\Controllers\Api\clientes;
use App\Http\Controllers\Api\productos;
use App\Http\Controllers\Api\categorias;
use App\Http\Controllers\Api\ventas;
use App\Http\Controllers\Api\detalle_ventas;
use App\Http\Controllers\Api\compras;
use App\Http\Controllers\Api\detalle_compras;
use App\Http\Controllers\Api\proveedores;
use App\Http\Controllers\Api\UsuarioController;

// Rutas públicas
Route::post('/auth/logear', [AuthController::class, 'logear']);
Route::get('/crear-admin', [AuthController::class, 'crearAdmin']);
// Rutas protegidas por Sanctum
Route::middleware('auth:sanctum')->group(function () {

    Route::get('/logout', [AuthController::class, 'logout']);

    Route::get('/usuarios', [UsuarioController::class, 'index']);
    Route::post('/usuarios', [UsuarioController::class, 'store']);
    Route::get('/usuarios/{id}', [UsuarioController::class, 'edit']);
    Route::put('/usuarios/{id}', [UsuarioController::class, 'update']);
    Route::delete('/usuarios/{id}', [UsuarioController::class, 'destroy']);
    Route::get('/usuarios/tbody', [UsuarioController::class, 'tbody']);
    Route::put('/usuarios/{id}/estado/{estado}', [UsuarioController::class, 'estado']);

});
