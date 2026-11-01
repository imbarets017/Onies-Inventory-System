<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['data' => User::query()->orderBy('name')->get(['id', 'name', 'email', 'role'])]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:255'], 'email' => ['required', 'email', 'max:255', 'unique:users,email'], 'password' => ['required', 'string', 'min:10'], 'role' => ['required', Rule::in(['admin', 'manager', 'staff'])]]);
        $data['password'] = Hash::make($data['password']);
        $user = User::query()->create($data);

        return response()->json(['data' => $user->only('id', 'name', 'email', 'role')], 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $data = $request->validate(['name' => ['sometimes', 'required', 'string', 'max:255'], 'email' => ['sometimes', 'required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)], 'password' => ['sometimes', 'required', 'string', 'min:10'], 'role' => ['sometimes', 'required', Rule::in(['admin', 'manager', 'staff'])]]);
        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }
        if ($user->is($request->user()) && isset($data['role']) && $data['role'] !== 'admin') {
            abort(422, 'You cannot remove your own administrator role.');
        }
        $user->update($data);

        return response()->json(['data' => $user->only('id', 'name', 'email', 'role')]);
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        abort_if($user->is($request->user()), 422, 'You cannot delete your own account.');
        $user->delete();

        return response()->json(['success' => true]);
    }
}
