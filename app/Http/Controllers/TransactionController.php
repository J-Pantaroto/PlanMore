<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TransactionController extends Controller
{
    public function index()
    {
        return response()->json(Transaction::where('user_id', Auth::id())->get());
    }

    // Criar uma nova transação
    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|in:entrada,saida',
            'amount' => 'required|numeric',
            'category_id' => 'nullable|exists:categories,id',
            'description' => 'nullable|string',
            'is_fixed' => 'boolean',
            'is_installment' => 'boolean',
            'installments' => 'nullable|integer|min:1',
            'is_recurring' => 'boolean',
            'date' => 'required|date',
        ]);

        $transaction = Transaction::create([
            'user_id' => Auth::id(),
            'type' => $request->type,
            'amount' => $request->amount,
            'category_id' => $request->category_id,
            'description' => $request->description,
            'is_fixed' => $request->is_fixed ?? false,
            'is_installment' => $request->is_installment ?? false,
            'installments' => $request->installments,
            'is_recurring' => $request->is_recurring ?? false,
            'date' => $request->date,
        ]);

        return response()->json(['message' => 'Transação criada com sucesso!', 'transaction' => $transaction]);
    }
    public function show($id)
    {
        $transaction = Transaction::where('user_id', Auth::id())->findOrFail($id);
        return response()->json($transaction);
    }

    public function update(Request $request, $id)
    {
        $transaction = Transaction::where('user_id', Auth::id())->findOrFail($id);

        $request->validate([
            'type' => 'in:entrada,saida',
            'amount' => 'numeric',
            'category_id' => 'nullable|exists:categories,id',
            'description' => 'nullable|string',
            'is_fixed' => 'boolean',
            'is_installment' => 'boolean',
            'installments' => 'nullable|integer|min:1',
            'is_recurring' => 'boolean',
            'date' => 'date',
        ]);

        $transaction->update($request->all());

        return response()->json(['message' => 'Transação atualizada!', 'transaction' => $transaction]);
    }

    public function destroy($id)
    {
        $transaction = Transaction::where('user_id', Auth::id())->findOrFail($id);

        if ($transaction->is_recurring) {
            Transaction::where('description', $transaction->description)
                       ->where('date', '>=', now())
                       ->delete();
        }

        $transaction->delete();

        return response()->json(['message' => 'Transação excluída com sucesso!']);
    }
}
