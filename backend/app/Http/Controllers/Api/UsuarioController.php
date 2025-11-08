<?php

namespace App\Http\Controllers\Api;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller as RoutingController;
use Illuminate\Validation\Rule;

class UsuarioController extends RoutingController
{
    /**
     * Listar todos los usuarios con sus roles.
     */
    public function index()
    {
        $usuarios = User::with('rol')->get();

        return response()->json([
            'success' => true,
            'data'    => $usuarios
        ]);
    }

    /**
     * Almacenar un nuevo usuario.
     */
    public function store(Request $request)
    {
        // Validación de los datos
        $data = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
            'role'     => ['required', Rule::in(['Administrador','vendedor'])],
        ]);

        // Cifrar contraseña
        $data['password'] = bcrypt($data['password']);

        // Crear usuario
        $usuario = User::create($data);

        return response()->json([
            'success' => true,
            'data'    => $usuario
        ], 201);
    }

    /**
     * Actualizar un usuario existente.
     */
    public function update(Request $request, $id)
    {
        $usuario = User::findOrFail($id);

        // Validación de los datos
        $data = $request->validate([
            'name'     => ['sometimes', 'string', 'max:255'],
            'email'    => ['sometimes', 'email', Rule::unique('users','email')->ignore($usuario->id)],
            'password' => ['sometimes', 'string', 'min:6'],
            'role'     => ['sometimes', Rule::in(['Administrador','vendedor'])],
            'status'   => ['sometimes', 'in:0,1'],
        ]);

        // Si se envía nueva contraseña, cifrarla
        if (isset($data['password'])) {
            $data['password'] = bcrypt($data['password']);
        }

        // Actualizar usuario
        $usuario->update($data);

        return response()->json([
            'success' => true,
            'data'    => $usuario
        ]);
    }

    /**
     * Cambiar el estado de un usuario (activo/inactivo).
     */
    public function updateEstado($id, $estado)
    {
        $usuario = User::find($id);

        if (!$usuario) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no encontrado.'
            ], 404);
        }

        $usuario->activo = (bool) $estado;
        $usuario->save();

        return response()->json([
            'success' => true,
            'message' => 'Estado actualizado correctamente.',
            'data'    => $usuario
        ]);
    }

    /**
     * Eliminar un usuario por ID.
     */
    public function destroy($id)
    {
        $usuario = User::find($id);

        if (!$usuario) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no encontrado.'
            ], 404);
        }

        $usuario->delete();

        return response()->json([
            'success' => true,
            'message' => 'Usuario eliminado correctamente.'
        ]);
    }
}
