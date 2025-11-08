<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Rol;
use Illuminate\Routing\Controller as RoutingController;

class AuthController extends RoutingController
{
    public function logear(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->with('rol')->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                "success" => 0,
                'message' => 'Credenciales incorrectas'
            ]);
        }

        if (!$user->activo) {
            return response()->json([
                "success" => 0,
                'message' => 'Tu cuenta está inactiva.'
            ]);
        }

        $token = $user->createToken($request->email, [$user->rol->nombre])->plainTextToken;

        return response()->json([
            "success" => 1,
            "message" => "Inicio de sesión exitoso",
            "token" => $token,
            "role" => $user->rol->nombre,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => 1,
            'message' => 'Sesión cerrada correctamente'
        ]);
    }

    public function crearAdmin()
    {
        $rolAdmin = Rol::firstOrCreate(['nombre' => 'Administrador']);

        if (User::where('email', 'panamenofabian@gmail.com')->exists()) {
            return "El usuario administrador ya existe.";
        }

        User::create([
            'name' => 'panameño',
            'email' => 'panamenofabian@gmail.com',
            'password' => Hash::make('1824'),
            'activo' => true,
            'rol_id' => $rolAdmin->id,
        ]);

        return "Administrador creado con éxito.";
    }
}
