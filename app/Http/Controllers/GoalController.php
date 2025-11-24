<?php

namespace App\Http\Controllers;

use App\Models\Goal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GoalController extends Controller
{
    public function index()
    {
        $userId = Auth::id();

        $goals = Goal::where('user_id', $userId)
            ->orderBy('deadline')
            ->orderBy('name')
            ->get();

        return response()->json($goals);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'          => 'required|string|max:255',
            'target_amount' => 'required|numeric|min:0',
            'deadline'      => 'nullable|date',
        ]);

        $goal = Goal::create([
            'user_id'        => Auth::id(),
            'name'           => $data['name'],
            'target_amount'  => $data['target_amount'],
            'current_amount' => 0,
            'deadline'       => $data['deadline'] ?? null,
            'status'         => 'em progresso',
        ]);

        return response()->json($goal, 201);
    }

    public function update(Request $request, $id)
    {
        $goal = Goal::where('user_id', Auth::id())
            ->where('id', $id)
            ->firstOrFail();

        $data = $request->validate([
            'name'           => 'sometimes|required|string|max:255',
            'target_amount'  => 'sometimes|required|numeric|min:0',
            'current_amount' => 'sometimes|numeric|min:0',
            'deadline'       => 'nullable|date',
            'status'         => 'nullable|in:em progresso,concluída,cancelada',
        ]);

        $goal->update($data);

        return response()->json($goal);
    }

    public function destroy($id)
    {
        $goal = Goal::where('user_id', Auth::id())
            ->where('id', $id)
            ->firstOrFail();

        $goal->delete();

        return response()->json(['message' => 'Meta removida!']);
    }
}
