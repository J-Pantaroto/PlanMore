<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\AutomationRule;
use App\Models\Goal;
use App\Models\GoalAllocation;
use App\Models\User;
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

		$validated = $request->validate([
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

			'goal_id' => 'nullable|exists:goals,id',
			'goal_amount' => 'nullable|numeric|min:0.01',
		]);

		$goalId = $validated['goal_id'] ?? null;
		$goalAmount = $validated['goal_amount'] ?? null;

		$data = $validated;
		unset($data['goal_id'], $data['goal_amount']);

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

				$this->applyManualGoalAllocation($tx, $user, $goalId, $goalAmount);

				$created[] = $tx;
			}

			return response()->json([
				'message' => 'Transações (parcelas) criadas!',
				'items' => $created
			], 201);
		}

		if (
			$data['is_recurring'] &&
			!$data['is_installment'] &&
			!empty($data['recurrence_interval']) &&
			!empty($data['recurrence_end_date'])
		) {
			$batchId = (string) Str::uuid();
			$end = Carbon::parse($data['recurrence_end_date']);
			$cursor = $baseDate->copy();

			while ($cursor->lte($end)) {
				$row = $data;
				$row['batch_id'] = $batchId;
				$row['date'] = $cursor->toDateString();

				$tx = Transaction::create($row);
				$this->applyAutomationRules($tx, $user);
				$this->applyManualGoalAllocation($tx, $user, $goalId, $goalAmount);

				$created[] = $tx;

				switch ($data['recurrence_interval']) {
					case 'daily':   $cursor->addDay(); break;
					case 'weekly':  $cursor->addWeek(); break;
					case 'monthly': $cursor->addMonth(); break;
					case 'yearly':  $cursor->addYear(); break;
				}
			}

			return response()->json([
				'message' => 'Transações recorrentes geradas!',
				'items' => $created
			], 201);
		}

		$createdOne = Transaction::create($data);
		$this->applyAutomationRules($createdOne, $user);
		$this->applyManualGoalAllocation($createdOne, $user, $goalId, $goalAmount);

		return response()->json([
			'message' => 'Transação criada!',
			'transaction' => $createdOne
		], 201);
	}

	protected function applyManualGoalAllocation(Transaction $transaction, User $user, $goalId = null, $goalAmount = null): void
	{
		if (!$goalId) {
			return;
		}

		if ($transaction->type !== 'entrada') {
			return;
		}

		$goal = Goal::where('user_id', $user->id)->find($goalId);
		if (!$goal) {
			return;
		}

		$amount = (float) $transaction->amount;

		if ($goalAmount === null || $goalAmount === '') {
			$allocated = $amount;
		} else {
			$allocated = min((float) $goalAmount, $amount);
		}

		if ($allocated <= 0) {
			return;
		}

		$goal->current_amount = ($goal->current_amount ?? 0) + $allocated;

		if ($goal->target_amount > 0 && $goal->current_amount >= $goal->target_amount) {
			$goal->status = 'concluída';
		} elseif (!$goal->status) {
			$goal->status = 'em progresso';
		}

		$goal->save();

	}


	protected function applyAutomationRules(Transaction $transaction, User $user): void
	{
		$rules = AutomationRule::query()
			->where('user_id', $user->id)
			->where('is_active', true)
			->get();

		if ($rules->isEmpty()) {
			return;
		}

		$description = $transaction->description ?? '';

		foreach ($rules as $rule) {
			$actions = $rule->actions;
			if (!is_array($actions)) {
				$decoded = json_decode($actions, true);
				$actions = is_array($decoded) ? $decoded : [];
			}

			if ($rule->match_text && stripos($description, $rule->match_text) === false) {
				continue;
			}

			if ($rule->rule_type === 'classification') {
				if (!empty($actions['type']) && in_array($actions['type'], ['entrada', 'saida'], true)) {
					$transaction->type = $actions['type'];
				}

				if (!empty($actions['set_category'])) {
					$transaction->category_id = $actions['set_category'];
				}

				if (!empty($actions['set_group'])) {
					$transaction->group_id = $actions['set_group'];
				}

				$transaction->save();
			}


			if ($rule->rule_type === 'goal') {
				if ($transaction->type !== 'entrada') {
					continue;
				}

				$goalId = $actions['goal_id'] ?? null;
				if (!$goalId) {
					continue;
				}

				$goal = Goal::where('user_id', $user->id)->find($goalId);
				if (!$goal) {
					continue;
				}

				$fixed = 0.0;
				if (isset($actions['goal_fixed']) && $actions['goal_fixed'] !== '' && $actions['goal_fixed'] !== null) {
					$fixed = (float) $actions['goal_fixed'];
				}

				$percent = 0.0;
				if (isset($actions['goal_percent']) && $actions['goal_percent'] !== '' && $actions['goal_percent'] !== null) {
					$percent = (float) $actions['goal_percent'];
				}

				$allocated = 0.0;
				$amount = (float) $transaction->amount;

				if ($fixed > 0) {
					$allocated = min($fixed, $amount);
				} elseif ($percent > 0) {
					$allocated = $amount * ($percent / 100);
				}

				if ($allocated <= 0) {
					continue;
				}

				$goal->current_amount = ($goal->current_amount ?? 0) + $allocated;

				if ($goal->target_amount > 0 && $goal->current_amount >= $goal->target_amount) {
					$goal->status = 'concluída';
				} elseif (!$goal->status) {
					$goal->status = 'em progresso';
				}

				$goal->save();
			}
		}
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
