<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transaction;
use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;

class ExportController extends Controller
{
    public function exportExcel(Request $request)
    {
        $user = Auth::user();

        $query = Transaction::with('category')
            ->where('user_id', $user->id);

        $from = $request->query('from');
        $to   = $request->query('to');
        $type = $request->query('type');

        if ($from) {
            $query->whereDate('date', '>=', $from);
        }
        if ($to) {
            $query->whereDate('date', '<=', $to);
        }
        if ($type) {
            $query->where('type', $type);
        }

        $transactions = $query->orderBy('date')->get();

        $callback = function () use ($transactions) {
            $file = fopen('php://output', 'w');

            fputcsv($file, ['Data', 'Tipo', 'Valor', 'Categoria', 'Descrição']);

            foreach ($transactions as $t) {
                fputcsv($file, [
                    $t->date,
                    $t->type === 'entrada' ? 'Entrada' : 'Saída',
                    number_format($t->amount, 2, ',', '.'),
                    optional($t->category)->name ?? '-',
                    $t->description ?? '',
                ]);
            }

            fclose($file);
        };

        return response()->streamDownload($callback, 'transacoes.csv', [
            'Content-Type' => 'text/csv',
        ]);
    }

    public function exportPDF(Request $request)
    {
        $user = Auth::user();

        $query = Transaction::with('category')
            ->where('user_id', $user->id);

        $from = $request->query('from');
        $to   = $request->query('to');
        $type = $request->query('type');

        if ($from) {
            $query->whereDate('date', '>=', $from);
        }
        if ($to) {
            $query->whereDate('date', '<=', $to);
        }
        if ($type) {
            $query->where('type', $type);
        }

        $transactions = $query->orderBy('date')->get();

        $totalEntradas = $transactions->where('type', 'entrada')->sum('amount');
        $totalSaidas   = $transactions->where('type', 'saida')->sum('amount');
        $saldoPeriodo  = $totalEntradas - $totalSaidas;

        $porCategoria = $transactions
            ->where('type', 'saida')
            ->groupBy(function ($t) {
                return optional($t->category)->name ?? 'Sem categoria';
            })
            ->map(function ($items, $nome) {
                return [
                    'categoria' => $nome,
                    'total'     => $items->sum('amount'),
                ];
            })
            ->values();

        $totalDespesas = $porCategoria->sum('total');

        $porCategoria = $porCategoria->map(function ($item) use ($totalDespesas) {
            $perc = $totalDespesas > 0
                ? ($item['total'] / $totalDespesas) * 100
                : 0;
            $item['percentual'] = $perc;
            return $item;
        });

        $pdf = Pdf::loadView('exports.transactions', [
            'user'          => $user,
            'transactions'  => $transactions,
            'from'          => $from,
            'to'            => $to,
            'totalEntradas' => $totalEntradas,
            'totalSaidas'   => $totalSaidas,
            'saldoPeriodo'  => $saldoPeriodo,
            'porCategoria'  => $porCategoria,
        ]);

        return $pdf->download('relatorio-financeiro.pdf');
    }
}
