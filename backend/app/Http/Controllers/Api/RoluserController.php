<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Rol;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class RoluserController extends Controller
{
    /**
     * Listar todos los roles.
     */
    public function index(): JsonResponse
    {
        $roles = Rol::all();

        return response()->json([
            'success' => true,
            'data' => $roles
        ]);
    }

    /**
     * Crear un nuevo rol.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|unique:roles,nombre',
            'descripcion' => 'nullable|string',
        ]);

        try {
            $rol = Rol::create($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Rol creado correctamente.',
                'data' => $rol
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear rol: ' . $th->getMessage()
            ], 500);
        }
    }

    /**
     * Mostrar un rol específico.
     */
    public function show(string $id)
    {
        $rol = Rol::find($id);

        if (!$rol) {
            return response()->json([
                'success' => false,
                'message' => 'Rol no encontrado.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $rol
        ]);
    }

    /**
     * Actualizar un rol específico.
     */
    public function update(Request $request, string $id)
    {
        $rol = Rol::find($id);

        if (!$rol) {
            return response()->json([
                'success' => false,
                'message' => 'Rol no encontrado.'
            ], 404);
        }

        $request->validate([
            'nombre' => 'required|string|unique:roles,nombre,' . $rol->id,
            'descripcion' => 'nullable|string',
        ]);

        try {
            $rol->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Rol actualizado correctamente.',
                'data' => $rol
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar rol: ' . $th->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar un rol.
     */
    public function destroy(string $id)
    {
        $rol = Rol::find($id);

        if (!$rol) {
            return response()->json([
                'success' => false,
                'message' => 'Rol no encontrado.'
            ], 404);
        }

        try {
            $rol->delete();

            return response()->json([
                'success' => true,
                'message' => 'Rol eliminado correctamente.'
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar rol: ' . $th->getMessage()
            ], 500);
        }
    }
}
