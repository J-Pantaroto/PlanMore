<?php

namespace App\Http\Controllers;

use App\Models\AutomationRule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AutomationRuleController extends Controller
{
    public function index() {
        return AutomationRule::where('user_id', Auth::id())->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'match_text' => 'nullable|string|max:255',
            'actions' => 'required|array',
            'is_active' => 'boolean',
        ]);

        $data['user_id'] = Auth::id();

        $rule = AutomationRule::create($data);

        return response()->json($rule, 201);
    }

    public function update(Request $request, AutomationRule $rule)
    {
        abort_unless($rule->user_id === Auth::id(), 403);

        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'match_text' => 'nullable|string|max:255',
            'actions' => 'sometimes|array',
            'is_active' => 'boolean',
        ]);

        $rule->update($data);

        return response()->json($rule);
    }
    
    public function destroy(AutomationRule $rule) {
        abort_unless($rule->user_id === Auth::id(), 403);
        $rule->delete();
        return response()->noContent();
    }
}
