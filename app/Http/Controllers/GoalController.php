<?php

namespace App\Http\Controllers;

use App\Models\Goal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GoalController extends Controller
{
    public function index(){
        return response()->json(Goal::where('user_id',Auth::id())->get());
    }
    public function store(Request $request){
        $request->validate([
            'name' => 'required|string|max:255',
            'target_amount' => 'required|numeric|min:0',
            'deadline' => 'nullable|date',
        ]);
        $goal= Goal::create([
            'user_id' => Auth::id(),
            'name' => $request->name,
            'target_amount' => $request->target_amount,
            'deadline' => $request->deadline,
        ]);
        return response()->json(['message' => 'Meta financeira criada!' , 'goal' => $goal]);
    }
    public function update(Request $request, $id)
    {
        $goal = Goal::where('user_id', Auth::id())->findOrFail($id);

        $goal->update($request->only(['name', 'target_amount', 'current_amount', 'deadline', 'status']));

        return response()->json(['message' => 'Meta financeira atualizada!', 'goal' => $goal]);
    }

    public function destroy($id)
    {
        Goal::where('user_id', Auth::id())->findOrFail($id)->delete();

        return response()->json(['message' => 'Meta removida!']);
    }
}
