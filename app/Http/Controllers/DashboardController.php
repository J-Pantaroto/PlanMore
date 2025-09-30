<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transaction;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $userId = Auth::id();

        if (!$userId) {
            return response()->json(['error' => 'Usuário não autenticado'], 401);
        }

        // Totais
        $totalIncome = Transaction::where('user_id', $userId)
            ->where('type', 'entrada')
            ->sum('amount');

        $totalExpense = Transaction::where('user_id', $userId)
            ->where('type', 'saida')
            ->sum('amount');

        $saldoAtual = $totalIncome - $totalExpense;

        // Categorias (JOIN com categories)
        $categorias = Transaction::where('transactions.user_id', $userId)
            ->join('categories', 'transactions.category_id', '=', 'categories.id')
            ->select('categories.name as categoria', DB::raw('SUM(transactions.amount) as total'))
            ->groupBy('categories.name')
            ->get();

        return response()->json([
            'saldo_atual' => (float) $saldoAtual,
            'total_entradas' => (float) $totalIncome,
            'total_saidas' => (float) $totalExpense,
            'categorias' => $categorias
        ]);
    }
}
