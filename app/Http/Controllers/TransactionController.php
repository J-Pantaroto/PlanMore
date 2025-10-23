<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\AutomationRule;
use App\Models\Goal;
use App\Models\GoalAllocation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Support\Arr;
use Carbon\Carbon;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $query = Transaction::where('user_id', Auth::id())
            ->orderBy('date', 'desc')
            ->orderBy('id', 'desc');

        if ($type = $request->query('type')) {
            $query->where('type', $type);
        }
        if ($categoryId = $request->query('category_id')) {
            $query->where('category_id', $categoryId);
        }
        if ($groupId = $request->query('group_id')) {
            $query->where('group_id', $groupId);
        }
        if ($month = $request->query('month')) {
            try {
                [$y, $m] = explode('-', $month);
                $start = Carbon::createFromDate((int)$y, (int)$m, 1)->startOfMonth();
                $end = (clone $start)->endOfMonth();
                $query->whereBetween('date', [$start->toDateString(), $end->toDateString()]);
            } catch (\Throwable $e) {}
        }
        if ($search = $request->query('search')) {
            $query->where('description', 'like', "%{$search}%");
        }

        return response()->json($query->paginate((int)($request->query('per_page') ?? 20)));
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'type' => 'required|in:entrada,saida',
            'amount' => 'required|numeric|min:0.01',
            'category_id' => 'required|exists:categories,id',
            'group_id' => 'nullable|exists:groups,id',
            'description' => 'nullable|string|max:1000',
            'date' => 'required|date',
            'is_fixed' => 'boolean',
            'is_installment' => 'boolean',
            'installments' => 'nullable|integer|min:1|max:120',
            'is_recurring' => 'boolean',
            'recurrence_interval' => 'nullable|in:daily,weekly,monthly,yearly',
            'recurrence_end_date' => 'nullable|date|after_or_equal:date',
        ]);

        $data['user_id'] = Auth::id();
        $data['is_fixed'] = (bool)($data['is_fixed'] ?? false);
        $data['is_installment'] = (bool)($data['is_installment'] ?? false);
        $data['is_recurring'] = (bool)($data['is_recurring'] ?? false);

        $baseDate = Carbon::parse($data['date']);
        $created = [];

        if ($data['is_installment'] && ($data['installments'] ?? 1) > 1) {
            $total = (int)$data['installments'];
            $batchId = (string) Str::uuid();

            for ($i = 1; $i <= $total; $i++) {
                $row = $data;
                $row['installment_number'] = $i;
                $row['batch_id'] = $batchId;
                $row['date'] = $baseDate->copy()->addMonths($i - 1)->toDateString();

                $tx = Transaction::create($row);
                $this->applyAutomationRules($tx, $user);
                $created[] = $tx;
            }

            return response()->json(['message' => 'Transações (parcelas) criadas!', 'items' => $created], 201);
        }

        if ($data['is_recurring'] && !$data['is_installment'] && !empty($data['recurrence_interval']) && !empty($data['recurrence_end_date'])) {
            $batchId = (string) Str::uuid();
            $end = Carbon::parse($data['recurrence_end_date']);
            $cursor = $baseDate->copy();

            while ($cursor->lte($end)) {
                $row = $data;
                $row['batch_id'] = $batchId;
                $row['date'] = $cursor->toDateString();

                $tx = Transaction::create($row);
                $this->applyAutomationRules($tx, $user);
                $created[] = $tx;

                switch ($data['recurrence_interval']) {
                    case 'daily':   $cursor->addDay(); break;
                    case 'weekly':  $cursor->addWeek(); break;
                    case 'monthly': $cursor->addMonth(); break;
                    case 'yearly':  $cursor->addYear(); break;
                }
            }

            return response()->json(['message' => 'Transações recorrentes geradas!', 'items' => $created], 201);
        }

        $createdOne = Transaction::create($data);
        $this->applyAutomationRules($createdOne, $user);

        return response()->json(['message' => 'Transação criada!', 'transaction' => $createdOne], 201);
    }


    private function applyAutomationRules($transaction, $user)
    {
        $rules = AutomationRule::where('user_id', $user->id)
            ->where('is_active', true)
            ->get();

        foreach ($rules as $rule) {
            $actions = $rule->actions ? json_decode($rule->actions, true) : [];
            $description = strtolower($transaction->description ?? '');
            $match = strtolower($rule->match_text ?? '');

            if ($match && !Str::contains($description, $match)) {
                continue;
            }

            if ($rule->rule_type === 'classification') {
                if (!empty($actions['type'])) {
                    $transaction->type = $actions['type'];
                }
                if (!empty($actions['set_category'])) {
                    $transaction->category_id = $actions['set_category'];
                }
                if (!empty($actions['set_group'])) {
                    $transaction->group_id = $actions['set_group'];
                }
            }

            if ($rule->rule_type === 'goal') {
                if (!empty($actions['goal_id'])) {
                    $goal = Goal::find($actions['goal_id']);
                    if ($goal) {
                        $amountToAdd = 0;
                        if (!empty($actions['goal_percent'])) {
                            $amountToAdd = $transaction->amount * ($actions['goal_percent'] / 100);
                        } elseif (!empty($actions['goal_fixed'])) {
                            $amountToAdd = $actions['goal_fixed'];
                        }

                        if ($amountToAdd > 0) {
                            GoalAllocation::create([
                                'goal_id' => $goal->id,
                                'transaction_id' => $transaction->id,
                                'amount' => $amountToAdd,
                                'rule_name' => $rule->name,
                            ]);

                            $goal->progress = ($goal->progress ?? 0) + $amountToAdd;
                            $goal->save();
                        }
                    }
                }
            }

            $transaction->save();
        }

        \Log::info("Regras aplicadas à transação {$transaction->id}", [
            'description' => $transaction->description,
        ]);
    }

    public function update(Request $request, Transaction $transaction)
    {
        abort_unless($transaction->user_id === Auth::id(), 403);

        $data = $request->validate([
            'type' => 'sometimes|in:entrada,saida',
            'amount' => 'sometimes|numeric|min:0',
            'category_id' => 'nullable|exists:categories,id',
            'group_id' => 'nullable|exists:groups,id',
            'description' => 'nullable|string|max:1000',
            'is_fixed' => 'boolean',
            'is_installment' => 'boolean',
            'installments' => 'nullable|integer|min:1|max:120',
            'installment_number' => 'nullable|integer|min:1|max:120',
            'is_recurring' => 'boolean',
            'recurrence_interval' => 'nullable|in:daily,weekly,monthly,yearly',
            'recurrence_end_date' => 'nullable|date',
            'is_active' => 'boolean',
            'date' => 'sometimes|date',
        ]);

        $transaction->update($data);

        return response()->json(['message' => 'Transação atualizada!', 'transaction' => $transaction->fresh()]);
    }

    public function destroy(Request $request, Transaction $transaction)
    {
        abort_unless($transaction->user_id === Auth::id(), 403);

        if ($request->boolean('delete_batch') && $transaction->batch_id) {
            Transaction::where('user_id', Auth::id())
                ->where('batch_id', $transaction->batch_id)
                ->delete();

            return response()->json(['message' => 'Lote de transações excluído!']);
        }

        $transaction->delete();
        return response()->json(['message' => 'Transação excluída!']);
    }
}
