<?php

namespace App\Http\Controllers;

use App\Models\AutomationRule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AutomationRuleController extends Controller
{
    public function index()
    {
        try {
            $rules = AutomationRule::where('user_id', Auth::id())
                ->orderBy('id', 'desc')
                ->get();

            return response()->json($rules);
        } catch (\Throwable $e) {
            Log::error('Erro ao listar regras: ' . $e->getMessage());
            return response()->json(['error' => 'Erro interno ao listar regras'], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $user = Auth::user();

            $data = $request->validate([
                'name' => 'required|string|max:255',
                'rule_type' => 'nullable|string|in:classification,goal',
                'match_text' => 'nullable|string|max:255',
                'actions' => 'nullable',
                'is_active' => 'boolean',
            ]);

            $data['user_id'] = $user->id;
            $data['is_active'] = $data['is_active'] ?? true;

            if (array_key_exists('actions', $data)) {
                if (is_array($data['actions'])) {
                    $data['actions'] = json_encode($data['actions']);
                } elseif (is_string($data['actions']) && !empty($data['actions'])) {
                    // já é JSON válido
                } else {
                    $data['actions'] = json_encode([]);
                }
            }

            $rule = AutomationRule::create($data);

            return response()->json($rule, 201);
        } catch (\Throwable $e) {
            Log::error('Erro ao criar regra: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'Erro interno ao criar regra'], 500);
        }
    }

    public function update(Request $request, AutomationRule $automationRule)
    {
        try {
            abort_unless($automationRule->user_id === Auth::id(), 403);

            $data = $request->validate([
                'name' => 'sometimes|string|max:255',
                'rule_type' => 'nullable|string|in:classification,goal',
                'match_text' => 'nullable|string|max:255',
                'actions' => 'nullable',
                'is_active' => 'boolean',
            ]);

            if (array_key_exists('actions', $data)) {
                if (is_array($data['actions'])) {
                    $data['actions'] = json_encode($data['actions']);
                } elseif (is_string($data['actions']) && !empty($data['actions'])) {
                    // mantém
                } else {
                    $data['actions'] = json_encode([]);
                }
            }

            $automationRule->update($data);
            return response()->json($automationRule->fresh());
        } catch (\Throwable $e) {
            Log::error('Erro ao atualizar regra: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'Erro interno ao atualizar regra'], 500);
        }
    }

    public function destroy(AutomationRule $automationRule)
    {
        try {
            abort_unless($automationRule->user_id === Auth::id(), 403);
            $automationRule->delete();

            return response()->json(['message' => 'Regra excluída com sucesso!']);
        } catch (\Throwable $e) {
            Log::error('Erro ao excluir regra: ' . $e->getMessage());
            return response()->json(['error' => 'Erro interno ao excluir regra'], 500);
        }
    }
}
