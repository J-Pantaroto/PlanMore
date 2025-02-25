<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transaction;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index()
    {
        $userId = Auth::id();

        // Obtém o saldo total
        $totalIncome = Transaction::where('user_id', $userId)
            ->where('type', 'entrada')
            ->sum('amount');

        $totalExpense = Transaction::where('user_id', $userId)
            ->where('type', 'saida')
            ->sum('amount');

        $saldoAtual = $totalIncome - $totalExpense;

        // Obtém os gastos e receitas categorizados
        $categorias = Transaction::where('user_id', $userId)
            ->selectRaw('category, SUM(amount) as total')
            ->groupBy('category')
            ->get();

        return response()->json([
            'saldo_atual' => $saldoAtual,
            'total_entradas' => $totalIncome,
            'total_saidas' => $totalExpense,
            'categorias' => $categorias
        ]);
    }
}
