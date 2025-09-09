<?php

namespace App\Http\Controllers;

use App\Models\Group;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GroupController extends Controller
{
    public function index()
    {
        return response()->json(
            Group::where('user_id', Auth::id())->orderBy('name')->get()
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $group = Group::create([
            'user_id' => Auth::id(),
            'name' => $data['name'],
        ]);

        return response()->json(['message' => 'Grupo criado!', 'group' => $group], 201);
    }

    public function update(Request $request, $id)
    {
        $group = Group::where('user_id', Auth::id())->findOrFail($id);

        $data = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $group->update($data);

        return response()->json(['message' => 'Grupo atualizado!', 'group' => $group]);
    }

    public function destroy($id)
    {
        $group = Group::where('user_id', Auth::id())->findOrFail($id);
        $group->delete();

        return response()->json(['message' => 'Grupo excluído!']);
    }
}
